import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "GHEIR | Studio Operations",
  description: "GHEIR furniture and interiors studio administration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

