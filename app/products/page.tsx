import { Products } from "@/src/legacy-pages/Products";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMeta("الكتالوج — GHEIR / غير", "القطع المنشورة من مخزون الورشة.", "/products");

export default function Page() {
  return <Products />;
}
