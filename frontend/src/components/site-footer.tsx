import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

import logo from "@/assets/parika-logo.png";

export function SiteFooter() {
  return (
    <footer className="bg-maroon-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" width={48} height={48} loading="lazy" className="size-12" />
            <div>
              <p className="font-display text-3xl tracking-[0.14em] text-gradient-gold">PARIKA</p>
              <p className="eyebrow text-primary-foreground/60">Jewels & Ethnic Wear</p>
            </div>
          </div>
          <p className="font-script text-2xl text-gold-soft">Style for Every Celebration</p>
        </div>

        <div className="space-y-3">
          <p className="eyebrow text-gold">Shop</p>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link to="/jewellery" className="hover:text-gold">
                Imitation Jewellery
              </Link>
            </li>
            <li>
              <Link to="/ethnic-wear" className="hover:text-gold">
                Suits, Sarees & Lehengas
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="eyebrow text-gold">Talk to us</p>
          <a
            href="tel:+919897593622"
            className="flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-gold"
          >
            <Phone className="size-4" /> +91 98975-93622
          </a>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} Parika. All rights reserved.
      </div>
    </footer>
  );
}
