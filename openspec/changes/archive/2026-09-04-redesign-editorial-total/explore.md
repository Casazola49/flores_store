# Explore — Rediseño Editorial Total (redesign-editorial-total)

Fase: solo lectura. Inventario del storefront actual (`main` @ 8745d80 scaffold) contra
`DESIGN.md` + `PRODUCT.md`. Fuente de verdad: `DESIGN.md` / `PRODUCT.md`.
Alcance IN: storefront visual. OUT: Convex, admin, carrito/checkout, API, next.config.

## Respuestas al encargo

### (1) Textos desalineados o con escala inconsistente

- **Escala display violada (P1).** El hero usa `text-[clamp(3.5rem,12vw,10rem)]`
  (`HomeClient.tsx`), contra el token display de DESIGN.md `clamp(2.5rem,6vw,4.5rem)`.
  Los `h2` usan `text-5xl md:text-8xl` / `text-4xl md:text-6xl` / `text-5xl md:text-7xl`
  (Drops, Bóveda, Newsletter, Social) — todos por encima de la escala `Headline ~2rem`.
- **Regla tipográfica One-Voice (type) rota (P1).** La home renderiza ≥6 headlines Playfair
  (hero h1, Drops h2, Bóveda h2, Categorías h2, Newsletter h2, Social h2). DESIGN.md limita
  Playfair a 1–2 headlines premium por página.
- **Cuerpo tratado como label (P1).** Subtítulos y párrafos usan `tracking-widest /
  tracking-wider + leading-loose + uppercase` en texto corrido (hero subtitle, descripciones
  de sección). DESIGN.md: body DM Sans 400/16px/1.6, ~65–75ch; el tracking amplio uppercase
  es para labels 10–12px.
- **Tamaños de label por debajo del mínimo (P2).** Abundan `text-[8px]`, `text-[9px]`,
  `text-[7.5px]` en labels de nav, badges y footer; DESIGN.md fija label 10–12px.
- **Descripción PDP en uppercase (P1).** `ProductPageClient.tsx` renderiza la descripción
  larga del producto con `uppercase tracking-widest leading-loose` — ilegible y fuera de la
  voz body.
- **Mixture tipográfica.** `font-mono` aparece en categorías/social (fuente no declarada en
  el sistema; DESIGN.md usa DM Sans para labels).

### (2) Botones/elementos fuera de lugar o que sobran

- **Toasts de social proof falso (P0) — sobran y violan ética.** `ToastNotifications.tsx`
  genera nombres, ciudades y productos aleatorios ("acaba de comprar"). Remover.
- **Popup exit-intent "10% OFF" (P0).** Incentivo no respaldado por CMS/BD real (no existe
  clave de descuento en `cms_sections` seed); "Invitación Especial" es urgencia inventada.
  Remover o condicionar a un descuento real.
- **Countdown perpetuo (P0).** `AnnouncementBar.tsx` reinicia diario a `countdown_end_hour`
  (default "24" → medianoche). DESIGN.md: countdown solo si la oferta es real con fecha fin
  real. Además el fondo default del CMS es `#E5C400` (amarillo) — viola No-Yellow Rule.
- **Nav con emojis y badges de urgencia (P1).** `🔥 Drops`, `⏳ Últimas Tallas` con badge
  "URGENTE"/"Se acaba hoy", `💎 Exclusivas` — anti-editorial y urgencia inventada.
- **Sección social multi-acento (P1).** Hover por red (emerald/blue/pink/cyan) rompe
  One-Voice Rule (un solo acento carmín); íconos emoji; "[ SOPORTE 24/7 ]" no verificado.
- **Newsletter sin acción (P2).** `Quiero Acceso Exclusivo →` no está conectado; copy
  "Los mejores pares siempre se agotan en minutos" es escasez inventada.
- **Footer "Ayuda" con `href="#"` muertos (P2).** Enlaces sin destino.
- **Rotación de banners vía `setInterval` (P2).** No respeta `prefers-reduced-motion`
  (la regla CSS no detiene el intervalo JS que alterna videos del hero).

### (3) Imágenes/placeholders débiles o repetidos

- **Fallback Unsplash repetido (P1).** `photo-1542291026-7eec264c27ff` (zapatilla roja) se
  repite en: `VideoBanner.FALLBACK`, fallback de `ProductsClient`, OG image de home y parte
  del seed. `CAT_FALLBACK.default` usa `photo-1614252235316…` (loafer) duplicada también.
- **CAT_FALLBACK duplicado (P2).** `zapatillas` y `zapatillas-deportivas` apuntan a la misma
  URL en `HomeClient.tsx`.
- **Sin placeholder de marca (P2).** Cuando falta imagen se usa Unsplash genérico; un
  rediseño editorial debería tener placeholder tokenizado "Flores" (tinta/hueso, sin foto
  stock repetida).
- **Métrica muerta (P3).** `toHot` fuerza `views: 12` (social proof falso, hoy no renderizado
  pero presente como código muerto).

### (4) Persuasión ética / voz ES-BO

- **Precio ancla inventado (P0).** `HomeClient.tsx` `toHot` calcula
  `originalPrice = compare_price ?? round(base_price*1.45)`; `ProductsClient.tsx` tacha
  `base_price*1.5`. Solo debe tacharse `compare_price` real (como ya hace el PDP).
- **Social proof falso (P0).** `ToastNotifications` (ver §2).
- **Urgencia/escasez no verificada (P1).** "Se acaba hoy" (nav), "Liquidación Final"
  (título página sale), "24 horas antes que el público", "Los mejores pares se agotan en
  minutos", footer "la liquidación más grande de calzado premium en Bolivia".
- **Voz ES-BO inconsistente (P1).** Voseo ("Comprá", "Pagá", "Elegí tu talle", "¿me ayudás
  con el talle?") mezclado con tuteo ("Únete", "Recibe", "Cancela", "Conéctate", "Accede",
  "Quiero Acceso"). Normalizar a un registro ES-BO documentado.
- **Inglés suelto (P1).** "Select Color", "Out of Stock", "New", "Quality", "Express",
  "No pieces found in this archive selection".
- **Etiqueta "ARIA" en cada card (P0).** `ProductsClient.tsx` imprime "ARIA" junto al
  nombre del producto — referencia a la competencia anti-referencia; debe ser "Flores" o
  eliminarse.
- **Naming "Flores Studio" (P3).** `ProductPageClient` dice "Garantía Flores Studio";
  inconsistente con la marca "Flores".
- **StockBadge OK (mantener).** Usa stock real por umbrales — alineado a ética. Único matiz:
  "Stock disponible" en `emerald-500` introduce un segundo acento (One-Voice); considerar
  neutro/tinta.

### (5) Archivos que toca un rediseño agresivo y cuáles no

**Toca (IN — storefront visual):**

| Archivo | Acción |
|---|---|
| `src/app/globals.css` | Tokens de escala tipográfica; `.btn-premium*` a `var(--color-accent)` (hoy hardcodea `#9B1C1C`/`#801414`); podar utilidades decorativas (`premium-gradient-text` incluye carmín, skeleton dark override, animate-glow-pulse, etc.); auditar reduced-motion. |
| `src/app/(store)/HomeClient.tsx` | Escala display a token; Playfair a 1–2; quitar `toHot` 1.45; newsletter/social/popup (ética + un acento); copy ES-BO. |
| `src/app/(store)/productos/ProductsClient.tsx` | Tokenizar (grays, `#F9F9F9`, bg-white); quitar "ARIA"; quitar tachado `base*1.5`; títulos neutrales; copy ES-BO; empty state en español. |
| `src/app/(store)/productos/[slug]/ProductPageClient.tsx` | Tokenizar; descripción en sentence case; strings ES-BO; estado seleccionado coherente (chips accent-light); "Garantía Flores" (no Studio). |
| `src/components/store/ProductCard.tsx` | Tokenizar (`#0E0E0E`, `#9B1C1C`); descuento solo con `compare_price` real; mantener hover-video. |
| `src/components/store/Navbar.tsx` | Quitar emojis y badges de urgencia inventada; copy ES-BO; consistencia de acento. |
| `src/components/store/Footer.tsx` | Virtudes con íconos de sistema (no emoji); enlaces reales o quitar; tono; quitar superlativo no verificado. |
| `src/components/store/AnnouncementBar.tsx` | Quitar countdown perpetuo (o exigir fecha fin real); forzar tokens de marca (ignorar `bg_color` amarillo del CMS o sanitizar). |
| `src/components/store/ToastNotifications.tsx` | **Remover** (social proof falso) o reemplazar por datos verificados. |
| `src/components/store/VideoBanner.tsx` | Fallback de marca (no Unsplash repetido). |
| `src/app/(store)/page.tsx`, `productos/page.tsx`, `productos/[slug]/page.tsx` | Metadata/copy (OG image fallback Unsplash, claims de liquidación). |
| `src/components/store/StockBadge.tsx` | Menor: "Stock disponible" a neutro/tinta (un acento). |

**No toca (OUT):**

- `convex/**` (schema, products, settings, banners, seed, auth, orders) — backend/datos.
  Nota: el amarillo `#E5C400` y el seed de `compare_price` viven aquí; se neutralizan solo
  desde componentes (o se pide seed aparte, fuera de alcance).
- `src/lib/store.ts` (carrito Zustand), `src/lib/api.ts`, `src/lib/whatsapp.ts`.
- `src/components/store/CartDrawer.tsx`, `WhatsAppButton.tsx` (carrito/checkout).
  Nota: `CartDrawer` hardcodea `#25D366` (verde WhatsApp) y WhatsAppButton `#9B1C1C` — fuera
  de alcance, solo se reporta.
- `src/app/admin/**`, `src/app/api/**`, `next.config.ts`, `src/components/providers/**`,
  `database/`.

## Findings priorizados (input para proposal)

- **P0 (bloquea marca/ética):**
  1. Remover `ToastNotifications` (social proof fabricado).
  2. Eliminar precios ancla inventados (`base*1.45` en Home, `base*1.5` en catálogo).
  3. Eliminar "ARIA" de las cards del catálogo.
  4. Neutralizar amarillo del anuncio (`#E5C400`) y countdown perpetuo.
  5. Colapsar multi-acento de la sección social + emojis a un solo acento carmín.
- **P1 (sistema visual/tipografía):**
  6. Hero y h2 a escala display de DESIGN.md; Playfair a 1–2 headlines por página.
  7. Body en DM Sans sentence case; reservar uppercase/tracking para labels.
  8. Tokenizar todos los hex hardcodeados en componentes store.
- **P2 (voz/copy):**
  9. Normalizar registro ES-BO (voseo) y eliminar strings en inglés.
  10. Reescribir copy de urgencia/escasez no verificada.
- **P3 (visuales/placeholders):**
  11. Placeholder de marca en lugar de Unsplash repetido.
  12. Enlaces footer sin `#`; naming "Flores" consistente.

## Verificación manual disponible

- `npm run lint` y `npm run build` (sin tests unitarios).
- Greps de marca: sin `#FFD700`/`#FFB300`/`#FFC107`/`#E5C400`; sin hex hardcodeado en
  componentes; contraste AA de tokens; radius 0; Playfair ≤2 por página; acento ≤10%.
