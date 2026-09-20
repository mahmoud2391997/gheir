import { useState } from "react";
import { Layout, Eyebrow } from "../components/Layout";

export function Partners() {
  const [sent, setSent] = useState(false);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">
        <div>
          <Eyebrow>Partners / Trade</Eyebrow>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] text-forest">
            For designers and studios who want a home-style partner.
          </h1>
          <p className="mt-5 text-lg text-charcoal/80">
            GHEIR as a language in your projects — not a white-label factory. Trade conversation, not a SaaS plan.
          </p>
          <p lang="ar" className="mt-3">
            اختلاف له شخصية.
          </p>
        </div>
        <div className="img-frame aspect-[4/3]">
          <img src="/images/visualization-look.jpg" alt="Styled GHEIR composition for trade partners" />
        </div>
      </section>
      <section className="bg-walnut py-16 text-ivory">
        <div className="mx-auto max-w-lg px-5">
          <h2 className="font-display text-4xl">Trade inquiry</h2>
          {sent ? (
            <p className="mt-6">Received. We’ll talk as partners.</p>
          ) : (
            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <input required placeholder="Studio name" className="w-full bg-ivory px-3 py-3 text-charcoal" />
              <input required placeholder="WhatsApp" className="w-full bg-ivory px-3 py-3 text-charcoal" />
              <textarea rows={4} placeholder="How you work with homes" className="w-full bg-ivory px-3 py-3 text-charcoal" />
              <button type="submit" className="bg-sand px-6 py-3 text-forest">
                Send
              </button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
