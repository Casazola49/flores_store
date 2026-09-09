"use client";

import Link from "next/link";
import { useCMSStore } from "@/lib/store";
import { getWhatsAppNumber } from "@/lib/whatsapp";

export default function Footer() {
  const { sections } = useCMSStore();
  const whatsappNumber = getWhatsAppNumber(sections.whatsapp_number);

  return (
    <footer className="bg-[var(--color-primary)] px-6 py-20 text-white">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="font-serif text-4xl font-black">
              Flores<span className="text-[var(--color-accent)]">.</span>
            </h2>
            <p className="mt-5 max-w-xs text-body text-white/60">
              Calzado premium con stock real en Bolivia.
            </p>
          </div>

          <div>
            <h3 className="text-label mb-5">Catálogo</h3>
            <div className="space-y-3 text-body">
              <Link
                className="block hover:text-[var(--color-accent)] transition-colors"
                href="/productos?is_new=true"
              >
                Novedades
              </Link>
              <Link
                className="block hover:text-[var(--color-accent)] transition-colors"
                href="/productos?sale=true"
              >
                Liquidación
              </Link>
              <Link
                className="block hover:text-[var(--color-accent)] transition-colors"
                href="/productos?collection=exclusive"
              >
                Exclusivos
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-label mb-5">Contacto</h3>
            <p className="text-body text-white/60">Cochabamba y Santa Cruz, Bolivia</p>
            <a
              className="text-body hover:text-[var(--color-accent)] transition-colors"
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <p className="border-t border-white/10 pt-8 text-label text-white/50">
          © {new Date().getFullYear()} Flores Bolivia. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
