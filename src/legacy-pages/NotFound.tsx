"use client";

import { Photo } from "../components/Photo";
import { Link } from "../lib/router";
import { Layout } from "../components/Layout";
import { Logo } from "../components/Logo";

export function NotFound() {
  return (
    <Layout>
      <section className="relative min-h-[70vh] overflow-hidden bg-forest text-ivory">
        <Photo src="/images/craft-fingerprint.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center px-5 py-24">
          <Logo dark compact />
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-sand">404</p>
          <h1 className="mt-4 font-display text-7xl leading-none">
            This page is not a copy.
            <span lang="ar" className="mt-2 block italic text-sand">
              وهي كمان مش هنا.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-ivory/80">The house is still this way — try a room, a system, or a conversation.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="bg-sand px-5 py-3 font-medium text-forest">
              Home
            </Link>
            <Link href="/collection" className="border border-sand px-5 py-3 text-ivory">
              Collection
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
