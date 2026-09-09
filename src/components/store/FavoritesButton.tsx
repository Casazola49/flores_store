"use client";

import { useFavoritesStore } from "@/lib/favorites";
import { Heart } from "lucide-react";
import React, { useSyncExternalStore } from "react";

interface FavoritesButtonProps {
  slug: string;
  className?: string;
  variant?: "dark" | "light" | "default";
}

const emptySubscribe = () => () => {};

function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Botón de alternancia de favoritos con semántica accesible y estado no dependiente solo de color.
 * Utiliza icono de corazón (contorno vs relleno) y nombres accesibles dinámicos.
 * Debe montarse fuera de elementos <Link> (como superposición hermana).
 */
export function FavoritesButton({
  slug,
  className = "",
  variant = "default",
}: FavoritesButtonProps) {
  const mounted = useIsMounted();
  const isFavInStore = useFavoritesStore((state) => state.has(slug));
  const toggle = useFavoritesStore((state) => state.toggle);

  const isFavorite = mounted ? isFavInStore : false;
  const label = isFavorite ? "Quitar de favoritos" : "Agregar a favoritos";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(slug);
  };

  const colorClass = isFavorite
    ? "text-[var(--color-accent)]"
    : variant === "dark"
    ? "text-white/80 hover:text-white"
    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center p-2 rounded-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer ${colorClass} ${className}`}
    >
      <Heart
        className={`w-5 h-5 transition-transform duration-150 ${
          isFavorite ? "fill-current scale-110" : ""
        }`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}

export default FavoritesButton;
