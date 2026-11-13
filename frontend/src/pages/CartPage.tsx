import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatINR, orderTotal } from "@/lib/pricing";
import { productImage, useCart, useShopActions } from "@/lib/shop";


export default function CartPage() {
  useDocumentTitle("My cart — Parika");
  const { data: lines = [], isLoading } = useCart();
  const { setQuantity } = useShopActions();
  const total = orderTotal(lines.map((l) => ({ price: l.product.price, quantity: l.quantity })));

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-center font-display text-5xl font-semibold text-primary">My Cart</h1>
      {isLoading ? null : lines.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="royal" className="rounded-full"><Link to="/jewellery">Shop Jewellery</Link></Button>
            <Button asChild variant="outline" className="rounded-full"><Link to="/ethnic-wear">Shop Ethnic Wear</Link></Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_300px]">
          <ul className="space-y-4">
            {lines.map((l) => (
              <li key={l.id} className="flex gap-4 rounded-2xl border border-border bg-card p-3">
                <img src={productImage(l.product)} alt={l.product.name} className="size-24 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <p className="font-display text-lg font-semibold leading-tight">{l.product.name}</p>
                  <p className="text-sm text-primary">{formatINR(l.product.price)}</p>
                  <div className="mt-auto flex items-center gap-2">
                    <Button size="icon" variant="outline" className="size-8" aria-label="Decrease"
                      onClick={() => setQuantity.mutate({ id: l.id, quantity: l.quantity - 1 })}><Minus /></Button>
                    <span className="w-6 text-center">{l.quantity}</span>
                    <Button size="icon" variant="outline" className="size-8" aria-label="Increase"
                      onClick={() => setQuantity.mutate({ id: l.id, quantity: l.quantity + 1 })}><Plus /></Button>
                    <Button size="icon" variant="ghost" className="ml-auto size-8" aria-label="Remove"
                      onClick={() => setQuantity.mutate({ id: l.id, quantity: 0 })}><Trash2 /></Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-2xl border border-gold/50 bg-card p-6">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatINR(total)}</span></div>
            <div className="mt-2 flex justify-between text-sm"><span>Delivery</span><span className="text-gold">Free</span></div>
            <div className="mt-4 flex justify-between border-t pt-4 text-lg font-semibold">
              <span>Total</span><span className="text-primary">{formatINR(total)}</span>
            </div>
            <Button asChild variant="royal" className="mt-6 w-full rounded-full"><Link to="/checkout">Checkout</Link></Button>
          </aside>
        </div>
      )}
    </section>
  );
}
