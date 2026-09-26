"use client";

import { Photo } from "../components/Photo";
import { Link, useParams } from "../lib/router";
import { Layout, Eyebrow } from "../components/Layout";
import { ProductCard } from "../components/Cards";
import { formatEGP, pieceBySlug, roomBySlug } from "../data/catalog";
import { NotFound } from "./NotFound";
import { useInquiry } from "../components/Inquiry";
import { summedLivePrice, useLivePrices } from "../lib/useLivePrices";

export function RoomDetail() {
  const { slug } = useParams<{ slug: string }>();
  const room = roomBySlug(slug ?? "");
  const { open } = useInquiry();
  const live = useLivePrices();
  if (!room) return <NotFound />;
  const items = room.pieces.flatMap((slug) => {
    const piece = pieceBySlug(slug);
    return piece ? [piece] : [];
  });

  return (
    <Layout>
      <section className="relative min-h-[75vh] bg-charcoal text-ivory">
        <Photo src={room.image} alt={room.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/45 to-transparent" />
        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl flex-col justify-end px-5 pb-12 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-sand">{room.type}</p>
          <h1 className="mt-2 font-display text-6xl leading-none sm:text-8xl">{room.name}</h1>
          <p lang="ar" className="mt-2 max-w-xl text-xl text-ivory">
            {room.nameAr}
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <Eyebrow>The story</Eyebrow>
          <p className="mt-4 text-2xl leading-snug text-forest">{room.story}</p>
          <p lang="ar" className="mt-4 max-w-2xl text-lg text-charcoal/80">
            {room.storyAr}
          </p>
        </div>
        <aside className="lg:col-span-5 border border-walnut/20 p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-walnut">Indicative total</p>
          {summedLivePrice(live, items.map((piece) => piece.sku)) != null && (
            <p className="mt-2 font-display text-5xl text-forest">{formatEGP(summedLivePrice(live, items.map((piece) => piece.sku)) as number)}</p>
          )}
          <p className="mt-2 text-sm text-charcoal/70">Pieces priced as starting points. Customization follows.</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/design" className="bg-forest px-4 py-3 text-center text-sm font-medium text-ivory">
              Design this room
            </Link>
            <button type="button" className="border border-forest px-4 py-3 text-sm" onClick={() => open({ title: room.name })}>
              Book consultation
            </button>
            <Link href="/showroom" className="px-4 py-3 text-center text-sm text-walnut">
              Visit showroom
            </Link>
          </div>
        </aside>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <h2 className="font-display text-4xl text-forest">Pieces in the room</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => p && <ProductCard key={p.slug} piece={p} />)}
        </div>
      </section>
    </Layout>
  );
}
