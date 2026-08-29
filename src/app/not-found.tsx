import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada | Flores",
  description: "La página que buscás no existe o fue movida. Volvé al inicio o explorá la colección de Flores.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="relative flex min-h-[calc(100vh-120px)] items-center justify-center overflow-hidden bg-white px-4 py-16 sm:py-24">
      {/* editorial grid — sutil, no amarillo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-luxury-grid opacity-[0.04]"
      />

      <div className="relative w-full max-w-[640px] text-center">
        {/* label */}
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.32em] text-[var(--color-accent)]">
          Error 404 — Flores Atelier
        </p>

        {/* 404 display — Playfair via h1, sharp */}
        <h1 className="font-serif text-[clamp(5.5rem,18vw,11rem)] font-black leading-[0.85] tracking-[-0.04em] text-[var(--color-text)]">
          404
          <span aria-hidden="true" className="text-[var(--color-accent)]">
            .
          </span>
        </h1>

        <h2 className="mt-6 text-lg font-black uppercase tracking-tight text-[var(--color-text)] sm:text-xl">
          Página no encontrada
        </h2>

        <p className="mx-auto mt-4 max-w-[44ch] text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-[15px]">
          La página que buscás no existe, fue movida o el enlace está desactualizado. Seguí explorando la colección — cada par tiene su talle esperando.
        </p>

        {/* card premium sharp con corner decor */}
        <div className="relative mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          <span className="corner-decor corner-tl" aria-hidden="true" />
          <span className="corner-decor corner-tr" aria-hidden="true" />
          <span className="corner-decor corner-bl" aria-hidden="true" />
          <span className="corner-decor corner-br" aria-hidden="true" />

          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            ¿A dónde querés ir?
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="btn-premium w-full justify-center rounded-none px-8 py-4 text-xs sm:w-auto"
            >
              Volver al inicio
            </Link>
            <Link
              href="/productos"
              className="inline-flex w-full items-center justify-center border border-[var(--color-text)] bg-white px-8 py-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:w-auto"
            >
              Ver colección
            </Link>
          </div>

          <p className="mt-6 text-xs text-[var(--color-text-muted)]">
            ¿Buscabas algo puntual?{" "}
            <Link
              href="/productos"
              className="font-bold text-[var(--color-accent)] underline decoration-[var(--color-accent)] underline-offset-4 hover:text-[#801414]"
            >
              Explorar por categoría — Mujer, Varón, Niños
            </Link>
          </p>
        </div>

        {/* ayuda secondary */}
        <p className="mt-8 text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">
          Si llegaste acá desde un enlace externo, avisanos a{" "}
          <a
            href="mailto:ventas@floresbolivia.com"
            className="font-black text-[var(--color-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            ventas@floresbolivia.com
          </a>
        </p>
      </div>
    </main>
  );
}
