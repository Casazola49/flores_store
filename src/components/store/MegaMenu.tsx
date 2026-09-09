"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface MegaMenuCategory {
  id?: string | number;
  _id?: string;
  name: string;
  slug: string;
}

interface MegaMenuProps {
  categories: MegaMenuCategory[];
}

const QUICK_LINKS = [
  { name: "Novedades", href: "/productos?is_new=true" },
  { name: "Liquidación", href: "/productos?sale=true" },
  { name: "Exclusivos", href: "/productos?collection=exclusive" },
];

export default function MegaMenu({ categories = [] }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const startCloseTimer = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  const getMenuItems = (): HTMLElement[] => {
    if (!panelRef.current) return [];
    return Array.from(
      panelRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')
    );
  };

  const focusFirstMenuItem = () => {
    const items = getMenuItems();
    if (items.length > 0) {
      items[0].focus();
    }
  };

  const focusLastMenuItem = () => {
    const items = getMenuItems();
    if (items.length > 0) {
      items[items.length - 1].focus();
    }
  };

  const focusNextMenuItem = (direction: 1 | -1) => {
    const items = getMenuItems();
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) {
      items[direction === 1 ? 0 : items.length - 1].focus();
    } else {
      const nextIndex = (currentIndex + direction + items.length) % items.length;
      items[nextIndex].focus();
    }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      clearCloseTimer();
      setIsOpen(true);
      setTimeout(() => {
        focusFirstMenuItem();
      }, 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      clearCloseTimer();
      setIsOpen(true);
      setTimeout(() => {
        focusLastMenuItem();
      }, 0);
    } else if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusNextMenuItem(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusNextMenuItem(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusFirstMenuItem();
    } else if (e.key === "End") {
      e.preventDefault();
      focusLastMenuItem();
    }
  };

  // Close when focus moves outside the mega-menu container
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => {
        clearCloseTimer();
        setIsOpen(true);
      }}
      onMouseLeave={startCloseTimer}
      onFocusCapture={clearCloseTimer}
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        id="mega-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="mega-menu-panel"
        onClick={() => {
          clearCloseTimer();
          setIsOpen((prev) => !prev);
        }}
        onKeyDown={handleTriggerKeyDown}
        className="flex items-center gap-1.5 text-label py-2 text-white/90 hover:text-[var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
      >
        <span>Categorías</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--color-accent)]" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id="mega-menu-panel"
          role="menu"
          aria-labelledby="mega-menu-trigger"
          onKeyDown={handlePanelKeyDown}
          className="absolute left-0 top-full mt-2 w-[520px] bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-none shadow-[var(--shadow-lg)] p-6 z-50 animate-slide-up"
        >
          <div className="grid grid-cols-2 gap-8">
            {/* Categories column */}
            <div>
              <p className="text-label text-[var(--color-text-muted)] mb-4 border-b border-[var(--color-border)] pb-2 font-bold tracking-wider">
                Categorías
              </p>
              <div className="space-y-2">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat.slug || cat._id || cat.id}
                      role="menuitem"
                      href={`/productos?category=${cat.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block text-body text-[var(--color-text)] hover:text-[var(--color-accent)] hover:translate-x-1 transition-all duration-150 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <p className="text-body text-[var(--color-text-muted)] italic text-sm">
                    Cargando categorías...
                  </p>
                )}
              </div>
            </div>

            {/* Quick links column */}
            <div>
              <p className="text-label text-[var(--color-text-muted)] mb-4 border-b border-[var(--color-border)] pb-2 font-bold tracking-wider">
                Colecciones
              </p>
              <div className="space-y-2">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    role="menuitem"
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-body font-bold text-[var(--color-text)] hover:text-[var(--color-accent)] hover:translate-x-1 transition-all duration-150 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
