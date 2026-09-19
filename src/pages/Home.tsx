import { Link } from "wouter";
import { motion } from "motion/react";
import { Layout, Reveal, Eyebrow } from "../components/Layout";
import { Logo } from "../components/Logo";
import { RoomCard } from "../components/Cards";
import { useInquiry } from "../components/Inquiry";
import { formatEGP, rooms, systems } from "../data/catalog";

const threeWays = [
  rooms.find((r) => r.slug === "the-unbeige-living")!,
  rooms.find((r) => r.slug === "friday-gathering")!,
  rooms.find((r) => r.slug === "ismailia-morning")!,
];

const steps = [
  { n: "01", title: "See a room that isn’t beige", body: "Collection — finished rooms with a point of view." },
  { n: "02", title: "Shape it to your house", body: "Design — live indicative price as you change wood, size, fabric." },
  { n: "03", title: "Make it in about a month", body: "Consultation, then the workshop. معمول عشان يعيش." },
];

export function Home() {
  const { open } = useInquiry();

  return (
    <Layout>
      <section className="relative min-h-[92vh] overflow-hidden bg-forest text-ivory">
        <img
          src="/images/hero-room.jpg"
          alt="Forest-green sofa in a distinctive living room"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-10 pt-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Logo dark />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-sand"
          >
            Ismailia atelier · since 2016
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 max-w-5xl font-display text-[clamp(3.4rem,12vw,9.5rem)] leading-[0.86] tracking-tight"
          >
            خلّي بيتك
            <span className="block italic text-sand">GHER</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-ivory/85"
          >
            Make your home GHER.
            <span lang="ar" dir="rtl" className="mt-2 inline-block">
              غير المتوقع. غير المتكرر. غير كل بيت. وأكتر شبهك.
            </span>
          </motion.p>
          <div className="mt-8 flex flex-col gap-3 pb-16 sm:flex-row sm:flex-wrap sm:pb-0">
            <Link href="/collection" className="bg-sand px-6 py-3 text-center text-sm font-medium text-forest hover:bg-ivory">
              See rooms
            </Link>
            <Link href="/design" className="border border-sand/70 px-6 py-3 text-center text-sm font-medium text-ivory hover:bg-sand hover:text-forest">
              Design with a live price
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>Belief</Eyebrow>
              <h2 className="mt-3 font-display text-5xl leading-[0.95] text-forest sm:text-7xl">
                What is made by hand can never be truly copied.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pt-12">
              <p lang="ar" className="text-lg leading-relaxed text-charcoal/80">
                ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.
              </p>
              <p className="mt-4 leading-relaxed text-charcoal/80">
                <span lang="ar">GHER مش داخل ينافس على إنه الأرخص، ومش داخل كمان ينافس براندات الـLuxury.</span>{" "}
                Distinctive design at a reasonable value. Personal difference —
                <em lang="ar"> اختلاف له شخصية</em>.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-forest py-20 text-ivory">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <Eyebrow light>Rooms, three ways</Eyebrow>
            <h2 className="mt-3 max-w-3xl font-display text-5xl leading-none text-sand">
              Living. Dining. Sleep. Not a warehouse aisle.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {threeWays.map((room, i) => (
              <Reveal key={room.slug} className={i === 1 ? "md:mt-10" : ""}>
                <Link href={`/collection/${room.slug}`} className="group block">
                  <div className="img-frame aspect-[4/5]">
                    <img src={room.image} alt={room.name} />
                  </div>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-sand">{room.type}</p>
                  <h3 className="font-display text-3xl text-ivory group-hover:text-sand">{room.name}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <Eyebrow>The path</Eyebrow>
          <h2 className="mt-3 font-display text-5xl text-forest">Three steps. Then a month of making.</h2>
        </Reveal>
        <ol className="mt-12 grid gap-px bg-walnut/20 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="bg-ivory p-8">
              <p className="font-mono text-xs text-walnut">{s.n}</p>
              <h3 className="mt-4 font-display text-3xl text-forest">{s.title}</h3>
              <p className="mt-3 text-charcoal/75">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-walnut/15 bg-ivory-deep/40 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Four systems</Eyebrow>
              <h2 className="mt-3 font-display text-5xl text-forest">Saha · Sofra · Layl · Athar</h2>
            </div>
            <Link href="/systems" className="font-mono text-xs uppercase tracking-widest text-walnut hover:text-forest">
              All systems
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {systems.map((sys) => (
              <Link
                key={sys.id}
                href={`/systems/${sys.id}`}
                className="group relative aspect-[4/3] overflow-hidden"
              >
                <img src={sys.image} alt={sys.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-ivory">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sand">{sys.tag}</p>
                  <h3 className="font-display text-4xl">
                    {sys.name} <span className="italic text-sand">{sys.nameAr}</span>
                  </h3>
                  <p className="font-mono text-xs">from {formatEGP(sys.from)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <div className="img-frame aspect-[4/3]">
            <img src="/images/workshop-hands.jpg" alt="Hands finishing walnut in the GHER workshop" />
          </div>
        </Reveal>
        <Reveal>
          <Eyebrow>Khanqah</Eyebrow>
          <h2 className="mt-3 font-display text-5xl text-forest">A place of gathering, not a factory floor.</h2>
          <p className="mt-5 leading-relaxed text-charcoal/80">
            Ziad / زياد started in 2016 with string art and wood, then workshops and professional work in the UAE.
            The recurring reaction: <strong>ده غير.</strong>
          </p>
          <Link href="/khanqah" className="mt-6 inline-block border-b border-walnut pb-1 text-sm text-walnut">
            The making
          </Link>
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-walnut py-20 text-ivory">
        <div className="kufic-wash pointer-events-none absolute inset-0 opacity-[0.07]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <Eyebrow light>Consultation</Eyebrow>
            <h2 className="mt-3 font-display text-5xl">Free, in this first phase. Direction — not “buy this too”.</h2>
            <p className="mt-4 max-w-md text-ivory/80">
              Taste, but helping you discover yours. Creative Guide, not a closer.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-end">
            <Link href="/consultation" className="bg-sand px-6 py-3 text-center text-sm font-medium text-forest">
              Book a conversation
            </Link>
            <button
              type="button"
              onClick={() => open({ title: "Consultation" })}
              className="border border-sand/50 px-6 py-3 text-sm"
            >
              Inquire now
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
