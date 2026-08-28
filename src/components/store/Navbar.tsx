"use client";

import Link from "next/link";
import { useCartStore, useCMSStore } from "@/lib/store";
import { ShoppingBag, Menu, X, Flame } from "lucide-react";
import { useState, useEffect } from "react";

const MAIN_NAV = [
  {
    name: "🔥 Drops",
    href: "/productos?is_new=true",
    badge: "NUEVO",
    badgeColor: "var(--color-accent)",
    description: "Lo más fresco, antes que todos",
  },
  {
    name: "⏳ Últimas Tallas",
    href: "/productos?sale=true",
    badge: "URGENTE",
    badgeColor: "var(--color-accent)",
    description: "Stock crítico — Se acaba hoy",
  },
  {
    name: "💎 Exclusivas",
    href: "/productos?collection=exclusive",
    badge: "",
    description: "Colecciones premium curadas",
  },
];

const DEMO_NAV = [
  { name: "Hombre", href: "/productos?genero=hombre" },
  { name: "Mujer", href: "/productos?genero=mujer" },
  { name: "Niños", href: "/productos?genero=ninos" },
];

export default function Navbar() {
  const { openCart, totalItems } = useCartStore();
  const { sections, fetchCMS } = useCMSStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  const formatWa = (numStr: string) => {
    const clean = numStr.replace(/\D/g, "");
    if (clean.length === 11 && clean.startsWith("591")) {
      return `+591 ${clean.slice(3, 6)} ${clean.slice(6)}`;
    }
    return numStr.startsWith("+") ? numStr : `+${numStr}`;
  };
  const displayWa = formatWa(sections.whatsapp_number || "59176932485");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Explicit text color class based on state (fixes dark red/black text color on dark hero)
  const linkColorClass = scrolled || mobileOpen
    ? "text-neutral-800 hover:text-[var(--color-accent)]"
    : "text-white/80 hover:text-white";

  const logoColor = scrolled || mobileOpen ? "var(--color-text)" : "var(--color-bg)";

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-black/5"
            : "bg-transparent"
        }`}
        style={{ top: "var(--announcement-height, 36px)" }}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-16 md:h-20">

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 -ml-2 transition-colors ${
              scrolled || mobileOpen ? "text-[var(--color-text)]" : "text-white"
            }`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop left nav — urgency-first */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4">
            {MAIN_NAV.map(link => (
              <div key={link.name} className="relative group shrink-0">
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase transition-all duration-300 whitespace-nowrap px-4 py-2 border rounded-none ${
                    scrolled || mobileOpen
                      ? "border-neutral-200 text-neutral-800 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
                      : "border-white/10 text-white/80 hover:border-white hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span
                      className="text-[7.5px] font-black px-1.5 py-[2px] text-white uppercase tracking-wider rounded-none select-none shrink-0 align-middle animate-pulse"
                      style={{ backgroundColor: link.badgeColor }}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {/* Logo — centered */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif font-black text-3xl md:text-[2rem] tracking-tighter uppercase transition-all duration-500"
            style={{ color: logoColor }}
          >
            Flores<span style={{ color: "var(--color-accent)" }}>.</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-5">
            {/* Secondary nav */}
            <nav className="hidden md:flex items-center gap-3 lg:gap-4 mr-2">
              {DEMO_NAV.map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 whitespace-nowrap px-4 py-2 border rounded-none ${
                    scrolled || mobileOpen
                      ? "border-neutral-200 text-neutral-800 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
                      : "border-white/10 text-white/80 hover:border-white hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Cart */}
            <button
              onClick={openCart}
              className={`relative flex items-center transition-all duration-300 hover:scale-105 ${
                scrolled || mobileOpen ? "text-[var(--color-text)] hover:text-[var(--color-accent)]" : "text-white/80 hover:text-white"
              }`}
              aria-label="Carrito"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems() > 0 && (
                <span className="absolute -top-2 -right-3 bg-[var(--color-accent)] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[49] bg-[var(--color-text)] text-white flex flex-col overflow-y-auto"
          style={{ paddingTop: "calc(36px + 64px)" }}>
          <div className="flex flex-col px-8 py-12 gap-0">
            {/* Priority links */}
            <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-[var(--color-accent)] mb-8">
              Comprar Ahora
            </p>
            {MAIN_NAV.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="group flex items-center justify-between py-6 border-b border-white/5"
              >
                <div>
                  <span className="text-3xl font-serif font-black tracking-tighter group-hover:text-[var(--color-accent)] transition-colors">
                    {link.name}
                  </span>
                  <p className="text-xs text-white/40 mt-1 font-medium">{link.description}</p>
                </div>
                {link.badge && (
                  <span
                    className="text-[8px] font-black px-3 py-1 text-white uppercase tracking-wider rounded-sm shrink-0"
                    style={{ backgroundColor: link.badgeColor }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Demographics */}
            <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-white/30 mt-10 mb-6">
              Categorías
            </p>
            {DEMO_NAV.map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-xl font-semibold uppercase tracking-wider py-4 border-b border-white/5 text-white/70 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto px-8 pb-12 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">Sede</p>
              <p className="text-sm font-semibold">Santa Cruz, Bolivia</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">WhatsApp</p>
              <p className="text-sm font-semibold">{displayWa}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
