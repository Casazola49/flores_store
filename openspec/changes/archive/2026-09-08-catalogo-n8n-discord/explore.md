# Explore — Catálogo + fix CMS + n8n → Discord (`catalogo-n8n-discord`)

Fase: **solo lectura**. Inventario del estado actual del código contra el encargo del
orquestador. Store: openspec. Rama: `sdd/catalogo-n8n-discord` (scaffold `b8eea51`).
Alcance IN: seed (`convex/seed.ts`), sesión admin (`src/lib/store.ts` +
`src/app/admin/layout.tsx`), sidebar (`src/components/admin/Sidebar.tsx`), query pública
Convex para n8n, entregables `n8n/`. OUT: storefront visual, `schema.ts`, VPS/producción.
Regla de secretos transversal: solo `$GEMINI_API_KEY` / `${DISCORD_WEBHOOK_URL}`, nunca
valores reales.

## Respuestas al encargo

### (1) Mecanismo de seed actual y cómo extender a ~13 productos sin duplicar

**Archivo:** `convex/seed.ts` — exporta la mutation `run` (args `{}`), se invoca manualmente
desde el dashboard Convex / `npx convex run seed:run` (no hay cron ni trigger automático).

Qué inserta, en orden, cada bloque **solo si la tabla está vacía** (`.collect()` + `length === 0`):

| Bloque | Tabla | Qué inserta | Guard |
|---|---|---|---|
| 1 | `admin_users` | 1 admin `flores` (bcrypt `wilstermann1949*`, role `superadmin`) | solo-si-vacío |
| 2 | `categories` | 5 categorías (botas, zapatos, zapatillas, zapatillas-deportivas, tacos) | solo-si-vacío |
| 3 | `cms_sections` | 15 settings (whatsapp, socials, announcement, hero, vip_vault, countdown) | solo-si-vacío |
| 4 | `cms_banners` | 1 banner hero | solo-si-vacío |
| 5 | `products` | **7 productos** (Bota Chelsea Noir, Bota Militar Rugged, Sneaker Urban White, Stiletto Dorado, Loafer Cuero Café, Sandalia Desert Sand, Running Elite X) con `images[]` y `variants[]` **embebidos** (insert atómico, no hay tablas separadas de variantes/imágenes) | solo-si-vacío |

**Problema clave para extender:** el guard del bloque 5 es "toda la tabla vacía". En el dev
Convex **ya existen** esos 7 productos, así que re-ejecutar `seed.run` **no inserta los ~13
nuevos** aunque se los agregue al array. Duplicar no es el riesgo inmediato; el riesgo es que
**nunca se inserten** en una BD ya sembrada.

**Mecanismo recomendado (idempotente, sin duplicar):** cambiar el bloque de productos de
"solo-si-tabla-vacía" a **insert por slug** usando el índice existente `by_slug`:

```ts
for (const prod of mockProductsToInsert) {
  const existing = await ctx.db.query("products")
    .withIndex("by_slug", (q) => q.eq("slug", prod.slug))
    .unique();
  if (!existing) await ctx.db.insert("products", prod);
}
```

Así `seed.run` es re-ejecutable y solo inserta lo faltante (mismo patrón que ya usa
`createProduct` en `convex/products.ts` para chequear slug único). El índice `by_slug` ya
existe en `convex/schema.ts`, no requiere tocar el schema.

**Shape vigente de `products` (a respetar en los ~13 nuevos):**
- Requeridos: `name`, `slug`, `category_slug` (∈ 5 slugs), `gender` (mujer|hombre|unisex|niño),
  `brand`, `base_price`, `is_featured`, `is_new`, `is_active`, `tags: string[]`,
  `sort_order`, `images: {url,is_primary}[]`, `variants: {id, stock, is_active, size?, color?,
  sku?, price?}[]`.
- Opcionales: `description`, `short_desc`, `compare_price` (`compare_price` > `base_price`
  habilita el tachado de oferta en `getProducts` con `sale`).
- `sort_order` debe continuar 8..20 (los 7 actuales usan 1..7).

**Gotcha no obvio (crítico):** los ids de variante son **embebidos por producto pero se
buscan globalmente** — `adjustStock`, `updateVariant` y `deleteVariant`
(`convex/products.ts`) hacen `.collect()` sobre todos los productos y `.find(v => v.id ===
variantId)`. El seed actual usa ids `v1..v25` únicos. Los ~13 productos nuevos **deben usar
ids nuevos no colisionantes** (ej. `v26+`); si se reutiliza un `id`, esas mutations editarían
la variante del producto equivocado.

**Fuentes de imágenes:** el seed actual hotlinkea `images.unsplash.com` (dominio YA permitido
en `next.config.ts`). Para no tocar `next.config.ts` (OUT salvo justificación), los nuevos
productos deben seguir en Unsplash con URLs verificadas (200 OK + calzado acorde a categoría;
sin amarillo ni marcas gigantes).

### (2) Archivos exactos del fix de sesión admin y del sidebar

**Bug sesión admin (muere en refresh):**

| Archivo | Rol | Estado actual |
|---|---|---|
| `src/lib/store.ts` | `useAdminAuth` (Zustand, `create` sin `persist`) | Estado inicial: `token` se lee de `localStorage.getItem("flores_admin_token")` (con guard `typeof window`), pero `user: null` e `isAuthenticated: false`. Solo existen `setAuth` y `logout`. **No hay `rehydrate`.** |
| `src/app/admin/layout.tsx` | `AdminLayout` (guard) | `useEffect` hace `if (!isAuthenticated && pathname !== "/admin/login") router.push("/admin/login")`. Como el store nunca rehidrata `user`/`isAuthenticated`, un refresh con token válido **redirige igual a login**. |
| `src/lib/api.ts` | `adminApi.me()` | **Ya existe y es reutilizable**: lee el token de localStorage y llama `convexApi.auth.me` → `{ success, user }`. |
| `convex/auth.ts` | `me` (query) | Valida `admin_sessions.by_token`, chequea expiración (8 h) y `admin_users.is_active`; retorna `{ success, user: { username, role } }`. |
| `src/app/admin/login/page.tsx` | login | Confirma el flujo: `adminApi.login` → `setAuth(token, user)` → `router.push("/admin/dashboard")`. |

**Fix propuesto (diseño en `design.md`):**
1. `src/lib/store.ts`: agregar acción `rehydrate()` a `useAdminAuth` que llame
   `adminApi.me()`; si `success` → `set({ token, user, isAuthenticated: true })`; si no →
   `logout()` (limpia token vencido).
2. `src/app/admin/layout.tsx`: estado `hydrating` (o equivalente) + `useEffect` que, si hay
   `token` pero `!isAuthenticated`, espere `rehydrate()` **antes** de decidir el redirect
   (evita el parpadeo y la redirección en falso). El redirect actual debe posponerse hasta
   terminar la hidratación.

**Sidebar (link faltante + icono sin uso):**

| Archivo | Estado |
|---|---|
| `src/components/admin/Sidebar.tsx` | Importa `Settings` de `lucide-react` **pero no lo usa** (import muerto). `navItems` lista solo: Dashboard, Inventario, Productos, Pedidos, CMS Tienda. **Falta `/admin/configuracion`.** El `isActive` ya usa `pathname.startsWith(item.href)`. |
| `src/app/admin/configuracion/page.tsx` | Existe (página "en construcción") pero quedó huérfana. |

**Fix:** agregar `{ name: "Configuración", href: "/admin/configuracion", icon: Settings }` a
`navItems` — esto además consume el `Settings` hoy importado sin uso.

### (3) Query pública Convex para que n8n detecte productos nuevos

**Lo que ya existe (sin auth):** `api.products.getProducts` (`convex/products.ts`) es pública
(sin token). Pero:
- Ordena por `sort_order` asc, **no** por `_creationTime`.
- Retorna `{ data, total, page, per_page }`, cada ítem `{ ...p, id: p._id }` → **sí expone
  `_creationTime`** (number, epoch ms) y `_id` por el spread `...p`, pero no hay orden por
  creación ni filtro `since`.
- `limit` default 20, sin tope servidor (el front usa hasta 1000 en admin).

**Lo que falta (hallazgo para spec):**
- **No existe `convex/http.ts`** (verificado: no hay archivo http.ts en `convex/`). Por tanto
  hoy **n8n no tiene un endpoint HTTP plano** que consumir: el protocolo de cliente Convex
  (ConvexHttpClient sobre `/api/query`) no lo puede hablar un nodo HTTP Request de n8n
  directamente.
- **Recomendación:** (a) nueva query pública/acotada, p.ej. `getRecentProducts({ limit })`
  que use `.order("desc").take(limit)` (Convex ordena por `_creationTime` asc por defecto;
  `.order("desc")` = más nuevos primero) y devuelva `_creationTime` explícito; y (b) un
  `convex/http.ts` con `httpAction` GET (p.ej. `/products/latest?limit=50`) que la ejecute y
  devuelva JSON plano. Host de HTTP Actions: `https://curious-ox-401.convex.site`
  (deployment `dev:curious-ox-401`; URL cloud `https://curious-ox-401.convex.cloud`).
- Seguir las guías Convex (`convex/_generated/ai/guidelines.md`): evitar `.filter()` y
  `.collect()` no acotados; usar `.order()` + `.take()`/`paginate`. El filtro por watermark
  (`_creationTime > since`) conviene hacerlo en memoria sobre los últimos N, no con `.filter()`.

**Watermark (`staticData`):** no existe tabla `staticData` (tablas reales: `categories`,
`products`, `orders`, `cms_banners`, `cms_sections`, `admin_users`, `admin_sessions`). La
marca de agua de "último producto procesado" conviene vivir **dentro de n8n** (ver §4), no en
Convex: escribirla en Convex requeriría una mutation con token (todas las mutations de
`settings.ts` pasan por `checkAuth`), lo que rompería la simetría "n8n sin auth".

### (4) Nodos n8n por flujo y formato del workflow JSON

**Flujo A (automático — detectar productos nuevos → Gemini → Discord):**

| # | Nodo | Tipo n8n | Detalle |
|---|---|---|---|
| 1 | Schedule Trigger | `n8n-nodes-base.scheduleTrigger` | Cron + `onStartup: true` (dispara al arrancar n8n → mitiga gaps) |
| 2 | HTTP Request → Convex | `n8n-nodes-base.httpRequest` | GET `https://curious-ox-401.convex.site/products/latest?limit=50` (requiere `convex/http.ts`) |
| 3 | Code / IF | `n8n-nodes-base.code` | Filtra `_creationTime > watermark`; lee watermark de `$getWorkflowStaticData('global')` |
| 4 | HTTP Request → Gemini | `n8n-nodes-base.httpRequest` | POST `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={{ $env.GEMINI_API_KEY }}` con body `{ contents: [{ parts: [{ text }] }] }` (modelo verificado válido; para posters con imagen, `inlineData` base64) |
| 5 | HTTP Request → Discord | `n8n-nodes-base.httpRequest` | POST `{{ $env.DISCORD_WEBHOOK_URL }}` con JSON `{ content, embeds }` (formato profesional: bold títulos, listas, totales) |
| 6 | Code → marca de agua | `n8n-nodes-base.code` | `$getWorkflowStaticData('global').lastCreationTime = max(_creationTime)` |

**Flujo B (manual — posters + descripciones por red → Discord):** Manual Trigger (o
Webhook) → HTTP Convex (elegir/l​​eer producto) → HTTP Gemini (prompt de poster + copy por red:
TikTok, Facebook, Instagram, WhatsApp) → HTTP Discord. (Diseño fino en `design.md`.)

**Formato del workflow JSON (importable en n8n v1):**

```json
{
  "name": "flujo-a-catalogo",
  "nodes": [
    {
      "parameters": { /* reglas específicas del nodo, ej. cron, url, body */ },
      "id": "uuid", "name": "Schedule", "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2, "position": [x, y],
      "credentials": { "httpHeaderAuth": { "id": "...", "name": "..." } }
    }
  ],
  "connections": { "<NodeName>": { "main": [[{ "node": "<Next>", "type": "main", "index": 0 }]] } },
  "settings": { "executionOrder": "v1" },
  "pinData": {},
  "meta": { "templateCredsSetupCompleted": false }
}
```

Notas: los secretos se referencian vía expresiones `={{ $env.GEMINI_API_KEY }}` /
`{{ $env.DISCORD_WEBHOOK_URL }}` (o credential `httpHeaderAuth` para la key de Gemini), **no**
como literales en el JSON. `connections` mapea por nombre de nodo y canal `main` con array de
`[[ {node, type, index} ]]`.

### (5) Riesgos

- **Hotlink vs Cloudinary / next.config.** El seed hotlinkea Unsplash (`images.unsplash.com`,
  ya permitido). Si se usa otra fuente (Pexels, etc.) hay que tocar `next.config.ts`
  `remotePatterns` — marcado OUT salvo justificación en `design.md`. Los hotlinks son
  dependencia externa: exigen verificación 200 por URL y pueden 404/rotar; no dan control de
  marca. Cloudinary `dggj5tnke` ya está configurado (ruta "producción") pero requiere subida
  manual (no automatizada en este change).
- **Expiración de key / webhook.** Gemini `?key=` y el webhook de Discord se prueban solo en
  la PC del usuario; si rotan/expiran los flujos fallan silenciosamente (400/401). Mitigación:
  solo env vars, nunca literales; documentar en `n8n/README.md`.
- **n8n apagado = huecos.** n8n corre local (Docker) y no siempre encendido. Si un producto
  nuevo se crea con n8n apagado, no se detecta en ese instante. Mitigación: watermark por
  `_creationTime` (catch-up) + `scheduleTrigger` con `onStartup: true` → al próximo arranque
  procesa todo lo creado desde la última marca. No usar "solo el último producto" como
  marca.
- **Idempotencia del seed.** Con el guard actual "solo-si-vacío", los ~13 productos nuevos
  no entrarían en una BD ya sembrada → cambiar a guard por `slug`.
- **Ids de variante globales.** Reutilizar `id` de variante rompe `adjustStock`/`updateVariant`
  (buscan por id sobre todos los productos).
- **Guías Convex.** No `.filter()`/`.collect()` no acotados en queries nuevas; usar
  `.order()`+`.take()`.
- **Secretos en el diff.** Verificación pre-commit con grep de keys/URLs reales (ninguna key
  pegada en chat se commitea).
- **`config.yaml` desactualizado** (describe el change archivado `redesign-editorial-total` y
  prohíbe tocar `convex/`/`admin`) — responsabilidad del orquestador, no se reescribe aquí.

## Findings priorizados (input para spec)

1. **P0 — idempotencia del seed:** reemplazar el guard "solo-si-vacío" del bloque productos
   por guard por `slug` (índice `by_slug`), o los ~13 nuevos nunca aterrizan en dev.
2. **P0 — ids de variante únicos:** asignar `v26+` (o `crypto.randomUUID()` corto) a los
   nuevos productos para no romper `adjustStock`/`updateVariant`/`deleteVariant`.
3. **P1 — fix sesión:** `rehydrate()` en `useAdminAuth` + gate de hidratación en
   `AdminLayout` (reusar `adminApi.me` que ya existe).
4. **P1 — sidebar:** añadir item `Configuración` (consume el `Settings` importado).
5. **P1 — endpoint n8n:** no hay `convex/http.ts`; se necesita (o n8n no puede leer Convex
   por HTTP plano). Query acotada ordenada por `_creationTime desc` + `.take()`.
6. **P2 — watermark en n8n `staticData`** (`$getWorkflowStaticData('global')`), no en Convex.
7. **P2 — imágenes:** mantener Unsplash (dominio ya permitido) para no tocar `next.config.ts`.

## Decisiones abiertas para spec/design

- ¿Se agrega `convex/http.ts` (recomendado) o se expone la query vía cliente Convex en un
  Code node de n8n?
- Forma exacta de la marca de agua: `_creationTime` (epoch ms) en `staticData` global vs
  archivo en disco (Write/Read Binary File) — decidir en `design.md`.
- Prompt de Gemini: ¿texto-only (nombre+desc+precio) o multimodal con `inlineData` base64 de
  la imagen del producto para generar posters?
- Estructura final de `n8n/` (flows, docker-compose, `.env.example` sin secretos, README).

## Verificación manual disponible

- Sin runner de tests unitarios: `npm run lint` + `npm run build` + greps + revisión manual.
- Grep de secretos: sin keys/URLs reales en `n8n/`, `convex/seed.ts`, artefactos openspec.
- Seed: `npx convex run seed:run` idempotente (segunda corrida no duplica); conteo ~20
  productos y 5 categorías.
- Session fix: refresh en `/admin/dashboard` conserva sesión (token válido ≤ 8 h); token
  vencido redirige a login.
- Sidebar: `/admin/configuracion` accesible y activo en el menú.
- n8n: workflows importan sin error; HTTP Convex responde JSON; Gemini responde con key
  válida; Discord webhook recibe (prueba manual del usuario).
