interface LowStockNoteProps {
  stock: number;
  size: string;
  className?: string;
}

/**
 * Nota de stock bajo en ficha de producto (PDP).
 * Renderiza exactamente "Quedan {N} en talle {size}" cuando 0 < stock <= 3.
 * Configurado con role="status" y aria-live="polite" para tecnologías de asistencia.
 */
export function LowStockNote({ stock, size, className = "" }: LowStockNoteProps) {
  if (stock <= 0 || stock > 3) {
    return null;
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-[var(--color-accent)] text-label font-bold ${className}`}
    >
      Quedan {stock} en talle {size}
    </p>
  );
}

export default LowStockNote;
