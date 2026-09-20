import { Layout, Reveal, Eyebrow } from "../components/Layout";
import { journey } from "../data/catalog";

export function Khanqah() {
  return (
    <Layout>
      <section className="relative min-h-[80vh] bg-forest text-ivory">
        <img src="/images/workshop-wide.jpg" alt="GHER workshop with wood and light" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-forest/55" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-end px-5 pb-16 lg:px-8">
          <Eyebrow light>Khanqah / Making</Eyebrow>
          <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] sm:text-8xl">
            A gathering place for craft.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-ivory/85">
            Not a commercial factory. An atelier — wood, dust in the light, hands that remember.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <h2 className="font-display text-5xl text-forest">Ziad / زياد</h2>
          <p className="mt-5 leading-relaxed text-charcoal/80">
            Started in 2016 with string art and wood. Then workshops. Then professional work in the UAE.
            The sentence people kept repeating was not a slogan. It was a reaction: <strong>ده غير.</strong>
          </p>
          <p lang="ar" className="mt-4 max-w-xl leading-relaxed text-charcoal/80">
            ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.
          </p>
        </Reveal>
        <Reveal>
          <div className="img-frame aspect-[4/3]">
            <img src="/images/workshop-hands.jpg" alt="Craftsman hands assembling walnut furniture" />
          </div>
        </Reveal>
      </section>

      <section className="bg-forest py-20 text-ivory">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div className="img-frame aspect-[4/3]">
            <img src="/images/workshop-macro.jpg" alt="Macro of wood grain being finished" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-5xl text-sand">Raw craft + refined result.</h2>
            <p className="mt-5 text-ivory/80">
              Quality is explained as معمول عشان يعيش — made to live — not “أعلى جودة”. Heritage sits in the joinery,
              the fingerprint inlay, the refusal of beige sameness.
            </p>
            <div className="mt-8 img-frame aspect-[16/9]">
              <img src="/images/craft-fingerprint.jpg" alt="Geometric fingerprint inlay in walnut" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Eyebrow>The customer journey</Eyebrow>
        <h2 className="mt-3 font-display text-4xl text-forest">From awareness to after-sales.</h2>
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
