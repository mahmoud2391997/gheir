import { Photo } from "../components/Photo";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { useInquiry } from "../components/Inquiry";
import { ProductCard } from "../components/Cards";
import { formatEGP, pieceBySlug, systems } from "../data/catalog";
import {
  complements,
  extrasCatalog,
  fabrics,
  previewImage,
  priceOf,
  sizes,
  startingPieces,
  woods,
  type Fabric,
  type Wood,
} from "../data/configurator";

export function Design() {
  const { open } = useInquiry();
  const [systemId, setSystemId] = useState<(typeof systems)[number]["id"]>(() => {
    const q = new URLSearchParams(window.location.search).get("system");
    return systems.some((s) => s.id === q) ? (q as (typeof systems)[number]["id"]) : "saha";
  });
  const piecesForSystem = startingPieces.filter((p) => p.system === systemId);
  const [pieceId, setPieceId] = useState(piecesForSystem[0].id);
  const piece = startingPieces.find((p) => p.id === pieceId) ?? piecesForSystem[0];
  const [sizeId, setSizeId] = useState(sizes[systemId][0].id);
  const [wood, setWood] = useState<Wood>("walnut");
  const [fabric, setFabric] = useState<Fabric>("forest");
  const [extras, setExtras] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const price = useMemo(
    () =>
      priceOf({
        base: piece.base,
        system: systemId,
        sizeId,
        wood,
        fabric,
        extras,
      }),
    [piece.base, systemId, sizeId, wood, fabric, extras],
  );

  const image = previewImage(piece, wood, fabric);
  const sizeAdd = sizes[systemId].find((s) => s.id === sizeId)?.add ?? 0;
  const woodAdd = woods.find((w) => w.id === wood)?.add ?? 0;
  const fabricAdd = systemId === "sofra" || systemId === "athar" ? 0 : fabrics.find((f) => f.id === fabric)?.add ?? 0;
  const extraRows = (extrasCatalog[systemId] ?? []).filter((e) => extras.includes(e.id));
  const looks = (complements[piece.id] ?? []).map(pieceBySlug).filter(Boolean);

  const summary = `${piece.name} · ${systemId} · ${sizeId} · ${wood} · ${fabric} · extras: ${extras.join(", ") || "none"} · ${formatEGP(price)} · lead ~1 month`;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <Eyebrow>Design your own</Eyebrow>
        <h1 className="mt-3 max-w-3xl font-display text-6xl leading-[0.9] text-forest sm:text-7xl">
          Live price. Real pieces. About a month.
        </h1>
        <p className="mt-4 max-w-xl text-charcoal/75">
          Indicative — not a checkout. We confirm after conversation.
          <span lang="ar" dir="rtl" className="mt-2 inline-block">
            اختار اللي شبهك، مش اللي شبه الكل.
          </span>
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <div className="img-frame aspect-[4/3]">
            <Photo src={image} alt={`${piece.name} preview in ${wood} and ${fabric}`} />
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-walnut">
            Preview changes with wood / fabric
          </p>

          <fieldset className="mt-8">
            <legend className="font-mono text-[11px] uppercase tracking-widest text-walnut">System</legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {systems.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSystemId(s.id);
                    const next = startingPieces.find((p) => p.system === s.id)!;
                    setPieceId(next.id);
                    setSizeId(sizes[s.id][0].id);
                    setExtras([]);
                  }}
                  className={`border px-3 py-3 text-left ${
                    systemId === s.id ? "border-forest bg-forest text-ivory" : "border-walnut/25 hover:border-forest"
                  }`}
                >
                  <span className="block font-display text-2xl">{s.name}</span>
                  <span className="text-xs opacity-80">{s.nameAr}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="font-mono text-[11px] uppercase tracking-widest text-walnut">Starting piece</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {piecesForSystem.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPieceId(p.id)}
                  className={`border px-4 py-2 text-sm ${
                    pieceId === p.id ? "border-walnut bg-walnut text-ivory" : "border-walnut/25"
                  }`}
                >
                  {p.nameAr} · {p.name}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <fieldset>
              <legend className="font-mono text-[11px] uppercase tracking-widest text-walnut">Size</legend>
              <div className="mt-3 space-y-2">
                {sizes[systemId].map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center justify-between border border-walnut/15 px-3 py-2">
                    <span>
                      <input
                        type="radio"
                        className="mr-2 accent-forest"
                        checked={sizeId === s.id}
                        onChange={() => setSizeId(s.id)}
                      />
                      {s.label}
                    </span>
                    <span className="font-mono text-xs text-walnut">{s.add ? `+${formatEGP(s.add)}` : "base"}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-mono text-[11px] uppercase tracking-widest text-walnut">Wood</legend>
              <div className="mt-3 space-y-2">
                {woods.map((w) => (
                  <label key={w.id} className="flex cursor-pointer items-center justify-between border border-walnut/15 px-3 py-2">
                    <span>
                      <input
                        type="radio"
                        className="mr-2 accent-forest"
                        checked={wood === w.id}
                        onChange={() => setWood(w.id)}
                      />
                      {w.label}
                    </span>
                    <span className="font-mono text-xs text-walnut">{w.add ? `+${formatEGP(w.add)}` : "base"}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {systemId !== "sofra" && systemId !== "athar" && (
            <fieldset className="mt-8">
              <legend className="font-mono text-[11px] uppercase tracking-widest text-walnut">Fabric / finish</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {fabrics.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFabric(f.id)}
                    className={`border px-3 py-4 text-left ${fabric === f.id ? "border-forest bg-forest text-ivory" : "border-walnut/25"}`}
                  >
                    <span className="block font-display text-xl">{f.label}</span>
                    <span className="font-mono text-xs">{f.add ? `+${formatEGP(f.add)}` : "included"}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="mt-8">
            <legend className="font-mono text-[11px] uppercase tracking-widest text-walnut">Extras</legend>
            <div className="mt-3 space-y-2">
              {(extrasCatalog[systemId] ?? []).map((e) => {
                const on = extras.includes(e.id);
                return (
                  <label key={e.id} className="flex cursor-pointer items-center justify-between border border-walnut/15 px-3 py-2">
                    <span>
                      <input
                        type="checkbox"
                        className="mr-2 accent-forest"
                        checked={on}
                        onChange={() =>
                          setExtras((prev) => (on ? prev.filter((x) => x !== e.id) : [...prev, e.id]))
                        }
                      />
                      {e.label}
                    </span>
                    <span className="font-mono text-xs text-walnut">{e.add ? `+${formatEGP(e.add)}` : "included"}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 border border-walnut/20 bg-ivory p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-walnut">Indicative total</p>
            <p className="price-live mt-2 font-display text-6xl leading-none text-forest">{formatEGP(price)}</p>
            <p className="mt-2 text-sm text-charcoal/70">Lead time ~ one month. Not a warehouse stock pick.</p>
            <dl className="mt-6 space-y-2 border-t border-walnut/15 pt-4 font-mono text-xs text-charcoal/80">
              <div className="flex justify-between">
                <dt>Base · {piece.name}</dt>
                <dd>{formatEGP(piece.base)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Size</dt>
                <dd>{formatEGP(sizeAdd)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Wood · {wood}</dt>
                <dd>{formatEGP(woodAdd)}</dd>
              </div>
              {fabricAdd > 0 && (
                <div className="flex justify-between">
                  <dt>Fabric · {fabric}</dt>
                  <dd>{formatEGP(fabricAdd)}</dd>
                </div>
              )}
              {extraRows.map((e) => (
                <div key={e.id} className="flex justify-between">
                  <dt>{e.label}</dt>
                  <dd>{formatEGP(e.add)}</dd>
                </div>
              ))}
            </dl>
            {sent ? (
              <p className="mt-6 border-l-2 border-forest pl-3 text-sm">
                Configuration received. We’ll continue on WhatsApp.
              </p>
            ) : (
              <form
                className="mt-6 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <input required placeholder="Name" className="w-full border border-walnut/25 bg-ivory px-3 py-2 text-sm" />
                <input required placeholder="WhatsApp" className="w-full border border-walnut/25 bg-ivory px-3 py-2 text-sm" />
                <button type="submit" className="w-full bg-forest py-3 text-sm text-ivory hover:bg-charcoal">
                  Submit this configuration
                </button>
              </form>
            )}
            <button
              type="button"
              className="mt-3 w-full border border-walnut/30 py-3 text-sm"
              onClick={() => open({ title: piece.name, summary })}
            >
              Inquire with this summary
            </button>
          </div>
        </aside>
      </div>

      <section className="border-t border-walnut/15 bg-ivory-deep/30 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Eyebrow>See the look</Eyebrow>
          <h2 className="mt-2 font-display text-4xl text-forest">Complete the room — consultative, not pushy.</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {looks.map(
              (p) =>
                p && (
                  <ProductCard key={p.slug} piece={p} />
                ),
            )}
          </div>
          <Link href="/visualization" className="mt-8 inline-block text-sm text-walnut underline-offset-4 hover:underline">
            More compositions
          </Link>
        </div>
      </section>
    </Layout>
  );
}
