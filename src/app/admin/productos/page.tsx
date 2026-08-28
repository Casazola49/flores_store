"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, Tag } from "lucide-react";

const GENDER_LABELS: Record<string, string> = {
  mujer: "Mujer", hombre: "Hombre", unisex: "Unisex", niño: "Niños",
};

export default function ProductosAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const load = async (p = 1, q = "") => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({ page: p, limit: PER_PAGE, search: q } as object);
      const raw = res.data as any;
      setProducts(raw?.data ?? raw ?? []);
      setTotal(raw?.total ?? (raw?.data?.length ?? 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, ""); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const toggleActive = async (id: number | string, current: boolean) => {
    try {
      await adminApi.updateProduct(id, { is_active: !current } as any);
      setProducts(prev => prev.map(p => String(p.id) === String(id) ? { ...p, is_active: !current } : p));
    } catch {}
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">{total} productos en el catálogo</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nuevo Producto
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#9B1C1C]"
          />
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 w-16">Imagen</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Producto</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Categoría</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Precio</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-10 skeleton rounded" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    No hay productos. <Link href="/admin/productos/nuevo" className="text-[#9B1C1C] font-bold">Agrega el primero →</Link>
                  </td>
                </tr>
              ) : (
                products.map(product => {
                  const img = product.images?.[0]?.url;
                  const totalStock = product.variants?.reduce((s, v) => s + (v.stock ?? 0), 0) ?? 0;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {img ? (
                            <Image src={img} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Tag size={18} />
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{product.slug}</p>
                        <div className="flex gap-1 mt-1">
                          {product.is_new && <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase">Nuevo</span>}
                          {product.is_featured && <span className="text-[9px] bg-yellow-100 text-yellow-700 font-bold px-1.5 py-0.5 rounded uppercase">Destacado</span>}
                          {product.gender && <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded uppercase">{GENDER_LABELS[product.gender]}</span>}
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {product.category?.name ?? "—"}
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">Bs. {Number(product.base_price).toFixed(2)}</p>
                        {product.compare_price && (
                          <p className="text-xs text-gray-400 line-through">Bs. {Number(product.compare_price).toFixed(2)}</p>
                        )}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span className={`font-bold ${totalStock === 0 ? "text-red-500" : totalStock < 10 ? "text-orange-500" : "text-gray-800"}`}>
                          {totalStock} uds.
                        </span>
                        <p className="text-[11px] text-gray-400">{product.variants?.length ?? 0} variantes</p>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(product.id, product.is_active)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${product.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                          {product.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {product.is_active ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#9B1C1C] hover:underline"
                        >
                          <Edit2 size={12} /> Editar
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <p className="text-gray-500">Mostrando {products.length} de {total}</p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => { setPage(p => p - 1); load(page - 1, search); }}
                className="px-3 py-1.5 border border-gray-200 rounded font-semibold disabled:opacity-40 hover:border-[#9B1C1C] transition-colors"
              >← Anterior</button>
              <span className="px-3 py-1.5 bg-[#9B1C1C] text-white rounded font-bold">{page}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => { setPage(p => p + 1); load(page + 1, search); }}
                className="px-3 py-1.5 border border-gray-200 rounded font-semibold disabled:opacity-40 hover:border-[#9B1C1C] transition-colors"
              >Siguiente →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
