export type Wood = "walnut" | "oak" | "stained";
export type Fabric = "sand" | "forest" | "charcoal";

export type StartingPiece = {
  id: string;
  system: "saha" | "sofra" | "layl" | "athar";
  name: string;
  nameAr: string;
  base: number;
  images: Record<string, string>;
};

export const woods: { id: Wood; label: string; add: number }[] = [
  { id: "walnut", label: "Walnut", add: 0 },
  { id: "oak", label: "Oak", add: 1500 },
  { id: "stained", label: "Stained", add: 2500 },
];

export const fabrics: { id: Fabric; label: string; add: number }[] = [
  { id: "sand", label: "Sand linen", add: 0 },
  { id: "forest", label: "Forest velvet", add: 3500 },
  { id: "charcoal", label: "Charcoal weave", add: 2000 },
];

export const sizes: Record<string, { id: string; label: string; add: number }[]> = {
  saha: [
    { id: "180", label: "180 cm", add: 0 },
    { id: "240", label: "240 cm", add: 8000 },
    { id: "300", label: "300 cm ركنة", add: 16000 },
  ],
  sofra: [
    { id: "140", label: "140 cm", add: 0 },
    { id: "180", label: "180 cm", add: 4500 },
    { id: "220", label: "220 cm", add: 9000 },
  ],
  layl: [
    { id: "160", label: "160 cm", add: 0 },
    { id: "180", label: "180 cm", add: 5000 },
    { id: "200", label: "200 cm", add: 9000 },
  ],
  athar: [
    { id: "std", label: "Standard", add: 0 },
    { id: "pair", label: "Paired", add: 3800 },
  ],
};

export const extrasCatalog: Record<
  string,
  { id: string; label: string; add: number }[]
> = {
  saha: [
    { id: "ottoman", label: "Ottoman", add: 6500 },
    { id: "cushions", label: "Cushion set", add: 1800 },
    { id: "plaque", label: "Numbered plaque", add: 900 },
  ],
  sofra: [
    { id: "chairs4", label: "4 chairs", add: 24800 },
    { id: "chairs6", label: "6 chairs", add: 37200 },
    { id: "bench", label: "Bench", add: 9200 },
  ],
  layl: [
    { id: "nights", label: "Nightstand pair", add: 15600 },
    { id: "bench", label: "Bed bench", add: 8800 },
    { id: "mirror", label: "Kufic mirror", add: 9200 },
  ],
  athar: [
    { id: "hang", label: "Hanging & spacing", add: 600 },
    { id: "plaque", label: "Edition plaque", add: 400 },
    { id: "look", label: "Complete-the-look consult", add: 0 },
  ],
};

export const startingPieces: StartingPiece[] = [
  {
    id: "rukna",
    system: "saha",
    name: "Corner sofa",
    nameAr: "ركنة",
    base: 31500,
    images: {
      "walnut-forest": "/images/product-sofa.jpg",
      "walnut-sand": "/images/product-sofa-sand.jpg",
      "walnut-charcoal": "/images/product-sofa-stained.jpg",
      "oak-forest": "/images/system-saha.jpg",
      "oak-sand": "/images/product-sofa-sand.jpg",
      "oak-charcoal": "/images/product-sofa-stained.jpg",
      "stained-forest": "/images/product-sofa-stained.jpg",
      "stained-sand": "/images/living-gathering.jpg",
      "stained-charcoal": "/images/product-sofa-stained.jpg",
    },
  },
  {
    id: "chair",
    system: "saha",
    name: "Chair",
    nameAr: "كرسي",
    base: 8200,
    images: {
      default: "/images/product-chair.jpg",
    },
  },
  {
    id: "armchair",
    system: "saha",
    name: "Armchair",
    nameAr: "فوتيه",
    base: 12400,
    images: {
      default: "/images/product-armchair.jpg",
      forest: "/images/product-armchair.jpg",
      sand: "/images/living-statement.jpg",
    },
  },
  {
    id: "table",
    system: "sofra",
    name: "Dining table",
    nameAr: "ترابيزة سفرة",
    base: 18000,
    images: {
      walnut: "/images/product-dining-table.jpg",
      oak: "/images/product-table-oak.jpg",
      stained: "/images/product-table-stained.jpg",
    },
  },
  {
    id: "sideboard",
    system: "sofra",
    name: "Sideboard",
    nameAr: "بوفيه",
    base: 21400,
    images: {
      default: "/images/product-sideboard.jpg",
    },
  },
  {
    id: "bed",
    system: "layl",
    name: "Bed",
    nameAr: "سرير",
    base: 42000,
    images: {
      default: "/images/product-bed.jpg",
      sand: "/images/sleep-morning.jpg",
      forest: "/images/sleep-layl.jpg",
    },
  },
  {
    id: "art",
    system: "athar",
    name: "Art triptych 50×50",
    nameAr: "طقم لوحات",
    base: 6500,
    images: {
      default: "/images/product-art-set.jpg",
      numbered: "/images/limited-numbered.jpg",
    },
  },
  {
    id: "mirror",
    system: "athar",
    name: "Kufic mirror",
    nameAr: "مرآة",
    base: 9200,
    images: {
      default: "/images/product-mirror.jpg",
    },
  },
  {
    id: "coffee",
    system: "athar",
    name: "Coffee table",
    nameAr: "ترابيزة وسط",
    base: 11200,
    images: {
      walnut: "/images/product-table.jpg",
      oak: "/images/product-table-oak.jpg",
      stained: "/images/product-table-stained.jpg",
    },
  },
];

export function previewImage(
  piece: StartingPiece,
  wood: Wood,
  fabric: Fabric,
): string {
  const keys = [
    `${wood}-${fabric}`,
    wood,
    fabric,
    "default",
    Object.keys(piece.images)[0],
  ];
  for (const key of keys) {
    if (key && piece.images[key]) return piece.images[key];
  }
  return "/images/hero-room.jpg";
}

export function priceOf(opts: {
  base: number;
  system: string;
  sizeId: string;
  wood: Wood;
  fabric: Fabric;
  extras: string[];
}) {
  const sizeAdd = sizes[opts.system]?.find((s) => s.id === opts.sizeId)?.add ?? 0;
  const woodAdd = woods.find((w) => w.id === opts.wood)?.add ?? 0;
  const fabricAdd =
    opts.system === "sofra" || opts.system === "athar"
      ? 0
      : fabrics.find((f) => f.id === opts.fabric)?.add ?? 0;
  const extraAdd = (extrasCatalog[opts.system] ?? [])
    .filter((e) => opts.extras.includes(e.id))
    .reduce((sum, e) => sum + e.add, 0);
  return opts.base + sizeAdd + woodAdd + fabricAdd + extraAdd;
}

export const complements: Record<string, string[]> = {
  rukna: ["athar-table", "saha-armchair", "athar-art"],
  chair: ["sofra-table", "athar-mirror"],
  armchair: ["athar-table", "athar-art"],
  table: ["saha-chair", "sofra-sideboard", "athar-art"],
  sideboard: ["sofra-table", "athar-mirror"],
  bed: ["layl-nightstand", "athar-mirror", "athar-art"],
  art: ["athar-mirror", "athar-table"],
  mirror: ["athar-art", "layl-nightstand"],
  coffee: ["saha-armchair", "athar-art"],
};
