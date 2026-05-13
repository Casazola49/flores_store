// ============================================================
// TIPOS GLOBALES — Flores E-commerce
// ============================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size?: string;
  color?: string;
  color_hex?: string;
  sku?: string;
  price?: number;
  is_active: boolean;
  stock?: number; // desde inventory join
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_desc?: string;
  category_id?: number;
  category?: Category;
  gender?: "mujer" | "hombre" | "unisex" | "niño";
  brand: string;
  base_price: number;
  compare_price?: number;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  tags?: string[];
  meta_title?: string;
  meta_desc?: string;
  sort_order: number;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: number;
  variant_id: number;
  product_name: string;
  product_image?: string;
  size?: string;
  color?: string;
  color_hex?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_type?: "envio" | "retiro";
  address?: string;
  city?: string;
  note?: string;
  status: "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado";
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  product_name: string;
  variant_desc?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface InventoryItem {
  id: number;
  variant_id: number;
  stock_quantity: number;
  low_stock_alert: number;
  updated_at: string;
  // joins
  product_name?: string;
  size?: string;
  color?: string;
  sku?: string;
  product_image?: string;
}

export interface InventoryMovement {
  id: number;
  variant_id: number;
  quantity: number;
  reason: "compra" | "venta" | "ajuste" | "devolucion";
  note?: string;
  created_at: string;
}

// CMS Types
export interface CmsBanner {
  id: number;
  title?: string;
  subtitle?: string;
  image_url: string;
  image_mobile_url?: string;
  link_url?: string;
  link_text?: string;
  position: number;
  is_active: boolean;
}

export interface CmsAnnouncement {
  id: number;
  text: string;
  link_url?: string;
  bg_color: string;
  text_color: string;
  is_active: boolean;
}

export interface CmsSection {
  id: number;
  key: string;
  title?: string;
  content?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "superadmin" | "admin";
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
