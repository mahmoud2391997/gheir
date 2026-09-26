import { roomBySlug } from "@/src/data/catalog";
import { RoomDetail } from "@/src/legacy-pages/RoomDetail";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = roomBySlug(slug);
  if (!room) return pageMeta("المجموعة — GHEIR / غير", "غرف جاهزة ليها رأي: معيشة، سفرة، ونوم.", "/collection");
  return pageMeta(`${room.nameAr} — GHEIR / غير`, room.storyAr, `/collection/${room.slug}`);
}

export default function Page() {
  return <RoomDetail />;
}
