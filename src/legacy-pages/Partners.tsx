"use client";

import { Photo } from "../components/Photo";
import { useState } from "react";
import { Layout, Eyebrow } from "../components/Layout";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";

export function Partners() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data } = useContent("page.partners", cmsDefaults["page.partners"]);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">
        <div>
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] text-forest">
            {data.title}
          </h1>
          <p className="mt-5 text-lg text-charcoal/80">
            {data.bodyEn}
          </p>
          <p lang="ar" className="mt-3">
            {data.bodyAr}
          </p>
        </div>
        <div className="img-frame aspect-[4/3]">
          <Photo src={data.image.src} alt={data.image.alt} />
        </div>
      </section>
      <section className="bg-walnut py-16 text-ivory">
        <div className="mx-auto max-w-lg px-5">
          <h2 className="font-display text-4xl">{data.form.title}</h2>
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
                  const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, message, source: "partners" }) });
                  if (!response.ok) throw new Error((await response.json()).error ?? "Unable to send");
                  setSent(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to send");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <input name="name" required placeholder="Studio name" className="w-full bg-ivory px-3 py-3 text-charcoal" />
              <input name="phone" required placeholder="WhatsApp" className="w-full bg-ivory px-3 py-3 text-charcoal" />
              <textarea name="message" rows={4} placeholder="How you work with homes" className="w-full bg-ivory px-3 py-3 text-charcoal" />
              <button type="submit" disabled={submitting} className="bg-sand px-6 py-3 text-forest disabled:opacity-60">
                {submitting ? "Sending…" : data.form.button}
              </button>
              {error && <p className="text-sm text-red-200">{error}</p>}
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
