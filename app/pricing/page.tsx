import { Pricing } from "@/src/legacy-pages/Pricing";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMeta("القيمة — GHEIR / غير", "دليل قيمة للورشة. مش باقات، ومش مسرح فخامة.", "/pricing");

export default function Page() {
  return <Pricing />;
}
