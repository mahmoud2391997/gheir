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

  "page.contact": {
    eyebrow: "Contact",
    title: "WhatsApp-first conversation.",
    intro: "Simple, smart, close. Not a ticket. Visit the showroom when the pieces need to be sat in.",
    image: { src: "/images/showroom-ismailia.jpg", alt: "GHER showroom" },
    form: { success: "Message received. We’ll answer as a conversation.", button: "Send message" },
  },

  "page.khanqah": {
    hero: {
      eyebrow: "Khanqah / Making",
      title: "A gathering place for craft.",
      body: "Not a commercial factory. An atelier — wood, dust in the light, hands that remember.",
      image: { src: "/images/workshop-wide.jpg", alt: "GHER workshop with wood and light" },
    },
    founder: {
      title: "Ziad / زياد",
      bodyEn:
        "Started in 2016 with string art and wood. Then workshops. Then professional work in the UAE. The sentence people kept repeating was not a slogan. It was a reaction: ده غير.",
      bodyAr: "ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.",
      image: { src: "/images/workshop-hands.jpg", alt: "Craftsman hands assembling walnut furniture" },
    },
    craft: {
      title: "Raw craft + refined result.",
      body:
        "Quality is explained as معمول عشان يعيش — made to live — not “أعلى جودة”. Heritage sits in the joinery, the fingerprint inlay, the refusal of beige sameness.",
      image: { src: "/images/workshop-macro.jpg", alt: "Macro of wood grain being finished" },
      insetImage: { src: "/images/craft-fingerprint.jpg", alt: "Geometric fingerprint inlay in walnut" },
    },
    journey: { eyebrow: "The customer journey", title: "From awareness to after-sales." },
  },

  "page.visualization": {
    eyebrow: "Visualization",
    title: "See it before it exists.",
    intro: "Styling ideas and room compositions. Complete-the-look selling — consultative, never warehouse-pushy.",
    looksTitle: "Looks",
    looks: [
      { title: "Complete the look", image: "/images/visualization-look.jpg", body: "Sofa, armchair, table, triptych — one temperature." },
      { title: "Unbeige living", image: "/images/hero-alt.jpg", body: "Color as character, not decoration." },
      { title: "Friday table", image: "/images/dining-friday.jpg", body: "Chairs with mashrabiya rhythm." },
    ],
    roomsTitle: "Rooms to enter",
    objectsTitle: "Objects that finish a wall",
    cta: { href: "/studio", label: "Commission a visualization" },
  },

  "page.home": {
    hero: {
      eyebrow: "Ismailia atelier · since 2016",
      titleTopAr: "خلّي بيتك",
      titleBottom: "GHEIR",
      bodyEn: "Make your home GHEIR.",
      bodyAr: "غير المتوقع. غير المتكرر. غير كل بيت. وأكتر شبهك.",
      image: { src: "/images/hero-room.jpg", alt: "Forest-green sofa in a distinctive living room" },
      primaryCta: { href: "/collection", label: "See rooms" },
      secondaryCta: { href: "/design", label: "Design with a live price" },
    },
    belief: {
      eyebrow: "Belief",
      title: "What is made by hand can never be truly copied.",
      bodyAr: "ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.",
      bodyEn:
        "GHEIR مش داخل ينافس على إنه الأرخص، ومش داخل كمان ينافس براندات الـLuxury. Distinctive design at a reasonable value. Personal difference — اختلاف له شخصية.",
    },
    rooms: {
      eyebrow: "Rooms, three ways",
      title: "Living. Dining. Sleep. Not a warehouse aisle.",
    },
    path: {
      eyebrow: "The path",
      title: "Three steps. Then a month of making.",
      steps: [
        { n: "01", title: "See a room that isn’t beige", body: "Collection — finished rooms with a point of view." },
        { n: "02", title: "Shape it to your house", body: "Design — live indicative price as you change wood, size, fabric." },
        { n: "03", title: "Make it in about a month", body: "Consultation, then the workshop. معمول عشان يعيش." },
      ],
    },
    systems: {
      eyebrow: "Four systems",
      title: "Saha · Sofra · Layl · Athar",
      allCta: { href: "/systems", label: "All systems" },
    },
    khanqah: {
      eyebrow: "Khanqah",
      title: "A place of gathering, not a factory floor.",
      body:
        "Ziad / زياد started in 2016 with string art and wood, then workshops and professional work in the UAE. The recurring reaction: ده غير.",
      cta: { href: "/khanqah", label: "The making" },
      image: { src: "/images/workshop-hands.jpg", alt: "Hands finishing walnut in the GHEIR workshop" },
    },
    consultation: {
      eyebrow: "Consultation",
      title: "Free, in this first phase. Direction — not “buy this too”.",
      body: "Taste, but helping you discover yours. Creative Guide, not a closer.",
      primaryCta: { href: "/consultation", label: "Book a conversation" },
      presetTitle: "Consultation",
      secondaryCta: { label: "Inquire now" },
    },
  },
} as const;

export type CmsKey = keyof typeof cmsDefaults;

