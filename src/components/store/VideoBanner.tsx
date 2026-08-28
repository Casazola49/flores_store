"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

interface VideoBannerProps {
  /** Cloudinary MP4 url. If undefined, renders the poster / Unsplash fallback so layout never breaks. */
  src?: string;
  /** Poster frame shown before playback and as the image fallback when no video is present. */
  poster?: string;
  /** Decorative background videos are hidden from assistive tech; pass alt only when meaningful. */
  alt?: string;
  /** Extra Tailwind classes (opacity, scale, transitions, object position helpers). */
  className?: string;
  /** CSS object-position for the media. */
  objectPosition?: string;
  /** When true, paints a subtle crimson-tinted gradient overlay using the brand accent token. */
  withOverlays?: boolean;
}

// Neutral fallback so a missing source never collapses the hero / sections.
const FALLBACK =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1800";

export default function VideoBanner({
  src,
  poster,
  alt,
  className,
  objectPosition,
  withOverlays = false,
}: VideoBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cine Sutil rule: respect prefers-reduced-motion. Pause loops for users
  // who ask for less movement; resume only when a real source exists.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const v = videoRef.current;
      if (!v) return;
      if (mq.matches) {
        v.pause();
      } else if (src) {
        // autoPlay may be suppressed by the browser; nudge it along.
        v.play().catch(() => {});
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [src]);

  // No source → image fallback (real poster when available, else Unsplash).
  if (!src) {
    return (
      <>
        <Image
          src={poster || FALLBACK}
          alt={alt || ""}
          fill
          priority
          className={`object-cover ${className ?? ""}`}
          style={objectPosition ? { objectPosition } : undefined}
        />
        {withOverlays && <Overlay />}
      </>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover ${className ?? ""}`}
        style={objectPosition ? { objectPosition } : undefined}
      >
        <source src={src} type="video/mp4" />
        {/* If a clip ever carries spoken audio, add:
            <track kind="captions" src="/captions/hero.vtt" srcLang="es" label="Español" default /> */}
      </video>
      {withOverlays && <Overlay />}
    </>
  );
}

// Subtle dark + crimson-tinted gradient for legibility over moving media.
function Overlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        background:
          "linear-gradient(to top, rgba(10,10,10,0.7), rgba(10,10,10,0.25) 45%, transparent), radial-gradient(circle at 70% 80%, rgba(155,28,28,0.18), transparent 55%)",
      }}
    />
  );
}
