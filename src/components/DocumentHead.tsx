import { useEffect } from "react";
import { useLocation } from "wouter";
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
];

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
    const page = pages.find((entry) => entry.match(location));
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
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
  }, [location, locale]);

  return null;
}
