import { useState } from "react";
import { Layout, Eyebrow } from "../components/Layout";
import { WHATSAPP_URL } from "../data/catalog";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";

export function Consultation() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data } = useContent("page.consultation", cmsDefaults["page.consultation"]);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">
        <div>
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] text-forest sm:text-7xl">
            {data.title}
          </h1>
          <p className="mt-5 text-lg text-charcoal/80">
            {data.bodyEn}
          </p>
          <p lang="ar" className="mt-4">
            {data.bodyAr}
          </p>
          <a href={WHATSAPP_URL} className="mt-8 inline-block bg-forest px-6 py-3 text-ivory">
            WhatsApp first
          </a>
        </div>
        <div className="img-frame aspect-[16/10]">
          <img src={data.image.src} alt={data.image.alt} />
        </div>
      </section>
      <section className="border-t border-walnut/15 py-16">
        <div className="mx-auto max-w-lg px-5">
          <h2 className="font-display text-4xl text-forest">{data.form.title}</h2>
          {sent ? (
            <p className="mt-6">{data.form.success}</p>
          ) : (
            <form
              className="mt-6 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setSubmitting(true);
                try {
                  const form = e.currentTarget;
                  const d = new FormData(form);
                  const name = String(d.get("name") ?? "").trim();
                  const phone = String(d.get("phone") ?? "").trim();
                  const mode = String(d.get("mode") ?? "").trim();
                  const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, message: mode ? `Consultation mode: ${mode}` : undefined, source: "consultation" }) });
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
              <select name="mode" className="w-full border border-walnut/25 bg-ivory px-3 py-3">
                <option>Showroom — صينية فوكس</option>
                <option>Remote conversation</option>
              </select>
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
