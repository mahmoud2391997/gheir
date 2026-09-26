import type { MetadataRoute } from "next";
import { pieces, rooms, systems } from "@/src/data/catalog";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/collection", "/systems", "/design", "/studio", "/consultation", "/visualization", "/showroom", "/pricing", "/partners", "/contact", "/khanqah", "/products"];
  const urls = [
    ...staticPaths,
    ...rooms.map((room) => `/collection/${room.slug}`),
    ...systems.map((system) => `/systems/${system.id}`),
    ...pieces.map((piece) => `/piece/${piece.slug}`),
  ];
  return urls.map((path) => ({ url: `${SITE}${path === "/" ? "/" : path}` }));
}
