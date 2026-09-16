/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import ProductCard, { mapProductToCardData } from "@/components/store/ProductCard";

const SIZES = ["34", "35", "36", "37", "38", "39", "40", "41", "42"];

export default function ProductsClient() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category");
  const isNew = params.get("is_new") === "true";
  const isSale = params.get("sale") === "true";
  const exclusive = params.get("collection") === "exclusive";

  // Client-side interactive filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "newest">("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categories = useQuery(api.categories.getCategories) || [];
  
  // Fetch up to 100 products so all 30 catalog items are available
  const result = useQuery(api.products.getProducts, {
    category: category || undefined,
    is_new: isNew ? true : undefined,
    sale: isSale ? true : undefined,
    tag: exclusive ? "exclusivo" : undefined,
    limit: 100,
  });

  const rawProducts = result?.data || [];

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    // Filter by search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category_slug && p.category_slug.toLowerCase().includes(q))
      );
    }

    // Filter by size (only products with stock in that size)
    if (selectedSize) {
      list = list.filter((p) =>
        p.variants?.some(
          (v: any) => String(v.size) === String(selectedSize) && (v.stock || 0) > 0
        )
      );
    }

    // Sort
    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));
    }

    return list;
  }, [rawProducts, searchTerm, selectedSize, sortBy]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedSize || sortBy !== "default" || category || isNew || isSale || exclusive
  );

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedSize(null);
    setSortBy("default");
    router.push("/productos");
  };

  const title = isNew
    ? "Novedades"
    : isSale
    ? "Liquidación"
    : exclusive
    ? "Exclusivos"
    : category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "Catálogo";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-36 md:pt-40 pb-32">
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Breadcrumb & Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-label text-[var(--color-text-muted)] mb-4">
            <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)]">{title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10">
            <div>
              <h1 className="text-display font-serif font-black tracking-tight">
                {title}
                <span className="text-[var(--color-accent)]">.</span>
              </h1>
              <p className="text-body text-[var(--color-text-muted)] mt-2">
                {filteredProducts.length} {filteredProducts.length === 1 ? "producto disponible" : "productos disponibles"}
              </p>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center justify-center gap-2 border border-black/20 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <SlidersHorizontal size={16} />
              <span>{mobileFiltersOpen ? "Ocultar filtros" : "Filtros y búsqueda"}</span>
            </button>
          </div>
        </div>

        {/* Layout: Sidebar + Main Grid */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Filters Sidebar */}
          <aside
            className={`w-full lg:w-64 shrink-0 space-y-8 ${
              mobileFiltersOpen ? "block" : "hidden lg:block"
            } bg-white lg:bg-transparent p-6 lg:p-0 border lg:border-none border-black/10`}
          >
            {/* Search */}
            <div>
              <label htmlFor="search-input" className="text-label text-[var(--color-text)] font-bold uppercase tracking-wider block mb-3">
                Buscar
              </label>
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Modelo, bota, taco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-black/20 text-xs font-semibold focus:outline-none focus:border-[var(--color-accent)] rounded-none"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer p-0.5"
                    aria-label="Borrar búsqueda"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-label text-[var(--color-text)] font-bold uppercase tracking-wider mb-3">
                Categorías
              </h2>
              <div className="space-y-1">
                <Link
                  href="/productos"
                  className={`block text-xs py-1.5 px-2 transition-colors ${
                    !category && !isNew && !isSale && !exclusive
                      ? "bg-black text-white font-bold"
                      : "text-[var(--color-text-muted)] hover:text-black hover:bg-black/5 font-medium"
                  }`}
                >
                  Todas las categorías
                </Link>
                {categories.map((cat: any) => {
                  const isActive = category === cat.slug;
                  return (
                    <Link
                      key={cat.id || cat._id}
                      href={`/productos?category=${cat.slug}`}
                      className={`block text-xs py-1.5 px-2 transition-colors ${
                        isActive
                          ? "bg-[var(--color-accent)] text-white font-bold"
                          : "text-[var(--color-text-muted)] hover:text-black hover:bg-black/5 font-medium"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-label text-[var(--color-text)] font-bold uppercase tracking-wider">
                  Filtrar por talle
                </h2>
                {selectedSize && (
                  <button
                    onClick={() => setSelectedSize(null)}
                    className="text-[10px] text-[var(--color-accent)] font-bold hover:underline cursor-pointer"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(isSelected ? null : size)}
                      className={`h-9 flex items-center justify-center text-xs font-bold transition-all border rounded-none cursor-pointer ${
                        isSelected
                          ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-sm"
                          : "border-black/15 bg-white text-[var(--color-text-muted)] hover:border-black hover:text-black"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collections Quick Links */}
            <div>
              <h2 className="text-label text-[var(--color-text)] font-bold uppercase tracking-wider mb-3">
                Colecciones
              </h2>
              <div className="space-y-1 text-xs">
                <Link
                  href="/productos?is_new=true"
                  className={`block py-1.5 px-2 transition-colors ${
                    isNew ? "bg-black text-white font-bold" : "text-[var(--color-text-muted)] hover:text-black"
                  }`}
                >
                  Novedades
                </Link>
                <Link
                  href="/productos?sale=true"
                  className={`block py-1.5 px-2 transition-colors ${
                    isSale ? "bg-[var(--color-accent)] text-white font-bold" : "text-[var(--color-text-muted)] hover:text-black"
                  }`}
                >
                  Liquidación real
                </Link>
                <Link
                  href="/productos?collection=exclusive"
                  className={`block py-1.5 px-2 transition-colors ${
                    exclusive ? "bg-black text-white font-bold" : "text-[var(--color-text-muted)] hover:text-black"
                  }`}
                >
                  Exclusivos
                </Link>
              </div>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="w-full py-2.5 px-3 border border-black/20 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-black hover:border-black transition-colors cursor-pointer"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            )}
          </aside>

          {/* Main Catalog View */}
          <main className="flex-1 w-full">
            {/* Top Toolbar (Sort & Active Chips) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-black/10">
              {/* Active Filter Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedSize && (
                  <span className="inline-flex items-center gap-1.5 bg-black text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
                    Talle: {selectedSize}
                    <button
                      onClick={() => setSelectedSize(null)}
                      className="hover:text-[var(--color-accent)] cursor-pointer"
                      aria-label="Quitar filtro de talle"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 bg-black text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
                    "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:text-[var(--color-accent)] cursor-pointer"
                      aria-label="Quitar filtro de búsqueda"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto ml-auto">
                <ArrowUpDown size={14} className="text-gray-400" />
                <label htmlFor="sort-select" className="sr-only">
                  Ordenar productos
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-black/20 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] rounded-none cursor-pointer"
                >
                  <option value="default">Ordenar por: Predeterminado</option>
                  <option value="price_asc">Precio: Menor a Mayor</option>
                  <option value="price_desc">Precio: Mayor a Menor</option>
                  <option value="newest">Más recientes</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {result === undefined ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-neutral-200 animate-pulse rounded-none" />
                ))}
              </div>
            ) : filteredProducts.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                {filteredProducts.map((product: any) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={mapProductToCardData(product)}
                    variant="light"
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-black/15 p-12 bg-white">
                <p className="text-title font-serif font-black uppercase tracking-tight mb-2">
                  No encontramos resultados
                </p>
                <p className="text-body text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto">
                  No hay calzados disponibles con los filtros o el término de búsqueda actual.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center justify-center bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  Ver todos los modelos
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
