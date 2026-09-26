"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const arabic = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  return (
    <main className="mx-auto max-w-3xl px-5 py-24">
      <p className="font-display text-4xl text-forest">{arabic ? "الصفحة ما اتحملتش" : "This page didn’t load"}</p>
      <button type="button" className="mt-6 bg-forest px-5 py-3 text-ivory" onClick={() => reset()}>
        {arabic ? "حاول تاني" : "Try again"}
      </button>
    </main>
  );
}
