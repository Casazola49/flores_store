# Spec Delta — Storefront (`ficha-producto-vendedora`)

## ADDED Requirements

### Requirement: Preserve multi-image gallery behavior

The PDP MUST continue to display `products.images[]` (objects with `url` and `is_primary`) as a primary image plus clickable thumbnail grid, without lightbox, zoom, or swipe gestures.

#### Scenario: Existing gallery renders from CMS data

- **GIVEN** a product with `images[]` containing at least one entry marked `is_primary`.
- **WHEN** the PDP mounts.
- **THEN** the primary image SHALL render, the thumbnail grid SHALL include every entry, clicking a thumbnail SHALL update the primary image, and alt text SHALL describe the product (not the index).

### Requirement: Gallery thumbnails expose accessible names

Each thumbnail MUST expose an accessible name that names the product or the slot ("Imagen 1 de {name}", "{name} — imagen 2", etc.) and MUST be keyboard-activatable in document order.

#### Scenario: Thumbnail keyboard activation

- **GIVEN** a keyboard user tabbing through the thumbnail row.
- **WHEN** focus lands on a thumbnail and the user presses Enter or Space.
- **THEN** that image SHALL become the primary image, focus SHALL remain on the thumbnail, and a screen reader SHALL announce the slot's accessible name.

### Requirement: ES-BO size guide ships as a static category-family map

A static ES-BO size-guide map MUST live in `src/lib/sizeGuide.ts` covering at least Bolivian women's shoe sizes `34–41` with foot-length in centimeters. The map MUST be keyed by category family (women, men, kids) and MUST NOT require a CMS round-trip.

#### Scenario: Women's sizes 34–41 resolve to centimeters

- **GIVEN** the static map for the women category family.
- **WHEN** the PDP requests size entries for sizes `34, 35, 36, 37, 38, 39, 40, 41`.
- **THEN** each entry SHALL resolve to a foot-length in centimeters, all eight sizes SHALL be present, and no entry SHALL be `null`/`undefined`.

### Requirement: PDP opens the size guide in a modal

The PDP MUST expose a "Guía de talles" trigger that opens the size guide in a modal overlay. The modal MUST trap focus, restore focus to the trigger on close, close on `Escape`, and render the ES-BO table for the current category family.

#### Scenario: Modal opens, traps, and restores focus

- **GIVEN** a PDP for a women's product and keyboard focus on the "Guía de talles" button.
- **WHEN** the user activates the trigger.
- **THEN** the modal SHALL open, focus SHALL move to the modal container, focus SHALL be trapped inside the modal, pressing `Escape` SHALL close the modal, and focus SHALL return to the trigger button.

### Requirement: Size-guide trigger is reachable from global nav or footer

A "Guía de talles" link MUST be available from the navbar or footer (in addition to the PDP) and MUST open the same modal content. The link MUST NOT use a hardcoded WhatsApp number to "consult sizes".

#### Scenario: Global size-guide link opens the same modal

- **GIVEN** a customer on `/` or `/productos`.
- **WHEN** they activate the global "Guía de talles" link.
- **THEN** the modal SHALL open with the default (women) family, the WhatsApp channel SHALL NOT be invoked, and no hardcoded phone number SHALL be referenced.

### Requirement: Related products come from the same category

The PDP MUST show up to four related products sharing the same `category_slug` as the current product. When fewer than four exist in that category, it MUST fall back to products sharing the same `gender`, still excluding the current product, and still capped at four.

#### Scenario: Same-category fallback when category is thin

- **GIVEN** a product with `category_slug = X` and only one other product in `X`, plus three products in the same `gender` in other categories.
- **WHEN** the PDP resolves related products.
- **THEN** it SHALL return up to four items: the one category-mate first, then the gender-mates, never including the current product.

#### Scenario: Current product is excluded

- **GIVEN** a product list returned from the category query.
- **WHEN** related products render.
- **THEN** the current product's slug MUST NOT appear in the list.

### Requirement: Related products query is indexed and bounded

The Convex query used to resolve related products MUST use the existing `by_category` index and MUST bound the result (e.g., `.take(8)` then in-memory filter) instead of an unbounded `.collect()` scan.

#### Scenario: Bounded read for related products

- **GIVEN** a category with more than four products.
- **WHEN** the related-products query runs.
- **THEN** it MUST NOT `.collect()` without a bound; it MUST use `withIndex("by_category")` plus `.take()`/`.paginate()`.

### Requirement: Single-product WhatsApp CTA on PDP

The PDP MUST expose a direct WhatsApp inquiry control whose prefilled message MUST exactly match:

```
Hola FLORES 💕 Quiero el modelo *{name}* — talle {size}{, color {color}}. Precio: Bs {price}. ¿Tienen stock?
```

The `{color}` segment MUST be omitted (no trailing comma) when no color is selected. `{price}` MUST come from the currently selected variant's `price` when one exists, otherwise from `base_price`.

#### Scenario: Message renders with selected variant data

- **GIVEN** a product with `name = "Bota Taco Lira"`, `base_price = 480`, a selected variant `size = 38`, `price = 520`, `color = "Camel"`.
- **WHEN** the user activates the CTA.
- **THEN** the prefilled text SHALL be exactly `Hola FLORES 💕 Quiero el modelo *Bota Taco Lira* — talle 38, color Camel. Precio: Bs 520. ¿Tienen stock?` and SHALL open `wa.me` with that text.

#### Scenario: Message renders without color

- **GIVEN** the same product with `color` unset.
- **WHEN** the user activates the CTA.
- **THEN** the message SHALL read `Hola FLORES 💕 Quiero el modelo *Bota Taco Lira* — talle 38. Precio: Bs 520. ¿Tienen stock?` (no orphan comma, no "color undefined").

### Requirement: WhatsApp number resolves through CMS-aware helper

The CTA MUST resolve the destination number through the CMS-aware `getWhatsAppNumber(sections.whatsapp_number)` helper paired with `fetchCMS` (or equivalent Zustand CMS store), and MUST NOT hardcode a number. Any other code path touched by this change (size guide fallback, footer, cart drawer) MUST use the same helper so a single source of truth governs the destination number.

#### Scenario: PDP uses CMS number, not fallback

- **GIVEN** `cms_sections` provides `whatsapp_number = "59176932485"` and `NEXT_PUBLIC_WHATSAPP_NUMBER` is unset.
- **WHEN** the CTA on the PDP builds its `wa.me` URL.
- **THEN** the URL host SHALL be `wa.me/59176932485` and SHALL NOT fall back to a hardcoded default.

### Requirement: Helper is centralized in `src/lib/whatsapp.ts`

A single-product message builder MUST live in `src/lib/whatsapp.ts` alongside the existing `buildOrderMessage`/`openWhatsApp` helpers. The builder MUST be the only path the PDP uses to compose the inquiry text.

#### Scenario: Single builder used

- **GIVEN** the PDP CTA wiring.
- **WHEN** the CTA composes the message.
- **THEN** it MUST call into `src/lib/whatsapp.ts` and MUST NOT inline a template literal copy of the message elsewhere.

### Requirement: Low-stock copy uses variant stock with the ≤3 threshold

For a selected variant whose `stock` is `> 0` and `≤ 3`, the PDP selector MUST show `Quedan {N} en talle {size}`. The canonical `ProductCard` MUST show a low-stock badge when at least one variant is in that band, and MUST continue to show the existing `Agotado` state when total stock is zero.

#### Scenario: PDP shows low-stock for a variant

- **GIVEN** a selected variant with `stock = 2`, `size = 38`.
- **WHEN** the PDP renders the selector.
- **THEN** the visible copy SHALL be exactly `Quedan 2 en talle 38`; variants with `stock = 0` SHALL NOT be selectable.

#### Scenario: Card badge mirrors the band

- **GIVEN** a product with one variant at `stock = 1` and the rest at `stock = 0`.
- **WHEN** the canonical `ProductCard` renders.
- **THEN** it SHALL render the low-stock badge (not `Agotado`) and the PDP copy MUST still read `Quedan 1 en talle {size}`.

### Requirement: NUEVO is sourced from `is_new`, not timestamps

The NUEVO badge MUST come from the explicit `products.is_new` boolean. The system MUST NOT derive NUEVO from `_creationTime` or any timestamp, and the seed batch MUST opt in by setting `is_new = true`.

#### Scenario: NUEVO only when `is_new` is true

- **GIVEN** a product with `is_new = true` and `_creationTime` 90 days ago, and another with `is_new = false` and `_creationTime` 1 hour ago.
- **WHEN** both render in any surface.
- **THEN** only the first SHALL show the NUEVO badge, regardless of age.

### Requirement: Liquidation is gated on a real future `sale_ends_at`

The system MUST add a nullable `sale_ends_at` key to `cms_sections`. The liquidation copy `Liquidación real — hasta {date}` and any subtle liquidation banner MUST render only when **both** (a) the product is eligible via the existing liquidation category/tag and (b) `sale_ends_at` parses as a future ISO date. An absent or past date MUST render nothing. The system MUST NOT render a countdown timer, an invented end date, or a fallback string.

#### Scenario: Eligible product, future date

- **GIVEN** a product carrying the liquidation tag and `cms_sections.sale_ends_at = "2026-12-31T23:59:59Z"` (future).
- **WHEN** the product renders on PDP and card.
- **THEN** the copy SHALL read `Liquidación real — hasta 31/12/2026` (or equivalent locale-formatted date) with no countdown, no `setInterval`, and no fake time-left text.

#### Scenario: Eligible product, missing or past date

- **GIVEN** the same product and either an absent `sale_ends_at` or a past date like `"2024-01-01T00:00:00Z"`.
- **WHEN** the product renders.
- **THEN** the liquidation copy MUST NOT appear, the banner MUST NOT appear, and the card MUST NOT show liquidation treatment.

### Requirement: Admin can edit `sale_ends_at` from Configuración

The existing `/admin/configuracion` route MUST gain a minimal form (or input) that lets an authenticated admin write the `sale_ends_at` key to `cms_sections` through the existing `settings.updateSection` mutation. Clearing the field MUST disable all liquidation messaging cleanly.

#### Scenario: Admin saves a new end date

- **GIVEN** an authenticated admin on `/admin/configuracion`.
- **WHEN** they submit a valid future ISO date through the new control.
- **THEN** `cms_sections.sale_ends_at` SHALL be updated, the PDP MUST honor the new date on next render, and clearing the input MUST result in no liquidation messaging anywhere.

### Requirement: `/favoritos` lists live products and is `noindex, nofollow`

The route `/favoritos` MUST render the customer's persisted favorites hydrated from live Convex data by slug. The page MUST emit `<meta name="robots" content="noindex, nofollow">` (or the equivalent Next.js `metadata.robots = { index: false, follow: false }`).

#### Scenario: Deleted product is omitted from the page

- **GIVEN** a favorite slug that no longer exists in Convex.
- **WHEN** `/favoritos` mounts.
- **THEN** that entry MUST NOT render as a broken card; the live query MUST skip unresolved slugs.

#### Scenario: Robots metadata forbids indexing

- **GIVEN** the `/favoritos` route.
- **WHEN** the HTML is served.
- **THEN** the response SHALL include a directive equivalent to `noindex, nofollow` and SHALL NOT include a `canonical` pointing at any other route.

### Requirement: Favorites store persists only slugs

A persisted store (Zustand `persist` or equivalent) MUST persist only `string[]` of product slugs under a stable key (e.g., `flores-favorites`), following the cart-store pattern. The store MUST NOT persist full product snapshots; live product data MUST always come from Convex.

#### Scenario: Reload preserves the set; prices refresh

- **GIVEN** the customer has slugs `["a", "b", "c"]` persisted.
- **WHEN** the customer reloads the page.
- **THEN** the store SHALL rehydrate the same slug set and `/favoritos` SHALL show the current `base_price`, stock, and signals from Convex (not stale values).

### Requirement: Accessible heart toggle on canonical card and PDP

The canonical `ProductCard` and the PDP MUST expose a heart toggle. The toggle MUST have an accessible name (e.g., `aria-pressed` plus a visible or screen-reader label like "Quitar de favoritos" / "Agregar a favoritos"), MUST be keyboard-activatable, MUST surface state through `aria-pressed`, and MUST NOT rely on color alone to convey state.

#### Scenario: Keyboard toggle on PDP

- **GIVEN** a keyboard user focused on the PDP heart toggle.
- **WHEN** they press Space or Enter.
- **THEN** the slug SHALL be added to or removed from the favorites store, `aria-pressed` SHALL flip, and the visible state SHALL change.

### Requirement: Empty state links back to the catalog

When no favorites are persisted (or no favorites resolve to live products), `/favoritos` MUST render an empty state with a clear link to `/productos`.

#### Scenario: First-visit empty state

- **GIVEN** a customer with an empty favorites store visiting `/favoritos`.
- **WHEN** the page renders.
- **THEN** it SHALL show an ES-BO empty-state message and a link whose accessible name and href both point to `/productos`.

### Requirement: Navbar links come from Convex categories

The `Navbar` MUST build its category links from `api.categories.getCategories` (the live Convex list). It MUST also keep quick links for `Novedades` (`/productos?is_new=true`) and `Liquidación` (liquidation-eligible products).

#### Scenario: Nav reflects Convex categories

- **GIVEN** Convex returns five categories.
- **WHEN** the navbar mounts.
- **THEN** exactly five category links SHALL render in addition to the Novedades and Liquidación quick links, and adding or removing a category in Convex MUST be reflected on next render.

### Requirement: Desktop mega-menu on hover, mobile accordion on tap

On viewports ≥ `md`, the navbar MUST expose a hover-triggered mega-menu that lists every Convex category plus the quick links. On mobile (<`md`), the navbar MUST expose a tap-triggered accordion with the same content. Both surfaces MUST be keyboard navigable.

#### Scenario: Desktop hover menu

- **GIVEN** a desktop viewport with keyboard focus or pointer hover on the categories trigger.
- **WHEN** the user hovers (or focuses) the trigger.
- **THEN** the mega-menu SHALL open, show every category plus the quick links, and pressing `Escape` SHALL close it and restore focus.

#### Scenario: Mobile accordion

- **GIVEN** a mobile viewport and the navbar hamburger open.
- **WHEN** the user activates the categories disclosure.
- **THEN** the accordion MUST expand to reveal every category plus the quick links, and the disclosure MUST expose `aria-expanded`.

### Requirement: Rename "Ofertas" to "Liquidación" everywhere in nav

Every navigation occurrence of the string "Ofertas" MUST be replaced with "Liquidación". This applies to the desktop mega-menu, the mobile accordion, the navbar quick-link label, and any aria-label/alt text derived from it. Out of scope: legacy marketing copy or `cms_sections` keys not used by navigation.

#### Scenario: No "Ofertas" in navigation surfaces

- **GIVEN** the rendered `Navbar` (desktop and mobile).
- **WHEN** the DOM is inspected.
- **THEN** the string "Ofertas" MUST NOT appear in any nav surface; "Liquidación" SHALL appear instead, and the destination SHALL be the liquidation-eligible filter.

### Requirement: One canonical `ProductCard` implementation

The two current card implementations (the dark home card and the inline light card in the catalog) MUST converge on a single `ProductCard` component. The component MUST accept presentation props (e.g., `variant: 'dark' | 'light'`, `showQuickAdd`) so home and catalog contexts can opt into different chrome without forking badge, favorite, stock, or accessibility logic.

#### Scenario: Both surfaces share one component

- **GIVEN** the home grid and the catalog grid.
- **WHEN** both render.
- **THEN** they MUST import from the same `ProductCard` path, badges (`StockBadge`, NUEVO, liquidación, low-stock) and the heart toggle MUST render identically across both, with differences limited to presentation props.

#### Scenario: No drifting badge or favorite logic

- **GIVEN** a feature change to favorites or any sales-signal badge.
- **WHEN** the change is merged.
- **THEN** the home grid, catalog grid, and `/favoritos` MUST reflect the change from the same code path; a second inline card MUST NOT exist with its own badge or favorite wiring.

### Requirement: Seed adds exactly ten idempotent products

The seed MUST add exactly ten new products idempotently by slug, bringing the catalog from 20 to 30. Re-running the seed MUST NOT create duplicates: any slug already present MUST be skipped silently. New entries MUST be distributed across the five existing categories, MUST keep prices within `Bs 180–620`, and MUST set `is_new = true`.

#### Scenario: Idempotent rerun

- **GIVEN** the seed has run once and the catalog has 30 products.
- **WHEN** the seed runs again.
- **THEN** the catalog MUST still have exactly 30 products, the original 20 MUST be unchanged, and the new 10 MUST retain their original `createdAt`/`sort_order`.

### Requirement: Variant IDs are unique and `v59+`

Every variant in the new seed MUST use an id of the form `v59` or higher (e.g., `v59`, `v60`, ..., `vNN`). Variant ids MUST be globally unique across the catalog because existing mutations (`adjustStock`, `updateVariant`, `deleteVariant`) locate variants by id across products.

#### Scenario: No variant id collisions

- **GIVEN** the existing catalog with the highest variant id `v58`.
- **WHEN** the seed runs.
- **THEN** every new variant id SHALL be ≥ `v59`, no existing variant id SHALL be reused, and `adjustStock`/`updateVariant`/`deleteVariant` MUST continue to mutate the intended variant.

### Requirement: Seed image URLs are HTTP-200 verified

Every image URL added by the new seed MUST return HTTP 200 at the moment the orchestrator records the seed run. Unsplash photo-ids MUST NOT be duplicated across more than one of the ten new products (a single id MAY appear at most once across the new ten).

#### Scenario: Image URLs resolve and stay unique within the batch

- **GIVEN** the new ten products' `images[]` arrays.
- **WHEN** the orchestrator verifies each URL.
- **THEN** each URL SHALL return HTTP 200, and no Unsplash photo-id SHALL repeat across the ten new products.

### Requirement: Seed pattern and sort ordering preserved

The new entries MUST follow the existing seed pattern (block style, idempotent check on slug, `by_slug` lookup) and MUST extend `sort_order` from `21..30`. Existing product ordering MUST remain stable.

#### Scenario: Sort order is contiguous

- **GIVEN** the existing 20 products with `sort_order` ending at `20`.
- **WHEN** the seed completes.
- **THEN** the new ten products SHALL carry `sort_order` values `21, 22, ..., 30`, contiguous, with no gaps and no collisions.

### Requirement: Configuración exposes `sale_ends_at` edit

The existing `/admin/configuracion` page MUST expose a field for editing `cms_sections.sale_ends_at`. The control MUST accept an ISO date string, MUST call the existing `settings.updateSection` mutation (or an equivalent Convex mutation), MUST clear cleanly when set to an empty value, and MUST be available only to authenticated admins.

#### Scenario: Empty value disables liquidation

- **GIVEN** an authenticated admin clearing the `sale_ends_at` field.
- **WHEN** they save.
- **THEN** `cms_sections.sale_ends_at` SHALL be stored as `null`/absent, and no liquidation copy or banner SHALL render anywhere in the storefront.

These constraints apply to every requirement above; they restate the proposal's honesty checklist as normative so they survive into verification.

### Requirement: Every NUEVO, stock, price, and liquidation signal is derived from real data

The system MUST source NUEVO from `is_new`, low-stock from `variants[].stock`, the WhatsApp CTA price from the selected variant's `price` (or `base_price` fallback), and liquidation copy from the product's liquidation eligibility plus a real future `sale_ends_at`. Invented copy ("última oportunidad", "se acaba hoy", "24h antes que el público", "X acaba de comprar"), synthetic anchor prices, and any countdown mechanism are forbidden.

#### Scenario: No synthetic urgency copy anywhere

- **GIVEN** the storefront surfaces touched by this change (PDP, card, navbar, favorites, announcement bar).
- **WHEN** the DOM is inspected.
- **THEN** no invented urgency copy SHALL appear, no `setInterval` countdown SHALL run, and no synthetic social proof (e.g., "X acaba de comprar") SHALL render.

### Requirement: Favorites show live current prices, not snapshots

`/favoritos` and the heart toggle MUST always render current `base_price`, current variant price when selected, current `is_new`, current liquidation status, and current stock — fetched live from Convex. The favorites store MUST NOT serialize any of these fields.

#### Scenario: Price drop reflects on favorites

- **GIVEN** a favorited product whose `base_price` was reduced in Convex.
- **WHEN** the customer opens `/favoritos` after the change.
- **THEN** the card SHALL show the new `base_price`, not the value present at the moment the slug was favorited.

### Requirement: No fabricated trust signals

The system MUST NOT render fabricated reviews, ratings, testimonials, return/shipping policies, or stock counts. Where a stock count appears, it MUST match `variants[].stock` exactly. Where liquidation appears, it MUST satisfy the future-date gate.

#### Scenario: Stock copy matches variant data

- **GIVEN** a product with one variant at `stock = 2`.
- **WHEN** the PDP and card render.
- **THEN** the visible stock number SHALL be `2` (or the low-stock band "Quedan 2 en talle X"), and SHALL NOT be `0`, `>3`, or any invented figure.

### Requirement: Configuration change keeps liquidation messaging honest

The `sale_ends_at` field MUST be nullable. Setting it MUST enable liquidation copy only for products that already qualify through the existing liquidation category/tag, and only while the date is in the future. Clearing it MUST disable the feature with no leftover banners or stale copy.

#### Scenario: Past date is inert

- **GIVEN** `cms_sections.sale_ends_at` is set to a past ISO date.
- **WHEN** the storefront renders.
- **THEN** no liquidation copy SHALL appear, no liquidation banner SHALL appear, and the date MUST NOT be displayed in any context as if it were a future sale.

## Risks and deferred decisions

- **R1 — Legacy flat form.** The path `openspec/changes/{change}/spec.md` does not match the canonical `specs/{domain}/spec.md` convention; preserved per repo convention and the user's instruction. Archive must reconcile the shape.
- **R2 — Capability areas inferred.** The proposal lacks an explicit `Capabilities` section; the eleven areas above are inferred from the affected surfaces and the approved scope, and should be confirmed by the product owner before apply.
- **R3 — Visual acceptance criteria.** Several checks (modal focus restoration, mega-menu hover/focus state, `/favoritos` empty state visual quality) require manual QA in addition to the greps provided; `openspec/config.yaml` already names this gap.
- **R4 — Seed image freshness.** Unsplash hotlinks are external; the orchestrator's HTTP-200 check is a point-in-time verification, not a continuous guarantee. A drift here would surface as a broken `images[]` entry, not a spec violation per se.
- **R5 — `config.yaml` scope drift.** `openspec/config.yaml` currently lists `redesign-editorial-total` boundaries; this change requires scope to cover `convex/schema`, `convex/seed`, `cms_sections`, and `/admin/configuracion`. Out of scope for this spec file, but required before apply.
- **R6 — Canonical `ProductCard` refactor blast radius.** Converging two card implementations on one component touches home, catalog, and `/favoritos`. This is in scope for this change but is the largest single surface area; review budget risk may surface during apply and trigger the ask-on-risk gate.
