# Tasks — Catálogo + fix CMS + n8n → Discord

## Estado

- **Fase:** tasks (descomposición lista para apply)
- **Change:** `catalogo-n8n-discord` · Branch: `sdd/catalogo-n8n-discord`
- **Depende de:** `spec.md` (22 req, 10 grupos) y `design.md` (11 archivos, 3 slices) aprobados.
- **Fuentes de verdad para AC:** `spec.md` (criterios de aceptación). `design.md` es el plano técnico; donde un AC de spec no sea alcanzable con el plano, la tarea indica la corrección explícita.
- **Runners:** `npm run lint`, `npm run build`. Sin runner de tests unitarios (verificación = greps, conteos Convex, pruebas manuales, revisión visual).
- **Orden de apply:** T1 → T7. Agrupación por PRs la decide el gate `ask-on-risk` al medir el diff (sección Gates).

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ≈1.650–2.000 (additions + deletions netas) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 (T1 seed) → PR2 (T2 API + T3 admin) → PR3 (T4 Flujo A) → PR4 (T5 Flujo B) → PR5 (T6 + T7 n8n docs y verificación) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes

Chained PRs recommended: Yes

Chain strategy: pending

400-line budget risk: High

**Justificación del pronóstico:** el seed de 13 productos (`convex/seed.ts`) proyecta ~450–650 líneas solo; los dos workflows JSON (`n8n/flows/*.json`) son archivos verbosos (~350–450 c/u); docs y compose aportan ~200. Ninguna tarea individual cabe en un PR de 400 líneas sin agrupar; el único archivo que puede exceder 400 por sí solo es `convex/seed.ts` (unidad de datos de un solo archivo). Antes de apply el ejecutor medirá el diff real y el gate `ask-on-risk` decidirá: `size-exception` para el seed o subdivisión de la inserción en 2 commits/PRs (T1a guard + primeros productos, T1b resto). No se infiere excepción ni cadena sin esa decisión.

---

## T1 — Seed idempotente por slug + 13 productos (variantes v26+, fotos verificadas)

**Archivos:** `convex/seed.ts` (único archivo de datos; no crear tablas ni archivos nuevos).

**AC**

- [x] Reescribir el bloque 5 de `convex/seed.ts`: reemplazar el guard "solo-si-tabla-vacía" por un loop que, para cada producto de `allProducts`, consulta el índice existente `by_slug` (`withIndex("by_slug", (q) => q.eq("slug", slug)).unique()`) e inserta únicamente si no existe; log de `Inserted`/`Skipped` por slug. Los bloques 1–4 (admin, categorías, cms_sections, banners) permanecen con su guard actual sin cambios. <!-- sdd-owner: implementation -->
- [x] `allProducts = [...existingProducts (7 actuales, sort_order 1–7, variantes v1–v25, texto literal intacto), ...newProducts (13 nuevos)]`. Ningún slug/`sort_order`/id de variante de los 7 existentes se modifica. <!-- sdd-owner: implementation -->
- [x] Los 13 nuevos cumplen la tabla de `design.md` §1.3 (nombres, slugs, categorías ∈ {botas, zapatos, zapatillas, zapatillas-deportivas, tacos}, géneros, precios base/compare en Bs, tags) y el shape del schema: `brand: "Flores"`, `sort_order` únicos en 8–20, `is_active: true`, flags `is_featured` (~4 de 13) e `is_new` (~6 de 13), `description`/`short_desc` coherentes. <!-- sdd-owner: implementation -->
- [x] Variantes de los nuevos: `id` `v26`–`v84` (globalmente únicos contra v1–v25 y entre sí), rangos de talle por producto según `design.md` §1.3–1.4, `sku` patrón `{slug}-{talle}`, stock 2–15, `color`, `is_active: true`; mínimo 1 variante activa por producto. <!-- sdd-owner: implementation -->
- [x] Imágenes de los 13: exclusivamente dominio `images.unsplash.com` (ya permitido en `next.config.ts`), ≥1 imagen `is_primary: true` por producto. Antes de cerrar la tarea, cada URL responde `200 OK` (`curl -I`) y pasa revisión visual: calzado acorde a la `category_slug`, sin amarillo Aria (#FFD700/#FFB300/#FFC107/#E5C400) dominante, sin marcas/logotipos de terceros prominentes. Lista final de URLs verificadas documentada en el PR. <!-- sdd-owner: implementation -->
- **Nota de implementación (sin checkbox):** para mantener el diff acotado y legible, usar helpers de construcción (p.ej. generador de variantes por rango de talles con stock y sku derivados) en lugar de repetir objetos completos; el documento insertado debe seguir siendo idéntico al shape del schema.

**Verificación**

- [x] Re-ejecutar el seed 2 veces contra la línea base canónica (7 productos previos): 1ª corrida inserta 13 y loguea 7 `Skipped`; 2ª corrida loguea 20 `Skipped` y 0 inserciones. Conteo final `products == 20 ± 0`, 0 slugs duplicados, 5 categorías intactas. <!-- sdd-owner: implementation -->
- [x] Post-seed, verificar unicidad global de variantes: cada `id` de variante existe en exactamente 1 producto (`count == 1`) y 0 colisiones tras re-ejecución (dashboard o consulta Convex). <!-- sdd-owner: implementation -->
- [x] `curl -I` por cada URL de imagen → 0 respuestas 4xx/5xx; grep del diff de imágenes → solo `images.unsplash.com` (0 `pexels.com`/`cloudinary.com`/otro dominio). <!-- sdd-owner: implementation -->
- [x] `npm run lint` y `npm run build` en verde; sin cambios fuera de `convex/seed.ts`. <!-- sdd-owner: implementation -->

**Rollback:** restaurar `convex/seed.ts` al seed anterior. La nueva lógica solo inserta por slug; no ejecutar un seed viejo esperando borrado automático (ver `proposal.md`).

---

## T2 — Endpoint HTTP Convex + query de recientes

**Archivos:** `convex/products.ts` (query pública), `convex/http.ts` (nuevo, `httpAction` GET + OPTIONS), `convex/_generated/*` (regenerados).

**AC**

- [x] En `convex/products.ts`, agregar query pública `getRecentProducts` (sin `checkAuth`) con `args: { limit: v.optional(v.number()) }`. Normalizar `limit`: default 50, tope máximo 100, mínimo 1 (`Math.min(Math.max(1, floor(limit ?? 50)), 100)`). <!-- sdd-owner: implementation -->
- [x] Orden estricto por `_creationTime` descendente. **Corrección al plano:** NO usar `.withIndex("by_new")` — ese índice ordena por `is_new` primero (rompe el AC "más nuevos primero" de spec Grupo 6). Usar la ordenación por el índice por defecto (`ctx.db.query("products").order("desc")`), que ordena por `_creationTime` desc, con `.take(limit)`. Prohibido `.filter()` no acotado previo al `take` y `.collect()` sin `take`. <!-- sdd-owner: implementation -->
- [x] Devolver solo campos públicos promocionales + `_creationTime` explícito: `id` (`_id`), `name`, `slug`, `description`/`short_desc` (si existen), `category_slug`, `gender`, `brand`, `base_price`, `compare_price?`, `is_featured`, `is_new`, `tags`, `images`. Filtrar `p.is_active`. NO exponer `variants`, sesiones, credenciales, flags internos ni secretos. <!-- sdd-owner: implementation -->
- [x] Crear `convex/http.ts` con `httpRouter` y `httpAction` GET en `/products/latest`: sin auth; ejecuta `ctx.runQuery(api.products.getRecentProducts, { limit })`; responde `200` `application/json` con `{ products: [...] }`. Manejo de `limit` en el handler: ausente → 50; no numérico o `< 1` → `400` con `{ error: string }`; `> 100` → 200 con clamp a 100. `try/catch` sobre `runQuery` → `400 { error }`. Sin datos admin/secretos en el cuerpo ni headers. <!-- sdd-owner: implementation -->
- [x] Ruta `OPTIONS` `/products/latest` para preflight CORS (204 + `Access-Control-Allow-*`). Export default del router. <!-- sdd-owner: implementation -->
- [x] Regenerar `convex/_generated` con el CLI de Convex (codegen/dev) para que `api.products.getRecentProducts` exista en los tipos generados antes de `lint`/`build`. <!-- sdd-owner: implementation -->

**Verificación**

- [x] `curl -i 'https://<deployment>.convex.site/products/latest?limit=50'` → `200` JSON con `{ products }` de ≤50 elementos, `_creationTime` no creciente (desc), sin campos `variants`/admin; sin challenge de auth. <!-- sdd-owner: implementation -->
- [x] `curl '.../products/latest?limit=abc'` y `'...?limit=-1'` → `400 { error }`; `'...?limit=500'` → 200 con ≤100 elementos. <!-- sdd-owner: implementation -->
- [x] Grep del diff (`convex/products.ts`, `convex/http.ts`): 0 secretos; ausencia de `withIndex("by_new")` dentro de `getRecentProducts`; ausencia de `admin_sessions`/`admin_users`/`password`/`token`/`webhook`/`api_key` en la query. <!-- sdd-owner: implementation -->
- [x] `npm run lint` y `npm run build` en verde. <!-- sdd-owner: implementation -->

**Rollback:** retirar/deshabilitar `convex/http.ts` y borrar la query; sin cambios en `schema.ts`. Catálogo y queries existentes intactos.

---

## T3 — Fix sesión admin (rehidratación + gate) + sidebar Configuración

**Archivos:** `src/lib/store.ts`, `src/app/admin/layout.tsx`, `src/components/admin/Sidebar.tsx`.

**AC**

- [x] En `src/lib/store.ts`, extender `AdminAuthStore` con `isHydrating: boolean` y `rehydrate: () => Promise<void>`. `rehydrate()`: si no hay token persistido (`localStorage["flores_admin_token"]`) → `isHydrating: false` y return; si hay token → `isHydrating: true`, llama `adminApi.me()`; éxito (`result.data?.success && result.data?.user`) → `{ token, user, isAuthenticated: true, isHydrating: false }`; fallo (success false, token vencido/inactivo) o excepción de red → `logout()` (limpia `localStorage` y estado), `isHydrating: false`, sin loop. <!-- sdd-owner: implementation -->
- [x] En `src/app/admin/layout.tsx`, gate de hidratación: `useEffect` (montaje) dispara `rehydrate()` cuando `token && !isAuthenticated && !isHydrating && pathname !== "/admin/login"`. Render: `null` mientras `!mounted` o `isHydrating`; `/admin/login` sin sidebar; redirect a `/admin/login` solo con `(!isAuthenticated && !isHydrating)` y `pathname !== "/admin/login"`. Sin render de contenido admin protegido durante el estado transitorio (sin parpadeo). <!-- sdd-owner: implementation -->
- [x] En `src/components/admin/Sidebar.tsx`, añadir a `navItems` `{ name: "Configuración", href: "/admin/configuracion", icon: Settings }` reutilizando el `Settings` ya importado de `lucide-react` (queda referenciado, no es import muerto). El patrón `isActive = pathname.startsWith(item.href)` se conserva para todos los items. <!-- sdd-owner: implementation -->

**Verificación**

- [x] Refresh (F5) en `/admin/dashboard`, `/admin/inventario`, `/admin/configuracion`, `/admin/productos/nuevo` con token válido (≤8 h): `rehydrate()` completa antes del redirect y renderiza el contenido protegido sin pasar por `/admin/login` ni parpadear. Deep-link directo a ruta protegida funciona. <!-- sdd-owner: implementation -->
- [x] Con token expirado/revocado o `admin_users.is_active === false`: refresh en ruta admin limpia `flores_admin_token`, aterriza en `/admin/login`, sin render transitorio de UI admin. <!-- sdd-owner: implementation -->
- [x] Click en "Configuración" navega a `/admin/configuracion` y el item queda activo (clase activa/`aria-current`) mientras el pathname empieza por `/admin/configuracion`. <!-- sdd-owner: implementation -->
- [x] Grep de `Settings` en `Sidebar.tsx`: exactamente 1 uso dentro de `navItems` y el import; `npm run lint` y `npm run build` en verde. <!-- sdd-owner: implementation -->

**Rollback:** revertir `store.ts` + `layout.tsx` + `Sidebar.tsx` como una unidad si el gate introduce redirects o regresiones de navegación.

---

## T4 — Flujo A: detección → watermark → Gemini (3 prompts) → Discord

**Archivos:** `n8n/flows/flujo-a-catalogo.json` (nuevo, workflow n8n v1 importable).

**AC**

- [x] Workflow n8n v1 importable (claves `name`, `nodes`, `connections`, `settings.executionOrder: "v1"`). Nodos según `design.md` §4: scheduleTrigger (`typeVersion` 1.x) con `triggerAtStartup: true` (**onStartup** para catch-up) + cron horario; HTTP Request Convex; Code de filtro; HTTP Gemini; HTTP Discord; Code de watermark. Conexiones en línea recta según §4.3. <!-- sdd-owner: implementation -->
- [x] El nodo HTTP Convex hace `GET {base}/products/latest?limit=50` donde `{base}` es `{{ $env.CONVEX_SITE_URL }}` (referencia por entorno; **corrección al plano**: no incrustar el host `*.convex.site` literal en el JSON para no exponer una URL interna en el repo). <!-- sdd-owner: implementation -->
- [x] Nodo Code "Filter": lee `$getWorkflowStaticData('global').lastCreationTime` (`|| 0`) y filtra los productos del endpoint con `_creationTime > watermark`; devuelve un item por producto pendiente (procesa TODO el lote pendiente, no solo el último); si no hay pendientes, devuelve `{ skip: true }`. <!-- sdd-owner: implementation -->
- [x] Nodo Gemini: URL con `key={{ $env.GEMINI_API_KEY }}` (referencia por entorno; nunca valor `AIza...`). El prompt pide **exactamente 3 bloques distinguibles de copy/prompt por producto** (spec Grupo 7 — el ejemplo de `design.md` §4.2 trae solo 2 campos; extender a 3 secciones numeradas) + datos del producto (nombre, slug, precio, categoría, marca, imagen primaria). <!-- sdd-owner: implementation -->
- [x] Nodo Discord: POST a `{{ $env.DISCORD_WEBHOOK_URL }}` (nunca URL literal) con un embed por producto: imagen (primaria; fallback primera imagen), título destacado, `base_price`, `category_slug`, `brand` y las **3 secciones numeradas** del copy legibles para revisión humana. <!-- sdd-owner: implementation -->
- [x] Nodo Code "Update Watermark": actualiza `global.lastCreationTime = max(_creationTime)` del lote (vía `$('Filter New Products').all()`) SOLO tras envío exitoso del lote. El workflow NO usa `continueOnFail` (error de Discord/Gemini detiene la ejecución y conserva el watermark previo para reintento). <!-- sdd-owner: implementation -->
- [x] Sin secretos literales en el JSON (sin `AIza...`, sin URL de webhook real, sin host Convex literal, sin tokens). <!-- sdd-owner: implementation -->

**Verificación**

- [x] `JSON.parse` del archivo válido; importación sin error en n8n v1 (compose local de T6 o n8n instalado). <!-- sdd-owner: implementation -->
- [x] Greps estructurales: presencia de `triggerAtStartup`, `$getWorkflowStaticData('global').lastCreationTime`, `$env.GEMINI_API_KEY`, `$env.DISCORD_WEBHOOK_URL`, `$env.CONVEX_SITE_URL`, instrucción de 3 bloques, y 0 coincidencias del patrón de secretos de spec §10. <!-- sdd-owner: implementation -->
- [x] Corrida real (credenciales del usuario): con n8n apagado se crea un producto; al arrancar, `onStartup` procesa el pendiente y avanza el watermark tras `200` de Discord; una 2ª corrida sin novedades no reenvía nada. Si Discord devuelve 4xx/5xx el watermark NO avanza. <!-- sdd-owner: implementation -->

**Rollback:** desactivar el workflow importado; el seed y el CMS siguen operando. Sin watermark en Convex (persistencia solo en staticData de n8n).

---

## T5 — Flujo B: posters + 4 descripciones ES-BO por red → Discord

**Archivos:** `n8n/flows/flujo-b-posters.json` (nuevo, workflow n8n v1 importable).

**AC**

- [x] Workflow n8n v1 importable; disparador `manualTrigger` (`typeVersion` 1) según `design.md` §5 (se documenta si se agrega un `webhook` opcional). Nodos: Manual → HTTP Convex → Code Select → HTTP Gemini → HTTP Discord, conexiones según §5.3. <!-- sdd-owner: implementation -->
- [x] Resolución del producto: consulta `GET {base}/products/latest?limit=50` con `{base} = {{ $env.CONVEX_SITE_URL }}` y selecciona producto en el nodo Code (default: el más reciente; el operador puede filtrar por `slug`/`_id` editando el nodo). <!-- sdd-owner: implementation -->
- [x] Generación Gemini por producto: URL con `key={{ $env.GEMINI_API_KEY }}`. El prompt pide material de poster (`poster_concept`) + **4 descripciones etiquetadas**: TikTok (hook + descripción con hashtags), Facebook (headline + descripción con CTA), Instagram (caption + story), WhatsApp (mensaje con `*negritas*`, precio y CTA). <!-- sdd-owner: implementation -->
- [x] **Multimodal cuando hay imagen utilizable** (spec Grupo 8): el JSON incluye nodo(s) para descargar la imagen primaria (HTTP GET binario) + Code node que la codifica a base64 y arma el request a Gemini con `inline_data` + `mimeType`, junto al texto del prompt. Si la descarga/imagen falla, el flujo degrada a prompt textual con referencia a la URL (comportamiento documentado en el README de T6). <!-- sdd-owner: implementation -->
- [x] Las instrucciones del prompt exigen **español boliviano neutro**: 0 voseo rioplatense (prohibir en el texto generado patrones tipo `(compr|pag|eleg|envi|recib|us|revis|compart|hac)[aá]s\b` y `[aá]s (tu|el|este|lo|los)`), sin tuteo mezclado con voseo. <!-- sdd-owner: implementation -->
- [x] Nodo Discord: POST a `{{ $env.DISCORD_WEBHOOK_URL }}` con payload estructurado: embed de poster (concepto + imagen primaria + precio) + 4 embeds/bloques etiquetados por red (TikTok, Facebook, Instagram, WhatsApp) listos para revisión/publicación manual. El flujo NO publica en redes externas ni modifica el storefront. <!-- sdd-owner: implementation -->
- [x] Sin secretos literales (mismas reglas que T4). <!-- sdd-owner: implementation -->

**Verificación**

- [x] `JSON.parse` válido; importación sin error en n8n v1. <!-- sdd-owner: implementation -->
- [x] Greps estructurales: etiquetas de las 4 redes presentes en el nodo Discord; referencia `inline_data`/imagen en el request Gemini; `$env.GEMINI_API_KEY`, `$env.DISCORD_WEBHOOK_URL`, `$env.CONVEX_SITE_URL`; 0 secretos según patrón de spec §10. <!-- sdd-owner: implementation -->
- [x] Corrida manual de muestra (credenciales del usuario): el mensaje de Discord contiene poster + 4 bloques etiquetados y revisión humana confirma 0 voseo rioplatense en los 4 bloques. <!-- sdd-owner: implementation -->

**Rollback:** desactivar el workflow; salida editorial únicamente a Discord (no hay publicaciones automáticas que revertir).

---

## T6 — Entregables `n8n/`: compose local + env + README

**Archivos:** `n8n/docker-compose.yml`, `n8n/.env.example`, `n8n/README.md` (nuevos). No hay compose de VPS en el repo: este compose es exclusivamente local.

**AC**

- [x] `n8n/docker-compose.yml`: imagen oficial de n8n (`docker.n8n.io/n8nio/n8n`), puerto `5678`, volumen persistente `n8n_data`, `env_file: .env`, `GENERIC_TIMEZONE` (p.ej. `America/La_Paz`), `restart: unless-stopped`. Sin credenciales por defecto inline (exigir `${N8N_USER}`/`${N8N_PASSWORD}` desde `.env`, sin defaults con contraseñas adivinables) y sin secretos literales. <!-- sdd-owner: implementation -->
- [x] `n8n/.env.example`: variables `GEMINI_API_KEY`, `DISCORD_WEBHOOK_URL`, `CONVEX_SITE_URL`, `N8N_USER`, `N8N_PASSWORD`, `N8N_HOST`, `N8N_PORT`, `WEBHOOK_URL`, `GENERIC_TIMEZONE`, `N8N_ENCRYPTION_KEY` (y opcionales requeridas por n8n) con placeholders obvios (`change-me`, forma de URL sin segmentos reales tipo `hooks/XXXX/YYYY`). 0 valores reales. <!-- sdd-owner: implementation -->
- [x] `n8n/README.md` operativo que cubra como mínimo: requisitos (Docker, claves propias); instalación (`cp .env.example .env`, completar, `docker compose up -d`); acceso `http://localhost:5678`; importación de ambos workflows; ejecución manual del Flujo B y selección de producto; arranque del Flujo A con `onStartup` y catch-up (watermark por `_creationTime`); comportamiento con n8n apagado (recuperación al próximo arranque); diagnóstico Gemini `400/401/429` y Discord `4xx/5xx`; rotación de secretos (`docker compose down` → editar `.env` → `up -d`). Sin secretos reales. <!-- sdd-owner: implementation -->

**Verificación**

- [x] Grep sobre `n8n/`: 0 coincidencias del patrón de secretos de spec §10 (los únicos valores que aparecen son placeholders de `.env.example` y no matchean el regex). <!-- sdd-owner: implementation -->
- [x] `docker compose config` válido (o revisión YAML manual) y `git check-ignore n8n/.env` devuelve el path (`.env*` ya cubierto en `.gitignore`). <!-- sdd-owner: implementation -->
- [x] Levantar el compose y seguir el README de principio a fin permite importar y ejecutar ambos flujos sin conocer detalles internos del repo. <!-- sdd-owner: implementation -->

**Rollback:** detener el compose (`docker compose down`), eliminar workflows importados; `.env` queda fuera del repo.

---

## T7 — Verificación integral del change + medición de presupuesto

**Archivos:** verificación sobre el diff completo (`convex/`, `src/`, `n8n/`, `.gitignore`). No introduce cambios de código salvo ajustes menores (p.ej. patrón de ignorado si faltara).

**AC**

- [x] Re-ejecutar el seed 2 veces: 2ª corrida sin duplicados (20 ± 0 filas sobre la línea base canónica, 0 slugs duplicados, 0 colisiones de id de variante, 5 categorías intactas). <!-- sdd-owner: implementation -->
- [x] Endpoint HTTP: `curl -i 'https://<deployment>.convex.site/products/latest?limit=50'` → 200 JSON ordenado por `_creationTime` desc, sin campos admin/secretos; casos de error `400` verificados (T2). <!-- sdd-owner: implementation -->
- [x] Sesión admin: refresh con token válido conserva acceso en `/admin/dashboard`, `/admin/inventario`, `/admin/configuracion`, `/admin/productos/nuevo`; token vencido limpia estado y aterriza en `/admin/login` sin parpadeo; item Configuración navega y queda activo. <!-- sdd-owner: implementation -->
- [x] Importación de `n8n/flows/*.json` sin errores en n8n v1 (si hay Docker/n8n disponible; en su defecto queda validación estructural JSON + greps como mínimo verificado y se registra la limitación). <!-- sdd-owner: implementation -->
- [x] Grep de secretos (patrón de spec §10: `AIza[...]`, `xox[...]`, `hooks/[...]`, `sk-[...]`, `ghp_[...]`, `convex.cloud/[...]/[...]`) sobre el diff y `n8n/` → 0 coincidencias fuera de placeholders explícitos del propio `.env.example`. <!-- sdd-owner: implementation -->
- [x] Greps de marca heredados (aplican solo a `src/`): 0 hex de amarillo Aria (#FFD700/#FFB300/#FFC107/#E5C400) nuevos y 0 cambios en componentes del storefront (los cambios `src/` se limitan a `lib/store.ts`, `app/admin/layout.tsx`, `components/admin/Sidebar.tsx`). <!-- sdd-owner: implementation -->
- [x] `npm run lint` y `npm run build` en verde. <!-- sdd-owner: implementation -->
- [x] Medición del diff total (additions + deletions por archivo, p.ej. `git diff --stat` vs la base del change) y registro del resultado junto al forecast de esta fase para alimentar el gate de presupuesto. <!-- sdd-owner: implementation -->

---

## Gates de ciclo y revisión (post-apply, propiedad del orquestador)

- [ ] Ante el forecast High (>400 líneas) y/o la medición de T7, decidir el delivery con `ask-on-risk`: aprobar `size-exception` para el seed de un solo archivo, subdividir la inserción de T1 en 2 unidades, o autorizar una cadena de PRs con su estrategia concreta (`stacked-to-main` vs `feature-branch-chain`). NO inferir excepción ni encadenar sin esta decisión. <!-- sdd-owner: parent -->
- [ ] Bounded review post-apply del diff combinado, por PR encadenado (≤400 líneas por PR o excepción autorizada explícitamente), cubriendo la verificación transversal de spec: conteo del seed, endpoint, sesión/sidebar, workflows importables y greps de secretos. <!-- sdd-owner: parent -->
- [ ] Gate de vida útil: confirmar fases `verify` (runners verdes) y `archive` (mover `openspec/changes/catalogo-n8n-discord` a `openspec/archive/`) al cierre. <!-- sdd-owner: parent -->
