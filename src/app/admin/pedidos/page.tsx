"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { Order } from "@/types";
import { Search, Eye, ChevronDown } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pendiente:  { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700",  dot: "bg-yellow-400" },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-700",    dot: "bg-blue-400" },
  enviado:    { label: "Enviado",    color: "bg-purple-100 text-purple-700",  dot: "bg-purple-400" },
  entregado:  { label: "Entregado",  color: "bg-green-100 text-green-700",   dot: "bg-green-400" },
  cancelado:  { label: "Cancelado",  color: "bg-red-100 text-red-700",       dot: "bg-red-400" },
};

const ALL_STATUSES = ["", "pendiente", "confirmado", "enviado", "entregado", "cancelado"];

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminApi.getOrders(params);
      const raw = res.data as any;
      setOrders(raw?.data ?? raw ?? []);
      setTotal(raw?.total ?? (raw?.data?.length ?? 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o));
    } catch {}
    setUpdatingId(null);
  };

  const filtered = orders.filter(o =>
    !search ||
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone?.includes(search)
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">{total} pedidos totales</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Buscar pedido, cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#9B1C1C] w-64"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.map(s => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === s
                  ? "bg-[#9B1C1C] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#9B1C1C]"
              }`}
            >
              {s === "" ? "Todos" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">N° Pedido</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Cliente</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Contacto</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Ciudad</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Pago</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-10 skeleton rounded" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                    No hay pedidos {statusFilter ? `con estado "${STATUS_CONFIG[statusFilter]?.label}"` : ""}
                  </td>
                </tr>
              ) : (
                filtered.map(order => {
                  const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pendiente;
                  const isExpanded = expanded === order.id;
                  return [
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{order.order_number}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{order.customer_name}</td>
                      <td className="px-4 py-3 text-gray-500">{order.customer_phone ?? order.customer_email ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{order.city ?? "—"}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">Bs. {Number(order.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{order.payment_method ?? "—"}</td>
                      <td className="px-4 py-3">
                        {/* Dropdown to change status */}
                        <div className="relative">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            className={`appearance-none text-xs font-bold px-2.5 py-1.5 rounded-full cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-[#9B1C1C]/30 ${s.color}`}
                          >
                            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                              <option key={val} value={val}>{cfg.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setExpanded(isExpanded ? null : order.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#9B1C1C] hover:underline"
                        >
                          <Eye size={12} />
                          {isExpanded ? "Cerrar" : "Ver"}
                          <ChevronDown size={11} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      </td>
                    </tr>,
                    isExpanded && (
                      <tr key={`${order.id}-detail`} className="bg-gray-50/60">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Entrega</p>
                              <p className="font-semibold capitalize">{order.delivery_type === "envio" ? "📦 Envío a domicilio" : "🏪 Retiro en tienda"}</p>
                              {order.address && <p className="text-gray-500 text-xs mt-1">{order.address}, {order.city}</p>}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Resumen</p>
                              <p className="text-xs text-gray-600">Subtotal: <strong>Bs. {Number(order.subtotal).toFixed(2)}</strong></p>
                              <p className="text-xs text-gray-600">Envío: <strong>Bs. {Number(order.shipping_cost).toFixed(2)}</strong></p>
                              <p className="text-xs font-bold text-gray-900">Total: Bs. {Number(order.total).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Nota del cliente</p>
                              <p className="text-xs text-gray-600 italic">{order.note || "Sin nota"}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ),
                  ];
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
