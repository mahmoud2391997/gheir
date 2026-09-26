import { useEffect, useState } from "react";

export type LivePrice = { price: number };

/**
 * Published Mongo prices keyed by SKU. The POS and /admin write this collection.
 * A failed fetch leaves the map empty so pages keep the static catalog price.
 */
export function useLivePrices() {
  const [bySku, setBySku] = useState<Record<string, LivePrice>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) return;
        const json = await response.json();
        if (cancelled || !Array.isArray(json.products)) return;
        const next: Record<string, LivePrice> = {};
        for (const product of json.products) {
          const sku = typeof product?.sku === "string" ? product.sku.trim() : "";
          const price = Number(product?.price);
          if (!sku || !Number.isFinite(price)) continue;
          next[sku] = { price };
        }
        setBySku(next);
      } catch {
        /* static catalog stays visible */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return bySku;
}
