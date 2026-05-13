"use client";

import { useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ArrowLeft, Send } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleWhatsAppCheckout = () => {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "59170000000";
    
    let message = `¡Hola! Me gustaría realizar el siguiente pedido en Flores:\n\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.product_name}*\n`;
      if (item.size) message += `   - Talla: ${item.size}\n`;
      if (item.color) message += `   - Color: ${item.color}\n`;
      message += `   - Cantidad: ${item.quantity}\n`;
      message += `   - Precio Unitario: Bs. ${item.price.toFixed(2)}\n`;
      message += `   - Subtotal: Bs. ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    message += `*Total a pagar: Bs. ${subtotal().toFixed(2)}*\n\n`;
    
    if (notes) {
      message += `*Notas adicionales:*\n${notes}\n\n`;
    }

    message += `Por favor, confírmenme la disponibilidad y los datos para el pago/envío. ¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Opcional: limpiar carrito después de unos segundos asumiendo que compró
    // setTimeout(() => clearCart(), 5000);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h1 className="text-4xl font-black uppercase font-['Outfit'] mb-6">Tu Carrito</h1>
        <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-8">Tu carrito está vacío actualmente.</p>
          <Link href="/productos" className="btn btn-primary w-full py-4 text-sm font-bold tracking-wider">
            SEGUIR COMPRANDO
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/productos" className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl md:text-4xl font-black uppercase font-['Outfit']">Tu Carrito</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Lista de Items */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
              <div className="col-span-6">Producto</div>
              <div className="col-span-2 text-center">Precio</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.variant_id} className="p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                  
                  {/* Producto */}
                  <div className="col-span-6 flex items-center gap-4 w-full">
                    <div className="relative w-24 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.product_image ? (
                        <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">Img</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/productos/${item.product_id}`} className="font-bold text-sm md:text-base hover:text-[var(--color-accent)] transition-colors line-clamp-2 mb-1">
                        {item.product_name}
                      </Link>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        {item.size && <p>Talla: <span className="font-medium text-gray-800">{item.size}</span></p>}
                        {item.color && <p>Color: <span className="font-medium text-gray-800">{item.color}</span></p>}
                      </div>
                      <button 
                        onClick={() => removeItem(item.variant_id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 mt-3 md:hidden flex items-center gap-1"
                      >
                        <X size={14} /> Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Precio (Desktop) */}
                  <div className="col-span-2 text-center hidden md:block">
                    <span className="font-medium">Bs. {item.price.toFixed(2)}</span>
                  </div>

                  {/* Cantidad */}
                  <div className="col-span-2 flex justify-center w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      ><Minus size={16} /></button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        readOnly
                        className="w-12 h-10 text-center font-bold text-sm border-none outline-none appearance-none bg-transparent"
                      />
                      <button 
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      ><Plus size={16} /></button>
                    </div>
                  </div>

                  {/* Total y Eliminar (Desktop) */}
                  <div className="col-span-2 flex items-center justify-between md:justify-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-gray-100">
                    <span className="font-bold text-lg md:text-base">Bs. {(item.price * item.quantity).toFixed(2)}</span>
                    <button 
                      onClick={() => removeItem(item.variant_id)}
                      className="text-gray-400 hover:text-red-500 p-2 hidden md:block ml-2"
                      title="Eliminar producto"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <h2 className="text-xl font-bold uppercase font-['Outfit'] mb-6">Resumen del Pedido</h2>
            
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">Bs. {subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Envío</span>
                <span className="text-xs text-[var(--color-primary)] font-medium">Calculado por WhatsApp</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-bold uppercase">Total Estimado</span>
              <span className="text-2xl font-black">Bs. {subtotal().toFixed(2)}</span>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Instrucciones Especiales (Opcional)
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Prefiero envío por X empresa, o es para un regalo..."
                className="input text-sm bg-gray-50"
                rows={3}
              />
            </div>

            <button 
              onClick={handleWhatsAppCheckout}
              className="btn btn-primary w-full py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl"
            >
              <Send size={18} />
              Enviar Pedido por WhatsApp
            </button>
            
            <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
              Al hacer clic, serás redirigido a WhatsApp con el resumen de tu pedido para coordinar el pago y envío directamente con nuestro equipo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
