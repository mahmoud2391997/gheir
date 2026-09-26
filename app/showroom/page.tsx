import { Showroom } from "@/src/legacy-pages/Showroom";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("المعرض — GHEIR / غير", "صينية فوكس، الإسماعيلية. تعالى لما القطع تحتاج تتلمس.", "/showroom");

export default function Page() {
  return <Showroom />;
}
