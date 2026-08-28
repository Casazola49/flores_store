import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    video_url: v.optional(v.string()),
    sort_order: v.number(),
    is_active: v.boolean(),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    short_desc: v.optional(v.string()),
    category_slug: v.string(),
    gender: v.string(), // "mujer" | "hombre" | "unisex" | "niño"
    brand: v.string(),
    base_price: v.number(),
    compare_price: v.optional(v.number()),
    is_featured: v.boolean(),
    is_new: v.boolean(),
    is_active: v.boolean(),
    video_url: v.optional(v.string()),
        tags: v.array(v.string()),
    sort_order: v.number(),
    images: v.array(
      v.object({
        url: v.string(),
        is_primary: v.boolean(),
      })
    ),
    variants: v.array(
      v.object({
        id: v.string(), // Identificador local de la variante
        size: v.optional(v.string()),
        color: v.optional(v.string()),
        sku: v.optional(v.string()),
        price: v.optional(v.number()),
        stock: v.number(),
        is_active: v.boolean(),
      })
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category_slug"])
    .index("by_featured", ["is_featured"])
    .index("by_new", ["is_new"]),

  orders: defineTable({
    order_number: v.string(),
    customer_name: v.string(),
    customer_phone: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    delivery_type: v.string(), // "envio" | "retiro"
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    note: v.optional(v.string()),
    status: v.string(), // "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado"
    subtotal: v.number(),
    shipping_cost: v.number(),
    total: v.number(),
    payment_method: v.optional(v.string()),
    items: v.array(
      v.object({
        product_name: v.string(),
        variant_desc: v.optional(v.string()),
        price: v.number(),
        quantity: v.number(),
      })
    ),
  })
    .index("by_order_number", ["order_number"]),

  cms_banners: defineTable({
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    image_url: v.optional(v.string()),
    video_url: v.optional(v.string()),
    link_url: v.optional(v.string()),
    link_text: v.optional(v.string()),
    position: v.number(),
    is_active: v.boolean(),
  }),

  cms_sections: defineTable({
    key: v.string(),
    title: v.string(),
    content: v.string(),
  }).index("by_key", ["key"]),

  admin_users: defineTable({
    username: v.string(),
    password_hash: v.string(),
    role: v.string(), // "superadmin" | "admin"
    is_active: v.boolean(),
  }).index("by_username", ["username"]),

  admin_sessions: defineTable({
    token: v.string(),
    username: v.string(),
    expires_at: v.number(),
  }).index("by_token", ["token"]),
});
