# Explore — Ficha de Producto Vendedora (`ficha-producto-vendedora`)

Fase: **solo lectura**. Inventario del estado actual contra el alcance aprobado por
product owner. Store: openspec. Rama: `sdd/ficha-producto-vendedora` (scaffold `7ff3093`).
Fuentes de verdad: `DESIGN.md` (tokens, Named Rules), `PRODUCT.md` (voz ES-BO, AA, persuasión
ética). Sin modificar código fuente; solo se produce este artefacto.

## Alcance aprobado (5 ítems)

1. Ficha (PDP) upgrade: galería multi-imagen, modal guía de talles (ES-BO por categoría),
   productos relacionados, CTA WhatsApp pre-cargado (nombre + talle + precio, número desde env/CMS).
2. Señales de venta con datos reales (STRICT honesty): badge bajo-stock desde variantes Convex
   reales, NUEVO por fecha real (≤21 días), badge liquidación ligado a fecha fin configurable en
   settings Convex (editable por admin) — NO countdown falso.
3. Favoritos ♥ persistidos en localStorage, sin login, toggle en cards + detalle, accesibles.
4. Navegación por categoría: dropdown/mega-menu header + quick links (Liquidación, Novedades), mobile.
5. +10 productos genéricos seed (idempotente por slug; 20 → 30; reusar pool Unsplash verificado).

---

## 1. Mapa de estado actual por ítem

### 1.1 PDP upgrade

| Sub-ítem | Estado | Detalle |
|---|---|---|
| Galería multi-imagen | **Parcial (existe)** | `products.images[]` (`{url, is_primary}`) en `convex/schema.ts`. `ProductPageClient.tsx` ya renderiza imagen principal (`selectedImage`) + grilla de miniaturas con click. No hay lightbox/zoom, swipe móvil, ni alt text real (`alt={`${product.name} ${idx}`}`). |
| Modal guía de talles | **No existe** | El PDP muestra un link "Guía de talles" que abre **WhatsApp** (`wa.me` + `getWhatsAppNumber()`), no un modal. No hay dato de talles ES-BO en ningún lado. |
| Productos relacionados | **No existe** | No hay `getRelatedProducts`. `getProducts({category})` existe y puede reusarse, pero no filtra por "mismo producto excluido". |
| CTA WhatsApp pre-cargado | **Parcial** | Helpers listos en `src/lib/whatsapp.ts` (`getWhatsAppNumber`, `buildOrderMessage`, `openWhatsApp`). **Falta** un builder de consulta por producto único (nombre+talle+precio). **Bug**: el link "Guía de talles" del PDP llama `getWhatsAppNumber()` **sin** argumento → usa env/fallback, **no** el número CMS. |

### 1.2 Señales de venta reales

| Señal | Dato hoy | ¿Factible? | Gap |
|---|---|---|---|
| Bajo stock "Quedan 2 en talle 38" | `variants[].stock: v.number()` **existe** | ✅ sin cambio de schema | `StockBadge.tsx` es binario ("Agotado"/"Stock disponible"); `ProductCard` agrega stock total. El PDP tiene stock por variante pero no lo muestra como "Quedan N". Falta umbral + copy. |
| NUEVO por fecha (≤21 días) | `is_new: v.boolean()` (manual) + `_creationTime` (system field, epoch ms) **existen** | ✅ derivable | Hoy `is_new` se setea a mano (seed/admin) y se usa en filtros (`by_new`, `getProducts({is_new})`) y badges. No hay lógica "≤21 días". |
| Badge liquidación con fecha fin | `sale` = `compare_price > base_price` (ancla de precio) **existe**; fecha fin **no existe** | ⚠️ requiere setting + admin | No hay `liquidation_end_date`. `AnnouncementBar` ya neutraliza amarillo y lee `countdown_end_date` (clave no sembrada) para un countdown condicional — pero es la barra de anuncio, no un badge de producto, y la política solo admite countdown si la fecha es real. |

### 1.3 Favoritos ♥

- **No existe** (grep `favorit|favorite|wishlist|heart|corazon|♥` → 0 resultados en `src/`).
- Net-new: store Zustand `persist` (`flores-favorites`), toggle corazón en **ambas** cards
  (ver 1.4 riesgo de cards duplicadas) + PDP, y ruta `/favoritos` (o drawer).

### 1.4 Navegación por categoría

- `Navbar.tsx`: `NAV` plano = `[Novedades, Ofertas, Exclusivos]`. **Sin** dropdown/mega-menu de
  categorías. Menú móvil existe (fullscreen, plano).
- Datos de categorías disponibles vía `api.categories.getCategories` (5 cats).
- `ProductsClient.tsx` ya tiene sidebar de categorías (solo en la página de catálogo).
- Quick link "Novedades" existe (`/productos?is_new=true`); "Liquidación" no existe (hoy se llama
  "Ofertas" → `/productos?sale=true`). Decisión de naming pendiente (política anti-liquidation fake).

### 1.5 Seed +10 productos

- `convex/seed.ts` ya tiene **patrón idempotente por slug** (bloque 5b: `existingSlugs` Set +
  check `by_slug`). Total actual = **20** (7 iniciales + 13 extendidos). → +10 = 30.
- IDs de variante globales: hoy hasta `v58`. `adjustStock`/`updateVariant`/`deleteVariant`
  hacen `.find(v => v.id === variantId)` sobre **todos** los productos → los nuevos deben usar
  `v59+` (colisión = edita variante equivocada).
- `sort_order` continúa 21..30.
- Imágenes: hotlink Unsplash (`images.unsplash.com` ya permitido en `next.config.ts`). El
  verify-report previo reporta "15 URLs únicas, todas HTTP 200 (2 rotas reemplazadas)" — pero
  **no hay script automatizado de verificación 200 en el repo** (fue manual). Algunos photo-ids
  se reusan entre productos dentro de `seed.ts` (calidad, no rompe el grep del spec que solo
  cruza ≥2 archivos).

---

## 2. Feasibilidad de datos (honest signals) — Convex campos

### Existen hoy (sin tocar schema)

- `products.variants[].stock` (number) → bajo stock por talle.
- `products._creationTime` (system field, epoch ms) → NUEVO por fecha. Ya expuesto como
  `createdAt` en `getRecentProducts` y `created_at` en `mapProduct` (`src/lib/api.ts`).
- `products.compare_price` + `base_price` → tachado/precio ancla real.
- `products.is_new`, `is_featured`, `tags[]` → filtros/badges actuales.
- `cms_sections` (key/value, índice `by_key`) → sitio natural para `liquidation_end_date`.
  `settings.updateSection` (mutation con `checkAuth`) ya existe y sirve para editar por admin.

### Faltan (candidatos a schema/setting nuevos)

- `liquidation_end_date` (setting `cms_sections`, clave nueva) o tabla dedicada `settings`.
- Opcional: `products.created_at` explícito NO es necesario (usar `_creationTime`).
- Opcional para talles por categoría: tabla `size_guides` o clave `cms_sections` (o mapa
  estático en cliente — decidir).

### Nota técnica Convex (`convex/_generated/ai/guidelines.md`)

- No `.filter()`/`.collect()` no acotados en queries nuevas; usar `.withIndex()` + `.take()`/`.paginate()`.
- `getProducts` actual usa `.collect()` + filtro en memoria (legacy, aceptable a ~30 docs pero
  viola la guía). Una query de relacionados nueva debe usar `withIndex("by_category")` + `.take()`.

---

## 3. Consideraciones pricing / SEO / UX

### Pricing
- Moneda Bs. (Bolivianos), formato `Bs. {n}` (sin `.toFixed(2)` en PDP/cards; el carrito usa `.toFixed(2)` inconsistente).
- `currentPrice = variant.price || base_price` (el CTA WhatsApp debe usar el precio de la
  **variante seleccionada**, no el base, cuando exista).
- Tachado solo si `compare_price > base_price` (política: precio ancla transparente, nunca `base_price * factor`).

### SEO
- PDP ya tiene `generateMetadata` rico (canonical, OG, twitter, `robots:{index:false}` si no hay
  producto). **Gotcha:** `page.tsx` lee `product.meta_title`/`product.meta_desc` que **no están
  en el schema** (solo en `types/index.ts` como opcionales) → siempre caen al fallback. No hay
  JSON-LD `Product` structured data.
- Relacionados mejoran internal linking; favoritos es personalizado → debería ser `noindex`.

### UX
- **Dos implementaciones de card** conviven: `ProductCard.tsx` (dark, home, con `StockBadge`) y
  la card inline de `ProductsClient.tsx` (light, sin badge ni corazón). El corazón + badges deben
  ir en **ambas** para consistencia.
- `globals.css` ya impone: radius 0, `:focus-visible` doble anillo, `prefers-reduced-motion`,
  skip-link, tokens `var(--color-*)`. El spec (`openspec/specs/storefront/spec.md`) tiene greps de
  marca (no amarillo Aria, no hex hardcodeado, no urgencia inventada, ES-BO sin voseo, Playfair ≤2).

---

## 4. Riesgos

1. **`config.yaml` desactualizado/inconsistente.** `project.change` = `ficha-producto-vendedora`,
   pero `scope.in/out` describe el change archivado `catalogo-n8n-discord` y su `out` prohíbe
   `convex/**`, `admin`, `API routes` — el alcance aprobado **sí** toca `convex/schema|seed|settings`
   y el admin (configuración). Responsabilidad del orquestador; no se reescribe aquí.
2. **Número de WhatsApp inconsistente.** PDP "Guía de talles" usa `getWhatsAppNumber()` sin CMS y
   `CartDrawer` (paso "sent") hardcodea `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "59170000000"`.
   El patrón correcto (CMS-aware) es `getWhatsAppNumber(sections.whatsapp_number)` tras
   `useCMSStore().fetchCMS()`. El número sembrado real es `59176932485` (`cms_sections`), y el
   `Footer` hardcodea `https://wa.me/59176932485`. Sin `.env*` en repo → env no seteado localmente.
3. **Honesty policy (violación pasada).** El seed ya trae `tags:["liquidacion"]` y `compare_price`
   como "realidad" CMS. El badge liquidación debe colgar de una **fecha fin genuina** configurada,
   no de un countdown decorativo. `AnnouncementBar` ya implementa el patrón condicional correcto
   (oculta si sin fecha/pasada).
4. **Seed 21-días.** Si NUEVO se deriva de `_creationTime`, todos los productos sembrados (creados
   en la corrida de seed) aparecerán NUEVO por 21 días. Requiere criterio (override manual vs derivado).
5. **Admin de fecha liquidación.** `src/app/admin/configuracion/page.tsx` es un stub "en
   construcción". Editar la fecha fin requiere construir UI mínima o sembrar la clave y aceptar
   edición vía dashboard Convex.
6. **Variantes globales.** Ids `v59+` obligatorios (colisión rompe `adjustStock`/`updateVariant`/`deleteVariant`).
7. **Unsplash hotlink.** Dependencia externa sin verificación 200 automatizada; puede 404/rotar y
   no da control de marca. Cloudinary (`dggj5tnke`) disponible pero subida manual.
8. **Dos cards.** Riesgo de divergencia de badges/corazón si no se unifica o se replica el cambio.

---

## 5. Preguntas abiertas para proposal

1. **Guía de talles:** ¿mapa estático ES-BO hardcodeado (mujer 35–40, hombre 39–44, niños ¿?) sin
   admin, o respaldado en Convex (editable)? ¿Qué categorías → qué rangos de talles?
2. **NUEVO por fecha:** ¿reemplazar `is_new` manual por derivado de `_creationTime ≤ 21d`, o mantener
   `is_new` como override + derivar cuando ausente? ¿Cómo evitar que todo el catálogo sembrado salga NUEVO?
3. **Liquidación:** ¿fecha fin global en settings vs por-producto? ¿"Liquidación" es un tag/colección
   (`tags:["liquidacion"]`) + fecha global, o se mantiene el ancla `compare_price`? ¿Dónde la edita el admin?
4. **Favoritos:** ¿página `/favoritos` vs drawer? ¿Guardar solo slugs (hidratar vía `getProduct`) o
   snapshot completo? ¿`noindex` en la página de favoritos?
5. **CTA WhatsApp PDP:** ¿salta directo (pedido de producto único, sin pasar por carrito) o pre-carga
   el `CartDrawer`? ¿Formato exacto del mensaje (reusar `buildOrderMessage` o nuevo helper)?
6. **Relacionados:** ¿misma categoría, mismo género, o por tags? ¿Cuántos (4? 8?)?
7. **Seed +10:** ¿qué 10 productos/categorías/géneros? ¿Reusar URLs Unsplash existentes del pool o
   nuevas con verificación HTTP-200 (quién la ejecuta — no hay script en repo)?
8. **Mega-menu:** ¿qué categorías se muestran (5 actuales)? ¿Hover desktop vs click? ¿Estructura
   mobile? ¿Renombrar "Ofertas" → "Liquidación" (política anti-fake)?
9. **Umbral bajo stock:** ¿≤2 o ≤3? ¿Copy "Quedan N en talle {size}" exacto?
10. **¿Actualizar `config.yaml` scope** para reflejar el nuevo alcance IN (convex/schema, seed,
    settings, admin configuracion) antes de `spec`?
