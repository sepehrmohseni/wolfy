import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
    "Answer five questions and discover your unique mythical wolf archetype. AI-generated personality, origin story, and spirit portrait. Share your wolf with the pack.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  keywords: [
    "wolf personality quiz",
    "spirit animal quiz",
    "wolf archetype",
    "AI wolf generator",
    "mythical wolf",
    "personality test",
    "find your inner wolf",
  ],
  authors: [{ name: "Sepehr", url: "https://sepr.dev" }],
  creator: "Sepehr",
  openGraph: {
    title: "Wolfy — Find Your Inner Wolf",
    description:
      "Answer five questions and discover your unique mythical wolf archetype with AI-generated art.",
    siteName: "Wolfy",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wolfy — Find Your Inner Wolf",
    description:
      "Discover your mythical wolf archetype. AI-powered spirit quiz.",
  },
  robots: {
    index: true,
    follow: true,
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
        <Analytics />
      </body>
    </html>
  );
}
