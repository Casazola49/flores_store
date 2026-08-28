"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Filter, AlertTriangle, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { InventoryItem } from "@/types";
import { adminApi } from "@/lib/api";

// ── Modal de ajuste de stock ──────────────────────────────────
function AdjustModal({ item, onDone, onCancel }: {
  item: InventoryItem;
  onDone: (variantId: number | string, qty: number, reason: string, note: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("ajuste");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (qty === 0) return;
    setLoading(true);
    await onDone(item.variant_id ?? item.id, qty, reason, note);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="font-black text-gray-900 mb-0.5">Ajustar Stock</h3>
        <p className="text-sm text-gray-500 mb-4">
          <strong>{item.product_name}</strong> — {item.size && `T: ${item.size}`}{item.color && ` / ${item.color}`}
          <br />Stock actual: <strong>{item.stock_quantity}</strong>
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Cantidad (+ agregar / − reducir)</label>
            <input type="number" value={qty} onChange={e => setQty(parseInt(e.target.value) || 0)} className="input w-full text-center font-bold text-lg" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Motivo</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="input w-full">
              <option value="ajuste">Ajuste manual</option>
              <option value="compra">Compra / Reposición</option>
              <option value="devolucion">Devolución</option>
              <option value="venta">Venta manual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Nota (opcional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Ej: Reposición mensual" className="input w-full text-sm" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={loading || qty === 0}
            className="flex-1 py-2.5 bg-[#9B1C1C] text-white rounded-lg font-bold text-sm hover:bg-[#7f1d1d] disabled:opacity-50 transition-colors"
          >
            {loading ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    adminApi.getInventory()
      .then(res => setItems(res.data))
      .catch(err => console.error("Error cargando inventario", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter(item =>
    item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowCount = items.filter(i => i.stock_quantity <= i.low_stock_alert && i.stock_quantity > 0).length;
  const outCount = items.filter(i => i.stock_quantity === 0).length;

  return (
    <div>
      {adjustItem && (
        <AdjustModal
          item={adjustItem}
          onDone={async (variantId, qty, reason, note) => {
            await adminApi.adjustStock(variantId, { quantity: qty, reason, note });
            setItems(prev => prev.map(i =>
              (i.variant_id ?? i.id) === variantId
                ? { ...i, stock_quantity: i.stock_quantity + qty }
                : i
            ));
            setAdjustItem(null);
          }}
          onCancel={() => setAdjustItem(null)}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase mb-1">Inventario</h1>
          <p className="text-gray-500 text-sm">
            {items.length} variantes —&nbsp;
            <span className="text-red-600 font-bold">{outCount} agotadas</span>
            &nbsp;·&nbsp;
            <span className="text-orange-600 font-bold">{lowCount} con stock bajo</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline bg-white flex items-center gap-2 text-sm">
            <Filter size={15} /> Filtros
          </button>
          <Link href="/admin/productos/nuevo" className="btn btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#9B1C1C]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 text-sm w-14">Img</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-sm">Producto</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-sm">SKU</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-sm">Variante</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-sm">Stock</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-sm">Estado</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-10 skeleton rounded" /></td></tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">No se encontraron resultados</td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock = item.stock_quantity <= item.low_stock_alert && item.stock_quantity > 0;
                  const isOutOfStock = item.stock_quantity === 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.product_image ? (
                            <Image src={item.product_image} alt={item.product_name ?? ""} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Tag size={14} /></div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{item.product_name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.sku || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {item.size && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-700">T: {item.size}</span>}
                          {item.color && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-700">{item.color}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-base ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-gray-900'}`}>
                          {item.stock_quantity}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">uds.</span>
                      </td>
                      <td className="px-4 py-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Agotado</span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            <AlertTriangle size={11} /> Stock Bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Normal</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setAdjustItem(item)}
                          className="text-xs font-bold text-[#9B1C1C] hover:underline"
                        >
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
