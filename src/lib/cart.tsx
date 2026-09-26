"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string; // slug or sku
  slug: string;
  sku: string;
  name: string;
  nameAr?: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  currency: "EGP";
};

type CartState = {
  items: CartItem[];
};

type CartApi = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "gher_cart_v1";
const CartContext = createContext<CartApi | null>(null);

function readCart(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return { items: parsed.items.filter(Boolean) };
  } catch {
    return { items: [] };
  }
}

function writeCart(state: CartState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [] });

  useEffect(() => {
    setState(readCart());
  }, []);

  useEffect(() => {
    writeCart(state);
  }, [state]);

  const api = useMemo<CartApi>(() => {
    const subtotal = state.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const count = state.items.reduce((sum, it) => sum + it.quantity, 0);
    return {
      items: state.items,
      subtotal,
      count,
      add: (item, quantity = 1) =>
        setState((s) => {
          const idx = s.items.findIndex((i) => i.id === item.id);
          if (idx === -1) return { items: [...s.items, { ...item, quantity }] };
          const next = s.items.slice();
          next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
          return { items: next };
        }),
      remove: (id) => setState((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, quantity) =>
        setState((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.floor(quantity || 1)) } : i))
            .filter(Boolean),
        })),
      clear: () => setState({ items: [] }),
    };
  }, [state.items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("CartProvider missing");
  return ctx;
}

