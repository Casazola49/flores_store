"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useFavoritesStore } from "@/lib/favorites";
import type { Product } from "@/types";
import ProductCard, { mapProductToCardData } from "@/components/store/ProductCard";

export default function FavoritesClient() {
  const slugs = useFavoritesStore((state) => state.slugs);
  const products = useQuery(api.products.getProductsBySlugs, { slugs });

  const loading = slugs.length > 0 && products === undefined;
  const liveProducts = ((products || []).filter(Boolean) as unknown as Product[]);
  const isEmpty = !loading && liveProducts.length === 0;

  return (
    <div className="bg-white min-h-screen pt-36 pb-32">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 text-label font-bold tracking-[0.4em] uppercase text-gray-400 mb-12">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="w-4 h-[1px] bg-gray-200" />
          <span className="text-black">Favoritos</span>
        </div>

        {/* Header */}
        <div className="border-b border-gray-100 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-accent)] block mb-2">
              Tu selección
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-black uppercase tracking-tight text-black">
              Mis favoritos
            </h1>
          </div>
          {!isEmpty && (
            <p className="text-label text-gray-400 font-bold uppercase tracking-widest">
              {liveProducts.length} {liveProducts.length === 1 ? "artículo guardado" : "artículos guardados"}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-1 bg-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-black animate-slide-infinite" />
            </div>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400">
              Cargando tus favoritos
            </p>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-gray-200 text-gray-400 rounded-none">
              <Heart size={28} aria-hidden="true" />
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold uppercase text-black mb-3">
              No tienes favoritos aún
            </h2>
            <p className="text-body text-gray-500 text-sm leading-relaxed mb-8">
              Guarda tus modelos preferidos haciendo clic en el corazón de cualquier producto para verlos aquí en cualquier momento.
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[var(--color-accent)] transition-colors rounded-none"
            >
              <span>Explorar catálogo</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {!isEmpty && !loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {liveProducts.map((product) => (
              <ProductCard
                key={product.slug || String(product.id)}
                product={mapProductToCardData(product)}
                variant="light"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
