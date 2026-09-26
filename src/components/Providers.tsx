"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { InquiryProvider } from "./Inquiry";
import { LocaleProvider } from "../lib/locale";
import { DocumentHead } from "./DocumentHead";
import { CartProvider } from "../lib/cart";
import { WishlistProvider } from "../lib/wishlist";
import { ErrorBoundary } from "./ErrorBoundary";
import { useLocation } from "../lib/router";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <LocaleProvider>
          <WishlistProvider>
            <CartProvider>
              <InquiryProvider>
                <ScrollToTop />
                <DocumentHead />
                {children}
                <Analytics />
              </InquiryProvider>
            </CartProvider>
          </WishlistProvider>
        </LocaleProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
