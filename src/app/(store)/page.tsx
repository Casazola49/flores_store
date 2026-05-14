import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Flores Studio | Aria Liquidación - Calzado Premium en Bolivia",
  description: "Aprovecha la liquidación total de Flores Studio en colaboración con Aria. Hasta 70% de descuento en botas, zapatillas y tacos seleccionados. Calidad premium garantizada.",
  openGraph: {
    title: "Flores Studio | Aria Liquidación",
    description: "Liquidación exclusiva de calzado premium en todo Bolivia.",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800"],
  },
};

export default function Home() {
  return <HomeClient />;
}
