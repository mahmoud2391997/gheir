import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Menu, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { useInquiry } from "./Inquiry";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
import { useLocale } from "../lib/locale";

const links = [
  { href: "/systems", key: "systems", badge: true },
  { href: "/collection", key: "collection" },
  { href: "/design", key: "design" },
  { href: "/khanqah", key: "khanqah" },
  { href: "/contact", key: "contact" },
] as const;

export function Header() {
  const [location] = useLocation();
  const { open } = useInquiry();
  const cart = useCart();
  const wishlist = useWishlist();
  const { t, toggle, locale } = useLocale();
  const [mobile, setMobile] = useState(false);
  const dark = location === "/" || location.startsWith("/khanqah") || location.startsWith("/showroom");

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        dark ? "border-sand/20 bg-forest text-ivory" : "border-walnut/15 bg-ivory text-charcoal"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
        <Link href="/" onClick={() => setMobile(false)} aria-label="GHEIR home">
          <Logo dark={dark} compact />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {links.map((l) => {
            const active = location === l.href || location.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`font-mono text-[11px] tracking-[0.22em] uppercase ${
                  active
                    ? dark
                      ? "text-sand"
                      : "text-forest"
                    : dark
                      ? "text-ivory/80 hover:text-ivory"
                      : "text-charcoal/70 hover:text-forest"
                }`}
              >
                {t[l.key]}
                {"badge" in l && l.badge && (
                  <sup className={`ms-1 font-sans text-[9px] tracking-normal ${dark ? "text-sand" : "text-walnut"}`}>
                    {t.new}
                  </sup>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/wishlist"
            className={`relative inline-flex items-center gap-2 px-3 py-2 font-mono text-[11px] tracking-[0.18em] uppercase ${
              dark ? "text-ivory/85 hover:text-ivory" : "text-charcoal/70 hover:text-forest"
            }`}
            aria-label={t.wishlist}
          >
            <Heart size={18} />
            <span className="hidden sm:inline">{t.wishlist}</span>
            {wishlist.count > 0 && (
              <span
                className={`absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] ${
                  dark ? "bg-sand text-forest" : "bg-forest text-ivory"
                }`}
              >
                {wishlist.count}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className={`relative inline-flex items-center gap-2 px-3 py-2 font-mono text-[11px] tracking-[0.18em] uppercase ${
              dark ? "text-ivory/85 hover:text-ivory" : "text-charcoal/70 hover:text-forest"
            }`}
            aria-label={t.cart}
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">{t.cart}</span>
            {cart.count > 0 && (
              <span className={`absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] ${
                dark ? "bg-sand text-forest" : "bg-forest text-ivory"
              }`}>
                {cart.count}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => open({ title: "Conversation" })}
            className={`hidden px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase sm:inline-flex ${
              dark ? "bg-sand text-forest hover:bg-ivory" : "bg-forest text-ivory hover:bg-charcoal"
            }`}
          >
            {t.inquire}
          </button>
          <button
            type="button"
            onClick={toggle}
            className={`px-2 py-2 font-mono text-[11px] tracking-[0.14em] uppercase ${
              dark ? "text-sand hover:text-ivory" : "text-walnut hover:text-forest"
            }`}
            aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {t.langLabel}
          </button>
          <button
            type="button"
            className="lg:hidden p-2"
            aria-expanded={mobile}
            aria-label={mobile ? t.closeMenu : t.openMenu}
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobile && (
        <nav className={`border-t px-5 py-4 lg:hidden ${dark ? "border-sand/20" : "border-walnut/15"}`} aria-label="Mobile">
          <ul className="space-y-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block font-display text-3xl"
                  onClick={() => setMobile(false)}
                >
                  {t[l.key]}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="mt-2 font-mono text-xs uppercase tracking-widest"
                onClick={() => {
                  setMobile(false);
                  open();
                }}
              >
                {t.startConversation}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
