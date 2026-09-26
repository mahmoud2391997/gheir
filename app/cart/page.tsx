import { CartPage } from "@/src/legacy-pages/CartPage";
import { pageMeta } from "@/lib/seo";

export const metadata = { ...pageMeta("السلة — GHEIR / غير", "طلب شراء من أتيليه غير.", "/cart"), robots: { index: false, follow: false } };

export default function Page() {
  return <CartPage />;
}
