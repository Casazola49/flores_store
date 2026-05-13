// ============================================================
// Zustand Store — Carrito de compras
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (newItem) => {
        const { items } = get();
        const existing = items.find((i) => i.variant_id === newItem.variant_id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.variant_id === newItem.variant_id
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
        // Abrir carrito al agregar
        set({ isOpen: true });
      },

      removeItem: (variantId) =>
        set((s) => ({ items: s.items.filter((i) => i.variant_id !== variantId) })),

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.variant_id === variantId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "flores-cart",
    }
  )
);

// ============================================================
// Zustand Store — Admin Auth
// ============================================================

interface AdminAuthStore {
  token: string | null;
  user: { username: string; role: string } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: { username: string; role: string }) => void;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthStore>()((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("flores_admin_token") : null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flores_admin_token", token);
    }
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("flores_admin_token");
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
