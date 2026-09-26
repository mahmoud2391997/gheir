"use client";

import { Photo } from "../components/Photo";
import { Link } from "../lib/router";
import { Layout, Eyebrow } from "../components/Layout";
import { ProductCard } from "../components/Cards";
import { pieces, rooms } from "../data/catalog";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";

export function Visualization() {
  const { data } = useContent("page.visualization", cmsDefaults["page.visualization"]);
  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] text-forest sm:text-8xl">
          {data.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-charcoal/75">
          {data.intro}
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {data.looks.map((l, i) => (
            <article key={l.title} className={i === 0 ? "lg:col-span-3" : ""}>
              <div className={`img-frame ${i === 0 ? "aspect-[16/8]" : "aspect-[4/3]"}`}>
                <Photo src={l.image} alt={l.title} />
              </div>
              <h2 className="mt-3 font-display text-3xl text-forest">{l.title}</h2>
              <p className="text-charcoal/70">{l.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-forest py-16 text-ivory">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display text-4xl text-sand">{data.roomsTitle}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {rooms.slice(0, 3).map((r) => (
              <Link key={r.slug} href={`/collection/${r.slug}`} className="block">
                <div className="img-frame aspect-[4/3]">
                  <Photo src={r.image} alt={r.name} />
                </div>
                <p className="mt-2 font-display text-2xl">{r.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="font-display text-4xl text-forest">{data.objectsTitle}</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {pieces.filter((p) => p.system === "athar").slice(0, 3).map((p) => (
            <ProductCard key={p.slug} piece={p} />
          ))}
        </div>
        <Link href={data.cta.href} className="mt-8 inline-block text-sm text-walnut">
          {data.cta.label}
        </Link>
      </section>
    </Layout>
  );
}
