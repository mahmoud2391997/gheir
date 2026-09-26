import { Visualization } from "@/src/legacy-pages/Visualization";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("التصور — GHEIR / غير", "شوف الغرفة قبل ما تتعمل — تكوينات، مش صور فاضية.", "/visualization");

export default function Page() {
  return <Visualization />;
}
