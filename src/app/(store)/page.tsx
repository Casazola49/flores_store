import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Flores | Calzado Premium para Toda la Familia - Bolivia",
  description:
    "Últimas tallas en botas, tacos y zapatillas. Liquidación real con stock limitado y envíos a todo Bolivia.",
  openGraph: {
    title: "Flores | Calzado Premium para Toda la Familia",
    description:
      "Últimas tallas en botas, tacos y zapatillas. Liquidación real con stock limitado y envíos a todo Bolivia.",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800"],
  },
};

export default function Home() {
  return <HomeClient />;
}
