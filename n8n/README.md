# Flores · Automatización n8n local (Discord + Gemini)

Detecta productos nuevos en Convex, genera prompts de posters con Gemini y te
manda todo a Discord. Ideal mientras usás imágenes placeholder: cuando subas una
foto oficial, el flujo te avisa al instante.

## Requisitos
- Docker (con `docker compose`)
- API key de Gemini: https://aistudio.google.com/apikey (gratis)
- Un webhook de Discord: Ajustes del canal → Integraciones → Webhooks

## Instalación (una vez)
```bash
cd n8n
cp .env.example .env        # completá GEMINI_API_KEY y DISCORD_WEBHOOK_URL
docker compose up -d
```
- UI de n8n: http://localhost:5678
- Importa los flujos con **Import from File**:
  - `flows/flujo-a-nuevos-productos.json` → se ejecuta solo cada 10 min y **al arrancar n8n** (detecta lo subido mientras estuvo apagado).
  - `flows/flujo-b-posters-descripciones.json` → lo ejecutás a mano cuando generás los posters.

## Flujo A — Productos nuevos → Gemini → Discord
1. Consulta `{CONVEX_SITE_URL}/products/latest?limit=50` (endpoint público).
2. Filtra los productos con `createdAt` mayor al último procesado (marca de agua guardada en el estado global del workflow, sobrevive reinicios).
3. Envía las fotos a Gemini (`gemini-2.5-flash`) para que **sugiera 3 prompts de posters promocionales por producto**.
4. Te llega un mensaje a Discord con los prompts listos para generar los posters.
5. La marca de agua avanza solo si el lote salió bien; si n8n estaba apagado, al prenderlo procesa todo lo pendiente.

## Flujo B — Posters → descripciones por red → Discord
1. **Ejecución manual**: subí los posters generados como binarios (`data`) del nodo inicial.
2. Gemini redacta **4 descripciones ES-BO** (TikTok, Facebook, Instagram, WhatsApp).
3. Discord recibe las imágenes + descripciones separadas por red, listas para publicar.

## Diagnóstico
- `docker compose logs -f n8n`
- El nodo HTTP de Convex responde `ok:true` (probalo en el navegador).
- Si no llegó nada a Discord: revisá `DISCORD_WEBHOOK_URL` y que el canal permita webhooks.
- Si Gemini falla: revisá `GEMINI_API_KEY` en la UI de n8n → Variables/Credenciales → Environment.
