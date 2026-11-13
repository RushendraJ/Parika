import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import jewelleryPhoto from "@/assets/parika-peacock-ear-chain.jpg";
import heroEthnic from "@/assets/hero-ethnic.jpg";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { CollectionExplorer } from "@/components/collection-explorer";
import { Testimonials } from "@/components/testimonials";


type ChoiceProps = {
  to: string;
  image: string;
  eyebrow: string;
  title: string;
  line: string;
  delay: string;
};

function Choice({ to, image, eyebrow, title, line, delay }: ChoiceProps) {
  return (
    <Link
      to={to}
      className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-gold/50 shadow-card animate-rise sm:aspect-[3/4] lg:aspect-[4/5]"
      style={{ animationDelay: delay }}
    >
      <img
        src={image}
        alt={title}
        width={1024}
        height={1280}
        className="absolute inset-0 size-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-veil" />
      <div className="absolute inset-3 rounded-[1.4rem] border border-gold-soft/40 transition-colors duration-500 group-hover:border-gold-soft/80" />
      <div className="absolute inset-x-0 bottom-0 p-7 text-center sm:p-10">
        <p className="eyebrow text-gold-soft">{eyebrow}</p>
        <h2 className="mt-2 font-display text-5xl font-semibold text-ivory sm:text-6xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-ivory/80">{line}</p>
        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary shadow-gold transition-transform duration-300 group-hover:-translate-y-0.5">
          Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  useDocumentTitle("Parika — Jewels & Ethnic Wear | Style for Every Celebration");
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-ivory">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center animate-rise">
            <p className="font-script text-3xl text-gold sm:text-4xl">Style for Every Celebration</p>
            <h1 className="mt-2 font-display text-5xl font-semibold leading-[1.05] text-primary sm:text-7xl">
              Jewels & Ethnic Wear
            </h1>
            <div className="ornament mx-auto mt-6 max-w-sm">
              <span>✦</span>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Where would you like to begin?
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:gap-10">
            <Choice
              to="/jewellery"
              image={jewelleryPhoto}
              eyebrow="Imitation Jewellery"
              title="Jewellery"
              line="Kundan, polki, jhumkas & bridal sets"
              delay="120ms"
            />
            <Choice
              to="/ethnic-wear"
              image={heroEthnic}
              eyebrow="Suits · Sarees · Lehengas"
              title="Ethnic Wear"
              line="Festive & bridal outfits that shine"
              delay="240ms"
            />
          </div>
        </div>
      </section>

      <CollectionExplorer />
      <Testimonials />
    </>
  );
}
