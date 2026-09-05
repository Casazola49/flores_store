# OpenSpec — Flores Store (SDD)

Ciclo de Spec-Driven Development para el change **redesign-editorial-total**
(rediseño editorial total del storefront visual). Config: `config.yaml`.

## Estructura

- `config.yaml` — contexto del proyecto, ciclo de fases, reglas y verificación.
- `changes/redesign-editorial-total/` — documentos de fase del change activo
  (proposal → spec → design → tasks), avanzando hacia apply/verify/sync.
- `artifacts/` — outputs generados durante apply/verify (p. ej. reportes de verificación).
- `archive/` — changes cerrados (fase archive).

## Flujo de fases

explore → proposal → spec → design → tasks → apply → verify → sync → archive

- Execution: auto ("dale"), sin pausas salvo fallo de gate.
- Delivery: ask-on-risk. Review budget: 400 líneas.
- Verificación: `npm run lint` + `npm run build` + greps de marca (ver `config.yaml` → testing).

## Fuentes de verdad (no editables por SDD salvo fase sync)

- `DESIGN.md` — sistema de diseño Flores Crimson.
- `PRODUCT.md` — posicionamiento, principios y alcance.

## Alcance del change

IN: storefront visual (home, PDP, catálogo, componentes store, tokens CSS).
OUT: backend Convex, admin, carrito/checkout, CMS, API routes, next.config.