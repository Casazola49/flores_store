// ============================================================
// API Client — Flores E-commerce
// Adaptador transparente de Convex para reemplazar Axios/VPS
// ============================================================

import { ConvexHttpClient } from "convex/browser";
import { api as convexApi } from "../../convex/_generated/api";
import type {
  Product,
  Category,
  CmsBanner,
  CmsAnnouncement,
  CmsSection,
  Order,
  InventoryItem,
  PaginatedResponse,
} from "@/types";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convexClient = new ConvexHttpClient(convexUrl);

// Bidirectional mappings for Category IDs (as frontend expects number ids 1-5)
const slugToId = (slug: string): number => {
  const map: Record<string, number> = {
    "botas": 1,
    "zapatos": 2,
    "zapatillas": 3,
    "zapatillas-deportivas": 4,
    "tacos": 5
  };
  return map[slug] || 99;
};

const idToSlug = (id: number | string): string => {
  const map: Record<string | number, string> = {
    1: "botas",
    2: "zapatos",
    3: "zapatillas",
    4: "zapatillas-deportivas",
    5: "tacos"
  };
  return map[id] || "zapatos";
};

// Mappers to ensure exact compatibility with old Postgres schema shapes
const mapProduct = (p: any): Product => {
  if (!p) return null as any;
  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    short_desc: p.short_desc,
    category_id: slugToId(p.category_slug),
    gender: p.gender,
    brand: p.brand,
    base_price: p.base_price,
    compare_price: p.compare_price,
    is_featured: p.is_featured,
    is_new: p.is_new,
    is_active: p.is_active,
    tags: p.tags || [],
    sort_order: p.sort_order || 0,
    images: (p.images || []).map((img: any, idx: number) => ({
      id: idx + 1,
      product_id: p._id,
      url: img.url,
      is_primary: img.is_primary,
      sort_order: idx + 1,
    })),
    variants: (p.variants || []).map((v: any, idx: number) => ({
      id: v.id,
      product_id: p._id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      price: v.price || p.base_price,
      stock: v.stock || 0,
      is_active: v.is_active,
    })),
    created_at: new Date(p._creationTime).toISOString(),
    updated_at: new Date(p._creationTime).toISOString(),
  };
};

const mapCategory = (c: any): Category => {
  if (!c) return null as any;
  return {
    id: slugToId(c.slug),
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_url: c.image_url,
    video_url: c.video_url,
    sort_order: c.sort_order,
    is_active: c.is_active,
  };
};

const mapOrder = (o: any): Order => {
  if (!o) return null as any;
  return {
    id: o._id,
    order_number: o.order_number,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    customer_phone: o.customer_phone,
    delivery_type: o.delivery_type,
    address: o.address,
    city: o.city,
    note: o.note,
    status: o.status,
    subtotal: o.subtotal,
    shipping_cost: o.shipping_cost,
    total: o.total,
    payment_method: o.payment_method,
    items: (o.items || []).map((item: any, idx: number) => ({
      id: idx + 1,
      order_id: o._id,
      variant_id: 0,
      product_name: item.product_name,
      variant_desc: item.variant_desc,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
    })),
    created_at: new Date(o._creationTime).toISOString(),
    updated_at: new Date(o._creationTime).toISOString(),
  };
};

// ── PÚBLICA ──────────────────────────────────────────────
export const publicApi = {
  getProducts: async (params?: {
    category?: string;
    gender?: string;
    featured?: boolean;
    is_new?: boolean;
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
  }) => {
    const result = await convexClient.query(convexApi.products.getProducts, {
      category: params?.category,
      gender: params?.gender,
      featured: params?.featured,
      is_new: params?.is_new,
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      tag: params?.tag,
    });
    return {
      data: {
        ...result,
        data: result.data.map(mapProduct),
      } as PaginatedResponse<Product>
    };
  },

  getProduct: async (slug: string) => {
    const result = await convexClient.query(convexApi.products.getProduct, { slug });
    return { data: mapProduct(result) };
  },

  getCategories: async () => {
    const result = await convexClient.query(convexApi.categories.getCategories);
    return { data: result.map(mapCategory) };
  },

  getBanners: async () => {
    const result = await convexClient.query(convexApi.banners.getBanners);
    return { data: result };
  },

  getAnnouncement: async () => {
    const result = await convexClient.query(convexApi.settings.getAnnouncement);
    return { data: result };
  },

  getSections: async () => {
    const result = await convexClient.query(convexApi.settings.getSections);
    return { data: result };
  },

  getSection: async (key: string) => {
    const result = await convexClient.query(convexApi.settings.getSection, { key });
    return { data: result };
  },
};

// ── ADMIN (requiere token guardado en localStorage) ──────────────────
export const adminApi = {
  // Auth
  login: async (credentials: { username: string; password: string }) => {
    const result = await convexClient.mutation(convexApi.auth.login, credentials);
    if (!result.success) {
      const err = new Error(result.message) as any;
      err.response = { data: { message: result.message } };
      throw err;
    }
    return { data: { token: result.token, user: result.user } };
  },

  me: async () => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.query(convexApi.auth.me, { token });
    return { data: result };
  },

  // Productos CRUD
  getProducts: async (params?: { page?: number; limit?: number; search?: string }) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.query(convexApi.products.getProductsAdmin, {
      token,
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
    });
    return {
      data: {
        ...result,
        data: result.data.map(mapProduct),
      } as PaginatedResponse<Product>
    };
  },

  createProduct: async (data: Partial<Product>) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.products.createProduct, {
      token,
      name: data.name!,
      slug: data.slug || data.name!.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: data.description,
      short_desc: data.short_desc,
      category_slug: idToSlug(data.category_id || 1),
      gender: data.gender || "unisex",
      brand: data.brand || "Flores",
      base_price: Number(data.base_price || 0),
      compare_price: data.compare_price ? Number(data.compare_price) : undefined,
      is_featured: !!data.is_featured,
      is_new: !!data.is_new,
      is_active: data.is_active !== false,
      tags: data.tags || [],
      sort_order: Number(data.sort_order || 0),
    });
    return { data: mapProduct(result) };
  },

  updateProduct: async (id: number | string, data: Partial<Product>) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.products.updateProduct, {
      token,
      id: String(id),
      name: data.name || "",
      slug: data.slug || "",
      description: data.description,
      short_desc: data.short_desc,
      category_slug: idToSlug(data.category_id || 1),
      gender: data.gender || "unisex",
      brand: data.brand || "Flores",
      base_price: Number(data.base_price || 0),
      compare_price: data.compare_price ? Number(data.compare_price) : undefined,
      is_featured: !!data.is_featured,
      is_new: !!data.is_new,
      is_active: data.is_active !== false,
      tags: data.tags || [],
      sort_order: Number(data.sort_order || 0),
    });
    return { data: mapProduct(result) };
  },

  deleteProduct: async (id: number | string) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.products.deleteProduct, {
      token,
      id: String(id),
    });
    return { data: result };
  },

  // Variantes e Imágenes
  createVariant: async (productId: number | string, data: any) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.products.addVariant, {
      token,
      productId: String(productId),
      size: data.size,
      color: data.color,
      sku: data.sku,
      price: data.price ? Number(data.price) : undefined,
      stock: Number(data.stock || 0),
    });
    return { data: result };
  },

  uploadProductImage: async (productId: number | string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const uploadResult = await res.json();
    if (!res.ok) throw new Error(uploadResult.error || "Error al subir imagen");

    const token = localStorage.getItem("flores_admin_token") || "";
    const addResult = await convexClient.mutation(convexApi.products.addProductImage, {
      token,
      productId: String(productId),
      url: uploadResult.url,
      is_primary: false,
    });
    return { data: addResult };
  },

  updateVariant: async (variantId: number | string, data: any) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const productsRes = await convexClient.query(convexApi.products.getProductsAdmin, { token, limit: 1000 });
    const product = productsRes.data.find((p: any) => (p.variants || []).some((v: any) => v.id === String(variantId)));
    if (!product) throw new Error("Producto no encontrado para la variante");

    const result = await convexClient.mutation(convexApi.products.updateVariant, {
      token,
      productId: product._id,
      variantId: String(variantId),
      size: data.size,
      color: data.color,
      price: data.price ? Number(data.price) : undefined,
      stock: data.stock !== undefined ? Number(data.stock) : undefined,
      is_active: data.is_active !== false,
    });
    return { data: result };
  },

  deleteVariant: async (variantId: number | string) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const productsRes = await convexClient.query(convexApi.products.getProductsAdmin, { token, limit: 1000 });
    const product = productsRes.data.find((p: any) => (p.variants || []).some((v: any) => v.id === String(variantId)));
    if (!product) throw new Error("Producto no encontrado para la variante");

    const result = await convexClient.mutation(convexApi.products.deleteVariant, {
      token,
      productId: product._id,
      variantId: String(variantId),
    });
    return { data: result };
  },

  // Categorías
  getCategories: async () => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.query(convexApi.categories.getCategoriesAdmin, { token });
    return { data: result.map(mapCategory) };
  },

  createCategory: async (data: any) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.categories.createCategory, {
      token,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: data.description,
      image_url: data.image_url,
      video_url: data.video_url,
      sort_order: Number(data.sort_order || 0),
      is_active: data.is_active !== false,
    });
    return { data: mapCategory(result) };
  },

  updateCategory: async (id: number | string, data: any) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const categoriesList = await convexClient.query(convexApi.categories.getCategoriesAdmin, { token });
    const realCategory = categoriesList.find(c => c.slug === data.slug);
    if (!realCategory) throw new Error("Categoría no encontrada para actualizar");

    const result = await convexClient.mutation(convexApi.categories.updateCategory, {
      token,
      id: realCategory._id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      image_url: data.image_url,
      video_url: data.video_url,
      sort_order: Number(data.sort_order || 0),
      is_active: data.is_active !== false,
    });
    return { data: mapCategory(result) };
  },

  deleteCategory: async (id: number | string) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const categoriesList = await convexClient.query(convexApi.categories.getCategoriesAdmin, { token });
    const realCategory = categoriesList.find(c => slugToId(c.slug) === Number(id));
    if (!realCategory) throw new Error("Categoría no encontrada");

    const result = await convexClient.mutation(convexApi.categories.deleteCategory, {
      token,
      id: realCategory._id,
    });
    return { data: result };
  },

  uploadCategoryFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const uploadResult = await res.json();
    if (!res.ok) throw new Error(uploadResult.error || "Error al subir archivo");
    return { data: uploadResult };
  },

  // Inventario
  getInventory: async (params?: { search?: string }) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const productsRes = await convexClient.query(convexApi.products.getProductsAdmin, { token, limit: 1000 });
    const list: InventoryItem[] = [];
    productsRes.data.forEach((p: any) => {
      (p.variants || []).forEach((v: any) => {
        list.push({
          id: v.id,
          variant_id: v.id,
          stock_quantity: v.stock || 0,
          low_stock_alert: 5,
          product_name: p.name,
          size: v.size,
          color: v.color,
          sku: v.sku,
          product_image: p.images?.[0]?.url || "",
        } as InventoryItem);
      });
    });

    if (params?.search) {
      const q = params.search.toLowerCase();
      return {
        data: list.filter(item =>
          item.product_name?.toLowerCase().includes(q) ||
          (item.sku && item.sku.toLowerCase().includes(q))
        )
      };
    }
    return { data: list };
  },

  adjustStock: async (variantId: number | string, data: { quantity: number; reason: string; note?: string }) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.products.adjustStock, {
      token,
      variantId: String(variantId),
      quantity: Number(data.quantity),
      reason: data.reason,
      note: data.note,
    });
    return { data: result };
  },

  // Pedidos
  getOrders: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.query(convexApi.orders.getOrders, {
      token,
      status: params?.status,
      search: params?.search,
      page: params?.page,
      limit: params?.limit,
    });
    return {
      data: {
        ...result,
        data: result.data.map(mapOrder),
      } as PaginatedResponse<Order>
    };
  },

  getOrder: async (id: number | string) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.query(convexApi.orders.getOrder, {
      token,
      id: String(id),
    });
    return { data: mapOrder(result) };
  },

  updateOrderStatus: async (id: number | string, status: string) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.orders.updateOrderStatus, {
      token,
      id: String(id),
      status,
    });
    return { data: mapOrder(result) };
  },

  // CMS
  getBanners: async () => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.query(convexApi.banners.getBannersAdmin, { token });
    return { data: result };
  },

  createBanner: async (data: any) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.banners.createBanner, {
      token,
      title: data.title,
      subtitle: data.subtitle,
      image_url: data.image_url,
      video_url: data.video_url,
      link_url: data.link_url,
      link_text: data.link_text,
      position: Number(data.position || 0),
      is_active: data.is_active !== false,
    });
    return { data: result };
  },

  updateBanner: async (id: number | string, data: any) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.banners.updateBanner, {
      token,
      id: String(id),
      title: data.title,
      subtitle: data.subtitle,
      image_url: data.image_url,
      video_url: data.video_url,
      link_url: data.link_url,
      link_text: data.link_text,
      position: Number(data.position || 0),
      is_active: data.is_active,
    });
    return { data: result };
  },

  deleteBanner: async (id: number | string) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.banners.deleteBanner, {
      token,
      id: String(id),
    });
    return { data: result };
  },

  reorderBanners: async (ids: any[]) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.banners.reorderBanners, {
      token,
      ids: ids.map(String),
    });
    return { data: result };
  },

  uploadBannerFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const uploadResult = await res.json();
    if (!res.ok) throw new Error(uploadResult.error || "Error al subir archivo");
    return { data: uploadResult };
  },

  getAnnouncement: async () => {
    const result = await convexClient.query(convexApi.settings.getAnnouncement);
    return { data: result };
  },

  updateAnnouncement: async (data: any) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.settings.updateAnnouncement, {
      token,
      text: data.text,
      bg_color: data.bg_color,
      text_color: data.text_color,
      is_active: !!data.is_active,
    });
    return { data: result };
  },

  getSections: async () => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.query(convexApi.settings.getSections);
    return { data: result };
  },

  updateSection: async (key: string, data: any) => {
    const token = localStorage.getItem("flores_admin_token") || "";
    const result = await convexClient.mutation(convexApi.settings.updateSection, {
      token,
      key,
      title: data.title || key,
      content: data.content || "",
    });
    return { data: result };
  },
};

export default adminApi;
