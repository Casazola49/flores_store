# Verify — catalogo-n8n-discord

## Verificación ejecutada
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS (17/17)
- Seed: 20 productos, re-run idempotente (0 duplicados)
- Imágenes: 15 URLs únicas, todas HTTP 200 (2 rotas reemplazadas)
- Endpoint HTTP `https://curious-ox-401.convex.site/products/latest?limit=3`: 200 JSON ok:true
- Playwright CMS: login → dashboard → refresh **conserva sesión**; sidebar muestra Configuración
- Flows n8n: JSON válidos (node parse), secretos 0 en repo, placeholders en .env.example

## Pendientes (no bloqueantes)
- Importar flujos en n8n local del usuario y correr con GEMINI_API_KEY/DISCORD_WEBHOOK_URL reales
- Usuario revisa visualmente las 13 fotos nuevas en /productos (yo no puedo ver imágenes) → swap por update en Convex
- Confirmar comportamiento `activateOnStartup` en la versión de n8n instalada (toggler en UI si hiciera falta)
