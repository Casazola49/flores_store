import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAuth } from "./auth";

// LISTAR CATEGORÍAS ACTIVAS (Público)
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db.query("categories").collect();
    return list
      .filter((c) => c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({
        ...c,
        id: c._id,
      }));
  },
});

// LISTAR TODAS LAS CATEGORÍAS (Admin)
export const getCategoriesAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);
    const list = await ctx.db.query("categories").collect();
    return list
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({
        ...c,
        id: c._id,
      }));
  },
});

// CREAR CATEGORÍA (Admin)
export const createCategory = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    video_url: v.optional(v.string()),
    sort_order: v.number(),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    // Verificar si el slug ya existe
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("El identificador (slug) ya existe");
    }

    const id = await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      image_url: args.image_url,
      video_url: args.video_url,
      sort_order: args.sort_order,
      is_active: args.is_active,
    });

    const category = await ctx.db.get(id);
    return { ...category, id };
  },
});

// ACTUALIZAR CATEGORÍA (Admin)
export const updateCategory = mutation({
  args: {
    token: v.string(),
    id: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    video_url: v.optional(v.string()),
    sort_order: v.number(),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("categories", args.id);
    if (!docId) throw new Error("ID de categoría inválido");

    // Verificar slug duplicado en otra categoría
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing && existing._id !== docId) {
      throw new Error("El identificador (slug) ya está siendo usado por otra categoría");
    }

    await ctx.db.patch(docId, {
      name: args.name,
      slug: args.slug,
      description: args.description,
      image_url: args.image_url,
      video_url: args.video_url,
      sort_order: args.sort_order,
      is_active: args.is_active,
    });

    const category = await ctx.db.get(docId);
    return { ...category, id: docId };
  },
});

// ELIMINAR CATEGORÍA (Admin)
export const deleteCategory = mutation({
  args: {
    token: v.string(),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("categories", args.id);
    if (!docId) throw new Error("ID de categoría inválido");

    const category = await ctx.db.get(docId);
    if (!category) throw new Error("Categoría no encontrada");

    // Verificar si hay productos asociados a esta categoría usando su slug
    const associatedProducts = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category_slug", category.slug))
      .collect();

    if (associatedProducts.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar la categoría porque tiene productos asociados",
      };
    }

    await ctx.db.delete(docId);
    return { success: true };
  },
});
