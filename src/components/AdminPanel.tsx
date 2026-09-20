import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { cmsDefaults, type CmsKey } from "../cms/defaults";
import { CmsFormEditor } from "./CmsFormEditor";

type Product = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  currency?: string;
  stock: number;
  status: "published" | "draft";
  imageKey?: string;
  imageUrl?: string;
  description?: string;
};

type Lead = {
  _id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: string;
  status: string;
  score?: number;
  message?: string;
  notes?: string;
};

type Order = {
  _id: string;
  status: "new" | "confirmed" | "in_progress" | "delivered" | "cancelled";
  currency: string;
  subtotal: number;
  customer: { name: string; phone: string; email?: string; address?: string };
  items: { sku: string; name: string; unitPrice: number; quantity: number }[];
  createdAt?: string;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function labelize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\./g, " · ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const CMS_PAGES: { key: CmsKey; title: string; group: "Site" | "Pages"; previewHref?: string }[] = [
  { group: "Site", key: "site.footer", title: "Footer", previewHref: "/" },
  { group: "Pages", key: "page.home", title: "Home", previewHref: "/" },
  { group: "Pages", key: "page.systems", title: "Systems", previewHref: "/systems" },
  { group: "Pages", key: "page.pricing", title: "Pricing", previewHref: "/pricing" },
  { group: "Pages", key: "page.studio", title: "Studio (Bespoke)", previewHref: "/studio" },
  { group: "Pages", key: "page.consultation", title: "Consultation", previewHref: "/consultation" },
  { group: "Pages", key: "page.showroom", title: "Showroom", previewHref: "/showroom" },
  { group: "Pages", key: "page.partners", title: "Partners / Trade", previewHref: "/partners" },
  { group: "Pages", key: "page.contact", title: "Contact", previewHref: "/contact" },
  { group: "Pages", key: "page.khanqah", title: "Khanqah", previewHref: "/khanqah" },
  { group: "Pages", key: "page.visualization", title: "Visualization", previewHref: "/visualization" },
];

export function AdminPanel() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"overview" | "products" | "leads" | "orders" | "content">("overview");

  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [error, setError] = useState("");

  // Products create/edit
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("pricing");
  const [newProductPrice, setNewProductPrice] = useState<number>(0);
  const [newProductStock, setNewProductStock] = useState<number>(0);
  const [newProductStatus, setNewProductStatus] = useState<"published" | "draft">("draft");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductImageUrl, setNewProductImageUrl] = useState("");
  const [newProductImageKey, setNewProductImageKey] = useState("");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState<Partial<Product>>({});

  // CMS editor
  const [contentKeys, setContentKeys] = useState<string[]>([]);
  const [cmsQuery, setCmsQuery] = useState("");
  const [contentKey, setContentKey] = useState<CmsKey>("page.home");
  const [contentValue, setContentValue] = useState<any>(cmsDefaults["site.footer"]);
  const [contentStatus, setContentStatus] = useState("");
  const [contentSection, setContentSection] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedDraft, setAdvancedDraft] = useState("");

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
        if (response.status === 404) {
          const fallback = cmsDefaults[contentKey];
          setContentValue(fallback);
          setAdvancedDraft(JSON.stringify(fallback, null, 2));
          if (isPlainObject(fallback)) setContentSection(Object.keys(fallback)[0] ?? "");
          return;
        }
        const json = await response.json();
        const next = json.data ?? cmsDefaults[contentKey];
        setContentValue(next);
        setAdvancedDraft(JSON.stringify(next, null, 2));
        if (isPlainObject(next)) setContentSection(Object.keys(next)[0] ?? "");
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
      body: JSON.stringify({
        name: newProductName,
        category: newProductCategory,
        price: newProductPrice,
        stock: newProductStock,
        status: newProductStatus,
        description: newProductDescription || undefined,
        imageUrl: newProductImageUrl || undefined,
        imageKey: newProductImageKey || undefined,
        currency: "EGP",
      }),
    });
    if (!response.ok) return setError((await response.json()).error ?? "Unable to create product");

    setNewProductName("");
    setNewProductDescription("");
    setNewProductImageUrl("");
    setNewProductImageKey("");
    await load();
  };

  const startEditProduct = (p: Product) => {
    setEditingProductId(p._id);
    setProductDraft({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      status: p.status,
      description: p.description ?? "",
      imageUrl: p.imageUrl ?? "",
      imageKey: p.imageKey ?? "",
    });
  };

  const saveProduct = async () => {
    if (!editingProductId) return;
    setError("");
    const response = await fetch(`/api/admin/products/${encodeURIComponent(editingProductId)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...productDraft,
        price: Number(productDraft.price ?? 0),
        stock: Number(productDraft.stock ?? 0),
      }),
    });
    if (!response.ok) return setError((await response.json()).error ?? "Unable to save product");
    setEditingProductId(null);
    setProductDraft({});
    await load();
  };

  const deleteProduct = async (id: string) => {
    setError("");
    const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
    if (!response.ok && response.status !== 204) return setError((await response.json()).error ?? "Unable to delete product");
    if (editingProductId === id) {
      setEditingProductId(null);
      setProductDraft({});
    }
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
      const data = showAdvanced ? JSON.parse(advancedDraft) : contentValue;
      const response = await fetch(`/api/admin/content/${encodeURIComponent(contentKey)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Unable to save content");
      setContentStatus("Saved.");
      if (!contentKeys.includes(contentKey)) setContentKeys((prev) => [...prev, contentKey].sort());
    } catch (e) {
      setContentStatus(e instanceof Error ? e.message : "Unable to save content");
    }
  };

  const newLeads = leads.filter((lead) => lead.status === "new").length;

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
            <button
              key={item}
              className={`rounded-lg p-3 text-left capitalize ${tab === item ? "bg-[#2F3E34] text-white" : ""}`}
              onClick={() => setTab(item)}
              type="button"
            >
              {item === "leads" ? "Leads & inquiries" : item === "orders" ? "Orders" : item === "content" ? "CMS" : item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-64">
        <header className="flex justify-between border-b bg-[#F2EAD8] p-6">
          <h1 className="text-xl font-semibold">
            {tab === "overview"
              ? "Good morning"
              : tab === "products"
                ? "Products"
                : tab === "leads"
                  ? "Leads & inquiries"
                  : tab === "orders"
                    ? "Orders"
                    : "CMS"}
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
              <form onSubmit={addProduct} className="my-8 grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input className="w-full rounded-lg border p-3" placeholder="Product name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required />
                  <input className="w-full rounded-lg border p-3" placeholder="Category (e.g. pricing)" value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} required />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <input type="number" className="w-full rounded-lg border p-3" placeholder="Price (EGP)" value={newProductPrice} onChange={(e) => setNewProductPrice(Number(e.target.value))} />
                  <input type="number" className="w-full rounded-lg border p-3" placeholder="Stock" value={newProductStock} onChange={(e) => setNewProductStock(Number(e.target.value))} />
                  <select className="w-full rounded-lg border p-3" value={newProductStatus} onChange={(e) => setNewProductStatus(e.target.value as any)}>
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </div>
                <textarea className="w-full rounded-lg border p-3" rows={3} placeholder="Description (optional)" value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} />
                <div className="grid gap-3 md:grid-cols-2">
                  <input className="w-full rounded-lg border p-3" placeholder="Image URL (optional)" value={newProductImageUrl} onChange={(e) => setNewProductImageUrl(e.target.value)} />
                  <input className="w-full rounded-lg border p-3" placeholder="Image key/id (optional)" value={newProductImageKey} onChange={(e) => setNewProductImageKey(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <button className="rounded-lg bg-[#2F3E34] px-4 py-3 text-white">Add product</button>
                </div>
              </form>

              <div className="mt-8 rounded-xl border bg-[#F2EAD8] p-5">
                {products.length ? (
                  products.map((p) => (
                    <div className="border-b py-4" key={p._id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-2xl text-forest">{p.name}</p>
                          <p className="text-sm text-[#5C4033]">{p.category} · {p.status} · {p.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#5C4033]">{money(p.price)} · {p.stock} in stock</span>
                          <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => startEditProduct(p)}>Edit</button>
                          <button type="button" className="rounded-lg border px-3 py-2 text-sm text-red-700" onClick={() => void deleteProduct(p._id)}>Delete</button>
                        </div>
                      </div>

                      {editingProductId === p._id && (
                        <div className="mt-4 grid gap-3 rounded-xl border p-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <input className="w-full rounded-lg border p-3" value={String(productDraft.name ?? "")} onChange={(e) => setProductDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Name" />
                            <input className="w-full rounded-lg border p-3" value={String(productDraft.category ?? "")} onChange={(e) => setProductDraft((d) => ({ ...d, category: e.target.value }))} placeholder="Category" />
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            <input type="number" className="w-full rounded-lg border p-3" value={Number(productDraft.price ?? 0)} onChange={(e) => setProductDraft((d) => ({ ...d, price: Number(e.target.value) }))} placeholder="Price" />
                            <input type="number" className="w-full rounded-lg border p-3" value={Number(productDraft.stock ?? 0)} onChange={(e) => setProductDraft((d) => ({ ...d, stock: Number(e.target.value) }))} placeholder="Stock" />
                            <select className="w-full rounded-lg border p-3" value={(productDraft.status as any) ?? p.status} onChange={(e) => setProductDraft((d) => ({ ...d, status: e.target.value as any }))}>
                              <option value="draft">draft</option>
                              <option value="published">published</option>
                            </select>
                          </div>
                          <textarea className="w-full rounded-lg border p-3" rows={3} value={String(productDraft.description ?? "")} onChange={(e) => setProductDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Description" />
                          <div className="grid gap-3 md:grid-cols-2">
                            <input className="w-full rounded-lg border p-3" value={String(productDraft.imageUrl ?? "")} onChange={(e) => setProductDraft((d) => ({ ...d, imageUrl: e.target.value }))} placeholder="Image URL" />
                            <input className="w-full rounded-lg border p-3" value={String(productDraft.imageKey ?? "")} onChange={(e) => setProductDraft((d) => ({ ...d, imageKey: e.target.value }))} placeholder="Image key/id" />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => { setEditingProductId(null); setProductDraft({}); }}>Cancel</button>
                            <button type="button" className="rounded-lg bg-[#2F3E34] px-3 py-2 text-sm text-white" onClick={() => void saveProduct()}>Save</button>
                          </div>
                        </div>
                      )}
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
                          <span className="text-[#2B2B2B]">{it.quantity}× {it.name} <span className="text-[#5C4033]">({it.sku})</span></span>
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
                <p className="text-sm font-medium">CMS</p>
                <p className="mt-1 text-xs text-[#5C4033]">Pick a page, edit fields, then hit Save.</p>
                <input
                  className="mt-3 w-full rounded-lg border p-2 text-sm"
                  placeholder="Search… (e.g. home, footer, pricing)"
                  value={cmsQuery}
                  onChange={(e) => setCmsQuery(e.target.value)}
                />
                <div className="mt-3 max-h-[520px] overflow-auto space-y-1">
                  {(["Site", "Pages"] as const).map((group) => {
                    const items = CMS_PAGES.filter((p) => p.group === group).filter((p) => {
                      const q = cmsQuery.trim().toLowerCase();
                      if (!q) return true;
                      return p.title.toLowerCase().includes(q) || p.key.toLowerCase().includes(q);
                    });
                    if (!items.length) return null;
                    return (
                      <div key={group} className="pt-2">
                        <p className="px-2 pb-1 text-[11px] font-mono uppercase tracking-widest text-walnut">{group}</p>
                        {items.map((p) => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setContentKey(p.key)}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                              p.key === contentKey ? "bg-[#2F3E34] text-white" : "hover:bg-black/5"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span>{p.title}</span>
                              {!contentKeys.includes(p.key) ? <span className="text-xs opacity-80">Default</span> : null}
                            </div>
                            <div className={`mt-0.5 text-xs ${p.key === contentKey ? "text-white/80" : "text-[#5C4033]"}`}>{p.key}</div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border bg-[#F2EAD8] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {CMS_PAGES.find((p) => p.key === contentKey)?.title ?? labelize(contentKey)}{" "}
                      <span className="text-xs text-[#5C4033]">({contentKey})</span>
                    </p>
                    <p className="text-xs text-[#5C4033]">Edit fields (no JSON). Save when done.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CMS_PAGES.find((p) => p.key === contentKey)?.previewHref ? (
                      <a
                        className="rounded-lg border px-3 py-2 text-sm"
                        href={CMS_PAGES.find((p) => p.key === contentKey)?.previewHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Preview
                      </a>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-sm"
                      onClick={() => {
                        setContentValue(cmsDefaults[contentKey] ?? {});
                        setAdvancedDraft(JSON.stringify(cmsDefaults[contentKey] ?? {}, null, 2));
                        const v = cmsDefaults[contentKey] ?? {};
                        if (isPlainObject(v)) setContentSection(Object.keys(v)[0] ?? "");
                      }}
                    >
                      Reset to defaults
                    </button>
                    <button type="button" className="rounded-lg bg-[#2F3E34] px-3 py-2 text-sm text-white" onClick={saveContent}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-sm"
                      onClick={() => setShowAdvanced((v) => !v)}
                      title="Developer-only JSON editor"
                    >
                      {showAdvanced ? "Hide JSON" : "Developer JSON"}
                    </button>
                  </div>
                </div>

                {showAdvanced ? (
                  <textarea className="mt-3 h-[420px] w-full rounded-lg border p-3 font-mono text-xs" value={advancedDraft} onChange={(e) => setAdvancedDraft(e.target.value)} />
                ) : (
                  <div className="mt-3">
                    {isPlainObject(contentValue) && Object.keys(contentValue).length > 1 ? (
                      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                        <label className="text-xs text-[#5C4033]">
                          Section
                          <select
                            className="mt-1 w-full rounded-lg border p-2 text-sm"
                            value={contentSection}
                            onChange={(e) => setContentSection(e.target.value)}
                          >
                            {Object.keys(contentValue).map((k) => (
                              <option key={k} value={k}>
                                {labelize(k)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <p className="text-xs text-[#5C4033]">Tip: pick a section, edit fields, Save.</p>
                      </div>
                    ) : null}
                    <CmsFormEditor
                      value={isPlainObject(contentValue) && contentSection ? (contentValue as any)[contentSection] : contentValue}
                      onChange={(next) => {
                        const updated =
                          isPlainObject(contentValue) && contentSection
                            ? { ...(contentValue as any), [contentSection]: next }
                            : next;
                        setContentValue(updated);
                        setAdvancedDraft(JSON.stringify(updated, null, 2));
                      }}
                    />
                  </div>
                )}
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

