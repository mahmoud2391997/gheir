import { Link } from "wouter";
import { Layout, Reveal, Eyebrow } from "../components/Layout";
import { formatEGP, systems } from "../data/catalog";

export function Systems() {
  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Eyebrow>Systems · New</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] text-forest sm:text-8xl">
          Four languages. One house that doesn’t look like the others.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-charcoal/75">
          Configurable families — not SKUs in a catalog grid.
          <span lang="ar" className="mt-2 block">
            غير المتوقع. غير المتكرر.
          </span>
        </p>
      </section>
      <section className="pb-20">
        {systems.map((s, i) => (
          <Reveal key={s.id}>
            <Link
              href={`/systems/${s.id}`}
              className={`grid items-stretch lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
            >
              <div className="img-frame min-h-[52vh]">
                <img src={s.image} alt={`${s.name} system`} />
              </div>
              <div className="flex flex-col justify-center bg-forest px-8 py-14 text-ivory lg:px-16">
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-sand">{s.tag}</p>
                <h2 className="mt-3 font-display text-6xl">
                  {s.name} <span className="italic text-sand">{s.nameAr}</span>
                </h2>
                <p className="mt-5 max-w-md text-ivory/80">{s.philosophy}</p>
                <p className="mt-6 font-mono text-sm text-sand">from {formatEGP(s.from)}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </Layout>
  );
}
