import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SnowEffect } from "./components/SnowEffect";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wolfy — Find Your Inner Wolf",
  description:
    "Answer five questions. Discover your mythical wolf archetype. Share your spirit with the pack.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Wolfy — Find Your Inner Wolf",
    description: "Discover your mythical wolf archetype.",
    siteName: "Wolfy",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SnowEffect />
        <div className="relative z-20">{children}</div>
      </body>
    </html>
  );
}
