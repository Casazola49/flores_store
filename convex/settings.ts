import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAuth } from "./auth";

// OBTENER TODOS LOS AJUSTES (Público)
export const getSections = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cms_sections").collect();
  },
});

// OBTENER AJUSTE ESPECÍFICO POR KEY (Público)
export const getSection = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cms_sections")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
  },
});

// OBTENER ANUNCIO SUPERIOR CON EL FORMATO COMPATIBLE CON EL FRONTEND (Público)
export const getAnnouncement = query({
  args: {},
  handler: async (ctx) => {
    const textSec = await ctx.db.query("cms_sections").withIndex("by_key", (q) => q.eq("key", "announcement_text")).unique();
    const bgSec = await ctx.db.query("cms_sections").withIndex("by_key", (q) => q.eq("key", "announcement_bg")).unique();
    const colorSec = await ctx.db.query("cms_sections").withIndex("by_key", (q) => q.eq("key", "announcement_text_color")).unique();
    const activeSec = await ctx.db.query("cms_sections").withIndex("by_key", (q) => q.eq("key", "announcement_active")).unique();

    return {
      id: 1,
      text: textSec?.content || "MARCA TENDENCIA CON FLORES",
      bg_color: bgSec?.content || "#E5C400",
      text_color: colorSec?.content || "#000000",
      is_active: activeSec?.content === "true",
      link_url: "",
    };
  },
});

// ACTUALIZAR SECCIÓN (Admin)
export const updateSection = mutation({
  args: {
    token: v.string(),
    key: v.string(),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const existing = await ctx.db
      .query("cms_sections")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
      });
      return await ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("cms_sections", {
        key: args.key,
        title: args.title,
        content: args.content,
      });
      return await ctx.db.get(id);
    }
  },
});

// ACTUALIZAR ANUNCIO SUPERIOR (Admin)
export const updateAnnouncement = mutation({
  args: {
    token: v.string(),
    text: v.string(),
    bg_color: v.string(),
    text_color: v.string(),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const keysMap = {
      announcement_text: { title: "Texto de la Barra de Anuncios", content: args.text },
      announcement_bg: { title: "Color de Fondo Anuncio", content: args.bg_color },
      announcement_text_color: { title: "Color de Texto Anuncio", content: args.text_color },
      announcement_active: { title: "Barra Activa", content: args.is_active ? "true" : "false" },
    };

    for (const [key, val] of Object.entries(keysMap)) {
      const existing = await ctx.db
        .query("cms_sections")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { content: val.content });
      } else {
        await ctx.db.insert("cms_sections", {
          key,
          title: val.title,
          content: val.content,
        });
      }
    }

    return {
      text: args.text,
      bg_color: args.bg_color,
      text_color: args.text_color,
      is_active: args.is_active,
    };
  },
});
