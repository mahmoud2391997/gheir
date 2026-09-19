import { Link } from "wouter";
import type { Piece, Room } from "../data/catalog";
import { formatEGP } from "../data/catalog";

export function ProductCard({ piece, large = false }: { piece: Piece; large?: boolean }) {
  return (
    <Link href={`/piece/${piece.slug}`} className="group block">
      <figure className={`img-frame ${large ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
        <img src={piece.image} alt={`${piece.name} — ${piece.nameAr}`} />
      </figure>
      <figcaption className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-walnut">
            {piece.sku}
            {piece.edition ? ` · ${piece.edition}` : ""}
          </p>
          <h3 className="font-display text-2xl leading-tight text-forest group-hover:text-walnut">
            {piece.name}
          </h3>
          <p lang="ar" className="text-sm text-charcoal/70">
            {piece.nameAr}
          </p>
        </div>
        <p className="font-mono text-xs text-walnut">from {formatEGP(piece.priceFrom)}</p>
      </figcaption>
    </Link>
  );
}

export function RoomCard({ room, featured = false }: { room: Room; featured?: boolean }) {
  return (
    <Link href={`/collection/${room.slug}`} className="group block">
      <div className={`img-frame ${featured ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <img src={room.image} alt={`${room.name} ${room.type} room`} />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-walnut">{room.type}</p>
          <h3 className="font-display text-3xl leading-none text-forest group-hover:text-walnut">{room.name}</h3>
          <p lang="ar" className="mt-1 text-sm">
            {room.nameAr}
          </p>
        </div>
        <p className="font-mono text-xs text-walnut">{formatEGP(room.total)}</p>
      </div>
    </Link>
  );
}
