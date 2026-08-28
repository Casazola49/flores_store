import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAuth } from "./auth";

// LISTAR BANNERS ACTIVOS (Público)
export const getBanners = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db.query("cms_banners").collect();
    return list
      .filter((b) => b.is_active)
      .sort((a, b) => a.position - b.position)
      .map((b) => ({
        ...b,
        id: b._id, // Compatibilidad con el frontend
      }));
  },
});

// LISTAR TODOS LOS BANNERS PARA EL PANEL (Admin)
export const getBannersAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);
    const list = await ctx.db.query("cms_banners").collect();
    return list
      .sort((a, b) => a.position - b.position)
      .map((b) => ({
        ...b,
        id: b._id,
      }));
  },
});

// CREAR BANNER (Admin)
export const createBanner = mutation({
  args: {
    token: v.string(),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    image_url: v.optional(v.string()),
    video_url: v.optional(v.string()),
    link_url: v.optional(v.string()),
    link_text: v.optional(v.string()),
    position: v.number(),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const id = await ctx.db.insert("cms_banners", {
      title: args.title,
      subtitle: args.subtitle,
      image_url: args.image_url,
      video_url: args.video_url,
      link_url: args.link_url,
      link_text: args.link_text,
      position: args.position,
      is_active: args.is_active,
    });

    const banner = await ctx.db.get(id);
    return { ...banner, id };
  },
});

// ACTUALIZAR BANNER (Admin)
export const updateBanner = mutation({
  args: {
    token: v.string(),
    id: v.string(), // ID en formato string
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    image_url: v.optional(v.string()),
    video_url: v.optional(v.string()),
    link_url: v.optional(v.string()),
    link_text: v.optional(v.string()),
    position: v.number(),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    // Convertir el string ID a Convex Id
    const docId = ctx.db.normalizeId("cms_banners", args.id);
    if (!docId) throw new Error("ID de banner inválido");

    await ctx.db.patch(docId, {
      title: args.title,
      subtitle: args.subtitle,
      image_url: args.image_url,
      video_url: args.video_url,
      link_url: args.link_url,
      link_text: args.link_text,
      position: args.position,
      is_active: args.is_active,
    });

    const banner = await ctx.db.get(docId);
    return { ...banner, id: docId };
  },
});

// ELIMINAR BANNER (Admin)
export const deleteBanner = mutation({
  args: {
    token: v.string(),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("cms_banners", args.id);
    if (!docId) throw new Error("ID de banner inválido");

    await ctx.db.delete(docId);
    return { success: true };
  },
});

// REORDENAR BANNERS (Admin)
export const reorderBanners = mutation({
  args: {
    token: v.string(),
    ids: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    for (let i = 0; i < args.ids.length; i++) {
      const docId = ctx.db.normalizeId("cms_banners", args.ids[i]);
      if (docId) {
        await ctx.db.patch(docId, { position: i });
      }
    }

    return { success: true };
  },
});
