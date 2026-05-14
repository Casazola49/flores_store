"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { publicApi } from "@/lib/api";
import type { Product, Category } from "@/types";

// High quality placeholders for MVP
const MOCK_PRODUCTS: Product[] = [
  {
    id: 991, name: "Bota Chelsea Noir", slug: "bota-chelsea-noir", brand: "Flores", base_price: 450, is_new: true,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=800" }],
    description: "", category_id: 1, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: ""
  },
  {
    id: 992, name: "Sneaker Urban White", slug: "sneaker-urban-white", brand: "Flores", base_price: 320, is_new: false,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800" }],
    description: "", category_id: 2, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: ""
  },
  {
    id: 993, name: "Taco Stiletto Gold", slug: "taco-stiletto-gold", brand: "Flores", base_price: 580, is_new: true,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800" }],
    description: "", category_id: 3, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: ""
  },
  {
    id: 994, name: "Mocasin Elegance", slug: "mocasin-elegance", brand: "Flores", base_price: 420, is_new: false,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=800" }],
    description: "", category_id: 4, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: ""
  }
];

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const isNew = searchParams.get("is_new") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          publicApi.getProducts({ category: categorySlug || undefined, is_new: isNew || undefined }),
          publicApi.getCategories()
        ]);
        
        const realProducts = prodRes.data?.data || [];
        if (realProducts.length > 0) {
          setProducts(realProducts);
        } else {
          setProducts(MOCK_PRODUCTS);
        }

        if (catRes.data) {
          setCategories(catRes.data);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [categorySlug, isNew]);

  const pageTitle = isNew ? "Novedades" : categorySlug ? categorySlug : "Catálogo";

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header Aria Style */}
      <div className="bg-black text-white py-20 mb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-[var(--color-accent)] mb-4">
            <Link href="/" className="hover:underline">Inicio</Link> 
            <ChevronRight size={12} />
            <span className="text-white">{pageTitle}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
            {pageTitle} <span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="text-white/60 text-xs font-bold tracking-widest uppercase">
            {products.length} Resultados encontrados
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[#f9f9f9] p-8 rounded-[var(--radius-lg)]">
              <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                <span className="w-1 h-5 bg-[var(--color-accent)]" />
                Categorías
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/productos" className={`text-[11px] font-bold tracking-widest uppercase hover:text-[var(--color-accent)] transition-colors ${!categorySlug ? 'text-[var(--color-accent)]' : 'text-gray-400'}`}>
                    Ver Todo
                  </Link>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link 
                      href={`/productos?category=${cat.slug}`} 
                      className={`text-[11px] font-bold tracking-widest uppercase hover:text-[var(--color-accent)] transition-colors ${categorySlug === cat.slug ? 'text-[var(--color-accent)]' : 'text-gray-400'}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-[var(--radius-lg)]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {products.map((product) => (
                  <Link key={product.id} href={`/productos/${product.slug}`} className="group block">
                    <div className="relative aspect-[3/4] bg-[#fdfdfd] rounded-[var(--radius-lg)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 mb-6">
                      <Image 
                        src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800"} 
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-black text-[var(--color-accent)] px-3 py-1 rounded-full text-[9px] font-black uppercase">
                        Sale
                      </div>
                    </div>
                    
                    <div className="px-2">
                      <h3 className="text-[10px] font-black uppercase tracking-tight mb-2 group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black tracking-tight">Bs. {Number(product.base_price).toFixed(0)}</span>
                        <span className="text-xs text-gray-300 line-through font-bold">Bs. {Number(product.base_price * 1.5).toFixed(0)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
