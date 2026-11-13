import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { api, ApiError, assetUrl } from "@/lib/api";
import { ethnicCategories, jewelleryCategories } from "@/lib/catalog";
import type { CartLine, Product, Section, WishlistLine } from "@/types";

export type { Product, Section };

const categoryImages = new Map([...jewelleryCategories, ...ethnicCategories].map((c) => [c.name, c.image]));

/** Uploaded photo, or the category thumbnail as a fallback. */
export function productImage(p: { imageUrl: string | null; category?: string }): string {
  if (p.imageUrl) return assetUrl(p.imageUrl);
  return (p.category ? categoryImages.get(p.category) : undefined) || "";
}

export function useProducts(section?: Section) {
  return useQuery({
    queryKey: ["products", section ?? "all"],
    queryFn: () => api<Product[]>(`/products${section ? `?section=${section}` : ""}`),
  });
}

export function useCart() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: () => api<CartLine[]>("/cart"),
  });
}

export function useWishlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: () => api<WishlistLine[]>("/wishlist"),
  });
}

function signInFirst() {
  toast("Please sign in first", {
    action: { label: "Login", onClick: () => (window.location.href = "/auth?mode=login") },
  });
}

export function useShopActions() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  };
  const failed = (fallback: string) => (e: Error) => {
    if (!user || (e instanceof ApiError && e.status === 401)) return signInFirst();
    toast.error(e instanceof ApiError ? e.message : fallback);
  };

  const addToCart = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("auth");
      await api("/cart", { method: "POST", body: { productId } });
    },
    onSuccess: () => { refresh(); toast.success("Added to cart"); },
    onError: failed("Could not add to cart"),
  });

  const setQuantity = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      api(`/cart/${id}`, { method: "PATCH", body: { quantity } }),
    onSuccess: refresh,
    onError: failed("Could not update cart"),
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("auth");
      return (await api<{ added: boolean }>("/wishlist/toggle", { method: "POST", body: { productId } })).added;
    },
    onSuccess: (added) => { refresh(); toast.success(added ? "Saved to wishlist" : "Removed from wishlist"); },
    onError: failed("Could not update wishlist"),
  });

  return { addToCart, setQuantity, toggleWishlist };
}
