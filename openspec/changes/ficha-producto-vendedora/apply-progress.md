# Apply Progress — Ficha de Producto Vendedora (`ficha-producto-vendedora`)

## Execution Status
- **Change:** `ficha-producto-vendedora`
- **Phase:** Apply (Slice 1 Foundation)
- **Delivery Strategy:** `auto-chain` (Slice 1 delivered as first PR boundary)
- **Status Consumed:**
  - `applyState`: `ready`
  - `blockedReasons`: `[]`
  - `actionContext.mode`: `repo-local`

---

## Completed Tasks (Slice 1 Foundation: S1.1 – S1.11)

All 11 implementation tasks for Slice 1 have been completed and marked `- [x]` in `tasks.md`:

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

---

## Files Changed and Created

### New Files
- `src/lib/favorites.ts`
- `src/lib/sizeGuide.ts`
- `src/components/store/LiquidationBadge.tsx`
- `src/components/store/LowStockNote.tsx`
- `src/components/store/FavoritesButton.tsx`
- `openspec/changes/ficha-producto-vendedora/apply-progress.md`

### Modified Files
- `convex/products.ts` (added `getRelatedProducts`, `getProductsBySlugs`)
- `convex/seed.ts` (added `sale_ends_at` CMS section, `extendedCatalog2` +10 products, updated comment and idempotent loop)
- `src/components/store/StockBadge.tsx` (extended with low-stock state)
- `src/lib/whatsapp.ts` (added `buildSingleProductMessage`)
- `src/lib/api.ts` (added `getRelatedProducts` and `getProductsBySlugs` to `publicApi`)
- `openspec/changes/ficha-producto-vendedora/tasks.md` (checked S1.1–S1.11)

---

## Deviations from Design
None. All components, schemas, and helpers strictly implement `design.md` §3.1, §3.2, §3.3, §3.5 and `spec.md` capabilities B, C, D, E, F, I, K.

---

## Verification Evidence

1. **TypeScript Typecheck:**
   - `npx tsc --noEmit` → 0 errors.
2. **ESLint on Changed Files:**
   - `npx eslint src/lib/favorites.ts src/lib/sizeGuide.ts src/lib/whatsapp.ts src/components/store/StockBadge.tsx src/components/store/LiquidationBadge.tsx src/components/store/LowStockNote.tsx src/components/store/FavoritesButton.tsx` → 0 errors, 0 warnings.
3. **Next.js Production Build:**
   - `npm run build` → Compiled successfully in 7.0s, all 17 routes generated cleanly.
4. **Seed Integrity Verifications:**
   - Variant IDs `v1`–`v98` checked: exactly 1 occurrence each, 0 collisions.
   - Sort order 1–30 checked: contiguous from 1 to 30.
   - All 10 new Unsplash image URLs tested via curl: HTTP 200 for all 10 with 10 distinct photo IDs.
5. **Message Helper Verification:**
   - With color: `Hola FLORES 💕 Quiero el modelo *Bota Taco Lira* — talle 38, color Camel. Precio: Bs 520. ¿Tienen stock?`
   - Without color: `Hola FLORES 💕 Quiero el modelo *Bota Taco Lira* — talle 38. Precio: Bs 520. ¿Tienen stock?`

---

## Remaining Tasks (Slice 2, Slice 3, Final, Post-Apply)

```markdown
### Slice 2 — Navigation (MegaMenu/Navbar rename) + Canonical ProductCard
- [ ] Add a hover/focus-triggered mega-menu panel (≥ `md` only) listing every Convex category passed via prop (links "/productos?category={slug}") plus quick links (`Novedades` → "/productos?is_new=true", `Liquidación` → "/productos?sale=true", `Exclusivos`), with `aria-expanded`/`aria-haspopup="menu"` on the trigger, `role="menu"` panel semantics, Escape-to-close with focus restore to the trigger, and a ~200ms mouse-leave close delay. No yellow; `rounded-none`; colors via `var(--color-*)`. <!-- sdd-owner: implementation -->
- [ ] Rewrite `Navbar`: build the desktop nav and mobile menu from `useQuery(api.categories.getCategories)` (live list) + quick links (`Novedades`, `Liquidación`, `Exclusivos`, and a `Favoritos` → "/favoritos" entry); on mobile (< `md`) a categories disclosure accordion with `aria-expanded` listing the same content; replace every `Ofertas` occurrence (labels and any derived aria/alt) with `Liquidación` while keeping the "/productos?sale=true" destination. Preserve logo, cart button, and mobile-menu toggle behavior. <!-- sdd-owner: implementation -->
- [ ] Extend the existing dark `ProductCard` into the single canonical component: add `variant: "dark" | "light"` presentation chrome and an expanded `ProductCardData` shape (slug, total/low stock band info, `isNew`, liquidation eligibility, gender/category passthrough, video URL) so home, catalog, and later "/favoritos" all import this one path. Wire in `StockBadge` (low-stock), the `NUEVO` badge (from `is_new` only), `LiquidationBadge` (future-date gated), and `FavoritesButton` mounted as a sibling of the product `<Link>` (not inside it). No second inline card may carry its own badge/favorite logic. <!-- sdd-owner: implementation -->
- [ ] Replace the inline light card JSX with `<ProductCard product={mappedData} variant="light" />` (mapping the live Convex product incl. variants aggregate for low-stock, tags/compare for liquidation, `is_new`) and rename the sale title `Ofertas` → `Liquidación` (query param handling unchanged). <!-- sdd-owner: implementation -->
- [ ] Update the home `toHot` mapping (and any callers) to feed the full canonical `ProductCardData` (slug, per-variant low-stock band, liquidation eligibility from `tags`/`compare_price`, `is_new`, gender/category) while rendering `variant="dark"` by default. No new inline card here. <!-- sdd-owner: implementation -->
- [ ] In `Footer`, rename the catalog link `Ofertas` → `Liquidación` (destination unchanged) and replace the hardcoded `https://wa.me/59176932485` link with `getWhatsAppNumber(useCMSStore().sections.whatsapp_number)`. No hardcoded number may remain in this touched file. <!-- sdd-owner: implementation -->

### Slice 3 — PDP upgrade + Favorites page + Admin `sale_ends_at`
- [ ] Add `SizeGuideModal({ open, onClose, categorySlug })` rendering a dialog (`role="dialog"`, `aria-modal="true"`, `aria-label="Guía de talles"`) that: on open moves focus into the modal, traps Tab/Shift+Tab, closes on Escape, and restores focus to the trigger on close; renders the ES-BO table from `getSizeGuideForCategory(categorySlug)` ("Talle" | "Pie (cm)" per family label); full-width bottom sheet < 768px, centered modal ≥ 768px; `rounded-none`, token colors, no transitions under `prefers-reduced-motion`. <!-- sdd-owner: implementation -->
- [ ] Add `RelatedProducts({ categorySlug, gender?, currentSlug })` using `useQuery(api.products.getRelatedProducts, …)`, heading `También te puede interesar`, grid of up to four canonical `ProductCard` items (2 cols mobile, 4 cols desktop), never including the current slug. <!-- sdd-owner: implementation -->
- [ ] Add a single-product inquiry button that reads the CMS number via `useCMSStore().sections` + `getWhatsAppNumber(sections.whatsapp_number)` and opens `https://wa.me/{number}?text={buildSingleProductMessage({name,size,color,price})}` in a new tab (`rel="noopener noreferrer"`); label/`aria-disabled` + explanatory state when no size is selected; WhatsApp-brand green allowed as the single documented exception; `rounded-none`. Must NOT hardcode a number and MUST NOT inline the message template. <!-- sdd-owner: implementation -->
- [ ] Upgrade `ProductPageClient`: (1) replace the "Guía de talles" WhatsApp `wa.me` link with a button opening `SizeGuideModal` (category = `product.category_slug`); (2) convert gallery thumbnails from clickable `div`s into keyboard-activatable buttons naming the slot `{product.name} — imagen {idx + 1}` that update the primary image on Enter/Space with focus retained (no lightbox/zoom added); fix thumbnail alt text to the same scheme; (3) disable (and mark `Agotado`) zero-stock size options and render `LowStockNote` for the selected variant when `0 < stock <= 3`; (4) add `FavoritesButton` inline near the title and `WhatsAppOrderCTA` under the add-to-cart control using `currentVariant?.price || base_price`; (5) render `RelatedProducts` after the shipping/guarantee grid; keep NUEVO sourced from `is_new`. <!-- sdd-owner: implementation -->
- [ ] Add a server `page.tsx` with `metadata.title = "Mis favoritos | Flores"` and `robots: { index: false, follow: false }` (no canonical to another route) rendering a client `FavoritesClient` that reads `useFavoritesStore().slugs`, hydrates live products via `getProductsBySlugs`, renders the canonical `ProductCard variant="light"` grid (2 cols mobile / 4 cols desktop), omits unresolved/inactive slugs, and shows an ES-BO empty state linking to "/productos" when there are no persisted or no resolvable favorites. <!-- sdd-owner: implementation -->
- [ ] Replace the "en construcción" placeholder with a minimal form: read the current `sale_ends_at` (via `adminApi.getSections`), a labeled date input bound to the value, `Guardar` calling `adminApi.updateSection("sale_ends_at", { title: "Fecha fin liquidación", content: <ISO value> })`, a `Limpiar fecha` action storing `""`, and display of the current value (ES-BO formatted) or `Sin fecha configurada`. Auth is already enforced by `AdminLayout`; no new auth code. ISO-validate before saving; clear input MUST disable liquidation everywhere on next storefront render. <!-- sdd-owner: implementation -->
- [ ] Add a `Guía de talles` trigger reachable from the storefront chrome (Navbar quick area, per Spec B the navbar OR footer may host it; Navbar chosen so the mobile menu and desktop bar both reach it) that opens the shared `SizeGuideModal` with the default women family (`categorySlug="botas"` or the resolver fallback). The trigger MUST NOT open WhatsApp and MUST NOT reference a hardcoded number. <!-- sdd-owner: implementation -->

### Final Cross-cutting Verification & Dishonesty Clean-up
- [ ] On the set of files changed by this change (`git diff --name-only` against the base branch): `grep -rniE "setInterval|countdown|se acaba hoy|última oportunidad|acaba de comprar|solo quedan|24h antes"` → 0 new occurrences; no new `setInterval`/timer code and no synthetic anchor/urgency copy in PDP, card, navbar, favorites, or new badge components. Document that the pre-existing `AnnouncementBar` interval is untouched and remains inert (its `getAnnouncement` source never provides `countdown_end_date`); flag any drift for the parent decision gate. <!-- sdd-owner: implementation -->
- [ ] Extract the ten new products' `images[].url` from the `convex/seed.ts` `extendedCatalog2` block and verify each returns HTTP 200 (`curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" <url>` per URL); assert no Unsplash photo-id repeats across the ten by grepping the block and counting each `photo-…` id. <!-- sdd-owner: implementation -->
- [ ] Playwright (or manual browser) check: favorite a product from a card → reload → heart stays active and `localStorage["flores-favorites"]` holds only slugs; lower that product's `base_price` in Convex → reload "/favoritos" → the card shows the NEW price (no stale snapshot); remove the slug from storage → empty state appears with the "/productos" link. <!-- sdd-owner: implementation -->
- [ ] Playwright at 1440px: Tab to the categories trigger, Enter/Arrow opens the mega-menu, arrows move focus between items, Escape closes and returns focus to the trigger; at 390px: hamburger → categories disclosure expands with `aria-expanded="true"`, all categories + quick links visible, and links navigate and close the menu. <!-- sdd-owner: implementation -->
- [ ] Run the full gate on the merged result: `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build` (production build succeeds with no type/runtime errors). <!-- sdd-owner: implementation -->
- [ ] Remove legacy dishonesty: inert countdown in `AnnouncementBar` (interval + countdown markup) and invented scarcity copy in seeded CMS content (search seed for "+500", "ÚLTIMAS", fake urgency phrases). Replace with honest copy or remove. Verify: grep for countdown/interval in AnnouncementBar returns 0; build green. <!-- sdd-owner: implementation -->
```

---

## Workload & PR Boundary
- **Current Slice:** Slice 1 (Foundation)
- **PR Scope:** Foundation data layer (Convex queries, stores, static maps, WhatsApp helpers, signal badge/note components, and seed batch +10).
- **Line Count Forecast:** ~350 changed lines (well within the ≤400-line budget per PR under auto-chain).
- **Next Slice:** Slice 2 (Navigation + Canonical ProductCard).
