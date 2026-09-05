# Tareas — Rediseño Editorial Total

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1.100–1.400 (additions + deletions; neto ≈ −400) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

**Fundamento:** El design §7 estima 16 archivos con ~440 líneas **netas**
(2070 → 1630), pero el cómputo de review (`additions + deletions`) supera las
400 con holgura: HomeClient es reescritura (~450 del + ~250 add ≈ 700),
ToastNotifications se elimina (~100 del) y hay 14 archivos más (~+400–600).
El gate `review_budget_lines: 400` del config NO es alcanzable en un solo PR.

**División propuesta (unidades autónomas con inicio, fin, verificación y
rollback = revert del commit):**

- **PR 1** — T1→T3: tokens + home completa + componentes base (BrandPlaceholder, ProductCard).
- **PR 2** — T4→T5: catálogo + PDP.
- **PR 3** — T6→T7: limpieza toasts/announcement/nav/footer + metadata.
- **T8** — gate de verificación final (greps + lint + build) sobre los 3 PRs.

**TDD sin runner de tests:** `strict_tdd=true` pero no hay suite (config
`testing.runner: none`); los greps del spec SON los criterios ejecutables:
correr el grep antes de cada tarea (RED, debe fallar) y después (GREEN).
QA visual (axe, overflow, carmín ≤10%) queda en T8.

## Tareas de implementación (apply)

### T1 — Tokens tipográficos y poda de utilidades en globals.css

- **Archivos:** `src/app/globals.css`
- **AC:** G1 (jerarquía Display/Headline/Title/Body/Label desde tokens),
  G2 (tokens consumidos, radius 0, sin hex fuera de globals), G7
  (prefers-reduced-motion cubre todas las animaciones restantes).

Cambios:

- [x] Agregar custom properties de escala: `--font-display: clamp(2.5rem, 6vw, 4.5rem)`, `--font-headline: 2rem`, `--font-title: 1.25rem`, `--font-body: 1rem`, `--font-label: 0.625rem` (10px). <!-- sdd-owner: implementation -->
- [x] Agregar utilities `.text-display/.text-headline/.text-title/.text-body/.text-label` y las clases aspect `aspect-editorial` (16:9), `aspect-portrait` (4:5), `aspect-product` (3:4). <!-- sdd-owner: implementation -->
- [x] Tokenizar `.btn-premium` (`#9B1C1C` → `var(--color-accent)`), agregar `--color-accent-dark: #801414`, y usar `var(--color-*)` en `.skeleton` (sin `#111111`/`#1a1a1a`). <!-- sdd-owner: implementation -->
- [x] Podar `premium-gradient-text` (→ gradiente neutro sin carmín decorativo), `animate-glow-pulse`, `animate-toast-in/out`, `animate-pulse-red` (→ `animate-pulse` nativo de Tailwind). <!-- sdd-owner: implementation -->
- [x] Verificar que `prefers-reduced-motion` cubre las animaciones restantes (sin infinite ni smooth-scroll bajo reduce). <!-- sdd-owner: implementation -->

Verificación:

```bash
grep -nE -- "--font-display|--font-headline|--font-title|--font-body|--font-label|\.text-display|\.text-label|aspect-(editorial|portrait|product)" src/app/globals.css
grep -nE "animation.*infinite" src/app/globals.css && grep -A1 "prefers-reduced-motion" src/app/globals.css || echo "OK motion"
```

Done: tokens y utilities presentes; utilidades decorativas y animaciones de
toast/glow podadas; no quedan techo Display excedido ni infinite sin reduce.
~30 líneas.

### T2 — Home: hero + marquee + BrandPlaceholder + fallback VideoBanner

- **Archivos:** `src/app/(store)/HomeClient.tsx` (hero + marquee),
  `src/components/store/BrandPlaceholder.tsx` (nuevo),
  `src/components/store/VideoBanner.tsx`
- **AC:** G1 (hero `clamp(2.5rem, 6vw, 4.5rem)`, Playfair ≤2 nodos), G4
  (marquee ES-BO sin "Liquidación"), G5 (responsive 360/768/1440), G6
  (placeholder de marca por aspecto, 0 Unsplash), G7 (reduced-motion).

Cambios:

- [x] Crear `BrandPlaceholder.tsx`: SVG inline de marca con tokens
  (`var(--color-primary)`/`var(--color-surface)`), props `aspect` (`16:9`/`4:5`/`3:4`), `label`, `variant` (`dark`/`light`). T3 lo consume en 4:5 y 3:4. <!-- sdd-owner: implementation -->
- [x] Hero: `text-[clamp(3.5rem,12vw,10rem)]` → `text-display`; `uppercase tracking-tighter` → sentence case con `tracking-tight`; overlay `from-black/70 via-black/30 to-transparent`; 1 solo Playfair (h1); subtítulo DM Sans 16px; label `── FLORES` 10px. <!-- sdd-owner: implementation -->
- [x] VideoBanner: reemplazar fallback Unsplash `photo-1542291026…` por `BrandPlaceholder aspect="16:9" variant="dark"`; mantener lógica de video y `optimizeCloudinaryVideo`. <!-- sdd-owner: implementation -->
- [x] Marquee: `MARQUEE_ITEMS` → "Novedades · Botas · Tacos · Zapatillas · Envíos a Bolivia · Pago con QR" (sin "Liquidación real"); barra en `var(--color-accent)`. <!-- sdd-owner: implementation -->
- [x] Rotación de banners vía `setInterval`: respetar `prefers-reduced-motion` (si reduce → solo primer banner, sin timer). <!-- sdd-owner: implementation -->
- [x] Copy tuteo en hero/marquee ("Compra por colección", sin "Comprá"); `font-mono` en categorías → `text-label`; sin `tracking-widest` en cuerpo. <!-- sdd-owner: implementation -->

Verificación:

```bash
grep -RnE "clamp\(3\.5rem|clamp\(.*10rem|text-\[(9|9\.5|10|10\.5|11)rem\]|text-(8xl|9xl|10xl)" "src/app/(store)/HomeClient.tsx" && echo "FAIL" || echo "OK"
grep -Rn "Liquidaci" "src/app/(store)/HomeClient.tsx" && echo "FAIL" || echo "OK"
grep -RnE "photo-[0-9]+" src/components/store/VideoBanner.tsx && echo "FAIL" || echo "OK"
grep -nE "setInterval" src/components/store/VideoBanner.tsx "src/app/(store)/HomeClient.tsx" && echo "REVISAR reduced-motion" || echo "OK sin rotación"
```

Done: hero dentro del techo Display, 1 Playfair, marquee sin liquidación,
placeholder de marca reemplaza a Unsplash. ~80 líneas.

### T3 — Home: drops + colecciones + confianza + newsletter; ProductCard honesto

- **Archivos:** `src/app/(store)/HomeClient.tsx` (drops/novedades, colecciones,
  confianza, newsletter), `src/components/store/ProductCard.tsx`
- **AC:** G3 (sin tachado inventado, sin popup 10% OFF, sin social proof),
  G4 (copy ES-BO, marca Flores), G6 (placeholders por aspecto), G2 (un acento,
  tokens, radius 0).

Cambios:

- [x] Drops/Novedades: grid de ProductCards con datos reales; eliminar `views: 12` del type `HotProduct`; `toHot()` → `originalPrice: Number(p.compare_price ?? p.base_price)` (sin `* 1.45`). <!-- sdd-owner: implementation -->
- [x] Colecciones: 3 tarjetas aspect 4:5; si `image_url` vacío → `BrandPlaceholder aspect="4:5"`; sin URLs hardcodeadas de stock. <!-- sdd-owner: implementation -->
- [x] Confianza: 3 señales honestas con lucide carmín 24px (Truck, ShieldCheck, RotateCcw) sin emojis — envío 48h Bolivia, pago QR/transferencia/efectivo, cambios 30 días con stock real; usar solo si la política real lo respalda (preguntar si 30 días no es real). <!-- sdd-owner: implementation -->
- [x] Eliminar popup exit-intent "10% OFF", sección "Bóveda VIP" y sección Social multi-acento. <!-- sdd-owner: implementation -->
- [x] Newsletter: "Recibe novedades" + input + CTA; sin "24h antes" ni "se agotan en minutos". <!-- sdd-owner: implementation -->
- [x] ProductCard: `bg-[#0E0E0E]` → `var(--color-primary)`, `border-[#9B1C1C]/40` → `var(--color-accent)/40`, badge descuento → `var(--color-accent)`; descuento/`% OFF` SOLO si `compare_price > base_price` real; `text-[8px]/[8.5px]/[9px]` → `text-label`; "Sin Imagen" → `BrandPlaceholder aspect="3:4"`. <!-- sdd-owner: implementation -->

Verificación:

```bash
grep -RnE "base_price\s*\*\s*1\.[0-9]+|compare_price\s*\?\?\s*round\(" src/app src/components && echo "FAIL" || echo "OK"
grep -RnE "10% OFF|exit.?intent|B[oó]veda" "src/app/(store)/HomeClient.tsx" && echo "FAIL" || echo "OK"
grep -RnE "text-\[([0-9](\.[0-9]+)?|6|7|7\.5|8|8\.5|9)px\]" src/components/store/ProductCard.tsx && echo "FAIL" || echo "OK"
grep -RnE "rounded-(sm|md|lg|xl|2xl|3xl|full)" src/components/store/ProductCard.tsx && echo "FAIL" || echo "OK"
```

Done: home sin precio ancla inventado ni popup; cards tokenizadas con acento
único y placeholder 3:4. ~60 líneas.

### T4 — Catálogo: ES-BO + sin ARIA + precio real

- **Archivos:** `src/app/(store)/productos/ProductsClient.tsx`
- **AC:** G1 (h1 display), G3 (sin etiqueta ARIA, sin tachado inventado, copy
  verificable), G4 (strings ES: "Novedad", "No encontramos productos…",
  "Productos disponibles", pageTitle "Ofertas"/"Novedades"/"Exclusivos"),
  G2 (bg token, radius 0).

Cambios:

- [x] h1 `text-7xl md:text-9xl` → `text-display`. <!-- sdd-owner: implementation -->
- [x] Eliminar label "ARIA" de cada card; pageTitle "Liquidación Final" → "Ofertas", "El Archivo" → "Novedades", "Bóveda Privada" → "Exclusivos". <!-- sdd-owner: implementation -->
- [x] Tachado solo con `compare_price` real (misma regla que ProductCard); sin `base_price * 1.5`. <!-- sdd-owner: implementation -->
- [x] "New" → "Novedad"; "No pieces found..." → "No encontramos productos en esta selección."; "Objetos de deseo" → "Productos disponibles". <!-- sdd-owner: implementation -->
- [x] `bg-[#F9F9F9]` → `var(--color-surface)`; `text-[8px]/[9px]` → `text-label`; sidebar categories vacías → no renderizar fallback hardcodeado. <!-- sdd-owner: implementation -->

Verificación:

```bash
grep -RniE "\baria\b|liquidaci" "src/app/(store)/productos/ProductsClient.tsx" | grep -vE "aria-(label|hidden|current|describedby|live|modal|expanded|controls|pressed|selected)" && echo "FAIL" || echo "OK"
grep -RnE "base_price\s*\*\s*1\.[0-9]+" "src/app/(store)/productos/ProductsClient.tsx" && echo "FAIL" || echo "OK"
grep -RniE "select color|out of stock|no pieces found" "src/app/(store)/productos/" && echo "FAIL" || echo "OK"
```

Done: catálogo ES-BO, sin ARIA, sin precio ancla, tokenizado. ~45 líneas.

### T5 — PDP: ES-BO + talle + descripción legible

- **Archivos:** `src/app/(store)/productos/[slug]/ProductPageClient.tsx`
- **AC:** G1 (h1 display; body 16px sentence case), G4 (voseo/inglés:
  "Elige color", "Agotado", "Elige tu talle", "¿me ayudas con el talle?",
  "Envío 48h", "Garantía Flores"), G2 (tokens bg, chips seleccionados con
  accent).

Cambios:

- [x] h1 `text-6xl md:text-8xl` → `text-display`; descripción `uppercase tracking-widest` → sentence case `text-body` DM Sans 16px/1.6 (`text-transform: none`, `letter-spacing: normal`). <!-- sdd-owner: implementation -->
- [x] Strings: "Select Color" → "Elige color"; "Out of Stock" → "Agotado"; "Express" → "Envío 48h"; "Quality" → "Garantía Flores"; "Garantía Flores Studio" → "Garantía Flores"; "Elegí tu talle" → "Elige tu talle"; "¿me ayudás con el talle?" → "¿me ayudas con el talle?". <!-- sdd-owner: implementation -->
- [x] `bg-[#F9F9F9]` → `var(--color-surface)`; chips de talle/color seleccionados `bg-black` → `bg-[var(--color-accent)] text-white`. <!-- sdd-owner: implementation -->
- [x] `text-[8px]/[9px]` → `text-label` (mínimo 10px). <!-- sdd-owner: implementation -->

Verificación:

```bash
grep -RniE "select color|out of stock|express|garantía flores studio" "src/app/(store)/productos/[slug]/ProductPageClient.tsx" && echo "FAIL" || echo "OK"
grep -RnE "(compr|pag|eleg|envi|recib|us|revis|compart|hac)[aá]s\b" "src/app/(store)/productos/[slug]/" && echo "FAIL" || echo "OK"
grep -RnE "tracking-(wide(est|r)?|widest)" "src/app/(store)/productos/[slug]/ProductPageClient.tsx" && echo "FAIL" || echo "OK"
```

Done: PDP en ES-BO tuteo, descripción legible, chips con acento único.
~40 líneas.

### T6 — Limpieza: ToastNotifications + layout + AnnouncementBar + StockBadge

- **Archivos:** `src/components/store/ToastNotifications.tsx` (eliminar),
  `src/app/(store)/layout.tsx`, `src/components/store/AnnouncementBar.tsx`,
  `src/components/store/StockBadge.tsx`
- **AC:** G3 (0 ToastNotifications/social proof; countdown solo con fecha real;
  sin amarillo), G2 (un acento: StockBadge neutro), G7 (sin rotación bajo
  reduced-motion). Popup exit-intent ya cubierto en T3.

Cambios:

- [x] Eliminar `src/components/store/ToastNotifications.tsx`; quitar import y `<ToastNotifications />` de `layout.tsx`; confirmar que `animate-toast-in/out` ya no existen (T1). <!-- sdd-owner: implementation -->
- [x] AnnouncementBar: sanitizar `bg_color` amarillo del CMS (`#E5C400/#FFD700/#FFB300/#FFC107` → `var(--color-primary)` con `text_color` blanco). <!-- sdd-owner: implementation -->
- [x] AnnouncementBar: eliminar countdown perpetuo (`countdown_end_hour`, useEffect + timer + `<Clock>`); countdown SOLO si el CMS provee `countdown_end_date` futura real; sin fecha → mensaje neutro; mantener `--announcement-height` para el offset del Navbar. <!-- sdd-owner: implementation -->
- [x] StockBadge: "Stock disponible" y dot → `var(--color-text-muted)`; eliminar glow `shadow-[0_0_8px_#10B981]`. <!-- sdd-owner: implementation -->

Verificación:

```bash
grep -RnE "ToastNotifications|acaba de comprar" src/ && echo "FAIL" || echo "OK"
grep -RnE "setInterval.*countdown|countdown_end_hour|#E5C400|#FFD700|#FFB300|#FFC107|yellow-|amber-" src/components/store/AnnouncementBar.tsx && echo "FAIL" || echo "OK"
grep -RnE "emerald|#10B981|shadow-\[0_0" src/components/store/StockBadge.tsx && echo "FAIL" || echo "OK"
```

Done: 0 referencias a ToastNotifications, announcement sin amarillo ni
countdown falso, stock neutro (un acento). ~45 líneas.

### T7 — Limpieza: Navbar + Footer + metadata (3 archivos)

- **Archivos:** `src/components/store/Navbar.tsx`, `src/components/store/Footer.tsx`,
  `src/app/(store)/page.tsx`, `src/app/(store)/productos/page.tsx`,
  `src/app/(store)/productos/[slug]/page.tsx`
- **AC:** G4 (marca Flores consistente, ES-BO sin voseo, sin inglés suelto),
  G3 (sin urgencia/escasez inventada), G6 (metadata sin "liquidación",
  og:image de marca), G2 (tokens).

Cambios:

- [x] Navbar: "🔥 Drops" → "Novedades"; "⏳ Últimas Tallas" → "Ofertas"; "💎 Exclusivas" → "Exclusivos"; eliminar badges "NUEVO"/"URGENTE", su `animate-pulse` y `text-[7.5px]`; eliminar `description` del nav ("Se acaba hoy"); `text-[10px]`/`text-[9px]` → `text-label`. <!-- sdd-owner: implementation -->
- [x] Footer: emojis (🚚🔒✅💬) → lucide carmín (Truck, Lock, ShieldCheck, MessageCircle); "100% cuero premium garantizado" → "Calidad en cada costura"; "Soporte 24/7" → "Atención por WhatsApp"; "La liquidación más grande de calzado premium en Bolivia" → "Calzado premium con stock real en Bolivia"; sección Ayuda con `href="#"` → eliminar o enlazar rutas reales; quitar `animate-pulse-red` y emojis de links catálogo; `text-[9px]/[9.5px]` → `text-label`. <!-- sdd-owner: implementation -->
- [x] Metadata home (`page.tsx`): title "Flores | Calzado premium en Bolivia"; description "Botas, tacos y zapatillas con stock real en Cochabamba y Santa Cruz. Envíos a todo Bolivia."; og:image → placeholder de marca o primera imagen real del catálogo. <!-- sdd-owner: implementation -->
- [x] Metadata catálogo (`productos/page.tsx`): title "Catálogo | Flores"; description sin "liquidación". Metadata PDP (`[slug]/page.tsx`): `fallbackDescription` "Calzado premium con stock real. Envíos a todo Bolivia." sin "liquidación". <!-- sdd-owner: implementation -->

Verificación:

```bash
grep -RnE "Flores Studio|FloresStudio|\bAria\b|aria liquidaci" src/components/store "src/app/(store)" && echo "FAIL" || echo "OK"
grep -RniE "liquidaci[oó]n|outlet" "src/app/(store)/page.tsx" "src/app/(store)/productos/page.tsx" "src/app/(store)/productos/[slug]/page.tsx" && echo "FAIL" || echo "OK"
grep -RniE "se acaba hoy|[uú]ltima oportunidad|24h antes|se agotan en minutos|por tiempo limitad[oa]" "src/app/(store)" src/components/store && echo "FAIL" || echo "OK"
grep -Pn "[\x{1F300}-\x{1F9FF}]" src/components/store/Navbar.tsx src/components/store/Footer.tsx && echo "FAIL" || echo "OK"
```

Done: navbar/footer sin emojis ni claims de urgencia; metadata marca Flores
sin liquidación. ~70 líneas.

### T8 — Verificación final: greps de marca + lint + build (gate)

- **Archivos:** ninguno (solo verificación, sin commits de código).
- **AC:** suite completa de greps del spec (G1–G7) + `npm run lint` +
  `npm run build` + QA visual (axe, overflow 360/768/1440, carmín ≤10%,
  contrastes AA, reduced-motion).

Tareas:

- [x] Ejecutar suite de greps de marca sobre todo el storefront: amarillo Aria, hex hardcodeado en componentes IN, ARIA (whitelist de atributos), ToastNotifications, "liquidación" (metadata), voseo, inglés suelto, tracking en cuerpo, tamaños sub-10px, radius positivo, Unsplash repetido ≥2 archivos, emojis en Navbar/Footer → 0 fallos. <!-- sdd-owner: implementation -->
- [x] `npm run lint` → 0 errors y `npm run build` → success (typecheck incluido). <!-- sdd-owner: implementation -->
- [x] QA manual/DevTools: `scrollWidth − innerWidth = 0` en 360/768/1440 (home/catálogo/PDP); Playfair ≤2 nodos por página; píxeles carmín ≤10% a 1440×900; contraste AA de `--color-text-muted` (#6B6B6B) y `--color-accent` (#9B1C1C) sobre blanco; `prefers-reduced-motion` sin animaciones infinitas ni rotación de banners. <!-- sdd-owner: implementation -->

Verificación:

```bash
npm run lint && npm run build
grep -RniE "#FFD700|#FFB300|#FFC107|#E5C400|aria liquidaci" src/ && echo "FAIL" || echo "OK"
grep -RnE "#[0-9A-Fa-f]{6}\b" src/components/store "src/app/(store)" | grep -vE "globals.css|://|\.(svg|png|jpg|webp|ico)" && echo "FAIL" || echo "OK"
grep -Rn "ToastNotifications" src/ && echo "FAIL" || echo "OK"
grep -RnE "photo-[0-9]+-[a-f0-9]+" src/app src/components | sort | uniq -c | awk '$1>1 {print "FAIL repetida"}'
```

Done: gates superados; si un grep falla, el fix va en la tarea dueña, no en
T8.

## Tareas del ciclo de vida (orquestador)

- [ ] Post-apply bounded review por PR (revisar por tarea si el diff del PR supera 400 líneas). <!-- sdd-owner: parent -->
- [ ] Confirmar con el usuario la estrategia de cadena (config `chain_strategy: deferred` → `pending` hasta confirmación; opciones: size-exception revisando por tarea o feature-branch-chain PR1→PR2→PR3 hacia main) antes de aplicar el PR 1. <!-- sdd-owner: parent -->
- [ ] Al cerrar los 3 PRs: pasar el gate verify (T8), syncear DESIGN.md/PRODUCT.md si lo implementado los supera y archivar `openspec/changes/redesign-editorial-total` → `openspec/archive/`. <!-- sdd-owner: parent -->
## Decisión size:exception
- El usuario aceptó explícitamente aplicar todo directo en la rama (sin PRs encadenados). delivery_strategy: exception-ok.
