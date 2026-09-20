import { useState } from "react";
import { Layout, Eyebrow } from "../components/Layout";
import { SHOWROOM, WHATSAPP_URL } from "../data/catalog";

export function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">
        <div>
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] text-forest sm:text-7xl">
            WhatsApp-first conversation.
          </h1>
          <p className="mt-5 text-lg text-charcoal/80">
            Simple, smart, close. Not a ticket. Visit the showroom when the pieces need to be sat in.
          </p>
          <ul className="mt-8 space-y-3 text-charcoal/80">
            <li>
              <span className="font-mono text-[11px] uppercase tracking-widest text-walnut">Showroom</span>
              <p lang="ar" className="font-display text-3xl text-forest">
                {SHOWROOM.line}
              </p>
            </li>
            <li>
              <span className="font-mono text-[11px] uppercase tracking-widest text-walnut">Hours</span>
              <p>{SHOWROOM.hours}</p>
            </li>
          </ul>
          <a href={WHATSAPP_URL} className="mt-8 inline-block bg-forest px-6 py-3 text-ivory">
            Open WhatsApp
          </a>
        </div>
        <div>
          <div className="img-frame mb-6 aspect-[16/9]">
            <img src="/images/showroom-ismailia.jpg" alt="GHER showroom" />
          </div>
          {sent ? (
            <p className="border-l-2 border-forest pl-4">Message received. We’ll answer as a conversation.</p>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <input required placeholder="Name" className="w-full border border-walnut/25 bg-ivory px-3 py-3" />
              <input required placeholder="WhatsApp" className="w-full border border-walnut/25 bg-ivory px-3 py-3" />
              <textarea required rows={5} placeholder="What are you making at home?" className="w-full border border-walnut/25 bg-ivory px-3 py-3" />
              <button type="submit" className="bg-walnut px-6 py-3 text-ivory">
                Send message
              </button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
