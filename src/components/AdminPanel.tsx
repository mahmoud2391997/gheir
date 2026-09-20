import { useMemo, useState } from "react";
import { Logo } from "./Logo";
import {
  BarChart3,
  Bell,
  ChevronDown,
  CircleDollarSign,
  Eye,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Product = { id: number; name: string; category: string; price: string; stock: number; status: "Published" | "Draft"; image: string };
type Lead = { name: string; company: string; email: string; source: string; status: "New" | "Contacted" | "Qualified"; score: number; date: string };

const initialProducts: Product[] = [
  { id: 1, name: "Layl Sofa", category: "Seating", price: "$2,850", stock: 12, status: "Published", image: "/images/product-sofa.jpg" },
  { id: 2, name: "Saha Dining Table", category: "Tables", price: "$3,400", stock: 8, status: "Published", image: "/images/product-dining-table.jpg" },
  { id: 3, name: "Athar Armchair", category: "Seating", price: "$1,280", stock: 24, status: "Published", image: "/images/product-armchair.jpg" },
  { id: 4, name: "Nour Nightstand", category: "Storage", price: "$620", stock: 0, status: "Draft", image: "/images/product-nightstand.jpg" },
];

const initialLeads: Lead[] = [
  { name: "Maya Hassan", company: "Cairo House Studio", email: "maya@cairohouse.co", source: "Consultation", status: "New", score: 92, date: "Today, 09:24" },
  { name: "Omar Khalil", company: "Khalil Residence", email: "omar@khalilresidence.com", source: "Instagram", status: "Qualified", score: 87, date: "Yesterday" },
  { name: "Nour Adel", company: "The Palm Hotel", email: "nour@thepalmhotel.com", source: "Website", status: "Contacted", score: 74, date: "Sep 18, 2026" },
  { name: "Salma Youssef", company: "Youssef & Co.", email: "salma@youssefco.com", source: "Referral", status: "New", score: 68, date: "Sep 17, 2026" },
];

const statusStyles: Record<string, string> = { Published: "bg-emerald-50 text-emerald-700", Draft: "bg-stone-100 text-stone-600", New: "bg-blue-50 text-blue-700", Contacted: "bg-amber-50 text-amber-700", Qualified: "bg-emerald-50 text-emerald-700" };

export function AdminPanel() {
  const [active, setActive] = useState<"overview" | "products" | "leads">("overview");
  const [products, setProducts] = useState(initialProducts);
  const [leads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [productName, setProductName] = useState("");
  const filteredProducts = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const filteredLeads = useMemo(() => leads.filter((l) => `${l.name} ${l.company} ${l.email}`.toLowerCase().includes(query.toLowerCase())), [leads, query]);

  function addProduct(event: React.FormEvent) {
    event.preventDefault();
    if (!productName.trim()) return;
    setProducts((current) => [{ id: Date.now(), name: productName, category: "New collection", price: "$0", stock: 0, status: "Draft", image: "/images/product-chair.jpg" }, ...current]);
    setProductName("");
    setShowProductForm(false);
    setActive("products");
  }

  return <div className="min-h-screen bg-[#f7f6f2] text-[#252923]">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#e5e3dc] bg-[#fbfaf7] lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-[#e5e3dc] px-7"><Logo compact /><span className="border-l border-[#d9d6cd] pl-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8d84]">Admin</span></div>
      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Admin navigation">
        {[['overview', LayoutDashboard, 'Overview'], ['products', Package, 'Products'], ['leads', Users, 'Leads & inquiries']].map(([key, Icon, label]) => <button key={key as string} onClick={() => setActive(key as typeof active)} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors ${active === key ? "bg-[#26382e] text-[#f7f6f2]" : "text-[#70746b] hover:bg-[#efeee8] hover:text-[#252923]"}`}><Icon size={17} strokeWidth={1.7} />{label as string}{key === 'leads' && <span className="ml-auto rounded-full bg-[#d8b879] px-2 py-0.5 text-[10px] font-semibold text-[#26382e]">12</span>}</button>)}
        <div className="my-5 border-t border-[#e5e3dc]" />
        <button className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#70746b] hover:bg-[#efeee8]"><BarChart3 size={17} strokeWidth={1.7} />Analytics</button>
        <button className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#70746b] hover:bg-[#efeee8]"><Settings size={17} strokeWidth={1.7} />Settings</button>
      </nav>
      <div className="m-4 rounded-xl bg-[#f0ede4] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7653]">Workspace</p><p className="mt-2 text-sm font-medium">Gheir Studio</p><p className="mt-1 text-xs text-[#85877f]">Admin access · Cairo</p></div>
    </aside>

    <main className="lg:pl-64"><header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#e5e3dc] bg-[#f7f6f2]/95 px-5 backdrop-blur-md sm:px-8 lg:px-10"><div className="flex items-center gap-3"><button className="lg:hidden" aria-label="Open menu"><Menu size={20} /></button><div><p className="hidden text-xs text-[#92948c] sm:block">Wednesday, September 20, 2026</p><h1 className="text-lg font-semibold tracking-[-0.02em]">{active === "overview" ? "Good morning, Mahmoud" : active === "products" ? "Products" : "Leads & inquiries"}</h1></div></div><div className="flex items-center gap-2 sm:gap-5"><button className="relative rounded-full p-2 text-[#70746b] hover:bg-[#eceae3]" aria-label="Notifications"><Bell size={18} strokeWidth={1.7} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#bf7f53]" /></button><div className="hidden h-6 w-px bg-[#e5e3dc] sm:block" /><button className="flex items-center gap-2 text-left"><span className="flex size-8 items-center justify-center rounded-full bg-[#d8b879] text-xs font-semibold text-[#26382e]">MA</span><span className="hidden text-sm font-medium sm:block">Mahmoud</span><ChevronDown size={14} className="hidden text-[#92948c] sm:block" /></button></div></header>

      <div className="mx-auto max-w-[1400px] p-5 sm:p-8 lg:p-10">
        {active === "overview" && <Overview setActive={setActive} products={products} leads={leads} />}
        {active === "products" && <section className="flex flex-col gap-6"><SectionHeader title="Products" description="Manage your catalog, availability, and visibility." actionLabel="Add product" onAction={() => setShowProductForm(true)} /><Toolbar query={query} setQuery={setQuery} /><ProductTable products={filteredProducts} /></section>}
        {active === "leads" && <section className="flex flex-col gap-6"><SectionHeader title="Leads & inquiries" description="Track interest from consultation to conversion." actionLabel="Export leads" onAction={() => undefined} /><Toolbar query={query} setQuery={setQuery} /><LeadTable leads={filteredLeads} /></section>}
      </div>
    </main>

    {showProductForm && <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#17221b]/35 p-4"><form onSubmit={addProduct} className="w-full max-w-md rounded-2xl bg-[#fbfaf7] p-7 shadow-2xl"><div className="mb-6 flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7653]">Catalog</p><h2 className="mt-2 text-xl font-semibold">Add a product</h2></div><button type="button" onClick={() => setShowProductForm(false)} aria-label="Close"><X size={18} /></button></div><label className="flex flex-col gap-2 text-sm font-medium">Product name<input autoFocus value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Saha Sideboard" className="rounded-lg border border-[#dedbd1] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#26382e]" /></label><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowProductForm(false)} className="rounded-lg px-4 py-2 text-sm text-[#70746b]">Cancel</button><button className="rounded-lg bg-[#26382e] px-4 py-2 text-sm font-medium text-white">Create draft</button></div></form></div>}
  </div>;
}

function Overview({ setActive, products, leads }: { setActive: (tab: "overview" | "products" | "leads") => void; products: Product[]; leads: Lead[] }) { return <div className="flex flex-col gap-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b7653]">Studio operations</p><h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Overview</h2><p className="mt-2 max-w-xl text-sm text-[#7a7d73]">A clear view of how your collection and customer relationships are moving today.</p></div><button onClick={() => setActive("products")} className="flex items-center gap-2 self-start rounded-lg bg-[#26382e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1e2d25]"><Plus size={16} />Add product</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Total products", products.length.toString(), "+2 this month", Package], ["New leads", "12", "+18.4%", Users], ["Conversion rate", "24.8%", "+4.2%", TrendingUp], ["Pipeline value", "$84,620", "+12.8%", CircleDollarSign]].map(([label, value, change, Icon]) => <div key={label as string} className="rounded-xl border border-[#e5e3dc] bg-[#fbfaf7] p-5"><div className="flex items-start justify-between"><p className="text-xs font-medium text-[#85877f]">{label as string}</p><Icon size={17} className="text-[#9d8354]" strokeWidth={1.6} /></div><p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">{value as string}</p><p className="mt-2 text-xs text-emerald-700">{change as string}</p></div>)}</div><div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"><div className="rounded-xl border border-[#e5e3dc] bg-[#fbfaf7]"><div className="flex items-center justify-between border-b border-[#e5e3dc] p-5"><div><h3 className="font-semibold">Recent inquiries</h3><p className="mt-1 text-xs text-[#85877f]">Latest activity across your channels</p></div><button onClick={() => setActive("leads")} className="text-xs font-medium text-[#8b7653]">View all</button></div><LeadTable leads={leads.slice(0, 3)} compact /></div><div className="rounded-xl border border-[#e5e3dc] bg-[#fbfaf7]"><div className="flex items-center justify-between border-b border-[#e5e3dc] p-5"><div><h3 className="font-semibold">Catalog health</h3><p className="mt-1 text-xs text-[#85877f]">Visibility and inventory snapshot</p></div><button onClick={() => setActive("products")} className="text-xs font-medium text-[#8b7653]">Manage</button></div><div className="flex flex-col gap-5 p-5"><HealthRow label="Published products" value="75%" progress={75} color="bg-[#26382e]" /><HealthRow label="Stock availability" value="88%" progress={88} color="bg-[#b58a4c]" /><HealthRow label="Product information" value="92%" progress={92} color="bg-[#75907d]" /></div></div></div></div> }

function SectionHeader({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel: string; onAction: () => void }) { return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b7653]">Studio operations</p><h2 className="text-3xl font-semibold tracking-[-0.04em]">{title}</h2><p className="mt-2 text-sm text-[#7a7d73]">{description}</p></div><button onClick={onAction} className="flex items-center gap-2 self-start rounded-lg bg-[#26382e] px-4 py-2.5 text-sm font-medium text-white"><Plus size={16} />{actionLabel}</button></div> }
function Toolbar({ query, setQuery }: { query: string; setQuery: (value: string) => void }) { return <div className="flex flex-col justify-between gap-3 sm:flex-row"><div className="relative max-w-sm flex-1"><Search size={16} className="absolute left-3 top-3 text-[#9a9c94]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search records..." className="w-full rounded-lg border border-[#e5e3dc] bg-[#fbfaf7] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#26382e]" /></div><button className="flex items-center justify-center gap-2 rounded-lg border border-[#e5e3dc] bg-[#fbfaf7] px-4 py-2.5 text-sm text-[#6d7168]"><SlidersHorizontal size={15} />Filter</button></div> }
function ProductTable({ products }: { products: Product[] }) { return <div className="overflow-hidden rounded-xl border border-[#e5e3dc] bg-[#fbfaf7]"><div className="hidden grid-cols-[2fr_1fr_0.8fr_0.7fr_0.7fr_40px] gap-4 border-b border-[#e5e3dc] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94968e] md:grid"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span /></div>{products.map((p) => <div key={p.id} className="grid gap-3 border-b border-[#eeece7] px-5 py-4 last:border-0 md:grid-cols-[2fr_1fr_0.8fr_0.7fr_0.7fr_40px] md:items-center md:gap-4"><div className="flex items-center gap-3"><img src={p.image} alt="" className="size-11 rounded-lg object-cover" /><div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-[#92948c] md:hidden">{p.category} · {p.price}</p></div></div><span className="hidden text-sm text-[#70746b] md:block">{p.category}</span><span className="hidden text-sm font-medium md:block">{p.price}</span><span className="text-xs text-[#70746b] md:text-sm">{p.stock} in stock</span><span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[p.status]}`}>{p.status}</span><button aria-label={`More options for ${p.name}`} className="hidden justify-self-end text-[#9a9c94] md:block"><MoreHorizontal size={17} /></button></div>)}</div> }
function LeadTable({ leads, compact = false }: { leads: Lead[]; compact?: boolean }) { return <div className="overflow-hidden"><div className={`${compact ? "hidden" : "hidden md:grid"} grid-cols-[1.5fr_1.2fr_1fr_0.7fr_0.8fr_0.7fr] gap-4 border-b border-[#e5e3dc] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94968e]`}><span>Contact</span><span>Source</span><span>Status</span><span>Score</span><span>Received</span><span /></div>{leads.map((lead) => <div key={lead.email} className={`${compact ? "px-5" : "px-5"} grid gap-2 border-b border-[#eeece7] py-4 last:border-0 md:grid-cols-[1.5fr_1.2fr_1fr_0.7fr_0.8fr_0.7fr] md:items-center md:gap-4`}><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-[#e5ded0] text-xs font-semibold text-[#6d5739]">{lead.name.split(" ").map((n) => n[0]).join("")}</span><div><p className="text-sm font-medium">{lead.name}</p><p className="text-xs text-[#92948c]">{lead.company}</p></div></div><span className="text-xs text-[#70746b] md:text-sm">{lead.source}</span><span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[lead.status]}`}>{lead.status}</span><span className="text-sm font-medium">{lead.score}<span className="text-xs font-normal text-[#92948c">/100</span></span><span className="text-xs text-[#92948c]">{lead.date}</span><button aria-label={`View ${lead.name}`} className="hidden justify-self-end text-[#9a9c94] md:block"><Eye size={16} /></button></div>)}</div> }
function HealthRow({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="text-[#70746b]">{label}</span><span className="font-medium">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#eceae3]"><div className={`h-full rounded-full ${color}`} style={{ width: `${progress}%` }} /></div></div> }

export default AdminPanel;
