import { Consultation } from "@/src/legacy-pages/Consultation";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("الاستشارة — GHEIR / غير", "حوار مجاني، في المعرض أو عن بُعد.", "/consultation");

export default function Page() {
  return <Consultation />;
}
