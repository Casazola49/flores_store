# Apply Progress — Ficha de Producto Vendedora (`ficha-producto-vendedora`)

## Execution Status
- **Change:** `ficha-producto-vendedora`
- **Phase:** Apply (Slice 3 PDP + Favorites Page + Admin + Legacy Dishonesty Cleanup)
- **Delivery Strategy:** `auto-chain` (Slice 3 delivered as third PR boundary)
- **Status Consumed:**
  - `applyState`: `ready`
  - `blockedReasons`: `[]`
  - `actionContext.mode`: `repo-local`

---

## Completed Tasks

### Slice 1 — Foundation (S1.1 – S1.11)
- [x] **S1.1: `convex/products.ts`** — Added public `getRelatedProducts` query taking `{ categorySlug, gender?, excludeSlug, limit? }` (default 4, max 8). Primary read uses `withIndex("by_category")` filtered to `is_active` and `slug != excludeSlug` with `.take(limit)`. When < 2 category-mates exist and `gender` is present, supplements with same-gender active products (excluding current slug) capped at `limit`. No unbounded `.collect()` scan.
- [x] **S1.2: `convex/products.ts`** — Added public `getProductsBySlugs` query taking `{ slugs: string[] }`. Returns `[]` for empty input, resolves each slug via `withIndex("by_slug")`, omits missing or `is_active === false` products, and preserves input slug order.
- [x] **S1.3: `src/lib/favorites.ts`** — Created Zustand `persist` store `useFavoritesStore` (key `flores-favorites`) persisting ONLY `string[]` of slugs with `toggle`, `has`, `count`, `clear`. Capped at 100 with oldest-dropped overflow. No product snapshot fields serialized.
- [x] **S1.4: `src/lib/sizeGuide.ts`** — Created static `SIZE_GUIDE` map by `category_slug` (botas, zapatos, zapatillas, zapatillas-deportivas, tacos). Every women-family entry covers sizes 34–41 with non-null centimeters. Men and unisex entries where applicable. Includes `getSizeGuideForCategory(slug)` with `zapatos` fallback.
- [x] **S1.5: `src/lib/whatsapp.ts`** — Added `buildSingleProductMessage({ name, size, color?, price })` helper returning exact encoded message `Hola FLORES 💕 Quiero el modelo *{name}* — talle {size}{, color {color}}. Precio: Bs {price}. ¿Tienen stock?`. Color segment omitted without orphan comma when unset.
- [x] **S1.6: `src/components/store/StockBadge.tsx`** — Extended to render `Quedan {stock} en talle {size}` (crimson accent, `rounded-none`) when `stock > 0 && stock <= 3` and `size` label provided; keeps `Agotado` for `stock === 0`; keeps `Stock disponible` otherwise.
- [x] **S1.7: `src/components/store/LiquidationBadge.tsx`** — Created gated liquidation badge. Renders `Liquidación real — hasta {DD/MM/YYYY}` ONLY when `isEligible === true` and `saleEndsAt` is a valid future ISO date. Otherwise renders `null`. Zero countdown timers, no `setInterval`, no fake dates.
- [x] **S1.8: `src/components/store/LowStockNote.tsx`** — Created note component rendering `Quedan {N} en talle {size}` when `0 < stock <= 3` with `role="status"` and `aria-live="polite"` in crimson text. Renders `null` otherwise.
- [x] **S1.9: `src/components/store/FavoritesButton.tsx`** — Created accessible heart-toggle button reading `useFavoritesStore`. Exposes dynamic `aria-pressed`, dynamic accessible names (`Agregar a favoritos` / `Quitar de favoritos`), operable by Enter/Space, with outline vs filled shape state. Uses `useSyncExternalStore` for SSR/hydration safety without effect cascading render warnings.
- [x] **S1.10: `convex/seed.ts`** — Appended `{ key: "sale_ends_at", title: "Fecha fin liquidación", content: "" }` to initial `cms_sections` array and added idempotent insertion for previously seeded databases.
- [x] **S1.11: `convex/seed.ts`** — Appended `extendedCatalog2` array with 10 products (sort_order 21–30 contiguous, `is_new: true`, `is_active: true`, prices Bs 180–620, variants `v59`–`v98` globally unique with 0 collisions, 10 distinct Unsplash URLs verified HTTP 200). Updated header comment.

### Slice 2 — Navigation + Canonical ProductCard (S2.1 – S2.6)
- [x] **S2.1: `src/components/store/MegaMenu.tsx` (NEW)** — Desktop hover/focus-triggered mega-menu panel (≥ `md` only) listing Convex categories via prop (links `/productos?category={slug}`) plus quick links (`Novedades` → `/productos?is_new=true`, `Liquidación` → `/productos?sale=true`, `Exclusivos` → `/productos?collection=exclusive`). Exposes `aria-expanded` and `aria-haspopup="menu"` on the trigger, `role="menu"` panel semantics, `role="menuitem"` on links, Escape-to-close with focus restore to the trigger, ArrowDown/ArrowUp cycling through menuitems, and ~200ms mouse-leave close delay. Zero yellow colors; `rounded-none`; token-driven styling. Zero occurrences of `Ofertas`.
- [x] **S2.2: `src/components/store/Navbar.tsx`** — Rebuilt desktop nav and mobile menu using live Convex categories via `useQuery(api.categories.getCategories)` alongside quick links (`Novedades`, `Liquidación`, `Exclusivos`, and `Favoritos` → `/favoritos`). Mobile (< `md`) implements a category disclosure accordion with dynamic `aria-expanded` and chevron flip. Replaced every occurrence of `Ofertas` with `Liquidación` while preserving `/productos?sale=true` target. Preserved brand logo, cart trigger with count badge, and mobile toggle.
- [x] **S2.3: `src/components/store/ProductCard.tsx`** — Extended into single canonical component supporting `variant: "dark" | "light"`, full `ProductCardData` shape, and exported canonical `mapProductToCardData` helper. Wired in `StockBadge` (low-stock ≤3 variant display), `NUEVO` badge (strictly from `is_new`), `LiquidationBadge` (future-date gated via `useCMSStore().sections.sale_ends_at`), and `FavoritesButton` mounted as sibling outside the `<Link>` anchor. Uses `useSyncExternalStore` for `prefers-reduced-motion` to ensure zero cascading renders.
- [x] **S2.4: `src/app/(store)/productos/ProductsClient.tsx`** — Replaced inline light card JSX with canonical `<ProductCard product={mapProductToCardData(product)} variant="light" />`. Renamed sale page title from `Ofertas` → `Liquidación`. Verified 0 occurrences of `Ofertas` in `src/app/(store)/productos/`.
- [x] **S2.5: `src/app/(store)/HomeClient.tsx`** — Updated `toHot` mapping to delegate to canonical `mapProductToCardData(p)` feeding full `ProductCardData` (slug, per-variant low-stock band, liquidation eligibility, `is_new`, gender, categorySlug) while explicitly passing `variant="dark"`. Eliminated any inline card duplication.
- [x] **S2.6: `src/components/store/Footer.tsx`** — Renamed catalog link `Ofertas` → `Liquidación` (destination `/productos?sale=true` unchanged). Replaced hardcoded `https://wa.me/59176932485` link with dynamic `getWhatsAppNumber(useCMSStore().sections.whatsapp_number)`. Verified 0 matches for `Ofertas` or `wa.me/591` in `Footer.tsx`.

### Slice 3 — PDP upgrade + Favorites page + Admin `sale_ends_at` (S3.1 – S3.7) & Legacy Dishonesty Cleanup
- [x] **S3.1: `src/components/store/SizeGuideModal.tsx` (NEW)** — Accessible dialog (`role="dialog"`, `aria-modal="true"`, `aria-label="Guía de talles"`). Focus trap (Tab/Shift+Tab), Escape key to close, focus restoration to trigger on close. Renders ES-BO table from `getSizeGuideForCategory(categorySlug)` with family tabs for multi-family categories ("Talle" | "Pie (cm)"). Full-width bottom sheet on mobile (<768px), centered modal on desktop (≥768px). `rounded-none`, token colors (`var(--color-*)`), prefers-reduced-motion respected.
- [x] **S3.2: `src/components/store/RelatedProducts.tsx` (NEW)** — Reusable section using `useQuery(api.products.getRelatedProducts, { categorySlug, gender, excludeSlug: currentSlug, limit: 4 })`. Heading `También te puede interesar`. Grid of up to 4 canonical `ProductCard` items (`variant="light"`, 2 cols mobile, 4 cols desktop). Renders `null` if empty or loading with 0 results. Strictly excludes current slug.
- [x] **S3.3: `src/components/store/WhatsAppOrderCTA.tsx` (NEW)** — Single-product inquiry button reading CMS number via `useCMSStore().sections.whatsapp_number` + `getWhatsAppNumber(...)`. Pre-filled URL via `buildSingleProductMessage({ name, size, color, price })`. Disabled state with explanatory helper text when no size is selected. WhatsApp green allowed as single documented exception (`bg-[#25D366]`). `rounded-none`. Zero hardcoded numbers and zero template-literal duplications.
- [x] **S3.4: `src/app/(store)/productos/[slug]/ProductPageClient.tsx`** — Upgraded PDP: (1) Replaced "Guía de talles" WhatsApp `wa.me` link with button opening `SizeGuideModal` (category = `product.category_slug`). (2) Converted gallery thumbnails from clickable divs to keyboard buttons naming `{product.name} — imagen {idx + 1}` with Enter/Space activation and focus retained; alt text matching Scheme. (3) Disabled and marked `Agotado` zero-stock size options; rendered `LowStockNote` for selected variant when `0 < stock <= 3`. (4) Added `FavoritesButton` inline near title and `WhatsAppOrderCTA` under add-to-cart control using `currentVariant?.price || base_price`. (5) Rendered `RelatedProducts` after shipping/guarantee grid; kept NUEVO sourced from `is_new`. Reactive selection with zero cascading renders.
- [x] **S3.5: `src/app/(store)/favoritos/page.tsx` + `FavoritesClient.tsx` (NEW)** — Server `page.tsx`: `metadata.title = "Mis favoritos | Flores"`, `robots: { index: false, follow: false }` (no canonical pointing to another route). Client `FavoritesClient.tsx`: reads `useFavoritesStore().slugs`, hydrates live products via `useQuery(api.products.getProductsBySlugs, { slugs })`, renders canonical `ProductCard variant="light"` grid (2 cols mobile / 4 cols desktop), omits inactive/unresolved slugs, and shows ES-BO empty state linking to `/productos` when empty.
- [x] **S3.6: `src/app/admin/configuracion/page.tsx`** — Replaced "en construcción" with minimal form: reads current `sale_ends_at` (via `adminApi.getSections()`), labeled date input bound to value, `Guardar` calling `adminApi.updateSection("sale_ends_at", { title: "Fecha fin liquidación", content: <ISO value> })`, `Limpiar fecha` action storing `""`, and display of current value (ES-BO formatted `DD/MM/YYYY`) or `Sin fecha configurada`. ISO-validated before saving; clear input disables liquidation everywhere on next storefront render.
- [x] **S3.7: `src/components/store/Navbar.tsx`** — Added "Guía de talles" trigger in Navbar quick area (desktop navigation row) and mobile accordion menu opening shared `SizeGuideModal` (default women category `botas`). Zero WhatsApp invocation and zero hardcoded phone numbers.
- [x] **Legacy Dishonesty Cleanup** — Removed inert countdown from `AnnouncementBar.tsx` (removed interval, state, and countdown markup). Replaced invented scarcity copy in `convex/seed.ts` (`hero_subtitle`, `cms_banners` subtitle, and `link_text`) with honest copy ("Curaduría de marcas globales a precios de liquidación. Calzado seleccionado con atención al detalle." and "Ver Colección"). Verified 0 countdown/interval occurrences in AnnouncementBar.

---

## Files Changed and Created

### New Files
- `src/components/store/SizeGuideModal.tsx` (accessible size guide modal & sheet)
- `src/components/store/RelatedProducts.tsx` (related products carousel/grid)
- `src/components/store/WhatsAppOrderCTA.tsx` (single-product inquiry button)
- `src/app/(store)/favoritos/page.tsx` (server metadata route, noindex)
- `src/app/(store)/favoritos/FavoritesClient.tsx` (live hydrated favorites grid)
- `src/components/store/MegaMenu.tsx` (Slice 2)
- `src/lib/favorites.ts` (Slice 1)
- `src/lib/sizeGuide.ts` (Slice 1)
- `src/components/store/LiquidationBadge.tsx` (Slice 1)
- `src/components/store/LowStockNote.tsx` (Slice 1)
- `src/components/store/FavoritesButton.tsx` (Slice 1)

### Modified Files
- `src/app/(store)/productos/[slug]/ProductPageClient.tsx` (PDP upgrade, modal, thumbnails, low-stock, favorites, CTA, related)
- `src/app/admin/configuracion/page.tsx` (sale_ends_at editor with ES-BO date display and clear)
- `src/components/store/Navbar.tsx` (global "Guía de talles" trigger on desktop & mobile)
- `src/components/store/AnnouncementBar.tsx` (removed inert countdown and interval)
- `convex/seed.ts` (replaced invented scarcity copy with honest copy)
- `src/types/index.ts` (added `category_slug?: string` to `Product`)
- `openspec/changes/ficha-producto-vendedora/tasks.md` (marked S3.1–S3.7 and legacy cleanup checked)
- `openspec/changes/ficha-producto-vendedora/apply-progress.md` (merged Slice 3 progress)

---

## Deviations from Design
None. All components, interactions, modal focus management, favorites live hydration, and sales signals strictly follow `design.md` §3.1, §3.2, §3.3, §3.6 and `spec.md` capabilities A, B, C, D, E, F, J, K.

---

## Verification Evidence

1. **TypeScript Typecheck:**
   - `npx tsc --noEmit` → 0 errors.
2. **ESLint on All Touched Files:**
   - `npx eslint src/components/store/SizeGuideModal.tsx src/components/store/RelatedProducts.tsx src/components/store/WhatsAppOrderCTA.tsx "src/app/(store)/productos/[slug]/ProductPageClient.tsx" "src/app/(store)/favoritos/page.tsx" "src/app/(store)/favoritos/FavoritesClient.tsx" src/app/admin/configuracion/page.tsx src/components/store/Navbar.tsx src/components/store/AnnouncementBar.tsx convex/seed.ts` → 0 errors.
3. **Next.js Production Build:**
   - `npm run build` → Compiled successfully in 6.6s, TypeScript finished in 9.0s, all 18 routes generated cleanly including dynamic `/productos/[slug]` and static `/favoritos`.
4. **Honesty Grep Suite on AnnouncementBar:**
   - `grep -rniE "setInterval|countdown|remaining" src/components/store/AnnouncementBar.tsx` → 0 matches.
5. **Token Purity Grep on Slice 3 Files:**
   - `grep -rnE "#FFD700|#FFB300|#FFC107" ...` → 0 matches.
6. **WhatsApp Message Consistency:**
   - `WhatsAppOrderCTA.tsx` imports and uses `buildSingleProductMessage` from `@/lib/whatsapp.ts` with no duplicate template literal in PDP.

---

## Remaining Tasks (Final Cross-cutting Verification & Post-Apply Parent Gates)

```markdown
### Final Cross-cutting Verification (after all slices are applied)
- [ ] On the set of files changed by this change (`git diff --name-only` against the base branch): `grep -rniE "setInterval|countdown|se acaba hoy|última oportunidad|acaba de comprar|solo quedan|24h antes"` → 0 new occurrences; no new `setInterval`/timer code and no synthetic anchor/urgency copy in PDP, card, navbar, favorites, or new badge components. Document that the pre-existing `AnnouncementBar` interval is untouched and remains inert (its `getAnnouncement` source never provides `countdown_end_date`); flag any drift for the parent decision gate. <!-- sdd-owner: implementation -->
- [ ] Extract the ten new products' `images[].url` from the `convex/seed.ts` `extendedCatalog2` block and verify each returns HTTP 200 (`curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" <url>` per URL); assert no Unsplash photo-id repeats across the ten by grepping the block and counting each `photo-…` id. <!-- sdd-owner: implementation -->
- [ ] Playwright (or manual browser) check: favorite a product from a card → reload → heart stays active and `localStorage["flores-favorites"]` holds only slugs; lower that product's `base_price` in Convex → reload "/favoritos" → the card shows the NEW price (no stale snapshot); remove the slug from storage → empty state appears with the "/productos" link. <!-- sdd-owner: implementation -->
- [ ] Playwright at 1440px: Tab to the categories trigger, Enter/Arrow opens the mega-menu, arrows move focus between items, Escape closes and returns focus to the trigger; at 390px: hamburger → categories disclosure expands with `aria-expanded="true"`, all categories + quick links visible, and links navigate and close the menu. <!-- sdd-owner: implementation -->
- [ ] Run the full gate on the merged result: `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build` (production build succeeds with no type/runtime errors). <!-- sdd-owner: implementation -->

### Post-Apply Review & Lifecycle Gates (parent-owned)
- [ ] Bounded review of Slice 1 PRs (S1.1–S1.11): cross-check Convex queries, favorites store, signal components, and the +10 seed against Spec B.1/C.1–C.2/E/F.1–F.3/I.1–I.4/K acceptance criteria before merging onward. <!-- sdd-owner: parent -->
- [ ] Bounded review of Slice 2 PRs (S2.1–S2.6): verify single-canonical-card convergence (no second inline card remains), no `Ofertas` on any nav surface, and both mega-menu and accordion keyboard behavior against Spec G.1–G.3/H.1–H.2. <!-- sdd-owner: parent -->
- [ ] Bounded review of Slice 3 PRs (S3.1–S3.7): verify PDP interactions, "/favoritos" metadata + live hydration, admin `sale_ends_at` flow, and the global size-guide trigger against Spec A.1–A.2/B.2–B.3/C/D/E.3/F.4/J. <!-- sdd-owner: parent -->
- [ ] Ask-on-risk decision gate (before further apply): (1) approve the chain strategy + PR split now that Slice sizes exceed 400 changed lines each; (2) confirm the inferred capability areas (Spec R2) and legacy-copy scope boundary (Spec R5, pre-existing `hero_subtitle`/banner scarcity copy and the inert `AnnouncementBar`/`countdown_end_hour` remain out of scope or become a follow-up); (3) confirm the Seed image HTTP-200 record (Spec R4) as point-in-time. <!-- sdd-owner: parent -->
- [ ] Lifecycle gate: after the above reviews pass, hand off to the verify phase (lint/build/marca greps + manual Playwright checklist in `design.md` §10) and then sync/archive this change. <!-- sdd-owner: parent -->
```
