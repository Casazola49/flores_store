# Spec — Catálogo + fix CMS + n8n → Discord

> **PLACEHOLDER de fase.** Creado en `sdd-init`. Esta fase NO ha comenzado.

## Estado

- **Fase:** pendiente (no iniciada)
- **Depende de:** `proposal.md` aprobado y `config.yaml` regenerado para este change.

## Pendiente de especificar (cuando arranque la fase)

- Requisitos verificables y criterios de aceptación para cada entregable del `proposal.md`:
  1. Seed masivo (~13 productos nuevos, total ~20) con fotos libres verificadas (200 OK +
     revisión visual; sin amarillo ni marcas gigantes). Definir el mecanismo de seed y qué se
     commitea (el estado de datos en Convex no se commitea).
  2. Fix CMS: rehidratación de sesión admin desde `flores_admin_token` vía `adminApi.me`;
     link de `/admin/configuracion` en el sidebar.
  3. Flujo A (inicio → productos nuevos → Discord → Gemini → prompts a Discord) y
     Flujo B (manual → posters → descripciones por red → Discord): requisitos funcionales,
     disparadores, entradas/salidas y criterios de aceptación por flujo.
  4. Entregables `n8n/`: flujos importables, `docker-compose.yml`, `.env.example`, `README.md`.
- Regla de secretos del `proposal.md` como requisito transversal (placeholder `$GEMINI_API_KEY`
  / `${DISCORD_WEBHOOK_URL}`, nunca valores reales).
- Decisión abierta: dónde vive la marca de agua por `_creationTime` (no existe tabla
  `staticData` en el schema actual).

---
_Placeholder — reemplazar con el contenido real de la fase `spec`._
