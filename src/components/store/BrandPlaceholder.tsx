type AspectRatio = "16:9" | "4:5" | "3:4";

const aspectClass: Record<AspectRatio, string> = {
  "16:9": "aspect-editorial",
  "4:5": "aspect-portrait",
  "3:4": "aspect-product",
};

export default function BrandPlaceholder({
  aspect = "3:4",
  label = "Flores",
  variant = "dark",
}: { aspect?: AspectRatio; label?: string; variant?: "dark" | "light" }) {
  const dark = variant === "dark";
  return (
    <div className={`relative w-full overflow-hidden ${aspectClass[aspect]} ${dark ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface)] text-[var(--color-primary)]"}`} role="img" aria-label={label}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M0 72C25 55 42 88 64 66S86 42 100 28V100H0Z" fill="var(--color-accent)" opacity=".16" />
        <path d="M0 15C28 30 53 5 100 20" fill="none" stroke="var(--color-accent)" strokeWidth=".5" opacity=".8" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-serif text-title tracking-tight">{label}</span>
    </div>
  );
}
