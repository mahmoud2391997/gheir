import { formatEGP } from "../data/catalog";

export const cmsDefaults = {
  "site.footer": {
    heroTaglineAr: "خلّي بيتك GHEIR",
    heroBodyEn: "What is made by hand can never be truly copied.",
    heroBodyAr: "ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.",
    groups: [
      {
        title: "The Journey",
        links: [
          { href: "/systems", label: "Systems" },
          { href: "/collection", label: "Collection" },
          { href: "/design", label: "Design your own" },
          { href: "/pricing", label: "Value guidance" },
        ],
      },
      {
        title: "Studio",
        links: [
          { href: "/studio", label: "Bespoke" },
          { href: "/khanqah", label: "Khanqah" },
          { href: "/visualization", label: "Visualization" },
          { href: "/consultation", label: "Consultation" },
        ],
      },
      {
        title: "Next",
        links: [
          { href: "/showroom", label: "Showroom" },
          { href: "/partners", label: "Partners / Trade" },
          { href: "/contact", label: "Contact" },
        ],
      },
    ],
    bottomLeft: "GHEIR / غير · Accessible distinctiveness",
    bottomRight: "صينية فوكس – الإسماعيلية",
  },

  "page.systems": {
    eyebrow: "Systems · New",
    title: "Four languages. One house that doesn’t look like the others.",
    bodyEn: "Configurable families — not SKUs in a catalog grid.",
    bodyAr: "غير المتوقع. غير المتكرر.",
  },

  "page.studio": {
    eyebrow: "Studio · Bespoke",
    title: "Commission a piece that cannot be copied.",
    intro: "Custom commissions. Brief → visualization → making (~1 month) → delivery.",
    image: { src: "/images/studio-desk.jpg", alt: "Design desk with sketches and fabric swatches" },
    steps: [
      { n: "01", title: "Brief", body: "You tell us how you live. We listen for character, not trends." },
      { n: "02", title: "Visualization", body: "See it before it exists — compositions, not empty renders." },
      { n: "03", title: "Making", body: "About one month in the workshop. معمول عشان يعيش." },
      { n: "04", title: "Delivery", body: "Then after-sales. The piece should live with you." },
    ],
    form: {
      title: "Start a commission brief",
      success: "Received. We’ll shape the first visualization together.",
      button: "Send brief",
      inquireCta: "Or inquire",
      presetTitle: "Studio commission",
    },
  },

  "page.pricing": {
    eyebrow: "Value guidance",
    title: "Not plans. Not luxury theater.",
    body:
      "GHEIR مش داخل ينافس على إنه الأرخص، ومش داخل كمان ينافس براندات الـLuxury. Accessible distinctiveness.\nLimited pieces numbered. Customization is expected. Lead time about one month.",
    bands: [
      {
        title: "Art set 50×50",
        ar: "طقم لوحات",
        price: "≈ 6–7k EGP",
        image: "/images/product-art-set.jpg",
        note: "Numbered. If the edition ends, made-to-order slightly higher.",
      },
      {
        title: "Living set",
        ar: "ركنة + كرسي + فوتيه + coffee table",
        price: "≈ 50,000 EGP",
        image: "/images/living-gathering.jpg",
        note: "A starting conversation — customization and wood move the number.",
      },
      {
        title: "Saha seating",
        ar: "ساحة",
        price: `from ${formatEGP(31500)}`,
        image: "/images/system-saha.jpg",
        note: "Modular. Size and fabric are the levers.",
      },
      {
        title: "Sofra dining",
        ar: "سفرة",
        price: `from ${formatEGP(18000)}`,
        image: "/images/system-sofra.jpg",
        note: "Table first; chairs as extras in the configurator.",
      },
      {
        title: "Layl bedroom",
        ar: "ليل",
        price: `from ${formatEGP(42000)}`,
        image: "/images/system-layl.jpg",
        note: "Custom sizes. Made to the room you have.",
      },
    ],
    footerNote: "Made-to-order when stock is gone — slightly higher, still yours. Quality = معمول عشان يعيش.",
    cta: { href: "/design", label: "Build a live price" },
  },

  "page.partners": {
    eyebrow: "Partners / Trade",
    title: "For designers and studios who want a home-style partner.",
    bodyEn: "GHEIR as a language in your projects — not a white-label factory. Trade conversation, not a SaaS plan.",
    bodyAr: "اختلاف له شخصية.",
    image: { src: "/images/visualization-look.jpg", alt: "Styled GHEIR composition for trade partners" },
    form: {
      title: "Trade inquiry",
      success: "Received. We’ll talk as partners.",
      button: "Send",
    },
  },

  "page.consultation": {
    eyebrow: "Consultation",
    title: "Free. Professional. Not pushy.",
    bodyEn:
      "Direction, not “buy this too”. In the first phase, consultation is free — a Creative Guide helping you find your taste.",
    bodyAr: "GHEIR يساعدك تعمل بيت مميز، مختلف، وأكتر شبهك.",
    image: { src: "/images/consultation-space.jpg", alt: "Consultation seating with fabric samples" },
    form: { title: "Request a time", success: "We’ll confirm a conversation — showroom or remote.", button: "Request" },
  },

  "page.showroom": {
    eyebrow: "Showroom",
    hero: {
      image: { src: "/images/showroom-ismailia.jpg", alt: "Curated GHER showroom in Ismailia" },
      subtitle: "A curated design space — not a warehouse.",
    },
    visit: {
      title: "Visit by appointment",
      body: "صينية فوكس – الإسماعيلية. Sit with the pieces, talk style, then decide.",
      tagline: "Different Without Being Unreachable.",
      primaryCta: "Book on WhatsApp",
      secondaryCta: { href: "/consultation", label: "Consultation" },
      image: { src: "/images/living-gathering.jpg", alt: "Gathering sofa in the showroom atmosphere" },
    },
  },
} as const;

export type CmsKey = keyof typeof cmsDefaults;

