# Spec — Rediseño Editorial Total

## Estado

- **Aprobada en fase spec** sobre `proposal.md` aprobada.
- Change: `redesign-editorial-total` · Branch: `redesign/editorial-total`.
- Forma legacy flat (`openspec/changes/{change}/spec.md`) por instrucción del
  orquestador; convención canónica `specs/{domain}/spec.md` (ver R1).
- Fuentes de verdad: `DESIGN.md` (tokens, Named Rules) + `PRODUCT.md` (voz, AA).
- Named Rules operacionalizadas como AC: No-Yellow, One-Voice (color y type),
  Sharp, Ethical Persuasion, WCAG 2.2 AA.

## Alcance

- **IN:** storefront visual — home (`src/app/(store)/HomeClient.tsx`,
  `page.tsx`), catálogo (`productos/ProductsClient.tsx`, `productos/page.tsx`),
  PDP (`productos/[slug]/ProductPageClient.tsx`, `productos/[slug]/page.tsx`),
  `src/components/store/*`, tokens `src/app/globals.css`.
- **OUT:** Convex (`convex/**`), admin, carrito/checkout (`CartDrawer`,
  `WhatsAppButton`, `src/lib/store.ts`), API, `next.config.ts`, providers,
  autenticación, `database/`.

---

## Grupo 1 — Tokens tipográficos reales

### Requirement: Jerarquía Display / Headline / Title / Body / Label desde tokens

El sistema MUST consumir la jerarquía de `DESIGN.md` § Typography.Hierarchy
(`Display` Playfair ≤ 4.5rem, `Headline` ≈ 2rem, `Title` ≈ 1.25rem, `Body`
16px/1.6, `Label` 10–12px). Ningún componente MAY exceder el techo Display ni
tratar un `h2` como Display.

#### Scenario: Hero dentro del techo Display
- **GIVEN** los breakpoints 360px, 768px y 1440px.
- **WHEN** se renderiza el `h1` del hero.
- **THEN** el `font-size` SHALL estar en `clamp(2.5rem, 6vw, 4.5rem)` (±0.1rem) y SHALL NOT exceder `4.5rem`.
```bash
grep -RnE "text-\[(9|9\.5|10|10\.5|11)rem\]|text-(8xl|9xl|10xl)" src/app src/components \
  && echo "FAIL: display fuera de token" || echo "OK: hero dentro del techo display"
```

### Requirement: Cero Playfair fuera del rol Display premium

El sistema SHALL usar Playfair Display solo en headlines premium y SHALL NOT
aplicarlo a Headline/Title/Body/Label. SHALL haber ≤2 nodos visibles con
`font-family: 'Playfair Display'` por página en `/`, `/productos`,
`/productos/[slug]`.

#### Scenario: Conteo de Playfair por página
- **GIVEN** DevTools en home/catálogo/PDP.
- **WHEN** se filtran nodos cuyo `font-family` contiene `Playfair Display`.
- **THEN** SHALL haber ≤ 2 nodos visibles por página, todos `h1`/`h2` premium.
```bash
grep -Rnc "font-serif" src/app/(store) src/components/store \
  | awk -F: '{ if ($2>4) print "FAIL "$0; else print "OK "$0 }'
```

### Requirement: Body en DM Sans sentence case

El sistema MUST renderizar texto corrido en DM Sans `16px`/`1.6`, sin
`uppercase` ni tracking amplio. `uppercase + tracking` SHALL estar reservado
a labels `10–12px`.

#### Scenario: Body legible sin uppercase tracking
- **GIVEN** un producto en `/productos/[slug]` y secciones de home/catálogo.
- **WHEN** se inspeccionan descripción larga y subtítulos.
- **THEN** `font-family` SHALL ser DM Sans, `font-size` SHALL ser `16px`, `text-transform` SHALL ser `none`, `letter-spacing` SHALL ser `normal`.
```bash
grep -RnE "tracking-(wide(est|r)?|widest)" src/app/(store) src/components/store \
  | grep -vE "label|badge|nav|btn|chip|tag|footer-nav|skip-link|announcement" \
  && echo "FAIL: tracking en cuerpo" || echo "OK: tracking reservado a labels"
```

### Requirement: Labels 10–12px mínimo

El sistema SHALL usar labels entre `10px` y `12px` y SHALL NOT presentar
labels por debajo de `10px`. Peso SHALL ser `700`–`900`.

#### Scenario: Labels dentro del rango mínimo
- **GIVEN** `Navbar`, `Footer`, badges, chips y tags.
- **WHEN** se mide `font-size` de cada nodo label.
- **THEN** SHALL ser ≥ `10px` y ≤ `12px`.
```bash
grep -RnE "text-\[([0-9](\.[0-9]+)?|6|7|7\.5|8|8\.5|9)px\]" src/app src/components \
  | grep -vE "globals.css|focus-visible|skip-link" \
  && echo "FAIL: tamaño sub-10px" || echo "OK: sin tamaños sub-10px"
```

---

## Grupo 2 — Sistema de color y forma

### Requirement: Un solo acento carmín ≤ 10%, sin amarillo Aria

El sistema MUST mantener `--color-accent` (`#9B1C1C`), `--color-accent-bright`
(`#C1272D`) y `--color-accent-light` (`#FEE2E2`) como única voz cromática. El
porcentaje de píxeles carmín SHALL ser ≤ 10% en home/catálogo/PDP a 1440px. No
SHALL aparecer `#FFD700`, `#FFB300`, `#FFC107`, `#E5C400` en storefront. El
`StockBadge` SHALL consumir `var(--color-accent)` o `var(--color-text)` y
SHALL NOT introducir un segundo acento (verde/azul/amarillo).

#### Scenario: Sin amarillo Aria y acento ≤ 10%
- **GIVEN** el build de producción y home/catálogo/PDP a 1440×900.
- **WHEN** se buscan hex amarillos Aria y se cuantifica el porcentaje de píxeles en el rango carmín (`#9B1C1C` ±10% HSL).
- **THEN** SHALL haber 0 ocurrencias de `#FFD700`, `#FFB300`, `#FFC107`, `#E5C400`, `aria liquidaci`; SHALL haber ≤ 10% píxeles carmín (QA visual: DevTools Layers / PixInsight).
```bash
grep -RniE "#FFD700|#FFB300|#FFC107|#E5C400|aria liquidaci" src/ \
  && echo "FAIL: amarillo Aria" || echo "OK: sin amarillo Aria"
```

### Requirement: Tokens consumidos, hex no hardcodeados

El sistema SHALL consumir `var(--color-*)` desde `src/app/globals.css`.
Componentes IN SHALL NOT contener literales hex (`#xxxxxx`) en JSX/TSX. La
única excepción admitida es `src/app/globals.css`.

#### Scenario: Sin hex hardcodeado en componentes IN
- **GIVEN** `src/components/store/` y `src/app/(store)/`.
- **WHEN** se buscan literales hex.
- **THEN** SHALL haber 0 ocurrencias fuera de `globals.css`.
```bash
grep -RnE "#[0-9A-Fa-f]{6}\b" src/components/store src/app/(store) \
  | grep -vE "globals.css|^[^:]+://|\.(svg|png|jpg|webp|ico)" \
  && echo "FAIL: hex hardcodeado" || echo "OK: storefront tokenizado"
```

### Requirement: Radius 0 (Sharp Rule)

El sistema SHALL usar `radius: 0` en todos los componentes IN. Excepción única
ya documentada: badge contador del carrito (OUT de alcance).

#### Scenario: Sin radius positivo en componentes IN
- **GIVEN** cualquier componente de `src/components/store/` o `src/app/(store)/`.
- **WHEN** se inspecciona `border-radius` computado.
- **THEN** SHALL ser `0px`.
```bash
grep -RnE "rounded-(sm|md|lg|xl|2xl|3xl|full)" src/components/store src/app/(store) \
  && echo "FAIL: radius positivo" || echo "OK: radius 0"
```

---

## Grupo 3 — Persuasión ética verificable

### Requirement: Sin social proof sintético

El sistema SHALL NOT generar, importar ni renderizar nombres aleatorios de
compradores, ciudades inventadas ni "X acaba de comprar". `ToastNotifications`
SHALL NOT existir como importación ni render en storefront.

#### Scenario: `ToastNotifications` removido del bundle
- **GIVEN** el build de producción.
- **WHEN** se buscan referencias a `ToastNotifications` o `acaba de comprar`.
- **THEN** SHALL haber 0 ocurrencias en `src/app/(store)` y `src/components/store`.
```bash
grep -RnE "ToastNotifications|acaba de comprar" src/app/(store) src/components/store \
  && echo "FAIL: social proof sintético" || echo "OK: ToastNotifications removido"
```

### Requirement: Sin precio ancla inventado

El sistema SHALL mostrar tachado (`compare_price`) solo cuando el CMS provea un
`compare_price` real. SHALL NOT calcular tachado desde `base_price * factor`
(`* 1.45`, `* 1.5`, etc.).

#### Scenario: Tachado solo con `compare_price` real
- **GIVEN** productos con y sin `compare_price` real.
- **WHEN** se renderizan sus `ProductCard`.
- **THEN** sin `compare_price` SHALL NOT renderizar tachado, "% OFF" calculado ni savings derivado; con `compare_price > base_price` SHALL renderizar el tachado con el valor exacto del registro.
```bash
grep -RnE "base_price\s*\*\s*1\.[0-9]+|compare_price\s*\?\?\s*round\(" src/app src/components \
  && echo "FAIL: precio ancla calculado" || echo "OK: sin precio ancla inventado"
```

### Requirement: Sin countdown perpetuo ni fecha inventada

El sistema SHALL mostrar countdown solo si la fuente provee `ends_at` real y
verificable. Sin fecha real o con fecha pasada, SHALL ocultar el countdown y
mostrar anuncio neutro sin amarillo. El fondo del `AnnouncementBar` SHALL
provenir de tokens de marca y SHALL neutralizar `bg_color` amarillo del CMS.

#### Scenario: Countdown condicionado a fecha real
- **GIVEN** `AnnouncementBar` con `ends_at` futuro válido o sin `ends_at`/pasado.
- **WHEN** se monta el componente.
- **THEN** con fecha válida SHALL renderizar el countdown con la fecha del CMS; sin fecha SHALL ocultar el countdown y mostrar mensaje neutro sin amarillo.
```bash
grep -RnE "setInterval.*countdown|countdown_end_hour|#E5C400|#FFD700|#FFB300|#FFC107|yellow-|amber-" \
  src/components/store/AnnouncementBar.tsx \
  && echo "FAIL: countdown perpetuo o amarillo" \
  || echo "OK: AnnouncementBar condicionado a fecha real"
```

### Requirement: Sin etiqueta "ARIA" ni claims de urgencia no verificables

El sistema SHALL NOT renderizar la cadena `ARIA` (ni `Aria Liquidación`, etc.)
asociada a productos/marcas/claims. SHALL NOT mostrar copy de "liquidación
total", "se acaba hoy", "última oportunidad", "24h antes que el público",
"los mejores pares se agotan en minutos" ni equivalentes sin respaldo de dato
real (stock o fecha del CMS).

#### Scenario: Catálogo sin ARIA y copy verificable
- **GIVEN** el render de `ProductsClient` y todas las superficies de home/catálogo/PDP.
- **WHEN** se inspecciona el DOM y se busca copy de urgencia/escasez.
- **THEN** SHALL NOT aparecer `ARIA` ni variantes (excluyendo atributos ARIA de accesibilidad: `aria-label`, `aria-hidden`, `aria-current`, `aria-describedby`, `aria-live`, `aria-modal`, `aria-expanded`, `aria-controls`, `aria-pressed`, `aria-selected`); los claims de urgencia SHALL aparecer únicamente donde exista dato real que los respalde.
```bash
grep -RniE "\baria\b|aria liquidaci" src/app/(store) src/components/store \
  | grep -vE "aria-(label|hidden|current|describedby|live|modal|expanded|controls|pressed|selected)|^[^:]+://|//" \
  && echo "FAIL: referencia Aria" || echo "OK: sin referencia Aria"
grep -RniE "liquidaci[oó]n (final|total|m[aá]s grande)|se acaba hoy|[uú]ltima oportunidad|24h antes|se agotan en minutos|se termina en|por tiempo limitad[oa]" \
  src/app/(store) src/components/store \
  && echo "FAIL: urgencia no verificable" || echo "OK: copy verificable"
```

---

## Grupo 4 — Voz ES-BO

### Requirement: Registro español boliviano neutro

El sistema SHALL mantener español boliviano neutro sin voseo rioplatense
(terminaciones `-ás/-és/-ís` para 2.ª persona singular), sin tuteo mezclado
con voseo, sin uso de «vos» con conjugación rioplatense.

#### Scenario: Sin voseo rioplatense
- **GIVEN** cualquier string visible en `src/app/(store)` y `src/components/store`.
- **WHEN** se buscan terminaciones verbales de voseo.
- **THEN** SHALL haber 0 ocurrencias.
```bash
grep -RnE "(compr|pag|eleg|envi|recib|us|revis|compart|hac)[aá]s\b|[aá]s (tu|el|este|lo|los)" \
  src/app/(store) src/components/store \
  && echo "FAIL: voseo rioplatense" || echo "OK: sin voseo"
```

### Requirement: Sin strings sueltos en inglés

El sistema SHALL mantener textos visibles en español. Cadenas en inglés SHALL
limitarse a nombres propios de marca, tallas (`S`/`M`/`L`/`XL`), unidades
técnicas no traducibles o atributos `data-*`. Frases comunes SHALL NOT
aparecer: `select color`, `out of stock`, `no pieces found`, `quick view`,
`free shipping`, `sign up`/`in`, `log in`, `checkout`, `newsletter email`,
`express shipping`.

#### Scenario: Copy en español
- **GIVEN** strings visibles de home/catálogo/PDP.
- **WHEN** se buscan cadenas en inglés fuera de whitelist.
- **THEN** SHALL haber 0 ocurrencias de las frases listadas.
```bash
grep -RniE "select color|out of stock|no pieces found|quick view|free shipping|sign up|sign in|log in|checkout|newsletter email|express shipping" \
  src/app/(store) src/components/store \
  && echo "FAIL: inglés suelto" || echo "OK: copy en español"
```

### Requirement: Naming de marca consistente

El sistema SHALL nombrar la marca propia `Flores` en cards, footer, PDP y
metadata. No SHALL aparecer `Flores Studio`, `Aria Liquidación`, ni variantes
`Aria*`.

#### Scenario: Naming consistente
- **GIVEN** superficies de storefront y objetos `metadata` de páginas.
- **WHEN** se busca el nombre de marca.
- **THEN** SHALL aparecer `Flores` y SHALL NOT aparecer `Flores Studio` ni variantes `Aria*`.
```bash
grep -RnE "Flores Studio|FloresStudio" src/app/(store) src/components/store \
  && echo "FAIL: 'Flores Studio'" || echo "OK: marca Flores consistente"
```

---

## Grupo 5 — Responsive 360 / 768 / 1440

### Requirement: Drama editorial responsivo

El sistema SHALL mantener la composición legible y sin overflow horizontal en
`360px` (móvil), `768px` (tablet) y `1440px` (escritorio). El hero SHALL
ajustar su escala según el token Display (`clamp(2.5rem, 6vw, 4.5rem)`).

#### Scenario: Sin overflow horizontal
- **GIVEN** home/catálogo/PDP en 360px, 768px y 1440px.
- **WHEN** se mide `document.documentElement.scrollWidth - window.innerWidth`.
- **THEN** SHALL ser `0` en cada combinación.

#### Scenario: Tipografía legible en 360px y composición en 1440px
- **GIVEN** la home en viewport `360px` y `1440px`.
- **WHEN** se inspecciona el hero y la composición del hero + secciones.
- **THEN** a 360px SHALL haber `font-size` ≥ `40px` sin truncado ni overflow; a 1440px SHALL mantener proporción editorial sin huecos excesivos ni texto aislado a una columna.
```bash
grep -RnE "h-\[(6|7|8|9|10)00px\]|min-h-\[(7|8|9|10)00px\]" src/app/(store) src/components/store \
  && echo "FAIL: altura fija" || echo "OK: alturas fluidas"
# QA visual: medir scrollWidth vs innerWidth en 360/768/1440
```

### Requirement: Body 16px y labels 10–12px en todos los breakpoints

El sistema SHALL mantener `font-size` mínimo de `16px` (body) y `10–12px`
(labels) en 360/768/1440. Los labels SHALL NOT depender de `uppercase +
tracking` para ser legibles.

#### Scenario: Mínimo de body 16px en móvil
- **GIVEN** la home en viewport `360px`.
- **WHEN** se inspecciona cualquier párrafo o descripción.
- **THEN** SHALL ser ≥ `16px`.

---

## Grupo 6 — Placeholders intercambiables por aspecto

### Requirement: Placeholders de marca por aspect ratio

El sistema SHALL usar un sistema de placeholders por **aspect ratio** (no por
URL fija ni foto de stock repetida) cuando falte imagen real del CMS. Los
placeholders SHALL consumir tokens de marca (tinta/hueso/papel) y SHALL ser
intercambiables por `aspect-{square|portrait|landscape|video}`. Componentes
IN SHALL NOT depender de Unsplash hardcodeado como fallback.

#### Scenario: Placeholders por aspecto sin Unsplash duplicado
- **GIVEN** un producto sin `image_url`/`video_url` y superficies de home/catálogo/PDP.
- **WHEN** se renderiza el componente y se buscan URLs de Unsplash hardcodeadas en todo `src/`.
- **THEN** SHALL renderizarse un placeholder de marca cuya forma SHALL corresponder al `aspect-*` solicitado (`square`, `portrait`, `landscape`, `video`); SHALL haber 0 photo-id de Unsplash repetido en ≥ 2 archivos distintos.
```bash
grep -RnE "photo-[0-9]+-[a-f0-9]+" src/app src/components \
  | awk -F: '{print $1":"$2":"$3}' | sort | uniq -c | sort -rn \
  | awk '$1>1 {print "FAIL: foto repetida"; fail=1} END {if(!fail) print "OK: sin Unsplash duplicado"}'
```

### Requirement: OG image y metadata consistentes

El sistema SHALL usar `og:image` y metadata (`title`, `description`)
consistentes con la marca `Flores` y la dirección editorial. SHALL NOT usar
imágenes de Unsplash genéricas ni copy de liquidación como metadata.

#### Scenario: Metadata sin claims de liquidación
- **GIVEN** `src/app/(store)/page.tsx`, `src/app/(store)/productos/page.tsx` y `src/app/(store)/productos/[slug]/page.tsx`.
- **WHEN** se inspecciona el objeto `metadata` exportado.
- **THEN** `title` y `description` SHALL NO contener `liquidación`, `outlet`, `descuento` no verificable y SHALL mencionar la marca `Flores`.
```bash
grep -RniE "liquidaci[oó]n|outlet|descuento" \
  src/app/(store)/page.tsx src/app/(store)/productos/page.tsx \
  src/app/(store)/productos/\[slug\]/page.tsx \
  && echo "FAIL: liquidación en metadata" || echo "OK: metadata consistente"
```

---

## Grupo 7 — Accesibilidad y motion

### Requirement: Contraste AA verificable

El sistema SHALL mantener ratios WCAG 2.2 AA: texto normal ≥ `4.5:1`,
`--color-text-muted` (`#6B6B6B`) sobre blanco ≈ `5.6:1`, `--color-accent`
(`#9B1C1C`) sobre blanco ≈ `12.4:1`.

#### Scenario: Texto muted y acento pasan AA
- **GIVEN** los tokens de `src/app/globals.css`.
- **WHEN** se mide contraste de `#6B6B6B` y `#9B1C1C` sobre `#FFFFFF`.
- **THEN** SHALL ser ≥ `4.5:1` en ambos casos (QA visual: axe DevTools / Lighthouse, 0 issues críticos en home/catálogo/PDP).

### Requirement: Foco visible WCAG 2.4.7

El sistema SHALL mantener `:focus-visible` con doble anillo (`bg` + carmín)
sobre todos los elementos interactivos, visible en superficie clara y oscura.

#### Scenario: Foco visible al tabular
- **GIVEN** navegación con teclado desde el skip-link.
- **WHEN** se tabula por links y botones.
- **THEN** SHALL verse un anillo de foco consistente con contraste ≥ `3:1` respecto al fondo adyacente.

### Requirement: `prefers-reduced-motion` respetado

El sistema SHALL respetar `prefers-reduced-motion: reduce` desactivando
animaciones infinitas y `scroll-behavior: smooth`. La rotación de banners vía
`setInterval` SHALL detenerse bajo esta preferencia.

#### Scenario: Sin motion bajo reduced-motion
- **GIVEN** el SO configurado con `prefers-reduced-motion: reduce`.
- **WHEN** se cargan home/catálogo/PDP.
- **THEN** SHALL NO haber animaciones infinitas (`pulse`, `glow-pulse`, `slow-zoom`, `ticker`, `shimmer`), SHALL NO haber `scroll-behavior: smooth` y SHALL NO haber rotación automática de banners.

```bash
grep -nE "animation.*infinite" src/app/globals.css \
  && grep -A1 "prefers-reduced-motion" src/app/globals.css \
  || echo "OK: motion CSS respeta reduced-motion"
grep -RnE "setInterval" src/components/store \
  && echo "REVISAR: setInterval debe chequear prefers-reduced-motion" \
  || echo "OK: sin rotación por intervalo"
```

---

## Riesgos heredados

- **R1 — Forma legacy flat.** El path heredado `openspec/changes/{change}/spec.md` no coincide con la convención canónica `specs/{domain}/spec.md`; se conserva por instrucción del orquestador y debe mapearse en `archive`.
- **R2 — AC visuales y greps con whitelist.** AC como "carmín ≤10%" y "sin overflow" requieren QA visual (axe, PixInsight); los greps de voseo, inglés y Aria usan whitelists explícitas y deben actualizarse si se introducen cadenas legítimas coincidentes. Los datos CMS no migrados (`#E5C400`, `compare_price`) se neutralizan en storefront sin tocar Convex (cambio aparte si se requiere).