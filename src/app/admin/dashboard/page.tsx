"use client";

import { useAdminAuth } from "@/lib/store";
import { Package, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAdminAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold font-['Outfit'] mb-2">Bienvenido, {user?.username}</h1>
      <p className="text-gray-500 mb-8">Aquí tienes un resumen del estado de tu tienda.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-500 text-sm">Ventas del Mes</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">Bs. 0.00</p>
          <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> +0% desde el mes pasado
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-500 text-sm">Pedidos Activos</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-gray-400 mt-2">Pendientes de envío</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-500 text-sm">Total Productos</h3>
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-gray-400 mt-2">En el catálogo</p>
        </div>

        <div className="stat-card border-red-200 bg-red-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-red-600 text-sm">Alertas de Stock</h3>
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">0</p>
          <p className="text-xs text-red-500 mt-2">Variantes con stock bajo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-4 font-['Outfit'] text-lg">Últimos Pedidos</h3>
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
            Aún no hay pedidos registrados
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-4 font-['Outfit'] text-lg">Productos más vistos</h3>
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
            Aún no hay datos suficientes
          </div>
        </div>
      </div>
    </div>
  );
}
