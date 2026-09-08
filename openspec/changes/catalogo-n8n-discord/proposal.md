# Propuesta — Catálogo + sesión admin + automatización n8n → Discord

## Metadata

- **Change:** `catalogo-n8n-discord`
- **Artifact store:** OpenSpec
- **Ejecución:** auto, con `ask-on-risk` si el diff previsto supera el presupuesto de 400 líneas
- **Contexto de operación:** Convex para backend; n8n en Docker sobre la PC local del usuario
- **Decisiones confirmadas:** canal Discord mediante webhook; `GEMINI_API_KEY` por entorno; secretos nunca en el repositorio; aproximadamente 13 productos nuevos, para un total cercano a 20; storefront visual fuera del cambio

## Intención

Completar la base operativa del catálogo y conectar los productos nuevos con un pipeline promocional local, sin rediseñar la tienda ni mover la automatización a producción. El cambio debe dejar un catálogo reproducible, un CMS admin que no pierda la sesión al refrescar, la configuración accesible y dos workflows n8n importables que generen material para revisión en Discord.

## Problema

Flores Store tiene cuatro brechas relacionadas:

1. **Catálogo insuficiente:** el seed contiene solo 7 productos. Eso deja el inventario de desarrollo y las campañas con poca variedad y no representa un catálogo de aproximadamente 20 productos.
2. **Sesión admin frágil:** el token continúa en `localStorage` después de un refresh, pero el store reinicia `user` e `isAuthenticated`. `AdminLayout` interpreta ese estado transitorio como una sesión inválida y redirige a login.
3. **Configuración huérfana:** `/admin/configuracion` existe, pero no aparece en `src/components/admin/Sidebar.tsx`; la pantalla no es descubrible desde la navegación principal.
4. **Promoción manual y desconectada:** no existe un proceso que detecte productos nuevos, prepare prompts o piezas promocionales y entregue el resultado a un canal operativo. Cada campaña requiere repetir manualmente la selección, la generación y el envío del copy.

La automatización debe tolerar que n8n no esté siempre encendido. Si se crea un producto mientras la PC está apagada, el sistema debe recuperarlo al siguiente arranque en lugar de perderlo.

## Dirección propuesta

### 1. Datos: seed reproducible e idempotente

- Extender `convex/seed.ts` con aproximadamente 13 productos nuevos, llevando el total esperado a ~20.
- Cambiar el bloque de productos de un guard global "solo si la tabla está vacía" a una comprobación por `slug` mediante el índice existente `by_slug`.
- Hacer que las ejecuciones repetidas inserten únicamente los slugs faltantes y no dupliquen productos existentes.
- Respetar el shape actual de `products`, las cinco categorías existentes y el rango de `sort_order` posterior a los siete productos actuales.
- Usar IDs de variantes nuevos y globalmente únicos (`v26+` o equivalente estable), porque las mutations actuales buscan IDs de variante entre todos los productos.
- Mantener hotlinks de Unsplash para las imágenes: cada URL debe verificarse con respuesta 200 y revisión visual de calzado acorde a la categoría, sin amarillo ni marcas gigantes. No introducir otro dominio salvo justificación explícita posterior.

### 2. CMS admin: rehydrate y navegación

- En `src/lib/store.ts`, agregar `rehydrate()` a `useAdminAuth` para consultar `adminApi.me()` cuando existe un token persistido.
- En `src/app/admin/layout.tsx`, introducir un estado de hidratación que espere el resultado de `rehydrate()` antes de redirigir. Un token válido debe conservar la sesión; uno vencido o inválido debe limpiar el estado y enviar a login.
- En `src/components/admin/Sidebar.tsx`, añadir `/admin/configuracion` usando el icono `Settings` ya importado. Conservar el comportamiento de activo basado en `pathname.startsWith`.

### 3. API pública mínima para n8n

- Añadir una query pública y acotada para productos recientes, ordenada por `_creationTime` descendente y limitada mediante `.take()`; debe devolver `_creationTime` explícitamente junto con los datos públicos necesarios para la promoción.
- Añadir `convex/http.ts` con un `httpAction` GET para exponer un JSON plano en una ruta estable como `/products/latest?limit=50`, consumible por el nodo HTTP Request de n8n.
- Mantener el endpoint sin autenticación únicamente para metadatos de producto previstos para publicación; no exponer sesiones, credenciales, mutations administrativas ni secretos.
- Mantener la marca de agua fuera de Convex: n8n guardará el último `_creationTime` procesado en `$getWorkflowStaticData('global')`. La query será acotada y reciente para cumplir las reglas de Convex y permitir recuperación al arrancar.

### 4. Flujo A: detección → Gemini → Discord

- Workflow automático importable con `Schedule Trigger`, incluyendo ejecución `onStartup: true`.
- Consultar el endpoint HTTP de Convex, filtrar localmente los productos con `_creationTime` mayor que la marca de agua y procesar todos los pendientes, no solo el último.
- Enviar a Gemini el contexto del producto y prompts de material promocional usando `={{ $env.GEMINI_API_KEY }}` o la credencial equivalente, nunca una key literal.
- Publicar en Discord mediante `{{ $env.DISCORD_WEBHOOK_URL }}` un resultado legible para revisión: título destacado, producto, precio, prompt/copy generado y enlaces o referencias disponibles.
- Actualizar la marca de agua solo después del procesamiento del lote para que el siguiente arranque pueda hacer catch-up sin perder productos ante una interrupción.

### 5. Flujo B: posters → descripciones por red → Discord

- Workflow manual importable mediante Manual Trigger o Webhook.
- Permitir seleccionar o leer un producto desde Convex y producir material de poster a partir de su información e imagen disponible.
- Generar descripciones adaptadas, como mínimo, para TikTok, Facebook, Instagram y WhatsApp.
- Entregar posters/prompts y copys en Discord, separados por red y listos para revisión o publicación manual.
- Mantener el flujo como asistencia editorial: no publicar automáticamente en redes sociales ni modificar el storefront.

### 6. Entregables n8n importables

La carpeta `n8n/` contendrá, como mínimo:

- workflows JSON importables para Flujo A y Flujo B;
- `docker-compose.yml` para ejecución local en Docker;
- `.env.example` con nombres de variables, sin valores reales;
- `README.md` con instalación, variables, importación, ejecución manual, comportamiento `onStartup`, catch-up y diagnóstico básico.

Se verificó que no hay un `docker-compose` de VPS en el repositorio; por ello esta propuesta no cambia infraestructura de producción y limita el compose al n8n local del usuario.

## Alcance incluido (IN)

### Código y datos

- `convex/seed.ts`: nuevos productos, imágenes verificadas, variantes únicas e idempotencia por slug.
- `convex/products.ts` o módulo Convex equivalente: query pública reciente acotada por `_creationTime`.
- `convex/http.ts`: endpoint GET público para n8n.
- `src/lib/store.ts`: rehidratación de sesión admin.
- `src/app/admin/layout.tsx`: gate de hidratación y redirect correcto.
- `src/components/admin/Sidebar.tsx`: enlace de Configuración.

### Integración local

- `n8n/flows/*.json` o estructura equivalente con ambos workflows importables.
- `n8n/docker-compose.yml`, `n8n/.env.example` y `n8n/README.md`.
- Variables de entorno para `GEMINI_API_KEY` y `DISCORD_WEBHOOK_URL` sin valores reales.
- Watermark en static data de n8n y recuperación de lotes al iniciar.

### Verificación

- Segunda ejecución del seed sin duplicados y con los slugs faltantes insertados.
- Conteo esperado cercano a 20 productos y variantes sin colisiones.
- Refresh de una ruta admin con token válido conserva la sesión; token vencido redirige a login.
- `/admin/configuracion` es accesible y aparece activo en el sidebar.
- Endpoint HTTP responde JSON acotado, ordenado por `_creationTime` descendente.
- Workflows importan en n8n v1 sin secretos incrustados.
- `npm run lint`, `npm run build` y búsquedas de secretos pasan según las herramientas disponibles.

## Alcance excluido (OUT)

- Cualquier cambio visual o funcional del storefront: rutas de tienda, componentes públicos, CSS global, tokens, layout, carrito y checkout de WhatsApp.
- Rediseño de `schema.ts` o separación de las variantes/imágenes embebidas en nuevas tablas.
- Modificación de pedidos, CMS sections, banners o permisos admin fuera del fix de sesión y del enlace de Configuración.
- Despliegue en VPS, producción o automatización alojada permanentemente.
- Publicación automática en Instagram, Facebook, TikTok, WhatsApp u otra red; Discord es la salida de revisión.
- Subida automática a Cloudinary. Se conserva el hotlink permitido de Unsplash y no se agrega un dominio de imágenes nuevo sin una decisión posterior.
- Persistencia del watermark en Convex o creación de una tabla `staticData`.
- Secretos, webhook reales, claves Gemini reales o archivos `.env` reales en el repositorio.
- Cambios a `config.yaml` heredado de otro change, salvo que el orquestador lo regenere fuera de este artifact.

## Reglas y restricciones

1. **Hotlink permitido:** usar Unsplash ya permitido por la configuración actual; verificar HTTP 200 y adecuación visual de cada imagen antes de cerrar el slice de datos.
2. **Secretos solo por entorno:** `GEMINI_API_KEY` y `DISCORD_WEBHOOK_URL` se referencian desde el entorno de n8n. Jamás escribir valores reales en código, JSON, README, OpenSpec, logs o reportes.
3. **Storefront intacto:** no tocar el storefront ni su identidad visual. La regla de checkout de tres pasos permanece fuera del cambio y no se modifica.
4. **Convex acotado:** las consultas nuevas deben usar argumentos validados, orden por `_creationTime` y límites (`take`/paginación); no usar filtros o colecciones ilimitadas para el endpoint.
5. **Sesión segura:** la rehidratación reutiliza `adminApi.me`; los tokens inválidos o expirados se limpian y no se consideran autenticados.
6. **Catch-up confiable:** n8n debe guardar el watermark después del lote exitoso y volver a consultar pendientes en `onStartup`.
7. **Datos estables:** slugs e IDs de variantes no deben cambiar entre ejecuciones del seed; no reutilizar IDs de variante entre productos.
8. **Presupuesto:** si los workflows JSON, documentación y cambios de código proyectan más de 400 líneas revisables, se pausa con `ask-on-risk` antes de implementar una excepción o una cadena de PRs.

## Slices de entrega

### Slice 1 — Datos + fix admin

- Implementar seed idempotente por slug y los ~13 productos con imágenes verificadas.
- Implementar `rehydrate()` y el gate de hidratación.
- Añadir Configuración al sidebar.
- Validar conteo, duplicación, IDs de variante, refresh y token vencido.

**Resultado:** catálogo operativo y CMS admin estable, sin depender todavía de n8n.

### Slice 2 — Flujos de automatización

- Implementar query pública reciente y endpoint HTTP Convex.
- Construir Flujo A con detección, watermark, Gemini y Discord.
- Construir Flujo B con posters, copys por red y Discord.
- Generar JSON importable y comprobar que ningún secreto queda literal.

**Resultado:** pipeline local capaz de detectar novedades, recuperar catch-up y preparar material promocional para revisión.

### Slice 3 — Documentación y operación

- Añadir compose local, `.env.example` y README.
- Documentar instalación, importación, variables, arranque, watermark, catch-up, errores de Gemini/Discord y rotación de secretos.
- Registrar las verificaciones manuales que dependen de credenciales válidas del usuario.

**Resultado:** el usuario puede levantar n8n en Docker, importar ambos workflows y operarlos sin conocer detalles internos del repositorio.

## Riesgos y mitigaciones

- **Hotlinks rotos o imágenes inadecuadas:** Unsplash es una dependencia externa y sus URLs pueden cambiar. Mitigación: validar 200 y revisar visualmente antes de cerrar; mantener URLs conocidas y documentar la dependencia. Rollback: restaurar el array anterior o retirar únicamente los productos afectados.
- **n8n apagado y productos perdidos:** una ejecución puntual no ocurrirá mientras la PC esté apagada. Mitigación: watermark por `_creationTime`, lote de recientes y `onStartup: true`; nunca usar solo "último producto". Rollback: detener el workflow y conservar el catálogo, sin afectar la tienda.
- **Gemini o Discord no disponibles:** keys/webhooks pueden expirar o responder 400/401/429. Mitigación: variables de entorno, README de diagnóstico, errores visibles en la ejecución y no avanzar el watermark antes del éxito. Rollback: desactivar workflows; el seed y el CMS siguen funcionando.
- **Endpoint público abusado o con datos excesivos:** un endpoint sin auth puede ser consultado por terceros. Mitigación: devolver solo datos promocionales, limitar `limit`, ordenar y acotar la consulta, y no incluir datos admin ni secretos. Rollback: retirar la ruta HTTP y desactivar los workflows; la query pública de storefront queda separable.
- **Colisión de IDs de variante:** las mutations buscan el ID globalmente. Mitigación: reservar `v26+` y revisar unicidad antes de ejecutar el seed. Rollback: no reejecutar el seed problemático; restaurar el archivo y corregir IDs antes de volver a sembrar.
- **Diferencia entre n8n local y versión instalada:** el JSON puede depender de tipos/versiones de nodo. Mitigación: usar tipos n8n v1 y probar la importación en el compose documentado. Rollback: mantener los JSON versionados anteriores y ejecutar el flujo manualmente mientras se corrige la importación.
- **Presupuesto de revisión excedido:** los JSON importables y la documentación pueden generar un diff mayor de lo previsto. Mitigación: medir antes de implementar y detenerse con `ask-on-risk` al superar 400 líneas; no inferir una excepción ni encadenar PRs sin autorización.

## Rollback

El rollback será por slice y no requiere revertir datos del storefront:

1. **Datos:** restaurar `convex/seed.ts` al seed anterior si la validación falla. Como la nueva lógica solo inserta por slug, los productos ya insertados deben desactivarse o eliminarse mediante el procedimiento admin/Convex aprobado; no ejecutar un seed antiguo esperando que borre datos automáticamente.
2. **Sesión/sidebar:** revertir `src/lib/store.ts`, `src/app/admin/layout.tsx` y `src/components/admin/Sidebar.tsx` como una unidad si el gate de hidratación introduce un redirect o una regresión de navegación.
3. **API:** deshabilitar o retirar la ruta de `convex/http.ts` y desconectar n8n. El catálogo y las consultas existentes deben seguir operativos; no cambiar `schema.ts` para revertir este endpoint.
4. **n8n:** detener el compose local, eliminar o desactivar los workflows importados y conservar los archivos `.env` fuera del repo. El rollback no revoca automáticamente una key ni un webhook; el usuario los rota si fueron expuestos accidentalmente.
5. **Promoción:** si Gemini genera contenido incorrecto, detener el workflow y no publicar en Discord/redes. La salida es editorial y no ejecuta publicaciones externas.

## Criterios de éxito

- El seed puede ejecutarse dos veces: la segunda ejecución no duplica los 7 existentes ni los nuevos; los ~13 nuevos faltantes se incorporan por slug y las variantes no colisionan.
- El catálogo de desarrollo queda cerca de 20 productos, con imágenes Unsplash verificadas y categorías, precios, variantes y flags válidos.
- Un admin con token válido mantiene acceso tras refrescar cualquier ruta admin; un token vencido se limpia y termina en login sin parpadeo de contenido protegido.
- Configuración aparece en el sidebar y `/admin/configuracion` se puede alcanzar y marcar como activo.
- n8n puede consultar el endpoint HTTP, detectar todos los productos posteriores al watermark, recuperarlos después de un apagado y actualizar la marca solo tras el procesamiento exitoso.
- Flujo A entrega prompts/copy de productos nuevos a Discord y Flujo B entrega material de poster y descripciones diferenciadas para TikTok, Facebook, Instagram y WhatsApp.
- Los workflows son importables, el compose levanta localmente, el README permite operar el sistema y no hay secretos reales en el diff.
- El storefront no presenta cambios visuales ni regresiones de checkout.

## Preguntas de propuesta

No se abre una ronda de preguntas: el usuario confirmó la dirección, el canal Discord, la operación local de n8n, la estrategia de watermark/catch-up, el uso de Gemini por entorno, las imágenes hotlinked y los límites de alcance. Las decisiones de implementación fina de prompts y el formato exacto de nodos se concretarán en `spec.md` y `design.md`.

## Key Learnings

1. La idempotencia del seed debe basarse en slugs porque la tabla ya contiene productos y no puede depender de estar vacía.
2. Los IDs de variantes son globales en las mutations actuales aunque las variantes estén embebidas por producto.
3. Un watermark en static data de n8n permite recuperar productos creados mientras la automatización local estaba apagada.
4. Convex necesita una ruta HTTP explícita para que un nodo HTTP Request de n8n consuma el catálogo sin cliente Convex.
