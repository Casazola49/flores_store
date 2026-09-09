"use client";

import React, { useState } from "react";

interface LiquidationBadgeProps {
  isEligible: boolean;
  saleEndsAt?: string | null;
  className?: string;
}

/**
 * Insignia de liquidación real.
 * Renderiza ÚNICAMENTE cuando el producto es elegible Y saleEndsAt es una fecha ISO futura válida.
 * En cualquier otro caso (fecha ausente, vacía, inválida o pasada) no renderiza nada.
 * Invariante de honestidad: sin temporizadores, sin cuenta regresiva, sin fechas inventadas.
 */
export function LiquidationBadge({
  isEligible,
  saleEndsAt,
  className = "",
}: LiquidationBadgeProps) {
  const [currentTime] = useState(() => Date.now());

  if (!isEligible || !saleEndsAt || typeof saleEndsAt !== "string" || !saleEndsAt.trim()) {
    return null;
  }

  const parsedDate = new Date(saleEndsAt);
  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  // Debe ser estrictamente futura
  if (parsedDate.getTime() <= currentTime) {
    return null;
  }

  // Formatear DD/MM/YYYY
  let formattedDate: string;
  const isoMatch = saleEndsAt.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    formattedDate = `${day}/${month}/${year}`;
  } else {
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();
    formattedDate = `${day}/${month}/${year}`;
  }

  return (
    <span
      className={`inline-block bg-[var(--color-accent)] text-white text-label font-black uppercase tracking-widest rounded-none px-2.5 py-1.5 ${className}`}
    >
      Liquidación real — hasta {formattedDate}
    </span>
  );
}

export default LiquidationBadge;
