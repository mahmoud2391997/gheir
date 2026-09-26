import { Photo } from "../components/Photo";
import { Link, useParams } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { ProductCard } from "../components/Cards";
import { formatEGP, pieces, systemById } from "../data/catalog";
import { NotFound } from "./NotFound";
import { useInquiry } from "../components/Inquiry";

export function SystemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const system = systemById(slug ?? "");
  const { open } = useInquiry();
  if (!system) return <NotFound />;
  const related = pieces.filter((p) => p.system === system.id);

  return (
    <Layout>
      <section className="relative min-h-[70vh] bg-forest text-ivory">
        <Photo src={system.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-forest/50" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-5 pb-14 lg:px-8">
          <Eyebrow>{system.tag}</Eyebrow>
          <h1 className="mt-3 font-display text-7xl leading-none sm:text-8xl">
            {system.name} <span className="italic text-sand">{system.nameAr}</span>
          </h1>
          <p className="mt-4 font-mono text-sand">from {formatEGP(system.from)}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <h2 className="font-display text-4xl text-forest">Philosophy</h2>
          <p className="mt-4 text-lg leading-relaxed">{system.philosophy}</p>
          <p lang="ar" className="mt-3 text-lg">
            {system.philosophyAr}
          </p>
        </div>
        <div className="lg:col-span-5 border border-walnut/20 p-6">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-walnut">How to configure</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {system.configure.map((c) => (
              <li key={c}>— {c}</li>
            ))}
          </ul>
          <h3 className="mt-8 font-mono text-[11px] uppercase tracking-widest text-walnut">Materials</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {system.materials.map((c) => (
              <li key={c}>— {c}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/design?system=${system.id}`} className="bg-forest px-5 py-3 text-sm text-ivory">
              Open configurator
            </Link>
            <button type="button" className="border border-forest px-5 py-3 text-sm" onClick={() => open({ title: system.name })}>
              Consultation
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <h2 className="font-display text-4xl text-forest">Pieces in {system.name}</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} piece={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
