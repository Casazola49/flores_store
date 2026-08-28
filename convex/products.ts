import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAuth } from "./auth";

// LISTAR PRODUCTOS (Público)
export const getProducts = query({
  args: {
    category: v.optional(v.string()), // slug de categoría
    is_new: v.optional(v.boolean()),
    sale: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    page: v.optional(v.number()),
    gender: v.optional(v.string()),
    search: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let list = await ctx.db.query("products").collect();

    // Filtros públicos
    list = list.filter((p) => p.is_active);

    if (args.category) {
      list = list.filter((p) => p.category_slug === args.category);
    }
    if (args.tag) {
      list = list.filter((p) => p.tags && p.tags.includes(args.tag!));
    }
    if (args.is_new !== undefined) {
      list = list.filter((p) => p.is_new === args.is_new);
    }
    if (args.featured !== undefined) {
      list = list.filter((p) => p.is_featured === args.featured);
    }
    if (args.sale) {
      list = list.filter(
        (p) =>
          p.compare_price !== undefined &&
          p.compare_price !== null &&
          p.compare_price > p.base_price
      );
    }
    if (args.gender) {
      list = list.filter((p) => p.gender === args.gender);
    }
    if (args.search) {
      const q = args.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Ordenar por sort_order
    list.sort((a, b) => a.sort_order - b.sort_order);

    // Paginación
    const page = args.page || 1;
    const limit = args.limit || 20;
    const total = list.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = list.slice(start, end).map((p) => ({ ...p, id: p._id }));

    return {
      data,
      total,
      page,
      per_page: limit,
    };
  },
});

// OBTENER PRODUCTO INDIVIDUAL POR SLUG (Público)
export const getProduct = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!product || !product.is_active) return null;
    return { ...product, id: product._id };
  },
});

// LISTAR PRODUCTOS PARA EL PANEL (Admin)
export const getProductsAdmin = query({
  args: {
    token: v.string(),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    let list = await ctx.db.query("products").collect();

    if (args.search) {
      const q = args.search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slug.includes(q));
    }

    list.sort((a, b) => b.sort_order - a.sort_order); // Más recientes/prioritarios primero en admin

    const page = args.page || 1;
    const limit = args.limit || 20;
    const total = list.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = list.slice(start, end).map((p) => ({ ...p, id: p._id }));

    return {
      data,
      total,
      page,
      per_page: limit,
    };
  },
});

// OBTENER DETALLE ADMIN
export const getProductAdminById = query({
  args: { token: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);
    const docId = ctx.db.normalizeId("products", args.id);
    if (!docId) throw new Error("ID de producto inválido");
    const product = await ctx.db.get(docId);
    if (!product) return null;
    return { ...product, id: product._id };
  },
});

// CREAR PRODUCTO (Admin)
export const createProduct = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    short_desc: v.optional(v.string()),
    category_slug: v.string(),
    gender: v.string(),
    brand: v.string(),
    base_price: v.number(),
    compare_price: v.optional(v.number()),
    is_featured: v.boolean(),
    is_new: v.boolean(),
    is_active: v.boolean(),
    tags: v.array(v.string()),
    sort_order: v.number(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("El identificador (slug) ya existe");
    }

    const id = await ctx.db.insert("products", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      short_desc: args.short_desc,
      category_slug: args.category_slug,
      gender: args.gender,
      brand: args.brand,
      base_price: args.base_price,
      compare_price: args.compare_price,
      is_featured: args.is_featured,
      is_new: args.is_new,
      is_active: args.is_active,
      tags: args.tags,
      sort_order: args.sort_order,
      images: [],
      variants: [],
    });

    const product = await ctx.db.get(id);
    return { ...product, id };
  },
});

// ACTUALIZAR PRODUCTO (Admin)
export const updateProduct = mutation({
  args: {
    token: v.string(),
    id: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    short_desc: v.optional(v.string()),
    category_slug: v.string(),
    gender: v.string(),
    brand: v.string(),
    base_price: v.number(),
    compare_price: v.optional(v.number()),
    is_featured: v.boolean(),
    is_new: v.boolean(),
    is_active: v.boolean(),
    tags: v.array(v.string()),
    sort_order: v.number(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("products", args.id);
    if (!docId) throw new Error("ID de producto inválido");

    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing && existing._id !== docId) {
      throw new Error("El slug ya está siendo usado por otro producto");
    }

    await ctx.db.patch(docId, {
      name: args.name,
      slug: args.slug,
      description: args.description,
      short_desc: args.short_desc,
      category_slug: args.category_slug,
      gender: args.gender,
      brand: args.brand,
      base_price: args.base_price,
      compare_price: args.compare_price,
      is_featured: args.is_featured,
      is_new: args.is_new,
      is_active: args.is_active,
      tags: args.tags,
      sort_order: args.sort_order,
    });

    const product = await ctx.db.get(docId);
    return { ...product, id: docId };
  },
});

// ELIMINAR PRODUCTO (Admin)
export const deleteProduct = mutation({
  args: {
    token: v.string(),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("products", args.id);
    if (!docId) throw new Error("ID de producto inválido");

    await ctx.db.delete(docId);
    return { success: true };
  },
});

// GESTIÓN DE VARIANTES (Admin)
export const addVariant = mutation({
  args: {
    token: v.string(),
    productId: v.string(),
    size: v.optional(v.string()),
    color: v.optional(v.string()),
    sku: v.optional(v.string()),
    price: v.optional(v.number()),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("products", args.productId);
    if (!docId) throw new Error("ID de producto inválido");

    const product = await ctx.db.get(docId);
    if (!product) throw new Error("Producto no encontrado");

    const newVariant = {
      id: crypto.randomUUID().substring(0, 8),
      size: args.size,
      color: args.color,
      sku: args.sku,
      price: args.price,
      stock: args.stock,
      is_active: true,
    };

    const variants = [...(product.variants || []), newVariant];
    await ctx.db.patch(docId, { variants });

    return { success: true, variant: newVariant };
  },
});

export const updateVariant = mutation({
  args: {
    token: v.string(),
    productId: v.string(),
    variantId: v.string(),
    size: v.optional(v.string()),
    color: v.optional(v.string()),
    price: v.optional(v.number()),
    stock: v.optional(v.number()),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("products", args.productId);
    if (!docId) throw new Error("ID de producto inválido");

    const product = await ctx.db.get(docId);
    if (!product) throw new Error("Producto no encontrado");

    const variants = (product.variants || []).map((v) => {
      if (v.id === args.variantId) {
        return {
          ...v,
          size: args.size !== undefined ? args.size : v.size,
          color: args.color !== undefined ? args.color : v.color,
          price: args.price !== undefined ? args.price : v.price,
          stock: args.stock !== undefined ? args.stock : v.stock,
          is_active: args.is_active,
        };
      }
      return v;
    });

    await ctx.db.patch(docId, { variants });
    return { success: true };
  },
});

export const deleteVariant = mutation({
  args: {
    token: v.string(),
    productId: v.string(),
    variantId: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("products", args.productId);
    if (!docId) throw new Error("ID de producto inválido");

    const product = await ctx.db.get(docId);
    if (!product) throw new Error("Producto no encontrado");

    const variants = (product.variants || []).filter((v) => v.id !== args.variantId);
    await ctx.db.patch(docId, { variants });

    return { success: true };
  },
});

// GESTIÓN DE IMÁGENES (Admin)
export const addProductImage = mutation({
  args: {
    token: v.string(),
    productId: v.string(),
    url: v.string(),
    is_primary: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("products", args.productId);
    if (!docId) throw new Error("ID de producto inválido");

    const product = await ctx.db.get(docId);
    if (!product) throw new Error("Producto no encontrado");

    let images = product.images || [];

    // Si la nueva imagen es primaria, quitar primario de las otras
    if (args.is_primary) {
      images = images.map((img) => ({ ...img, is_primary: false }));
    }

    images.push({ url: args.url, is_primary: args.is_primary });
    await ctx.db.patch(docId, { images });

    return { success: true };
  },
});

export const removeProductImage = mutation({
  args: {
    token: v.string(),
    productId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("products", args.productId);
    if (!docId) throw new Error("ID de producto inválido");

    const product = await ctx.db.get(docId);
    if (!product) throw new Error("Producto no encontrado");

    const images = (product.images || []).filter((img) => img.url !== args.url);
    await ctx.db.patch(docId, { images });

    return { success: true };
  },
});

export const setProductVideo = mutation({
  args: {
    token: v.string(),
    productId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("products", args.productId);
    if (!docId) throw new Error("ID de producto inválido");

    const product = await ctx.db.get(docId);
    if (!product) throw new Error("Producto no encontrado");

    await ctx.db.patch(docId, { video_url: args.url });
    return { success: true };
  },
});

export const adjustStock = mutation({
  args: {
    token: v.string(),
    variantId: v.string(),
    quantity: v.number(),
    reason: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    // Buscar el producto que contiene esta variante
    const products = await ctx.db.query("products").collect();
    let foundProduct = null;
    let foundVariant = null;

    for (const p of products) {
      const variants = p.variants || [];
      const v = variants.find((x) => x.id === args.variantId);
      if (v) {
        foundProduct = p;
        foundVariant = v;
        break;
      }
    }

    if (!foundProduct || !foundVariant) {
      throw new Error("Variante no encontrada");
    }

    // Actualizar el stock de la variante
    const newStock = Math.max(0, (foundVariant.stock || 0) + args.quantity);
    const updatedVariants = foundProduct.variants.map((v) => {
      if (v.id === args.variantId) {
        return { ...v, stock: newStock };
      }
      return v;
    });

    await ctx.db.patch(foundProduct._id, { variants: updatedVariants });

    return { success: true, newStock };
  },
});

