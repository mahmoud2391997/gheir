import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { cmsDefaults, type CmsKey } from "../cms/defaults";

type Product = { _id: string; name: string; category: string; price: number; stock: number; status: string; imageKey?: string };
type Lead = { _id: string; name: string; company?: string; email?: string; phone?: string; source: string; status: string; score?: number; message?: string; notes?: string };
type Order = {
  _id: string;
  status: "new" | "confirmed" | "in_progress" | "delivered" | "cancelled";
  currency: string;
  subtotal: number;
  customer: { name: string; phone: string; email?: string; address?: string };
  items: { sku: string; name: string; unitPrice: number; quantity: number }[];
  createdAt?: string;
};

const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export function AdminPanel() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"overview" | "products" | "leads" | "orders" | "content">("overview");

  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [error, setError] = useState("");
  const [newProductName, setNewProductName] = useState("");

  const [contentKeys, setContentKeys] = useState<string[]>([]);
  const [contentKey, setContentKey] = useState<CmsKey>("site.footer");
  const [contentDraft, setContentDraft] = useState("{\n  \n}");
  const [contentStatus, setContentStatus] = useState("");
  const [customKey, setCustomKey] = useState("");
  const definedKeys = Object.keys(cmsDefaults) as CmsKey[];

  const load = async () => {
    const me = await fetch("/api/admin/me", { credentials: "include" });
    setAuthed(me.ok);
    if (!me.ok) return;
    const [p, l, o, c] = await Promise.all([
      fetch("/api/admin/products", { credentials: "include" }),
      fetch("/api/admin/leads", { credentials: "include" }),
      fetch("/api/admin/orders", { credentials: "include" }),
      fetch("/api/admin/content", { credentials: "include" }),
    ]);
    setProducts((await p.json()).products ?? []);
    setLeads((await l.json()).leads ?? []);
    setOrders((await o.json()).orders ?? []);
    setContentKeys((await c.json()).keys ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!authed) return;
    void (async () => {
      try {
        setContentStatus("");
        const response = await fetch(`/api/admin/content/${encodeURIComponent(contentKey)}`, { credentials: "include" });
        if (response.status === 404) return setContentDraft(JSON.stringify(cmsDefaults[contentKey], null, 2));
        const json = await response.json();
        setContentDraft(JSON.stringify(json.data ?? cmsDefaults[contentKey], null, 2));
      } catch (e) {
        setContentStatus(e instanceof Error ? e.message : "Unable to load content");
      }
    })();
  }, [authed, contentKey]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) return setError("Invalid credentials");
    await load();
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const response = await fetch("/api/admin/products", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProductName, category: "New collection", price: 0, stock: 0 }),
    });
    if (!response.ok) return setError((await response.json()).error);
    setNewProductName("");
    await load();
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    setError("");
    const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error((await response.json()).error ?? "Unable to update order");
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
  };

  const saveContent = async () => {
    try {
      setContentStatus("");
      const data = JSON.parse(contentDraft);
      const response = await fetch(`/api/admin/content/${encodeURIComponent(contentKey)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Unable to save");
      setContentStatus("Saved.");
      if (!contentKeys.includes(contentKey)) setContentKeys((prev) => [...prev, contentKey].sort());
    } catch (e) {
      setContentStatus(e instanceof Error ? e.message : "Unable to save");
    }
  };

  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const pipeline = leads.reduce((sum, lead) => sum + (lead.score ?? 0) * 1000, 0);

  if (authed === null) return <div className="p-10 text-sm">Loading admin…</div>;

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F2EAD8] p-6">
        <form onSubmit={login} className="w-full max-w-sm rounded-2xl border border-[#e5e3dc] bg-[#F2EAD8] p-8">
          <div className="flex justify-center">
            <Logo compact />
          </div>
          <h1 className="mt-8 text-2xl font-semibold">Admin sign in</h1>
          <p className="mt-2 text-sm text-[#5C4033]">Manage the GHEIR studio workspace.</p>
          <input className="mt-7 w-full rounded-lg border p-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="mt-3 w-full rounded-lg border p-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="mt-5 w-full rounded-lg bg-[#2F3E34] p-3 font-medium text-white">Sign in</button>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EAD8] text-[#2B2B2B]">
      <aside className="fixed inset-y-0 hidden w-64 border-r bg-[#F2EAD8] p-5 lg:block">
        <Logo compact />
        <nav className="mt-10 flex flex-col gap-2">
          {(["overview", "products", "leads", "orders", "content"] as const).map((item) => (
            <button key={item} className={`rounded-lg p-3 text-left capitalize ${tab === item ? "bg-[#2F3E34] text-white" : ""}`} onClick={() => setTab(item)} type="button">
              {item === "leads" ? "Leads & inquiries" : item === "content" ? "CMS" : item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-64">
        <header className="flex justify-between border-b bg-[#F2EAD8] p-6">
          <h1 className="text-xl font-semibold">
            {tab === "overview" ? "Good morning" : tab === "products" ? "Products" : tab === "leads" ? "Leads & inquiries" : tab === "orders" ? "Orders" : "CMS"}
          </h1>
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
              setAuthed(false);
            }}
            className="text-sm"
            type="button"
          >
            Sign out
          </button>
        </header>

        <section className="mx-auto max-w-6xl p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-[#F2EAD8] p-5">
              <p className="text-sm text-[#5C4033]">Products</p>
              <strong className="text-3xl">{products.length}</strong>
            </div>
            <div className="rounded-xl border bg-[#F2EAD8] p-5">
              <p className="text-sm text-[#5C4033]">New leads</p>
              <strong className="text-3xl">{newLeads}</strong>
            </div>
            <div className="rounded-xl border bg-[#F2EAD8] p-5">
              <p className="text-sm text-[#5C4033]">Orders</p>
              <strong className="text-3xl">{orders.length}</strong>
            </div>
          </div>

          {tab === "products" && (
            <>
              <form onSubmit={addProduct} className="my-8 flex gap-3">
                <input className="w-full rounded-lg border p-3" placeholder="Product name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required />
                <button className="rounded-lg bg-[#2F3E34] px-4 text-white">Add product</button>
              </form>
              <div className="mt-8 rounded-xl border bg-[#F2EAD8] p-5">
                {products.length ? (
                  products.map((p) => (
                    <div className="flex justify-between border-b py-4" key={p._id}>
                      <span>
                        {p.name} <small className="text-[#5C4033]">{p.category}</small>
                      </span>
                      <span>
                        {money(p.price)} · {p.stock} in stock
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-[#5C4033]">No products yet.</p>
                )}
              </div>
            </>
          )}

          {tab === "leads" && (
            <div className="mt-8 rounded-xl border bg-[#F2EAD8] p-5">
              {leads.length ? (
                leads.map((lead) => (
                  <div className="border-b py-4" key={lead._id}>
                    <div className="flex justify-between gap-4">
                      <span>
                        {lead.name} <small className="text-[#5C4033]">{lead.email ?? lead.phone ?? ""}</small>
                      </span>
                      <span className="capitalize">{lead.status}</span>
                    </div>
                    {(lead.message || lead.notes) && <p className="mt-2 text-sm text-[#5C4033]">{lead.message ?? lead.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-[#5C4033]">No leads yet.</p>
              )}
            </div>
          )}

          {tab === "orders" && (
            <div className="my-8 space-y-3">
              {orders.length ? (
                orders.map((o) => (
                  <div key={o._id} className="rounded-xl border bg-[#F2EAD8] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-2xl text-forest">{o.customer?.name}</p>
                        <p className="text-sm text-[#5C4033]">
                          {o.customer?.phone}
                          {o.customer?.email ? ` · ${o.customer.email}` : ""}
                        </p>
                        <p className="font-mono text-xs text-[#5C4033]">{o._id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-display text-2xl text-walnut">{money(o.subtotal)}</p>
                        <select
                          className="rounded-lg border p-2 text-sm"
                          value={o.status}
                          onChange={async (e) => {
                            try {
                              await updateOrderStatus(o._id, e.target.value as Order["status"]);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Unable to update order");
                            }
                          }}
                        >
                          <option value="new">new</option>
                          <option value="confirmed">confirmed</option>
                          <option value="in_progress">in_progress</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {(o.items ?? []).map((it, idx) => (
                        <div key={`${o._id}.${idx}`} className="flex justify-between text-sm">
                          <span className="text-[#2B2B2B]">
                            {it.quantity}× {it.name} <span className="text-[#5C4033]">({it.sku})</span>
                          </span>
                          <span className="text-[#5C4033]">{money(it.unitPrice * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    {o.customer?.address && <p className="mt-4 text-sm text-[#5C4033]">Address/notes: {o.customer.address}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#5C4033]">No orders yet.</p>
              )}
              <p className="text-sm text-[#5C4033]">Orders are created from the cart checkout. Update status here.</p>
            </div>
          )}

          {tab === "content" && (
            <div className="my-8 grid gap-4 lg:grid-cols-[280px,1fr]">
              <div className="rounded-xl border bg-[#F2EAD8] p-4">
                <p className="text-sm font-medium">Pages & site sections</p>
                <div className="mt-3 max-h-[520px] overflow-auto space-y-1">
                  {definedKeys.map((k) => (
                    <button key={k} type="button" onClick={() => setContentKey(k)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${k === contentKey ? "bg-[#2F3E34] text-white" : "hover:bg-black/5"}`}>
                      {k}
                      {!contentKeys.includes(k) && <span className="ml-2 text-xs opacity-80">(default)</span>}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-[#5C4033]">Advanced: open any key</p>
                <div className="mt-2 flex gap-2">
                  <input className="w-full rounded-lg border p-2 text-sm" placeholder="custom key" value={customKey} onChange={(e) => setCustomKey(e.target.value)} />
                  <button
                    className="rounded-lg bg-[#2F3E34] px-3 text-sm text-white"
                    type="button"
                    onClick={() => {
                      const k = customKey.trim() as CmsKey;
                      if (!k) return;
                      setContentKey(k);
                      setCustomKey("");
                    }}
                  >
                    Open
                  </button>
                </div>
              </div>

              <div className="rounded-xl border bg-[#F2EAD8] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{contentKey}</p>
                    <p className="text-xs text-[#5C4033]">Edit JSON for this page/section and Save.</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setContentDraft(JSON.stringify(cmsDefaults[contentKey] ?? {}, null, 2))}>
                      Reset to defaults
                    </button>
                    <button type="button" className="rounded-lg bg-[#2F3E34] px-3 py-2 text-sm text-white" onClick={saveContent}>
                      Save
                    </button>
                  </div>
                </div>
                <textarea className="mt-3 h-[520px] w-full rounded-lg border p-3 font-mono text-xs" value={contentDraft} onChange={(e) => setContentDraft(e.target.value)} />
                <div className="mt-2 text-xs text-[#5C4033]">{contentStatus}</div>
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        </section>
      </main>
    </div>
  );
}

export default AdminPanel;

