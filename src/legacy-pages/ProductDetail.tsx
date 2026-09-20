import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { formatEGP } from "../data/catalog";
import { NotFound } from "./NotFound";
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

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const cart = useCart();
  const wishlist = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(slug ?? "")}`);
        const json = await response.json();
        if (!response.ok) {
          if (!cancelled) setProduct(null);
          return;
        }
        if (!cancelled) setProduct(json.product ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <div className="p-10 text-sm">Loading…</div>;
  if (!product) return <NotFound />;

  const image = product.imageUrl ?? (product.imageKey ? `/api/images/${product.imageKey}` : "/images/hero-alt.jpg");
  const saved = wishlist.has(product.slug);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <div className="img-frame aspect-[4/5]">
            <img src={image} alt={product.name} />
          </div>
        </div>
        <div className="lg:col-span-5 lg:pt-8">
          <Eyebrow>{product.category}</Eyebrow>
          <h1 className="mt-3 font-display text-5xl leading-none text-forest sm:text-6xl">{product.name}</h1>
          <p className="mt-6 font-display text-4xl text-walnut">{formatEGP(product.price)}</p>
          {product.description && <p className="mt-6 leading-relaxed">{product.description}</p>}
          <div className="mt-8 flex flex-col gap-2">
            <button
              type="button"
              className="bg-forest px-5 py-3 text-ivory"
              onClick={() =>
                cart.add(
                  { id: product.slug, slug: product.slug, sku: product.slug, name: product.name, image, unitPrice: product.price, currency: "EGP" },
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
                  id: product.slug,
                  kind: "product",
                  slug: product.slug,
                  sku: product.slug,
                  name: product.name,
                  image,
                  unitPrice: product.price,
                  currency: "EGP",
                })
              }
            >
              {saved ? "Remove from wishlist" : "Save to wishlist"}
            </button>
            <Link href="/products" className="text-sm text-walnut">
              Back to products
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

