# Proposal: Vendedora Product Detail (`ficha-producto-vendedora`)

## Intent

Make Flores product discovery and purchase decisions clearer without manufacturing urgency. Upgrade the product detail page (PDP), expose honest stock and liquidation signals, add no-login favorites, improve category navigation, and expand the seed catalog while preserving the Flores Crimson system, WCAG 2.2 AA target, WhatsApp checkout, and ES-BO voice.

The orchestrator-resolved decisions below close the exploration questions; no additional product decisions are open for this proposal.

## Source alignment

- **DESIGN.md:** apply the One-Voice crimson palette, Sharp Rule (radius 0), No-Yellow Rule, visible focus, responsive layout, and reduced-motion expectations.
- **PRODUCT.md:** preserve live Convex data as the source of truth, ES-BO copy, WCAG 2.2 AA, transparent pricing, and ethical persuasion; payment and shipping remain outside this change.

## Scope and decisions

1. **PDP purchase support**
   - Keep the existing multi-image gallery and add the ES-BO size guide in `src/lib/sizeGuide.ts` as a static category-family map. It covers Bolivian women's shoe sizes 34–41 with foot-length centimeters. The PDP opens it in a modal; a link is also available in the navbar/footer area.
   - Add related products from the same `category_slug`, falling back to the same gender, returning at most four and excluding the current product.
   - Add a direct single-product WhatsApp CTA. Build the prefilled message as: `Hola FLORES 💕 Quiero el modelo *{name}* — talle {size}{, color {color}}. Precio: Bs {price}. ¿Tienen stock?` Use the selected variant price and the CMS-aware `getWhatsAppNumber`/`fetchCMS` pattern, with shared helpers in `src/lib/whatsapp.ts`.

2. **Truthful selling signals**
   - Keep the admin-controlled `is_new` boolean as the NUEVO source of truth. The new seed batch sets it to `true`; do not derive it from timestamps.
   - Add nullable global `sale_ends_at` to `cms_sections`. For products already eligible through the existing liquidation category/tag, render `Liquidación real — hasta {date}` and a subtle banner only when the date is in the future. An absent or past date renders nothing. There is no countdown timer. Provide a minimal edit form through the existing Configuración page.
   - Treat variant stock `> 0` and `≤ 3` as low stock: show `Quedan N en talle X` on the PDP selector and a corresponding card badge. Reuse `StockBadge` where possible; retain the existing `Agotado` state for zero stock.

3. **Favorites**
   - Add `/favoritos`, marked `noindex, nofollow`, with an empty state linking to the catalog.
   - Store only product slugs in a persisted Zustand/localStorage store following the cart-store pattern. The page fetches live products by slug, so current price and availability are always shown; do not store snapshots.
   - Add accessible heart toggles to the canonical product card and PDP.

4. **Navigation**
   - Build category links from Convex categories. Provide a desktop hover mega-menu and a mobile accordion in `Navbar`.
   - Keep quick links for Novedades and Liquidación, and rename every navigation occurrence of “Ofertas” to “Liquidación”.
   - Converge the two current card implementations on one canonical `ProductCard` contract (with presentation props where needed), so badges, favorite state, accessibility, and stock logic cannot drift between home/catalog cards.

5. **Seed data**
   - Add ten products idempotently by slug, bringing the catalog from 20 to 30. Use variant IDs `v59+`, set `is_new: true`, distribute products across the five existing categories, and keep prices within Bs 180–620.
   - Use image URLs verified by the orchestrator with HTTP 200; visual quality remains a user review. Preserve the existing seed pattern and sort ordering.

6. **OpenSpec scope**
   - Refresh `openspec/config.yaml` for this change: in scope are PDP, truthful sales signals, favorites, category navigation, Convex/CMS settings needed by those features, admin configuration, and the +10 seed batch. Out of scope are payment gateway work, authentication, a reviews system, and shipping calculation.

## Impact summary

- **Customers:** clearer size selection, live price/stock context, direct product questions through WhatsApp, related discovery, and persistent favorites without account creation.
- **Storefront UX:** new responsive navigation and consistent card interactions across desktop/mobile and both existing catalog surfaces.
- **Admin/data:** one global liquidation date and existing `is_new` controls; seed data must remain idempotent and variant IDs globally unique.
- **SEO/privacy:** `/favoritos` is intentionally private/personalized and must not be indexed or followed; related products strengthen internal discovery without changing PDP canonical behavior.
- **Operations/support:** WhatsApp links must resolve to the same CMS-aware number, while existing cart checkout remains functional.

## Risks and mitigations

- **WhatsApp number inconsistency:** remove hardcoded number usage from touched PDP/guide paths and centralize resolution through `src/lib/whatsapp.ts`; preserve the existing cart message and three-step checkout behavior.
- **Card divergence:** make `ProductCard` the single canonical implementation and adapt its presentation rather than maintaining a second inline card with independent badges or favorite logic.
- **False urgency:** gate liquidation output on both product eligibility and a future `sale_ends_at`; never render a fallback date, countdown, or invented scarcity.
- **Stale favorites:** hydrate by slug from live catalog data, gracefully omit deleted/unavailable products, and show the catalog empty state when none remain.
- **Seed collisions and broken media:** reserve `v59+`, check slug idempotency, verify all new image URLs return HTTP 200, and manually review their visual suitability.
- **Minimal admin surface:** keep the setting nullable and use the existing Configuración route/mutation pattern so clearing the date cleanly disables all liquidation messaging.

## Honesty and ethics checklist

- [ ] Every NUEVO, stock, price, and liquidation signal is derived from real Convex/admin data.
- [ ] `is_new` remains an explicit admin claim; seed timestamps are never used to imply freshness.
- [ ] Liquidation copy appears only for eligible products with a real, future global end date.
- [ ] No countdown timers, invented statistics, fake policies, fabricated reviews/social proof, or misleading stock claims.
- [ ] Favorites show live current prices rather than stale snapshots.
- [ ] Price formatting uses the selected real variant price; no synthetic anchor or discount calculation is introduced.
- [ ] The UI does not imply payment, shipping, or availability guarantees that the system cannot verify.

## Success criteria

- A customer can open a PDP, choose a category-appropriate size, inspect the modal size guide, see up to four valid related products, and send the exact single-product WhatsApp inquiry with CMS-resolved number, selected size, optional color, and selected price.
- Low-stock and sold-out states match variant stock, while NUEVO and Liquidación render only under their defined data conditions.
- Favorites persist across reloads without login, hydrate live products, expose an accessible toggle on cards/PDP, and `/favoritos` is `noindex, nofollow`.
- Desktop and mobile navigation expose all Convex categories plus Novedades and Liquidación; “Ofertas” is absent from navigation copy.
- The seed is safe to rerun, produces exactly ten additional slugs with `v59+` variants and HTTP-200 images, and keeps the catalog at 30 products.
- `openspec/config.yaml` describes this change’s actual boundaries, and implementation verification can pass the repository lint/build checks plus responsive/accessibility and honesty manual checks.

## Rollback

Revert the change files, the canonical-card refactor, the favorites store/page, and the seed additions. Clear or remove the nullable `sale_ends_at` setting so liquidation UI becomes inert. Because favorites are client-local and the setting is nullable, rollback does not require destructive customer-data migration; retain existing products unless an explicit seed-data rollback is approved.
