"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCMSStore } from "@/lib/store";

const PAYMENT_METHODS = ["QR", "Transferencia", "Efectivo", "Tigo Money"];

export default function Footer() {
  const { sections, fetchCMS } = useCMSStore();

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  const rawWa = sections.whatsapp_number || "59176932485";
  const displayWa = rawWa.startsWith("+") ? rawWa : `+${rawWa}`;
  const formattedWa = displayWa.length === 12 && displayWa.startsWith("+591") 
    ? `+591 ${displayWa.slice(4, 7)} ${displayWa.slice(7)}` 
    : displayWa;

  return (
    <footer className="bg-[var(--color-text)] text-white pt-24 pb-12 border-t border-white/5 relative z-10">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Virtues Section (Trust Signals) - Large cards with shoe watermarks and hover animations */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-16 border-b border-white/10" 
          style={{ marginBottom: "8rem" }}
        >
          {[
            { icon: "🚚", title: "Envío Rápido", sub: "A todo Bolivia en 48 horas", watermark: "SNEAKER" },
            { icon: "🔒", title: "Pago Seguro", sub: "QR, Transferencia, Efectivo", watermark: "PAY" },
            { icon: "✅", title: "Calidad Garantizada", sub: "100% cuero premium garantizado", watermark: "PREMIUM" },
            { icon: "💬", title: "Soporte 24/7", sub: "Atención directa por WhatsApp", watermark: "SUPPORT" },
          ].map((item, i) => (
            <div 
              key={i} 
              className="group relative bg-[var(--color-dark-surface)] border border-white/10 p-10 min-h-[220px] shadow-xl flex flex-col justify-between items-start hover:border-[var(--color-accent)]/40 hover:scale-[1.03] hover:shadow-[0_15px_35px_rgba(155,28,28,0.15)] transition-all duration-500 rounded-none overflow-hidden"
            >
              {/* Tech corner decorations for cards */}
              <div className="corner-decor corner-tl" />
              <div className="corner-decor corner-tr" />
              <div className="corner-decor corner-bl" />
              <div className="corner-decor corner-br" />
              
              {/* Giant transparent shoe/virtue watermark */}
              <span className="absolute bottom-4 right-6 text-[52px] font-black font-sans text-white/[0.015] group-hover:text-[var(--color-accent)]/5 transition-colors duration-500 select-none pointer-events-none">
                {item.watermark}
              </span>
              
              <span className="text-4xl shrink-0 group-hover:rotate-12 transition-transform duration-300">
                {item.icon}
              </span>
              <div className="mt-6">
                <p className="text-[12px] font-black uppercase tracking-widest text-white">{item.title}</p>
                <p className="text-white/40 text-[10.5px] mt-2 leading-relaxed font-semibold">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

          {/* Brand */}
          <div className="space-y-8 lg:col-span-1">
            <h3 className="text-4xl font-serif font-black tracking-tighter uppercase">
              Flores<span className="text-[var(--color-accent)]">.</span>
            </h3>
            {/* Muted regular sentence instead of crowded uppercase sentence */}
            <p className="text-white/50 text-xs font-medium tracking-wide leading-relaxed max-w-xs">
              La liquidación más grande de calzado premium en Bolivia. Envíos rápidos y garantizados a todo el país directo a tu puerta.
            </p>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="text-[10px] tracking-[0.4em] font-black uppercase mb-8 text-white/60">[ Catálogo ]</h4>
            {/* Spaced links list (space-y-6) */}
            <ul className="space-y-6">
              {[
                { label: "🔥 Drops Recientes", href: "/productos?is_new=true" },
                { label: "⏳ Últimas Tallas en Sale", href: "/productos?sale=true" },
                { label: "💎 Colecciones Exclusivas", href: "/productos?collection=exclusive" },
                { label: "Hombre", href: "/productos?genero=hombre" },
                { label: "Mujer", href: "/productos?genero=mujer" },
                { label: "Niños", href: "/productos?genero=ninos" },
              ].map(l => (
                <li key={l.label}>
                  <Link 
                    href={l.href} 
                    className="text-xs font-semibold tracking-[0.18em] text-white/60 hover:text-[var(--color-accent)] transition-colors duration-300 uppercase"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] tracking-[0.4em] font-black uppercase mb-8 text-white/60">[ Ayuda ]</h4>
            {/* Spaced links list (space-y-6) */}
            <ul className="space-y-6">
              {[
                { label: "Cómo realizar tu compra", href: "#" },
                { label: "Envíos y plazos de entrega", href: "#" },
                { label: "Guía de tallas detallada", href: "#" },
                { label: "Cambios y devoluciones", href: "#" },
                { label: "Preguntas frecuentes", href: "#" },
              ].map(l => (
                <li key={l.label}>
                  <Link 
                    href={l.href} 
                    className="text-xs font-semibold tracking-[0.18em] text-white/60 hover:text-[var(--color-accent)] transition-colors duration-300 uppercase"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Payment */}
          <div>
            <h4 className="text-[10px] tracking-[0.4em] font-black uppercase mb-8 text-white/60">[ Contacto ]</h4>
            <ul className="space-y-6 text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
              <li>Cochabamba & Santa Cruz, Bolivia</li>
              <li>
                <a href={`tel:${rawWa}`} className="hover:text-[var(--color-accent)] transition-colors duration-300">{formattedWa}</a>
              </li>
              <li>
                <a href="mailto:ventas@floresbolivia.com" className="hover:text-[var(--color-accent)] transition-colors duration-300 lowercase font-medium">ventas@floresbolivia.com</a>
              </li>
            </ul>
            
            <div className="mt-12 animate-pulse-red">
              <h4 className="text-[10px] tracking-[0.4em] font-black uppercase mb-6 text-white/60">[ Métodos de Pago ]</h4>
              <div className="flex flex-wrap gap-2.5">
                {PAYMENT_METHODS.map(m => (
                  <span 
                    key={m} 
                    className="relative bg-black border border-white/10 text-white/50 text-[9.5px] uppercase font-bold tracking-wider px-3.5 py-2 hover:border-[var(--color-accent)]/45 hover:text-white transition-colors duration-300"
                  >
                    <div className="corner-decor corner-tl" />
                    <div className="corner-decor corner-br" />
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[9.5px] font-bold tracking-[0.25em] uppercase text-white/60">
          <p>© {new Date().getFullYear()} Flores Bolivia. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <Link href="/privacidad" className="hover:text-white/60 transition-colors duration-300">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white/60 transition-colors duration-300">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
