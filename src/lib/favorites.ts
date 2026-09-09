// ============================================================
// Zustand Store — Favoritos (Lista de deseos)
// Persiste ÚNICAMENTE slugs (strings) en localStorage.
// La hidratación de datos (precios, stock) siempre es en vivo vía Convex.
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  count: () => number;
  clear: () => void;
}

const MAX_FAVORITES = 100;

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      slugs: [],

      toggle: (slug: string) => {
        const { slugs } = get();
        if (slugs.includes(slug)) {
          set({ slugs: slugs.filter((s) => s !== slug) });
        } else {
          const next = [...slugs, slug];
          // Limitar a MAX_FAVORITES (descartar los más antiguos si excede)
          if (next.length > MAX_FAVORITES) {
            set({ slugs: next.slice(next.length - MAX_FAVORITES) });
          } else {
            set({ slugs: next });
          }
        }
      },

      has: (slug: string) => get().slugs.includes(slug),

      count: () => get().slugs.length,

      clear: () => set({ slugs: [] }),
    }),
    {
      name: "flores-favorites",
      // Garantizar que únicamente se serialice el array de slugs
      partialize: (state) => ({ slugs: state.slugs }),
    }
  )
);
