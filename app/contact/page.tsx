import { Contact } from "@/src/legacy-pages/Contact";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("تواصل — GHEIR / غير", "حوار على واتساب. المعرض في الإسماعيلية، الخميس للسبت بموعد.", "/contact");

export default function Page() {
  return <Contact />;
}
