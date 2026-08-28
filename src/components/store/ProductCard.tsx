"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StockBadge } from "./StockBadge";

// Shared shape for hot-product cards (mujer-first catalog highlight).
export type HotProduct = {
  id: number | string;
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  views: number;
  img: string;
  slug: string;
  isNew: boolean;
  /** Optional Cloudinary MP4 for hover-preview (no mass autoplay). */
  videoUrl?: string;
};

export default function ProductCard({ product }: { product: HotProduct }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Cine Sutil: hover-video is a user-initiated enhancement, but we still
  // skip playback entirely when the visitor prefers reduced motion.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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

  const disc =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="relative aspect-[3/4] bg-[#0E0E0E] overflow-hidden mb-5 border border-white/5 group-hover:border-[#9B1C1C]/40 transition-all duration-500 rounded-none shadow-lg">
        {product.img ? (
          <Image
            src={product.img}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700 opacity-70 group-hover:opacity-100 filter brightness-[0.92] group-hover:brightness-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/5 text-[9px] font-black uppercase tracking-widest">
            Sin Imagen
          </div>
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

        {/* Tags — crimson for discount, sharp (radius 0), no yellow. */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
          {disc > 0 && (
            <span className="bg-[#9B1C1C] text-white text-[8px] font-black px-2.5 py-1.5 uppercase tracking-widest rounded-none shadow-md">
              -{disc}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="bg-white text-black text-[8px] font-black px-2.5 py-1.5 uppercase tracking-widest rounded-none shadow-md">
              NUEVO
            </span>
          )}
        </div>

        {/* Inside borders hover visual decoration */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-all duration-500 pointer-events-none z-10 m-2" />

        {/* Hover Overlay bottom sliding */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex justify-center">
          <span className="border border-white/20 text-white text-[8.5px] font-black uppercase tracking-[0.3em] px-4 py-2 bg-black/60 backdrop-blur-md rounded-none">
            Ver Detalles
          </span>
        </div>
      </div>

      <div className="space-y-2 px-1">
        <h3 className="text-[11px] font-serif font-bold uppercase tracking-wider text-white/70 group-hover:text-white transition-colors truncate">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-white">
            Bs. {product.price}
          </span>
          {disc > 0 && (
            <span className="text-xs text-white/30 line-through font-bold">
              Bs. {product.originalPrice}
            </span>
          )}
        </div>
        <div className="pt-1">
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}
