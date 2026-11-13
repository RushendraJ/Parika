import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, LogOut, Settings, ShoppingBag, UserRound } from "lucide-react";

import logo from "@/assets/parika-logo.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCart, useWishlist } from "@/lib/shop";

function CountIcon({ to, label, count, children }: { to: string; label: string; count: number; children: React.ReactNode }) {
  return (
    <Link to={to} aria-label={label} className="relative flex size-9 items-center justify-center rounded-full text-primary hover:bg-accent">
      {children}
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}

function ShopIcons() {
  const { data: cart = [] } = useCart();
  const { data: wishlist = [] } = useWishlist();
  return (
    <>
      <CountIcon to="/wishlist" label="Wishlist" count={wishlist.length}><Heart className="size-5" /></CountIcon>
      <CountIcon to="/cart" label="Cart" count={cart.reduce((n, l) => n + l.quantity, 0)}><ShoppingBag className="size-5" /></CountIcon>
    </>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function SiteHeader() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.fullName || user?.email?.split("@")[0] || "";

  const navLink =
    "eyebrow relative py-2 text-foreground/80 transition-colors hover:text-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-center after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:h-20 sm:px-8 md:grid-cols-[1fr_auto_1fr] md:gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-2 justify-self-start sm:gap-3">
          <img src={logo} alt="Parika logo" width={44} height={44} className="size-9 shrink-0 sm:size-11" />
          <span className="truncate font-display text-2xl font-semibold tracking-[0.12em] text-primary sm:text-3xl">
            PARIKA
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <NavLink to="/jewellery" className={({ isActive }) => cn(navLink, isActive && "text-primary")}>
            Jewellery
          </NavLink>
          <span className="text-gold">✦</span>
          <NavLink to="/ethnic-wear" className={({ isActive }) => cn(navLink, isActive && "text-primary")}>
            Ethnic Wear
          </NavLink>
        </nav>

        <div className="flex items-center gap-1 justify-self-end sm:gap-2">
          {user && <ShopIcons />}
          {loading ? (
            <div className="h-9 w-24" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open profile menu"
                  className="flex items-center gap-2 rounded-full border border-gold/60 bg-card py-1 pl-1 pr-3 transition-shadow hover:shadow-gold"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
                    {initials(displayName) || <UserRound className="size-4" />}
                  </span>
                  <span className="hidden max-w-28 truncate text-sm sm:inline">{displayName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-display text-base text-primary">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserRound /> My profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist">
                    <Heart /> My wishlist
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Settings /> Shop admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={async () => {
                    signOut();
                    navigate("/");
                  }}
                >
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="px-2 sm:px-3">
                <Link to="/auth?mode=login">
                  Login
                </Link>
              </Button>
              <Button asChild variant="royal" size="sm" className="rounded-full px-4 sm:px-5">
                <Link to="/auth?mode=signup">
                  Sign up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile category switcher */}
      <nav className="flex items-center justify-center gap-6 border-t border-border/60 py-2 md:hidden">
        <Link to="/jewellery" className={navLink}>
          Jewellery
        </Link>
        <span className="text-gold">✦</span>
        <Link to="/ethnic-wear" className={navLink}>
          Ethnic Wear
        </Link>
      </nav>
    </header>
  );
}
