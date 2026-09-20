import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type WishlistItem = {
  id: string; // stable id (piece slug or product slug)
  kind: "piece" | "product";
  slug: string;
  sku: string;
  name: string;
  image?: string;
  unitPrice?: number;
  currency?: "EGP";
};

type WishlistState = { items: WishlistItem[] };

type WishlistApi = {
  items: WishlistItem[];
  count: number;
  has: (id: string) => boolean;
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  clear: () => void;
};

const STORAGE_KEY = "gher_wishlist_v1";
const WishlistContext = createContext<WishlistApi | null>(null);

function readWishlist(): WishlistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as WishlistState;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return { items: parsed.items.filter(Boolean) };
  } catch {
    return { items: [] };
  }
}

function writeWishlist(state: WishlistState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WishlistState>({ items: [] });

  useEffect(() => {
    setState(readWishlist());
  }, []);

  useEffect(() => {
    writeWishlist(state);
  }, [state]);

  const api = useMemo<WishlistApi>(() => {
    const ids = new Set(state.items.map((i) => i.id));
    return {
      items: state.items,
      count: state.items.length,
      has: (id) => ids.has(id),
      add: (item) =>
        setState((s) => {
          if (s.items.some((i) => i.id === item.id)) return s;
          return { items: [item, ...s.items] };
        }),
      remove: (id) => setState((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggle: (item) =>
        setState((s) => {
          const exists = s.items.some((i) => i.id === item.id);
          return exists ? { items: s.items.filter((i) => i.id !== item.id) } : { items: [item, ...s.items] };
        }),
      clear: () => setState({ items: [] }),
    };
  }, [state.items]);

  return <WishlistContext.Provider value={api}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("WishlistProvider missing");
  return ctx;
}

