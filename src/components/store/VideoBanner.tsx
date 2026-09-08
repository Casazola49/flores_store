"use client";

import Image from "next/image";
import BrandPlaceholder from "./BrandPlaceholder";
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
  /** Whether to autoplay. Categories should be false to avoid mass autoplay. */
  autoplay?: boolean;
  /** When true, marks the poster image as priority (eager + fetchPriority high) for LCP; below-fold usages should omit it and stay lazy. */
  priority?: boolean;
}

// Neutral fallback so a missing source never collapses the hero / sections.


function optimizeCloudinaryVideo(url: string): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return url;
  if (url.includes("f_auto")) return url;
  return url.replace("/video/upload/", "/video/upload/f_auto,q_auto/");
}

export default function VideoBanner({
  src,
  poster,
  alt,
  className,
  objectPosition,
  withOverlays = false,
  autoplay = true,
  priority = false,
}: VideoBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const optimizedSrc = src ? optimizeCloudinaryVideo(src) : undefined;
  const optimizedPoster = poster || undefined;

  // Cine Sutil rule: respect prefers-reduced-motion. Pause loops for users
  // who ask for less movement; resume only when a real source exists.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const v = videoRef.current;
      if (!v) return;
      if (mq.matches || !autoplay) {
        v.pause();
      } else if (optimizedSrc) {
        // autoPlay may be suppressed by the browser; nudge it along.
        v.play().catch(() => {});
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [optimizedSrc, autoplay]);

  // No source → real poster when available, otherwise an aspect-aware brand placeholder.
  if (!optimizedSrc) {
    return poster ? <><Image src={poster} alt={alt || ""} fill sizes="100vw" priority={priority} {...(priority ? { fetchPriority: "high" } : { loading: "lazy" })} className={`object-cover ${className ?? ""}`} style={objectPosition ? { objectPosition } : undefined} />{withOverlays && <Overlay />}</> : <BrandPlaceholder aspect="16:9" label={alt || "Flores"} variant="dark" />;
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay={autoplay}
        loop
        muted
        playsInline
        preload={autoplay ? "metadata" : "none"}
        poster={optimizedPoster}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover ${className ?? ""}`}
        style={objectPosition ? { objectPosition } : undefined}
      >
        <source src={optimizedSrc} type="video/mp4" />
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
