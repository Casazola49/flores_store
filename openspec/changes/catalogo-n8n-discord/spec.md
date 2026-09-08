# Spec — Catálogo + fix CMS + n8n → Discord

## Estado

- **Fase:** spec (requisitos verificables y criterios de aceptación).
- **Change:** `catalogo-n8n-discord` · Branch: `sdd/catalogo-n8n-discord`.
- **Artifact store:** OpenSpec (`openspec/changes/{change}/spec.md`, legacy flat
  shape heredada del scaffold de `sdd-init`; advertencia en Riesgos R1).
- **Fuentes de verdad:** `proposal.md` (aprobada), `explore.md` (hallazgos
  confirmados), `openspec/config.yaml` (`scope.in/out`, `phase_rules.spec`,
  `gates.review_budget_lines=400`).
- **Runner de verificación disponible:** `npm run lint`, `npm run build`. Sin
  tests unitarios configurados; las AC se verifican con greps, pruebas manuales
  y revisión visual.

## Alcance de la spec

- **IN:** seed idempotente de catálogo (~13 productos, total ~20); fix de sesión
  admin (rehidratación + gate); item Configuración en sidebar; query pública
  Convex ordenada por `_creationTime` desc con `.take()`; `convex/http.ts` con
  `httpAction` GET para n8n; Flujo A y Flujo B importables; `n8n/flows/*.json`,
  `n8n/docker-compose.yml`, `n8n/.env.example`, `n8n/README.md`; regla de
  secretos transversal.
- **OUT:** storefront visual (ya cerrado en `redesign-editorial-total`,
  `openspec/changes/archive/2026-09-04-redesign-editorial-total/`); `schema.ts`
  (no se rediseña ni se agregan tablas); variantes/imágenes a tablas separadas;
  pedidos, CMS sections, banners fuera del fix de Configuración; despliegue en
  VPS o producción; publicación automática en Instagram/Facebook/TikTok/
  WhatsApp; subida a Cloudinary; persistencia del watermark en Convex;
  secretos reales (valores literales en repo, README o logs).

---

## Grupo 1 — Seed idempotente por slug

### Requirement: Guard por slug, no por tabla vacía

El sistema MUST reemplazar el guard "solo-si-tabla-vacía" del bloque de
productos en `convex/seed.ts` por una comprobación por `slug` mediante el
índice `by_slug` existente. El guard SHALL iterar el array de productos a
insertar y SHALL insertar únicamente los que no existan por slug. La
ejecución SHALL ser re-ejecutable sin efecto sobre los slugs ya presentes.

#### Scenario: Segunda ejecución del seed no duplica ni omite

- **GIVEN** una base de datos Convex con los 7 productos existentes del seed
  previo.
- **WHEN** se ejecuta `npx convex run seed:run` (o vía dashboard) tras haber
  extendido `mockProductsToInsert` con ~13 productos nuevos.
- **THEN** el conteo de filas en `products` SHALL ser exactamente
  `7 + 13 = 20` ± 0; SHALL haber 0 productos con `slug` duplicado; SHALL
  permanecer 5 categorías.
- **Verificación:** conteo por `ctx.db.query("products").collect()` después de
  la segunda corrida; `grep -c "insert.*products"` no aumenta filas nuevas
  sobre el conteo previo.

#### Scenario: Productos faltantes se incorporan al re-correr

- **GIVEN** un subconjunto de los ~13 productos ya insertados en una corrida
  anterior (p.ej. 5 de 13).
- **WHEN** se vuelve a ejecutar el seed.
- **THEN** SHALL insertarse exactamente los 8 restantes; SHALL NO tocarse
  ninguno de los 5 ya presentes.
- **Verificación:** diff de `_id` antes/después limitado a los slugs que no
  existían.

### Requirement: Cantidad total ~20 productos con shape conforme

El sistema SHALL extender `mockProductsToInsert` con **aproximadamente 13**
productos nuevos, llevando el total esperado del catálogo de desarrollo a
~20. Cada producto nuevo MUST respetar el shape vigente de `products`:
`name`, `slug`, `category_slug` (∈ {botas, zapatos, zapatillas,
zapatillas-deportivas, tacos}), `gender` ∈ {mujer, hombre, unisex, niño},
`brand`, `base_price`, `is_featured`, `is_new`, `is_active`, `tags: string[]`,
`sort_order` (rango que continúa al existente; SHALL NO colisionar con
`sort_order` ya usado), `images: {url, is_primary}[]` (mínimo 1 imagen
primaria por producto), `variants: {id, stock, is_active, size?, color?,
sku?, price?}[]` (mínimo 1 variante activa por producto).

#### Scenario: Shape y sort_order consistentes

- **GIVEN** los 7 productos existentes con `sort_order` ∈ `1..7`.
- **WHEN** se añaden los ~13 nuevos al array del seed.
- **THEN** SHALL haber ~20 filas; los nuevos `sort_order` SHALL estar en
  `{8, 9, …, 20}` sin colisión; cada nuevo producto SHALL tener al menos una
  imagen marcada `is_primary: true` y al menos una variante con
  `is_active: true`.

---

## Grupo 2 — IDs de variante globalmente únicos

### Requirement: IDs de variante `v26+` o equivalentes no colisionantes

El sistema MUST asignar a cada variante de los ~13 productos nuevos un `id`
que NO exista en las variantes embebidas de los productos actuales (que
utilizan `v1..v25`). Las IDs SHALL ser globalmente únicas en todo el
documento seed, SHALL ser strings estables entre ejecuciones, y SHALL
cumplir el patrón `v<number>` con `number >= 26` o un esquema equivalente
explícito (p.ej. UUIDs cortos) documentado en `design.md`.

#### Scenario: Mutaciones de stock editán la variante correcta

- **GIVEN** un catálogo sembrado con 20 productos y todas sus variantes con
  `id` único en `v26+` (o equivalente) para los nuevos y `v1..v25` para los
  7 existentes.
- **WHEN** se ejecuta una mutation que busca una variante por `id`
  (`adjustStock`, `updateVariant` o `deleteVariant` en
  `convex/products.ts`).
- **THEN** SHALL editar/eliminar exactamente la variante del producto al que
  pertenece; SHALL NO afectar variantes de otros productos.
- **Verificación:** unit-style check post-seed: para cada `id` de variante,
  existe en exactamente 1 producto (`count == 1`).

#### Scenario: Sin colisiones tras re-ejecución del seed

- **GIVEN** una base ya sembrada con la nueva tanda.
- **WHEN** se re-ejecuta `seed:run`.
- **THEN** SHALL haber 0 inserciones nuevas; SHALL permanecer 0 colisiones
  de `id` de variante entre productos.

---

## Grupo 3 — Imágenes hotlink verificables

### Requirement: 200 OK + revisión visual por imagen

El sistema SHALL usar exclusivamente URLs de `images.unsplash.com` para las
imágenes de los ~13 productos nuevos (dominio ya permitido en
`next.config.ts`). Cada URL MUST responder `200 OK` antes del cierre del
slice y MUST mostrar calzado visualmente acorde a la categoría declarada
del producto (botas/zapatos/zapatillas/zapatillas-deportivas/tacos). Cada
URL SHALL NOT mostrar amarillo Aria (`#FFD700`, `#FFB300`, `#FFC107`,
`#E5C400`) ni marcas/logotipos de terceros prominentes.

#### Scenario: Verificación HTTP y contenido visual

- **GIVEN** el array de URLs candidato para los ~13 productos nuevos.
- **WHEN** se realiza `curl -I <url>` para cada una y se inspecciona
  visualmente la imagen renderizada.
- **THEN** SHALL haber 0 respuestas `4xx/5xx`; SHALL haber 0 imágenes con
  fondo/elemento amarillo Aria; SHALL haber 0 imágenes con marca/logotipo
  prominente de terceros; SHALL haber 0 imágenes que NO representen calzado
  de la `category_slug` declarada.

#### Scenario: Sin nuevos dominios de imágenes

- **GIVEN** los cambios en `convex/seed.ts` y en el resto del change.
- **WHEN** se buscan dominios de imágenes en el diff.
- **THEN** SHALL aparecer exclusivamente `images.unsplash.com`; SHALL NOT
  aparecer `pexels.com`, `cloudinary.com` ni otro dominio de stock (salvo
  justificación explícita documentada en `design.md`).

---

## Grupo 4 — Sesión admin rehidratada

### Requirement: `rehydrate()` recupera sesión válida desde localStorage

El sistema MUST extender `useAdminAuth` en `src/lib/store.ts` con una acción
`rehydrate()` que, ante un `token` persistido pero `isAuthenticated === false`,
consulte `adminApi.me()` (ya existente). Si la respuesta es exitosa, SHALL
establecer `{ token, user, isAuthenticated: true }` con el usuario retornado.
Si la respuesta falla (token vencido, inválido, expirado o usuario inactivo),
SHALL ejecutar `logout()` y SHALL limpiar la entrada en `localStorage`.

#### Scenario: Refresh conserva sesión con token válido

- **GIVEN** un admin autenticado con token persistido en
  `localStorage["flores_admin_token"]` (≤ 8 h de antigüedad).
- **WHEN** el usuario navega a `/admin/dashboard` o cualquier ruta `/admin/*`
  distinta de `/admin/login` y refresca el navegador.
- **THEN** `rehydrate()` SHALL completar antes del redirect; SHALL terminar
  con `isAuthenticated === true`; SHALL renderizar el contenido protegido sin
  redirección a `/admin/login`.

#### Scenario: Token vencido redirige a login sin parpadeo

- **GIVEN** un `localStorage["flores_admin_token"]` con sesión expirada,
  revocada o con `admin_users.is_active === false`.
- **WHEN** el usuario refresca una ruta admin.
- **THEN** `rehydrate()` SHALL limpiar el token persistido;
  `AdminLayout` SHALL redirigir a `/admin/login`; SHALL NOT renderizar
  contenido protegido durante el estado transitorio; SHALL NO existir un
  parpadeo visible de UI admin antes del redirect.

#### Scenario: Deep-link a ruta protegida funciona tras rehidratación

- **GIVEN** un admin con sesión válida en el store.
- **WHEN** se accede directamente (deep-link) a una ruta protegida como
  `/admin/configuracion` o `/admin/productos/nuevo`.
- **THEN** SHALL completarse `rehydrate()` y SHALL renderizarse el contenido
  de esa ruta sin redirección intermedia a `/admin/login`.

### Requirement: Gate de hidratación en `AdminLayout`

El sistema MUST introducir un estado de hidratación (`hydrating` o
equivalente) en `src/app/admin/layout.tsx` que posponga la decisión de
redirect hasta que `rehydrate()` termine cuando exista `token` persistido.
El componente SHALL renderizar un estado neutro (o `null`) mientras dure la
hidratación. La condición de redirect SHALL pasar de `!isAuthenticated`
inmediato a `(!isAuthenticated && !hydrating)`.

#### Scenario: Orden de efectos

- **GIVEN** un token persistido y `isAuthenticated === false` en el store al
  cargar el layout.
- **WHEN** `AdminLayout` monta.
- **THEN** SHALL disparar `rehydrate()` antes de evaluar la redirección;
  SHALL renderizar placeholder no protegido durante la espera; SHALL
  redirigir solo si `rehydrate()` falla (token inválido/vencido).

---

## Grupo 5 — Sidebar con Configuración

### Requirement: Item Configuración añadido al sidebar

El sistema MUST añadir a `navItems` en `src/components/admin/Sidebar.tsx`
un elemento `{ name: "Configuración", href: "/admin/configuracion", icon:
Settings }`, usando el icono `Settings` ya importado de `lucide-react`. El
item SHALL respetar el patrón de `isActive` basado en
`pathname.startsWith(item.href)`.

#### Scenario: Configuración es alcanzable y aparece activa

- **GIVEN** cualquier sesión admin autenticada.
- **WHEN** el usuario navega a `/admin/configuracion` directamente o
  haciendo click en el item del sidebar.
- **THEN** SHALL renderizarse la página `src/app/admin/configuracion/page.tsx`;
  SHALL haber exactamente un item con `aria-current` o la clase activa
  correspondiente en el sidebar mientras `pathname` empieza por
  `/admin/configuracion`.

#### Scenario: El icono `Settings` se usa (no queda muerto)

- **GIVEN** el árbol de imports de `src/components/admin/Sidebar.tsx`.
- **WHEN** se inspecciona el uso del símbolo `Settings`.
- **THEN** SHALL estar referenciado dentro de `navItems`; SHALL NOT quedar
  como import muerto.

---

## Grupo 6 — Endpoint HTTP Convex público

### Requirement: Query pública reciente ordenada por `_creationTime` desc

El sistema MUST exponer una query Convex pública (sin autenticación) que
liste productos ordenados por `_creationTime` descendente y acotada mediante
`.take(limit)`, donde `limit` es un argumento validado. La query SHALL
devolver explícitamente `_creationTime` (epoch ms) junto con los datos
públicos necesarios para la promoción: `name`, `slug`, `base_price`,
`images[]` (URLs y `is_primary`), `category_slug`, `tags`, `brand`,
`short_desc` (si existe) y `_id`. La query SHALL NOT incluir datos
administrativos (sesiones, credenciales, flags internos no promocionales,
mutaciones ni secretos).

#### Scenario: Orden descendente y límite respetado

- **GIVEN** un catálogo con N productos y un argumento `limit = 50`.
- **WHEN** se invoca la query.
- **THEN** SHALL devolver como máximo `50` elementos ordenados de más nuevo
  a más viejo por `_creationTime`; SHALL NO aplicar `.filter()` no acotado
  ni `.collect()` sin `take`.

#### Scenario: Validación de `limit`

- **GIVEN** una entrada con `limit` ausente, negativo, no numérico o
  excesivamente grande.
- **WHEN** se invoca la query.
- **THEN** SHALL rechazar (throw o normalizar a un tope seguro, p.ej. 100)
  entradas inválidas; SHALL NOT exponer más de 100 elementos por llamada.

### Requirement: `convex/http.ts` con `httpAction` GET

El sistema MUST añadir `convex/http.ts` registrando un `httpAction` GET
expuesto en una ruta estable (p.ej. `/products/latest`) que ejecute la query
pública anterior y devuelva JSON plano consumible por un nodo
`httpRequest` de n8n. La ruta SHALL NO requerir autenticación; SHALL
devolver `200` con `application/json`; SHALL propagar errores de validación
como `400` con cuerpo `{ error: string }`. El handler SHALL NO exponer
secretos, tokens, sesiones ni mutaciones administrativas.

#### Scenario: Consumo HTTP plano desde n8n

- **GIVEN** el deployment Convex (`https://<deployment>.convex.site`).
- **WHEN** se hace `GET /products/latest?limit=50` con `curl` o desde el
  nodo HTTP Request de n8n.
- **THEN** SHALL responder `200 application/json` con un objeto
  `{ data: ProductRecent[] }` (o array directo, documentado en design.md)
  donde cada elemento contiene `_creationTime` explícito y los campos
  promocionales.

#### Scenario: Ausencia de auth y de datos sensibles

- **GIVEN** la ruta expuesta.
- **WHEN** se inspecciona el cuerpo de la respuesta y los headers.
- **THEN** SHALL NO existir challenge de auth; SHALL NO aparecer
  `admin_sessions`, `admin_users`, `password`, `bcrypt`, `token`,
  `webhook_url`, `api_key`, ni campos de flags internos no promocionales.

---

## Grupo 7 — Flujo A: detección → Gemini → Discord

### Requirement: Disparador programado con `onStartup`

El sistema SHALL entregar el Flujo A como un workflow JSON n8n v1 importable,
cuyo primer nodo será un `scheduleTrigger` con `onStartup: true` además de su
expresión cron. El workflow SHALL procesar todos los productos pendientes
desde el watermark (catch-up), no solamente el último, cuando n8n arranca.

#### Scenario: Catch-up al iniciar n8n

- **GIVEN** watermark `W` en `$getWorkflowStaticData('global').lastCreationTime`
  y productos P1..Pn con `_creationTime > W`.
- **WHEN** n8n arranca con el Flujo A activo.
- **THEN** SHALL dispararse una ejecución en el `onStartup` que consulta la
  ruta HTTP Convex y procesa la totalidad de P1..Pn, no solo el más nuevo;
  SHALL actualizar el watermark solo tras el procesamiento exitoso del lote.

### Requirement: Detección por watermark `_creationTime`

El Flujo A MUST consultar la ruta `convex/http.ts` con `limit` suficiente
para cubrir catch-up (p.ej. `limit=50` o superior documentado en design.md).
Un nodo `code` (o equivalente) SHALL leer el watermark desde
`$getWorkflowStaticData('global').lastCreationTime` y SHALL filtrar los
elementos cuyo `_creationTime` sea estrictamente mayor que el watermark.
El resultado SHALL ser un array de productos pendientes.

#### Scenario: Watermark inexistente procesa todo lo disponible

- **GIVEN** `global.lastCreationTime` ausente (primera ejecución).
- **WHEN** corre el Flujo A.
- **THEN** SHALL procesar todos los productos devueltos por el endpoint; el
  watermark SHALL establecerse al máximo `_creationTime` del lote tras el
  envío exitoso a Discord.

#### Scenario: Watermark presente omite ya procesados

- **GIVEN** `global.lastCreationTime = T0` y productos P1 (`_creationTime >
  T0`), P2 (`_creationTime > T0`) y P3 (`_creationTime <= T0`).
- **WHEN** corre el Flujo A.
- **THEN** SHALL procesar P1 y P2; SHALL omitir P3; SHALL actualizar
  watermark a `max(_creationTime(P1), _creationTime(P2))`.

### Requirement: Envío de fotos a Discord por producto

El Flujo A MUST postear a Discord una foto por producto pendiente usando
`{{ $env.DISCORD_WEBHOOK_URL }}` (referencia por entorno, jamás valor real).
La foto SHALL ser la imagen primaria del producto (la URL marcada
`is_primary: true` en `images[]`). Si la imagen primaria falla o está
ausente, SHALL usar la primera imagen disponible como fallback.

#### Scenario: Post por producto con foto y datos básicos

- **GIVEN** un producto pendiente P.
- **WHEN** el nodo Discord del Flujo A ejecuta.
- **THEN** SHALL enviarse un POST al webhook con un payload legible que
  incluya, como mínimo: imagen principal del producto, nombre, slug,
  `base_price`, `category_slug`, `brand`.

### Requirement: Tres prompts Gemini por producto enviados a Discord

El Flujo A MUST generar exactamente **3 prompts** por producto pendientes
usando Gemini (vía HTTP Request con `={{ $env.GEMINI_API_KEY }}` o
credencial equivalente). Los 3 prompts SHALL ser texto y/o multimodal con
referencia al producto, y SHALL reenviarse a Discord en el mismo mensaje o
en mensajes vinculados del flujo. Los 3 outputs SHALL ser legibles para
revisión humana.

#### Scenario: Tres prompts por producto llegan a Discord

- **GIVEN** un lote de productos pendientes.
- **WHEN** corre el Flujo A.
- **THEN** SHALL existir al menos un POST a Discord por producto que
  contenga 3 bloques distinguibles de copy/prompt (título destacado + 3
  secciones numeradas o equivalentes).

#### Scenario: Sin clave Gemini literal en el workflow

- **GIVEN** el JSON del Flujo A.
- **WHEN** se hace `grep` del cuerpo, headers, parámetros y credenciales.
- **THEN** SHALL NO aparecer ningún valor real de `AIza...` ni la cadena
  literal `GEMINI_API_KEY` con valor; SHALL aparecer la referencia
  `{{ $env.GEMINI_API_KEY }}` o un id de credencial n8n (sin valor).

### Requirement: Watermark actualizado tras éxito del lote

El Flujo A SHALL actualizar `global.lastCreationTime` al máximo
`_creationTime` del lote **únicamente después** de que el envío a Discord
del lote haya sido exitoso. Si el POST a Discord o Gemini falla, SHALL
preservarse el watermark anterior para reintento.

#### Scenario: Falla de Discord no avanza watermark

- **GIVEN** un lote P1..P3 con watermark previo `W`.
- **WHEN** Discord responde `4xx/5xx` o timeout.
- **THEN** SHALL NO actualizarse `global.lastCreationTime`; SHALL quedar
  `W` para que la próxima ejecución vuelva a intentar el mismo lote.

---

## Grupo 8 — Flujo B: posters → 4 descripciones por red → Discord

### Requirement: Disparador manual o Webhook

El sistema SHALL entregar el Flujo B como workflow JSON n8n v1 importable
con un disparador `manualTrigger` o `webhook` (a documentar en design.md).
El flujo SHALL permitir leer un producto desde el endpoint público HTTP
Convex o aceptar el identificador (`slug` o `_id`) por entrada manual/webhook.

#### Scenario: Ejecución manual con producto seleccionado

- **GIVEN** un admin que selecciona un producto en la UI de n8n o envía un
  webhook con su `slug`.
- **WHEN** se dispara el Flujo B.
- **THEN** SHALL resolverse el producto vía la ruta pública Convex; SHALL
  continuar el pipeline de posters y descripciones.

### Requirement: Material de poster a partir del producto

El Flujo B MUST generar material de poster usando Gemini (HTTP Request con
`{{ $env.GEMINI_API_KEY }}`) a partir de la información e imagen disponible
del producto seleccionado. La generación SHALL ser multimodal cuando haya
imagen utilizable.

### Requirement: 4 descripciones ES-BO por red

El Flujo B MUST producir **4 descripciones adaptadas**, una por cada red:
**TikTok**, **Facebook**, **Instagram** y **WhatsApp**. Cada descripción
SHALL estar escrita en **español boliviano neutro** (sin voseo rioplatense
`-ás/-és/-ís`, sin tuteo mezclado con voseo, sin uso de «vos» con
conjugación rioplatense) y SHALL ser adecuada al tono/longitud esperada de
la red correspondiente.

#### Scenario: Cuatro descripciones ES-BO entregadas a Discord

- **GIVEN** un producto seleccionado.
- **WHEN** corre el Flujo B.
- **THEN** SHALL existir un único mensaje a Discord (o una serie
  estructurada) con 4 bloques etiquetados por red (TikTok, Facebook,
  Instagram, WhatsApp), cada uno en ES-BO sin voseo rioplatense.

#### Scenario: Sin voseo rioplatense en las descripciones

- **GIVEN** los 4 bloques generados por el Flujo B en una corrida de
  muestra.
- **WHEN** se buscan terminaciones de voseo rioplatense en el texto
  entregado.
- **THEN** SHALL haber 0 ocurrencias de patrones como
  `(compr|pag|eleg|envi|recib|us|revis|compart|hac)[aá]s\b` ni
  `[aá]s (tu|el|este|lo|los)` en los 4 bloques.

### Requirement: Entrega a Discord y separación por red

El Flujo B SHALL enviar a Discord el poster (o referencia al mismo) y los
4 copys separados por red, en un payload estructurado y listo para revisión
o publicación manual. El Flujo B SHALL NOT ejecutar publicaciones externas
automáticas (no SHALL postear en TikTok/Facebook/Instagram/WhatsApp).

---

## Grupo 9 — Entregables `n8n/`

### Requirement: Workflows importables sin secretos reales

El sistema SHALL entregar bajo `n8n/` dos archivos JSON de workflows
importables en n8n v1: uno para Flujo A y uno para Flujo B. Los archivos
SHALL contener únicamente referencias a credenciales por id o
`{{ $env.* }}`; SHALL NO contener valores reales de `GEMINI_API_KEY`,
`DISCORD_WEBHOOK_URL`, tokens, ni URLs internas con secretos.

#### Scenario: Importación sin error y sin secretos en diff

- **GIVEN** los archivos `n8n/flows/*.json`.
- **WHEN** se importa en n8n v1 (vía UI o CLI) y se hace `grep` del
  directorio.
- **THEN** SHALL completarse la importación sin errores; SHALL NO aparecer
  ningún valor literal de key/webhook/token; SHALL aparecer exclusivamente
  `{{ $env.GEMINI_API_KEY }}` o id de credencial y
  `{{ $env.DISCORD_WEBHOOK_URL }}`.

### Requirement: `n8n/docker-compose.yml` para n8n local

El sistema MUST entregar `n8n/docker-compose.yml` que levante n8n en Docker
para uso local (fuera de VPS). El compose SHALL usar imagen oficial de n8n,
declarar el volumen para datos persistentes, y SHALL leer variables de
entorno desde `.env` (no commiteado). El compose SHALL NOT contener
secretos.

### Requirement: `n8n/.env.example` sin valores reales

El sistema MUST entregar `n8n/.env.example` con los nombres de variables
necesarios (`GEMINI_API_KEY`, `DISCORD_WEBHOOK_URL`, y las requeridas por
n8n: p.ej. `N8N_HOST`, `N8N_PORT`, `WEBHOOK_URL`, `GENERIC_TIMEZONE`,
`N8N_ENCRYPTION_KEY`, etc.) y SHALL NOT contener valores reales. Los
valores SHALL ser placeholders obvios (`change-me`,
`https://discord.com/api/webhooks/.../...` como placeholder de forma, no
valor real).

### Requirement: `n8n/README.md` operativo

El sistema MUST entregar `n8n/README.md` cubriendo, como mínimo:
instalación del compose local; variables de entorno y rotación de secretos;
importación de los dos workflows; ejecución manual del Flujo B;
arranque del Flujo A con `onStartup` y catch-up; diagnóstico básico para
fallos de Gemini (`400/401/429`) y Discord (`4xx/5xx`); comportamiento
esperado cuando n8n está apagado durante la creación de un producto
(recuperación al próximo arranque vía watermark). El README SHALL NOT
contener secretos reales.

#### Scenario: Levantar e importar con el README

- **GIVEN** un usuario con Docker y claves válidas propias.
- **WHEN** sigue los pasos del README (copiar `.env.example` → `.env`,
  completar placeholders, `docker compose up -d`, importar workflows).
- **THEN** SHALL poder ejecutar ambos flujos sin conocer detalles internos
  del repositorio Flores Store.

---

## Grupo 10 — Regla transversal de secretos

### Requirement: Sin secretos reales en el repo ni en el diff

El sistema MUST garantizar que ningún valor real de `GEMINI_API_KEY`,
`DISCORD_WEBHOOK_URL`, tokens de Convex, ni credenciales equivalentes
aparezca en el diff, en artefactos OpenSpec, en el README de `n8n/`, en
workflows JSON, ni en logs del repositorio. Las claves SHALL ser
referenciadas exclusivamente vía entorno (`$env.*` de n8n, variables del
sistema operativo o archivos `.env` ignorados por git).

#### Scenario: Grep de secretos en el diff

- **GIVEN** los archivos del change (`convex/`, `src/`, `n8n/`).
- **WHEN** se ejecuta `grep -REn
  "AIza[0-9A-Za-z_-]{20,}|xox[baprs]-[0-9A-Za-z-]+|hooks/[0-9]+/[A-Za-z0-9_-]+/[^[:space:]]+|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|convex\.cloud/[a-z0-9-]{20,}/[A-Za-z0-9_-]+"`
  sobre los archivos del change.
- **THEN** SHALL haber 0 coincidencias que no sean placeholders explícitos
  del propio `.env.example`.

#### Scenario: `.env` ignorado por git

- **GIVEN** la raíz del repositorio.
- **WHEN** se inspecciona `.gitignore`.
- **THEN** SHALL incluir `.env`, `.env.*` y `n8n/.env` (o patrón equivalente)
  para evitar commits accidentales de secretos.

---

## Verificación transversal (manual + greps)

- **Conteo de productos:** `npx convex run seed:run` dos veces y verificar
  `20 ± 0` filas sin duplicados de slug ni colisión de IDs de variante.
- **Sesión admin:** refresh en `/admin/dashboard`, `/admin/inventario`,
  `/admin/configuracion`, `/admin/productos/nuevo` con token válido
  conserva acceso; refresh con token expirado limpia estado y redirige a
  `/admin/login`.
- **Sidebar:** click en `Configuración` navega y marca activo el item.
- **Endpoint HTTP:** `curl -i
  'https://<deployment>.convex.site/products/latest?limit=50'` responde 200
  JSON, ordenado por `_creationTime` desc, sin campos admin/secretos.
- **Importación n8n:** los dos JSON importan sin error en n8n v1; `grep` de
  secretos sobre `n8n/` no encuentra valores reales.
- **Catch-up Flujo A:** apagar n8n, crear un producto, encender n8n: el
  `onStartup` procesa el producto pendiente y actualiza watermark tras el
  envío exitoso a Discord.
- **Flujo B:** ejecución manual sobre un producto produce 4 bloques ES-BO
  (TikTok, Facebook, Instagram, WhatsApp) y poster/prompt en Discord.
- **Lint/build:** `npm run lint` y `npm run build` pasan en verde.
- **Greps de marca** (heredados de storefront, aplican solo a `src/`):
  sin `#FFD700/#FFB300/#FFC107/#E5C400`; sin hex hardcodeado en componentes
  del store; tokens consumidos desde `var(--color-*)`.

---

## Riesgos heredados

- **R1 — Forma legacy flat.** El path heredado `openspec/changes/{change}/spec.md`
  no coincide con la convención canónica `specs/{domain}/spec.md`; se conserva
  por instrucción del orquestador y debe mapearse a la convención por
  dominio en `archive`. Esto implica cubrir 6 dominios (`catalog-seed`,
  `admin-auth`, `admin-navigation`, `convex-http-api`, `n8n-flow-a`,
  `n8n-flow-b`) en el archivo único a costa de estructura menos granular.
- **R2 — Capacidades no explícitas en `proposal.md`.** La propuesta no incluye
  una sección `Capabilities`; los dominios `catalog-seed`, `admin-auth`,
  `admin-navigation`, `convex-http-api`, `n8n-flow-a`, `n8n-flow-b` y
  `n8n-deliverables` se infieren de "Alcance incluido" y de los hallazgos de
  `explore.md`. Esta inferencia se reporta como riesgo: si el orquestador
  esperaba otra granularidad, debe reagrupar antes de pasar a `design.md`.
- **R3 — AC de Gemini/Discord no automatizables.** Las AC de "3 prompts
  por producto", "4 descripciones ES-BO por red" y "envío exitoso a
  Discord" no se pueden verificar con `npm run lint` ni con `npm run
  build`. Dependen de claves válidas del usuario. Mitigación: greps sobre
  los workflows JSON (estructura, placeholders, sin secretos) y revisión
  manual en una corrida con credenciales reales.
- **R4 — Verificación visual de imágenes.** "Calzado acorde a la categoría
  sin amarillo Aria ni marcas gigantes" requiere inspección visual humana.
  No automatizable con greps en el diff. Mitigación: lista explícita de
  URLs revisadas en `design.md` y rollback por producto si la imagen no
  cumple.
- **R5 — Hotlinks rotos.** `images.unsplash.com` puede devolver 404/rotar.
  Mitigación: validación 200 previa al cierre del slice; documentación de
  la dependencia; rollback por producto afectado.
- **R6 — n8n apagado.** El catch-up depende de que n8n se encienda en algún
  momento. Si la PC del usuario permanece apagada, los productos creados
  no se promocionan hasta el siguiente arranque. Aceptado por diseño: la
  automatización es local y editorial.
- **R7 — Presupuesto de revisión.** Workflows JSON + `convex/http.ts` +
  `convex/seed.ts` + fix admin + `n8n/README.md` pueden proyectar > 400
  líneas. Mitigación: `ask-on-risk` antes de implementar una excepción o
  una cadena de PRs; no inferir `size:exception` ni encadenar sin
  autorización.
- **R8 — `config.yaml` describe el change archivado.** El
  `openspec/config.yaml` fija `change: catalogo-n8n-discord` pero
  describe parte del alcance del archivado `redesign-editorial-total`.
  Responsabilidad del orquestador regenerarlo fuera de este artifact.