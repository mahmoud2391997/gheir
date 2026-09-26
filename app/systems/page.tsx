import { Systems } from "@/src/legacy-pages/Systems";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("الأنظمة — GHEIR / غير", "ساحة، سفرة، ليل، وأثر. عائلات أثاث تتفصّل على البيت.", "/systems");

export default function Page() {
  return <Systems />;
}
