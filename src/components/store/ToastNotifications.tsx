"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, X } from "lucide-react";

const PRODUCTS = [
  "Bota Chelsea Noir", "Sneaker Urban Blancas", "Stiletto Dorado",
  "Loafer Cuero Café", "Bota Militar Rugged", "Zapatilla Comfort Plus",
  "Taco Block Heel", "Mocasin Clásico", "Sandalia Desert"
];

const CITIES = [
  "Santa Cruz", "La Paz", "Cochabamba", "Sucre", "Oruro",
  "Potosí", "Trinidad", "Riberalta", "Tarija", "Montero"
];

const NAMES = [
  "Carlos M.", "María V.", "Luis A.", "Ana P.", "Diego R.",
  "Sofía C.", "Jorge B.", "Lucía F.", "Rodrigo H.", "Valeria T."
];

interface Toast {
  id: number;
  name: string;
  city: string;
  product: string;
  leaving?: boolean;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ToastNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // First toast after 8s, then every 12–18s
    const show = () => {
      const toast: Toast = {
        id: Date.now(),
        name: rand(NAMES),
        city: rand(CITIES),
        product: rand(PRODUCTS),
      };

      setToasts(prev => [...prev.slice(-1), toast]);

      // Mark as leaving after 5s
      setTimeout(() => {
        setToasts(prev =>
          prev.map(t => t.id === toast.id ? { ...t, leaving: true } : t)
        );
        // Remove after animation
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 500);
      }, 5000);
    };

    const first = setTimeout(show, 8000);
    const interval = setInterval(show, 14000 + Math.random() * 4000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-28 left-4 z-[80] flex flex-col gap-3 max-w-[280px]">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`bg-white border-l-4 border-[#9B1C1C] shadow-lg p-4 flex items-start gap-3 ${
            toast.leaving ? "animate-toast-out" : "animate-toast-in"
          }`}
        >
          <div className="w-10 h-10 bg-[#0A0A0A] flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
              {toast.name} — {toast.city}
            </p>
            <p className="text-[11px] font-semibold text-[#0A0A0A] mt-1 leading-tight">
              acaba de comprar <span className="text-[#9B1C1C] font-bold">{toast.product}</span>
            </p>
          </div>
          <button
            onClick={() => setToasts(p => p.filter(t => t.id !== toast.id))}
            className="text-gray-300 hover:text-black transition-colors flex-shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
