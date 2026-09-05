# Design — Rediseño Editorial Total

**Change:** `redesign-editorial-total`
**Branch:** `redesign/editorial-total`
**Presupuesto:** ~400 líneas de código cambiadas por archivo (no exceder)
**Delivery:** ask-on-risk (preguntar antes de decisiones con riesgo de conversión)

## 1. Principios de diseño técnico

1. **Tokens primero.** Todo hex hardcodeado → `var(--color-*)`. Cero `#0E0E0E`, `#9B1C1C`, `#F9F9F9`, `#E5C400` inline en componentes.
2. **Escala respetada.** Display = `clamp(2.5rem, 6vw, 4.5rem)`. Headline = `~2rem`. Body = `16px/1.6`. Label = `10–12px`.
3. **Playfair ≤ 2 por página.** El hero usa 1 Playfair display; el resto de la home y catálogo son DM Sans.
4. **Radio 0.** Todos los componentes `rounded-none` o `border-radius: 0`.
5. **Un solo acento.** Carmín `var(--color-accent)` ≤ 10% de pantalla. Sin amarillo, sin emerald, sin multi-color.
6. **Persuasión ética.** Solo `compare_price` real se tacha. Solo stock real se muestra. Sin toasts, sin popup de descuento inventado.
7. **ES-BO neutro.** Tuteo consistente. Sin voseo, sin inglés suelto.

---

## 2. Plan por archivo

### 2.1 `src/app/globals.css`

**Acción:** Consolidar tokens de escala tipográfica y podar utilidades decorativas heredadas.

| Cambio | Detalle |
|--------|---------|
| Agregar custom properties de escala | `--font-display: clamp(2.5rem, 6vw, 4.5rem)`, `--font-headline: 2rem`, `--font-title: 1.25rem`, `--font-body: 1rem`, `--font-label: 0.625rem` (10px) |
| Agregar utility classes de escala | `.text-display`, `.text-headline`, `.text-title`, `.text-body`, `.text-label` |
| Tokenizar `.btn-premium` | Reemplazar `#9B1C1C` → `var(--color-accent)`, `#801414` → `color-mix(in srgb, var(--color-accent) 80%, black)` o hardcodear `#801414` como `--color-accent-dark` |
| Agregar `--color-accent-dark: #801414` | Para hover de botones |
| Podar `premium-gradient-text` | Eliminar o reemplazar con gradiente neutro (blanco → gris), sin carmín en gradientes decorativos |
| Podar `animate-glow-pulse` | No se usa en el nuevo diseño editorial |
| Podar `animate-toast-in/out` | ToastNotifications se elimina |
| Podar `animate-pulse-red` | Reemplazar con `animate-pulse` nativo de Tailwind |
| Tokenizar `.skeleton` dark override | Usar `var(--color-dark-surface)` en vez de `#111111`/`#1a1a1a` |
| Mantener reduced-motion | Ya correcto, verificar que cubre todas las animaciones nuevas |
| Agregar placeholder aspect-ratio utilities | `.aspect-editorial` (16:9), `.aspect-portrait` (4:5), `.aspect-product` (3:4) |

**Líneas estimadas:** ~30 líneas cambiadas/agregadas.

---

### 2.2 `src/app/(store)/HomeClient.tsx`

**Acción:** Rediseñar la home con secciones editorial. Estructura nueva:

#### Secciones (orden):

1. **Hero** — video full-bleed + display Playfair + subtítulo DM Sans
2. **Marquee** — barra carmín con categorías (mantener, ajustar copy)
3. **Drops / Novedades** — grid 2×4 de ProductCards con datos reales
4. **Colecciones** — 3 tarjetas aspect 4:5 con categorías de Convex
5. **Confianza** — 3 señales honestas (envío, pago, garantía) sin emojis
6. **Newsletter** — input + CTA, sin popup, sin claims de escasez

#### Cambios específicos:

| Elemento actual | Acción |
|-----------------|--------|
| Hero `text-[clamp(3.5rem,12vw,10rem)]` | → `text-display` (token: `clamp(2.5rem, 6vw, 4.5rem)`) |
| Hero `uppercase tracking-tighter` | → sentence case, `tracking-tight` solo |
| 6+ headlines Playfair | → 1 Playfair (hero h1); todos los h2 → DM Sans `text-headline` |
| `toHot()` con `base_price * 1.45` | → `originalPrice: Number(p.compare_price ?? p.base_price)` (sin inventar) |
| `views: 12` | → eliminar del type `HotProduct` |
| Popup exit-intent "10% OFF" | → **eliminar completamente** (no existe descuento real) |
| Sección "Bóveda VIP" | → **eliminar** (reemplazar por sección Confianza) |
| Sección Social multi-acento | → **eliminar** (links sociales van al Footer) |
| Sección Newsletter con claims | → simplificar: "Recibe novedades" sin "24h antes" ni "se agotan en minutos" |
| `tracking-widest` en body text | → eliminar; body usa DM Sans sentence case normal |
| `font-mono` en categorías | → DM Sans con `text-label` |
| `text-[8px]`/`text-[9px]` labels | → `text-label` (10px mínimo) |
| `MARQUEE_ITEMS` con "Liquidación real" | → "Novedades", "Envíos a Bolivia", "Pago con QR" (sin liquidación) |
| `setInterval` para banners | → respetar `prefers-reduced-motion`; si reduced, mostrar solo primer banner |
| Copy "Comprá por colección" (voseo) | → "Compra por colección" (tuteo) |
| `Flame` icon en CTA | → eliminar (emoji-like); CTA limpio con `ArrowRight` |

#### Hero — Mockup ASCII

**Desktop (≥1024px):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  [ AnnouncementBar — tinta, texto hueso, sin amarillo, sin countdown│
│    o countdown solo si fecha real ]                                  │
├──────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │                                                                  ││
│  │   VIDEO / IMAGE FULL-BLEED (16:9 → 100vh)                       ││
│  │   overlay: from-black/70 via-black/30 to-transparent             ││
│  │                                                                  ││
│  │                                                                  ││
│  │                                                                  ││
│  │   ── FLORES                          (label 10px, carmín)       ││
│  │                                                                  ││
│  │   Calzado que                                                   ││
│  │   define tu                                                      ││
│  │   paso.                              (Playfair display,          ││
│  │                                        clamp(2.5rem,6vw,4.5rem),││
│  │                                        sentence case, blanco)   ││
│  │                                                                  ││
│  │   Botas, tacos y zapatillas con stock real                      ││
│  │   en Cochabamba y Santa Cruz.        (DM Sans 16px, white/60)   ││
│  │                                                                  ││
│  │   [ Ver colección → ]               (btn-premium, carmín)       ││
│  │                                                                  ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─── MARQUEE CARMÍN ──────────────────────────────────────────────┐│
│  │  MUJER • BOTAS • TACOS • ZAPATILLAS • ENVÍOS A BOLIVIA • QR   ││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

**Mobile (360–767px):**
```
┌──────────────────────┐
│ [AnnouncementBar]    │
├──────────────────────┤
│                      │
│  VIDEO FULL-BLEED    │
│  (100vw × 85vh)      │
│                      │
│  ── FLORES           │
│  (label 10px carmín) │
│                      │
│  Calzado que         │
│  define tu           │
│  paso.               │
│  (Playfair 2.5rem,   │
│   sentence case)     │
│                      │
│  Botas, tacos y      │
│  zapatillas con      │
│  stock real en       │
│  Bolivia.            │
│  (DM Sans 14px)      │
│                      │
│  [ Ver colección → ] │
│  (btn-premium 100%)  │
│                      │
├──────────────────────┤
│  MARQUEE CARMÍN      │
│  (text 10px, 1 line) │
└──────────────────────┘
```

#### Nueva sección Confianza (reemplaza Bóveda VIP + Social):

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Tres columnas (1 col en mobile), fondo `var(--color-surface)`:     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  [Truck]     │  │  [Shield]    │  │  [Clock]     │              │
│  │              │  │              │  │              │              │
│  │  Envíos      │  │  Pago        │  │  Cambios     │              │
│  │  48h a todo  │  │  seguro:     │  │  en 30 días  │              │
│  │  Bolivia     │  │  QR, trans-  │  │  con stock   │              │
│  │              │  │  ferencia,   │  │  real        │              │
│  │  (DM Sans    │  │  efectivo    │  │              │              │
│  │   body 16px) │  │              │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  Iconos: lucide (Truck, ShieldCheck, RotateCcw), carmín, 24px      │
│  Sin emojis. Sin claims no verificables.                            │
└──────────────────────────────────────────────────────────────────────┘
```

**Líneas estimadas:** ~200 líneas (de ~450 actuales → ~250).

---

### 2.3 `src/app/(store)/productos/ProductsClient.tsx`

**Acción:** Tokenizar, eliminar "ARIA", eliminar tachado inventado, normalizar copy.

| Cambio | Detalle |
|--------|---------|
| `text-7xl md:text-9xl` h1 | → `text-display` token |
| `"ARIA"` label en cada card | → **eliminar** completamente |
| `base_price * 1.5` tachado | → solo mostrar `compare_price` si existe (como el PDP) |
| `"New"` badge | → `"Novedad"` (ES) |
| `"No pieces found..."` | → `"No encontramos productos en esta selección."` |
| `"Objetos de deseo"` | → `"Productos disponibles"` |
| `bg-[#F9F9F9]` | → `bg-[var(--color-surface)]` |
| `text-[8px]`/`text-[9px]` | → `text-label` (10px mínimo) |
| `"Elegí tu talle"` (en PDP, pero referencia) | → `"Elige tu talle"` |
| Sidebar categorías fallback hardcoded | → si `categories` vacío, no renderizar fallback falso |
| `pageTitle` "Liquidación Final" | → `"Ofertas"` o `"En oferta"` |
| `pageTitle` "El Archivo" | → `"Novedades"` |
| `pageTitle` "Bóveda Privada" | → `"Exclusivos"` |

**Líneas estimadas:** ~40 líneas cambiadas.

---

### 2.4 `src/app/(store)/productos/[slug]/ProductPageClient.tsx`

**Acción:** Tokenizar, descripción en sentence case, strings ES-BO, naming correcto.

| Cambio | Detalle |
|--------|---------|
| `text-6xl md:text-8xl` h1 | → `text-display` token |
| Descripción `uppercase tracking-widest` | → sentence case, `text-body`, DM Sans 16px/1.6 |
| `"Select Color"` | → `"Elige color"` |
| `"Out of Stock"` | → `"Agotado"` |
| `"Express"` / `"Quality"` | → `"Envío 48h"` / `"Garantía Flores"` |
| `"Garantía Flores Studio"` | → `"Garantía Flores"` |
| `"Elegí tu talle"` | → `"Elige tu talle"` |
| `"¿me ayudás con el talle?"` | → `"¿me ayudas con el talle?"` |
| `bg-[#F9F9F9]` | → `bg-[var(--color-surface)]` |
| `text-[8px]`/`text-[9px]` | → `text-label` (10px mínimo) |
| Size chip seleccionado `bg-black` | → `bg-[var(--color-accent)] text-white` (coherencia con acento) |
| Color chip seleccionado `bg-black` | → `bg-[var(--color-accent)] text-white` |

**Líneas estimadas:** ~35 líneas cambiadas.

---

### 2.5 `src/components/store/ProductCard.tsx`

**Acción:** Tokenizar, descuento solo con `compare_price` real.

| Cambio | Detalle |
|--------|---------|
| `bg-[#0E0E0E]` | → `bg-[var(--color-primary)]` |
| `border-[#9B1C1C]/40` | → `border-[var(--color-accent)]/40` |
| `bg-[#9B1C1C]` (badge descuento) | → `bg-[var(--color-accent)]` |
| `text-[8px]`/`text-[8.5px]`/`text-[9px]` | → `text-label` (10px mínimo) |
| Lógica `disc` (discount %) | → mantener, pero solo se muestra si `compare_price` real existe (no inventado) |
| `"Sin Imagen"` | → placeholder de marca (ver §3) |
| `text-white/70` nombre | → `text-white/80` (mejor contraste) |

**Líneas estimadas:** ~15 líneas cambiadas.

---

### 2.6 `src/components/store/Navbar.tsx`

**Acción:** Eliminar emojis, badges de urgencia inventada, normalizar copy ES-BO.

| Cambio | Detalle |
|--------|---------|
| `"🔥 Drops"` | → `"Novedades"` |
| `"⏳ Últimas Tallas"` | → `"Ofertas"` |
| `"💎 Exclusivas"` | → `"Exclusivos"` |
| Badge `"NUEVO"` / `"URGENTE"` | → **eliminar** (urgencia inventada) |
| `description` "Se acaba hoy" | → **eliminar** descriptions del nav |
| `text-[10px]` links | → `text-label` (10px, mantener) |
| `text-[7.5px]` badge | → eliminar (badge eliminado) |
| Mobile `text-[9px]` labels | → `text-label` (10px) |
| `animate-pulse` en badge | → eliminar con el badge |
| Mobile menu `link.description` | → eliminar (simplificar) |

**Líneas estimadas:** ~30 líneas cambiadas.

---

### 2.7 `src/components/store/Footer.tsx`

**Acción:** Quitar emojis, claims no verificados, enlaces muertos.

| Cambio | Detalle |
|--------|---------|
| Virtudes con emojis (🚚🔒✅💬) | → íconos lucide (Truck, Lock, ShieldCheck, MessageCircle) en carmín |
| "100% cuero premium garantizado" | → "Calidad en cada costura" (sin claim de material no verificado) |
| "Soporte 24/7" | → "Atención por WhatsApp" (sin claim de horario no verificado) |
| "La liquidación más grande de calzado premium en Bolivia" | → "Calzado premium con stock real en Bolivia" |
| Links "Ayuda" con `href="#"` | → **eliminar** la sección Ayuda (enlaces muertos) o reemplazar con links reales si existen |
| Emojis en links catálogo (🔥⏳💎) | → eliminar emojis, texto limpio |
| `text-[9px]`/`text-[9.5px]` | → `text-label` (10px mínimo) |
| `animate-pulse-red` en payment methods | → eliminar animación decorativa |
| `text-[12px]` virtues title | → mantener (está sobre mínimo) |
| `corner-decor` en virtues cards | → mantener (es parte del lenguaje visual) |

**Líneas estimadas:** ~40 líneas cambiadas.

---

### 2.8 `src/components/store/AnnouncementBar.tsx`

**Acción:** Neutralizar amarillo, eliminar countdown perpetuo.

| Cambio | Detalle |
|--------|---------|
| `bg_color` amarillo del CMS | → **sanitizar:** si `bg_color` es `#E5C400`/`#FFD700`/`#FFB300`/`#FFC107` o cualquier amarillo (HSL hue 40–70, saturation >60%, lightness >40%), forzar a `var(--color-primary)` |
| Countdown perpetuo (`countdown_end_hour`) | → **eliminar** el `useEffect` del countdown y el `<Clock>` + timer |
| Countdown con fecha real | → si el CMS provee `countdown_end_date` (ISO date futura real), mostrar countdown; si no, no mostrar |
| `text_color` | → si se neutraliza bg, forzar `text_color` a `#FFFFFF` |
| Mantener `--announcement-height` | → sí, para el offset del Navbar |

**Implementación de sanitización:**
```typescript
const BLOCKED_COLORS = ['#e5c400', '#ffd700', '#ffb300', '#ffc107', '#ffdb4d', '#f5c518'];

function sanitizeBgColor(color: string | undefined): string {
  const normalized = (color || '').toLowerCase().trim();
  if (BLOCKED_COLORS.includes(normalized)) return '#0A0A0A'; // var(--color-primary)
  return normalized || '#0A0A0A';
}
```

**Líneas estimadas:** ~25 líneas (simplificación neta).

---

### 2.9 `src/components/store/ToastNotifications.tsx`

**Acción:** **Eliminar** el archivo y todas sus referencias.

| Archivo | Cambio |
|---------|--------|
| `src/components/store/ToastNotifications.tsx` | **Eliminar archivo** |
| `src/app/(store)/layout.tsx` | Eliminar `import` y `<ToastNotifications />` |
| `globals.css` | Eliminar `.animate-toast-in`, `.animate-toast-out` |

---

### 2.10 `src/components/store/StockBadge.tsx`

**Acción:** Menor — un acento.

| Cambio | Detalle |
|--------|---------|
| `"Stock disponible"` en `text-emerald-500` | → `text-[var(--color-text-muted)]` (neutro, un acento) |
| `bg-emerald-500` dot | → `bg-[var(--color-text-muted)]` |
| `shadow-[0_0_8px_#10B981]` | → eliminar glow (no es parte del sistema) |

**Líneas estimadas:** ~5 líneas.

---

### 2.11 `src/components/store/VideoBanner.tsx`

**Acción:** Reemplazar fallback Unsplash repetido con placeholder de marca.

| Cambio | Detalle |
|--------|---------|
| `FALLBACK` Unsplash URL | → placeholder SVG inline de marca (ver §3) |
| Mantener lógica de video | → sí, sin cambios funcionales |
| `optimizeCloudinaryVideo` | → mantener |

---

### 2.12 Metadata (3 archivos)

**`src/app/(store)/page.tsx`:**

| Campo | Actual | Nuevo |
|-------|--------|-------|
| `title` | "Flores \| Calzado Premium para Toda la Familia - Bolivia" | "Flores \| Calzado premium en Bolivia" |
| `description` | "Últimas tallas en botas, tacos y zapatillas. Liquidación real con stock limitado..." | "Botas, tacos y zapatillas con stock real en Cochabamba y Santa Cruz. Envíos a todo Bolivia." |
| `og:image` | Unsplash `photo-1542291026` | Placeholder de marca o primera imagen real del catálogo |

**`src/app/(store)/productos/page.tsx`:**

| Campo | Actual | Nuevo |
|-------|--------|-------|
| `title` | "Colecciones \| Flores" | "Catálogo \| Flores" |
| `description` | "...en liquidación. Calidad premium al mejor precio en Bolivia." | "Explora botas, zapatillas y tacos con stock real. Envíos a todo Bolivia." |

**`src/app/(store)/productos/[slug]/page.tsx`:**

| Campo | Actual | Nuevo |
|-------|--------|-------|
| `fallbackDescription` | "Calzado premium en liquidación con envíos..." | "Calzado premium con stock real. Envíos a todo Bolivia." |
| `description` (product) | "...en liquidación con envíos..." | Sin "liquidación" si el producto no tiene `compare_price` |

---

## 3. Sistema de placeholders por aspecto

### Problema

El fallback Unsplash `photo-1542291026-7eec264c27ff` (zapatilla roja) se repite en hero, catálogo, OG y categorías. Un rediseño editorial necesita placeholders de marca que no dependan de stock photography repetida.

### Solución: Placeholder SVG de marca intercambiable vía Convex

Crear un componente `BrandPlaceholder` que genera un SVG inline con la identidad de Flores, en tres aspectos intercambiables:

```typescript
// src/components/store/BrandPlaceholder.tsx

type AspectRatio = '16:9' | '4:5' | '3:4';

const ASPECT_STYLES: Record<AspectRatio, string> = {
  '16:9': 'aspect-video',     // banners, hero fallback
  '4:5': 'aspect-[4/5]',      // categorías
  '3:4': 'aspect-[3/4]',      // productos, catálogo
};

export function BrandPlaceholder({ 
  aspect = '3:4', 
  label = 'Flores',
  variant = 'dark' 
}: { 
  aspect?: AspectRatio; 
  label?: string;
  variant?: 'dark' | 'light';
}) {
  const bg = variant === 'dark' ? 'var(--color-primary)' : 'var(--color-surface)';
  const fg = variant === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,10,0.06)';
  const text = variant === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,10,0.12)';
  
  return (
    <div className={`${ASPECT_STYLES[aspect]} w-full relative overflow-hidden`} style={{ background: bg }}>
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={fg} strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
              fill={text} fontSize="14" fontFamily="var(--font-serif)" 
              fontWeight="900" letterSpacing="0.2em">
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
```

### Cómo se intercambia vía Convex (sin deploy)

El admin puede subir una imagen de placeholder por categoría/banner en el CMS. El flujo:

1. **Categorías:** `categories.image_url` ya existe en schema. Si está vacío → `BrandPlaceholder aspect="4:5"`.
2. **Banners:** `cms_banners.image_url` ya existe. Si está vacío → `BrandPlaceholder aspect="16:9"`.
3. **Productos:** si `product.images` está vacío → `BrandPlaceholder aspect="3:4"`.
4. **Hero global:** si `hero_video_url` y `banners` vacíos → `BrandPlaceholder aspect="16:9" variant="dark"`.

**Sin cambiar Convex schema.** Solo se consume lo que ya existe y se cae al placeholder de marca en vez de a Unsplash.

### Uso en componentes

```tsx
// En ProductCard:
{product.img ? (
  <Image src={product.img} ... />
) : (
  <BrandPlaceholder aspect="3:4" label={product.name} />
)}

// En VideoBanner fallback:
if (!optimizedSrc) {
  return poster ? <Image src={poster} ... /> : <BrandPlaceholder aspect="16:9" variant="dark" />;
}

// En categorías (HomeClient):
const img = c.image_url;
{img ? (
  <VideoBanner poster={img} ... />
) : (
  <BrandPlaceholder aspect="4:5" label={c.name} />
)}
```

---

## 4. Orden de implementación (slices)

### Slice 1: Tokens + Home (base visual)

1. `globals.css` — tokens de escala + podar utilidades
2. `HomeClient.tsx` — rediseñar secciones
3. `AnnouncementBar.tsx` — sanitizar amarillo + eliminar countdown perpetuo
4. `ToastNotifications.tsx` — eliminar archivo + layout.tsx
5. `VideoBanner.tsx` — fallback de marca
6. `BrandPlaceholder.tsx` — nuevo componente
7. `Navbar.tsx` — limpiar emojis/badges

### Slice 2: Catálogo + PDP + componentes compartidos

8. `ProductCard.tsx` — tokenizar + descuento honesto
9. `ProductsClient.tsx` — tokenizar + eliminar ARIA + tachado honesto
10. `ProductPageClient.tsx` — tokenizar + descripción legible + ES-BO
11. `StockBadge.tsx` — un acento
12. `Footer.tsx` — limpiar emojis/claims/enlaces muertos
13. Metadata (3 archivos) — copy ES sin liquidación

---

## 5. Riesgos y decisiones ask-on-risk

| Riesgo | Decisión | Preguntar si... |
|--------|----------|-----------------|
| Eliminar popup 10% OFF puede reducir email capture | Eliminar (no hay descuento real) | — |
| Eliminar countdown puede reducir urgencia percibida | Eliminar (es perpetuo/falso) | — |
| Sección Confianza con claims genéricos | Usar solo datos verificables (48h, QR, 30 días cambios) | Si 30 días no es política real, preguntar |
| Placeholder SVG puede sentirse "vacío" vs foto | Es intencional: editorial > stock photography | Si el cliente quiere fotos, requiere otro change |
| Footer sin sección Ayuda | Eliminar si todos los links son `#` | Si existen páginas reales, mantener |

---

## 6. Verificación

### Greps de marca (post-implementación)

```bash
# Sin amarillo
grep -r '#E5C400\|#FFD700\|#FFB300\|#FFC107' src/  # → 0 resultados

# Sin hex hardcodeado en componentes store
grep -rn '#9B1C1C\|#0E0E0E\|#F9F9F9\|#801414' src/components/store/ src/app/\(store\)/  # → 0 resultados

# Sin ARIA
grep -r 'ARIA' src/app/\(store\)/productos/  # → 0 resultados

# Sin ToastNotifications
grep -r 'ToastNotifications' src/  # → 0 resultados

# Sin "Liquidación" en metadata
grep -ri 'liquidación' src/app/\(store\)/page.tsx src/app/\(store\)/productos/page.tsx  # → 0 resultados

# Playfair ≤ 2 por página (hero h1 + máx 1 más)
grep -c 'font-serif' src/app/\(store\)/HomeClient.tsx  # → ≤ 2 headlines

# Escala display respetada
grep 'clamp(3.5rem\|clamp(.*10rem' src/app/\(store\)/HomeClient.tsx  # → 0 resultados

# Sin emojis en nav/footer
grep -P '[\x{1F300}-\x{1F9FF}]' src/components/store/Navbar.tsx src/components/store/Footer.tsx  # → 0 resultados
```

### Build

```bash
npm run lint  # → 0 errors
npm run build  # → success
```

---

## 7. Resumen de líneas por archivo

| Archivo | Líneas actuales | Líneas estimadas post-cambio | Delta |
|---------|----------------|------------------------------|-------|
| `globals.css` | ~280 | ~260 | -20 |
| `HomeClient.tsx` | ~450 | ~250 | -200 |
| `ProductsClient.tsx` | ~170 | ~155 | -15 |
| `ProductPageClient.tsx` | ~220 | ~210 | -10 |
| `ProductCard.tsx` | ~120 | ~115 | -5 |
| `Navbar.tsx` | ~200 | ~170 | -30 |
| `Footer.tsx` | ~180 | ~160 | -20 |
| `AnnouncementBar.tsx` | ~80 | ~55 | -25 |
| `ToastNotifications.tsx` | ~100 | 0 (eliminado) | -100 |
| `layout.tsx` | ~40 | ~35 | -5 |
| `StockBadge.tsx` | ~40 | ~38 | -2 |
| `VideoBanner.tsx` | ~100 | ~95 | -5 |
| `BrandPlaceholder.tsx` | 0 (nuevo) | ~45 | +45 |
| Metadata (3 archivos) | ~90 | ~85 | -5 |
| **Total** | **~2070** | **~1630** | **~440 líneas netas** |

Dentro del presupuesto de ~400 líneas de cambios (la reducción neta es mayor porque se elimina más de lo que se agrega).
