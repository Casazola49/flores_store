// ============================================================
// API Client — Flores E-commerce
// Todas las llamadas al backend Node.js en el VPS
// ============================================================

import axios from "axios";
import type {
  Product,
  Category,
  CmsBanner,
  CmsAnnouncement,
  Order,
  InventoryItem,
  InventoryMovement,
  PaginatedResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Añadir JWT a las peticiones autenticadas
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("flores_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── PÚBLICA ──────────────────────────────────────────────
export const publicApi = {
  // Productos
  getProducts: (params?: {
    category?: string;
    gender?: string;
    featured?: boolean;
    is_new?: boolean;
    page?: number;
    limit?: number;
  }) => api.get<PaginatedResponse<Product>>("/products", { params }),

  getProduct: (slug: string) => api.get<Product>(`/products/${slug}`),

  getCategories: () => api.get<Category[]>("/categories"),

  // CMS público
  getBanners: () => api.get<CmsBanner[]>("/cms/banners"),
  getAnnouncement: () => api.get<CmsAnnouncement>("/cms/announcement"),
  getSection: (key: string) => api.get(`/cms/sections/${key}`),
};

// ── ADMIN (requiere JWT) ──────────────────────────────────
export const adminApi = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    api.post<{ token: string; user: { username: string; role: string } }>(
      "/auth/login",
      credentials
    ),
  me: () => api.get("/auth/me"),

  // Productos CRUD
  getProducts: (params?: object) =>
    api.get<PaginatedResponse<Product>>("/admin/products", { params }),
  createProduct: (data: Partial<Product>) =>
    api.post<Product>("/admin/products", data),
  updateProduct: (id: number, data: Partial<Product>) =>
    api.put<Product>(`/admin/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),

  // Variantes e Imágenes
  createVariant: (productId: number, data: object) =>
    api.post(`/admin/products/${productId}/variants`, data),
  uploadProductImage: (productId: number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post(`/admin/products/${productId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateVariant: (id: number, data: object) =>
    api.put(`/admin/variants/${id}`, data),
  deleteVariant: (id: number) => api.delete(`/admin/variants/${id}`),

  // Categorías
  getCategories: () => api.get<Category[]>("/admin/categories"),
  createCategory: (data: object) => api.post("/admin/categories", data),
  updateCategory: (id: number, data: object) =>
    api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),

  // Inventario
  getInventory: (params?: object) =>
    api.get<InventoryItem[]>("/admin/inventory", { params }),
  adjustStock: (variantId: number, data: { quantity: number; reason: string; note?: string }) =>
    api.post(`/admin/inventory/${variantId}/adjust`, data),
  getMovements: (variantId: number) =>
    api.get<InventoryMovement[]>(`/admin/inventory/${variantId}/movements`),

  // Pedidos
  getOrders: (params?: object) =>
    api.get<PaginatedResponse<Order>>("/admin/orders", { params }),
  getOrder: (id: number) => api.get<Order>(`/admin/orders/${id}`),
  updateOrderStatus: (id: number, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),

  // CMS
  getBanners: () => api.get<CmsBanner[]>("/admin/cms/banners"),
  createBanner: (data: object) => api.post("/admin/cms/banners", data),
  updateBanner: (id: number, data: object) =>
    api.put(`/admin/cms/banners/${id}`, data),
  deleteBanner: (id: number) => api.delete(`/admin/cms/banners/${id}`),
  reorderBanners: (ids: number[]) =>
    api.put("/admin/cms/banners/reorder", { ids }),

  getAnnouncement: () => api.get<CmsAnnouncement>("/admin/cms/announcement"),
  updateAnnouncement: (data: object) =>
    api.put("/admin/cms/announcement", data),

  getSections: () => api.get("/admin/cms/sections"),
  updateSection: (key: string, data: object) =>
    api.put(`/admin/cms/sections/${key}`, data),
};

export default api;
