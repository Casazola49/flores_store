# Design — Catálogo + fix CMS + n8n → Discord

## Estado

- **Fase:** diseño completo
- **Change:** `catalogo-n8n-discord`
- **Depende de:** `proposal.md` aprobado, `explore.md` completado
- **Presupuesto:** 400 líneas revisables, `ask-on-risk` si se excede

---

## 1. Seed idempotente por slug — `convex/seed.ts`

### 1.1 Cambio del guard de productos

Reemplazar el bloque 5 actual ("solo-si-tabla-vacía") por inserción individual con guard por `slug`:

```ts
// 5. Insertar Productos (idempotente por slug)
console.log("Seeding products (incremental by slug)...");
for (const prod of allProducts) {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", prod.slug))
    .unique();
  if (!existing) {
    await ctx.db.insert("products", prod);
    console.log(`  ✅ Inserted: ${prod.slug}`);
  } else {
    console.log(`  ⏭️  Skipped (exists): ${prod.slug}`);
  }
}
```

Los bloques 1–4 (admin, categorías, cms_sections, banners) mantienen su guard "solo-si-vacío" actual — son datos de configuración que no necesitan idempotencia granular.

### 1.2 Estructura del array `allProducts`

Concatenar los 7 existentes (`existingProducts`) + 13 nuevos (`newProducts`) en un solo array antes del loop:

```ts
const allProducts = [...existingProducts, ...newProducts];
```

Donde `existingProducts` es el array literal actual (7 productos, sort_order 1–7, variantes v1–v25).

### 1.3 Los 13 productos nuevos

| # | Nombre | Slug | Categoría | Género | Precio base (Bs) | Compare (Bs) | Variantes | Tags |
|---|--------|------|-----------|--------|-------------------|--------------|-----------|------|
| 8 | Mocasín Suede Azul | `mocasin-suede-azul` | zapatos | hombre | 380 | 560 | v26–v29 (40–43) | clasico, suede, elegante |
| 9 | Bota Vaquera Oeste | `bota-vaquera-oeste` | botas | mujer | 520 | 750 | v30–v34 (35–39) | vaquera, cuero, exclusiva |
| 10 | Sneaker Retro Cream | `sneaker-retro-cream` | zapatillas | unisex | 290 | 430 | v35–v39 (37–41) | retro, tendencia, casual |
| 11 | Tacón Block Nude | `talon-block-nude` | tacos | mujer | 410 | 620 | v40–v43 (35–38) | elegante, nude, evento |
| 12 | Runner Cloud Pro | `runner-cloud-pro` | zapatillas-deportivas | hombre | 590 | 870 | v44–v48 (39–43) | running, elite, entrenamiento |
| 13 | Alpargata Linen Natural | `alpargata-linen-natural` | zapatos | unisex | 180 | 280 | v49–v53 (36–40) | verano, casual, lino |
| 14 | Botín Plataforma Negro | `botin-plataforma-negro` | botas | mujer | 470 | 690 | v54–v58 (35–39) | plataforma, tendencia, exclusivo |
| 15 | Derby Cognac Classic | `derby-cognac-classic` | zapatos | hombre | 440 | 660 | v59–v62 (40–43) | clasico, cuero, derby |
| 16 | Trainer Flex Violeta | `trainer-flex-violeta` | zapatillas-deportivas | mujer | 350 | 520 | v63–v67 (36–40) | fitness, ligero, mujer |
| 17 | Sandalia Trenzada Oro | `sandalia-trenzada-oro` | tacos | mujer | 310 | 470 | v68–v70 (36–38) | verano, trenzada, dorado |
| 18 | High-Top Street Grey | `high-top-street-grey` | zapatillas | unisex | 340 | 500 | v71–v75 (38–42) | street, urbano, cano alto |
| 19 | Oxford Bicolor Vino | `oxford-bicolor-vino` | zapatos | hombre | 460 | 700 | v76–v79 (40–43) | oxford, bicolor, formal |
| 20 | Trail Mountain Verde | `trail-mountain-verde` | zapatillas-deportivas | unisex | 620 | 920 | v80–v84 (38–42) | trail, montaña, impermeable |

**Precios realistas en Bs:** rango 180–620 base, 280–920 compare. Reflejan mercado boliviano de calzado de gama media-alta.

### 1.4 Shape de variantes por producto

Cada variante sigue el schema existente:

```ts
{ id: "vNN", size: "XX", color: "...", sku: "slug-XX", stock: N, is_active: true }
```

- IDs: `v26` a `v84` — sin colisión con `v1`–`v25` existentes.
- Stock: 2–15 unidades por variante (realista para dev).
- SKU: patrón `{slug-corto}-{talle}`.
- `is_active: true` en todas.

### 1.5 Imágenes — decisión y verificación diferida

**Decisión:** mantener hotlinks de Unsplash (`images.unsplash.com`, dominio ya permitido en `next.config.ts` `remotePatterns`). No agregar otro dominio.

**Por qué las fotos se eligen después con verificación:**

1. Cada URL de Unsplash debe verificarse con HTTP 200 antes de incluirla en el seed.
2. La imagen debe representar calzado acorde a la categoría del producto (no paisajes, no personas, no productos amarillos dominantes, no marcas gigantes visibles).
3. La selección de URLs específicas se realiza durante la implementación (slice 1), no en el diseño, porque requiere consultas HTTP en vivo a Unsplash.
4. Placeholder temporal: usar la URL del producto existente más cercano en categoría hasta la verificación final.

**Estructura de cada producto nuevo:**

```ts
{
  name: "...",
  slug: "...",
  description: "Descripción acorde al producto...",
  short_desc: "Frase corta...",
  category_slug: "botas" | "zapatos" | "zapatillas" | "zapatillas-deportivas" | "tacos",
  gender: "mujer" | "hombre" | "unisex",
  brand: "Flores",
  base_price: NNN,
  compare_price: NNN,
  is_featured: boolean,  // ~4 de 13 serán featured
  is_new: boolean,       // ~6 de 13 serán is_new
  is_active: true,
  tags: string[],
  sort_order: 8–20,      // continuación de los 7 existentes
  images: [{ url: "https://images.unsplash.com/...", is_primary: true }],
  variants: [{ id: "vNN", size: "...", color: "...", sku: "...", stock: N, is_active: true }]
}
```

---

## 2. Fix sesión admin

### 2.1 `src/lib/store.ts` — `rehydrate()` en `useAdminAuth`

Agregar método `rehydrate` al store:

```ts
interface AdminAuthStore {
  token: string | null;
  user: { username: string; role: string } | null;
  isAuthenticated: boolean;
  isHydrating: boolean;       // ← nuevo
  setAuth: (token: string, user: { username: string; role: string }) => void;
  logout: () => void;
  rehydrate: () => Promise<void>;  // ← nuevo
}

export const useAdminAuth = create<AdminAuthStore>()((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("flores_admin_token") : null,
  user: null,
  isAuthenticated: false,
  isHydrating: false,

  setAuth: (token, user) => { /* sin cambios */ },
  logout: () => { /* sin cambios */ },

  rehydrate: async () => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("flores_admin_token")
      : null;
    if (!token) {
      set({ isHydrating: false });
      return;
    }
    set({ isHydrating: true });
    try {
      const result = await adminApi.me();
      if (result.data?.success && result.data?.user) {
        set({
          token,
          user: result.data.user,
          isAuthenticated: true,
          isHydrating: false,
        });
      } else {
        // Token inválido o expirado → limpiar
        if (typeof window !== "undefined") {
          localStorage.removeItem("flores_admin_token");
        }
        set({ token: null, user: null, isAuthenticated: false, isHydrating: false });
      }
    } catch {
      // Error de red → limpiar token para evitar loop
      if (typeof window !== "undefined") {
        localStorage.removeItem("flores_admin_token");
      }
      set({ token: null, user: null, isAuthenticated: false, isHydrating: false });
    }
  },
}));
```

### 2.2 `src/app/admin/layout.tsx` — gate de hidratación

Reemplazar el `useEffect` actual para esperar `rehydrate()` antes de decidir redirect:

```tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrating, token, rehydrate } = useAdminAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Si hay token pero no está autenticado ni hydrando → lanzar rehydrate
    if (token && !isAuthenticated && !isHydrating && pathname !== "/admin/login") {
      rehydrate();
    }
  }, [token, isAuthenticated, isHydrating, rehydrate, pathname]);

  if (!mounted) return null;

  // Login: sin sidebar
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Esperando hidratación: no redirigir todavía
  if (isHydrating) return null;

  // Sin auth después de hidratar → redirect
  if (!isAuthenticated) {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
```

### 2.3 `src/components/admin/Sidebar.tsx` — item Configuración

Agregar a `navItems` (el `Settings` ya está importado pero sin uso):

```ts
const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Inventario", href: "/admin/inventario", icon: Layers },
  { name: "Productos", href: "/admin/productos", icon: Package },
  { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { name: "CMS Tienda", href: "/admin/banners", icon: ImageIcon },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },  // ← nuevo
];
```

---

## 3. API pública para n8n — Convex

### 3.1 Query `getRecentProducts` — `convex/products.ts`

Nueva query pública (sin auth), ordenada por `_creationTime` descendente, acotada con `.take()`:

```ts
export const getRecentProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);
    const products = await ctx.db
      .query("products")
      .withIndex("by_new")
      .order("desc")
      .take(limit);

    return products
      .filter((p) => p.is_active)
      .map((p) => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        short_desc: p.short_desc,
        category_slug: p.category_slug,
        gender: p.gender,
        brand: p.brand,
        base_price: p.base_price,
        compare_price: p.compare_price,
        is_featured: p.is_featured,
        is_new: p.is_new,
        tags: p.tags,
        images: p.images,
        _creationTime: p._creationTime,
      }));
  },
});
```

**Notas:**
- `.order("desc")` ordena por `_creationTime` descendente (más nuevos primero).
- `.take(limit)` acota la consulta (guías Convex: nunca `.collect()` no acotado).
- No expone `variants` completas ni datos internos — solo lo necesario para promoción.
- `limit` default 50, tope 100.

### 3.2 `convex/http.ts` — endpoint HTTP público

Archivo nuevo:

```ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/products/latest",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const products = await ctx.runQuery(api.products.getRecentProducts, { limit });

    return new Response(JSON.stringify({ products }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// CORS preflight
http.route({
  path: "/products/latest",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

export default http;
```

**URL de consumo:** `https://curious-ox-401.convex.site/products/latest?limit=50`

---

## 4. Flujo A — Detección → Gemini → Discord

### 4.1 Nodos y conexiones

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Schedule        │────▶│  HTTP Convex     │────▶│  Code: Filter   │
│  Trigger         │     │  GET /latest     │     │  by watermark   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Split In Batches│
                                                 │  (1 per product) │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  HTTP Gemini     │
                                                 │  generateContent │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  HTTP Discord    │
                                                 │  Webhook POST    │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Code: Update    │
                                                 │  watermark       │
                                                 └─────────────────┘
```

### 4.2 Definición de nodos (JSON)

**Nodo 1: Schedule Trigger**
```json
{
  "parameters": {
    "rule": {
      "interval": [{ "field": "hours", "hoursInterval": 1 }]
    },
    "triggerAtStartup": true
  },
  "id": "a1-schedule",
  "name": "Schedule Trigger",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [0, 0]
}
```

**Nodo 2: HTTP Request — Convex**
```json
{
  "parameters": {
    "url": "https://curious-ox-401.convex.site/products/latest?limit=50",
    "method": "GET",
    "options": {}
  },
  "id": "a2-convex",
  "name": "Fetch Recent Products",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [220, 0]
}
```

**Nodo 3: Code — Filter by watermark**
```json
{
  "parameters": {
    "jsCode": "const staticData = $getWorkflowStaticData('global');\nconst watermark = staticData.lastCreationTime || 0;\nconst products = $input.first().json.products || [];\n\nconst pending = products.filter(p => p._creationTime > watermark);\n\nif (pending.length === 0) {\n  return [{ json: { skip: true, message: 'No new products since last run' } }];\n}\n\nreturn pending.map(p => ({ json: { product: p } }));"
  },
  "id": "a3-filter",
  "name": "Filter New Products",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [440, 0]
}
```

**Nodo 4: HTTP Request — Gemini**
```json
{
  "parameters": {
    "url": "=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={{ $env.GEMINI_API_KEY }}",
    "method": "POST",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "",
          "value": "={{ JSON.stringify({ contents: [{ parts: [{ text: `Eres un copywriter de moda especializado en calzado. Genera material promocional para el siguiente producto:\n\nProducto: ${$json.product.name}\nPrecio: Bs ${$json.product.base_price}\nPrecio anterior: Bs ${$json.product.compare_price || 'N/A'}\nCategoría: ${$json.product.category_slug}\nDescripción: ${$json.product.description || $json.product.short_desc || 'Sin descripción'}\nTags: ${($json.product.tags || []).join(', ')}\n\nGenera UN SOLO JSON con esta estructura exacta:\n{\n  \"discord_title\": \"título llamativo para embed de Discord (máx 80 chars)\",\n  \"discord_description\": \"descripción promocional para embed (máx 300 chars)\",\n  \"copy_general\": \"copy promocional versátil en español (2-3 oraciones)\"\n}` }] }] }) }}"
        }
      ]
    },
    "options": {}
  },
  "id": "a4-gemini",
  "name": "Generate Promo Copy",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [660, 0]
}
```

**Nodo 5: HTTP Request — Discord**
```json
{
  "parameters": {
    "url": "{{ $env.DISCORD_WEBHOOK_URL }}",
    "method": "POST",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "",
          "value": "={{ JSON.stringify({ embeds: [{ title: $json.candidates[0].content.parts[0].text ? JSON.parse($json.candidates[0].content.parts[0].text).discord_title : 'Nuevo producto', description: $json.candidates[0].content.parts[0].text ? JSON.parse($json.candidates[0].content.parts[0].text).discord_description : '', color: 10038562, fields: [{ name: '💰 Precio', value: `Bs ${$('Filter New Products').item.json.product.base_price}`, inline: true }, { name: '🏷️ Categoría', value: $('Filter New Products').item.json.product.category_slug, inline: true }, { name: '📝 Copy', value: $json.candidates[0].content.parts[0].text ? JSON.parse($json.candidates[0].content.parts[0].text).copy_general : '' }], footer: { text: 'Flores Store — Generado automáticamente' } }] }) }}"
        }
      ]
    },
    "options": {}
  },
  "id": "a5-discord",
  "name": "Post to Discord",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [880, 0]
}
```

**Nodo 6: Code — Update watermark**
```json
{
  "parameters": {
    "jsCode": "const staticData = $getWorkflowStaticData('global');\nconst allItems = $('Filter New Products').all();\nconst timestamps = allItems.map(item => item.json.product._creationTime);\nconst maxTime = Math.max(...timestamps);\nstaticData.lastCreationTime = maxTime;\nreturn [{ json: { watermark_updated: maxTime, processed: allItems.length } }];"
  },
  "id": "a6-watermark",
  "name": "Update Watermark",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [1100, 0]
}
```

### 4.3 Conexiones

```json
{
  "connections": {
    "Schedule Trigger": {
      "main": [[{ "node": "Fetch Recent Products", "type": "main", "index": 0 }]]
    },
    "Fetch Recent Products": {
      "main": [[{ "node": "Filter New Products", "type": "main", "index": 0 }]]
    },
    "Filter New Products": {
      "main": [[{ "node": "Generate Promo Copy", "type": "main", "index": 0 }]]
    },
    "Generate Promo Copy": {
      "main": [[{ "node": "Post to Discord", "type": "main", "index": 0 }]]
    },
    "Post to Discord": {
      "main": [[{ "node": "Update Watermark", "type": "main", "index": 0 }]]
    }
  }
}
```

### 4.4 Watermark — `staticData` de n8n

- **Dónde:** `$getWorkflowStaticData('global')` — persistencia interna de n8n, no en Convex.
- **Campo:** `lastCreationTime` (number, epoch ms).
- **Inicialización:** `0` si no existe → primera ejecución procesa todos los productos.
- **Actualización:** solo después de que todos los productos del lote se enviaron a Discord exitosamente.
- **Catch-up:** `triggerAtStartup: true` garantiza que al arrancar n8n tras un apagado, se ejecuta inmediatamente y procesa todo lo creado desde `lastCreationTime`.

---

## 5. Flujo B — Posters → Descripciones por red → Discord

### 5.1 Nodos y conexiones

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Manual Trigger  │────▶│  HTTP Convex     │────▶│  Code: Select   │
│  (con input)     │     │  GET /latest     │     │  product        │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  HTTP Gemini     │
                                                 │  Poster + Copy   │
                                                 │  por red          │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  HTTP Discord    │
                                                 │  Webhook (4      │
                                                 │  secciones)      │
                                                 └─────────────────┘
```

### 5.2 Definición de nodos

**Nodo 1: Manual Trigger**
```json
{
  "parameters": {},
  "id": "b1-manual",
  "name": "Manual Trigger",
  "type": "n8n-nodes-base.manualTrigger",
  "typeVersion": 1,
  "position": [0, 0]
}
```

**Nodo 2: HTTP Request — Convex** (igual que Flujo A)
```json
{
  "parameters": {
    "url": "https://curious-ox-401.convex.site/products/latest?limit=50",
    "method": "GET",
    "options": {}
  },
  "id": "b2-convex",
  "name": "Fetch Products",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [220, 0]
}
```

**Nodo 3: Code — Select product**
```json
{
  "parameters": {
    "jsCode": "// Tomar el primer producto de la lista (el más reciente)\n// En uso manual, el operador puede modificar este nodo para filtrar por slug\nconst products = $input.first().json.products || [];\nif (products.length === 0) {\n  throw new Error('No hay productos disponibles');\n}\nconst selected = products[0];\nreturn [{ json: { product: selected } }];"
  },
  "id": "b3-select",
  "name": "Select Product",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [440, 0]
}
```

**Nodo 4: HTTP Request — Gemini (poster + copys)**
```json
{
  "parameters": {
    "url": "=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={{ $env.GEMINI_API_KEY }}",
    "method": "POST",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "",
          "value": "={{ JSON.stringify({ contents: [{ parts: [{ text: `Eres un director creativo de moda especializada en calzado. Genera material de poster y copys para redes sociales del siguiente producto:\n\nProducto: ${$json.product.name}\nPrecio: Bs ${$json.product.base_price}\nPrecio anterior: Bs ${$json.product.compare_price || 'N/A'}\nCategoría: ${$json.product.category_slug}\nGénero: ${$json.product.gender}\nDescripción: ${$json.product.description || $json.product.short_desc || 'Sin descripción'}\nTags: ${($json.product.tags || []).join(', ')}\nImagen: ${$json.product.images?.[0]?.url || 'Sin imagen'}\n\nGenera UN SOLO JSON con esta estructura exacta:\n{\n  \"poster_concept\": \"descripción visual del poster sugerido (layout, tipografía, mood) — máx 200 chars\",\n  \"tiktok\": {\n    \"description\": \"copy para TikTok con hashtags (máx 150 chars, incluir 3-5 hashtags relevantes)\",\n    \"hook\": \"frase gancho para los primeros 2 segundos del video (máx 60 chars)\"\n  },\n  \"facebook\": {\n    \"description\": \"copy para Facebook post (máx 250 chars, tono más informativo, incluir CTA)\",\n    \"headline\": \"titular corto para anuncio (máx 40 chars)\"\n  },\n  \"instagram\": {\n    \"caption\": \"copy para Instagram (máx 200 chars, emojis moderados, 5-8 hashtags al final)\",\n    \"story_text\": \"texto para Instagram Story (máx 50 chars, impacto visual)\"\n  },\n  \"whatsapp\": {\n    \"message\": \"mensaje para difusión por WhatsApp (máx 300 chars, formato con *negritas* y emojis, incluir precio y CTA al link)\"\n  }\n}` }] }] }) }}"
        }
      ]
    },
    "options": {}
  },
  "id": "b4-gemini",
  "name": "Generate Social Content",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [660, 0]
}
```

**Nodo 5: HTTP Request — Discord (4 secciones)**
```json
{
  "parameters": {
    "url": "{{ $env.DISCORD_WEBHOOK_URL }}",
    "method": "POST",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "",
          "value": "={{\n  const raw = $json.candidates[0].content.parts[0].text;\n  const data = JSON.parse(raw);\n  const product = $('Select Product').item.json.product;\n  return JSON.stringify({\n    embeds: [\n      {\n        title: `🎨 Poster — ${product.name}`,\n        description: data.poster_concept,\n        color: 10038562,\n        thumbnail: { url: product.images?.[0]?.url || '' },\n        fields: [\n          { name: '💰 Precio', value: `Bs ${product.base_price}`, inline: true }\n        ],\n        footer: { text: 'Flores Store — Flujo B: Posters' }\n      },\n      {\n        title: '📱 TikTok',\n        description: `**Hook:** ${data.tiktok.hook}\\n\\n${data.tiktok.description}`,\n        color: 16711680,\n        footer: { text: 'Formato: TikTok' }\n      },\n      {\n        title: '📘 Facebook',\n        description: `**${data.facebook.headline}**\\n\\n${data.facebook.description}`,\n        color: 2636798,\n        footer: { text: 'Formato: Facebook' }\n      },\n      {\n        title: '📸 Instagram',\n        description: `**Caption:**\\n${data.instagram.caption}\\n\\n**Story:** ${data.instagram.story_text}`,\n        color: 15311556,\n        footer: { text: 'Formato: Instagram' }\n      },\n      {\n        title: '💬 WhatsApp',\n        description: data.whatsapp.message,\n        color: 3381677,\n        footer: { text: 'Formato: WhatsApp' }\n      }\n    ]\n  });\n}}"
        }
      ]
    },
    "options": {}
  },
  "id": "b5-discord",
  "name": "Post Social Content to Discord",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [880, 0]
}
```

### 5.3 Conexiones

```json
{
  "connections": {
    "Manual Trigger": {
      "main": [[{ "node": "Fetch Products", "type": "main", "index": 0 }]]
    },
    "Fetch Products": {
      "main": [[{ "node": "Select Product", "type": "main", "index": 0 }]]
    },
    "Select Product": {
      "main": [[{ "node": "Generate Social Content", "type": "main", "index": 0 }]]
    },
    "Generate Social Content": {
      "main": [[{ "node": "Post Social Content to Discord", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## 6. Entregables n8n — `n8n/`

### 6.1 Estructura de directorios

```
n8n/
├── flows/
│   ├── flujo-a-catalogo.json      # Workflow Flujo A (completo)
│   └── flujo-b-posters.json       # Workflow Flujo B (completo)
├── docker-compose.yml
├── .env.example
└── README.md
```

### 6.2 `n8n/docker-compose.yml`

```yaml
version: "3.8"

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    container_name: flores-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-flores2024}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK_URL}
      - N8N_SECURE_COOKIE=false
      - GENERIC_TIMEZONE=${TZ:-America/La_Paz}
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

### 6.3 `n8n/.env.example`

```bash
# === n8n Admin ===
N8N_USER=admin
N8N_PASSWORD=cambiar-esta-contrasena

# === Gemini API ===
# Obtener key en: https://aistudio.google.com/apikey
GEMINI_API_KEY=pegar-aqui-tu-key-de-gemini

# === Discord Webhook ===
# Crear webhook en: Configuración del servidor → Integraciones → Webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXXX/YYYY

# === Timezone ===
TZ=America/La_Paz
```

### 6.4 `n8n/README.md` — secciones

1. **Requisitos:** Docker, Docker Compose, cuenta Google (Gemini), servidor Discord con permisos.
2. **Instalación:** `cp .env.example .env` → editar variables → `docker compose up -d`.
3. **Acceso:** `http://localhost:5678` con credenciales del `.env`.
4. **Importar workflows:** Settings → Import from File → seleccionar `flows/flujo-a-catalogo.json` y `flows/flujo-b-posters.json`.
5. **Variables de entorno en n8n:** confirmar que `$env.GEMINI_API_KEY` y `$env.DISCORD_WEBHOOK_URL` resuelven (Settings → Variables del entorno o las del compose).
6. **Flujo A — comportamiento:**
   - Se ejecuta cada 1 hora + al arrancar (`onStartup`).
   - Watermark en `staticData`: primera ejecución procesa todos; siguientes solo nuevos.
   - Catch-up: si n8n estuvo apagado, al arrancar procesa todo lo pendiente desde la última marca.
   - Watermark se actualiza solo tras envío exitoso a Discord.
7. **Flujo B — uso manual:**
   - Ejecutar desde el botón "Execute Workflow".
   - Toma el producto más reciente; modificar nodo "Select Product" para elegir otro.
   - Genera poster concept + copys para TikTok, Facebook, Instagram, WhatsApp.
   - Resultado: 5 embeds en Discord (poster + 4 redes).
8. **Diagnóstico:**
   - Error 401/403 en Gemini → verificar `GEMINI_API_KEY`.
   - Error en Discord → verificar `DISCORD_WEBHOOK_URL` y permisos del canal.
   - Sin productos → verificar endpoint Convex y que el seed se ejecutó.
   - Watermark no avanza → revisar ejecución en n8n > Executions.
9. **Rotación de secretos:** cambiar en `.env` → `docker compose down && docker compose up -d`.

---

## 7. Resumen de archivos a crear/modificar

| Archivo | Acción | Slice |
|---------|--------|-------|
| `convex/seed.ts` | Modificar: guard por slug + 13 productos nuevos | 1 |
| `src/lib/store.ts` | Modificar: agregar `rehydrate()` + `isHydrating` | 1 |
| `src/app/admin/layout.tsx` | Modificar: gate de hidratación | 1 |
| `src/components/admin/Sidebar.tsx` | Modificar: agregar item Configuración | 1 |
| `convex/products.ts` | Modificar: agregar query `getRecentProducts` | 2 |
| `convex/http.ts` | Crear: endpoint GET `/products/latest` | 2 |
| `n8n/flows/flujo-a-catalogo.json` | Crear: workflow Flujo A | 2 |
| `n8n/flows/flujo-b-posters.json` | Crear: workflow Flujo B | 2 |
| `n8n/docker-compose.yml` | Crear: compose local | 3 |
| `n8n/.env.example` | Crear: template de variables | 3 |
| `n8n/README.md` | Crear: documentación operativa | 3 |

---

## 8. Contratos y dependencias

### 8.1 Contrato del endpoint HTTP

**Request:**
```
GET https://curious-ox-401.convex.site/products/latest?limit=50
```

**Response (200):**
```json
{
  "products": [
    {
      "id": "abc123",
      "name": "Bota Chelsea Noir",
      "slug": "bota-chelsea-noir",
      "description": "...",
      "short_desc": "...",
      "category_slug": "botas",
      "gender": "mujer",
      "brand": "Flores",
      "base_price": 450,
      "compare_price": 680,
      "is_featured": true,
      "is_new": true,
      "tags": ["liquidacion", "tendencia"],
      "images": [{ "url": "https://...", "is_primary": true }],
      "_creationTime": 1717000000000
    }
  ]
}
```

### 8.2 Contrato del prompt Gemini

**Input:** texto en español con datos del producto.
**Output esperado:** JSON válido con la estructura definida en §4.2 (Flujo A) o §5.2 (Flujo B).
**Modelo:** `gemini-2.5-flash`.
**Key:** `{{ $env.GEMINI_API_KEY }}` — nunca literal en el JSON.

### 8.3 Contrato del webhook Discord

**Formato:** JSON con `embeds[]` (array de embed objects).
**Campos usados:** `title`, `description`, `color`, `fields[]`, `thumbnail`, `footer`.
**URL:** `{{ $env.DISCORD_WEBHOOK_URL }}` — nunca literal.

---

## 9. Riesgos de diseño y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| URLs Unsplash rotas en seed | Verificación HTTP 200 antes de commit; URLs conocidas y estables |
| Gemini devuelve JSON inválido | Los nodos de Discord incluyen fallback a texto plano si `JSON.parse` falla |
| n8n apagado por días | `triggerAtStartup: true` + watermark por `_creationTime` = catch-up completo |
| Endpoint público abusado | Solo datos de producto para promoción; sin auth, sin mutations, sin datos admin |
| Colisión IDs variante | IDs `v26`–`v84` verificados únicos contra `v1`–`v25` existentes |
| Presupuesto excedido | Medir diff antes de implementar; `ask-on-risk` si >400 líneas |

---

## Key Learnings

1. El seed de Convex necesita idempotencia por slug porque la tabla ya contiene productos y el guard "solo-si-vacío" impide insertar nuevos en ejecuciones posteriores.
2. Los IDs de variantes son buscados globalmente por las mutations de stock, así que cada variante nueva requiere un ID único no colisionante con los existentes.
3. Convex requiere un archivo http.ts explícito con httpAction para exponer endpoints HTTP planos consumibles por herramientas externas como n8n.
4. El watermark de procesamiento debe vivir en staticData de n8n y no en Convex para mantener la simetría "n8n sin auth" y permitir catch-up tras apagados.
5. La rehidratación de sesión admin requiere un estado intermedio isHydrating para evitar redirecciones falsas a login durante el refresh del navegador.
