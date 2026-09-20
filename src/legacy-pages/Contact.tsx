import { useState } from "react";
import { Layout, Eyebrow } from "../components/Layout";
import { SHOWROOM, WHATSAPP_URL } from "../data/catalog";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";

export function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data } = useContent("page.contact", cmsDefaults["page.contact"]);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">
        <div>
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] text-forest sm:text-7xl">
            {data.title}
          </h1>
          <p className="mt-5 text-lg text-charcoal/80">
            {data.intro}
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
            <img src={data.image.src} alt={data.image.alt} />
          </div>
          {sent ? (
            <p className="border-l-2 border-forest pl-4">{data.form.success}</p>
          ) : (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setSubmitting(true);
                try {
                  const form = e.currentTarget;
                  const data = new FormData(form);
                  const name = String(data.get("name") ?? "").trim();
                  const phone = String(data.get("phone") ?? "").trim();
                  const message = String(data.get("message") ?? "").trim();

                  const response = await fetch("/api/leads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, message, source: "contact" }),
                  });
                  if (!response.ok) throw new Error((await response.json()).error ?? "Unable to send");
                  setSent(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to send");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <input name="name" required placeholder="Name" className="w-full border border-walnut/25 bg-ivory px-3 py-3" />
              <input name="phone" required placeholder="WhatsApp" className="w-full border border-walnut/25 bg-ivory px-3 py-3" />
              <textarea name="message" required rows={5} placeholder="What are you making at home?" className="w-full border border-walnut/25 bg-ivory px-3 py-3" />
              <button type="submit" disabled={submitting} className="bg-walnut px-6 py-3 text-ivory disabled:opacity-60">
                {submitting ? "Sending…" : data.form.button}
              </button>
              {error && <p className="text-sm text-red-700">{error}</p>}
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
