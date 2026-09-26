"use client";

import NextLink from "next/link";
import { useParams as useNextParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";

export function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink {...props} />;
}

export function useParams<T extends Record<string, string | undefined>>() {
  const params = useNextParams();
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    out[key] = Array.isArray(value) ? value[0] : value;
  }
  return out as T;
}

export function useLocation(): [string, (to: string) => void] {
  const pathname = usePathname() || "/";
  const search = useSearchParams();
  const router = useRouter();
  const query = search.toString();
  return [query ? `${pathname}?${query}` : pathname, (to) => router.push(to)];
}
