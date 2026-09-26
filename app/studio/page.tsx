import { Studio } from "@/src/legacy-pages/Studio";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("الاستوديو — GHEIR / غير", "اطلب قطعة معمول عشان تعيش، مش عشان تتشابه.", "/studio");

export default function Page() {
  return <Studio />;
}
