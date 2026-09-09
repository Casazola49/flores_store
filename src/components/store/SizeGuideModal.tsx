"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getSizeGuideForCategory } from "@/lib/sizeGuide";

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  categorySlug: string;
}

export default function SizeGuideModal({ open, onClose, categorySlug }: SizeGuideModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const families = getSizeGuideForCategory(categorySlug);
  const [selectedFamilyLabel, setSelectedFamilyLabel] = useState<string | null>(null);

  // Focus trap & trigger focus restoration
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      // Focus close button or first focusable element
      const timer = setTimeout(() => {
        const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables && focusables.length > 0) {
          focusables[0].focus();
        } else {
          modalRef.current?.focus();
        }
      }, 10);
      return () => clearTimeout(timer);
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // Keyboard navigation: Escape to close, Tab focus cycle
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const currentFamily = families.find((f) => f.label === selectedFamilyLabel) || families[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center md:justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity motion-reduce:transition-none"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Guía de talles"
        tabIndex={-1}
        className="relative z-10 w-full bg-white text-black border border-[var(--color-border)] shadow-2xl rounded-none max-h-[85vh] md:max-h-[90vh] md:max-w-md overflow-y-auto p-6 md:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-accent)] block mb-1">
              Referencia
            </span>
            <h2 className="text-xl font-serif font-black uppercase tracking-tight">
              Guía de talles
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar guía de talles"
            className="p-2 text-gray-400 hover:text-black transition-colors rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Family Tabs (if more than 1 family) */}
        {families.length > 1 && (
          <div className="flex gap-2 mb-6 border-b border-gray-100 pb-3" role="tablist" aria-label="Familias de talles">
            {families.map((fam) => {
              const isSelected = fam.label === currentFamily.label;
              return (
                <button
                  key={fam.label}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedFamilyLabel(fam.label)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-none border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
                  }`}
                >
                  {fam.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Size Guide Table */}
        {currentFamily && (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-black">
                  <th scope="col" className="py-3 px-4">Talle</th>
                  <th scope="col" className="py-3 px-4 text-right">Pie (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {currentFamily.sizes.map((entry) => (
                  <tr key={entry.size} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-black">{entry.size}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-600">{entry.footCm} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Measurement Hint */}
        <div className="bg-gray-50 p-4 border border-gray-100 text-[11px] text-gray-600 leading-relaxed rounded-none">
          <p className="font-bold text-black mb-1 uppercase tracking-wider text-[10px]">
            ¿Cómo medir tu pie?
          </p>
          <p>
            Apoya tu pie descalzo sobre una hoja de papel pegada a la pared. Marca el talón y el dedo más largo, y mide la distancia en centímetros.
          </p>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto px-6 py-3 bg-black text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-[var(--color-accent)] transition-colors rounded-none cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
