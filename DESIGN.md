---
name: Flores — Flores Crimson
description: Sistema de diseño editorial crimson, mujer-first y unisex, para e-commerce de calzado premium-accesible.
colors:
  primary: "#0A0A0A"
  bg: "#FFFFFF"
  surface: "#F5F3EF"
  dark-surface: "#111111"
  border: "#E0E0E0"
  text: "#0A0A0A"
  text-muted: "#6B6B6B"
  accent: "#9B1C1C"
  accent-bright: "#C1272D"
  accent-light: "#FEE2E2"
typography:
  display:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  body:
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0px"
  sm: "0px"
  md: "0px"
  lg: "0px"
spacing:
  container: "1400px"
  gutter: "24px"
  gutter-sm: "16px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "16px 36px"
  button-primary-hover:
    backgroundColor: "#801414"
    textColor: "#FFFFFF"
  button-outline:
    backgroundColor: "rgba(255,255,255,0.02)"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "16px 36px"
---

# Design System: Flores — Flores Crimson

## Overview

**Creative North Star: "The Crimson Atelier"** — una zapatería editorial donde el carmín Flores es la única voz de color y el espacio en blanco hueso frío respira. Mujer-first pero unisex: la navegación destaca Mujer, pero el catálogo viste a toda la familia. No somos liquidación; somos diseño premium-accesible con urgencia honesta.

El sistema es intencionalmente sobrio: tinta `#0A0A0A` sobre blanco, superficie hueso frío `#F5F3EF`, y un solo acento carmín `#9B1C1C` usado con disciplina. Las esquinas son **sharp (radius 0)**; la profundidad viene de tono y de un blur de vidrio, no de esquinas redondeadas ni de sombras pesadas. El movimiento es sutil (reveals, hover-video), nunca parallax agresivo.

**Key Characteristics:**
- Un solo acento (carmín) sobre neutros tinta/hueso; el amarillo está prohibido.
- Tipografía de dos voces: Playfair Display solo para headlines premium, DM Sans para todo lo demás.
- Forma sharp (radius 0) en cada componente.
- Motion sutil y siempre respetuoso de `prefers-reduced-motion`.
- Persuasión ética: urgencia/escasez/social proof solo si son reales.

## Colors

Paleta de un acento (carmín) sobre neutros fríos. Sin amarillo, sin beige cálido.

### Primary
- **Flores Crimson** (`#9B1C1C`): acento principal — botones primarios, badges de urgencia, logo `.`, hover de nav, anillos de foco. Es la única voz de color de la marca.

### Secondary
- **Crimson Bright** (`#C1272D`): variante activa/más luminosa del acento (count-up, estados activos). Uso menor que el primario.
- **Crimson Light** (`#FEE2E2`): tinte de acento para fondos suaves, chips seleccionados y estados "en oferta" sobre claro.

### Neutral
- **Ink** (`#0A0A0A`): texto, superficies oscuras (footer, nav móvil), borde de tarjetas premium. También `--color-primary`.
- **Paper** (`#FFFFFF`): fondo base.
- **Cold Bone** (`#F5F3EF`): superficie/panel — hueso **frío**, no beige cálido. Hover de filas, tarjetas claras.
- **Dark Surface** (`#111111`): superficie en modo oscuro/footer.
- **Border** (`#E0E0E0`): divisores y bordes sutiles.
- **Text Muted** (`#6B6B6B`): texto secundario (≈5.6:1 sobre blanco, pasa AA).

### Named Rules
**The No-Yellow Rule.** El amarillo Aria (`#FFD700` / `#FFB300`) nunca aparece. Es anti-referencia de la competencia de liquidación barata. Cualquier uso de dorado/amarillo es un bug de marca.

**The One-Voice Rule.** El acento carmín ocupa ≤10% de cada pantalla. Su rareza es el punto: donde aparece, importa.

## Typography

**Display Font:** Playfair Display (con Georgia serif como fallback)
**Body Font:** DM Sans (con Helvetica Neue sans como fallback)
**Label/Mono Font:** DM Sans (pesos 600–900, tracking amplio, uppercase para labels)

**Character:** editorial y contrastado — serif de alto contraste para los momentos premium, sans geométrica para la legibilidad del catálogo. La pareja señala "curador de calzado", no "outlet".

### Hierarchy
- **Display** (900, `clamp(2.5rem, 6vw, 4.5rem)`, 1.05): hero y headlines premium. Máx. 1–2 por página.
- **Headline** (700, ~2rem, 1.05): títulos de sección (`h2`).
- **Title** (700, ~1.25rem): tarjetas y subtítulos (`h3`).
- **Body** (400, 16px, 1.6): texto corriente; ancho de línea ~65–75ch.
- **Label** (700–900, 10–12px, tracking 0.18–0.4em, uppercase): nav, badges, pies.

### Named Rules
**The One-Voice Rule (type).** Playfair Display solo en headlines premium, máximo 1–2 por página. El cuerpo siempre es DM Sans.

> Fuentes cargadas vía next/font (DM Sans + Playfair Display) con display: swap — el @import render-blocking de Google Fonts se eliminó en Fase B y el sitio se acerca al presupuesto de ~120kB.

## Layout

Grid de 12 columnas dentro de un contenedor de `1400px` (`--container`), con gutter de `24px` (16px en móvil). Barra de anuncio fija + navbar fija superpuestas al hero; el `<main>` se paddinga para despejarlas. Catálogo en grillas responsivas (`grid-cols-1 → sm:2 → lg:4`). Densidad editorial: mucho aire, una sola voz de color.

## Elevation & Depth

Sistema híbrido pero contenido: sombras existentes (`--shadow-sm`, `--shadow-lg`) para elevación de estado, y `glass-card` (blur 20px sobre tinta semitransparente) para superficies flotantes sobre hero/video. Sin sombras difusas decorativas en reposo.

### Shadow Vocabulary
- **Ambient Low** (`0 1px 3px rgba(0,0,0,0.08)`): filas, divisores, navbar al hacer scroll.
- **Luxury Lift** (`0 20px 60px rgba(0,0,0,0.15)`): modales/drawers y hover de tarjetas premium.
- **Crimson Glow** (`0 0 50px rgba(155,28,28,0.25)`): acento de profundidad en elementos destacados.

## Shapes

Lenguaje **sharp**: todos los radios son `0px` (`--radius-none/sm/md/lg` = 0). Bordes finos (`1px`) en `var(--color-border)` o tinta; detalles de esquina (`corner-decor`) para la firma "tech-lujo". Sin pills redondeadas salvo el badge del carrito (círculo funcional).

### Named Rules
**The Sharp Rule.** Radius 0 en todos los componentes. Lo redondeado es excepción documentada (badge contador del carrito), no norma.

## Components

### Buttons
- **Shape:** radius 0.
- **Primary (`.btn-premium`):** fondo carmín `#9B1C1C`, texto blanco, padding `16px 36px`, uppercase, tracking 0.2em, peso 900; sweep de luz en hover.
- **Hover / Focus:** a `#801414` + glow carmín; foco = anillo doble (bg + carmín, ver abajo).
- **Outline (`.btn-premium-outline`):** borde 1px translúcido, subrayado carmín en hover; para CTAs sobre fondo oscuro/hero.

### Cards / Containers
- **Corner Style:** 0.
- **Background:** `glass-card` (tinta 50% + blur) sobre hero; `#F5F3EF`/`#0D0D0D` en superficies sólidas.
- **Border:** `1px` tinta translúcido o `--color-border`.
- **Internal Padding:** escala `p-10` en tarjetas de virtudes.

### Navigation
- **Style:** navbar fija, transparente sobre hero y `bg-white/95` + blur al hacer scroll. Links uppercase 10px, tracking 0.15–0.25em. Nav destaca **Mujer**. Hover carmín.
- **Mobile:** menú fullscreen tinta con jerarquía priorizada (Comprar Ahora → Categorías).

### Inputs / Fields
- **Style:** stroke `1px` borde, radius 0, fondo claro.
- **Focus:** anillo doble `box-shadow: 0 0 0 3px var(--color-bg), 0 0 0 5px var(--color-accent)` (`:focus-visible`, solo teclado).

## Do's and Don'ts

### Do:
- **Do** consumir siempre los tokens (`var(--color-accent)`, `var(--color-surface)`…) — nunca hardcodees hex en componentes (migrado a token en Fase B).
- **Do** usa el carmín con disciplina (≤10% de pantalla) y el hueso frío `#F5F3EF` para superficies.
- **Do** mantén radius 0 en todo lo nuevo.
- **Do** respeta `prefers-reduced-motion`: el sitio ya desactiva animaciones infinitas y smooth-scroll bajo esa preferencia.
- **Do** mantén el anillo de foco visible (`:focus-visible` ya definido globalmente).
- **Do** usa Playfair Display solo en 1–2 headlines premium por página.

### Don't:
- **Don't** uses amarillo/dorado (`#FFD700`, `#FFB300`) — anti-referencia Aria. (Residual conocido: stars `#FFB300` en `HomeClient.tsx:687` → migrado a `var(--color-accent)` en Fase B.)
- **Don't** implementes dark patterns: sin costos ocultos, sin trick questions, sin confirmshaming, sin forced continuity.
- **Don't** inventes urgencia/escasez: countdown solo si la oferta es real (fecha fin real); stock solo del CMS real; social proof solo verificado; precio tachado solo si fue el precio real (precio ancla transparente).
- **Don't** uses parallax pesado; la Opción A "Cine Sutil" es 1 hero video + hover-video en cards + reveals suaves.
- **Don't** reintroduzcas el gradiente dorado `.premium-gradient-gold` (eliminado en Fase A). La palabra "Privada" del VIP Vault cae a texto hero por defecto hasta darle tratamiento tokenizado en Fase B.

### Reglas de video (Opción A — Cine Sutil)
- 1 video de hero (autoplay, muted, loop, `playsInline`, poster, `preload="metadata"`).
- Hover-video en cards de producto (sin autoplay masivo que queme datos/móvil).
- Reveals suaves on-scroll; sin parallax pesado.
- Todo video con audio hablado lleva `<track>` de captions; respeta `prefers-reduced-motion` (pausar loops).
