import { Link } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { ProductCard } from "../components/Cards";
import { pieces, rooms } from "../data/catalog";

const looks = [
  {
    title: "Complete the look",
    image: "/images/visualization-look.jpg",
    body: "Sofa, armchair, table, triptych — one temperature.",
  },
  {
    title: "Unbeige living",
    image: "/images/hero-alt.jpg",
    body: "Color as character, not decoration.",
  },
  {
    title: "Friday table",
    image: "/images/dining-friday.jpg",
    body: "Chairs with mashrabiya rhythm.",
  },
];

export function Visualization() {
  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Eyebrow>Visualization</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] text-forest sm:text-8xl">
          See it before it exists.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-charcoal/75">
          Styling ideas and room compositions. Complete-the-look selling — consultative, never warehouse-pushy.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {looks.map((l, i) => (
            <article key={l.title} className={i === 0 ? "lg:col-span-3" : ""}>
              <div className={`img-frame ${i === 0 ? "aspect-[16/8]" : "aspect-[4/3]"}`}>
                <img src={l.image} alt={l.title} />
              </div>
              <h2 className="mt-3 font-display text-3xl text-forest">{l.title}</h2>
              <p className="text-charcoal/70">{l.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-forest py-16 text-ivory">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display text-4xl text-sand">Rooms to enter</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {rooms.slice(0, 3).map((r) => (
              <Link key={r.slug} href={`/collection/${r.slug}`} className="block">
                <div className="img-frame aspect-[4/3]">
                  <img src={r.image} alt={r.name} />
                </div>
                <p className="mt-2 font-display text-2xl">{r.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="font-display text-4xl text-forest">Objects that finish a wall</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {pieces.filter((p) => p.system === "athar").slice(0, 3).map((p) => (
            <ProductCard key={p.slug} piece={p} />
          ))}
        </div>
        <Link href="/studio" className="mt-8 inline-block text-sm text-walnut">
          Commission a visualization
        </Link>
      </section>
    </Layout>
  );
}
