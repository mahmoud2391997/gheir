"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { useLocale } from "../lib/locale";

type InquiryPreset = {
  title?: string;
  summary?: string;
};

type InquiryContextValue = {
  open: (preset?: InquiryPreset) => void;
  close: () => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [openState, setOpen] = useState(false);
  const [preset, setPreset] = useState<InquiryPreset>({});
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLocale();

  const api = useMemo(
    () => ({
      open: (next?: InquiryPreset) => {
        setPreset(next ?? {});
        setSent(false);
        setOpen(true);
      },
      close: () => setOpen(false),
    }),
    [],
  );

  return (
    <InquiryContext.Provider value={api}>
      {children}
      {openState && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-forest/70"
            aria-label="Close inquiry"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-labelledby="inquiry-title"
            className="relative w-full max-w-lg border border-sand/40 bg-ivory p-6 shadow-[0_30px_80px_rgba(43,43,43,0.28)] sm:p-8"
          >
            {sent ? (
              <div className="space-y-4">
                <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-walnut">{t.received}</p>
                <h2 id="inquiry-title" className="font-display text-4xl text-forest">
                  {t.inquiryThanks}
                </h2>
                <p className="text-charcoal/80">
                  {t.inquirySoon}
                </p>
                <button
                  type="button"
                  className="mt-4 border border-forest px-5 py-3 text-sm text-forest hover:bg-forest hover:text-ivory"
                  onClick={() => setOpen(false)}
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  setSubmitting(true);
                  try {
                    const form = e.currentTarget;
                    const data = new FormData(form);
                    const name = String(data.get("name") ?? "").trim();
                    const phone = String(data.get("phone") ?? "").trim();
                    const note = String(data.get("note") ?? "").trim();

                    const response = await fetch("/api/leads", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name,
                        phone,
                        message: note,
                        source: preset.title ? `inquiry:${preset.title}` : "inquiry",
                      }),
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
                <Logo compact />
                <p className="mt-5 font-mono text-[11px] tracking-[0.25em] uppercase text-walnut">{t.inquiry}</p>
                <h2 id="inquiry-title" className="font-display text-4xl text-forest">
                  {t.inquiryTitle}
                </h2>
                {preset.summary && (
                  <p className="border-s-2 border-walnut ps-3 text-sm text-charcoal/80">{preset.summary}</p>
                )}
                <label className="block text-sm">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-walnut">{t.name}</span>
                  <input
                    required
                    name="name"
                    className="mt-1 w-full border border-walnut/25 bg-ivory px-3 py-2.5 outline-none focus:border-forest"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-walnut">{t.whatsapp}</span>
                  <input
                    required
                    name="phone"
                    type="tel"
                    dir="ltr"
                    className="mt-1 w-full border border-walnut/25 bg-ivory px-3 py-2.5 outline-none focus:border-forest"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-walnut">{t.note}</span>
                  <textarea
                    name="note"
                    rows={4}
                    defaultValue={preset.title ? `${preset.title}\n${preset.summary ?? ""}` : ""}
                    className="mt-1 w-full border border-walnut/25 bg-ivory px-3 py-2.5 outline-none focus:border-forest"
                  />
                </label>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-forest px-5 py-3 text-sm text-ivory hover:bg-charcoal disabled:opacity-60"
                  >
                    {submitting ? t.sending : t.send}
                  </button>
                  <button
                    type="button"
                    className="px-5 py-3 text-sm text-walnut underline-offset-4 hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    {t.notNow}
                  </button>
                </div>
                {error && <p className="text-sm text-red-700">{error}</p>}
              </form>
            )}
          </div>
        </div>
      )}
    </InquiryContext.Provider>
  );
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("InquiryProvider missing");
  return ctx;
}
