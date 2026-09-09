import type { Metadata } from "next";
import FavoritesClient from "./FavoritesClient";

export const metadata: Metadata = {
  title: "Mis favoritos | Flores",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
