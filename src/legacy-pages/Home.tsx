import { Photo } from "../components/Photo";
import { Link } from "wouter";
import { motion } from "motion/react";
import { Layout, Reveal, Eyebrow } from "../components/Layout";
import { Logo } from "../components/Logo";
import { useInquiry } from "../components/Inquiry";
import { formatEGP, rooms, systems } from "../data/catalog";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";
import { useLocale } from "../lib/locale";

const threeWays = [
  rooms.find((r) => r.slug === "the-unbeige-living")!,
  rooms.find((r) => r.slug === "friday-gathering")!,
  rooms.find((r) => r.slug === "ismailia-morning")!,
];

export function Home() {
  const { open } = useInquiry();
  const { pick, heading, t } = useLocale();
  const { data } = useContent("page.home", cmsDefaults["page.home"]);

  return (
    <Layout>
      <section className="relative min-h-[92vh] overflow-hidden bg-forest text-ivory">
        <Photo
          priority
          src={data.hero.image.src}
          alt={data.hero.image.alt}
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
            {data.hero.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 max-w-5xl font-display text-[clamp(3.4rem,12vw,9.5rem)] leading-[0.86] tracking-tight"
          >
            {data.hero.titleTopAr}
            <span className="block italic text-sand">{data.hero.titleBottom}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-ivory/85"
          >
            {data.hero.bodyEn}
            <span lang="ar" dir="rtl" className="mt-2 inline-block">
              {data.hero.bodyAr}
            </span>
          </motion.p>
          <div className="mt-8 flex flex-col gap-3 pb-16 sm:flex-row sm:flex-wrap sm:pb-0">
            <Link href={data.hero.primaryCta.href} className="bg-sand px-6 py-3 text-center text-sm font-medium text-forest hover:bg-ivory">
              {data.hero.primaryCta.label}
            </Link>
            <Link href={data.hero.secondaryCta.href} className="border border-sand/70 px-6 py-3 text-center text-sm font-medium text-ivory hover:bg-sand hover:text-forest">
              {data.hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>{data.belief.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-display text-5xl leading-[0.95] text-forest sm:text-7xl">
                {data.belief.title}
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pt-12">
              <p lang="ar" className="text-lg leading-relaxed text-charcoal/80">
                {data.belief.bodyAr}
              </p>
              <p className="mt-4 leading-relaxed text-charcoal/80">
                {data.belief.bodyEn}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-forest py-20 text-ivory">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <Eyebrow light>{data.rooms.eyebrow}</Eyebrow>
            <h2 className="mt-3 max-w-3xl font-display text-5xl leading-none text-sand">
              {data.rooms.title}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {threeWays.map((room, i) => (
              <Reveal key={room.slug} className={i === 1 ? "md:mt-10" : ""}>
                <Link href={`/collection/${room.slug}`} className="group block">
                  <div className="img-frame aspect-[4/5]">
                    <Photo src={room.image} alt={pick(room.name, room.nameAr)} />
                  </div>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-sand">{heading(room.type)}</p>
                  <h3 className="font-display text-3xl text-ivory group-hover:text-sand">{pick(room.name, room.nameAr)}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <Eyebrow>{data.path.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-display text-5xl text-forest">{data.path.title}</h2>
        </Reveal>
        <ol className="mt-12 grid gap-px bg-walnut/20 sm:grid-cols-3">
          {data.path.steps.map((s) => (
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
              <Eyebrow>{data.systems.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-display text-5xl text-forest">{data.systems.title}</h2>
            </div>
            <Link href={data.systems.allCta.href} className="font-mono text-xs uppercase tracking-widest text-walnut hover:text-forest">
              {data.systems.allCta.label}
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {systems.map((sys) => (
              <Link
                key={sys.id}
                href={`/systems/${sys.id}`}
                className="group relative aspect-[4/3] overflow-hidden"
              >
                <Photo src={sys.image} alt={sys.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-ivory">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sand">{sys.tag}</p>
                  <h3 className="font-display text-4xl">
                    {pick(sys.name, sys.nameAr)} <span className="italic text-sand">{pick(sys.nameAr, sys.name)}</span>
                  </h3>
                  <p className="font-mono text-xs">{t.from} {formatEGP(sys.from)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <div className="img-frame aspect-[4/3]">
            <Photo src={data.khanqah.image.src} alt={data.khanqah.image.alt} />
          </div>
        </Reveal>
        <Reveal>
          <Eyebrow>{data.khanqah.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-display text-5xl text-forest">{data.khanqah.title}</h2>
          <p className="mt-5 leading-relaxed text-charcoal/80">
            {data.khanqah.body}
          </p>
          <Link href={data.khanqah.cta.href} className="mt-6 inline-block border-b border-walnut pb-1 text-sm text-walnut">
            {data.khanqah.cta.label}
          </Link>
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-walnut py-20 text-ivory">
        <div className="kufic-wash pointer-events-none absolute inset-0 opacity-[0.07]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <Eyebrow light>{data.consultation.eyebrow}</Eyebrow>
            <h2 className="mt-3 font-display text-5xl">{data.consultation.title}</h2>
            <p className="mt-4 max-w-md text-ivory/80">
              {data.consultation.body}
            </p>
          </div>
          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-end">
            <Link href={data.consultation.primaryCta.href} className="bg-sand px-6 py-3 text-center text-sm font-medium text-forest">
              {data.consultation.primaryCta.label}
            </Link>
            <button
              type="button"
              onClick={() => open({ title: data.consultation.presetTitle })}
              className="border border-sand/50 px-6 py-3 text-sm"
            >
              {data.consultation.secondaryCta.label}
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
