"use client";

import { useCartStore, useCMSStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ArrowLeft, ShoppingBag } from "lucide-react";
import { buildOrderMessage, getWhatsAppNumber, openWhatsApp } from "@/lib/whatsapp";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
  const { sections, fetchCMS } = useCMSStore();
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchCMS();
  }, [fetchCMS]);

  if (!mounted) return null;

  const handleWhatsAppCheckout = () => {
    const phoneNumber = getWhatsAppNumber(sections.whatsapp_number);
    const encodedMessage = buildOrderMessage(items, subtotal(), null, notes);
    openWhatsApp(phoneNumber, encodedMessage);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] pt-36 pb-32">
        <div className="container mx-auto px-6 max-w-2xl text-center py-20">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-black/5 text-[var(--color-accent)]">
            <ShoppingBag size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight uppercase mb-4">
            Tu carrito está vacío<span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="text-body text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
            Aún no has agregado calzados a tu selección. Explora nuestro catálogo y descubre modelos con stock real en Bolivia.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center bg-[var(--color-accent)] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#801414] transition-colors shadow-sm"
          >
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-36 pb-32">
      <div className="container mx-auto px-6 max-w-[1300px]">
        {/* Breadcrumb & Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-label text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)]">Carrito</span>
          </div>
          <Link
            href="/productos"
            className="text-label text-[var(--color-accent)] hover:underline inline-flex items-center gap-1.5 font-bold uppercase"
          >
            <ArrowLeft size={14} /> Continuar comprando
          </Link>
        </div>

        {/* Title */}
        <div className="mb-12 border-b border-black/10 pb-6 flex items-baseline justify-between flex-wrap gap-4">
          <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight uppercase">
            Tu Carrito<span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="text-label text-[var(--color-text-muted)] font-bold uppercase tracking-widest">
            {items.length} {items.length === 1 ? "artículo" : "artículos"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Items List */}
          <div className="w-full lg:w-2/3 bg-white border border-black/10">
            {/* Table Header (Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-black/10 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] bg-neutral-50">
              <div className="col-span-6">Producto</div>
              <div className="col-span-2 text-center">Precio</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-black/10">
              {items.map((item) => {
                const itemLink = `/productos/${item.slug || item.product_id}`;
                return (
                  <div key={item.variant_id} className="p-6 flex flex-col md:grid md:grid-cols-12 gap-6 items-center">
                    {/* Producto */}
                    <div className="col-span-6 flex items-center gap-4 w-full">
                      <Link href={itemLink} className="relative w-20 h-24 bg-neutral-100 flex-shrink-0 overflow-hidden border border-black/5 block">
                        {item.product_image ? (
                          <Image src={item.product_image} alt={item.product_name} fill sizes="80px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <ShoppingBag size={24} />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={itemLink}
                          className="font-bold text-sm hover:text-[var(--color-accent)] transition-colors line-clamp-1 block mb-1 uppercase tracking-tight"
                        >
                          {item.product_name}
                        </Link>
                        <div className="text-xs text-[var(--color-text-muted)] space-y-0.5">
                          {item.size && (
                            <p>
                              Talle: <span className="font-semibold text-black">{item.size}</span>
                            </p>
                          )}
                          {item.color && (
                            <p>
                              Color: <span className="font-semibold text-black">{item.color}</span>
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => removeItem(item.variant_id)}
                          className="text-[11px] font-bold uppercase tracking-wider text-red-700 hover:text-black mt-3 md:hidden flex items-center gap-1 transition-colors"
                        >
                          <X size={13} /> Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Precio (Desktop) */}
                    <div className="col-span-2 text-center hidden md:block">
                      <span className="text-sm font-semibold">Bs. {item.price.toFixed(0)}</span>
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-2 flex justify-center w-full md:w-auto">
                      <div className="flex items-center border border-black/20 bg-white">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                          className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-xs select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                          className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Total y Eliminar (Desktop) */}
                    <div className="col-span-2 flex items-center justify-between md:justify-end w-full md:w-auto">
                      <span className="font-bold text-sm md:text-base text-right">
                        Bs. {(item.price * item.quantity).toFixed(0)}
                      </span>
                      <button
                        onClick={() => removeItem(item.variant_id)}
                        className="text-neutral-400 hover:text-[var(--color-accent)] p-1.5 hidden md:block ml-3 transition-colors cursor-pointer"
                        title="Eliminar producto"
                        aria-label="Eliminar producto"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="w-full lg:w-1/3 bg-white border border-black/10 p-8 sticky top-36">
            <h2 className="text-xl font-serif font-black uppercase tracking-tight mb-6 pb-4 border-b border-black/10">
              Resumen del pedido
            </h2>

            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-black/10">
              <div className="flex justify-between items-center text-body">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span className="font-bold text-black">Bs. {subtotal().toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center text-body">
                <span className="text-[var(--color-text-muted)]">Envío</span>
                <span className="text-xs text-[var(--color-accent)] font-semibold uppercase tracking-wider">
                  Coordinado por WhatsApp
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Total</span>
              <span className="text-3xl font-black tracking-tight text-black">
                Bs. {subtotal().toFixed(0)}
              </span>
            </div>

            <div className="mb-6">
              <label htmlFor="cart-notes" className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                Instrucciones de entrega o notas (opcional)
              </label>
              <textarea
                id="cart-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Enviar a Cochabamba, entregar en horario de oficina..."
                className="w-full p-3 border border-black/20 text-xs font-medium focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Finalizar pedido por WhatsApp
            </button>

            <p className="text-[10px] text-center text-[var(--color-text-muted)] mt-4 leading-relaxed">
              Al hacer clic, se abrirá WhatsApp con el detalle de tu pedido para coordinar pago y entrega directamente con nuestro equipo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
