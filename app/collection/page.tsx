import { Collection } from "@/src/legacy-pages/Collection";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("المجموعة — GHEIR / غير", "غرف جاهزة ليها رأي: معيشة، سفرة، ونوم.", "/collection");

export default function Page() {
  return <Collection />;
}
