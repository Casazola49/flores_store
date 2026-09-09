# Apply Progress — Ficha de Producto Vendedora (`ficha-producto-vendedora`)

## Execution Status
- **Change:** `ficha-producto-vendedora`
- **Phase:** Apply (Slice 2 Navigation + Canonical ProductCard convergence)
- **Delivery Strategy:** `auto-chain` (Slice 2 delivered as second PR boundary)
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

---

## Files Changed and Created

### New Files
- `src/components/store/MegaMenu.tsx` (desktop hover/focus mega-menu panel)
- `src/lib/favorites.ts` (Slice 1)
- `src/lib/sizeGuide.ts` (Slice 1)
- `src/components/store/LiquidationBadge.tsx` (Slice 1)
- `src/components/store/LowStockNote.tsx` (Slice 1)
- `src/components/store/FavoritesButton.tsx` (Slice 1)

### Modified Files
- `src/components/store/Navbar.tsx` (Convex categories, MegaMenu, mobile accordion, "Ofertas" → "Liquidación")
- `src/components/store/ProductCard.tsx` (canonical component, dark/light variants, badges, favorites, mapProductToCardData)
- `src/app/(store)/productos/ProductsClient.tsx` (migrated to canonical ProductCard, "Ofertas" → "Liquidación")
- `src/app/(store)/HomeClient.tsx` (updated toHot to use canonical mapProductToCardData)
- `src/components/store/Footer.tsx` ("Ofertas" → "Liquidación", dynamic WhatsApp number from CMS)
- `convex/products.ts` (Slice 1 queries, cleaned prefer-const)
- `openspec/changes/ficha-producto-vendedora/tasks.md` (checked S2.1–S2.6)
- `openspec/changes/ficha-producto-vendedora/apply-progress.md` (merged Slice 2 progress)

---

## Deviations from Design
None. All components, navigation patterns, card convergence, and signals strictly follow `design.md` §3.2, §3.3, §3.4 and `spec.md` capabilities G and H.

---

## Verification Evidence

1. **TypeScript Typecheck:**
   - `npx tsc --noEmit` → 0 errors.
2. **ESLint on Changed Files:**
   - `npx eslint src/components/store/MegaMenu.tsx src/components/store/Navbar.tsx src/components/store/ProductCard.tsx src/app/(store)/productos/ProductsClient.tsx src/app/(store)/HomeClient.tsx src/components/store/Footer.tsx convex/products.ts` → 0 errors.
3. **Next.js Production Build:**
   - `npm run build` → Compiled successfully in 4.8s, TypeScript check finished in 5.6s, all 17 routes generated statically and dynamically without errors.
4. **Nav Surface "Ofertas" Grep:**
   - `grep -rn "Ofertas" src/` → 0 matches across the entire `src/` codebase.
5. **Hardcoded WhatsApp Number Grep:**
   - `grep -rn "wa.me/591" src/` → 0 matches across `src/`.
6. **Token Purity Grep:**
   - `grep -rnE "#FFD700|#FFB300|#FFC107" src/` → 0 matches.
7. **Canonical Card Convergence:**
   - Both `HomeClient.tsx` and `ProductsClient.tsx` import and render `ProductCard` and `mapProductToCardData` from `@/components/store/ProductCard`.

---

## Remaining Tasks (Slice 3, Final, Post-Apply)

```markdown
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

### Deferred Parent Lifecycle Actions
- [ ] Bounded review of Slice 1 PRs (S1.1–S1.11): cross-check Convex queries, favorites store, signal components, and the +10 seed against Spec B.1/C.1–C.2/E/F.1–F.3/I.1–I.4/K acceptance criteria before merging onward. <!-- sdd-owner: parent -->
- [ ] Bounded review of Slice 2 PRs (S2.1–S2.6): verify single-canonical-card convergence (no second inline card remains), no `Ofertas` on any nav surface, and both mega-menu and accordion keyboard behavior against Spec G.1–G.3/H.1–H.2. <!-- sdd-owner: parent -->
- [ ] Bounded review of Slice 3 PRs (S3.1–S3.7): verify PDP interactions, "/favoritos" metadata + live hydration, admin `sale_ends_at` flow, and the global size-guide trigger against Spec A.1–A.2/B.2–B.3/C/D/E.3/F.4/J. <!-- sdd-owner: parent -->
- [ ] Ask-on-risk decision gate (before further apply): (1) approve the chain strategy + PR split now that Slice sizes exceed 400 changed lines each; (2) confirm the inferred capability areas (Spec R2) and legacy-copy scope boundary (Spec R5, pre-existing `hero_subtitle`/banner scarcity copy and the inert `AnnouncementBar`/`countdown_end_hour` remain out of scope or become a follow-up); (3) confirm the Seed image HTTP-200 record (Spec R4) as point-in-time. <!-- sdd-owner: parent -->
- [ ] Lifecycle gate: after the above reviews pass, hand off to the verify phase (lint/build/marca greps + manual Playwright checklist in `design.md` §10) and then sync/archive this change. <!-- sdd-owner: parent -->
```

---

## Workload & PR Boundary
- **Completed Slices:** Slice 1 (Foundation), Slice 2 (Navigation + Canonical ProductCard)
- **Slice 2 PR Scope:** Navigation rebuild (MegaMenu desktop panel, Navbar with live Convex categories and mobile accordion disclosure), single canonical `ProductCard` (dark/light variants, badges, sibling favorites button, canonical mapper), catalog migration, home feed alignment, and footer rename + CMS WhatsApp number.
- **Slice 2 Line Count:** ~280 changed lines (well within the ≤400-line budget per PR under auto-chain).
- **Next Slice:** Slice 3 (PDP Upgrade, Favorites Page, Admin `sale_ends_at`, and global size guide trigger).
