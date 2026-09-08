export function StockBadge({ stock }: { stock: number }) {
  return <span className="flex items-center gap-2 text-label text-[var(--color-text-muted)]"><span className="w-2 h-2 rounded-none bg-[var(--color-text-muted)] inline-block" />{stock === 0 ? "Agotado" : "Stock disponible"}</span>;
}
export default StockBadge;
