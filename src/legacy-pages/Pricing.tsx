"use client";

import { Photo } from "../components/Photo";
import { Link } from "../lib/router";
import { Layout, Eyebrow } from "../components/Layout";
import { formatEGP } from "../data/catalog";
import { useContent } from "../lib/useContent";
import { cmsDefaults } from "../cms/defaults";
import { useEffect, useState } from "react";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
import { readError } from "../lib/read-error";

export function Pricing() {
  const { data } = useContent("page.pricing", cmsDefaults["page.pricing"]);
  const cart = useCart();
  const wishlist = useWishlist();
  const [products, setProducts] = useState<{ _id: string; name: string; slug: string; sku?: string; category: string; price: number; description?: string; imageUrl?: string; imageKey?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const response = await fetch(`/api/products?category=${encodeURIComponent(data.productCategory)}`);
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(readError(json, "Unable to load products"));
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
  }, [data.productCategory]);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-4xl font-display text-6xl leading-[0.9] text-forest sm:text-8xl">
          {data.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-charcoal/80">
          {data.body}
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <h2 className="font-display text-4xl text-forest">{data.productsTitle}</h2>
        {loading ? (
          <p className="mt-6 text-sm text-charcoal/70">Loading products…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-700">{error}</p>
        ) : products.length ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {products.map((p, i) => (
              <article key={p._id} className={`border border-walnut/15 ${i === 1 ? "lg:col-span-2" : ""}`}>
                <div className={`img-frame ${i === 1 ? "aspect-[16/7]" : "aspect-[16/9]"}`}>
                  <Photo src={p.imageUrl ?? (p.imageKey ? `/api/images/${p.imageKey}` : "/images/hero-alt.jpg")} alt={p.name} />
                </div>
                <div className="p-6">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-walnut">{p.category}</p>
                  <Link href={`/products/${p.slug}`} className="mt-1 block font-display text-4xl text-forest">
                    {p.name}
                  </Link>
                  <p className="mt-2 font-display text-3xl text-walnut">{formatEGP(p.price)}</p>
                  {p.description && <p className="mt-3 text-sm text-charcoal/70">{p.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="bg-forest px-4 py-2 text-sm text-ivory"
                      onClick={() =>
                        cart.add(
                          {
                            id: p.slug,
                            slug: p.slug,
                            sku: (p.sku ?? p.slug).trim(),
                            name: p.name,
                            image: p.imageUrl ?? (p.imageKey ? `/api/images/${p.imageKey}` : "/images/hero-alt.jpg"),
                            unitPrice: p.price,
                            currency: "EGP",
                          },
                          1,
                        )
                      }
                    >
                      Add to cart
                    </button>
                    <button
                      type="button"
                      className={`border px-4 py-2 text-sm ${
                        wishlist.has(p.slug) ? "border-forest text-forest" : "border-walnut/30 text-walnut"
                      }`}
                      onClick={() =>
                        wishlist.toggle({
                          id: p.slug,
                          kind: "product",
                          slug: p.slug,
                          sku: (p.sku ?? p.slug).trim(),
                          name: p.name,
                          image: p.imageUrl ?? (p.imageKey ? `/api/images/${p.imageKey}` : "/images/hero-alt.jpg"),
                          unitPrice: p.price,
                          currency: "EGP",
                        })
                      }
                    >
                      {wishlist.has(p.slug) ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-charcoal/70">No products published yet.</p>
        )}
        <p className="mt-10 max-w-xl text-charcoal/75">
          {data.footerNote}
        </p>
        <Link href={data.cta.href} className="mt-6 inline-block bg-forest px-6 py-3 text-ivory">
          {data.cta.label}
        </Link>
      </section>
    </Layout>
  );
}
