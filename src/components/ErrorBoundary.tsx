"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const arabic = typeof document !== "undefined" && document.documentElement.dir === "rtl";
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-24 text-charcoal">
        <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-walnut">GHEIR</p>
        <h1 className="mt-3 font-display text-5xl text-forest">
          {arabic ? "حصلت مشكلة في الصفحة" : "This page didn’t load"}
        </h1>
        <p className="mt-4 text-charcoal/80">
          {arabic
            ? "الكتالوج لسه موجود. حدّث الصفحة، أو كلمنا على واتساب."
            : "The atelier is still here. Refresh the page, or reach us on WhatsApp."}
        </p>
        <button
          type="button"
          className="mt-8 w-fit bg-forest px-5 py-3 text-ivory"
          onClick={() => window.location.reload()}
        >
          {arabic ? "تحديث" : "Refresh"}
        </button>
      </main>
    );
  }
}
