import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Flores | Calzado premium en Bolivia",
  description:
    "Botas, tacos y zapatillas con stock real en Cochabamba y Santa Cruz. Envíos a todo Bolivia.",
  openGraph: {
    title: "Flores | Calzado premium en Bolivia",
    description:
      "Botas, tacos y zapatillas con stock real en Cochabamba y Santa Cruz. Envíos a todo Bolivia.",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800"],
  },
};

export default function Home() {
  return <HomeClient />;
}
