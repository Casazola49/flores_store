"use client";

import { useCartStore } from "@/lib/store";
import { X, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, MessageCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// ── Helpers ───────────────────────────────────────────────────
function buildWhatsAppMessage(
  items: ReturnType<typeof useCartStore.getState>["items"],
  subtotal: number,
  customer: { name: string; phone: string; city: string; deliveryType: string; address: string }
): string {
  const productLines = items
    .map(item => {
      const variant = [item.size && `Talla ${item.size}`, item.color && item.color]
        .filter(Boolean)
        .join(" / ");
      const lineTotal = (item.price * item.quantity).toFixed(0);
      return `• ${item.product_name}${variant ? ` (${variant})` : ""} x${item.quantity} — Bs. ${lineTotal}`;
    })
    .join("\n");

  const deliveryLine =
    customer.deliveryType === "envio"
      ? `🚚 *Envío a:* ${customer.address}, ${customer.city}`
      : `🏬 *Retiro en tienda* — ${customer.city}`;

  const msg = [
    `🛍️ *NUEVO PEDIDO — FLORES STORE*`,
    ``,
    `👤 *Cliente:* ${customer.name}`,
    `📱 *Teléfono:* ${customer.phone}`,
    deliveryLine,
    ``,
    `📦 *PRODUCTOS:*`,
    productLines,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `💰 *TOTAL: Bs. ${subtotal.toFixed(0)}*`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `¿Pueden confirmar disponibilidad y coordinar la entrega? 🙏`,
  ].join("\n");

  return encodeURIComponent(msg);
}

// ── Main Component ────────────────────────────────────────────
type Step = "cart" | "checkout" | "sent";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("cart");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "",
    deliveryType: "envio",
    address: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset step when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("cart");
        setFormError("");
      }, 400);
    }
  }, [isOpen]);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!customer.name.trim()) return setFormError("Por favor ingresa tu nombre.");
    if (!customer.phone.trim() || customer.phone.trim().length < 7) return setFormError("Ingresa un número de teléfono válido.");
    if (!customer.city.trim()) return setFormError("Indica tu ciudad.");
    if (customer.deliveryType === "envio" && !customer.address.trim()) return setFormError("Ingresa tu dirección de entrega.");

    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "59170000000";
    const message = buildWhatsAppMessage(items, subtotal(), customer);

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    setStep("sent");
  };

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[110] transform transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col border-l border-neutral-200 shadow-2xl`}
      >
        {/* ── Step: CART ──────────────────────────────────── */}
        {step === "cart" && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight">Mi Carrito</h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">{items.length} {items.length === 1 ? "producto" : "productos"}</p>
              </div>
              <button onClick={closeCart} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-6">
                  <ShoppingBag size={52} strokeWidth={1} />
                  <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-widest text-gray-400">Carrito vacío</p>
                    <p className="text-xs text-gray-300 mt-1">Agrega productos para continuar</p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="text-xs tracking-widest uppercase border-b border-black pb-1 hover:text-[#9B1C1C] hover:border-[#9B1C1C] transition-all font-bold"
                  >
                    Ver Colección →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div key={item.variant_id} className="flex gap-4 pb-6 border-b border-gray-50 last:border-0">
                      {/* Image */}
                      <div className="relative w-20 h-24 bg-gray-50 flex-shrink-0 rounded-lg overflow-hidden">
                        {item.product_image ? (
                          <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <ShoppingBag size={20} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="text-[12px] font-black uppercase tracking-wide leading-tight line-clamp-2">
                              {item.product_name}
                            </h3>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {item.size && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded uppercase">T: {item.size}</span>
                              )}
                              {item.color && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded uppercase">{item.color}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.variant_id)}
                            className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty */}
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <p className="font-black text-sm">Bs. {(item.price * item.quantity).toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
                {/* Subtotal */}
                <div className="flex justify-between items-center mb-5">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="text-2xl font-black tracking-tight">Bs. {subtotal().toFixed(0)}</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-4 text-center">Envío y descuentos se calculan al finalizar el pedido</p>
                {/* CTA */}
                <button
                  onClick={() => setStep("checkout")}
                  className="w-full bg-[#9B1C1C] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#7f1d1d] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                >
                  Completar Pedido <ArrowRight size={14} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Step: CHECKOUT FORM ───────────────────────── */}
        {step === "checkout" && (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 px-8 py-6 border-b border-neutral-100">
              <button onClick={() => setStep("cart")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight">Datos de Entrega</h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Completa tus datos para el pedido</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* Order summary (mini) */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Resumen del pedido</p>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item.variant_id} className="flex justify-between items-center">
                      <span className="text-xs text-gray-700 font-semibold line-clamp-1 max-w-[65%]">
                        {item.product_name}
                        {item.size && <span className="text-gray-400"> T:{item.size}</span>}
                        {" "}×{item.quantity}
                      </span>
                      <span className="text-xs font-black">Bs. {(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                  <span className="text-xs font-bold text-gray-600">Total</span>
                  <span className="text-sm font-black text-[#9B1C1C]">Bs. {subtotal().toFixed(0)}</span>
                </div>
              </div>

              {/* Form */}
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. María González"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#9B1C1C] transition-colors font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1.5">WhatsApp / Teléfono *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 70000000"
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#9B1C1C] transition-colors font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Ciudad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. La Paz, Cochabamba, Santa Cruz..."
                    value={customer.city}
                    onChange={e => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#9B1C1C] transition-colors font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Tipo de entrega *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, deliveryType: "envio" })}
                      className={`py-3 px-4 rounded-xl border-2 text-xs font-black uppercase transition-all ${
                        customer.deliveryType === "envio"
                          ? "border-[#9B1C1C] bg-[#9B1C1C] text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      🚚 Envío
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, deliveryType: "retiro" })}
                      className={`py-3 px-4 rounded-xl border-2 text-xs font-black uppercase transition-all ${
                        customer.deliveryType === "retiro"
                          ? "border-[#9B1C1C] bg-[#9B1C1C] text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      🏬 Retiro
                    </button>
                  </div>
                </div>

                {customer.deliveryType === "envio" && (
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Dirección de entrega *</label>
                    <input
                      type="text"
                      placeholder="Ej. Av. Arce 1234, Zona Central"
                      value={customer.address}
                      onChange={e => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#9B1C1C] transition-colors font-semibold"
                    />
                  </div>
                )}

                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700 font-semibold">
                    ⚠️ {formError}
                  </div>
                )}
              </form>
            </div>

            {/* CTA */}
            <div className="px-8 py-6 border-t border-gray-100">
              <button
                type="submit"
                form="checkout-form"
                className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#1eb558] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-green-900/20"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar Pedido por WhatsApp
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-3">
                Se abrirá WhatsApp con el resumen de tu pedido
              </p>
            </div>
          </>
        )}

        {/* ── Step: SENT ───────────────────────────────── */}
        {step === "sent" && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">¡Pedido enviado!</h2>
              <p className="text-sm text-gray-500 max-w-xs">
                Tu pedido fue enviado por WhatsApp. En breve nos comunicaremos para confirmar y coordinar la entrega.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "59170000000";
                  window.open(`https://wa.me/${phoneNumber}`, "_blank");
                }}
                className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#1eb558] transition-colors"
              >
                <MessageCircle size={14} /> Abrir WhatsApp
              </button>
              <button
                onClick={closeCart}
                className="w-full border border-gray-200 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
