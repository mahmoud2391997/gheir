import { Layout, Eyebrow } from "../components/Layout";
import { SHOWROOM, WHATSAPP_URL } from "../data/catalog";
import { Link } from "wouter";

export function Showroom() {
  return (
    <Layout>
      <section className="relative min-h-[78vh] bg-forest text-ivory">
        <img
          src="/images/showroom-ismailia.jpg"
          alt="Curated GHER showroom in Ismailia"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-forest/45" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-5 pb-16 lg:px-8">
          <Eyebrow light>Showroom</Eyebrow>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] sm:text-8xl">
            {SHOWROOM.name}
            <span className="block italic text-sand">{SHOWROOM.city}</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg">A curated design space — not a warehouse.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="font-display text-4xl text-forest">Visit by appointment</h2>
          <p className="mt-4 leading-relaxed text-charcoal/80">
            صينية فوكس – الإسماعيلية. Sit with the pieces, talk style, then decide. {SHOWROOM.hours}.
          </p>
          <p className="mt-4 font-display text-3xl text-walnut">Different Without Being Unreachable.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={WHATSAPP_URL} className="bg-forest px-5 py-3 font-medium text-ivory">
              Book on WhatsApp
            </a>
            <Link href="/consultation" className="border border-forest px-5 py-3 text-forest">
              Consultation
            </Link>
          </div>
        </div>
        <div className="img-frame aspect-[4/3]">
          <img src="/images/living-gathering.jpg" alt="Gathering sofa in the showroom atmosphere" />
        </div>
      </section>
    </Layout>
  );
}
