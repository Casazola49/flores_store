"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Calendar, Save, Trash2, CheckCircle, AlertCircle } from "lucide-react";

interface CMSSection {
  key: string;
  title: string;
  content: string;
}

function formatESBODate(iso: string): string {
  if (!iso || !iso.trim()) return "Sin fecha configurada";
  const d = new Date(iso.includes("T") ? iso : `${iso}T23:59:59Z`);
  if (isNaN(d.getTime())) return "Sin fecha configurada";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default function ConfiguracionAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentValue, setCurrentValue] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    adminApi
      .getSections()
      .then((res) => {
        if (ignore) return;
        const sections = (res.data || []) as CMSSection[];
        const saleSec = sections.find((s) => s.key === "sale_ends_at");
        const content = saleSec?.content || "";
        setCurrentValue(content);
        if (content) {
          setDateInput(content.slice(0, 10));
        } else {
          setDateInput("");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        console.error("Error fetching sections:", err);
        setMessage({ type: "error", text: "No se pudieron cargar las configuraciones." });
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!dateInput.trim()) {
      await handleClear();
      return;
    }

    // Validate date format
    const candidateDate = new Date(`${dateInput}T23:59:59Z`);
    if (isNaN(candidateDate.getTime())) {
      setMessage({ type: "error", text: "La fecha ingresada no es válida." });
      return;
    }

    const isoString = candidateDate.toISOString();

    try {
      setSaving(true);
      await adminApi.updateSection("sale_ends_at", {
        title: "Fecha fin liquidación",
        content: isoString,
      });
      setCurrentValue(isoString);
      setMessage({ type: "success", text: "Fecha fin de liquidación guardada con éxito." });
    } catch (err) {
      console.error("Error updating sale_ends_at:", err);
      setMessage({ type: "error", text: "Error al guardar la fecha en el servidor." });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setMessage(null);
    try {
      setSaving(true);
      await adminApi.updateSection("sale_ends_at", {
        title: "Fecha fin liquidación",
        content: "",
      });
      setDateInput("");
      setCurrentValue("");
      setMessage({ type: "success", text: "Fecha de liquidación desactivada y limpiada." });
    } catch (err) {
      console.error("Error clearing sale_ends_at:", err);
      setMessage({ type: "error", text: "Error al limpiar la fecha." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-black uppercase mb-2">Configuración</h1>
      <p className="text-gray-500 text-sm mb-8">Ajustes generales de la tienda y señales comerciales.</p>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          Cargando configuración...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card: Liquidación real */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-[var(--color-accent)] flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Fecha de Fin de Liquidación</h2>
                <p className="text-xs text-gray-500">
                  Controla la fecha límite mostrada en las insignias de liquidación real en la tienda.
                </p>
              </div>
            </div>

            {/* Current status display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs text-gray-500 font-medium block">Valor actual en tienda:</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatESBODate(currentValue)}
                </span>
              </div>
              <div>
                {currentValue ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                    Desactivada
                  </span>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label htmlFor="sale_ends_at_input" className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Seleccionar nueva fecha límite
                </label>
                <input
                  id="sale_ends_at_input"
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full max-w-xs px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Debe ser una fecha futura para que la insignia de liquidación se muestre en los productos elegibles.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary text-sm flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>{saving ? "Guardando..." : "Guardar fecha"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={saving || !currentValue}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  <span>Limpiar fecha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
