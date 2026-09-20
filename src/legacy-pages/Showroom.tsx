import { Layout, Eyebrow } from "../components/Layout";
import { SHOWROOM, WHATSAPP_URL } from "../data/catalog";
import { Link } from "wouter";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";

export function Showroom() {
  const { data } = useContent("page.showroom", cmsDefaults["page.showroom"]);
  return (
    <Layout>
      <section className="relative min-h-[78vh] bg-forest text-ivory">
        <img
          src={data.hero.image.src}
          alt={data.hero.image.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-forest/45" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-5 pb-16 lg:px-8">
          <Eyebrow light>{data.eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] sm:text-8xl">
            {SHOWROOM.name}
            <span className="block italic text-sand">{SHOWROOM.city}</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg">{data.hero.subtitle}</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="font-display text-4xl text-forest">{data.visit.title}</h2>
          <p className="mt-4 leading-relaxed text-charcoal/80">
            {data.visit.body} {SHOWROOM.hours}.
          </p>
          <p className="mt-4 font-display text-3xl text-walnut">{data.visit.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={WHATSAPP_URL} className="bg-forest px-5 py-3 font-medium text-ivory">
              {data.visit.primaryCta}
            </a>
            <Link href={data.visit.secondaryCta.href} className="border border-forest px-5 py-3 text-forest">
              {data.visit.secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="img-frame aspect-[4/3]">
          <img src={data.visit.image.src} alt={data.visit.image.alt} />
        </div>
      </section>
    </Layout>
  );
}
