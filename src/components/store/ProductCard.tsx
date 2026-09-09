"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { StockBadge } from "./StockBadge";
import BrandPlaceholder from "./BrandPlaceholder";
import FavoritesButton from "./FavoritesButton";
import LiquidationBadge from "./LiquidationBadge";
import { useCMSStore } from "@/lib/store";

export type ProductCardVariant = "dark" | "light";

export type ProductCardData = {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock: number;
  img: string;
  isNew: boolean;
  isLiquidation?: boolean;
  videoUrl?: string;
  gender?: string;
  categorySlug?: string;
  lowStockCount?: number;
  lowStockSize?: string;
};

export type HotProduct = ProductCardData;

/**
 * Mapeo canónico único de producto Convex a ProductCardData.
 * Usado por HomeClient, ProductsClient, FavoritesClient y RelatedProducts
 * para evitar duplicación y discrepancias en badges, favoritos y stock.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProductToCardData(p: any): ProductCardData {
  if (!p) {
    return {
      id: "",
      name: "",
      slug: "",
      price: 0,
      stock: 0,
      img: "",
      isNew: false,
    };
  }

  const price = Number(p.base_price ?? p.price ?? 0);
  const rawCompare = p.compare_price ?? p.originalPrice;
  const originalPrice =
    rawCompare !== undefined && rawCompare !== null && rawCompare !== ""
      ? Number(rawCompare)
      : undefined;

  const variants = Array.isArray(p.variants) ? p.variants : [];
  const lowStockVariant = variants.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (v: any) => typeof v.stock === "number" && v.stock > 0 && v.stock <= 3
  );

  const totalStock =
    variants.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
      : Number(p.stock) || 0;

  const tags = Array.isArray(p.tags) ? p.tags : [];
  const isLiquidation =
    tags.includes("liquidacion") ||
    (originalPrice !== undefined && originalPrice > price);

  let img = "";
  if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]?.url) {
    img = p.images[0].url;
  } else if (typeof p.img === "string") {
    img = p.img;
  } else if (typeof p.image_url === "string") {
    img = p.image_url;
  }

  return {
    id: p._id || p.id || p.slug,
    name: p.name || "",
    slug: p.slug || "",
    price,
    originalPrice:
      originalPrice && originalPrice > price ? originalPrice : undefined,
    stock: totalStock,
    img,
    isNew: Boolean(p.is_new ?? p.isNew),
    isLiquidation,
    videoUrl: p.video_url || p.videoUrl,
    gender: p.gender,
    categorySlug: p.category_slug || p.categorySlug,
    lowStockCount: lowStockVariant ? Number(lowStockVariant.stock) : undefined,
    lowStockSize: lowStockVariant ? String(lowStockVariant.size) : undefined,
  };
}

function subscribeToReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

export default function ProductCard({
  product,
  variant = "dark",
}: {
  product: ProductCardData;
  variant?: ProductCardVariant;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const { sections } = useCMSStore();
  const saleEndsAt = sections.sale_ends_at || null;

  const handleEnter = () => {
    if (!product.videoUrl || reducedMotion) return;
    videoRef.current?.play().catch(() => {});
  };

  const handleLeave = () => {
    if (!product.videoUrl) return;
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  const hasDiscount =
    product.originalPrice !== undefined && product.originalPrice > product.price;

  const disc = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) * 100
      )
    : 0;

  const stockToShow =
    product.lowStockCount !== undefined ? product.lowStockCount : product.stock;
  const sizeToShow = product.lowStockSize;

  const isDark = variant === "dark";

  return (
    <div className="group relative block">
      {/* Sibling FavoritesButton overlay (NOT inside <Link> for valid HTML and clean event isolation) */}
      <div className="absolute top-4 right-4 z-30">
        <FavoritesButton slug={product.slug} variant={variant} />
      </div>

      <Link
        href={`/productos/${product.slug}`}
        className="block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div
          className={`relative aspect-[3/4] overflow-hidden mb-5 transition-all duration-500 rounded-none ${
            isDark
              ? "bg-[var(--color-primary)] border border-white/5 group-hover:border-[var(--color-accent)]/40 shadow-lg"
              : "bg-[var(--color-surface)] border border-[var(--color-border)]/40 group-hover:border-[var(--color-accent)]/40 shadow-sm"
          }`}
        >
          {product.img ? (
            <Image
              src={product.img}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className={`object-cover transition-transform duration-700 ${
                isDark
                  ? "group-hover:scale-[1.03] opacity-80 group-hover:opacity-100 filter brightness-[0.92] group-hover:brightness-100"
                  : "group-hover:scale-105"
              }`}
            />
          ) : (
            <BrandPlaceholder
              aspect="3:4"
              label="Flores"
              variant={isDark ? "dark" : "light"}
            />
          )}

          {/* Hover-video preview: fades in over the image, never autoplays in grid. */}
          {product.videoUrl && (
            <video
              ref={videoRef}
              src={product.videoUrl}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
            />
          )}

          {/* Badges stack: Liquidation (future-date gated), % OFF, NUEVO */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
            <LiquidationBadge
              isEligible={Boolean(product.isLiquidation)}
              saleEndsAt={saleEndsAt}
            />
            {disc > 0 && (
              <span className="bg-[var(--color-accent)] text-white text-label font-black px-2.5 py-1.5 uppercase tracking-widest rounded-none shadow-md">
                -{disc}% OFF
              </span>
            )}
            {product.isNew && (
              <span className="bg-white text-black text-label font-black px-2.5 py-1.5 uppercase tracking-widest rounded-none shadow-md">
                NUEVO
              </span>
            )}
          </div>

          {/* Dark variant hover embellishments */}
          {isDark && (
            <>
              <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-all duration-500 pointer-events-none z-10 m-2" />
              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex justify-center">
                <span className="border border-white/20 text-white text-label font-black uppercase tracking-[0.3em] px-4 py-2 bg-black/60 backdrop-blur-md rounded-none">
                  Ver Detalles
                </span>
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2 px-1">
          <h3
            className={`truncate transition-colors ${
              isDark
                ? "text-[11px] font-serif font-bold uppercase tracking-wider text-white/70 group-hover:text-white"
                : "text-title font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]"
            }`}
          >
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span
              className={`font-bold tracking-tight ${
                isDark
                  ? "text-xl text-white"
                  : "text-body font-bold text-[var(--color-text)]"
              }`}
            >
              Bs. {product.price.toFixed(0)}
            </span>
            {hasDiscount && (
              <span
                className={`line-through font-bold ${
                  isDark
                    ? "text-xs text-white/30"
                    : "text-body text-[var(--color-text-muted)] font-normal ml-2"
                }`}
              >
                Bs. {product.originalPrice?.toFixed(0)}
              </span>
            )}
          </div>

          <div className="pt-1">
            <StockBadge stock={stockToShow} size={sizeToShow} />
          </div>
        </div>
      </Link>
    </div>
  );
}
