import { Link } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { formatEGP } from "../data/catalog";

const bands = [
  {
    title: "Art set 50×50",
    ar: "طقم لوحات",
    price: "≈ 6–7k EGP",
    image: "/images/product-art-set.jpg",
    note: "Numbered. If the edition ends, made-to-order slightly higher.",
  },
  {
    title: "Living set",
    ar: "ركنة + كرسي + فوتيه + coffee table",
    price: "≈ 50,000 EGP",
    image: "/images/living-gathering.jpg",
    note: "A starting conversation — customization and wood move the number.",
  },
  {
    title: "Saha seating",
    ar: "ساحة",
    price: `from ${formatEGP(31500)}`,
    image: "/images/system-saha.jpg",
    note: "Modular. Size and fabric are the levers.",
  },
  {
    title: "Sofra dining",
    ar: "سفرة",
    price: `from ${formatEGP(18000)}`,
    image: "/images/system-sofra.jpg",
    note: "Table first; chairs as extras in the configurator.",
  },
  {
    title: "Layl bedroom",
    ar: "ليل",
    price: `from ${formatEGP(42000)}`,
    image: "/images/system-layl.jpg",
    note: "Custom sizes. Made to the room you have.",
  },
];

export function Pricing() {
  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Eyebrow>Value guidance</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] text-forest sm:text-8xl">
          Not plans. Not luxury theater.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-charcoal/80">
          GHEIR مش داخل ينافس على إنه الأرخص، ومش داخل كمان ينافس براندات الـLuxury. Accessible distinctiveness.
          Limited pieces numbered. Customization is expected. Lead time about one month.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {bands.map((b, i) => (
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
          Made-to-order when stock is gone — slightly higher, still yours. Quality = معمول عشان يعيش.
        </p>
        <Link href="/design" className="mt-6 inline-block bg-forest px-6 py-3 text-ivory">
          Build a live price
        </Link>
      </section>
    </Layout>
  );
}
