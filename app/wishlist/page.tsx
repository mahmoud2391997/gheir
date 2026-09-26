import { WishlistPage } from "@/src/legacy-pages/WishlistPage";
import { pageMeta } from "@/lib/seo";

export const metadata = { ...pageMeta("المفضلة — GHEIR / غير", "القطع المحفوظة.", "/wishlist"), robots: { index: false, follow: false } };

export default function Page() {
  return <WishlistPage />;
}
