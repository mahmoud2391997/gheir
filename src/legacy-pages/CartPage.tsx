import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Layout, Eyebrow } from "../components/Layout";
import { useCart } from "../lib/cart";
import { formatEGP } from "../data/catalog";

type OrderPayload = {
  customer: { name: string; phone: string; email?: string; address?: string };
  items: { id: string; slug: string; sku: string; name: string; image?: string; unitPrice: number; quantity: number; currency: "EGP" }[];
};

export function CartPage() {
  const cart = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [orderId, setOrderId] = useState<string>("");

  const canCheckout = cart.items.length > 0 && name.trim() && phone.trim() && status !== "submitting";

  const payload = useMemo<OrderPayload>(
    () => ({
      customer: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, address: address.trim() || undefined },
      items: cart.items.map((i) => ({ id: i.id, slug: i.slug, sku: i.sku, name: i.name, image: i.image, unitPrice: i.unitPrice, quantity: i.quantity, currency: i.currency })),
    }),
    [address, cart.items, email, name, phone],
  );

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <Eyebrow>Cart</Eyebrow>
        <h1 className="mt-3 font-display text-6xl leading-[0.9] text-forest sm:text-7xl">Your pieces</h1>
        <p className="mt-4 max-w-2xl text-charcoal/80">
          This is a request-to-order checkout. We’ll confirm details on WhatsApp before production.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          {cart.items.length === 0 ? (
            <div className="rounded-xl border bg-[#F2EAD8] p-6">
              <p className="text-sm text-[#5C4033]">Your cart is empty.</p>
              <Link href="/collection" className="mt-4 inline-block bg-forest px-5 py-3 text-ivory">
                Browse collection
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((it) => (
                <div key={it.id} className="grid gap-4 rounded-xl border bg-[#F2EAD8] p-4 sm:grid-cols-[110px,1fr]">
                  <div className="img-frame aspect-[4/3]">
                    <img src={it.image ?? "/images/hero-alt.jpg"} alt={it.name} />
                  </div>
                  <div className="flex flex-col justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-walnut">{it.sku}</p>
                      <p className="mt-1 font-display text-2xl text-forest">{it.name}</p>
                      <p className="mt-1 text-sm text-charcoal/70">Unit: {formatEGP(it.unitPrice)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-xs text-[#5C4033]">
                        Qty
                        <input
                          type="number"
                          min={1}
                          className="ml-2 w-20 rounded-lg border p-2 text-sm"
                          value={it.quantity}
                          onChange={(e) => cart.setQty(it.id, Number(e.target.value))}
                        />
                      </label>
                      <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => cart.remove(it.id)}>
                        Remove
                      </button>
                      <span className="ml-auto font-mono text-xs text-walnut">
                        {formatEGP(it.unitPrice * it.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-xl border bg-[#F2EAD8] p-4">
                <span className="text-sm text-[#5C4033]">Subtotal</span>
                <strong className="font-display text-2xl text-forest">{formatEGP(cart.subtotal)}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl border bg-[#F2EAD8] p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-walnut">Checkout</p>
            {status === "success" ? (
              <div className="mt-4 space-y-3">
                <p className="font-display text-3xl text-forest">Order received.</p>
                <p className="text-sm text-charcoal/70">
                  Order id: <span className="font-mono">{orderId}</span>
                </p>
                <button type="button" className="bg-forest px-5 py-3 text-ivory" onClick={() => { cart.clear(); }}>
                  Clear cart
                </button>
              </div>
            ) : (
              <form
                className="mt-4 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  if (!canCheckout) return;
                  setStatus("submitting");
                  try {
                    const response = await fetch("/api/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    const json = await response.json();
                    if (!response.ok) throw new Error(json.error ?? "Unable to place order");
                    setOrderId(String(json.orderId ?? ""));
                    setStatus("success");
                  } catch (err) {
                    setStatus("idle");
                    setError(err instanceof Error ? err.message : "Unable to place order");
                  }
                }}
              >
                <input className="w-full rounded-lg border p-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input className="w-full rounded-lg border p-3" placeholder="WhatsApp / phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <input className="w-full rounded-lg border p-3" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
                <textarea className="w-full rounded-lg border p-3" rows={4} placeholder="Address / notes (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
                <button disabled={!canCheckout} className="w-full bg-forest px-5 py-3 text-ivory disabled:opacity-60" type="submit">
                  {status === "submitting" ? "Placing order…" : "Place order"}
                </button>
                {error && <p className="text-sm text-red-700">{error}</p>}
                <p className="text-xs text-[#5C4033]">
                  You’ll get a WhatsApp confirmation before making starts.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

