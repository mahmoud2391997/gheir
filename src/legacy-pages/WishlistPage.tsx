import { Link } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
import { formatEGP } from "../data/catalog";

export function WishlistPage() {
  const wishlist = useWishlist();
  const cart = useCart();

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <Eyebrow>Wishlist</Eyebrow>
        <h1 className="mt-3 font-display text-6xl leading-[0.9] text-forest sm:text-7xl">Saved pieces</h1>
        <p className="mt-4 max-w-2xl text-charcoal/80">Save items for later, then add them to cart when you’re ready.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        {wishlist.items.length === 0 ? (
          <div className="rounded-xl border bg-[#F2EAD8] p-6">
            <p className="text-sm text-[#5C4033]">Your wishlist is empty.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/collection" className="bg-forest px-5 py-3 text-ivory">
                Browse collection
              </Link>
              <Link href="/products" className="border border-forest px-5 py-3 text-forest">
                Browse products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlist.items.map((it) => {
              const href = it.kind === "piece" ? `/piece/${it.slug}` : `/products/${it.slug}`;
              const priceLabel = typeof it.unitPrice === "number" ? formatEGP(it.unitPrice) : "";
              return (
                <div key={it.id} className="grid gap-4 rounded-xl border bg-[#F2EAD8] p-4 sm:grid-cols-[110px,1fr]">
                  <div className="img-frame aspect-[4/3]">
                    <img src={it.image ?? "/images/hero-alt.jpg"} alt={it.name} />
                  </div>
                  <div className="flex flex-col justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-walnut">{it.sku}</p>
                      <Link href={href} className="mt-1 block font-display text-2xl text-forest">
                        {it.name}
                      </Link>
                      {priceLabel && <p className="mt-1 text-sm text-charcoal/70">{priceLabel}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-forest px-3 py-2 text-sm text-ivory"
                        onClick={() =>
                          cart.add(
                            {
                              id: it.id,
                              slug: it.slug,
                              sku: it.sku,
                              name: it.name,
                              image: it.image,
                              unitPrice: Number(it.unitPrice ?? 0),
                              currency: "EGP",
                            },
                            1,
                          )
                        }
                      >
                        Add to cart
                      </button>
                      <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => wishlist.remove(it.id)}>
                        Remove
                      </button>
                      <span className="ml-auto text-xs text-[#5C4033]">{it.kind === "piece" ? "Piece" : "Product"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end">
              <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => wishlist.clear()}>
                Clear wishlist
              </button>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}

