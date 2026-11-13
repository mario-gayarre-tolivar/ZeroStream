import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { displayFont, sansFont } from "./fonts";

const siteUrl =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://zerostream.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZeroStream — Streaming Libre de Anime, Películas y Series",
    template: "%s | ZeroStream",
  },
  description:
    "Plataforma unificada para explorar y reproducir anime, películas y series bajo arquitectura Zero-Storage y costo cero.",
  openGraph: {
    title: "ZeroStream — Streaming Libre",
    description:
      "Plataforma unificada para explorar y reproducir anime, películas y series en alta definición.",
    siteName: "ZeroStream",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeroStream — Streaming Libre",
    description: "Anime, películas y series en alta definición.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className={`${displayFont.variable} ${sansFont.variable} min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-accent selection:text-accent-ink`}>
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
