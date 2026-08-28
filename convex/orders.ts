import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAuth } from "./auth";

// CREAR PEDIDO (Público - Checkout)
export const createOrder = mutation({
  args: {
    customer_name: v.string(),
    customer_phone: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    delivery_type: v.string(), // "envio" | "retiro"
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    note: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    // Generar número de pedido incremental
    const allOrders = await ctx.db.query("orders").collect();
    const nextNumber = allOrders.length + 1;
    const orderNumber = `FLORES-${String(nextNumber).padStart(4, "0")}`;

    const orderId = await ctx.db.insert("orders", {
      order_number: orderNumber,
      customer_name: args.customer_name,
      customer_phone: args.customer_phone,
      customer_email: args.customer_email,
      delivery_type: args.delivery_type,
      address: args.address,
      city: args.city,
      note: args.note,
      status: "pendiente",
      subtotal: args.subtotal,
      shipping_cost: args.shipping_cost,
      total: args.total,
      payment_method: args.payment_method,
      items: args.items,
    });

    const order = await ctx.db.get(orderId);
    return { ...order, id: orderId };
  },
});

// LISTAR PEDIDOS PARA EL PANEL (Admin)
export const getOrders = query({
  args: {
    token: v.string(),
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    let list = await ctx.db.query("orders").collect();

    if (args.status) {
      list = list.filter((o) => o.status === args.status);
    }

    if (args.search) {
      const q = args.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          (o.customer_phone && o.customer_phone.includes(q))
      );
    }

    // Ordenar de más nuevo a más antiguo
    list.sort((a, b) => b._creationTime - a._creationTime);

    const page = args.page || 1;
    const limit = args.limit || 50;
    const total = list.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = list.slice(start, end).map((o) => ({ ...o, id: o._id }));

    return {
      data,
      total,
      page,
      per_page: limit,
    };
  },
});

// OBTENER DETALLE DE PEDIDO (Admin)
export const getOrder = query({
  args: { token: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("orders", args.id);
    if (!docId) throw new Error("ID de pedido inválido");

    const order = await ctx.db.get(docId);
    if (!order) return null;
    return { ...order, id: order._id };
  },
});

// ACTUALIZAR ESTADO DE PEDIDO (Admin)
export const updateOrderStatus = mutation({
  args: {
    token: v.string(),
    id: v.string(),
    status: v.string(), // "pendiente", "confirmado", "enviado", "entregado", "cancelado"
  },
  handler: async (ctx, args) => {
    await checkAuth(ctx.db, args.token);

    const docId = ctx.db.normalizeId("orders", args.id);
    if (!docId) throw new Error("ID de pedido inválido");

    await ctx.db.patch(docId, {
      status: args.status,
    });

    const order = await ctx.db.get(docId);
    return { ...order, id: docId };
  },
});
