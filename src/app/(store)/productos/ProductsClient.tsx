/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import ProductCard, { mapProductToCardData } from "@/components/store/ProductCard";

export default function ProductsClient() {
  const params = useSearchParams();
  const category = params.get("category");
  const isNew = params.get("is_new") === "true";
  const isSale = params.get("sale") === "true";
  const exclusive = params.get("collection") === "exclusive";

  const categories = useQuery(api.categories.getCategories) || [];
  const result = useQuery(api.products.getProducts, {
    category: category || undefined,
    is_new: isNew ? true : undefined,
    sale: isSale ? true : undefined,
    tag: exclusive ? "exclusivo" : undefined,
  });

  const products = result?.data || [];
  const title = isNew
    ? "Novedades"
    : isSale
    ? "Liquidación"
    : exclusive
    ? "Exclusivos"
    : category || "Catálogo";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-40 pb-32">
      <div className="container">
        <div className="mb-20">
          <p className="text-label text-[var(--color-text-muted)] mb-6">
            <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">
              Inicio
            </Link>{" "}
            / {title}
          </p>
          <h1 className="text-display font-serif font-black tracking-tight">
            {title}
            <span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="text-body text-[var(--color-text-muted)] mt-6">
            {products.length} Productos disponibles
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <aside className="w-full lg:w-48 shrink-0">
            <h2 className="text-label mb-6">Categorías</h2>
            <div className="space-y-4">
              {categories.map((cat: any) => (
                <Link
                  className="block text-body hover:text-[var(--color-accent)] transition-colors"
                  key={cat.id || cat._id}
                  href={`/productos?category=${cat.slug}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </aside>

          <main className="flex-1">
            {result === undefined ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-product skeleton" />
                ))}
              </div>
            ) : products.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={mapProductToCardData(product)}
                    variant="light"
                  />
                ))}
              </div>
            ) : (
              <p className="text-body text-[var(--color-text-muted)] py-20">
                No encontramos productos en esta selección.
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
