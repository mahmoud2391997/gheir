import { ProductDetail } from "@/src/legacy-pages/ProductDetail";
import { jsonLdScript, pageMeta, productJsonLd } from "@/lib/seo";
import { getProduct } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return pageMeta(`${product.name} — GHEIR / غير`, product.description || "قطعة من أتيليه غير.", `/products/${product.slug}`);
  } catch {
    return pageMeta("الكتالوج — GHEIR / غير", "القطع المنشورة من مخزون الورشة.", `/products/${slug}`);
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let linked: ReturnType<typeof productJsonLd> | null = null;
  try {
    const product = await getProduct(slug);
    linked = productJsonLd({ ...product, stock: product.stock });
  } catch {
    linked = null;
  }
  return (
    <>
      {linked && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(linked) }} />}
      <ProductDetail />
    </>
  );
}
