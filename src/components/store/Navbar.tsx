"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { ShoppingBag, Menu, Search, User, MapPin } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { openCart, totalItems } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "NOVEDADES", href: "/productos?is_new=true" },
    { name: "BOTAS", href: "/categorias/botas" },
    { name: "ZAPATOS", href: "/categorias/zapatos" },
    { name: "ZAPATILLAS", href: "/categorias/zapatillas" },
    { name: "TACOS", href: "/categorias/tacos" },
    { name: "OFERTAS", href: "/productos?sale=true", isHighlight: true },
  ];

  return (
    <header className="z-50">
      {/* Top Bar - Black */}
      <div className="bg-black text-white py-4 px-4 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase opacity-80">
          <MapPin size={14} className="text-[var(--color-accent)]" />
          <span className="hidden sm:inline">Envíos a todo Bolivia</span>
        </div>
        
        <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter uppercase flex-shrink-0">
          FLORES<span className="text-[var(--color-accent)]">.</span>
        </Link>

        <div className="flex items-center space-x-6">
          <button className="text-white hover:text-[var(--color-accent)] transition-colors">
            <Search size={20} strokeWidth={2} />
          </button>
          <button className="text-white hover:text-[var(--color-accent)] transition-colors hidden sm:block">
            <User size={20} strokeWidth={2} />
          </button>
          <button 
            onClick={openCart} 
            className="relative text-white hover:text-[var(--color-accent)] transition-colors flex items-center"
          >
            <ShoppingBag size={22} strokeWidth={2} />
            {totalItems() > 0 && (
              <span className="absolute -top-2 -right-3 bg-[var(--color-accent)] text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                {totalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sticky Bottom Bar - Yellow (Aria Style) */}
      <div className="sticky top-0 bg-[var(--color-accent)] shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between md:justify-center h-14">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>

            <nav className="hidden md:flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-[11px] font-black tracking-widest transition-colors hover:opacity-60 ${
                    pathname === link.href ? "border-b-2 border-black" : ""
                  } ${link.isHighlight ? "text-red-600" : "text-black"}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            <div className="md:hidden font-black text-xs tracking-widest text-black">
              CATEGORÍAS
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 fixed inset-0 z-[100] p-8 animate-in slide-in-from-left">
          <div className="flex justify-between items-center mb-12">
             <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-black">
              FLORES<span className="text-[var(--color-accent)]">.</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="font-black text-xs underline uppercase">Cerrar</button>
          </div>
          <nav className="flex flex-col space-y-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xl font-black tracking-widest uppercase ${
                  link.isHighlight ? "text-red-500" : "text-black"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
