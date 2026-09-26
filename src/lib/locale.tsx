"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "./router";

export type Locale = "en" | "ar";

const STORAGE_KEY = "gher-locale";

const copy = {
  en: {
    systems: "Systems",
    collection: "Collection",
    design: "Design",
    khanqah: "Khanqah",
    contact: "Contact",
    wishlist: "Wishlist",
    cart: "Cart",
    inquire: "Inquire",
    new: "New",
    startConversation: "Start a conversation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    langLabel: "العربية",
    add: "Add",
    save: "Save",
    saved: "Saved",
    from: "from",
    send: "Send",
    sending: "Sending…",
    notNow: "Not now",
    name: "Name",
    whatsapp: "WhatsApp",
    note: "Note",
    inquiry: "Inquiry",
    inquiryTitle: "Start a conversation",
    received: "Received",
    inquiryThanks: "We’ll reply as a conversation.",
    inquirySoon: "حوار — مش عرض. عادةً خلال يوم.",
    close: "Close",
    showroom: "Showroom",
    hours: "Hours",
    hoursValue: "Thu–Sat, by appointment",
    openWhatsApp: "Open WhatsApp",
    messagePlaceholder: "What are you making at home?",
    imageUnavailable: "Image unavailable",
  },
  ar: {
    systems: "الأنظمة",
    collection: "المجموعة",
    design: "التصميم",
    khanqah: "الخانقاه",
    contact: "تواصل",
    wishlist: "المفضلة",
    cart: "السلة",
    inquire: "استفسار",
    new: "جديد",
    startConversation: "ابدأ حوار",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    langLabel: "English",
    add: "أضف",
    save: "احفظ",
    saved: "محفوظ",
    from: "من",
    send: "إرسال",
    sending: "جارٍ الإرسال…",
    notNow: "ليس الآن",
    name: "الاسم",
    whatsapp: "واتساب",
    note: "ملاحظة",
    inquiry: "استفسار",
    inquiryTitle: "ابدأ حوار",
    received: "وصلنا",
    inquiryThanks: "حنرد كحوار، مش كعرض.",
    inquirySoon: "عادةً خلال يوم.",
    close: "إغلاق",
    showroom: "المعرض",
    hours: "المواعيد",
    hoursValue: "الخميس–السبت، بموعد",
    openWhatsApp: "واتساب",
    messagePlaceholder: "بتعمل إيه في البيت؟",
    imageUnavailable: "الصورة غير متاحة",
  },
} as const;

const hrefLabel: Record<string, string> = {
  "/systems": "الأنظمة",
  "/collection": "المجموعة",
  "/design": "صمّم قطعتك",
  "/pricing": "القيمة",
  "/studio": "تفصيل",
  "/khanqah": "الخانقاه",
  "/visualization": "التصوّر",
  "/consultation": "استشارة",
  "/showroom": "المعرض",
  "/partners": "شركاء",
  "/contact": "تواصل",
};

type Copy = (typeof copy)[Locale];

const headings: Record<string, string> = {
  "The Journey": "الرحلة",
  Studio: "الأتيليه",
  Next: "الخطوة الجاية",
  Living: "معيشة",
  Dining: "سفرة",
  Sleep: "نوم",
};

type LocaleValue = {
  locale: Locale;
  t: Copy;
  toggle: () => void;
  pick: (en: string, ar: string) => string;
  labelFor: (href: string, fallback: string) => string;
  heading: (text: string) => string;
};

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
    } catch {
      return "en";
    }
  });
  const [location] = useLocation();

  useEffect(() => {
    const rtl = locale === "ar" && !location.startsWith("/admin");
    document.documentElement.lang = rtl ? "ar" : "en";
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* private mode */
    }
  }, [locale, location]);

  const value = useMemo<LocaleValue>(
    () => ({
      locale,
      t: copy[locale],
      toggle: () => setLocale((current) => (current === "ar" ? "en" : "ar")),
      pick: (en, ar) => (locale === "ar" ? ar : en),
      labelFor: (href, fallback) => (locale === "ar" ? hrefLabel[href] ?? fallback : fallback),
      heading: (text) => (locale === "ar" ? headings[text] ?? text : text),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("LocaleProvider missing");
  return ctx;
}
