import type { Metadata } from "next";

export const SITE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://gheir.vercel.app";
export const OG_IMAGE = `${SITE}/images/hero-room.jpg`;

export function pageMeta(title: string, description: string, path: string): Metadata {
  const url = `${SITE}${path === "/" ? "/" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "GHEIR / غير",
      url,
      title,
      description,
      locale: "ar_EG",
      alternateLocale: ["en_US"],
      images: [{ url: OG_IMAGE }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}

export function productJsonLd(product: { name: string; description?: string; slug: string; sku?: string; price: number; stock?: number; imageUrl?: string; imageKey?: string; path?: string }) {
  const path = product.path || `/products/${product.slug}`;
  const image = product.imageUrl || (product.imageKey ? `${SITE}/api/images/${product.imageKey}` : OG_IMAGE);
  const availability = typeof product.stock === "number" && product.stock <= 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image,
    url: `${SITE}${path}`,
    brand: { "@type": "Brand", name: "GHEIR" },
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: product.price,
      availability,
      url: `${SITE}${path}`,
    },
  };
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
