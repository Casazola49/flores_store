import { Metadata } from "next";
import ProductsClient from "./ProductsClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Colecciones | Flores Studio - Aria Liquidación",
  description: "Explora nuestra selección exclusiva de botas, zapatillas y tacos en liquidación. Calidad premium al mejor precio en Bolivia.",
};

export default function ProductosPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-black animate-spin rounded-full" />
      <p className="text-[10px] font-black tracking-[0.4em] uppercase">Cargando Catálogo...</p>
    </div>}>
      <ProductsClient />
    </Suspense>
  );
}
