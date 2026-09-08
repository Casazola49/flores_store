// HTTP endpoint público para integraciones (n8n): lista productos recientes.
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

http.route({
  path: "/products/latest",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const raw = url.searchParams.get("limit");
      const limit = raw ? Math.min(Math.max(parseInt(raw, 10) || 50, 1), 100) : 50;
      const products = await ctx.runQuery(api.products.getRecentProducts, { limit });
      return new Response(JSON.stringify({ ok: true, products }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "error" }),
        { status: 500, headers: JSON_HEADERS }
      );
    }
  }),
});

http.route({
  path: "/products/latest",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: JSON_HEADERS })),
});

export default http;
