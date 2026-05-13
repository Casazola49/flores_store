import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLORES. | Calzados, Botas y Billeteras",
  description: "La mejor selección de botas, billeteras y calzados de alta calidad en Bolivia. Envíos a todo el país.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
