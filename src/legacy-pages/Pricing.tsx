import { Link } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { formatEGP } from "../data/catalog";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";

export function Pricing() {
  const { data } = useContent("page.pricing", cmsDefaults["page.pricing"]);
  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] text-forest sm:text-8xl">
          {data.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-charcoal/80">
          {data.body}
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {data.bands.map((b, i) => (
            <article key={b.title} className={`border border-walnut/15 ${i === 1 ? "lg:col-span-2" : ""}`}>
              <div className={`img-frame ${i === 1 ? "aspect-[16/7]" : "aspect-[16/9]"}`}>
                <img src={b.image} alt={b.title} />
              </div>
              <div className="p-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-walnut">{b.ar}</p>
                <h2 className="mt-1 font-display text-4xl text-forest">{b.title}</h2>
                <p className="mt-2 font-display text-3xl text-walnut">{b.price}</p>
                <p className="mt-3 text-sm text-charcoal/70">{b.note}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 max-w-xl text-charcoal/75">
          {data.footerNote}
        </p>
        <Link href={data.cta.href} className="mt-6 inline-block bg-forest px-6 py-3 text-ivory">
          {data.cta.label}
        </Link>
      </section>
    </Layout>
  );
}
