"use client";
import Link from "next/link";

export default function ConfiguracionAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase mb-2">Configuración</h1>
      <p className="text-gray-500 text-sm mb-8">Ajustes generales de la tienda.</p>
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
        <p className="text-gray-400 text-sm mb-4">Módulo de configuración en construcción.</p>
        <Link href="/admin/dashboard" className="btn btn-primary text-sm">Volver al Dashboard</Link>
      </div>
    </div>
  );
}
