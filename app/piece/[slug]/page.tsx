import { pieceBySlug } from "@/src/data/catalog";
import { PieceDetail } from "@/src/legacy-pages/PieceDetail";
import { jsonLdScript, pageMeta, productJsonLd } from "@/lib/seo";
import { getPublishedBySku } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = pieceBySlug(slug);
  if (!piece) return pageMeta("GHEIR / غير", "أتيليه أثاث مصنوع بالإيد في الإسماعيلية.", `/piece/${slug}`);
  return pageMeta(`${piece.nameAr} — GHEIR / غير`, piece.storyAr, `/piece/${piece.slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = pieceBySlug(slug);
  let product: Awaited<ReturnType<typeof getPublishedBySku>> = null;
  if (piece) {
    try {
      product = await getPublishedBySku(piece.sku);
    } catch {
      product = null;
    }
  }
  const linked =
    product && piece
      ? productJsonLd({
          name: product.name,
          description: product.description,
          slug: piece.slug,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl || piece.image,
          imageKey: product.imageKey,
          path: `/piece/${piece.slug}`,
        })
      : null;
  return (
    <>
      {linked && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(linked) }} />}
      <PieceDetail />
    </>
  );
}
