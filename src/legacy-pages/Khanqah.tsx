import { Layout, Reveal, Eyebrow } from "../components/Layout";
import { journey } from "../data/catalog";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";

export function Khanqah() {
  const { data } = useContent("page.khanqah", cmsDefaults["page.khanqah"]);
  return (
    <Layout>
      <section className="relative min-h-[80vh] bg-forest text-ivory">
        <img src={data.hero.image.src} alt={data.hero.image.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-forest/55" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-end px-5 pb-16 lg:px-8">
          <Eyebrow light>{data.hero.eyebrow}</Eyebrow>
          <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] sm:text-8xl">
            {data.hero.title}
          </h1>
          <p className="mt-4 max-w-lg text-lg text-ivory/85">
            {data.hero.body}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <h2 className="font-display text-5xl text-forest">{data.founder.title}</h2>
          <p className="mt-5 leading-relaxed text-charcoal/80">
            {data.founder.bodyEn}
          </p>
          <p lang="ar" className="mt-4 max-w-xl leading-relaxed text-charcoal/80">
            {data.founder.bodyAr}
          </p>
        </Reveal>
        <Reveal>
          <div className="img-frame aspect-[4/3]">
            <img src={data.founder.image.src} alt={data.founder.image.alt} />
          </div>
        </Reveal>
      </section>

      <section className="bg-forest py-20 text-ivory">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div className="img-frame aspect-[4/3]">
            <img src={data.craft.image.src} alt={data.craft.image.alt} />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-5xl text-sand">{data.craft.title}</h2>
            <p className="mt-5 text-ivory/80">
              {data.craft.body}
            </p>
            <div className="mt-8 img-frame aspect-[16/9]">
              <img src={data.craft.insetImage.src} alt={data.craft.insetImage.alt} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Eyebrow>{data.journey.eyebrow}</Eyebrow>
        <h2 className="mt-3 font-display text-4xl text-forest">{data.journey.title}</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {journey.map((j) => (
            <li key={j.n} className="border-t border-walnut/30 pt-4">
              <p className="font-mono text-xs text-walnut">{j.n}</p>
              <h3 className="mt-2 font-display text-2xl text-forest">{j.title}</h3>
              <p className="mt-1 text-sm text-charcoal/70">{j.ar}</p>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  );
}
