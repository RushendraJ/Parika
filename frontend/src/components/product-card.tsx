import { Heart, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { discountPercent, formatINR } from "@/lib/pricing";
import { productImage, useShopActions, useWishlist, type Product } from "@/lib/shop";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist } = useShopActions();
  const { data: wishlist } = useWishlist();
  const saved = !!wishlist?.some((w) => w.product.id === product.id);
  const off = discountPercent(product.price, product.mrp);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-gold">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
            {off}% off
          </span>
        )}
        <button
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist.mutate(product.id)}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 shadow transition-transform hover:scale-110"
        >
          <Heart className={cn("size-4 text-primary", saved && "fill-primary")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow text-[0.65rem] text-gold">{product.category}</p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-foreground">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-primary">{formatINR(product.price)}</span>
          {off > 0 && (
            <span className="text-sm text-muted-foreground line-through">{formatINR(product.mrp!)}</span>
          )}
        </div>
        <Button
          variant="royal"
          size="sm"
          className="mt-4 w-full rounded-full"
          disabled={!product.inStock || addToCart.isPending}
          onClick={() => addToCart.mutate(product.id)}
        >
          <ShoppingBag /> {product.inStock ? "Add to cart" : "Out of stock"}
        </Button>
      </div>
    </article>
  );
}
