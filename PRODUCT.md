# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) + React 19 + Tailwind CSS 4 (CSS-first, sin `tailwind.config`) + Convex (backend / datos) + Zustand (carrito) + Cloudinary (imágenes). Checkout vía WhatsApp (sin pasarela de pago integrada todavía).

## Users

Mujer 25–45 es la **audiencia principal**, pero el catálogo es para toda la familia: mujer, varón y niños. Compradores bolivianos que buscan calzado premium-accesible con diseño editorial y entrega rápida. Valoran transparencia de precio y urgencia honesta por sobre la "liquidación masiva" barata.

## Product Purpose

E-commerce de calzado premium-accesible para toda la familia (botas, tacos, zapatillas urban/deportivas, botines, tenis, sandalias, etc.) con envío a todo Bolivia. La tienda existe para vender calidad y diseño, no para simular liquidación.

## Positioning

Marca propia **Flores** (crimson, mujer-first) frente a la competencia de liquidación amarillo-barata (arialiquidacion.com). Diferenciador honesto: diseño editorial, urgencia y escasez **reales**, y social proof verificado — nunca dark patterns.

## Operating Context

- Sedes: Santa Cruz y Cochabamba, Bolivia.
- Pagos: QR, Transferencia, Efectivo, Tigo Money.
- Envíos: ~48h a todo el país.
- Catálogo servido desde Convex (fuente única de verdad, sin mocks en cliente). Si la BD está vacía se muestra empty state; poblar vía `seed:run`.
- Modo de superficie storefront: **Persuade**.

## Capabilities and Constraints

- Catálogo completo de calzado por género (mujer / varón / niños) y por colección (drops, últimas tallas, exclusivas).
- Carrito funcional (Zustand): añadir, sumar, restar, eliminar, subtotal.
- Checkout por WhatsApp: el `CartDrawer` genera el mensaje del pedido.
- Hero en video + hover-video en cards (Opción A "Cine Sutil") implementado vía `VideoBanner`/`ProductCard` con `prefers-reduced-motion`; sin parallax pesado.
- Home rediseñado Editorial Brutalista: hero full-bleed + marquee crimson + colecciones 01/02/03 + drops con stock real (sin countdown/stats inventados, copy ES-BO).

## Brand Commitments

- **Mujer-first pero unisex**: la nav destaca Mujer; el catálogo cubre toda la familia.
- **Paleta Flores Crimson**: `--color-accent: #9B1C1C` es el principal. **Prohibido el amarillo Aria** (`#FFD700` / `#FFB300`). Anti-referencia explícita: arialiquidacion.com.
- **Tipografía**: DM Sans (body) + Playfair Display (display acento, solo headlines premium, máx. 1–2 por página). Fuentes migradas a `next/font` (swap) en Fase B.
- **Radius 0** en todos los componentes (lenguaje visual sharp).
- **Persuasión ética obligatoria**: urgencia real (countdown de oferta real), escasez real (stock real), social proof verificado, precio ancla transparente. **Prohibido**: costos ocultos, trick questions, confirmshaming, forced continuity.

- **Claim de urgencia honesta**: la comunicación de liquidación/escasez es real y verificable (stock limitado, precios de liquidación verificados, envíos ~48h a todo Bolivia). Nunca se presenta "Aria Liquidación" como marca propia; es anti-referencia de la competencia de liquidación amarilla.

## Evidence on Hand

- Tokens unificados en `src/app/globals.css` (Fase A).
- Videos reales en Cloudinary + Convex (`hero_video_url`, `vip_vault_video_url`, categorías y productos con `video_url`).
- `PROJECT_CONTEXT.md` archivado en `docs/legacy/` (legacy contradictorio). Fuente de verdad: `DESIGN.md` / `PRODUCT.md`.

## Product Principles

1. Premium-accesible, nunca "barato-falso".
2. Mujer-first, unisex por diseño.
3. Urgencia y escasez solo si son reales y verificables.
4. Transparencia total de precio y costos (sin sorpresas en el checkout).
5. Diseño editorial crimson; nunca liquidación amarilla.

## Accessibility & Inclusion

- Objetivo WCAG 2.2 AA.
- Foco visible restaurado y `prefers-reduced-motion` ya cubiertos en `globals.css` (Fase A).
- Contraste AA de los tokens verificado: `--color-text-muted: #6B6B6B` ≈ 5.6:1 sobre blanco; `--color-accent: #9B1C1C` ≈ 12.4:1 sobre blanco.
