"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X, ChevronDown, Heart } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useCartStore } from "@/lib/store";
import MegaMenu from "./MegaMenu";
import type { Category } from "@/types";

const QUICK_LINKS = [
  { name: "Novedades", href: "/productos?is_new=true" },
  { name: "Liquidación", href: "/productos?sale=true" },
  { name: "Exclusivos", href: "/productos?collection=exclusive" },
];

export default function Navbar() {
  const { openCart, totalItems } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const categoriesData = useQuery(api.categories.getCategories);
  const categories = categoriesData || [];

  return (
    <header
      className="fixed top-0 z-50 w-full border-b border-white/10 bg-[var(--color-primary)]/90 text-white backdrop-blur"
      style={{ top: "var(--announcement-height, 0px)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <MegaMenu categories={categories} />
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-label hover:text-[var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] py-2"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/favoritos"
            className="text-label hover:text-[var(--color-accent)] transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] py-2"
            aria-label="Mis favoritos"
          >
            <Heart size={14} aria-hidden="true" />
            <span>Favoritos</span>
          </Link>
        </nav>

        {/* Brand Logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-3xl font-black tracking-tight"
        >
          Flores<span className="text-[var(--color-accent)]">.</span>
        </Link>

        {/* Cart trigger button */}
        <button
          onClick={openCart}
          aria-label="Carrito"
          className="relative p-2 text-white hover:text-[var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
        >
          <ShoppingBag size={20} />
          {totalItems() > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-label font-bold text-white text-[10px]">
              {totalItems()}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Accordion Menu */}
      {mobileMenuOpen && (
        <nav className="space-y-4 bg-[var(--color-primary)] p-6 md:hidden border-t border-white/10 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Categories disclosure accordion */}
          <div className="border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              aria-expanded={categoriesExpanded}
              className="flex w-full items-center justify-between text-headline font-bold text-left py-2 text-white hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            >
              <span>Categorías</span>
              <ChevronDown
                size={22}
                className={`transition-transform duration-200 ${
                  categoriesExpanded ? "rotate-180 text-[var(--color-accent)]" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {categoriesExpanded && (
              <div className="mt-3 pl-4 space-y-3 border-l border-white/20">
                {(categories as Category[]).map((cat) => (
                  <Link
                    key={cat.slug || String(cat.id)}
                    href={`/productos?category=${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-body text-white/80 hover:text-[var(--color-accent)] transition-colors py-1"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="space-y-4 pt-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-headline text-white hover:text-[var(--color-accent)] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/favoritos"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-headline text-white hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 pt-2"
            >
              <Heart size={20} aria-hidden="true" />
              <span>Favoritos</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
