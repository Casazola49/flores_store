"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Product } from "@/types";
import ProductCard, { mapProductToCardData } from "./ProductCard";

interface RelatedProductsProps {
  categorySlug: string;
  gender?: string;
  currentSlug: string;
}

export default function RelatedProducts({ categorySlug, gender, currentSlug }: RelatedProductsProps) {
  const relatedProducts = useQuery(api.products.getRelatedProducts, {
    categorySlug,
    gender,
    excludeSlug: currentSlug,
    limit: 4,
  });

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  // Double check currentSlug is strictly excluded
  const filtered = (relatedProducts as unknown as Product[])
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 4);

  if (filtered.length === 0) {
    return null;
  }

  return (
    <section className="py-20 border-t border-gray-100 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-accent)] block mb-2">
            Recomendados
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-black uppercase tracking-tight text-black">
            También te puede interesar
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.slug || String(product.id)}
              product={mapProductToCardData(product)}
              variant="light"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
