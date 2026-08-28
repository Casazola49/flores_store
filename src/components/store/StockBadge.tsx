// Reusable stock badge. Real stock only (ethical: no fake scarcity).
// Colors use the Flores Crimson palette — never yellow.
export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-neutral-500">
        <span className="w-2 h-2 rounded-full bg-neutral-600 inline-block animate-pulse" />
        Agotado
      </span>
    );
  }
  if (stock <= 2) {
    return (
      <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-[#EF4444] animate-pulse">
        <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block shadow-[0_0_10px_#EF4444]" />
        ¡Último par restante!
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-amber-500">
        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shadow-[0_0_8px_#F59E0B]" />
        Pocas unidades
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-emerald-500">
      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_#10B981]" />
      Stock disponible
    </span>
  );
}

export default StockBadge;
