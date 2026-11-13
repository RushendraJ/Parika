import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const REVIEWS = [
  { name: "Priya Sharma", city: "Delhi", rating: 5, text: "The kundan set I wore at my sister's wedding got so many compliments. Looks just like real gold!" },
  { name: "Anjali Verma", city: "Meerut", rating: 5, text: "Beautiful lehenga, perfect stitching and the colour was exactly as shown. Will order again." },
  { name: "Neha Gupta", city: "Noida", rating: 4, text: "Lovely jhumkas at a great price. Delivery was quick and the packaging felt premium." },
  { name: "Ritu Singh", city: "Ghaziabad", rating: 5, text: "Their saree collection is gorgeous. The team helped me match jewellery with my outfit on WhatsApp." },
  { name: "Kavya Jain", city: "Saharanpur", rating: 5, text: "My bridal set was stunning and so light to wear. Parika made my day extra special." },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = REVIEWS.length;
  const go = (d: number) => setI((p) => (p + d + n) % n);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), 6000);
    return () => clearInterval(t);
  }, [i, n]);

  return (
    <section className="bg-gradient-ivory py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-8">
        <p className="font-script text-3xl text-gold">Kind Words</p>
        <h2 className="mt-1 font-display text-4xl font-semibold text-primary sm:text-5xl">What Our Customers Say</h2>
        <div className="ornament mx-auto mt-5 max-w-xs"><span>✦</span></div>

        <div className="relative mt-10">
          <div
            className="-mx-4 -my-6 overflow-hidden px-4 py-12 sm:mx-0 sm:px-0"
            onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
              {REVIEWS.map((r) => (
                <figure key={r.name} className="w-full shrink-0 px-2 sm:px-14">
                  <div className="rounded-[1.75rem] border border-gold/50 bg-card p-7 shadow-gold sm:p-12">
                    <div className="flex justify-center gap-1" aria-label={`${r.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star key={k} className={`size-5 ${k < r.rating ? "fill-gold text-gold" : "text-border"}`} />
                      ))}
                    </div>
                    <blockquote className="mt-5 font-display text-xl italic text-foreground sm:text-2xl">“{r.text}”</blockquote>
                    <figcaption className="mt-6">
                      <p className="font-semibold text-primary">{r.name}</p>
                      <p className="eyebrow text-muted-foreground">{r.city}</p>
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
          <button aria-label="Previous review" onClick={() => go(-1)} className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-gold/60 bg-card p-2 text-primary shadow-gold sm:block">
            <ChevronLeft className="size-5" />
          </button>
          <button aria-label="Next review" onClick={() => go(1)} className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-gold/60 bg-card p-2 text-primary shadow-gold sm:block">
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {REVIEWS.map((r, k) => (
            <button key={r.name} aria-label={`Show review ${k + 1}`} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-2 bg-gold/50"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
