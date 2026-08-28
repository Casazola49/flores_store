# Proyecto: Flores Store (Aria Liquidación)
**Última Actualización:** Mayo 2026

## 📌 Resumen del Proyecto
"Flores Store" es un e-commerce de calzado premium. El objetivo principal es replicar la estética comercial de alto impacto de la web **"Aria Liquidación"** (arialiquidacion.com), pero manteniendo una base tecnológica moderna, rápida y escalable. 

Actualmente, el proyecto se encuentra en fase **MVP (Producto Mínimo Viable)**, listo para ser presentado a stakeholders utilizando datos "fantasma" (mocks) de alta calidad.

## 🛠️ Stack Tecnológico
*   **Frontend:** Next.js (App Router), React, Tailwind CSS.
*   **Estado Global:** Zustand (`useCartStore`).
*   **Iconos:** Lucide-React (Nota: Se usan SVGs inline para iconos sociales debido a bugs de versión).
*   **Backend / API:** Node.js + PostgreSQL (Actualmente alojado en `http://178.238.227.97:3005`).
*   **Estilo Visual:** 
    *   **Colores:** Amarillo Aria (`#FFD700`), Negro (`#000000`), Blanco.
    *   **Tipografías:** Montserrat (Principal/Comercial), Playfair Display (Acentos).
    *   **Formas:** Esquinas redondeadas (`border-radius: 20px`).

## ✅ Estado Actual (Lo que ya está hecho)
1.  **Diseño Aria Liquidación:** Se ha implementado con éxito la interfaz visual en `globals.css` y en los componentes principales (Navbar, Footer, Tarjetas de Producto).
2.  **Sistema de Fallback (Mocks):** Las páginas `/productos` y `/productos/[slug]` intentan consumir la API real. Si falla o está vacía, inyectan automáticamente `MOCK_PRODUCTS` (imágenes de Unsplash) para que el sitio nunca se vea vacío durante las demos.
3.  **Carrito de Compras:** El `CartDrawer` es completamente funcional (añadir, sumar, restar, eliminar) y calcula el subtotal.
4.  **Estabilidad:** Se han corregido errores de hidratación, problemas de posicionamiento con `next/image` (requiere parent `relative`) y dependencias rotas de iconos.

## 🚀 Próximos Pasos (Donde la IA / Jules debe enfocarse)
El objetivo de invocar a Jules es acelerar la finalización del proyecto y asegurar buenas prácticas. Las tareas pendientes son:

### 1. Integración de Videos en la Homepage
El cliente solicitó inicialmente que la Homepage tuviera **videos de fondo** en lugar de imágenes estáticas para darle más dinamismo, pero se pospuso para el MVP.
*   **Tarea:** Reemplazar el `Hero Section` estático en `src/app/(store)/page.tsx` por un componente de video optimizado (`<video autoPlay loop muted playsInline>`), manteniendo el banner amarillo de liquidación por encima.

### 2. Finalizar el Flujo de Pago por WhatsApp
El botón flotante de WhatsApp (`WhatsAppButton.tsx`) actualmente envía un mensaje genérico. 
*   **Tarea:** Conectar el botón "Completar Pedido" del `CartDrawer` para que genere un mensaje de WhatsApp dinámico con el resumen del carrito (Ej: *"Hola, quiero pedir: 1x Bota Chelsea Noir (Talla 38) - Total: Bs. 450"*).

### 3. Migración de Datos y Conexión Real
Una vez que el cliente comience a subir las fotos reales desde el panel de administración (`/admin`):
*   **Tarea:** Asegurarse de que `publicApi.ts` maneje correctamente la paginación y el filtrado, y crear un plan para eliminar progresivamente los `MOCK_PRODUCTS` del código frontend.

### 4. Auditoría de Performance y SEO
*   **Tarea:** Revisar que todas las páginas tengan metadata dinámica para SEO. Asegurar que las imágenes tengan correctamente los atributos `sizes` para carga rápida.

---

## 🤖 Instrucciones para el Agente IA (Jules)
1.  **Contexto:** Al iniciar una sesión, lee este archivo para entender las reglas de diseño y el estado del proyecto.
2.  **Regla de Diseño:** NO utilices colores genéricos. Limítate a la paleta de `globals.css`. Respeta el uso de `var(--color-accent)` para botones y alertas.
3.  **Código Seguro:** Antes de modificar componentes como `Footer.tsx` o `page.tsx`, asegúrate de no romper los SVGs inline implementados como solución de estabilidad.
