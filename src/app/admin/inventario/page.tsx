"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Filter, AlertTriangle } from "lucide-react";
import Link from "next/link";
// Mock data para el UI del inventario mientras la API no esté levantada
import type { InventoryItem } from "@/types";
import { adminApi } from "@/lib/api";

export default function InventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await adminApi.getInventory();
        setItems(res.data);
      } catch (err) {
        console.error("Error cargando inventario", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredItems = items.filter(item => 
    item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-['Outfit'] uppercase mb-1">Inventario</h1>
          <p className="text-gray-500 text-sm">Gestiona el stock de todas las sucursales y productos</p>
        </div>
        
        <div className="flex gap-3">
          <button className="btn btn-outline bg-white flex items-center gap-2">
            <Filter size={16} /> Filtros
          </button>
          <Link href="/admin/productos/nuevo" className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th>Producto</th>
                <th>SKU</th>
                <th>Variante (Talla/Color)</th>
                <th>Stock Actual</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">Cargando inventario...</td>
                </tr>
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
                      <td className="text-center">
                        {isOutOfStock ? (
                          <div className="w-2 h-2 rounded-full bg-red-500 mx-auto" title="Agotado"></div>
                        ) : isLowStock ? (
                          <div className="w-2 h-2 rounded-full bg-orange-400 mx-auto" title="Stock Bajo"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-green-500 mx-auto" title="En Stock"></div>
                        )}
                      </td>
                      <td className="font-medium text-gray-900">{item.product_name}</td>
                      <td className="text-gray-500 font-mono text-xs">{item.sku || '-'}</td>
                      <td>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-700">Talla: {item.size}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-700">Color: {item.color}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-base ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-gray-900'}`}>
                            {item.stock_quantity}
                          </span>
                          <span className="text-xs text-gray-400">unidades</span>
                        </div>
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            Agotado
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            <AlertTriangle size={12} /> Stock Bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2">
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
