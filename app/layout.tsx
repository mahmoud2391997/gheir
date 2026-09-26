import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/src/components/Providers";
import { OG_IMAGE, SITE } from "@/lib/seo";
import "@/src/index.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "GHEIR / غير — خلّي بيتك GHEIR",
    template: "%s",
  },
  description: "GHEIR is a handcrafted furniture atelier in Ismailia. What is made by hand can never be truly copied. ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "GHEIR / غير",
    url: SITE,
    title: "GHEIR / غير — خلّي بيتك GHEIR",
    description: "Handcrafted furniture from the Ismailia atelier. ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    images: [{ url: OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GHEIR / غير — خلّي بيتك GHEIR",
    description: "Handcrafted furniture from the Ismailia atelier. ما يُصنع بالإيد، لا يمكن أن يُقلَّد حقًا.",
    images: [OG_IMAGE],
  },
  icons: { icon: "/brand/new/logo-icon-only.png", apple: "/brand/new/logo-icon-only.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ivory text-charcoal antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
