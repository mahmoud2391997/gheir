import { Khanqah } from "@/src/legacy-pages/Khanqah";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("الخانقاه — GHEIR / غير", "مكان للتجمع حول الصنعة في أتيليه الإسماعيلية.", "/khanqah");

export default function Page() {
  return <Khanqah />;
}
