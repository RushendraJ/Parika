import { Link } from "react-router-dom";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useWishlist } from "@/lib/shop";


export default function WishlistPage() {
  useDocumentTitle("My wishlist — Parika");
  const { data = [], isLoading } = useWishlist();
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="text-center font-display text-5xl font-semibold text-primary">My Wishlist</h1>
      {!isLoading && data.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">Tap the heart on any piece to save it here.</p>
          <Button asChild variant="royal" className="mt-6 rounded-full"><Link to="/jewellery">Start shopping</Link></Button>
        </div>
      )}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {data.map((w) => <ProductCard key={w.id} product={w.product} />)}
      </div>
    </section>
  );
}
