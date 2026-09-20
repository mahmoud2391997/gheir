import { useState } from "react";
import { Layout, Eyebrow } from "../components/Layout";
import { WHATSAPP_URL } from "../data/catalog";

export function Consultation() {
  const [sent, setSent] = useState(false);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">
        <div>
          <Eyebrow>Consultation</Eyebrow>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] text-forest sm:text-7xl">
            Free. Professional. Not pushy.
          </h1>
          <p className="mt-5 text-lg text-charcoal/80">
            Direction, not “buy this too”. In the first phase, consultation is free — a Creative Guide helping you
            find <em>your</em> taste.
          </p>
          <p lang="ar" className="mt-4">
            GHEIR يساعدك تعمل بيت مميز، مختلف، وأكتر شبهك.
          </p>
          <a href={WHATSAPP_URL} className="mt-8 inline-block bg-forest px-6 py-3 text-ivory">
            WhatsApp first
          </a>
        </div>
        <div className="img-frame aspect-[16/10]">
          <img src="/images/consultation-space.jpg" alt="Consultation seating with fabric samples" />
        </div>
      </section>
      <section className="border-t border-walnut/15 py-16">
        <div className="mx-auto max-w-lg px-5">
          <h2 className="font-display text-4xl text-forest">Request a time</h2>
          {sent ? (
            <p className="mt-6">We’ll confirm a conversation — showroom or remote.</p>
          ) : (
            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <input required placeholder="Name" className="w-full border border-walnut/25 bg-ivory px-3 py-3" />
              <input required placeholder="WhatsApp" className="w-full border border-walnut/25 bg-ivory px-3 py-3" />
              <select className="w-full border border-walnut/25 bg-ivory px-3 py-3">
                <option>Showroom — صينية فوكس</option>
                <option>Remote conversation</option>
              </select>
              <button type="submit" className="bg-walnut px-6 py-3 text-ivory">
                Request
              </button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
