# Design — Catálogo + fix CMS + n8n → Discord

> **PLACEHOLDER de fase.** Creado en `sdd-init`. Esta fase NO ha comenzado.

## Estado

- **Fase:** pendiente (no iniciada)
- **Depende de:** `spec.md` (requisitos verificables aprobados).

## Pendiente de diseñar (cuando arranque la fase)

- Diseño técnico por archivo: seed (shape de `products`, fotos verificadas), fix de sesión
  (`src/lib/store.ts` + `src/app/admin/layout.tsx`), sidebar
  (`src/components/admin/Sidebar.tsx`).
- Diseño de los flujos n8n (Flujo A y Flujo B): nodos, queries a Convex, watermark por
  `_creationTime`, llamadas a Gemini y Discord, prompts por red (TikTok, Facebook, Instagram,
  WhatsApp). **Explícitamente diferido a esta fase** — no se diseña en `proposal.md`.
- Estructura de `n8n/` (flows, compose, env) y contenido del README.
- Dónde persiste la marca de agua de productos ya procesados.
- Decisión de imágenes: hotlink a fuentes libres vs Cloudinary (impacto en `next.config.ts`).

---
_Placeholder — reemplazar con el contenido real de la fase `design`._
