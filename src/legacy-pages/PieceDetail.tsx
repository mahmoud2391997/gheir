import { Link, useParams } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { formatEGP, pieceBySlug, pieces, systemById } from "../data/catalog";
import { NotFound } from "./NotFound";
import { useInquiry } from "../components/Inquiry";
import { ProductCard } from "../components/Cards";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";

export function PieceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const piece = pieceBySlug(slug ?? "");
  const { open } = useInquiry();
  const cart = useCart();
  const wishlist = useWishlist();
  if (!piece) return <NotFound />;
  const system = systemById(piece.system);
  const related = pieces.filter((p) => p.system === piece.system && p.slug !== piece.slug).slice(0, 3);
  const saved = wishlist.has(piece.slug);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <div className="img-frame aspect-[4/5]">
            <img src={piece.image} alt={piece.name} />
          </div>
        </div>
        <div className="lg:col-span-5 lg:pt-8">
          <Eyebrow>
            {piece.sku}
            {piece.edition ? ` · ${piece.edition}` : ""}
          </Eyebrow>
          <h1 className="mt-3 font-display text-5xl leading-none text-forest sm:text-6xl">{piece.name}</h1>
          <p lang="ar" className="mt-2 text-xl">
            {piece.nameAr}
          </p>
          <p className="mt-6 font-display text-4xl text-walnut">from {formatEGP(piece.priceFrom)}</p>
          <p className="mt-6 leading-relaxed">{piece.story}</p>
          <p lang="ar" className="mt-3">
            {piece.storyAr}
          </p>
          <div className="mt-8 border-t border-walnut/20 pt-6">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-walnut">Making</h2>
            <p className="mt-2">{piece.making}</p>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <button
              type="button"
              className="bg-forest px-5 py-3 text-ivory"
              onClick={() => open({ title: piece.name, summary: `${piece.sku} from ${formatEGP(piece.priceFrom)}` })}
            >
              Inquire
            </button>
            <button
              type="button"
              className="border border-forest px-5 py-3 text-center"
              onClick={() =>
                cart.add(
                  { id: piece.slug, slug: piece.slug, sku: piece.sku, name: piece.name, nameAr: piece.nameAr, image: piece.image, unitPrice: piece.priceFrom, currency: "EGP" },
                  1,
                )
              }
            >
              Add to cart
            </button>
            <button
              type="button"
              className="border border-forest px-5 py-3 text-center"
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
              {saved ? "Remove from wishlist" : "Save to wishlist"}
            </button>
            <Link href="/design" className="border border-forest px-5 py-3 text-center">
              Configure
            </Link>
            {system && (
              <Link href={`/systems/${system.id}`} className="text-sm text-walnut">
                System {system.name}
              </Link>
            )}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <h2 className="font-display text-3xl text-forest">Alongside</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} piece={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
