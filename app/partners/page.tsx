import { Partners } from "@/src/legacy-pages/Partners";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("الشركاء — GHEIR / غير", "للمصممين والاستوديوهات اللي عايزين شريك بأسلوب البيت.", "/partners");

export default function Page() {
  return <Partners />;
}
