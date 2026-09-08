"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Tag, Truck } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Category } from "@/types";
import { useCMSStore } from "@/lib/store";
import VideoBanner from "@/components/store/VideoBanner";
import BrandPlaceholder from "@/components/store/BrandPlaceholder";
import ProductCard, { HotProduct } from "@/components/store/ProductCard";

const MARQUEE_ITEMS = ["Novedades", "Botas", "Tacos", "Zapatillas", "Envíos a Bolivia", "Pago con QR"];
function toHot(p: any): HotProduct {
  return { id: p._id || p.id, name: p.name, price: Number(p.base_price), originalPrice: Number(p.compare_price ?? p.base_price), stock: p.variants?.reduce((s: number, v: any) => s + (v.stock ?? 0), 0) ?? 0, img: p.images?.[0]?.url ?? "", videoUrl: p.video_url, slug: p.slug, isNew: p.is_new };
}

export default function HomeClient() {
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const categoriesData = useQuery(api.categories.getCategories);
  const bannersData = useQuery(api.banners.getBanners);
  const productsResult = useQuery(api.products.getProducts, { limit: 8 });
  const { sections, fetchCMS } = useCMSStore();
  const categories = categoriesData || [];
  const banners = bannersData || [];
  const products = (productsResult?.data || []).map(toHot);

  useEffect(() => { fetchCMS(); }, [fetchCMS]);
  useEffect(() => {
    if (banners.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setActiveBannerIdx(i => (i + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners]);

  const banner = banners[activeBannerIdx];
  return <div className="min-h-screen bg-[var(--color-primary)] text-white">
    <section className="relative min-h-[85vh] flex items-end overflow-hidden">
      <div className="absolute inset-0"><VideoBanner priority src={banner?.video_url || sections.hero_video_url} poster={banner?.image_url} alt="Flores" className="opacity-80" /></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 py-24 md:px-12">
        <p className="text-label text-[var(--color-accent)] mb-6">── Flores</p>
        <h1 className="text-display font-serif font-black leading-tight tracking-tight max-w-3xl mb-6">{banner?.title || sections.hero_title || "Calzado que define tu paso."}</h1>
        <p className="text-body text-white/80 max-w-xl mb-8">{banner?.subtitle || sections.hero_subtitle || "Botas, tacos y zapatillas con stock real en Cochabamba y Santa Cruz."}</p>
        <Link href={banner?.link_url || "/productos"} className="btn-premium">{banner?.link_text || "Ver colección"}<ArrowRight size={16} className="ml-2" /></Link>
      </div>
    </section>
    <div className="bg-[var(--color-accent)] py-3 overflow-hidden"><div className="flex animate-ticker whitespace-nowrap w-max">{[0, 1].map(d => <div key={d} className="flex">{MARQUEE_ITEMS.map(item => <span key={`${d}-${item}`} className="text-label px-6">{item} ·</span>)}</div>)}</div></div>
    <section className="max-w-[1400px] mx-auto px-6 py-20"><p className="text-label text-[var(--color-accent)] mb-4">Novedades</p><h2 className="text-headline font-bold mb-10">Selección Flores</h2><div className="grid grid-cols-2 lg:grid-cols-4 gap-6">{products.map(p => <ProductCard key={p.id} product={p} />)}</div></section>
    <section className="bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-20"><div className="max-w-[1400px] mx-auto"><div className="flex items-end justify-between mb-10"><div><p className="text-label text-[var(--color-accent)] mb-4">Explora</p><h2 className="text-headline font-bold">Compra por colección</h2></div><Link href="/productos" className="text-label text-[var(--color-accent)]">Ver todo →</Link></div><div className="grid sm:grid-cols-3 gap-6">{categories.slice(0, 3).map((cat: Category) => <Link key={cat.id} href={`/productos?category=${cat.slug}`} className="group relative aspect-portrait overflow-hidden bg-[var(--color-primary)]">{cat.video_url ? <VideoBanner src={cat.video_url} poster={cat.image_url} alt={cat.name} autoplay={false} className="opacity-70 transition-opacity duration-700 group-hover:opacity-100" /> : cat.image_url ? <img src={cat.image_url} alt={cat.name} loading="lazy" className="h-full w-full object-cover opacity-75 transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100" /> : <BrandPlaceholder aspect="4:5" label={cat.name} />}<span className="absolute bottom-5 left-5 right-5 text-title font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{cat.name}</span></Link>)}</div></div></section>
    <section className="max-w-[1100px] mx-auto px-6 py-20"><h2 className="text-headline font-bold mb-10">Compra con confianza</h2><div className="grid gap-10 sm:grid-cols-3 sm:gap-8">{[[Truck, "Envíos 48h", "A todo Bolivia"], [ShieldCheck, "Pago seguro", "QR, transferencia y efectivo"], [Tag, "Liquidación real", "Precios bajos, stock contado"]].map(([Icon, title, text]) => <div key={title as string}><Icon size={24} className="text-[var(--color-accent)] mb-5" /><h3 className="text-title font-bold mb-2">{title as string}</h3><p className="text-body text-[var(--color-text-muted)]">{text as string}</p></div>)}</div></section>
    <section className="bg-[var(--color-surface)] text-[var(--color-text)] px-6 py-20"><div className="max-w-[700px] mx-auto text-center"><h2 className="text-headline font-bold mb-4">Recibe novedades</h2><p className="text-body mb-8">Conoce nuevos modelos y disponibilidad de stock.</p><div className="flex flex-col gap-4 sm:flex-row sm:gap-3"><input type="email" placeholder="Tu correo electrónico" aria-label="Tu correo electrónico" className="min-w-0 flex-1 border-b border-[var(--color-text)] bg-transparent px-2 py-3 text-body" /><button className="btn-premium w-full justify-center sm:w-auto">Suscribirme</button></div></div></section>
  </div>;
}
