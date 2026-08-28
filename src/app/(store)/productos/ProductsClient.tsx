"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Product, Category } from "@/types";

// High quality placeholders for MVP
const MOCK_PRODUCTS: Product[] = [
  {
    id: 991 as any, name: "Chelsea Noir", slug: "bota-chelsea-noir", brand: "Aria", base_price: 450, is_new: true,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=800" }],
    description: "Elegancia atemporal en cuero genuino.", category_id: 1, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: "", tags: ["exclusivo"]
  },
  {
    id: 992 as any, name: "Urban Velocity", slug: "sneaker-urban-white", brand: "Aria", base_price: 320, is_new: false,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800" }],
    description: "Comodidad suprema para el día a día.", category_id: 2, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: "", tags: []
  },
  {
    id: 993 as any, name: "Stiletto Oro", slug: "taco-stiletto-gold", brand: "Aria", base_price: 580, is_new: true,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800" }],
    description: "Impacto visual y altura para tus eventos.", category_id: 3, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: "", tags: []
  },
  {
    id: 994 as any, name: "Mocasin Arch", slug: "mocasin-elegance", brand: "Aria", base_price: 420, is_new: false,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=800" }],
    description: "El toque clásico para un look profesional.", category_id: 4, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: "", tags: []
  },
  {
    id: 995 as any, name: "Desert Muse", slug: "sandalia-desert-sand", brand: "Aria", base_price: 280, is_new: true,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1562273103-91206777044a?q=80&w=800" }],
    description: "Frescura y estilo para el verano.", category_id: 5, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: "", tags: []
  },
  {
    id: 996 as any, name: "Combat Rugged", slug: "bota-militar-rugged", brand: "Aria", base_price: 490, is_new: false,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1520639889410-d042466df810?q=80&w=800" }],
    description: "Resistencia y carácter en cada paso.", category_id: 1, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: "", tags: []
  },
  {
    id: 997 as any, name: "Loafer Studio", slug: "loafer-studio", brand: "Aria", base_price: 390, is_new: true,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800" }],
    description: "Minimalismo estructural.", category_id: 4, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: "", tags: []
  },
  {
    id: 998 as any, name: "Heel Platinum", slug: "heel-platinum", brand: "Aria", base_price: 620, is_new: true,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1515347648415-0f53bbca466d?q=80&w=800" }],
    description: "Reflectividad y lujo.", category_id: 3, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: "", tags: ["exclusivo"]
  }
];

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const isNew = searchParams.get("is_new") === "true";
  const isSale = searchParams.get("sale") === "true";
  const collection = searchParams.get("collection");
  const isExclusive = collection === "exclusive";

  // Queries reactivas de Convex
  const categoriesData = useQuery(api.categories.getCategories);
  const productsResult = useQuery(api.products.getProducts, {
    category: categorySlug || undefined,
    is_new: isNew ? true : undefined,
    sale: isSale ? true : undefined,
    tag: isExclusive ? "exclusivo" : undefined,
  });

  const categories = categoriesData || [];
  const rawProducts = productsResult?.data || [];
  
  // Si la BD tiene productos, usa los de la BD; de lo contrario usa mocks filtrados por exclusivo si corresponde
  const products = rawProducts.length > 0 
    ? (rawProducts as any[]) 
    : (isExclusive 
        ? MOCK_PRODUCTS.filter(p => p.tags && p.tags.includes("exclusivo")) 
        : MOCK_PRODUCTS);
        
  const loading = productsResult === undefined || categoriesData === undefined;

  const pageTitle = isNew 
    ? "The Archive" 
    : isSale 
      ? "Final Sale" 
      : isExclusive 
        ? "Bóveda Privada" 
        : categorySlug 
          ? categorySlug 
          : "Collection";

  return (
    <div className="bg-white min-h-screen pb-40 pt-40">
      {/* Editorial Header */}
      <div className="container mx-auto px-6 mb-32">
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-12">
            <div>
                <div className="flex items-center gap-4 text-[9px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-8">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link> 
                    <span className="w-4 h-[1px] bg-gray-200" />
                    <span className="text-black">{pageTitle}</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-serif font-black uppercase tracking-tighter leading-none">
                    {pageTitle}<span className="text-[var(--color-accent)]">.</span>
                </h1>
            </div>
            <div className="max-w-xs">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase leading-loose text-gray-400">
                    Descubre nuestra selección de piezas arquitectónicas. {products.length} Objetos de deseo disponibles.
                </p>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-24">
          {/* Minimalist Sidebar */}
          <aside className="w-full lg:w-48 flex-shrink-0">
            <div className="sticky top-40 space-y-20">
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-12 text-gray-300">Catalog</h3>
                <ul className="space-y-6">
                    <li>
                    <Link href="/productos" className={`text-[10px] font-bold tracking-[0.3em] uppercase hover:text-black transition-colors ${!categorySlug && !isNew && !isSale ? 'text-black border-b border-black pb-1' : 'text-gray-400'}`}>
                        All Pieces
                    </Link>
                    </li>
                    <li>
                    <Link href="/productos?is_new=true" className={`text-[10px] font-bold tracking-[0.3em] uppercase hover:text-black transition-colors ${isNew ? 'text-black border-b border-black pb-1' : 'text-gray-400'}`}>
                        New Arrivals
                    </Link>
                    </li>
                    <li>
                    <Link href="/productos?sale=true" className={`text-[10px] font-bold tracking-[0.3em] uppercase hover:text-[var(--color-accent)] transition-colors ${isSale ? 'text-[var(--color-accent)] border-b border-[var(--color-accent)] pb-1' : 'text-gray-400'}`}>
                        Archive Sale
                    </Link>
                    </li>
                </ul>
              </section>

              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-12 text-gray-300">Categories</h3>
                <ul className="space-y-6">
                    {categories.length > 0 ? (categories as any[]).map((cat: any) => (
                    <li key={cat.id}>
                        <Link 
                        href={`/productos?category=${cat.slug}`} 
                        className={`text-[10px] font-bold tracking-[0.3em] uppercase hover:text-black transition-colors ${categorySlug === cat.slug ? 'text-black border-b border-black pb-1' : 'text-gray-400'}`}
                        >
                        {cat.name}
                        </Link>
                    </li>
                    )) : (
                        ['Botas', 'Sneakers', 'Tacos', 'Loafers'].map(name => (
                            <li key={name}>
                                <Link href="#" className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 hover:text-black transition-colors">{name}</Link>
                            </li>
                        ))
                    )}
                </ul>
              </section>
            </div>
          </aside>

          {/* Gallery Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex flex-col gap-8">
                    <div className="aspect-[3/4] bg-[#F9F9F9] animate-pulse" />
                    <div className="h-4 bg-[#F9F9F9] w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-32">
                {products.map((product) => (
                  <Link key={product.id} href={`/productos/${product.slug}`} className="group block">
                    <div className="relative aspect-[3/4] bg-[#F9F9F9] overflow-hidden border border-gray-100 mb-10">
                      <Image 
                        src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800"} 
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                      {product.is_new && (
                        <div className="absolute top-6 left-6 bg-white text-black px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] border border-black/5">
                            New
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-baseline mb-4">
                        <h3 className="text-[11px] font-serif font-bold uppercase tracking-tight line-clamp-1 flex-1 pr-4">
                            {product.name}
                        </h3>
                        <span className="text-[var(--color-accent)] text-[9px] font-bold tracking-[0.2em]">ARIA</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-xl font-bold tracking-tighter">Bs. {Number(product.base_price).toFixed(0)}</span>
                        <span className="text-[10px] text-gray-300 line-through font-bold">Bs. {Number(product.base_price * 1.5).toFixed(0)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {!loading && products.length === 0 && (
                <div className="py-40 text-center">
                    <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400">No pieces found in this archive selection.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
