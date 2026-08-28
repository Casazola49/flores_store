"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Clock, ArrowRight, Star, Diamond } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Product, Category } from "@/types";
import { useCMSStore } from "@/lib/store";
import VideoBanner from "@/components/store/VideoBanner";
import ProductCard, { HotProduct } from "@/components/store/ProductCard";

const renderTitle = (title: string) => {
  return title.split("\n").map((line, idx) => (
    <span key={idx}>
      {line}
      {idx < title.split("\n").length - 1 && <br />}
    </span>
  ));
};

// Fallback images per category slug
const CAT_FALLBACK: Record<string, string> = {
  botas: "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=600",
  zapatos: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=600",
  zapatillas: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
  "zapatillas-deportivas": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
  tacos: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600",
  default: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=600",
};

// Brand logos list
const BRAND_LOGOS = [
  { name: "Nike", src: "/homepage_carrusel/nike.png" },
  { name: "Adidas", src: "/homepage_carrusel/adidas.png" },
  { name: "Puma", src: "/homepage_carrusel/puma.png" },
  { name: "New Balance", src: "/homepage_carrusel/new_balance.png" },
  { name: "Vans", src: "/homepage_carrusel/vans.png" },
  { name: "Converse", src: "/homepage_carrusel/converse.png" },
  { name: "Reebok", src: "/homepage_carrusel/reebok.png" },
  { name: "Skechers", src: "/homepage_carrusel/skechers.png" }
];


function toHot(p: any): HotProduct {
  return {
    id: p._id || p.id,
    name: p.name,
    price: Number(p.base_price),
    originalPrice: Number(p.compare_price ?? Math.round(p.base_price * 1.45)),
    stock: p.variants?.reduce((s: number, v: any) => s + (v.stock ?? 0), 0) ?? 0,
    views: 12,
    img: p.images?.[0]?.url ?? "",
    videoUrl: p.video_url,
    slug: p.slug,
    isNew: p.is_new,
  };
}

function CountdownTimer({ endHour = 24 }: { endHour?: number }) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(endHour, 0, 0, 0);
      if (end <= now) end.setDate(end.getDate() + 1);
      const diff = end.getTime() - now.getTime();
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endHour]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2.5 font-mono">
        <span className="bg-[var(--color-dark-surface)] border border-[var(--color-accent)]/10 text-white/60 text-xl md:text-2xl px-3 py-2 min-w-[3rem] text-center rounded-none shadow-md">--</span>
        <span className="text-white/60 font-black text-xl">:</span>
        <span className="bg-[var(--color-dark-surface)] border border-[var(--color-accent)]/10 text-white/60 text-xl md:text-2xl px-3 py-2 min-w-[3rem] text-center rounded-none shadow-md">--</span>
        <span className="text-white/60 font-black text-xl">:</span>
        <span className="bg-[var(--color-dark-surface)] border border-[var(--color-accent)]/10 text-white/60 text-xl md:text-2xl px-3 py-2 min-w-[3rem] text-center rounded-none shadow-md">--</span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-2.5 font-mono">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-2.5">
          <span className="bg-black border border-[var(--color-accent)]/40 text-[var(--color-accent-bright)] text-xl md:text-2xl font-black px-3.5 py-2.5 min-w-[3.2rem] text-center rounded-none shadow-inner shadow-black/80 drop-shadow-[0_0_8px_rgba(155,28,28,0.35)]">
            {v}
          </span>
          {i < 2 && <span className="text-[var(--color-accent)] font-black text-xl animate-pulse">:</span>}
        </span>
      ))}
    </div>
  );
}


export default function HomeClient() {
  const [popupVisible, setPopupVisible] = useState(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Live Convex Queries
  const categoriesData = useQuery(api.categories.getCategories);
  const bannersData = useQuery(api.banners.getBanners);
  const productsResult = useQuery(api.products.getProducts, { limit: 8 });

  const categories = categoriesData || [];
  const banners = bannersData || [];
  const hotProducts = (productsResult?.data || []).map(p => toHot(p));
  const hotLoading = productsResult === undefined;

  const { sections, fetchCMS } = useCMSStore();

  useEffect(() => {
    fetchCMS();

    // Email popup trigger
    const timer = setTimeout(() => {
      if (!localStorage.getItem("flores_popup_dismissed")) {
        setPopupVisible(true);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [fetchCMS]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx(i => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const dismissPopup = () => {
    setPopupVisible(false);
    localStorage.setItem("flores_popup_dismissed", "1");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-text)] bg-luxury-grid overflow-hidden">

      {/* ── HERO CINEMÁTICO RESPONSIVO ───────────────────────── */}
      <section className="relative min-h-[95vh] md:min-h-screen w-full bg-[var(--color-text)] flex items-center overflow-hidden border-b border-white/5">
        {/* Render dynamic banners or global fallback */}
        {banners.length > 0 ? (
          banners.map((b, idx) => {
            if (idx !== activeBannerIdx) return null;
            return (
              <div key={b.id} className="absolute inset-0 w-full h-full">
                    <VideoBanner
                      src={b.video_url}
                      poster={b.image_url}
                      alt={b.title || "Flores Banner"}
                      className="opacity-50 scale-105"
                      objectPosition="center 30%"
                    />
              </div>
            );
          })
        ) : (
          <div className="absolute inset-0 w-full h-full">
                    <VideoBanner
                      src={sections.hero_video_url}
                      alt="Flores Premium"
                      className="opacity-50 scale-105"
                      objectPosition="center 30%"
                    />
              </div>
            )}

            {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-text)] via-[var(--color-text)]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-text)] via-[var(--color-text)]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.65))] z-10" />

        {/* Spaced Hero Container padding */}
        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12" style={{ paddingTop: "14rem", paddingBottom: "14rem" }}>
          <div className="max-w-4xl">
            <div className="overflow-hidden mb-8 animate-slide-up">
              <span className="inline-flex items-center gap-3 text-[var(--color-accent)] text-xs font-black tracking-[0.45em] uppercase">
                <span className="w-6 h-[1.5px] bg-[var(--color-accent)]" /> Flores — Liquidación Real
              </span>
            </div>
            
            {banners.length > 0 && banners[activeBannerIdx] ? (
              <>
                {/* Spaced title margin bottom */}
                <h1 
                  className="text-[clamp(2.5rem,6vw,4.5rem)] font-serif font-black text-white leading-[0.9] uppercase tracking-tighter animate-slide-up luxury-text-shadow"
                  style={{ marginBottom: "4rem" }}
                >
                  {banners[activeBannerIdx].title ? renderTitle(banners[activeBannerIdx].title!) : "Cultura Exclusiva"}
                </h1>
                
                {/* Spaced typography description text */}
                <p 
                  className="text-white/60 text-sm md:text-lg max-w-xl font-normal tracking-widest md:tracking-wide leading-loose animate-slide-up"
                  style={{ marginBottom: "6rem" }}
                >
                  {banners[activeBannerIdx].subtitle}
                </p>
                
                {/* Spaced buttons block */}
                <div className="flex flex-col sm:flex-row gap-6 animate-slide-up w-full sm:w-auto mt-6">
                  <Link
                    href={banners[activeBannerIdx].link_url || "/productos"}
                    className="btn-premium group w-full sm:w-auto"
                  >
                    <div className="corner-decor corner-tl" />
                    <div className="corner-decor corner-tr" />
                    <div className="corner-decor corner-bl" />
                    <div className="corner-decor corner-br" />
                    <Flame size={16} className="mr-2 animate-pulse" /> 
                    {banners[activeBannerIdx].link_text || "Comprar Ahora"}
                  </Link>
                  <Link
                    href="/productos"
                    className="btn-premium-outline group w-full sm:w-auto"
                  >
                    <div className="corner-decor corner-tl" />
                    <div className="corner-decor corner-tr" />
                    <div className="corner-decor corner-bl" />
                    <div className="corner-decor corner-br" />
                    Ver Catálogo
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Spaced title margin bottom */}
                <h1 
                  className="text-[clamp(2.5rem,6vw,4.5rem)] font-serif font-black text-white leading-[0.9] uppercase tracking-tighter animate-slide-up luxury-text-shadow"
                  style={{ marginBottom: "4rem" }}
                >
                  {sections.hero_title ? renderTitle(sections.hero_title) : renderTitle("Últimas Tallas\nEn Liquidación")}
                </h1>
                
                {/* Spaced typography description text */}
                <p 
                  className="text-white/60 text-sm md:text-lg max-w-xl font-normal tracking-widest md:tracking-wide leading-loose animate-slide-up"
                  style={{ marginBottom: "6rem" }}
                >
                  {sections.hero_subtitle || "Botas, tacos y zapatillas con stock real limitado. Precios de liquidación verificados, envíos 48h a todo Bolivia."}
                </p>
                
                {/* Spaced buttons block */}
                <div className="flex flex-col sm:flex-row gap-6 animate-slide-up w-full sm:w-auto mt-6">
                  <Link
                    href="/productos?is_new=true"
                    className="btn-premium group w-full sm:w-auto"
                  >
                    <div className="corner-decor corner-tl" />
                    <div className="corner-decor corner-tr" />
                    <div className="corner-decor corner-bl" />
                    <div className="corner-decor corner-br" />
                    <Flame size={16} className="mr-2 animate-pulse" /> Reclamar Mi Par
                  </Link>
                  <Link
                    href="/productos"
                    className="btn-premium-outline group w-full sm:w-auto"
                  >
                    <div className="corner-decor corner-tl" />
                    <div className="corner-decor corner-tr" />
                    <div className="corner-decor corner-bl" />
                    <div className="corner-decor corner-br" />
                    Catálogo Completo
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Floating Stats - Desktop Only */}
        <div className="absolute bottom-16 right-16 hidden xl:flex flex-col gap-6 text-right z-20">
          <div className="glass-card px-10 py-7 border border-white/5 hover:border-white/10 transition-all duration-500 shadow-2xl backdrop-blur-2xl">
            <span className="font-mono text-[8px] text-white/40 tracking-widest block uppercase">[Estilos de Temporada]</span>
            <p className="text-white text-5xl font-black tracking-tight mt-1">+500</p>
            <p className="text-white/40 text-[9px] uppercase tracking-[0.35em] font-black mt-2">Pares Únicos</p>
          </div>
          <div className="bg-gradient-to-br from-[var(--color-accent)] to-[#631010] px-10 py-7 transition-all duration-500 shadow-2xl shadow-[var(--color-accent)]/15 border border-[var(--color-accent)]/25">
            <span className="font-mono text-[8px] text-white/70 tracking-widest block uppercase">[Liquidación Activa]</span>
            <p className="text-white text-5xl font-black tracking-tight mt-1">70%</p>
            <p className="text-white/80 text-[9px] uppercase tracking-[0.35em] font-black mt-2">Dcto Máximo</p>
          </div>
        </div>
      </section>

      {/* ── BRAND TICKER CON IMÁGENES (Mucho más ancho, logos con padding-x masivo, y mas grande) ── */}
      <div className="bg-black/95 overflow-hidden border-y border-white/5 relative z-10" style={{ paddingTop: "8rem", paddingBottom: "8rem" }}>
        <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-[var(--color-text)] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[var(--color-text)] to-transparent z-20 pointer-events-none" />
        
        <div className="flex animate-ticker whitespace-nowrap gap-0 items-center">
          {[...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS].map((logo, i) => (
            <div 
              key={i} 
              className="inline-flex items-center justify-center border-r border-white/5 h-16 shrink-0"
              style={{ paddingLeft: "7rem", paddingRight: "7rem" }}
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="h-10 md:h-12 w-auto object-contain opacity-95"
                style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN HOT DROPS — (Hot Drops subido levemente y botón explorar centrado) ──── */}
      <section className="bg-transparent relative overflow-hidden border-b border-white/5" style={{ paddingTop: "11rem", paddingBottom: "13rem" }}>
        {/* Glow decorativo de fondo */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-accent)]/5 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          {/* Spaced header with inline style mb-36 md:mb-56 */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12" style={{ marginBottom: "8rem" }}>
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-accent)]"></span>
                </span>
                <span className="text-[10px] font-black tracking-[0.5em] uppercase text-[var(--color-accent)]">Inventario En Vivo — Cochabamba</span>
              </div>
              
              {/* Spaced Hot Drops Title (Subido levemente: mt-2 mb-10) */}
              <h2 
                className="text-5xl md:text-8xl font-serif font-black uppercase tracking-tighter leading-none text-white mt-2"
                style={{ marginBottom: "2.5rem" }}
              >
                Hot <span className="premium-gradient-text italic font-normal">Drops</span>
              </h2>
              
              <p className="text-white/40 text-sm md:text-base mt-8 font-medium max-w-sm leading-relaxed tracking-wider" style={{ marginBottom: "2rem" }}>
                Nuestra selección más codiciada. Actualizada cada hora con el stock físico de nuestra tienda.
              </p>
            </div>

            {/* Glowing countdown box using animate-glow-pulse */}
            <div className="glass-card p-8 md:p-10 border border-[var(--color-accent)]/45 flex flex-col items-start gap-4 min-w-[310px] shadow-2xl backdrop-blur-xl animate-glow-pulse relative">
              <div className="corner-decor corner-tl" />
              <div className="corner-decor corner-tr" />
              <div className="corner-decor corner-bl" />
              <div className="corner-decor corner-br" />
              
              <p className="text-[9px] font-black tracking-[0.45em] uppercase text-[var(--color-accent-bright)] flex items-center gap-2">
                <Clock size={12} className="text-[var(--color-accent)] animate-spin" /> Finaliza pronto
              </p>
              <CountdownTimer endHour={parseInt(sections.countdown_end_hour || "24", 10)} />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
            {hotLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="block space-y-4">
                    <div className="aspect-[3/4] skeleton" />
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-6 skeleton w-1/2" />
                  </div>
                ))
              : hotProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))
            }
          </div>

          {/* Centered catalog button with reduced vertical paddings */}
          <div className="flex justify-center items-center animate-slide-up" style={{ marginTop: "5rem", marginBottom: "2rem" }}>
            <Link
              href="/productos"
              className="btn-premium-outline group px-12 py-5 font-black text-xs tracking-[0.25em] uppercase w-full sm:w-auto flex justify-center items-center"
            >
              <div className="corner-decor corner-tl" />
              <div className="corner-decor corner-tr" />
              <div className="corner-decor corner-bl" />
              <div className="corner-decor corner-br" />
              Explorar Catálogo Completo
              <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BÓVEDA VIP (Corregido alineación a la derecha e inline styles) ────────────── */}
      <section className="relative overflow-hidden bg-[var(--color-text)] border-y border-white/5" style={{ paddingTop: "16rem", paddingBottom: "16rem" }}>
            <VideoBanner
              src={sections.vip_vault_video_url}
              poster="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1600"
              alt="VIP Vault"
              className="opacity-15 scale-105"
            />
        
        {/* Artistic Light Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-text)] via-[var(--color-text)]/95 to-transparent z-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--color-accent)]/5 blur-[160px] rounded-full z-10 pointer-events-none" />

        {/* Shifting container slightly right with 12% padding-left and break-words to prevent cut-off */}
        <div className="relative z-20 max-w-[1400px] mx-auto px-8 sm:px-16 md:px-24" style={{ paddingLeft: "12%" }}>
          <div className="max-w-2xl text-left break-words">
            <div className="inline-flex items-center gap-3 glass-card px-4 py-2 mb-8 rounded-none border-white/10">
              <Diamond size={13} className="text-[var(--color-accent)] animate-pulse" />
              <span className="text-white text-[9px] font-black tracking-[0.55em] uppercase">Edición Privada</span>
            </div>
            
            {/* Spaced title margin bottom & wrap words to fix responsive cuts */}
            <h2 
              className="text-4xl sm:text-6xl md:text-8xl font-serif font-black text-white uppercase tracking-tighter leading-[0.9] break-words"
              style={{ marginBottom: "5rem" }}
            >
              {sections.vip_vault_title ? renderTitle(sections.vip_vault_title) : <>Bóveda<br /><span className="premium-gradient-text italic font-normal">Privada</span></>}
            </h2>
            
            {/* Spaced description margin bottom */}
            <p 
              className="text-white/60 text-sm md:text-lg leading-relaxed font-medium max-w-sm tracking-wide"
              style={{ marginBottom: "7rem" }}
            >
              {sections.vip_vault_subtitle || "Modelos de colección exclusiva no listados en el catálogo general. Disponibles solo mediante invitación o código de acceso VIP."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center w-full sm:w-auto mt-6">
              <Link
                href="/productos?collection=exclusive"
                className="btn-premium group w-full sm:w-auto"
              >
                <div className="corner-decor corner-tl" />
                <div className="corner-decor corner-tr" />
                <div className="corner-decor corner-bl" />
                <div className="corner-decor corner-br" />
                Acceder A La Bóveda
              </Link>
              <div className="w-full sm:w-auto text-center sm:text-left">
                <p className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center sm:justify-start gap-2 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  12 Accesos disponibles hoy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS — Estilo Brutalista Premium (Con espaciados de sección y elementos ampliados) ── */}
      <section className="bg-transparent border-b border-white/5" style={{ paddingTop: "14rem", paddingBottom: "14rem" }}>
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Spaced categories header mb-36 md:mb-52 */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6" style={{ marginBottom: "8rem" }}>
            <h2 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter text-white">
              Colección por <span className="text-white/60 italic font-normal">Categoría</span>
            </h2>
            <Link href="/productos" className="text-[10px] font-black tracking-[0.4em] uppercase text-[var(--color-accent)] border-b border-[var(--color-accent)]/30 pb-2 hover:text-white hover:border-white transition-all duration-300 w-fit">
              Ver Todo
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {(categories.length > 0 ? categories.slice(0, 5) : Array.from({ length: 5 })).map((cat, i) => {
              if (!cat) return <div key={i} className="aspect-[4/5] skeleton rounded-none" />;
              const c = cat as Category;
              const img = c.image_url || CAT_FALLBACK[c.slug] || CAT_FALLBACK.default;
              return (
                <Link key={c.id} href={`/productos?category=${c.slug}`} className="group relative aspect-[4/5] overflow-hidden bg-black block border border-white/5 rounded-none shadow-lg">
                      <VideoBanner
                        src={c.video_url}
                        poster={img}
                        alt={c.name}
                        autoplay={false}
                        className={
                          c.video_url
                            ? "opacity-40 group-hover:opacity-75 group-hover:scale-105 transition-all duration-1000"
                            : "opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-1000"
                        }
                      />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                    <span className="font-mono text-[8px] text-white/40 block tracking-widest mb-1">0{i+1} / COLLECTION</span>
                    <h3 className="text-white font-serif font-black text-lg md:text-xl uppercase tracking-tighter group-hover:text-[var(--color-accent)] transition-colors">{c.name}</h3>
                  </div>
                  
                  <div className="absolute top-4 right-4 w-8 h-8 bg-[var(--color-accent)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 rounded-none">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS OSCUROS — (Surgido arriba, centrado y recuadros más grandes/espaciados) ──── */}
      <section className="bg-transparent border-b border-white/5 relative overflow-hidden" style={{ paddingTop: "10rem", paddingBottom: "16rem" }}>
        {/* Muted background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent)]/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          {/* Centered header title with mb-36 md:mb-56 */}
          <div className="text-center" style={{ marginBottom: "8rem" }}>
            <span className="text-[var(--color-accent)] text-[10px] font-black tracking-[0.55em] uppercase mb-4 block animate-pulse">Garantía Flores</span>
            <h2 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter text-white">Experiencia de Nuestros Compradores</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 lg:gap-16 max-w-6xl mx-auto justify-center">
            {[
              { name: "María V.", city: "Santa Cruz", text: "Increíble calidad y precio. Llegó en 2 días mediante flota. ¡Ya pedí mi segundo par para mi hermano!", rating: 5, model: "Bota Chelsea Noir", size: "38" },
              { name: "Carlos M.", city: "Cochabamba", text: "Las botas de cuero son exactamente como en las fotos. La atención por WhatsApp fue súper rápida y me asesoraron con mi talla exacta.", rating: 5, model: "Deportivo Urban Red", size: "41" },
              { name: "Ana P.", city: "La Paz", text: "Aproveché la liquidación y ahorré casi Bs. 200. Calidad de cuero excelente, totalmente garantizado.", rating: 5, model: "Tacón Stiletto Oro", size: "39" },
            ].map((t, i) => (
              <div 
                key={i} 
                className="relative bg-[var(--color-dark-surface)] border border-white/10 p-10 md:p-14 shadow-2xl flex flex-col justify-between rounded-none hover:border-[var(--color-accent)]/40 transition-all duration-500"
                style={{ minHeight: "340px" }}
              >
                {/* Tech corner decorations for the cards */}
                <div className="corner-decor corner-tl" />
                <div className="corner-decor corner-tr" />
                <div className="corner-decor corner-bl" />
                <div className="corner-decor corner-br" />
                
                <div>
                  {/* Verified Shoe Specs Header */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8 text-[9px] font-mono tracking-widest text-white/40 uppercase">
                    <span>[ COMPRA VERIFICADA ]</span>
                    <span className="bg-[var(--color-accent-light)] text-[var(--color-text)] px-2 py-0.5 border border-[var(--color-accent)]/40 font-bold">
                      {t.model} / T: {t.size}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 mb-8">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={12} fill="var(--color-accent)" className="text-[var(--color-accent)]" />
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-white/80 leading-loose mb-10 font-medium italic tracking-wide">"{t.text}"</p>
                </div>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                      <span className="text-white font-black text-sm font-serif">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-white">{t.name}</p>
                      <p className="text-[9.5px] text-white/40 uppercase tracking-widest mt-0.5">{t.city}</p>
                    </div>
                  </div>
                  
                  {/* Sneakerhead spec serial */}
                  <span className="font-mono text-[7px] text-white/20 tracking-wider hidden sm:inline-block">
                    FLS-DEV-{t.size}X
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER VIP — Spaced layout, design buttons (Espacio vertical masivo de 16rem) ── */}
      <section className="bg-[var(--color-dark-surface)] text-white border-b border-white/5 relative overflow-hidden" style={{ paddingTop: "16rem", paddingBottom: "16rem" }}>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[var(--color-accent)]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            
            {/* Spaced title and description */}
            <div className="space-y-8">
              <span className="text-[var(--color-accent)] text-xs font-black tracking-[0.45em] uppercase block">
                Acceso Anticipado
              </span>
              <h2 className="text-5xl md:text-7xl font-serif font-black uppercase tracking-tighter leading-tight mt-6" style={{ marginBottom: "4rem" }}>
                Únete a la<br />
                <span className="text-[var(--color-accent)] italic font-normal">Lista VIP</span>
              </h2>
              <p className="text-white/50 text-sm md:text-base max-w-md leading-relaxed font-medium tracking-wide">
                Recibe notificaciones de nuevos drops y liquidaciones exclusivas de calzado 24 horas antes que el público general. Los mejores pares siempre se agotan en minutos.
              </p>
            </div>
            
            <div className="space-y-8 glass-card border border-white/10 p-8 md:p-12 relative">
              <div className="corner-decor corner-tl" />
              <div className="corner-decor corner-tr" />
              <div className="corner-decor corner-bl" />
              <div className="corner-decor corner-br" />
              
              <div className="relative border-b border-white/15 pb-4">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="bg-transparent w-full text-white placeholder:text-white/60 text-xs font-semibold uppercase tracking-[0.15em] outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              
              <button className="btn-premium group w-full flex justify-center items-center py-5">
                <div className="corner-decor corner-tl" />
                <div className="corner-decor corner-tr" />
                <div className="corner-decor corner-bl" />
                <div className="corner-decor corner-br" />
                Quiero Acceso Exclusivo →
              </button>
              
              <p className="text-white/60 text-[9.5px] uppercase tracking-widest text-center">
                Envío de stock real en Bolivia. Cancela tu suscripción cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN REDES SOCIALES — Animadas, Tematizadas y Centradas ──────────────────── */}
      <section className="bg-[var(--color-text)] border-t border-white/5 relative overflow-hidden" style={{ paddingTop: "12rem", paddingBottom: "12rem" }}>
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[var(--color-accent)]/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 text-center">
          <span className="text-[var(--color-accent)] text-xs font-black tracking-[0.55em] uppercase block mb-4">Comunidad Flores</span>
          <h2 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter text-white mb-8">
            Conéctate con <span className="premium-gradient-text italic font-normal">Nosotros</span>
          </h2>
          <p className="text-white/40 text-sm md:text-base max-w-md mx-auto leading-relaxed tracking-wide mb-16">
            Mantente al día con los últimos drops de calzado, novedades exclusivas de liquidación y soporte inmediato a un clic.
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* WhatsApp */}
            <a 
              href={`https://wa.me/${sections.whatsapp_number || "59176932485"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-[var(--color-dark-surface)] border border-white/10 p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/40 hover:shadow-[0_15px_35px_rgba(16,185,129,0.15)] rounded-none"
            >
              <div className="corner-decor corner-tl" />
              <div className="corner-decor corner-tr" />
              <div className="corner-decor corner-bl" />
              <div className="corner-decor corner-br" />
              
              <span className="text-3xl text-emerald-500 group-hover:scale-110 transition-transform duration-300">💬</span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">WhatsApp</span>
              <span className="text-[9px] font-mono text-white/60 tracking-widest mt-1">[ SOPORTE 24/7 ]</span>
            </a>
            
            {/* Facebook */}
            <a 
              href={sections.social_facebook || "https://facebook.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-[var(--color-dark-surface)] border border-white/10 p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/40 hover:shadow-[0_15px_35px_rgba(59,130,246,0.15)] rounded-none"
            >
              <div className="corner-decor corner-tl" />
              <div className="corner-decor corner-tr" />
              <div className="corner-decor corner-bl" />
              <div className="corner-decor corner-br" />
              
              <span className="text-3xl text-blue-500 group-hover:scale-110 transition-transform duration-300">👤</span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Facebook</span>
              <span className="text-[9px] font-mono text-white/60 tracking-widest mt-1">[ COMUNIDAD ]</span>
            </a>
            
            {/* Instagram */}
            <a 
              href={sections.social_instagram || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-[var(--color-dark-surface)] border border-white/10 p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:-translate-y-2 hover:border-pink-500/40 hover:shadow-[0_15px_35px_rgba(236,72,153,0.15)] rounded-none"
            >
              <div className="corner-decor corner-tl" />
              <div className="corner-decor corner-tr" />
              <div className="corner-decor corner-bl" />
              <div className="corner-decor corner-br" />
              
              <span className="text-3xl text-pink-500 group-hover:scale-110 transition-transform duration-300">📸</span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Instagram</span>
              <span className="text-[9px] font-mono text-white/60 tracking-widest mt-1">[ CATÁLOGO VISUAL ]</span>
            </a>
            
            {/* TikTok */}
            <a 
              href={sections.social_tiktok || "https://tiktok.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-[var(--color-dark-surface)] border border-white/10 p-10 flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_15px_35px_rgba(34,211,238,0.15)] rounded-none"
            >
              <div className="corner-decor corner-tl" />
              <div className="corner-decor corner-tr" />
              <div className="corner-decor corner-bl" />
              <div className="corner-decor corner-br" />
              
              <span className="text-3xl text-cyan-400 group-hover:scale-110 transition-transform duration-300">🎵</span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">TikTok</span>
              <span className="text-[9px] font-mono text-white/60 tracking-widest mt-1">[ TENDENCIAS ]</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── EMAIL POPUP — Premium Dark ─────────── */}
      {popupVisible && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--color-text)] border border-white/10 max-w-md w-full relative overflow-hidden animate-slide-down rounded-none shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
            
            <div className="corner-decor corner-tl" />
            <div className="corner-decor corner-tr" />
            <div className="corner-decor corner-bl" />
            <div className="corner-decor corner-br" />
            
            {/* Top accent border */}
            <div className="h-1.5 w-full bg-[var(--color-accent)]" />
            
            <div className="bg-gradient-to-b from-[var(--color-dark-surface)] to-[var(--color-text)] p-8 text-white text-center border-b border-white/5 relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={dismissPopup}
                  className="text-white/40 hover:text-white text-xs font-bold font-mono tracking-tighter"
                >
                  [X]
                </button>
              </div>
              <p className="text-[9px] font-black tracking-[0.45em] uppercase mb-3 text-white/50">Invitación Especial</p>
              <p className="text-5xl font-serif font-black tracking-tight text-white">10% OFF</p>
              <p className="text-[10px] font-black tracking-[0.25em] mt-3 text-[var(--color-accent)] uppercase">En tu primer pedido de liquidación</p>
            </div>
            
            <div className="p-8 text-center space-y-6">
              <h3 className="text-2xl font-serif font-black uppercase tracking-tighter text-white">
                Accede A Descuentos De Lanzamiento
              </h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                Suscríbete ahora y obtén un 10% de descuento instantáneo en tu primera compra + acceso VIP a drops.
              </p>
              <input
                type="email"
                placeholder="tu@correo.com"
                className="w-full bg-[var(--color-dark-surface)] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-[var(--color-accent)] focus:bg-black transition-all rounded-none"
              />
              
              <button
                onClick={dismissPopup}
                className="btn-premium group w-full py-4 flex justify-center items-center"
              >
                <div className="corner-decor corner-tl" />
                <div className="corner-decor corner-tr" />
                <div className="corner-decor corner-bl" />
                <div className="corner-decor corner-br" />
                ¡Reclamar Mi Descuento!
              </button>
              
              <button
                onClick={dismissPopup}
                className="text-[9.5px] text-white/60 hover:text-white/70 uppercase tracking-[0.15em] transition-colors font-bold block w-full"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
