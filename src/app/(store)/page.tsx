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
    images: ["https://res.cloudinary.com/dggj5tnke/image/upload/flores/placeholders/foto-pendiente.jpg"],
  },
};

export default function Home() {
  return <HomeClient />;
}
