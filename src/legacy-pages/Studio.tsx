import { useState } from "react";
import { Layout, Eyebrow } from "../components/Layout";
import { useInquiry } from "../components/Inquiry";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";

export function Studio() {
  const { open } = useInquiry();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data } = useContent("page.studio", cmsDefaults["page.studio"]);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] text-forest sm:text-8xl">
          {data.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-charcoal/75">
          {data.intro}
        </p>
      </section>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 lg:grid-cols-2 lg:px-8">
        <div className="img-frame aspect-[4/3]">
          <img src={data.image.src} alt={data.image.alt} />
        </div>
        <ol className="space-y-6">
          {data.steps.map((s) => (
            <li key={s.n} className="grid grid-cols-[4rem_1fr] gap-4">
              <span className="font-mono text-walnut">{s.n}</span>
              <div>
                <h2 className="font-display text-3xl text-forest">{s.title}</h2>
                <p className="mt-1 text-charcoal/75">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="bg-forest py-16 text-ivory">
        <div className="mx-auto max-w-lg px-5">
          <h2 className="font-display text-4xl text-sand">{data.form.title}</h2>
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
                  const message = String(d.get("message") ?? "").trim();
                  const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, message, source: "studio" }) });
                  if (!response.ok) throw new Error((await response.json()).error ?? "Unable to send");
                  setSent(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to send");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <input name="name" required placeholder="Name" className="w-full bg-ivory px-3 py-3 text-charcoal" />
              <input name="phone" required placeholder="WhatsApp" className="w-full bg-ivory px-3 py-3 text-charcoal" />
              <textarea name="message" required rows={5} placeholder="Room, pieces, how you live" className="w-full bg-ivory px-3 py-3 text-charcoal" />
              <button type="submit" disabled={submitting} className="bg-sand px-6 py-3 text-forest disabled:opacity-60">
                {submitting ? "Sending…" : data.form.button}
              </button>
              {error && <p className="text-sm text-red-200">{error}</p>}
            </form>
          )}
          <button type="button" className="mt-4 text-sm text-sand" onClick={() => open({ title: data.form.presetTitle })}>
            {data.form.inquireCta}
          </button>
        </div>
      </section>
    </Layout>
  );
}
