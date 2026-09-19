export type SystemId = "saha" | "sofra" | "layl" | "athar";
export type RoomType = "Living" | "Dining" | "Sleep";

export type Piece = {
  slug: string;
  name: string;
  nameAr: string;
  system: SystemId;
  sku: string;
  edition?: string;
  priceFrom: number;
  image: string;
  story: string;
  storyAr: string;
  making: string;
};

export type Room = {
  slug: string;
  name: string;
  nameAr: string;
  type: RoomType;
  image: string;
  total: number;
  story: string;
  storyAr: string;
  pieces: string[];
};

export type System = {
  id: SystemId;
  name: string;
  nameAr: string;
  tag: string;
  from: number;
  image: string;
  philosophy: string;
  philosophyAr: string;
  configure: string[];
  materials: string[];
};

export const WHATSAPP_URL =
  "https://wa.me/201234567890?text=" +
  encodeURIComponent("مرحباً GHER — أريد أبدأ حوار عن بيت شبهي.");

export const SHOWROOM = {
  name: "صينية فوكس",
  city: "الإسماعيلية",
  line: "صينية فوكس – الإسماعيلية",
  hours: "Thu–Sat, by appointment",
};

export const systems: System[] = [
  {
    id: "saha",
    name: "Saha",
    nameAr: "ساحة",
    tag: "Modular seating",
    from: 31500,
    image: "/images/system-saha.jpg",
    philosophy:
      "A room starts with how people sit together. Saha is ركنات, chairs, and فوتيهات — built so the gathering can change without the character disappearing.",
    philosophyAr: "في قطع بتملأ المكان. وفي قطع بتدي المكان شخصية.",
    configure: [
      "Width: 180 / 240 / 300 cm corner",
      "Wood: walnut, oak, or stained",
      "Fabric: sand linen, forest velvet, charcoal weave",
      "Extras: ottoman, cushion set, numbered plaque",
    ],
    materials: ["Walnut or oak frames", "High-resilience foam", "Linen and velvet", "Handmade legs"],
  },
  {
    id: "sofra",
    name: "Sofra",
    nameAr: "سفرة",
    tag: "Dining tables & chairs",
    from: 18000,
    image: "/images/system-sofra.jpg",
    philosophy:
      "Friday is a table. Sofra keeps the mashrabiya rhythm in the chair backs — geometry you feel, not a motif pasted on.",
    philosophyAr: "غير المتوقع. غير المتكرر. غير كل بيت.",
    configure: [
      "Length: 140 / 180 / 220 cm",
      "Wood: walnut, oak, or stained",
      "Finish: oil or matte",
      "Extras: 4 or 6 chairs, bench, runner",
    ],
    materials: ["Solid walnut / oak tops", "Geometric chair backs", "Oil finish that lives", "Optional linen runner"],
  },
  {
    id: "layl",
    name: "Layl",
    nameAr: "ليل",
    tag: "Bedrooms, custom sizes",
    from: 42000,
    image: "/images/system-layl.jpg",
    philosophy:
      "Sleep should have a temperature. Layl is walnut beds, sand textiles, and quiet art — sized to the room you actually have.",
    philosophyAr: "بيتك لازم يبقى شبهك، مش شبه الكل.",
    configure: [
      "Size: 160 / 180 / 200 cm",
      "Wood: walnut, oak, or stained",
      "Headboard: linen or velvet",
      "Extras: nightstands, bench, mirror",
    ],
    materials: ["Walnut platform", "Upholstered headboard", "Made-to-measure widths", "Matching nightstands"],
  },
  {
    id: "athar",
    name: "Athar",
    nameAr: "أثر",
    tag: "Art, mirrors, objects",
    from: 6200,
    image: "/images/system-athar.jpg",
    philosophy:
      "Limited objects, numbered. If the edition sells out, we make to order — slightly higher, still yours. Art triptych around 6–7k EGP.",
    philosophyAr: "ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.",
    configure: [
      "Object: art set, mirror, coffee table, limited piece",
      "Wood: walnut, oak, or stained",
      "Edition plaque on or off",
      "Extras: hanging, pairing, complete-the-look",
    ],
    materials: ["50×50 art panels", "Walnut frames", "Numbered plaques", "Geometric inlay"],
  },
];

export const pieces: Piece[] = [
  {
    slug: "saha-rukna",
    name: "Saha Corner",
    nameAr: "ركنة ساحة",
    system: "saha",
    sku: "SAHA-RK-01",
    priceFrom: 31500,
    image: "/images/product-sofa.jpg",
    story: "The gathering piece. Modular so you can live with it, not around it.",
    storyAr: "اختار اللي شبهك، مش اللي شبه الكل.",
    making: "Frame in the workshop, fabric last. About one month.",
  },
  {
    slug: "saha-chair",
    name: "Saha Chair",
    nameAr: "كرسي ساحة",
    system: "saha",
    sku: "SAHA-CH-02",
    priceFrom: 8200,
    image: "/images/product-chair.jpg",
    story: "A dining-adjacent chair that still belongs in the living room.",
    storyAr: "مش كل بيت لازم يبقى بيج.",
    making: "Geometric back, linen seat, walnut legs. Made to order.",
  },
  {
    slug: "saha-armchair",
    name: "Statement Armchair",
    nameAr: "فوتيه",
    system: "saha",
    sku: "SAHA-FT-03",
    priceFrom: 12400,
    image: "/images/product-armchair.jpg",
    story: "One chair can carry a room if it has a point of view.",
    storyAr: "في قطع بتدي المكان شخصية.",
    making: "Sculptural seat, forest velvet or sand linen.",
  },
  {
    slug: "sofra-table",
    name: "Sofra Table",
    nameAr: "ترابيزة سفرة",
    system: "sofra",
    sku: "SOFR-TB-01",
    priceFrom: 18000,
    image: "/images/product-dining-table.jpg",
    story: "A long table for Friday, not a showroom prop.",
    storyAr: "غير كل بيت. وأكتر شبهك.",
    making: "Solid top, handmade edge, oil that darkens honestly.",
  },
  {
    slug: "sofra-sideboard",
    name: "Sofra Sideboard",
    nameAr: "بوفيه",
    system: "sofra",
    sku: "SOFR-SB-04",
    priceFrom: 21400,
    image: "/images/product-sideboard.jpg",
    story: "Storage with mashrabiya rhythm — doors that catch light.",
    storyAr: "Raw craft + refined result.",
    making: "Geometric fronts, walnut carcass, about one month.",
  },
  {
    slug: "layl-bed",
    name: "Layl Bed",
    nameAr: "سرير ليل",
    system: "layl",
    sku: "LAYL-BD-01",
    priceFrom: 42000,
    image: "/images/product-bed.jpg",
    story: "Calm color, custom size, made to live — معمول عشان يعيش.",
    storyAr: "معمول عشان يعيش.",
    making: "Platform + headboard. Sized to your room.",
  },
  {
    slug: "layl-nightstand",
    name: "Layl Nightstand",
    nameAr: "كومودينو",
    system: "layl",
    sku: "LAYL-NS-02",
    priceFrom: 7800,
    image: "/images/product-nightstand.jpg",
    story: "A pair that keeps the bed from floating.",
    storyAr: "Your home. Your character.",
    making: "Walnut box, quiet drawer, matching finish.",
  },
  {
    slug: "athar-art",
    name: "Art Set 50×50",
    nameAr: "طقم لوحات",
    system: "athar",
    sku: "ATHR-AR-01",
    edition: "01/20",
    priceFrom: 6500,
    image: "/images/product-art-set.jpg",
    story: "Three panels. Forest, sand, charcoal. A triptych around 6–7k EGP.",
    storyAr: "ده غير.",
    making: "Numbered. If the edition ends, made-to-order at a slightly higher price.",
  },
  {
    slug: "athar-mirror",
    name: "Kufic Mirror",
    nameAr: "مرآة",
    system: "athar",
    sku: "ATHR-MR-05",
    edition: "07/20",
    priceFrom: 9200,
    image: "/images/product-mirror.jpg",
    story: "Square-kufic frame, slight intentional asymmetry — like the fingerprint.",
    storyAr: "اختلاف له شخصية.",
    making: "Walnut frame, geometric joinery, numbered plaque.",
  },
  {
    slug: "athar-table",
    name: "Coffee Table",
    nameAr: "ترابيزة وسط",
    system: "athar",
    sku: "ATHR-CT-03",
    priceFrom: 11200,
    image: "/images/product-table.jpg",
    story: "Low walnut, visible grain, a handmade edge you can feel.",
    storyAr: "ما يُصنع بالإيد.",
    making: "Solid walnut, oil finish, workshop-made.",
  },
  {
    slug: "athar-limited",
    name: "Limited Bench",
    nameAr: "قطعة محدودة",
    system: "athar",
    sku: "ATHR-LM-04",
    edition: "03/12",
    priceFrom: 14800,
    image: "/images/limited-piece.jpg",
    story: "A small object with a strong silhouette. When it is gone, it is gone — or remade, dearer.",
    storyAr: "غير المتكرر.",
    making: "Numbered edition. Workshop only.",
  },
  {
    slug: "athar-numbered",
    name: "Numbered Panel 04/15",
    nameAr: "لوحة مرقّمة",
    system: "athar",
    sku: "ATHR-PN-04",
    edition: "04/15",
    priceFrom: 6200,
    image: "/images/limited-numbered.jpg",
    story: "A single panel with a plaque. Proof that this one is not infinite.",
    storyAr: "غير المتوقع.",
    making: "Edition of 15. Made in the atelier.",
  },
];

export const rooms: Room[] = [
  {
    slug: "friday-gathering",
    name: "Friday Gathering",
    nameAr: "جمعة",
    type: "Dining",
    image: "/images/dining-friday.jpg",
    total: 61200,
    story: "A long table, chairs with mashrabiya rhythm, room for whoever arrives.",
    storyAr: "خلّي بيتك GHER",
    pieces: ["sofra-table", "saha-chair", "sofra-sideboard", "athar-art"],
  },
  {
    slug: "canal-blue-hour",
    name: "Canal Blue Hour",
    nameAr: "ساعة القناة",
    type: "Dining",
    image: "/images/dining-canal.jpg",
    total: 47800,
    story: "Evening light, walnut, forest drapery. Ismailia in the room without painting a canal.",
    storyAr: "غير كل بيت. وأكتر شبهك.",
    pieces: ["sofra-table", "saha-chair", "athar-mirror"],
  },
  {
    slug: "the-unbeige-living",
    name: "The Unbeige Living",
    nameAr: "مش بيج",
    type: "Living",
    image: "/images/living-unbeige.jpg",
    total: 52800,
    story: "مش كل بيت لازم يبقى بيج. Forest walls, sand seating, walnut shelves.",
    storyAr: "مش كل بيت لازم يبقى بيج.",
    pieces: ["saha-rukna", "athar-table", "athar-art"],
  },
  {
    slug: "after-dark-dining",
    name: "After Dark Dining",
    nameAr: "بعد الضلام",
    type: "Dining",
    image: "/images/dining-after-dark.jpg",
    total: 54200,
    story: "Candle, grain, charcoal wood. A table that looks like a decision.",
    storyAr: "Your home. Your character.",
    pieces: ["sofra-table", "saha-chair", "athar-numbered"],
  },
  {
    slug: "ismailia-morning",
    name: "Ismailia Morning",
    nameAr: "صباح الإسماعيلية",
    type: "Sleep",
    image: "/images/sleep-morning.jpg",
    total: 63800,
    story: "Sunrise textiles, a geometric mirror, a bed that is quiet on purpose.",
    storyAr: "بيتك لازم يبقى شبهك.",
    pieces: ["layl-bed", "layl-nightstand", "athar-mirror"],
  },
  {
    slug: "statement-chair-room",
    name: "Statement Chair Room",
    nameAr: "الكرسي",
    type: "Living",
    image: "/images/living-statement.jpg",
    total: 38600,
    story: "One فوتيه as the hero object. Everything else listens.",
    storyAr: "في قطع بتدي المكان شخصية.",
    pieces: ["saha-armchair", "athar-table", "athar-art"],
  },
  {
    slug: "layl-quiet",
    name: "Layl Quiet",
    nameAr: "ليل هادي",
    type: "Sleep",
    image: "/images/sleep-layl.jpg",
    total: 68400,
    story: "Walnut bed, forest bedding, art above the headboard. Sleep with a temperature.",
    storyAr: "معمول عشان يعيش.",
    pieces: ["layl-bed", "layl-nightstand", "athar-art", "athar-mirror"],
  },
  {
    slug: "deep-gathering",
    name: "Deep Gathering",
    nameAr: "قاعدة",
    type: "Living",
    image: "/images/living-gathering.jpg",
    total: 72100,
    story: "A deep sofa that holds a Friday without looking like a warehouse corner.",
    storyAr: "اختار اللي شبهك، مش اللي شبه الكل.",
    pieces: ["saha-rukna", "saha-armchair", "athar-table", "athar-art"],
  },
  {
    slug: "canal-nook",
    name: "Canal Nook",
    nameAr: "ركن القراءة",
    type: "Living",
    image: "/images/living-nook.jpg",
    total: 29400,
    story: "A chair, a table, morning light. Personality without filling every wall.",
    storyAr: "Different Without Being Unreachable.",
    pieces: ["saha-armchair", "layl-nightstand", "athar-mirror"],
  },
  {
    slug: "forest-living",
    name: "Forest Living",
    nameAr: "غابة البيت",
    type: "Living",
    image: "/images/hero-room.jpg",
    total: 68900,
    story: "The living set: ركنة + كرسي + فوتيه + coffee table — around 50,000 EGP as a starting conversation, more when the room asks.",
    storyAr: "GHER يساعدك تعمل بيت مميز، مختلف، وأكتر شبهك.",
    pieces: ["saha-rukna", "saha-chair", "saha-armchair", "athar-table"],
  },
  {
    slug: "walnut-dining",
    name: "Walnut Dining",
    nameAr: "سفرة جوز",
    type: "Dining",
    image: "/images/dining-room.jpg",
    total: 45600,
    story: "Walnut first. The rest is light and ceramic.",
    storyAr: "Raw craft + refined result.",
    pieces: ["sofra-table", "saha-chair", "sofra-sideboard"],
  },
];

export const journey = [
  { n: "01", title: "Awareness", ar: "تشوف إن البيت ممكن يبقى غير" },
  { n: "02", title: "Interest", ar: "قطع ليها شخصية" },
  { n: "03", title: "Exploration", ar: "Systems, rooms, design" },
  { n: "04", title: "Consultation", ar: "حوار مجاني — اتجاه مش ضغط" },
  { n: "05", title: "Showroom", ar: "صينية فوكس، الإسماعيلية" },
  { n: "06", title: "Style", ar: "نكتشف ذوقك، مش ذوق الكتالوج" },
  { n: "07", title: "Selection", ar: "Living, dining, sleep" },
  { n: "08", title: "Customize", ar: "مقاس، خشب، قماش" },
  { n: "09", title: "Making", ar: "حوالي شهر" },
  { n: "10", title: "Delivery", ar: "وبعدها رعاية" },
];

export function pieceBySlug(slug: string) {
  return pieces.find((p) => p.slug === slug);
}

export function roomBySlug(slug: string) {
  return rooms.find((r) => r.slug === slug);
}

export function systemById(id: string) {
  return systems.find((s) => s.id === id);
}

export function formatEGP(value: number) {
  return `EGP ${value.toLocaleString("en-US")}`;
}
