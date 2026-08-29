import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Flores | Calzado Premium para Toda la Familia",
  description: "Últimas tallas en botas, tacos y zapatillas. Liquidación real con stock limitado y envíos 48h a todo Bolivia.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    locale: "es_BO",
    type: "website",
    siteName: "Flores",
    title: "Flores | Calzado Premium para Toda la Familia",
    description: "Últimas tallas en botas, tacos y zapatillas. Liquidación real con stock limitado y envíos 48h a todo Bolivia.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
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
    <html lang="es" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
