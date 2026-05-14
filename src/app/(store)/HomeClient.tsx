"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { publicApi } from "@/lib/api";
import type { Product } from "@/types";
import ImageCategoryGrid from "@/components/store/ImageCategoryGrid";

export default function HomeClient() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await publicApi.getProducts({ is_new: true, limit: 8 });
        if (res.data?.data) {
          setFeaturedProducts(res.data.data);
        }
      } catch (error) {
        console.error("Error loading home products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Banner de Liquidación - Estilo Aria */}
      <div className="bg-[var(--color-accent)] text-black py-3 text-center text-xs font-black tracking-widest uppercase">
        <Zap size={14} className="inline-block mr-2 animate-pulse" />
        Liquidación Total - Hasta 70% OFF en Botas Seleccionadas
      </div>

      {/* Hero Section - Estilo Aria Liquidación */}
      <section className="relative h-[70vh] w-full bg-black flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-80">
          <video
            src="https://player.vimeo.com/external/494163967.hd.mp4?s=7b80894f316930f3f269550e50882e7534440026&profile_id=175"
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        </div>
        
        <div className="container relative z-20 px-4 md:px-12">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[0.9] uppercase tracking-tighter">
              Aria <br />
              <span className="text-[var(--color-accent)]">Liquidación</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-md font-medium">
              Aprovecha nuestras ofertas exclusivas en calzado premium. Stock limitado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/productos" 
                className="bg-[var(--color-accent)] text-black px-10 py-5 rounded-full font-black text-sm tracking-widest uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                Comprar Ahora <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Principales */}
      <div className="bg-[#f9f9f9] py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black uppercase mb-12 flex items-center gap-3">
            <span className="w-2 h-10 bg-[var(--color-accent)]" />
            Nuestras Categorías
          </h2>
          <ImageCategoryGrid />
        </div>
      </div>

      {/* Productos Destacados - Aria Style Cards */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tight">Oportunidades</h2>
              <p className="text-gray-400 mt-2 font-medium">Precios irresistibles en tus modelos favoritos</p>
            </div>
            <Link href="/productos" className="hidden md:flex items-center gap-2 text-sm font-black border-b-2 border-[var(--color-accent)] pb-1">
              VER TODO <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="aspect-[4/5] bg-gray-100 rounded-[var(--radius-lg)] animate-pulse" />
                  <div className="h-4 bg-gray-100 w-3/4 rounded" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link key={product.id} href={`/productos/${product.slug}`} className="group relative">
                  <div className="relative aspect-[4/5] bg-[#fdfdfd] rounded-[var(--radius-lg)] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                    <Image 
                      src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800"} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-black text-[var(--color-accent)] px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      OFF
                    </div>
                  </div>
                  <div className="mt-6 px-2">
                    <h3 className="text-xs font-black uppercase tracking-tight mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black">Bs. {Number(product.base_price).toFixed(0)}</span>
                      <span className="text-gray-400 text-sm line-through font-medium">Bs. {Number(product.base_price * 1.5).toFixed(0)}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Mocks for MVP
              [1,2,3,4].map(i => (
                <div key={i} className="group relative">
                  <div className="relative aspect-[4/5] bg-gray-100 rounded-[var(--radius-lg)] overflow-hidden">
                     <Image 
                      src={`https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=800`} 
                      alt="Demo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-black uppercase">Modelo Demo {i}</h3>
                    <p className="font-black text-lg">Bs. 299</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer Aria Style Section */}
      <section className="bg-black text-white py-24 px-4 rounded-t-[40px] md:rounded-t-[80px]">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 leading-tight">
            No te pierdas <br />
            <span className="text-[var(--color-accent)]">Nuestras novedades</span>
          </h2>
          <p className="text-white/60 mb-12 font-medium">
            Únete a nuestra comunidad para recibir alertas de liquidación antes que nadie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              placeholder="TU EMAIL" 
              className="bg-white/10 border border-white/20 rounded-full px-8 py-5 text-sm font-bold uppercase outline-none focus:border-[var(--color-accent)] transition-colors sm:w-80"
            />
            <button className="bg-[var(--color-accent)] text-black px-10 py-5 rounded-full font-black text-sm tracking-widest uppercase hover:scale-105 transition-transform">
              SUSCRIBIRME
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
