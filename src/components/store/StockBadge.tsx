export function StockBadge({ stock, size }: { stock: number; size?: string }) {
  if (stock === 0) {
    return (
      <span className="flex items-center gap-2 text-label text-[var(--color-text-muted)]">
        <span className="w-2 h-2 rounded-none bg-[var(--color-text-muted)] inline-block" />
        Agotado
      </span>
    );
  }

  if (stock <= 3 && size) {
    return (
      <span className="flex items-center gap-2 text-label text-[var(--color-accent)] font-bold">
        <span className="w-2 h-2 rounded-none bg-[var(--color-accent)] inline-block" />
        Quedan {stock} en talle {size}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-label text-[var(--color-text-muted)]">
      <span className="w-2 h-2 rounded-none bg-[var(--color-text-muted)] inline-block" />
      Stock disponible
    </span>
  );
}

export default StockBadge;
