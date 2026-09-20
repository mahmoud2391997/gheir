import Link from "next/link";
import { Logo } from "../components/Logo";

export default function HomePage() {
  return <main className="grain flex min-h-screen flex-col items-center justify-center gap-8 bg-[#f2ead8] px-6 text-center"><Logo compact /><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8b7653]">GHEIR studio</p><h1 className="mt-3 font-display text-5xl text-[#2f3e34]">Objects with presence.</h1><p className="mx-auto mt-4 max-w-md text-sm text-[#6d7168]">A considered home for furniture, interiors, and the relationships behind them.</p></div><Link href="/admin" className="rounded-lg bg-[#2f3e34] px-5 py-3 text-sm font-medium text-[#f2ead8]">Open studio admin</Link></main>;
}
