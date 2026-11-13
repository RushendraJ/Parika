import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ethnicCategories, jewelleryCategories, type Category } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type PanelProps = {
  title: string;
  subtitle: string;
  to: string;
  categories: Category[];
};

function CollectionPanel({ title, subtitle, to, categories }: PanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-2xl border border-gold/40 bg-card shadow-card"
    >
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 px-6 py-6 text-left transition-colors hover:bg-accent/50 sm:px-8">
        <div>
          <p className="eyebrow text-gold">{categories.length} categories</p>
          <h3 className="mt-1 font-display text-3xl font-semibold text-primary sm:text-4xl">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/60 transition-all duration-300",
            open
              ? "rotate-180 bg-primary text-primary-foreground"
              : "text-primary group-hover:bg-gold/15",
          )}
        >
          <ChevronDown className="size-5" />
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        <ul className="grid grid-cols-1 gap-2 border-t border-border/70 p-4 sm:grid-cols-2 sm:p-6">
          {categories.map((c, i) => (
            <li
              key={c.name}
              className="animate-rise"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Link
                to={to}
                className="group/item flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-accent"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  width={64}
                  height={64}
                  loading="lazy"
                  className="size-16 rounded-full border-2 border-gold/50 object-cover transition-transform duration-300 group-hover/item:scale-105"
                />
                <div className="min-w-0">
                  <p className="font-display text-xl font-semibold text-foreground group-hover/item:text-primary">
                    {c.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{c.note}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CollectionExplorer() {
  return (
    <section className="bg-gradient-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-gold">Discover</p>
          <h2 className="mt-1 font-display text-4xl font-semibold text-primary sm:text-5xl">
            Explore Our Collection
          </h2>
          <div className="ornament mx-auto mt-5 max-w-xs">
            <span>✦</span>
          </div>
          <p className="mt-5 text-muted-foreground">
            Tap a collection to see every category we carry.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-6 md:grid-cols-2 lg:gap-10">
          <CollectionPanel
            title="Jewellery"
            subtitle="Handpicked imitation jewellery for every occasion"
            to="/jewellery"
            categories={jewelleryCategories}
          />
          <CollectionPanel
            title="Ethnic Wear"
            subtitle="Suits, sarees & lehengas crafted to celebrate"
            to="/ethnic-wear"
            categories={ethnicCategories}
          />
        </div>
      </div>
    </section>
  );
}
