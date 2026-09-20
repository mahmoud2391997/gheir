import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { formatEGP } from "../data/catalog";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";

type Product = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  currency?: string;
};

export function Products() {
  const cart = useCart();
  const wishlist = useWishlist();
  const [location] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = useMemo(() => {
    const idx = location.indexOf("?");
    if (idx === -1) return "";
    const params = new URLSearchParams(location.slice(idx + 1));
    return (params.get("category") ?? "").trim();
  }, [location]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const url = category ? `/api/products?category=${encodeURIComponent(category)}` : "/api/products";
        const response = await fetch(url);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? "Unable to load products");
        if (!cancelled) setProducts(json.products ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Eyebrow>Products</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] text-forest sm:text-8xl">Catalog</h1>
        <p className="mt-5 max-w-2xl text-lg text-charcoal/80">DB-backed products with cart + wishlist actions.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        {loading ? (
          <p className="mt-6 text-sm text-charcoal/70">Loading products…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-700">{error}</p>
        ) : products.length ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const image = p.imageUrl ?? (p.imageKey ? `/api/images/${p.imageKey}` : "/images/hero-alt.jpg");
              const wish = wishlist.has(p.slug);
              return (
                <article key={p._id} className="border border-walnut/15">
                  <Link href={`/products/${p.slug}`} className="block">
                    <div className="img-frame aspect-[4/3]">
                      <img src={image} alt={p.name} />
                    </div>
                  </Link>
                  <div className="p-6">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-walnut">{p.category}</p>
                    <Link href={`/products/${p.slug}`} className="mt-1 block font-display text-3xl text-forest">
                      {p.name}
                    </Link>
                    <p className="mt-2 font-display text-2xl text-walnut">{formatEGP(p.price)}</p>
                    {p.description && <p className="mt-3 text-sm text-charcoal/70">{p.description}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="bg-forest px-4 py-2 text-sm text-ivory"
                        onClick={() =>
                          cart.add(
                            { id: p.slug, slug: p.slug, sku: p.slug, name: p.name, image, unitPrice: p.price, currency: "EGP" },
                            1,
                          )
                        }
                      >
                        Add to cart
                      </button>
                      <button
                        type="button"
                        className={`border px-4 py-2 text-sm ${wish ? "border-forest text-forest" : "border-walnut/30 text-walnut"}`}
                        onClick={() =>
                          wishlist.toggle({
                            id: p.slug,
                            kind: "product",
                            slug: p.slug,
                            sku: p.slug,
                            name: p.name,
                            image,
                            unitPrice: p.price,
                            currency: "EGP",
                          })
                        }
                      >
                        {wish ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 text-sm text-charcoal/70">No products published yet.</p>
        )}
      </section>
    </Layout>
  );
}

