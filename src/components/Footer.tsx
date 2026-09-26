"use client";

import { Link } from "../lib/router";
import { Logo } from "./Logo";
import { SHOWROOM } from "../data/catalog";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";
import { useLocale } from "../lib/locale";

const groups = [
  {
    title: "The Journey",
    links: [
      { href: "/systems", label: "Systems" },
      { href: "/collection", label: "Collection" },
      { href: "/design", label: "Design your own" },
      { href: "/pricing", label: "Value guidance" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/studio", label: "Bespoke" },
      { href: "/khanqah", label: "Khanqah" },
      { href: "/visualization", label: "Visualization" },
      { href: "/consultation", label: "Consultation" },
    ],
  },
  {
    title: "Next",
    links: [
      { href: "/showroom", label: "Showroom" },
      { href: "/partners", label: "Partners / Trade" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  const fallback = { ...cmsDefaults["site.footer"], bottomRight: SHOWROOM.line, groups };
  const { data } = useContent<typeof fallback>("site.footer", fallback);
  const { labelFor, pick, heading } = useLocale();

  return (
    <footer className="bg-forest text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <Logo dark />
          <p className="mt-6 max-w-sm font-display text-3xl leading-tight text-sand">
            {data.heroTaglineAr}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/75">
            {pick(data.heroBodyEn, data.heroBodyAr)}
          </p>
        </div>
        {data.groups.map((g) => (
          <div key={g.title} className="lg:col-span-2">
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-sand">{heading(g.title)}</p>
            <ul className="mt-4 space-y-2">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ivory/80 hover:text-ivory">
                    {labelFor(l.href, l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-sand/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-ivory/60 sm:flex-row sm:justify-between lg:px-8">
          <span>{data.bottomLeft}</span>
          <span lang="ar">{data.bottomRight}</span>
        </div>
      </div>
    </footer>
  );
}
