import { Design } from "@/src/legacy-pages/Design";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("التصميم — GHEIR / غير", "فصّل القطعة على بيتك وشوف سعرًا استرشاديًا وأنت بتختار.", "/design");

export default function Page() {
  return <Design />;
}
