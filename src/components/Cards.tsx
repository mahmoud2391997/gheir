import { Link } from "wouter";
import type { Piece, Room } from "../data/catalog";
import { formatEGP } from "../data/catalog";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
import { useLocale } from "../lib/locale";
import { Photo } from "./Photo";

export function ProductCard({ piece, large = false }: { piece: Piece; large?: boolean }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const { t, pick, locale } = useLocale();
  const saved = wishlist.has(piece.slug);
  return (
    <article className="group">
      <Link href={`/piece/${piece.slug}`} className="block">
        <figure className={`img-frame ${large ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
          <Photo src={piece.image} alt={pick(piece.name, piece.nameAr)} />
        </figure>
      </Link>
      <figcaption className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-walnut">
            {piece.sku}
            {piece.edition ? ` · ${piece.edition}` : ""}
          </p>
          <Link href={`/piece/${piece.slug}`} className="block font-display text-2xl leading-tight text-forest group-hover:text-walnut">
            {pick(piece.name, piece.nameAr)}
          </Link>
          <p lang={locale === "ar" ? "en" : "ar"} dir={locale === "ar" ? "ltr" : "rtl"} className="text-sm text-charcoal/70">
            {pick(piece.nameAr, piece.name)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="font-mono text-xs text-walnut">{t.from} {formatEGP(piece.priceFrom)}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="border border-forest px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-forest"
              onClick={() =>
                cart.add(
                  { id: piece.slug, slug: piece.slug, sku: piece.sku, name: piece.name, nameAr: piece.nameAr, image: piece.image, unitPrice: piece.priceFrom, currency: "EGP" },
                  1,
                )
              }
            >
              {t.add}
            </button>
            <button
              type="button"
              className={`border px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest ${
                saved ? "border-forest text-forest" : "border-walnut/30 text-walnut"
              }`}
              onClick={() =>
                wishlist.toggle({
                  id: piece.slug,
                  kind: "piece",
                  slug: piece.slug,
                  sku: piece.sku,
                  name: piece.name,
                  image: piece.image,
                  unitPrice: piece.priceFrom,
                  currency: "EGP",
                })
              }
            >
              {saved ? t.saved : t.save}
            </button>
          </div>
        </div>
      </figcaption>
    </article>
  );
}

export function RoomCard({ room, featured = false }: { room: Room; featured?: boolean }) {
  const { pick, locale, heading } = useLocale();
  return (
    <Link href={`/collection/${room.slug}`} className="group block">
      <div className={`img-frame ${featured ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <Photo src={room.image} alt={pick(room.name, room.nameAr)} />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-walnut">{heading(room.type)}</p>
          <h3 className="font-display text-3xl leading-none text-forest group-hover:text-walnut">{pick(room.name, room.nameAr)}</h3>
          <p lang={locale === "ar" ? "en" : "ar"} dir={locale === "ar" ? "ltr" : "rtl"} className="mt-1 text-sm">
            {pick(room.nameAr, room.name)}
          </p>
        </div>
        <p className="font-mono text-xs text-walnut">{formatEGP(room.total)}</p>
      </div>
    </Link>
  );
}
