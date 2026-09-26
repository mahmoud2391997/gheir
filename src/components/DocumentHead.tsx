import { useEffect } from "react";
import { useLocation } from "wouter";
import { pieceBySlug, roomBySlug, systemById } from "../data/catalog";
import { useLocale } from "../lib/locale";

const SITE = "https://gheir.vercel.app";

const pages: { match: (path: string) => boolean; en: string; ar: string; descEn: string; descAr: string }[] = [
  {
    match: (path) => path === "/",
    en: "GHEIR / غير — Make your home GHEIR",
    ar: "GHEIR / غير — خلّي بيتك GHEIR",
    descEn: "Handcrafted furniture atelier in Ismailia. What is made by hand can never be truly copied.",
    descAr: "أتيليه أثاث مصنوع بالإيد في الإسماعيلية. ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.",
  },
  {
    match: (path) => path.startsWith("/collection"),
    en: "Collection — GHEIR / غير",
    ar: "المجموعة — GHEIR / غير",
    descEn: "Finished rooms with a point of view: living, dining, and sleep.",
    descAr: "غرف جاهزة ليها رأي: معيشة، سفرة، ونوم.",
  },
  {
    match: (path) => path.startsWith("/systems"),
    en: "Systems — GHEIR / غير",
    ar: "الأنظمة — GHEIR / غير",
    descEn: "Saha, Sofra, Layl, and Athar. Configurable furniture families.",
    descAr: "ساحة، سفرة، ليل، وأثر. عائلات أثاث تتفصّل على البيت.",
  },
  {
    match: (path) => path.startsWith("/contact"),
    en: "Contact — GHEIR / غير",
    ar: "تواصل — GHEIR / غير",
    descEn: "WhatsApp-first conversation. Showroom in Ismailia, Thursday to Saturday by appointment.",
    descAr: "حوار على واتساب. المعرض في الإسماعيلية، الخميس للسبت بموعد.",
  },
  {
    match: (path) => path.startsWith("/showroom"),
    en: "Showroom — GHEIR / غير",
    ar: "المعرض — GHEIR / غير",
    descEn: "صينية فوكس، الإسماعيلية. Visit when the pieces need to be sat in.",
    descAr: "صينية فوكس، الإسماعيلية. تعالى لما القطع تحتاج تتلمس.",
  },
  {
    match: (path) => path.startsWith("/design"),
    en: "Design — GHEIR / غير",
    ar: "التصميم — GHEIR / غير",
    descEn: "Shape a piece to your house and see an indicative price as you choose.",
    descAr: "فصّل القطعة على بيتك وشوف سعرًا استرشاديًا وأنت بتختار.",
  },
  {
    match: (path) => path === "/products" || path.startsWith("/products/"),
    en: "Catalog — GHEIR / غير",
    ar: "الكتالوج — GHEIR / غير",
    descEn: "Published pieces from the workshop inventory.",
    descAr: "القطع المنشورة من مخزون الورشة.",
  },
  {
    match: (path) => path.startsWith("/studio"),
    en: "Studio — GHEIR / غير",
    ar: "الاستوديو — GHEIR / غير",
    descEn: "Commission a piece that cannot be copied.",
    descAr: "اطلب قطعة معمول عشان تعيش، مش عشان تتشابه.",
  },
  {
    match: (path) => path.startsWith("/pricing"),
    en: "Value — GHEIR / غير",
    ar: "القيمة — GHEIR / غير",
    descEn: "Value guidance for the workshop. Not plans, and not luxury theater.",
    descAr: "دليل قيمة للورشة. مش باقات، ومش مسرح فخامة.",
  },
  {
    match: (path) => path.startsWith("/partners"),
    en: "Partners — GHEIR / غير",
    ar: "الشركاء — GHEIR / غير",
    descEn: "For designers and studios who want a home-style partner.",
    descAr: "للمصممين والاستوديوهات اللي عايزين شريك بأسلوب البيت.",
  },
  {
    match: (path) => path.startsWith("/consultation"),
    en: "Consultation — GHEIR / غير",
    ar: "الاستشارة — GHEIR / غير",
    descEn: "A free conversation, showroom or remote.",
    descAr: "حوار مجاني، في المعرض أو عن بُعد.",
  },
  {
    match: (path) => path.startsWith("/khanqah"),
    en: "Khanqah — GHEIR / غير",
    ar: "الخانقاه — GHEIR / غير",
    descEn: "A gathering place for craft in the Ismailia atelier.",
    descAr: "مكان للتجمع حول الصنعة في أتيليه الإسماعيلية.",
  },
  {
    match: (path) => path.startsWith("/visualization"),
    en: "Visualization — GHEIR / غير",
    ar: "التصور — GHEIR / غير",
    descEn: "See a room before it exists — compositions, not empty renders.",
    descAr: "شوف الغرفة قبل ما تتعمل — تكوينات، مش صور فاضية.",
  },
];

function editorial(path: string) {
  const clean = path.split("?")[0];
  if (clean.startsWith("/piece/")) {
    const piece = pieceBySlug(decodeURIComponent(clean.slice("/piece/".length)));
    if (!piece) return null;
    return { en: `${piece.name} — GHEIR / غير`, ar: `${piece.nameAr} — GHEIR / غير`, descEn: piece.story, descAr: piece.storyAr };
  }
  if (clean.startsWith("/collection/") && clean !== "/collection") {
    const room = roomBySlug(decodeURIComponent(clean.slice("/collection/".length)));
    if (!room) return null;
    return { en: `${room.name} — GHEIR / غير`, ar: `${room.nameAr} — GHEIR / غير`, descEn: room.story, descAr: room.storyAr };
  }
  if (clean.startsWith("/systems/") && clean !== "/systems") {
    const system = systemById(decodeURIComponent(clean.slice("/systems/".length)));
    if (!system) return null;
    return { en: `${system.name} — GHEIR / غير`, ar: `${system.nameAr} — GHEIR / غير`, descEn: system.philosophy, descAr: system.philosophyAr };
  }
  return null;
}

function upsert(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function DocumentHead() {
  const [location] = useLocation();
  const { locale } = useLocale();

  useEffect(() => {
    const page = editorial(location) ?? pages.find((entry) => entry.match(location));
    const title = page ? (locale === "ar" ? page.ar : page.en) : "GHEIR / غير";
    const description = page
      ? locale === "ar"
        ? page.descAr
        : page.descEn
      : locale === "ar"
        ? "أتيليه أثاث مصنوع بالإيد في الإسماعيلية."
        : "Handcrafted furniture atelier in Ismailia.";
    const url = `${SITE}${location === "/" ? "/" : location}`;
    document.title = title;
    upsert("name", "description", description);
    upsert("property", "og:title", title);
    upsert("property", "og:description", description);
    upsert("property", "og:url", url);
    upsert("property", "og:locale", locale === "ar" ? "ar_EG" : "en_US");
    upsert("name", "twitter:title", title);
    upsert("name", "twitter:description", description);
    const privatePage = location.startsWith("/admin") || location.startsWith("/cart") || location.startsWith("/wishlist");
    upsert("name", "robots", privatePage ? "noindex, nofollow" : "index, follow");
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
  }, [location, locale]);

  return null;
}
