# Propuesta — Catálogo completo + fix CMS + automatización n8n → Discord

## Metadata del change

- **Change:** `catalogo-n8n-discord`
- **Branch:** `sdd/catalogo-n8n-discord` (desde `main` `f4110cf`, creada y limpia)
- **Fecha de inicio:** 2026-09-08
- **Tipo:** datos (seed) + fix menor de sesión admin + integración externa local (n8n/Discord/Gemini)
- **Fuente de verdad del producto:** `DESIGN.md` y `PRODUCT.md` (este change NO altera el storefront visual ni los tokens)
- **Estrategia:** seed primero, fix CMS segundo, entregables n8n tercero (los flujos se diseñan en `spec.md`/`design.md`, NO aquí)
- **Ejecución:** auto · store: openspec · delivery: ask-on-risk · budget de review: 400 líneas

## Intención (charter)

Completar el catálogo real de Flores Store y armar el pipeline de publicación promocional que el
negocio necesita hoy:

1. **Seed masivo** — el catálogo actual vive en `convex/seed.ts` con 7 productos de ejemplo
   (`Bota Chelsea Noir`, `Bota Militar Rugged`, `Sneaker Urban White`, `Stiletto Dorado`,
   `Loafer Cuero Café`, `Sandalia Desert Sand`, `Running Elite X`). Se suman ~13 productos nuevos
   (total ~20) con fotos genéricas **libres y verificadas**, para que la tienda y las
   promociones trabajen sobre un catálogo creíble, no sobre un mock mínimo.
2. **Fix CMS menor** — dos molestias de la sesión admin: (a) al refrescar, la sesión muere aunque
   el token `flores_admin_token` siga en `localStorage`; (b) la página `/admin/configuracion`
   existe pero no está linkeada en el sidebar.
3. **Automatización local n8n** — flujos importables que detectan productos nuevos en Convex y
   generan material promocional (fotos + prompts de posters, y luego descripciones por red) que
   termina en Discord para publicación manual. n8n corre local en la PC del usuario (Docker,
   NO siempre encendido). **Los flujos se diseñan en las fases siguientes; esta propuesta solo
   fija el alcance y las restricciones.**

El cambio NO toca la identidad visual, el código del storefront ni las reglas de marca:
`DESIGN.md`/`PRODUCT.md` se mantienen intactos (no aplican a n8n/Discord/Gemini).

## Problema y oportunidad

- El catálogo semilla tiene 7 productos; las secciones de home y las campañas promocionales
  necesitan un catálogo más completo (~20) para verse y operar reales.
- La sesión admin no sobrevive al refresh: `useAdminAuth` restaura el `token` desde
  `localStorage`, pero deja `user: null` / `isAuthenticated: false`; `AdminLayout` redirige a
  `/admin/login` aunque el token siga siendo válido en `admin_sessions` (expira a las 8 h).
  Ya existe `adminApi.me` (`convex/auth.ts` → `me`) para rehidratar.
- La página `Configuración` (`/admin/configuracion/page.tsx`, hoy "en construcción") quedó
  huérfana: el `Sidebar` no la lista y hasta importa el icono `Settings` sin usarlo.
- Cada campaña de redes hoy exige trabajo manual repetitivo (fotos, prompts, copy por red).
  Un pipeline n8n local con Discord como bandeja de salida reduce esa fricción sin tocar la web.

## Resultado esperado

- Catálogo con ~20 productos activos y fotos verificadas (200 OK + revisión visual).
- Sesión admin que sobrevive refresh y página Configuración accesible desde el sidebar.
- Carpeta `n8n/` en el repo con flujos importables, compose, `.env.example` y README, lista
  para que el usuario la levante local cuando quiera correr la automatización.
- Ningún secreto real en el repo (ver "Regla de seguridad" abajo).

## Alcance incluido (IN)

Superficies y archivos que este change puede tocar:

- **Seed / datos**
  - `convex/seed.ts` (o mecanismo de seed que decida la fase `spec`): sumar ~13 productos
    (total ~20) respetando el shape vigente de la tabla `products`
    (`category_slug` ∈ botas/zapatos/zapatillas/zapatillas-deportivas/tacos, `gender` ∈
    mujer/hombre/unisex/niño, `images[{url,is_primary}]`, `variants[]`, etc.).
  - Fuentes de fotos genéricas libres **verificadas**: cada URL responde 200 y el calzado de la
    foto condice con la categoría del producto. Prohibido en las fotos: amarillo y marcas
    gigantes (salvo placeholder explícitamente marcado como tal).
  - El **estado de datos en Convex NO se commitea** (son datos); solo se commitea el mecanismo
    reproducible (script/seed/documentación) según lo que defina `spec`.
- **Fix CMS**
  - Rehidratación de sesión admin desde `flores_admin_token` vía `adminApi.me` →
    `src/lib/store.ts` (`useAdminAuth`) y/o `src/app/admin/layout.tsx`.
  - Link de `/admin/configuracion` al sidebar → `src/components/admin/Sidebar.tsx`.
- **Entregables n8n (repo)**
  - `n8n/flows/*.json` importables (Flujo A y Flujo B, diseño en fases siguientes).
  - `n8n/docker-compose.yml`, `n8n/.env.example`, `n8n/README.md` (instalación, credenciales,
    importación y ejecución local).

## Alcance excluido (OUT)

- **Diseño de flujos n8n en esta propuesta:** el detalle de nodos, queries, watermark y
  prompts se diseña en `spec.md`/`design.md`. Esta propuesta solo fija alcance y límites.
- Storefront visual (`src/app/(store)/*`, `src/components/store/*`, `globals.css`, tokens):
  este change no altera identidad ni reglas de marca.
- Backend Convex fuera de seed/sesión: no se rediseña `schema.ts` ni se toca `orders`,
  `cms_banners`, `cms_sections` salvo lectura.
- Producción / VPS: no se despliega ni se modifica el `docker-compose` del VPS; n8n es local.
- Ejecutar realmente los flujos o publicar en Discord: el entregable es configuración + docs;
  la corrida la hace el usuario en su PC.
- No se sube a Cloudinary ni se cambia `next.config.ts` en este change salvo que `design.md` lo
  justifique explícitamente (y eso quedaría sujeto a review, no es el objetivo).
- Credenciales reales de ningún servicio (ver regla siguiente).

## Regla de seguridad INQUEBRANTABLE (secretos)

- **JAMÁS** escribir en archivos del repo, artefactos openspec o reportes ninguna key real ni
  URL de webhook real — en particular la key de Google pegada en el chat.
- En todo código/config/documentación usar exclusivamente placeholders vía entorno:
  `$GEMINI_API_KEY` y `${DISCORD_WEBHOOK_URL}`.
- `n8n/.env.example` solo con nombres de variables y valores vacíos/placeholder (nunca reales).
- `.env*` ya está en `.gitignore`; no forzar su commit bajo ninguna circunstancia.
- Verificación previa a todo commit: grep de que no existan keys/URLs reales en el diff.

## Contexto técnico verificado (exploración ligera de init)

- Catálogo actual: 7 productos en `convex/seed.ts` (solo se siembran si la tabla está vacía) y
  5 categorías. Orden estable por `_creationTime` (ya se usa en `src/lib/api.ts`).
- Sesión admin: `auth.login` crea `admin_sessions` (token hex 48, 8 h); `auth.me` valida token;
  `checkAuth` protege queries/mutations. Cliente admin guarda el token en `localStorage` con la
  clave `flores_admin_token`.
- **Hallazgo para `spec` (no se diseña aquí):** Flujo A prevé una "marca de agua por
  `_creationTime` en staticData", pero el schema actual no tiene tabla `staticData`
  (tablas: `categories`, `products`, `orders`, `cms_banners`, `cms_sections`, `admin_users`,
  `admin_sessions`). Dónde vive esa marca de agua (tabla nueva vs `cms_sections`/`settings`) es
  decisión de `spec.md`.
- Stack: Next.js 16 (App Router) + Convex (`dev:curious-ox-401`) + Cloudinary `dggj5tnke`.
- Sin runner de tests unitarios; verificación = `npm run lint` + `npm run build` + greps/manual.
- El repo no tiene aún directorio `n8n/`.

## Riesgos y decisiones abiertas (a resolver en spec/design)

- **Mecanismo del seed:** productos nuevos en `seed.ts` commiteado vs script de una corrida vs
  alta por dashboard. Impacta la regla "estado Convex no se commitea".
- **Fuentes de imágenes:** hotlink a fuentes libres vs subida a Cloudinary; si se agrega dominio
  nuevo hay que tocar `next.config.ts` (fuera de alcance salvo justificación en `design.md`).
- **Dependencia de servicios externos:** Discord webhook y Google AI Studio se prueban en la PC
  del usuario; el repo no puede verificar 200 del webhook ni la key.
- **config.yaml desactualizado:** describe el change archivado `redesign-editorial-total`
  (storefront) y sus `phase_rules` prohíben tocar `convex/`, `admin`, etc. — exactamente lo que
  este change SÍ toca. Se recomienda regenerarlo para `catalogo-n8n-discord` antes de la fase
  `spec` (responsabilidad del orquestador; no se reescribe aquí por ser config mantenida).

## Definición de listo del change

- Seed aplicado en Convex dev con ~20 productos, fotos verificadas y revisadas visualmente.
- Sesión admin sobrevive refresh y `Configuración` visible en el sidebar.
- `n8n/` con flujos importables, compose, `.env.example` (sin secretos) y README completo.
- `npm run lint` y `npm run build` verdes; sin secretos reales en el diff.
- Documentos de fase del change actualizados (spec/design/tasks/apply/verify) y archivados.

---

_Documento de fase `proposal`. Los flujos n8n NO se diseñan todavía: pasan a `spec.md`._
