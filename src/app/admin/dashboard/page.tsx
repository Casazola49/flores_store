"use client";

import { useAdminAuth } from "@/lib/store";
import { adminApi } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, DollarSign, ShoppingCart, TrendingUp, AlertTriangle, ArrowRight, Clock } from "lucide-react";

interface Stats {
  totalProducts: number;
  activeOrders: number;
  lowStockAlerts: number;
  recentOrders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    base_price: number;
    images?: Array<{ url: string }>;
    slug: string;
  }>;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendiente:  { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700" },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  enviado:    { label: "Enviado",    color: "bg-purple-100 text-purple-700" },
  entregado:  { label: "Entregado",  color: "bg-green-100 text-green-700" },
  cancelado:  { label: "Cancelado",  color: "bg-red-100 text-red-700" },
};

export default function Dashboard() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeOrders: 0,
    lowStockAlerts: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [productsRes, ordersRes, inventoryRes] = await Promise.allSettled([
          adminApi.getProducts({ limit: 8, page: 1 }),
          adminApi.getOrders({ limit: 5 }),
          adminApi.getInventory({}),
        ]);

        const products = productsRes.status === "fulfilled" ? productsRes.value.data : null;
        const orders = ordersRes.status === "fulfilled" ? ordersRes.value.data : null;
        const inventory = inventoryRes.status === "fulfilled" ? inventoryRes.value.data : [];

        setStats({
          totalProducts: (products as any)?.total ?? (products as any)?.data?.length ?? 0,
          activeOrders: (orders as any)?.data?.filter((o: any) =>
            ["pendiente", "confirmado", "enviado"].includes(o.status)
          ).length ?? 0,
          lowStockAlerts: Array.isArray(inventory)
            ? inventory.filter((i: any) => i.stock_quantity <= i.low_stock_alert).length
            : 0,
          recentOrders: (orders as any)?.data?.slice(0, 5) ?? [],
          topProducts: (products as any)?.data?.slice(0, 6) ?? [],
        });
      } catch (err) {
        console.error("Error loading dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, <span className="text-[#9B1C1C]">{user?.username}</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Panel de Control — Flores E-commerce</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-500 text-sm">Total Productos</h3>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">{loading ? "—" : stats.totalProducts}</p>
          <Link href="/admin/productos" className="text-xs text-blue-500 mt-2 flex items-center gap-1 hover:underline">
            Ver catálogo <ArrowRight size={11} />
          </Link>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-500 text-sm">Pedidos Activos</h3>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
              <ShoppingCart size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">{loading ? "—" : stats.activeOrders}</p>
          <Link href="/admin/pedidos" className="text-xs text-purple-500 mt-2 flex items-center gap-1 hover:underline">
            Ver pedidos <ArrowRight size={11} />
          </Link>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-500 text-sm">Ventas del Mes</h3>
            <div className="w-9 h-9 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">Bs. —</p>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <TrendingUp size={11} /> Se actualizará con ventas reales
          </p>
        </div>

        <div className={`stat-card ${stats.lowStockAlerts > 0 ? "border-red-200 bg-red-50/40" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold text-sm ${stats.lowStockAlerts > 0 ? "text-red-600" : "text-gray-500"}`}>
              Alertas de Stock
            </h3>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stats.lowStockAlerts > 0 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${stats.lowStockAlerts > 0 ? "text-red-600" : ""}`}>
            {loading ? "—" : stats.lowStockAlerts}
          </p>
          <Link href="/admin/inventario" className="text-xs text-red-500 mt-2 flex items-center gap-1 hover:underline">
            Gestionar inventario <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Últimos pedidos */}
        <div className="lg:col-span-3 bg-white p-6 border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg">Últimos Pedidos</h3>
            <Link href="/admin/pedidos" className="text-xs text-[#9B1C1C] hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-lg" />)}
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg text-sm">
              No hay pedidos aún
            </div>
          ) : (
            <div className="space-y-1">
              {stats.recentOrders.map((order) => {
                const s = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-bold text-sm">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{order.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-sm">Bs. {Number(order.total).toFixed(2)}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${s.color}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Productos con imágenes */}
        <div className="lg:col-span-2 bg-white p-6 border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg">Productos en Catálogo</h3>
            <Link href="/admin/productos" className="text-xs text-[#9B1C1C] hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square skeleton rounded-lg" />)}
            </div>
          ) : stats.topProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg text-sm">
              No hay productos
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {stats.topProducts.map((product) => {
                const img = product.images?.[0]?.url ?? "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200";
                return (
                  <Link
                    key={product.id}
                    href={`/admin/productos/${product.id}`}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                    title={product.name}
                  >
                    <Image
                      src={img}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="80px"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-end p-1">
                      <span className="text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 truncate leading-tight">
                        {product.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <Link
            href="/admin/productos/nuevo"
            className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#9B1C1C] hover:text-[#9B1C1C] transition-colors rounded-lg py-3 text-xs font-bold uppercase tracking-wider"
          >
            + Agregar Producto
          </Link>
        </div>
      </div>
    </div>
  );
}
