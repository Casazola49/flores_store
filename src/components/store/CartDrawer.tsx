"use client";

import { useCartStore } from "@/lib/store";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[110] transform transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col border-l border-gray-100`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-50">
          <h2 className="text-xl font-serif uppercase tracking-widest flex items-center gap-4">
            Bolsa de Compras
            <span className="text-xs font-sans font-medium text-gray-400">({items.length})</span>
          </h2>
          <button onClick={closeCart} className="p-2 hover:opacity-50 transition-opacity">
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-8">
              <ShoppingBag size={40} strokeWidth={1} className="opacity-20" />
              <p className="text-[10px] tracking-[0.4em] uppercase">Tu bolsa está vacía</p>
              <button 
                onClick={closeCart}
                className="text-[10px] tracking-[0.4em] uppercase border-b border-black pb-1 hover:opacity-50"
              >
                Continuar Explorando
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {items.map((item) => (
                <div key={item.variant_id} className="flex gap-6">
                  <div className="relative w-24 h-32 bg-gray-50 overflow-hidden flex-shrink-0">
                    {item.product_image ? (
                      <Image 
                        src={item.product_image} 
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-gray-300">No Image</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col py-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xs tracking-wider uppercase font-medium line-clamp-1">
                        {item.product_name}
                      </h3>
                      <button 
                        onClick={() => removeItem(item.variant_id)}
                        className="text-gray-300 hover:text-black p-1 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    
                    <div className="text-[10px] tracking-widest text-gray-400 uppercase space-y-1 mb-4">
                      {item.size && <p>Talla: {item.size}</p>}
                      {item.color && <p>Color: {item.color}</p>}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-gray-100">
                        <button 
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      <p className="text-xs font-medium tracking-wider">
                        Bs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-8 bg-gray-50">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] tracking-[0.4em] uppercase text-gray-500">Subtotal</span>
              <span className="text-lg font-medium tracking-wider">Bs. {subtotal().toFixed(2)}</span>
            </div>
            <Link 
              href="/carrito" 
              onClick={closeCart}
              className="block w-full bg-black text-white py-6 text-[10px] tracking-[0.5em] uppercase text-center hover:bg-black/80 transition-all"
            >
              Completar Pedido
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
