import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useInquiry } from "./Inquiry";

const links = [
  { href: "/systems", label: "Systems", badge: "New" },
  { href: "/collection", label: "Collection" },
  { href: "/design", label: "Design" },
  { href: "/khanqah", label: "Khanqah" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [location] = useLocation();
  const { open } = useInquiry();
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
                {l.label}
                {l.badge && (
                  <sup className={`ml-1 font-sans text-[9px] tracking-normal ${dark ? "text-sand" : "text-walnut"}`}>
                    {l.badge}
                  </sup>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => open({ title: "Conversation" })}
            className={`hidden px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase sm:inline-flex ${
              dark ? "bg-sand text-forest hover:bg-ivory" : "bg-forest text-ivory hover:bg-charcoal"
            }`}
          >
            Inquire
          </button>
          <button
            type="button"
            className="lg:hidden p-2"
            aria-expanded={mobile}
            aria-label={mobile ? "Close menu" : "Open menu"}
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
                  {l.label}
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
                Start a conversation
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
