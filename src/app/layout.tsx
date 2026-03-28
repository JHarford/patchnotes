import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patch Note — Video Game Industry Newsletter",
  description:
    "Daily briefing on game studio movements, dev tools, engine papers, and industry news.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
