# Tasks — Ficha de Producto Vendedora (`ficha-producto-vendedora`)

English decomposition of `design.md` §9 into reviewable, dependency-ordered tasks. Reads `spec.md` (capabilities A–K), `design.md`, and current sources (`convex/seed.ts` variants v1–v58/sort_order 1–20, `src/lib/store.ts` cart persist pattern, `src/components/store/*`, `convex/schema.ts`).

**Test reality:** `openspec/config.yaml` sets `testing.runner: none` (`package.json` has no test script) and `strict_tdd: true`. No RED→GREEN unit loops are possible; each task instead states a check-first acceptance (grep/typecheck/DOM assertion) that the change must satisfy, followed by GREEN implementation. `playwright-core` is present but no runner/config exists, so "Playwright spot-check" means a local dev-server check (scratch script via `playwright-core` or manual DevTools responsive emulation) at **390px** and **1440px**.

**TDD note:** order tasks as Foundation → Navigation/Card → PDP/Favorites/Admin. Tasks in Slice 3 that touch files modified in Slice 2 (e.g., `Navbar.tsx` for the global size-guide trigger) MUST be applied after the Slice 2 refactor is merged.

---

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,700 total: Slice 1 ≈ 650–750 · Slice 2 ≈ 450–550 · Slice 3 ≈ 550–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 Convex queries + seed (+10 & `sale_ends_at`) ≈ 330 → PR2 lib stores/helpers + badge components ≈ 320 → PR3 Navbar/MegaMenu rename ≈ 250 → PR4 canonical ProductCard convergence ≈ 250 → PR5 PDP + global size-guide trigger ≈ 330 → PR6 "/favoritos" + admin ≈ 250 |
| Delivery strategy | ask-on-risk |
| Chain strategy | auto-chain |

```text
Decision needed before apply: No (approved by maintainer: chained PRs via auto-chain)
Chained PRs recommended: Yes
Chain strategy: auto-chain
400-line budget risk: High (mitigated by auto-chain PR boundaries)
```

All three design slices individually exceed the 400-line review budget (Slice 1 the most, driven by the +10 seed block and the static `sizeGuide.ts` map; Slice 3 second, driven by the PDP rewrite and `SizeGuideModal`). Each slice MUST be delivered as chained PRs using the suggested split above (each chunk ≤ 400 changed lines). Maintainer approved `auto-chain` delivery strategy.

---

## Slice 1 — Foundation (Convex queries, stores, seed, shared signal components)

### S1.1 Add bounded `getRelatedProducts` query — `convex/products.ts`
- [ ] Add a public `getRelatedProducts` query taking `{ categorySlug, gender?, excludeSlug, limit? }` (default 4, max 8). Primary read MUST use `withIndex("by_category")` filtered to `is_active` and `slug != excludeSlug` with `.take(limit)`; when fewer than 2 category-mates exist and `gender` is present, supplement with same-`gender` active products (excluding the current slug) still capped at `limit`. The query MUST NOT do an unbounded `.collect()` scan. <!-- sdd-owner: implementation -->
  - Acceptance: Spec C.1 (category-mate first, then gender fallback, never the current product) and Spec C.2 (indexed + bounded; `.take()`/bound present; no bare `.collect()`).
  - Verify: `npx convex typegen` then `npx tsc --noEmit`; `npm run build`; read-level grep of the new query confirms `withIndex("by_category")` and `.take(` and no `.collect()`.

### S1.2 Add `getProductsBySlugs` query — `convex/products.ts`
- [ ] Add a public `getProductsBySlugs` query taking `{ slugs: string[] }` that returns `[]` for an empty array, resolves each slug via `withIndex("by_slug")`, omits missing or `is_active === false` products, and preserves input slug order. <!-- sdd-owner: implementation -->
  - Acceptance: Spec F.1 (deleted product omitted, no broken card) and Spec F.2/K.2 (favorites hydrate live Convex data by slug, never snapshots).
  - Verify: `npx convex typegen`; `npx tsc --noEmit`; unit-style spot: call query with `["bota-chelsea-noir", "no-existe"]` → only the live slug returns.

### S1.3 Create persisted favorites store — `src/lib/favorites.ts` (NEW)
- [ ] Create a Zustand `persist` store `useFavoritesStore` (key `flores-favorites`, following `src/lib/store.ts` cart pattern) persisting ONLY a `string[]` of slugs with `toggle`, `has`, `count`, `clear`; cap the set at 100 (drop oldest on overflow). No product snapshot fields (price/stock/images) may be serialized. <!-- sdd-owner: implementation -->
  - Acceptance: Spec F.2 (reload rehydrates the same slug set; live data always comes from Convex) and Spec K.2 (store never serializes `base_price`, variant price, `is_new`, liquidation, or stock).
  - Verify: `npx tsc --noEmit`; browser spot-check: toggle a heart, reload, `JSON.parse(localStorage.getItem("flores-favorites"))` contains only string slugs.

### S1.4 Add static ES-BO size guide — `src/lib/sizeGuide.ts` (NEW)
- [ ] Add the static `SIZE_GUIDE` map keyed by `category_slug` (botas/zapatos/zapatillas/zapatillas-deportivas/tacos) with per-family `{ label, sizes: [{size, footCm}] }` entries; every women-family entry covers sizes 34–41 with non-null cm (and men/unisex where applicable per `design.md` §3.1.1), plus `getSizeGuideForCategory(slug)` returning a `zapatos` fallback. No CMS round-trip, no hardcoded WhatsApp number. <!-- sdd-owner: implementation -->
  - Acceptance: Spec B.1 (women sizes 34–41 all resolve to centimeters; no entry `null`/`undefined`).
  - Verify: `npx tsc --noEmit`; read-level spot: confirm the eight entries 34–41 exist for each women-family block and every `footCm` is a non-empty string.

### S1.5 Add `buildSingleProductMessage` helper — `src/lib/whatsapp.ts`
- [ ] Add `buildSingleProductMessage({ name, size, color?, price })` beside `buildOrderMessage`/`openWhatsApp` returning `encodeURIComponent` text of exactly `Hola FLORES 💕 Quiero el modelo *{name}* — talle {size}{, color {color}}. Precio: Bs {price}. ¿Tienen stock?`, omitting the color segment (and its comma) when `color` is unset. This builder MUST be the only path any component uses for the single-product inquiry; no inline template-literal duplicate may be introduced. <!-- sdd-owner: implementation -->
  - Acceptance: Spec D.1 (both message scenarios verbatim, no orphan comma / `undefined`) and Spec D.3 (single builder in `src/lib/whatsapp.ts`).
  - Verify: `npx tsc --noEmit`; later cross-grep that the PDP CTA imports the helper and no other file contains the message template.

### S1.6 Extend `StockBadge` with low-stock state — `src/components/store/StockBadge.tsx`
- [ ] Extend `StockBadge` so it renders `Quedan {stock} en talle {size}` (crimson accent, `rounded-none`) when `stock > 0 && stock <= 3` and a `size` label is provided; keep `Agotado` for `stock === 0`; keep `Stock disponible` otherwise. Stock number MUST come from the passed variant/aggregate value — never invented. <!-- sdd-owner: implementation -->
  - Acceptance: Spec E.1 (PDP copy `Quedan 2 en talle 38`; card badge mirrors the ≤3 band, not `Agotado`) and Spec E.4/K.3 (visible stock matches real variant data).
  - Verify: `npx tsc --noEmit`; `npm run build`; Playwright spot on a known low-stock product (e.g. `taco-aguja-vino`, variant `v56` stock 1) at 390px and 1440px.

### S1.7 Create gated `LiquidationBadge` — `src/components/store/LiquidationBadge.tsx` (NEW)
- [ ] Add `LiquidationBadge({ isEligible, saleEndsAt })`: render `Liquidación real — hasta {DD/MM/YYYY}` ONLY when `isEligible === true` AND `saleEndsAt` is a present, valid, future ISO date (parse with `new Date`, reject `isNaN`/past/empty); otherwise render nothing. Read `sale_ends_at` from `useCMSStore().sections` at call sites. NO countdown, NO `setInterval`, NO fallback/invented end date, no pulse animation. <!-- sdd-owner: implementation -->
  - Acceptance: Spec E.2 (future-date scenario renders the real locale date; absent/past date renders nothing on PDP and card) and Spec E.4/K.1/K.4 (past date inert everywhere; honesty invariants).
  - Verify: `npx tsc --noEmit`; `npm run build`; Playwright: set a future `sale_ends_at` via admin/DB → badge appears only on eligible products; clear/past → badge absent. Grep component for `setInterval`/`countdown` → 0.

### S1.8 Create `LowStockNote` — `src/components/store/LowStockNote.tsx` (NEW)
- [ ] Add `LowStockNote({ stock, size })` rendering exactly `Quedan {N} en talle {size}` when `stock > 0 && stock <= 3`, with `role="status"` (polite live region) and crimson text; renders nothing otherwise. <!-- sdd-owner: implementation -->
  - Acceptance: Spec E.1 PDP scenario and `design.md` §7 (live region announces stock state; text, not color alone).
  - Verify: `npx tsc --noEmit`; later Playwright PDP spot (variant stock 2 → note visible with the exact string; stock 0 or >3 → hidden).

### S1.9 Create accessible `FavoritesButton` — `src/components/store/FavoritesButton.tsx` (NEW)
- [ ] Add a heart-toggle button reading `useFavoritesStore` for the given slug, exposing `aria-pressed` and a dynamic accessible name (`Agregar a favoritos` / `Quitar de favoritos`), operable by Enter/Space, with visible filled/outline state that is NOT conveyed by color alone (shape + label change too); `rounded-none`, `:focus-visible` ring inherited. Must be mounted OUTSIDE product `<Link>` elements (sibling overlay), never nested inside an anchor. <!-- sdd-owner: implementation -->
  - Acceptance: Spec F.3 (keyboard toggle flips `aria-pressed` and visible state on PDP) and Spec F.5/H (usable on card + PDP without nested-interactive HTML).
  - Verify: `npx tsc --noEmit`; `npm run build`; Playwright keyboard Tab+Space on PDP and on a card; DOM assertion the button is not a descendant of the product link.

### S1.10 Seed: add `sale_ends_at` CMS key — `convex/seed.ts`
- [ ] Append `{ key: "sale_ends_at", title: "Fecha fin liquidación", content: "" }` to the initial `cms_sections` settings array (fresh-DB path) so the key exists with an empty (inert) default. Clearing via admin stores `""`, which MUST disable all liquidation copy. <!-- sdd-owner: implementation -->
  - Acceptance: Spec E.2/J/K.4 (nullable/empty = no liquidation messaging anywhere) and design §3.2.2.
  - Verify: `npx tsc --noEmit`; grep `sale_ends_at` present once in the seed settings block with `content: ""`.

### S1.11 Seed: add the +10 idempotent batch — `convex/seed.ts`
- [ ] Append a `extendedCatalog2` array of exactly ten products (per `design.md` §3.5.1 rows 21–30) inside the existing slug-idempotent loop, each with `sort_order` 21–30 (contiguous), `is_new: true`, `is_active: true`, prices within Bs 180–620, distribution across the five categories, and variants using ids `v59`–`v98` (globally unique; highest existing is `v58`). Every new product image uses a distinct Unsplash photo-id within the ten (no repeats inside the batch). Update the stale header comment ("13 productos, variantes v26+"). <!-- sdd-owner: implementation -->
  - Acceptance: Spec I.1 (idempotent rerun keeps exactly 30 products; original 20 untouched), Spec I.2 (all new variant ids ≥ `v59`, no collisions so `adjustStock`/`updateVariant`/`deleteVariant` keep targeting the right variant), Spec I.3 (each image URL HTTP-200 verified at seed-record time; no duplicated photo-id inside the batch), Spec I.4 (contiguous `sort_order` 21–30, stable ordering).
  - Verify: `npx tsc --noEmit`; `npx convex run seed:run` twice on a local deployment → catalog stays at 30 with `sort_order` 21–30 present once each; grep new block for variant ids `v59`–`v98` and confirm none appear in the existing blocks (v1–v58); curl `-s -o /dev/null -w "%{http_code}"` each new `images[].url` → 200 for all.

---

## Slice 2 — Navigation (MegaMenu/Navbar rename) + Canonical ProductCard

### S2.1 Create desktop `MegaMenu` — `src/components/store/MegaMenu.tsx` (NEW)
- [ ] Add a hover/focus-triggered mega-menu panel (≥ `md` only) listing every Convex category passed via prop (links "/productos?category={slug}") plus quick links (`Novedades` → "/productos?is_new=true", `Liquidación` → "/productos?sale=true", `Exclusivos`), with `aria-expanded`/`aria-haspopup="menu"` on the trigger, `role="menu"` panel semantics, Escape-to-close with focus restore to the trigger, and a ~200ms mouse-leave close delay. No yellow; `rounded-none`; colors via `var(--color-*)`. <!-- sdd-owner: implementation -->
  - Acceptance: Spec G.2 (desktop hover scenario: opens on hover/focus, lists every category + quick links, Escape closes and restores focus) and Spec G.3 (label is `Liquidación`, never `Ofertas`).
  - Verify: `npm run build`; Playwright at 1440px: hover opens, Escape closes + focus on trigger; keyboard Tab/Enter/Escape; grep panel for `Ofertas` → 0.

### S2.2 Refactor `Navbar` to Convex categories + mobile accordion + rename — `src/components/store/Navbar.tsx`
- [ ] Rewrite `Navbar`: build the desktop nav and mobile menu from `useQuery(api.categories.getCategories)` (live list) + quick links (`Novedades`, `Liquidación`, `Exclusivos`, and a `Favoritos` → "/favoritos" entry); on mobile (< `md`) a categories disclosure accordion with `aria-expanded` listing the same content; replace every `Ofertas` occurrence (labels and any derived aria/alt) with `Liquidación` while keeping the "/productos?sale=true" destination. Preserve logo, cart button, and mobile-menu toggle behavior. <!-- sdd-owner: implementation -->
  - Acceptance: Spec G.1 (exactly the live Convex category count renders alongside the quick links; add/remove a category in Convex reflects on next render), Spec G.2 (mobile accordion scenario with `aria-expanded`), Spec G.3 (no `Ofertas` string in any nav surface).
  - Verify: `npm run build`; Playwright at 390px (accordion expands to all categories + quick links) and 1440px (categories from Convex + quick links); `grep -rn "Ofertas" src/components/store/Navbar.tsx src/components/store/MegaMenu.tsx` → 0 matches.

### S2.3 Converge cards on one canonical `ProductCard` — `src/components/store/ProductCard.tsx`
- [ ] Extend the existing dark `ProductCard` into the single canonical component: add `variant: "dark" | "light"` presentation chrome and an expanded `ProductCardData` shape (slug, total/low stock band info, `isNew`, liquidation eligibility, gender/category passthrough, video URL) so home, catalog, and later "/favoritos" all import this one path. Wire in `StockBadge` (low-stock), the `NUEVO` badge (from `is_new` only), `LiquidationBadge` (future-date gated), and `FavoritesButton` mounted as a sibling of the product `<Link>` (not inside it). No second inline card may carry its own badge/favorite logic. <!-- sdd-owner: implementation -->
  - Acceptance: Spec H.1/H.2 (both surfaces share one component; badge/favorites logic single-sourced, no drift) plus Spec E.1 (badge mirrors the ≤3 band) and Spec F.5 (heart on cards).
  - Verify: `npx tsc --noEmit`; `npm run build`; Playwright home (dark) + catalog (light) grids at 390px/1440px: same badges/heart behavior; grep that home and catalog import the same `@/components/store/ProductCard` path.

### S2.4 Migrate catalog to canonical card + title rename — `src/app/(store)/productos/ProductsClient.tsx`
- [ ] Replace the inline light card JSX with `<ProductCard product={mappedData} variant="light" />` (mapping the live Convex product incl. variants aggregate for low-stock, tags/compare for liquidation, `is_new`) and rename the sale title `Ofertas` → `Liquidación` (query param handling unchanged). <!-- sdd-owner: implementation -->
  - Acceptance: Spec H.1 (catalog grid renders through the same `ProductCard` path) and Spec G.3 (no `Ofertas` text in the page header).
  - Verify: `npm run build`; Playwright "/productos?sale=true" at 390px/1440px shows `Liquidación` title and card badges/heart; `grep -rn "Ofertas" src/app/(store)/productos/` → 0.

### S2.5 Align home feed mapping with the canonical card — `src/app/(store)/HomeClient.tsx`
- [ ] Update the home `toHot` mapping (and any callers) to feed the full canonical `ProductCardData` (slug, per-variant low-stock band, liquidation eligibility from `tags`/`compare_price`, `is_new`, gender/category) while rendering `variant="dark"` by default. No new inline card here. <!-- sdd-owner: implementation -->
  - Acceptance: Spec H.2 (a badge/favorites change reflects on home from the same code path) and Spec E.1/K.3 (card low-stock/NUEVO mirrors real data).
  - Verify: `npm run build`; Playwright home grid at 390px/1440px shows heart + NUEVO on the seeded `is_new` products and low-stock band where a variant is ≤3.

### S2.6 Footer: rename + CMS number helper — `src/components/store/Footer.tsx`
- [ ] In `Footer`, rename the catalog link `Ofertas` → `Liquidación` (destination unchanged) and replace the hardcoded `https://wa.me/59176932485` link with `getWhatsAppNumber(useCMSStore().sections.whatsapp_number)`. No hardcoded number may remain in this touched file. <!-- sdd-owner: implementation -->
  - Acceptance: Spec G.3 (no `Ofertas` in the footer catalog/nav surfaces) and Spec D.2/D.4 (footer is a code path touched by this change → single CMS-driven source of truth for the number).
  - Verify: `npm run build`; `grep -n "Ofertas\|wa.me/591" src/components/store/Footer.tsx` → 0 matches.

---

## Slice 3 — PDP upgrade + Favorites page + Admin `sale_ends_at`

### S3.1 Create accessible `SizeGuideModal` — `src/components/store/SizeGuideModal.tsx` (NEW)
- [ ] Add `SizeGuideModal({ open, onClose, categorySlug })` rendering a dialog (`role="dialog"`, `aria-modal="true"`, `aria-label="Guía de talles"`) that: on open moves focus into the modal, traps Tab/Shift+Tab, closes on Escape, and restores focus to the trigger on close; renders the ES-BO table from `getSizeGuideForCategory(categorySlug)` ("Talle" | "Pie (cm)" per family label); full-width bottom sheet < 768px, centered modal ≥ 768px; `rounded-none`, token colors, no transitions under `prefers-reduced-motion`. <!-- sdd-owner: implementation -->
  - Acceptance: Spec B.2 (modal opens, traps, closes on Escape, restores focus to the trigger) and design §7 (dialog semantics).
  - Verify: `npm run build`; Playwright on a `botas` PDP at 390px (sheet) and 1440px (modal): open → focus inside, Tab cycles, Escape closes and focus returns to the trigger.

### S3.2 Create `RelatedProducts` section — `src/components/store/RelatedProducts.tsx` (NEW)
- [ ] Add `RelatedProducts({ categorySlug, gender?, currentSlug })` using `useQuery(api.products.getRelatedProducts, …)`, heading `También te puede interesar`, grid of up to four canonical `ProductCard` items (2 cols mobile, 4 cols desktop), never including the current slug. <!-- sdd-owner: implementation -->
  - Acceptance: Spec C.1 (up to 4: category-mates first, gender fallback when the category is thin; current product excluded) and Spec C.2 (bounded by the S1.1 query).
  - Verify: `npx tsc --noEmit`; `npm run build`; Playwright a product in a thin category at 390px/1440px → ≤4 cards, current slug absent, links resolve.

### S3.3 Create `WhatsAppOrderCTA` — `src/components/store/WhatsAppOrderCTA.tsx` (NEW)
- [ ] Add a single-product inquiry button that reads the CMS number via `useCMSStore().sections` + `getWhatsAppNumber(sections.whatsapp_number)` and opens `https://wa.me/{number}?text={buildSingleProductMessage({name,size,color,price})}` in a new tab (`rel="noopener noreferrer"`); label/`aria-disabled` + explanatory state when no size is selected; WhatsApp-brand green allowed as the single documented exception; `rounded-none`. Must NOT hardcode a number and MUST NOT inline the message template. <!-- sdd-owner: implementation -->
  - Acceptance: Spec D.1 (exact prefilled text from selected variant data; no orphan comma when color unset), Spec D.2 (wa.me host = CMS number, no fallback to a hardcoded default when CMS provides it), Spec D.3/D.4 (helper-driven only).
  - Verify: `npm run build`; Playwright PDP: select size 38 + color Camel on `bota-taco-lira`-like data → inspect href decodes to `Hola FLORES 💕 Quiero el modelo *…* — talle 38, color Camel. Precio: Bs 520. ¿Tienen stock?`; unset color → no `, color` and no trailing comma; CTA disabled (and announced) with no size.

### S3.4 Integrate PDP — `src/app/(store)/productos/[slug]/ProductPageClient.tsx`
- [ ] Upgrade `ProductPageClient`: (1) replace the "Guía de talles" WhatsApp `wa.me` link with a button opening `SizeGuideModal` (category = `product.category_slug`); (2) convert gallery thumbnails from clickable `div`s into keyboard-activatable buttons naming the slot `{product.name} — imagen {idx + 1}` that update the primary image on Enter/Space with focus retained (no lightbox/zoom added); fix thumbnail alt text to the same scheme; (3) disable (and mark `Agotado`) zero-stock size options and render `LowStockNote` for the selected variant when `0 < stock <= 3`; (4) add `FavoritesButton` inline near the title and `WhatsAppOrderCTA` under the add-to-cart control using `currentVariant?.price || base_price`; (5) render `RelatedProducts` after the shipping/guarantee grid; keep NUEVO sourced from `is_new`. <!-- sdd-owner: implementation -->
  - Acceptance: Spec A.1/A.2 (multi-image gallery behavior + accessible, keyboard thumbnails), Spec B.2 (PDP trigger opens the modal), Spec E.1 (variant low-stock copy and unselectable zero-stock), Spec F.3 (heart keyboard toggle), Spec C (related section), Spec D.1/D.2 (CTA correctness).
  - Verify: `npx tsc --noEmit`; `npm run build`; Playwright at 390px and 1440px: thumbnail Tab+Enter swaps the primary image and announces the slot name; low-stock size shows `Quedan N en talle X` and zero-stock sizes are disabled; heart persists across reload; CTA href matches the exact spec message.

### S3.5 Create "/favoritos" page + live client — `src/app/(store)/favoritos/page.tsx` + `FavoritesClient.tsx` (NEW)
- [ ] Add a server `page.tsx` with `metadata.title = "Mis favoritos | Flores"` and `robots: { index: false, follow: false }` (no canonical to another route) rendering a client `FavoritesClient` that reads `useFavoritesStore().slugs`, hydrates live products via `getProductsBySlugs`, renders the canonical `ProductCard variant="light"` grid (2 cols mobile / 4 cols desktop), omits unresolved/inactive slugs, and shows an ES-BO empty state linking to "/productos" when there are no persisted or no resolvable favorites. <!-- sdd-owner: implementation -->
  - Acceptance: Spec F.1 (deleted product omitted — live query skips unresolved slugs; robots `noindex, nofollow` with no stray canonical), Spec F.2/K.2 (shows current `base_price`/stock/signals from Convex, never stale values), Spec F.4 (empty state links to "/productos").
  - Verify: `npm run build`; Playwright: empty state link visible and pointing to "/productos" at 390px/1440px; response `meta[name="robots"]` = `noindex, nofollow`; seed 2 favorites incl. one bogus slug → only the live one renders.

### S3.6 Admin: `sale_ends_at` editor — `src/app/admin/configuracion/page.tsx`
- [ ] Replace the "en construcción" placeholder with a minimal form: read the current `sale_ends_at` (via `adminApi.getSections`), a labeled date input bound to the value, `Guardar` calling `adminApi.updateSection("sale_ends_at", { title: "Fecha fin liquidación", content: <ISO value> })`, a `Limpiar fecha` action storing `""`, and display of the current value (ES-BO formatted) or `Sin fecha configurada`. Auth is already enforced by `AdminLayout`; no new auth code. ISO-validate before saving; clear input MUST disable liquidation everywhere on next storefront render. <!-- sdd-owner: implementation -->
  - Acceptance: Spec E.3/J (authenticated admin saves a future ISO date → PDP honors it on next render; clearing disables all liquidation messaging) and Spec K.4 (nullable field; no leftover banners when cleared).
  - Verify: `npm run build`; manual admin flow (set future date → storefront badge appears only on eligible products; set past/empty → no badge anywhere). Grep page for `updateSection`.

### S3.7 Global "Guía de talles" trigger opens the shared modal — `src/components/store/Navbar.tsx` (apply after S2.2 merges)
- [ ] Add a `Guía de talles` trigger reachable from the storefront chrome (Navbar quick area, per Spec B the navbar OR footer may host it; Navbar chosen so the mobile menu and desktop bar both reach it) that opens the shared `SizeGuideModal` with the default women family (`categorySlug="botas"` or the resolver fallback). The trigger MUST NOT open WhatsApp and MUST NOT reference a hardcoded number. <!-- sdd-owner: implementation -->
  - Acceptance: Spec B.3 (from "/" or "/productos" the trigger opens the modal with the women family; WhatsApp channel not invoked; no hardcoded phone).
  - Verify: `npm run build`; Playwright at 390px and 1440px from "/": trigger opens the modal (default family rows), Escape closes; no `wa.me` navigation fires.

---

## Final Cross-cutting Verification (after all slices are applied)

### F.1 Honesty grep suite — no countdown, no invented stats (touched files only)
- [ ] On the set of files changed by this change (`git diff --name-only` against the base branch): `grep -rniE "setInterval|countdown|se acaba hoy|última oportunidad|acaba de comprar|solo quedan|24h antes"` → 0 new occurrences; no new `setInterval`/timer code and no synthetic anchor/urgency copy in PDP, card, navbar, favorites, or new badge components. Document that the pre-existing `AnnouncementBar` interval is untouched and remains inert (its `getAnnouncement` source never provides `countdown_end_date`); flag any drift for the parent decision gate. <!-- sdd-owner: implementation -->
  - Acceptance: Spec K.1/K.3 (no synthetic urgency copy, no countdown runs on surfaces touched by this change) and `config.yaml` verify greps (no `#FFD700/#FFB300/#FFC107`, `rounded-none`/radius 0 in new components).
  - Verify: run the greps above across `src/` (expect only documented/pre-existing matches); `grep -rn "#FFD700\|#FFB300\|#FFC107" src/` → 0; spot-check `rounded-none` on new components.

### F.2 Seed image HTTP-200 + uniqueness check (new batch)
- [ ] Extract the ten new products' `images[].url` from the `convex/seed.ts` `extendedCatalog2` block and verify each returns HTTP 200 (`curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" <url>` per URL); assert no Unsplash photo-id repeats across the ten by grepping the block and counting each `photo-…` id. <!-- sdd-owner: implementation -->
  - Acceptance: Spec I.3 (all new URLs 200 at verification time; each photo-id appears at most once in the batch).
  - Verify: curl loop output shows only `200`; `grep -o "photo-[0-9a-z-]*"` on the new block shows unique values.

### F.3 Favorites persistence + live-price check
- [ ] Playwright (or manual browser) check: favorite a product from a card → reload → heart stays active and `localStorage["flores-favorites"]` holds only slugs; lower that product's `base_price` in Convex → reload "/favoritos" → the card shows the NEW price (no stale snapshot); remove the slug from storage → empty state appears with the "/productos" link. <!-- sdd-owner: implementation -->
  - Acceptance: Spec F.2/K.2 (reload preserves slugs; prices refresh live from Convex) and Spec F.4 (empty state).
  - Verify: see scenario steps at 390px and 1440px.

### F.4 Mega-menu keyboard navigation + mobile accordion
- [ ] Playwright at 1440px: Tab to the categories trigger, Enter/Arrow opens the mega-menu, arrows move focus between items, Escape closes and returns focus to the trigger; at 390px: hamburger → categories disclosure expands with `aria-expanded="true"`, all categories + quick links visible, and links navigate and close the menu. <!-- sdd-owner: implementation -->
  - Acceptance: Spec G.2 (desktop hover scenario incl. keyboard focus + Escape restore; mobile accordion scenario with `aria-expanded`).
  - Verify: full keyboard pass per scenario on both viewports; log any failure for the parent review gate.

### F.5 Full build gate — `src/` quality
- [ ] Run the full gate on the merged result: `npm run lint` (0 errors), `npx tsc --noEmit` (0 errors), and `npm run build` (production build succeeds with no type/runtime errors). <!-- sdd-owner: implementation -->
  - Acceptance: `openspec/config.yaml` `verify_commands` (lint + build) plus `tsc --noEmit` per this change's contract.
  - Verify: all three commands exit 0.

---

## Post-Apply Review & Lifecycle Gates (parent-owned — after implementation work above)

- [ ] Bounded review of Slice 1 PRs (S1.1–S1.11): cross-check Convex queries, favorites store, signal components, and the +10 seed against Spec B.1/C.1–C.2/E/F.1–F.3/I.1–I.4/K acceptance criteria before merging onward. <!-- sdd-owner: parent -->
- [ ] Bounded review of Slice 2 PRs (S2.1–S2.6): verify single-canonical-card convergence (no second inline card remains), no `Ofertas` on any nav surface, and both mega-menu and accordion keyboard behavior against Spec G.1–G.3/H.1–H.2. <!-- sdd-owner: parent -->
- [ ] Bounded review of Slice 3 PRs (S3.1–S3.7): verify PDP interactions, "/favoritos" metadata + live hydration, admin `sale_ends_at` flow, and the global size-guide trigger against Spec A.1–A.2/B.2–B.3/C/D/E.3/F.4/J. <!-- sdd-owner: parent -->
- [ ] Ask-on-risk decision gate (before further apply): (1) approve the chain strategy + PR split now that Slice sizes exceed 400 changed lines each; (2) confirm the inferred capability areas (Spec R2) and legacy-copy scope boundary (Spec R5, pre-existing `hero_subtitle`/banner scarcity copy and the inert `AnnouncementBar`/`countdown_end_hour` remain out of scope or become a follow-up); (3) confirm the Seed image HTTP-200 record (Spec R4) as point-in-time. <!-- sdd-owner: parent -->
- [ ] Lifecycle gate: after the above reviews pass, hand off to the verify phase (lint/build/marca greps + manual Playwright checklist in `design.md` §10) and then sync/archive this change. <!-- sdd-owner: parent -->

- [ ] Remove legacy dishonesty: inert countdown in `AnnouncementBar` (interval + countdown markup) and invented scarcity copy in seeded CMS content (search seed for "+500", "ÚLTIMAS", fake urgency phrases). Replace with honest copy or remove. Verify: grep for countdown/interval in AnnouncementBar returns 0; build green. <!-- sdd-owner: implementation -->
