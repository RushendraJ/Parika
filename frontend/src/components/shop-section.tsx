import { useState } from "react";

import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ethnicCategories, jewelleryCategories } from "@/lib/catalog";
import { useProducts, type Section } from "@/lib/shop";
import { cn } from "@/lib/utils";

export function ShopSection({ section, title, image }: { section: Section; title: string; image: string }) {
  const { data: products, isLoading } = useProducts(section);
  const categories = section === "jewellery" ? jewelleryCategories : ethnicCategories;
  const [active, setActive] = useState<string>("All");
  const shown = (products ?? []).filter((p) => active === "All" || p.category === active);

  return (
    <>
      <section className="relative flex h-56 items-center justify-center overflow-hidden sm:h-72">
        <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-maroon-deep/70" />
        <div className="relative text-center">
          <p className="font-script text-3xl text-gold-soft">Parika</p>
          <h1 className="font-display text-5xl font-semibold text-ivory sm:text-6xl">{title}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="flex flex-wrap justify-center gap-2">
          {["All", ...categories.map((c) => c.name)].map((name) => (
            <button
              key={name}
              onClick={() => setActive(name)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                active === name
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gold/50 bg-card hover:border-primary",
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
            : shown.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {!isLoading && shown.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">No items in this category yet.</p>
        )}
      </section>
    </>
  );
}
