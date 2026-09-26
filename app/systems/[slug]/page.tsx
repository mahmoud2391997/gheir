import { systemById } from "@/src/data/catalog";
import { SystemDetail } from "@/src/legacy-pages/SystemDetail";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = systemById(slug);
  if (!system) return pageMeta("الأنظمة — GHEIR / غير", "عائلات أثاث تتفصّل على البيت.", "/systems");
  return pageMeta(`${system.nameAr} — GHEIR / غير`, system.philosophyAr, `/systems/${system.id}`);
}

export default function Page() {
  return <SystemDetail />;
}
