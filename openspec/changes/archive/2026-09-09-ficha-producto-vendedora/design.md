# Design — Ficha de Producto Vendedora (`ficha-producto-vendedora`)

**Phase:** design  
**Branch:** `sdd/ficha-producto-vendedora`  
**Status:** Ready for tasks decomposition  
**Source of truth:** DESIGN.md + PRODUCT.md + proposal.md  

---

## 1. Scope Summary

Five scope items from the proposal, implemented as three task slices (see §9):

| # | Scope item | Key constraint |
|---|---|---|
| 1 | PDP purchase support | Size guide modal, related products, single-product WhatsApp CTA |
| 2 | Truthful selling signals | `is_new` admin boolean, `sale_ends_at` nullable CMS setting, low-stock ≤3 |
| 3 | Favorites | Zustand persist (slugs only), `/favoritos` noindex, heart toggle on cards + PDP |
| 4 | Navigation | Category mega-menu (desktop hover / mobile accordion), rename "Ofertas" → "Liquidación", canonical ProductCard |
| 5 | Seed +10 | Idempotent by slug, variants `v59+`, sort_order 21–30, `is_new: true`, 5 categories |

**Out of scope:** payment gateway, authentication, reviews, shipping calculation.

---

## 2. Design Tokens & Constraints (invariants)

All invariants from DESIGN.md and PRODUCT.md apply. Design additions for this change:

| Token / Rule | Value | Source |
|---|---|---|
| Flores Crimson | `var(--color-accent)` = `#9B1C1C` | DESIGN.md One-Voice |
| Crimson Bright | `var(--color-accent-bright)` = `#C1272D` | DESIGN.md |
| Crimson Light | `var(--color-accent-light)` = `#FEE2E2` | DESIGN.md |
| Sharp Rule | `rounded-none` (radius 0) on ALL new components | DESIGN.md Sharp Rule |
| No-Yellow Rule | No `#FFD700`, `#FFB300`, `#FFC107` anywhere | DESIGN.md |
| Typography | Playfair Display ≤2 headlines/page; body always DM Sans | DESIGN.md One-Voice type |
| Focus | `:focus-visible` double ring (bg + accent) — already in globals.css | DESIGN.md |
| Reduced motion | `prefers-reduced-motion` disables animations — already in globals.css | DESIGN.md |
| Contrast | `--color-text-muted` (#6B6B6B) ≈5.6:1 on white; `--color-accent` ≈12.4:1 on white | PRODUCT.md |
| Fonts | `next/font` only (DM Sans + Playfair Display, display swap) | PRODUCT.md |
| Honesty | No countdown timers, no fake scarcity, no synthetic discounts | PRODUCT.md ethics |

---

## 3. Architecture by Scope Item

### 3.1 PDP Purchase Support

#### 3.1.1 Size Guide — `src/lib/sizeGuide.ts` (NEW)

Static ES-BO category-family map. No admin UI, no Convex table.

```typescript
// src/lib/sizeGuide.ts

export type SizeGuideEntry = {
  size: string;    // "35"
  footCm: string;  // "22.5"
};

export type SizeGuideCategory = {
  label: string;        // "Mujer"
  sizes: SizeGuideEntry[];
};

export type SizeGuideMap = Record<string, SizeGuideCategory[]>;

/**
 * Bolivian shoe sizes by category family.
 * Keys match product.category_slug or a prefix (e.g. "botas" → "botas").
 */
export const SIZE_GUIDE: SizeGuideMap = {
  "botas": [
    { label: "Mujer", sizes: [
      { size: "34", footCm: "21.5" }, { size: "35", footCm: "22.0" },
      { size: "36", footCm: "22.5" }, { size: "37", footCm: "23.0" },
      { size: "38", footCm: "23.5" }, { size: "39", footCm: "24.0" },
      { size: "40", footCm: "24.5" }, { size: "41", footCm: "25.0" },
    ]},
  ],
  "zapatos": [
    { label: "Mujer", sizes: [
      { size: "34", footCm: "21.5" }, { size: "35", footCm: "22.0" },
      { size: "36", footCm: "22.5" }, { size: "37", footCm: "23.0" },
      { size: "38", footCm: "23.5" }, { size: "39", footCm: "24.0" },
      { size: "40", footCm: "24.5" }, { size: "41", footCm: "25.0" },
    ]},
  ],
  "zapatillas": [
    { label: "Mujer", sizes: [
      { size: "34", footCm: "21.5" }, { size: "35", footCm: "22.0" },
      { size: "36", footCm: "22.5" }, { size: "37", footCm: "23.0" },
      { size: "38", footCm: "23.5" }, { size: "39", footCm: "24.0" },
      { size: "40", footCm: "24.5" }, { size: "41", footCm: "25.0" },
    ]},
    { label: "Unisex", sizes: [
      { size: "38", footCm: "23.5" }, { size: "39", footCm: "24.0" },
      { size: "40", footCm: "24.5" }, { size: "41", footCm: "25.0" },
    ]},
  ],
  "zapatillas-deportivas": [
    { label: "Hombre", sizes: [
      { size: "39", footCm: "24.0" }, { size: "40", footCm: "24.5" },
      { size: "41", footCm: "25.0" }, { size: "42", footCm: "25.5" },
      { size: "43", footCm: "26.0" }, { size: "44", footCm: "26.5" },
    ]},
    { label: "Mujer", sizes: [
      { size: "35", footCm: "22.0" }, { size: "36", footCm: "22.5" },
      { size: "37", footCm: "23.0" }, { size: "38", footCm: "23.5" },
      { size: "39", footCm: "24.0" }, { size: "40", footCm: "24.5" },
    ]},
  ],
  "tacos": [
    { label: "Mujer", sizes: [
      { size: "34", footCm: "21.5" }, { size: "35", footCm: "22.0" },
      { size: "36", footCm: "22.5" }, { size: "37", footCm: "23.0" },
      { size: "38", footCm: "23.5" }, { size: "39", footCm: "24.0" },
      { size: "40", footCm: "24.5" },
    ]},
  ],
};

/**
 * Resolve the size guide entries for a given category_slug.
 * Falls back to "zapatos" if category not found.
 */
export function getSizeGuideForCategory(categorySlug: string): SizeGuideCategory[] {
  return SIZE_GUIDE[categorySlug] ?? SIZE_GUIDE["zapatos"] ?? [];
}
```

#### 3.1.2 SizeGuideModal — `src/components/store/SizeGuideModal.tsx` (NEW)

Accessible modal with focus trap, Escape key, and ARIA dialog semantics.

```
Props: { open: boolean; onClose: () => void; categorySlug: string }
```

- Uses `<dialog>` element or a div with `role="dialog"`, `aria-modal="true"`, `aria-label="Guía de talles"`.
- Focus trap: on open, focus first focusable element; Tab cycles within modal; Escape closes.
- On close, return focus to the trigger button.
- Table layout: columns "Talle" | "Pie (cm)" per gender tab.
- Styling: `bg-white`, `border border-[var(--color-border)]`, `rounded-none`, max-w-md, overlay `bg-black/50`.
- Responsive: full-width sheet on mobile (<768px), centered modal on desktop.
- Respects `prefers-reduced-motion`: no transition animations.

#### 3.1.3 Related Products — `convex/products.ts` (MODIFY) + `src/components/store/RelatedProducts.tsx` (NEW)

**Convex query** — `getRelatedProducts`:

```typescript
// convex/products.ts — new query
export const getRelatedProducts = query({
  args: {
    categorySlug: v.string(),
    gender: v.optional(v.string()),
    excludeSlug: v.string(),
    limit: v.optional(v.number()), // default 4, max 8
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 4, 8);

    // Primary: same category, different product
    let results = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category_slug", args.categorySlug))
      .filter((q) => q.and(
        q.eq(q.field("is_active"), true),
        q.neq(q.field("slug"), args.excludeSlug)
      ))
      .take(limit);

    // Fallback: if < 2 results, supplement with same gender from other categories
    if (results.length < 2 && args.gender) {
      const allByGender = await ctx.db
        .query("products")
        .filter((q) => q.and(
          q.eq(q.field("is_active"), true),
          q.eq(q.field("gender"), args.gender),
          q.neq(q.field("slug"), args.excludeSlug)
        ))
        .take(limit);
      
      const existingSlugs = new Set(results.map(r => r.slug));
      for (const p of allByGender) {
        if (!existingSlugs.has(p.slug)) {
          results.push(p);
          if (results.length >= limit) break;
        }
      }
    }

    return results.map((p) => ({ ...p, id: p._id }));
  },
});
```

**Component** — `src/components/store/RelatedProducts.tsx`:

```
Props: { categorySlug: string; gender?: string; currentSlug: string }
```

- Uses `useQuery(api.products.getRelatedProducts, { ... })`.
- Renders a horizontal section: "También te puede interesar" + grid of up to 4 canonical `ProductCard` items.
- Responsive: `grid-cols-2` mobile, `grid-cols-4` desktop.
- Each card uses the canonical `ProductCard` component (after refactor, §3.4.3).

#### 3.1.4 Single-Product WhatsApp CTA — `src/lib/whatsapp.ts` (MODIFY) + `src/components/store/WhatsAppOrderCTA.tsx` (NEW)

**New helper** in `src/lib/whatsapp.ts`:

```typescript
export function buildSingleProductMessage(params: {
  name: string;
  size: string;
  color?: string;
  price: number;
}): string {
  const { name, size, color, price } = params;
  const colorPart = color ? `, color ${color}` : "";
  const text = `Hola FLORES 💕 Quiero el modelo *${name}* — talle ${size}${colorPart}. Precio: Bs ${price}. ¿Tienen stock?`;
  return encodeURIComponent(text);
}
```

**Component** — `src/components/store/WhatsAppOrderCTA.tsx`:

```
Props: { productName: string; size: string; color?: string; price: number }
```

- Reads CMS WhatsApp number via `useCMSStore` (already fetched at app level).
- Builds `https://wa.me/{number}?text={encodedMessage}` using `getWhatsAppNumber(sections.whatsapp_number)` + `buildSingleProductMessage`.
- Renders as a button with WhatsApp icon, `bg-[#25D366]` (WhatsApp brand green — the ONE exception to the crimson-only rule since it's a third-party brand signal), `text-white`, `rounded-none`, uppercase label.
- Opens in new tab with `rel="noopener noreferrer"`.
- Disabled when no size selected (with accessible `aria-disabled` + tooltip text).

#### 3.1.5 PDP Integration — `src/app/(store)/productos/[slug]/ProductPageClient.tsx` (MODIFY)

Changes to existing PDP:

1. **Replace "Guía de talles" WhatsApp link** → button that opens `SizeGuideModal`.
2. **Add low-stock indicator** on each size button: "Quedan N" when variant stock ≤ 3 and > 0.
3. **Add `RelatedProducts`** section below the main content (after shipping/guarantee grid).
4. **Add `WhatsAppOrderCTA`** below the "Agregar al carrito" button (secondary CTA).
5. **Add `FavoritesButton`** (heart toggle) next to the product title.
6. **Fix alt text** on thumbnail images: use `${product.name} — imagen ${idx + 1}` instead of `${product.name} ${idx}`.

---

### 3.2 Truthful Selling Signals

#### 3.2.1 `is_new` — No Change Required

The proposal confirms: `is_new` remains an admin-controlled boolean. No derivation from `_creationTime`. The seed batch sets `is_new: true` for new products. Existing badge logic in `ProductCard` and PDP is correct.

#### 3.2.2 Liquidation — `sale_ends_at` in `cms_sections`

**Data:** Add a new key `sale_ends_at` to `cms_sections` via seed. The value is an ISO date string (e.g. `"2025-03-31"`) or empty string (absent = no liquidation messaging).

**Seed addition** in `convex/seed.ts`:

```typescript
// Inside the cms_sections seed block, add:
{ key: "sale_ends_at", title: "Fecha fin liquidación", content: "" }
```

**No schema change** — `cms_sections` already has `key: v.string(), title: v.string(), content: v.string()`.

**Reading the setting** — reuse existing `useCMSStore().fetchCMS()` pattern. The `sections` map will contain `sale_ends_at`.

**Component** — `src/components/store/LowStockNote.tsx` (NEW, name reused for low-stock display on PDP):

Actually, let me separate concerns:

- `src/components/store/LowStockNote.tsx` — PDP variant-level low-stock message.
- `src/components/store/LiquidationBadge.tsx` — product card / PDP liquidation badge.

**`LowStockNote.tsx`**:

```
Props: { stock: number; size: string }
```

- Renders only when `stock > 0 && stock <= 3`.
- Copy: `Quedan {stock} en talle {size}`.
- Styling: `text-[var(--color-accent)]`, `text-label`, `font-bold`.
- Uses `role="status"` for screen readers.

**`LiquidationBadge.tsx`**:

```
Props: { isEligible: boolean; saleEndsAt: string | null }
```

- `isEligible` = product has `tags` including `"liquidacion"` OR `compare_price > base_price`.
- Renders only when `isEligible === true` AND `saleEndsAt` is a valid future date.
- Copy: `Liquidación real — hasta {formattedDate}`.
- Date format: `DD/MM/YYYY` (ES-BO).
- Styling: `bg-[var(--color-accent)] text-white`, `text-label`, `font-black`, `uppercase`, `tracking-widest`, `rounded-none`, `px-2.5 py-1.5`.
- If `saleEndsAt` is absent, empty, or past → renders nothing.
- **No countdown timer. Ever.**

#### 3.2.3 Enhanced `StockBadge` — `src/components/store/StockBadge.tsx` (MODIFY)

Current implementation is binary. Extend to show low-stock state:

```typescript
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
```

#### 3.2.4 Admin Configuration — `src/app/admin/configuracion/page.tsx` (MODIFY)

Build a minimal edit form for the `sale_ends_at` setting:

- Single date input (`<input type="date">`) bound to the current `sale_ends_at` value.
- "Guardar" button calls `adminApi.updateSection("sale_ends_at", { title: "Fecha fin liquidación", content: value })`.
- "Limpiar fecha" button sets content to `""` (disables all liquidation messaging).
- Shows current value formatted as ES-BO date or "Sin fecha configurada".
- Uses existing admin auth pattern (`useAdminAuth` token).

---

### 3.3 Favorites

#### 3.3.1 Store — `src/lib/favorites.ts` (NEW)

New Zustand store following the cart-store pattern:

```typescript
// src/lib/favorites.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  count: () => number;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const { slugs } = get();
        if (slugs.includes(slug)) {
          set({ slugs: slugs.filter((s) => s !== slug) });
        } else {
          set({ slugs: [...slugs, slug] });
        }
      },
      has: (slug) => get().slugs.includes(slug),
      count: () => get().slugs.length,
      clear: () => set({ slugs: [] }),
    }),
    { name: "flores-favorites" }
  )
);
```

**Key decisions:**
- Stores only slugs (not snapshots) → always hydrates live data.
- localStorage key: `flores-favorites`.
- No login required.

#### 3.3.2 FavoritesButton — `src/components/store/FavoritesButton.tsx` (NEW)

```
Props: { slug: string; className?: string }
```

- Heart icon toggle (lucide `Heart` / `HeartFilled`).
- `aria-label="Agregar a favoritos"` / `aria-label="Quitar de favoritos"` (dynamic).
- `aria-pressed={isFavorite}`.
- On click: `useFavoritesStore().toggle(slug)`.
- Styling: `text-white` on dark cards, `text-[var(--color-text)]` on light cards; when active: `text-[var(--color-accent)]` with filled heart.
- Positioned absolute top-right on cards; inline on PDP.
- `rounded-none`, sharp border when focused.

#### 3.3.3 Favorites Page — `src/app/(store)/favoritos/page.tsx` (NEW) + `src/app/(store)/favoritos/FavoritesClient.tsx` (NEW)

**`page.tsx`** (server component):

```typescript
export const metadata: Metadata = {
  title: "Mis favoritos | Flores",
  robots: { index: false, follow: false },
};
```

**`FavoritesClient.tsx`** (client component):

- Reads `slugs` from `useFavoritesStore`.
- Fetches live products by slug: uses a new Convex query `getProductsBySlugs` or iterates `getProduct` per slug (acceptable for ≤50 favorites).
- Better approach: add a `getProductsBySlugs` query to `convex/products.ts`:

```typescript
export const getProductsBySlugs = query({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    if (args.slugs.length === 0) return [];
    const results = [];
    for (const slug of args.slugs) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (product && product.is_active) {
        results.push({ ...product, id: product._id });
      }
    }
    return results;
  },
});
```

- **Empty state:** "No tienes favoritos aún" + link to `/productos` catalog.
- **Unavailable products:** gracefully omitted (deleted/deactivated products simply don't appear).
- **All unavailable:** shows empty state with catalog link.
- Grid layout: `grid-cols-2` mobile, `grid-cols-4` desktop (same as catalog).
- Uses canonical `ProductCard` for each item.
- Live prices: always shows current `base_price` / variant price from Convex.

---

### 3.4 Navigation

#### 3.4.1 MegaMenu — `src/components/store/MegaMenu.tsx` (NEW)

Desktop hover-activated category dropdown:

```
Props: { categories: Category[] }
```

- Triggered by "Categorías" link in navbar (desktop).
- On hover: shows a dropdown panel with all active Convex categories.
- Each category links to `/productos?category={slug}`.
- Panel: `bg-white`, `border border-[var(--color-border)]`, `rounded-none`, shadow `--shadow-lg`.
- Keyboard accessible: `aria-expanded` on trigger, `role="menu"` on panel, `role="menuitem"` on items.
- Escape closes the menu.
- Mouse-leave with 200ms delay before closing (prevents accidental close).

#### 3.4.2 Navbar Refactor — `src/components/store/Navbar.tsx` (MODIFY)

Changes:

1. **Replace flat NAV** with dynamic categories from Convex + quick links.
2. **Rename "Ofertas" → "Liquidación"** (href stays `/productos?sale=true`).
3. **Desktop:** "Categorías" triggers `MegaMenu`; "Novedades" and "Liquidación" are direct links.
4. **Mobile:** Accordion pattern — "Categorías" expands to show all categories as a nested list.
5. **Categories data:** Use `useQuery(api.categories.getCategories)` (already available).
6. **Keep existing:** logo, cart button, mobile menu toggle.

New NAV structure:

```typescript
const QUICK_LINKS = [
  { name: "Novedades", href: "/productos?is_new=true" },
  { name: "Liquidación", href: "/productos?sale=true" },
  { name: "Exclusivos", href: "/productos?collection=exclusive" },
];
```

Mobile accordion:

```
[≡] Menu
├── Categorías  [▸]
│   ├── Botas
│   ├── Zapatos
│   ├── Zapatillas
│   ├── Zapatillas Deportivas
│   └── Tacos
├── Novedades
├── Liquidación
├── Exclusivos
└── Favoritos ♥  (NEW — links to /favoritos)
```

#### 3.4.3 Canonical ProductCard — `src/components/store/ProductCard.tsx` (MODIFY)

**Problem:** Two card implementations exist — dark `ProductCard` (home) and light inline card in `ProductsClient`. They must converge.

**Solution:** Extend `ProductCard` with presentation props:

```typescript
export type ProductCardVariant = "dark" | "light";

export type ProductCardData = {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;  // compare_price
  stock: number;           // total or selected variant
  img: string;
  isNew: boolean;
  isLiquidation: boolean;  // new: eligible for liquidation badge
  videoUrl?: string;
  gender?: string;
  categorySlug?: string;
  // Low-stock info for badge
  lowStockCount?: number;  // 0 = not low, >0 = show "Quedan N"
  lowStockSize?: string;
};

export default function ProductCard({
  product,
  variant = "dark",
}: {
  product: ProductCardData;
  variant?: ProductCardVariant;
})
```

**Additions to both variants:**
- `FavoritesButton` (heart toggle, top-right corner).
- `StockBadge` with low-stock state (pass `stock` + `lowStockSize`).
- `LiquidationBadge` when `isLiquidation && saleEndsAt` is future.
- `NUEVO` badge when `isNew` (already exists for dark, add for light).

**`ProductsClient.tsx`** (MODIFY): Replace inline card JSX with `<ProductCard product={mappedData} variant="light" />`.

#### 3.4.4 Footer Rename — `src/components/store/Footer.tsx` (MODIFY)

Change "Ofertas" → "Liquidación" in the catalog links section.

#### 3.4.5 ProductsClient Title — `src/app/(store)/productos/ProductsClient.tsx` (MODIFY)

Change `isSale ? "Ofertas"` → `isSale ? "Liquidación"`.

---

### 3.5 Seed +10 Products

#### 3.5.1 Data Sketch — `convex/seed.ts` (MODIFY)

Add a third batch (`extendedCatalog2` or append to existing pattern) with 10 products:

| # | Name | Slug | Category | Gender | Price | Compare | Tags | Variants |
|---|---|---|---|---|---|---|---|---|
| 21 | Bota Alta Cognac | `bota-alta-cognac` | botas | mujer | 480 | 650 | `["cuero", "tendencia"]` | v59–v62 (35–38, stock 2–5) |
| 22 | Zapato Oxford Negro | `zapato-oxford-negro` | zapatos | hombre | 420 | — | `["clasico", "formal"]` | v63–v66 (40–43, stock 3–6) |
| 23 | Sneaker Urbano Blanco | `sneaker-urbano-blanco` | zapatillas | unisex | 310 | 420 | `["urbano", "blanco"]` | v67–v70 (36–39, stock 1–4) |
| 24 | Runner Pro Azul | `runner-pro-azul` | zapatillas-deportivas | hombre | 390 | — | `["running", "azul"]` | v71–v74 (40–43, stock 4–8) |
| 25 | Taco Fiesta Rojo | `taco-fiesta-rojo` | tacos | mujer | 360 | 520 | `["fiesta", "rojo"]` | v75–v78 (35–38, stock 2–3) |
| 26 | Botin Vaquero Marrón | `botin-vaquero-marron` | botas | mujer | 520 | — | `["vaquero", "marron"]` | v79–v82 (36–39, stock 3–5) |
| 27 | Mocasín Beige | `mocsin-beige` | zapatos | hombre | 290 | 380 | `["casual", "beige"]` | v83–v86 (40–43, stock 5–7) |
| 28 | Zapatilla Canvas Rosa | `zapatilla-canvas-rosa` | zapatillas | mujer | 180 | — | `["canvas", "rosa"]` | v87–v90 (34–37, stock 6–10) |
| 29 | Trail Runner Verde | `trail-runner-verde` | zapatillas-deportivas | hombre | 450 | 580 | `["trail", "verde"]` | v91–v94 (40–43, stock 2–4) |
| 30 | Sandalia Plataforma | `sandalia-plataforma` | tacos | mujer | 320 | — | `["verano", "plataforma"]` | v95–v98 (35–38, stock 4–6) |

**Constraints:**
- All `is_new: true`.
- All `is_active: true`.
- `sort_order`: 21–30.
- Variant IDs: `v59` through `v98` (no collision with existing v1–v58).
- Prices: Bs 180–620 range (all within spec).
- Images: Unsplash URLs verified HTTP 200 (orchestrator responsibility; use distinct photo-ids from existing pool).
- Idempotent: check `existingSlugs` before insert (same pattern as existing batches).

---

## 4. File Change Summary

### New Files

| Path | Purpose |
|---|---|
| `src/lib/sizeGuide.ts` | Static ES-BO size guide map |
| `src/lib/favorites.ts` | Zustand favorites store (persist, slugs only) |
| `src/components/store/SizeGuideModal.tsx` | Accessible modal for size guide |
| `src/components/store/RelatedProducts.tsx` | Related products section (Convex query) |
| `src/components/store/WhatsAppOrderCTA.tsx` | Single-product WhatsApp inquiry button |
| `src/components/store/FavoritesButton.tsx` | Heart toggle (cards + PDP) |
| `src/components/store/LowStockNote.tsx` | PDP low-stock variant message |
| `src/components/store/LiquidationBadge.tsx` | Conditional liquidation badge |
| `src/components/store/MegaMenu.tsx` | Desktop hover category dropdown |
| `src/app/(store)/favoritos/page.tsx` | Favorites page (server, noindex metadata) |
| `src/app/(store)/favoritos/FavoritesClient.tsx` | Favorites grid (client, live hydration) |

### Modified Files

| Path | Change |
|---|---|
| `src/components/store/ProductCard.tsx` | Add `variant` prop, favorites button, liquidation badge, low-stock badge |
| `src/components/store/StockBadge.tsx` | Add low-stock state (≤3 with size label) |
| `src/components/store/Navbar.tsx` | Dynamic categories, mega-menu, mobile accordion, "Ofertas" → "Liquidación" |
| `src/components/store/Footer.tsx` | "Ofertas" → "Liquidación" |
| `src/app/(store)/productos/[slug]/ProductPageClient.tsx` | Size guide modal trigger, related products, WhatsApp CTA, favorites button, low-stock per size, alt text fix |
| `src/app/(store)/productos/ProductsClient.tsx` | Use canonical `ProductCard` instead of inline JSX, "Ofertas" → "Liquidación" title |
| `src/app/admin/configuracion/page.tsx` | Minimal `sale_ends_at` date editor |
| `src/lib/whatsapp.ts` | Add `buildSingleProductMessage` helper |
| `src/lib/api.ts` | Add `getRelatedProducts` and `getProductsBySlugs` to `publicApi` |
| `convex/products.ts` | Add `getRelatedProducts` and `getProductsBySlugs` queries |
| `convex/seed.ts` | Add `sale_ends_at` CMS key + 10 new products (v59–v98) |

### Unchanged Files

| Path | Reason |
|---|---|
| `convex/schema.ts` | No new tables; `cms_sections` already supports key/value |
| `next.config.ts` | No new image domains |
| `src/app/globals.css` | All needed tokens already defined |

---

## 5. Data Flow Diagrams

### 5.1 PDP Load + Interactions

```
User navigates to /productos/{slug}
  → page.tsx (server): fetchQuery(getProduct) for metadata
  → ProductPageClient (client): useQuery(getProduct, {slug})
  → useCMSStore.fetchCMS() at app level (sections include sale_ends_at)
  
  User clicks size button:
    → setSelectedSize(size)
    → Auto-select first color for that size
    → Compute currentVariant.stock
    → If stock ≤ 3: show LowStockNote "Quedan N en talle X"
  
  User clicks "Guía de talles":
    → open SizeGuideModal (focus trap, aria-dialog)
    → Table shows sizes for product.category_slug
  
  User clicks heart icon:
    → useFavoritesStore.toggle(slug)
    → Persisted to localStorage "flores-favorites"
  
  User clicks "Consultar por WhatsApp":
    → buildSingleProductMessage({name, size, color, price})
    → getWhatsAppNumber(sections.whatsapp_number)
    → window.open(wa.me/{number}?text={encoded})
  
  RelatedProducts section:
    → useQuery(getRelatedProducts, {categorySlug, gender, excludeSlug})
    → Renders 4 ProductCard items (canonical, variant="dark")
```

### 5.2 Favorites Hydration

```
User navigates to /favoritos
  → page.tsx: metadata with robots: { index: false, follow: false }
  → FavoritesClient:
    → useFavoritesStore → slugs: ["bota-chelsea-noir", "taco-aguja-vino", ...]
    → useQuery(getProductsBySlugs, { slugs })
    → Convex resolves each slug → live product data
    → Deleted/inactive products: omitted from results
    → Grid of canonical ProductCard (variant="light")
    → Empty state if no slugs or all unavailable
```

### 5.3 Liquidation Signal Flow

```
cms_sections: { key: "sale_ends_at", content: "2025-03-31" }
  → useCMSStore fetches all sections → sections.sale_ends_at = "2025-03-31"
  
  ProductCard receives: isLiquidation = product has tag "liquidacion" OR compare_price > base_price
  
  LiquidationBadge:
    IF isEligible AND saleEndsAt is valid AND new Date(saleEndsAt) > now:
      → Render "Liquidación real — hasta 31/03/2025"
    ELSE:
      → Render nothing (no fallback, no countdown, no invented date)
```

---

## 6. Responsive Behavior (Mobile-First, 390px baseline)

### Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | 390px (base) | Single column, stacked sections |
| SM | 640px | 2-column grids |
| MD | 768px | Size guide modal (not sheet), 2-col cards |
| LG | 1024px | PDP side-by-side (gallery 3/5 + details 2/5), 3-col cards |
| XL | 1400px | Container max-width, 4-col cards |

### Component Responsive Rules

| Component | 390px | 768px | 1024px+ |
|---|---|---|---|
| PDP Gallery | Single column, full-width | 2-col thumbnail grid | 2-col grid |
| PDP Details | Below gallery, sticky disabled | Below gallery, sticky disabled | Sticky sidebar `top-40` |
| Size buttons | `grid-cols-4` | `grid-cols-6` | `grid-cols-6` |
| SizeGuideModal | Full-screen sheet, slide from bottom | Centered modal, max-w-md | Centered modal, max-w-lg |
| RelatedProducts | `grid-cols-2` | `grid-cols-2` | `grid-cols-4` |
| ProductCard | Full-width in single-col list | 2-col grid | 3–4 col grid |
| MegaMenu | Not shown (mobile accordion) | Not shown | Hover dropdown |
| Navbar mobile | Fullscreen overlay, accordion categories | Same | Desktop horizontal nav |
| Favorites page | `grid-cols-2` | `grid-cols-2` | `grid-cols-4` |
| WhatsAppOrderCTA | Full-width button, below cart CTA | Same | Same row as cart CTA |
| LiquidationBadge | Below NUEVO badge, stacked | Same row as other badges | Same row |

### Touch Targets

All interactive elements meet WCAG 2.2 AA minimum 24×24px (44×44px recommended):
- Size buttons: `h-14` (56px) — already compliant.
- Favorite heart: minimum 44×44px tap area.
- WhatsApp CTA: `h-14` (56px) full-width.

---

## 7. Accessibility (WCAG 2.2 AA)

### SizeGuideModal

| Requirement | Implementation |
|---|---|
| Dialog semantics | `role="dialog"`, `aria-modal="true"`, `aria-label="Guía de talles — {category}"` |
| Focus trap | Tab/Shift+Tab cycles within modal; Escape closes |
| Focus restore | On close, return focus to trigger button |
| Initial focus | First focusable element (close button or first tab) |
| Screen reader | Announce modal title on open |

### MegaMenu

| Requirement | Implementation |
|---|---|
| Trigger | `aria-expanded="true/false"`, `aria-haspopup="menu"` |
| Panel | `role="menu"`, `aria-label="Categorías"` |
| Items | `role="menuitem"`, keyboard arrow navigation |
| Escape | Closes menu, returns focus to trigger |
| Hover intent | 200ms delay before close (prevents accidental) |

### FavoritesButton

| Requirement | Implementation |
|---|---|
| Toggle semantics | `aria-pressed="true/false"` |
| Dynamic label | `aria-label="Agregar a favoritos"` / `"Quitar de favoritos"` |
| Keyboard | Operable with Enter/Space (native button) |
| Focus visible | `:focus-visible` ring (inherited from globals.css) |

### LowStockNote

| Requirement | Implementation |
|---|---|
| Live region | `role="status"`, `aria-live="polite"` — announces when stock changes |
| Color not sole indicator | Text label "Quedan N en talle X" (not color-only) |

### LiquidationBadge

| Requirement | Implementation |
|---|---|
| Contrast | White on `#9B1C1C` = 12.4:1 (passes AAA) |
| No animation | Static badge, no pulse/blink |

### General

- All images have meaningful `alt` text (product name + context).
- All links have discernible text.
- Form inputs have associated labels.
- `prefers-reduced-motion` disables all transitions/animations.
- Skip link already in globals.css.
- Heading hierarchy: single `h1` per page (product name on PDP, page title on catalog/favorites).

---

## 8. Honesty Invariants (Non-Negotiable)

These are enforced by code logic, not just convention:

1. **`is_new` is admin-set only.** Never derived from `_creationTime`. Seed explicitly sets it.
2. **Liquidation badge requires TWO conditions:** product eligibility (tag or compare_price) AND future `sale_ends_at`. Both must be true. No fallback date. No countdown.
3. **Low stock uses real variant data.** `stock` field from Convex variants. Threshold ≤3. Never fabricated.
4. **Favorites show live prices.** Hydrate by slug from Convex, never cache snapshots.
5. **WhatsApp CTA uses selected variant price.** `currentVariant.price || base_price`. Never synthetic.
6. **No fake urgency.** No countdown timers, no "X people viewing", no "selling fast" without data.
7. **No yellow.** `#FFD700`, `#FFB300`, `#FFC107` are banned. Grep-checked in verify phase.
8. **WhatsApp number from CMS.** Always `getWhatsAppNumber(sections.whatsapp_number)`, never hardcoded in new code paths.

---

## 9. Task Slices (for decomposition phase)

Three slices ordered by dependency. Each slice is independently testable and reviewable within the 400-line budget.

### Slice 1: Foundation (Data + Store + Shared Components)

**Scope:** Convex queries, favorites store, size guide data, WhatsApp helper, StockBadge enhancement, LiquidationBadge, LowStockNote, seed +10, `sale_ends_at` seed key.

**Files:**
- `convex/products.ts` — add `getRelatedProducts`, `getProductsBySlugs`
- `convex/seed.ts` — add `sale_ends_at` key + 10 products
- `src/lib/favorites.ts` — new favorites store
- `src/lib/sizeGuide.ts` — static size guide map
- `src/lib/whatsapp.ts` — add `buildSingleProductMessage`
- `src/lib/api.ts` — add new publicApi methods
- `src/components/store/StockBadge.tsx` — low-stock state
- `src/components/store/LiquidationBadge.tsx` — new
- `src/components/store/LowStockNote.tsx` — new
- `src/components/store/FavoritesButton.tsx` — new

**Done when:** Convex queries return correct data, favorites persist across reload, size guide resolves by category, liquidation badge invisible without future date, low-stock shows at ≤3.

### Slice 2: Navigation + Card Convergence

**Scope:** MegaMenu, Navbar refactor, canonical ProductCard, ProductsClient migration, Footer/ProductsClient rename.

**Files:**
- `src/components/store/MegaMenu.tsx` — new
- `src/components/store/Navbar.tsx` — dynamic categories, mega-menu, mobile accordion
- `src/components/store/ProductCard.tsx` — variant prop, favorites, liquidation badge, low-stock
- `src/components/store/Footer.tsx` — "Ofertas" → "Liquidación"
- `src/app/(store)/productos/ProductsClient.tsx` — use canonical ProductCard, rename title

**Done when:** Desktop shows category mega-menu on hover, mobile shows accordion, all cards across home/catalog show favorites heart + correct badges, "Ofertas" absent from all navigation copy, both card surfaces use same component.

### Slice 3: PDP + Favorites Page + Admin

**Scope:** PDP integration (size guide modal, related products, WhatsApp CTA, favorites button, low-stock per size), `/favoritos` page, admin configuracion editor.

**Files:**
- `src/components/store/SizeGuideModal.tsx` — new
- `src/components/store/RelatedProducts.tsx` — new
- `src/components/store/WhatsAppOrderCTA.tsx` — new
- `src/app/(store)/productos/[slug]/ProductPageClient.tsx` — full PDP upgrade
- `src/app/(store)/favoritos/page.tsx` — new (server metadata)
- `src/app/(store)/favoritos/FavoritesClient.tsx` — new (live hydration grid)
- `src/app/admin/configuracion/page.tsx` — sale_ends_at editor

**Done when:** Customer can open PDP, view size guide modal, see related products, send WhatsApp inquiry with correct product/size/price, toggle favorites, visit `/favoritos` with live data, admin can set/clear liquidation date.

---

## 10. Test / QA Plan

### Playwright Checklist (390px + 1440px viewports)

#### PDP
- [ ] Size guide modal opens on click, closes on Escape, focus trapped and restored.
- [ ] Size guide shows correct sizes for product's category (verify "botas" vs "zapatillas-deportivas").
- [ ] Related products section shows ≤4 items, excludes current product, links work.
- [ ] WhatsApp CTA disabled when no size selected; enabled with correct message when size chosen.
- [ ] WhatsApp message contains: product name, size, color (if selected), price (variant price).
- [ ] Low-stock note shows "Quedan N en talle X" for variants with stock 1–3.
- [ ] "Agotado" state for zero-stock variants.
- [ ] Favorites heart toggles, persists across page reload.
- [ ] Liquidation badge visible ONLY for eligible products when `sale_ends_at` is future.
- [ ] Liquidation badge invisible when `sale_ends_at` is empty or past.
- [ ] No yellow (#FFD700/#FFB300/#FFC107) anywhere on page.
- [ ] All radius values are 0 (sharp corners).
- [ ] Images have meaningful alt text.

#### Navigation
- [ ] Desktop: "Categorías" hover shows mega-menu with all 5 categories.
- [ ] Desktop: "Novedades" and "Liquidación" links present and correct.
- [ ] Desktop: "Ofertas" text absent from all nav elements.
- [ ] Mobile (390px): Accordion expands to show categories.
- [ ] Mobile: All links navigable, menu closes on link click.
- [ ] Keyboard: Tab through nav items, Enter activates, Escape closes menus.

#### Cards
- [ ] Home cards (dark variant) show: image, name, price, NUEVO badge, favorites heart, stock badge.
- [ ] Catalog cards (light variant) show same information.
- [ ] Favorites heart toggles on both card variants.
- [ ] Low-stock badge shows on cards when total stock ≤3.
- [ ] Liquidation badge shows on eligible cards when date is future.

#### Favorites Page
- [ ] `/favoritos` has `noindex, nofollow` in meta robots.
- [ ] Shows live product data (prices match current Convex data).
- [ ] Empty state with catalog link when no favorites.
- [ ] Deleted products gracefully omitted.
- [ ] Responsive grid: 2-col mobile, 4-col desktop.

#### Admin
- [ ] Configuración page shows current `sale_ends_at` value or "Sin fecha".
- [ ] Date picker sets new value, saves successfully.
- [ ] "Limpiar fecha" clears value → all liquidation badges disappear.

#### Honesty Greps (automated)
- [ ] `grep -r '#FFD700\|#FFB300\|#FFC107' src/` → 0 results.
- [ ] `grep -r 'Ofertas' src/components/store/ src/app/` → 0 results (only "Liquidación").
- [ ] `grep -r 'countdown\|timer\|urgencia' src/components/` → only legitimate references.
- [ ] No hardcoded WhatsApp numbers in new components (all use `getWhatsAppNumber`).

#### Accessibility (manual + automated)
- [ ] Tab through PDP: logical focus order (gallery → name → price → sizes → colors → cart → WhatsApp → related).
- [ ] Screen reader: SizeGuideModal announces as dialog with title.
- [ ] Screen reader: FavoritesButton announces "Agregar a favoritos" / "Quitar de favoritos".
- [ ] `prefers-reduced-motion`: no animations play.
- [ ] Color contrast: all text passes AA (4.5:1 normal, 3:1 large).
- [ ] Touch targets ≥ 44×44px on mobile.

---

## 11. Rollback Strategy

- Revert all changed/new files.
- Clear `sale_ends_at` from `cms_sections` (or set to empty) → liquidation UI becomes inert.
- Favorites are client-local (localStorage) → no server data to migrate.
- Seed additions are idempotent → re-running seed after revert won't re-add if slugs are removed.
- No destructive customer data operations required.

---

## 12. Dependencies & Risks

| Risk | Mitigation |
|---|---|
| Unsplash URLs 404 | Orchestrator verifies HTTP 200 before design approval; visual quality is user review |
| Convex query performance (getRelatedProducts) | Uses `withIndex("by_category")` + `.take()` — bounded, no full scan |
| Favorites store grows unbounded | Cap at 100 slugs (implement in toggle: drop oldest if >100) |
| Two card implementations diverge again | Single canonical ProductCard with variant prop; code review checklist |
| `sale_ends_at` format inconsistency | Validate ISO date format in admin form; parse with `new Date()` and check `isNaN` |
| Seed variant ID collision | Reserve v59–v98; document in seed comments; check existing IDs before merge |
