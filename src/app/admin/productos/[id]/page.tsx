"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Save, Upload, X, Trash2, Plus, AlertTriangle,
  Package, Tag, CheckCircle, Video
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { adminApi } from "@/lib/api";
import type { Product, ProductVariant } from "@/types";

// ── Modal de confirmación de borrado ──────────────────────────
function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors text-sm disabled:opacity-60"
          >
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Adjust Stock Modal ────────────────────────────────────────
function AdjustStockModal({
  variant,
  onConfirm,
  onCancel,
}: {
  variant: ProductVariant & { stock?: number };
  onConfirm: (variantId: any, qty: number, reason: string, note: string) => void;
  onCancel: () => void;
}) {
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("ajuste");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (qty === 0) return;
    setLoading(true);
    await onConfirm(variant.id, qty, reason, note);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="font-black text-gray-900 mb-1">Ajustar Stock</h3>
        <p className="text-sm text-gray-500 mb-4">
          <strong>{variant.size} / {variant.color}</strong> — Stock actual: <strong>{variant.stock ?? 0}</strong>
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Cantidad (+ agregar / − reducir)</label>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(parseInt(e.target.value) || 0)}
              className="input w-full text-center font-bold text-lg"
            />
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
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ej: Reposición mensual"
              className="input w-full text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
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

// ── Main Edit Page ────────────────────────────────────────────
export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
const [videoFile, setVideoFile] = useState<File | null>(null);
const [videoPreview, setVideoPreview] = useState<string | null>(null);
const [uploadingVideo, setUploadingVideo] = useState(false);
  const [categories, setCategories] = useState<{ id: number | string; name: string }[]>([]);

  // Modal states
  const [deleteProductModal, setDeleteProductModal] = useState(false);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
  const [adjustVariant, setAdjustVariant] = useState<(ProductVariant & { stock?: number }) | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "", description: "", category_id: 1, base_price: "",
    compare_price: "", is_new: false, is_featured: false, gender: "unisex",
  });

  // New variant form
  const [addVariant, setAddVariant] = useState(false);
  const [newVariant, setNewVariant] = useState({ size: "", color: "", stock: "0" });

  useEffect(() => {
    // Load product
    adminApi.getProducts({ page: 1, limit: 100 } as any)
      .then(res => {
        const list = (res.data as any)?.data ?? [];
        const p = list.find((x: Product) => String(x.id) === String(productId));
        if (p) {
          setProduct(p);
          setForm({
            name: p.name,
            description: p.description ?? "",
            category_id: p.category_id ?? 1,
            base_price: String(p.base_price),
            compare_price: p.compare_price ? String(p.compare_price) : "",
            is_new: p.is_new,
            is_featured: p.is_featured,
            gender: p.gender ?? "unisex",
          });
        }
      })
      .finally(() => setLoading(false));

    adminApi.getCategories()
      .then(res => setCategories((res.data as any) ?? []))
      .catch(() => {});
  }, [productId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateProduct(productId, {
        name: form.name,
        description: form.description,
        category_id: form.category_id,
        base_price: parseFloat(form.base_price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : undefined,
        is_new: form.is_new,
        is_featured: form.is_featured,
        gender: form.gender as any,
      } as any);

      // Upload new images
      for (const file of newImages) {
        await adminApi.uploadProductImage(productId, file);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setNewImages([]);
      setNewPreviews([]);
    } catch (err) {
      alert("Error al guardar. Revisa la consola.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    setDeletingProduct(true);
    try {
      await adminApi.deleteProduct(productId);
      router.push("/admin/productos");
    } catch {
      alert("Error al eliminar el producto.");
      setDeletingProduct(false);
      setDeleteProductModal(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!deleteVariantId) return;
    setDeletingVariant(true);
    try {
      await adminApi.deleteVariant(deleteVariantId);
      setProduct(prev => prev ? {
        ...prev,
        variants: prev.variants.filter(v => String(v.id) !== String(deleteVariantId))
      } : null);
    } catch {
      alert("Error al eliminar la variante.");
    } finally {
      setDeletingVariant(false);
      setDeleteVariantId(null);
    }
  };

  const handleAdjustStock = async (variantId: any, qty: number, reason: string, note: string) => {
    try {
      await adminApi.adjustStock(variantId, { quantity: qty, reason, note });
      setProduct(prev => prev ? {
        ...prev,
        variants: prev.variants.map(v =>
          v.id === variantId ? { ...v, stock: (v.stock ?? 0) + qty } : v
        )
      } : null);
    } catch {
      alert("Error al ajustar el stock.");
    } finally {
      setAdjustVariant(null);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.size || !newVariant.color) return;
    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const suffix = Math.floor(Math.random() * 999).toString().padStart(3, '0');
      await adminApi.createVariant(productId, {
        size: newVariant.size,
        color: newVariant.color,
        sku: `${slug.substring(0, 3).toUpperCase()}-${newVariant.size}-${suffix}`,
        price: parseFloat(form.base_price),
        stock: parseInt(newVariant.stock) || 0,
      });
      // Reload product
      window.location.reload();
    } catch {
      alert("Error al agregar variante.");
    }
  };

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleVideoUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploadingVideo(true);
  try {
    await adminApi.setProductVideo(productId, file);
    const preview = URL.createObjectURL(file);
    setVideoPreview(preview);
    setProduct((prev) => (prev ? { ...prev, video_url: preview } : null));
  } catch (err) {
    alert("Error al subir el video.");
    console.error(err);
  } finally {
    setUploadingVideo(false);
  }
};

const handleRemoveVideo = async () => {
  try {
    await adminApi.clearProductVideo(productId);
    setVideoPreview(null);
    setProduct((prev) => (prev ? { ...prev, video_url: "" } : null));
  } catch (err) {
    alert("Error al quitar el video.");
    console.error(err);
  }
};

if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 skeleton rounded w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">Producto no encontrado (ID: {productId})</p>
        <Link href="/admin/productos" className="btn btn-primary text-sm">Volver a Productos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Modals */}
      {deleteProductModal && (
        <DeleteConfirmModal
          title="¿Eliminar este producto?"
          message={`"${product.name}" será eliminado permanentemente junto con todas sus variantes e imágenes. Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeleteProductModal(false)}
          loading={deletingProduct}
        />
      )}
      {deleteVariantId !== null && (
        <DeleteConfirmModal
          title="¿Eliminar esta variante?"
          message="Se eliminará la variante y su registro de inventario asociado."
          onConfirm={handleDeleteVariant}
          onCancel={() => setDeleteVariantId(null)}
          loading={deletingVariant}
        />
      )}
      {adjustVariant && (
        <AdjustStockModal
          variant={adjustVariant}
          onConfirm={handleAdjustStock}
          onCancel={() => setAdjustVariant(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/productos" className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase">Editar Producto</h1>
            <p className="text-gray-400 text-xs font-mono mt-0.5">{product.slug}</p>
          </div>
        </div>
        <button
          onClick={() => setDeleteProductModal(true)}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
        >
          <Trash2 size={15} /> Eliminar Producto
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Información Principal */}
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h2 className="font-bold text-base mb-5 border-b border-gray-100 pb-3">Información Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Nombre del Producto</label>
              <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Descripción</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Categoría</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: parseInt(e.target.value) })} className="input w-full">
                {categories.length > 0
                  ? categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  : <>
                    <option value={1}>Botas</option>
                    <option value={2}>Zapatos</option>
                    <option value={3}>Zapatillas</option>
                    <option value={4}>Zapatillas Deportivas</option>
                    <option value={5}>Tacos</option>
                  </>
                }
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Género</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="input w-full">
                <option value="mujer">Mujer</option>
                <option value="hombre">Hombre</option>
                <option value="unisex">Unisex</option>
                <option value="niño">Niños</option>
              </select>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_new} onChange={e => setForm({ ...form, is_new: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm font-semibold text-gray-700">Novedad</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm font-semibold text-gray-700">Destacado</span>
              </label>
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h2 className="font-bold text-base mb-5 border-b border-gray-100 pb-3">Precios (Bs.)</h2>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Precio Base *</label>
              <input required type="number" step="0.01" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })} className="input w-full font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Precio anterior (tachado)</label>
              <input type="number" step="0.01" value={form.compare_price} onChange={e => setForm({ ...form, compare_price: e.target.value })} className="input w-full" placeholder="Opcional" />
            </div>
          </div>
        </div>

        {/* Variantes e Inventario */}
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
            <h2 className="font-bold text-base">Variantes e Inventario</h2>
            <button
              type="button"
              onClick={() => setAddVariant(!addVariant)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#9B1C1C] hover:underline"
            >
              <Plus size={13} /> Agregar variante
            </button>
          </div>

          {addVariant && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-600 mb-3">Nueva variante</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Talla</label>
                  <input type="text" placeholder="Ej: 38" value={newVariant.size} onChange={e => setNewVariant({ ...newVariant, size: e.target.value })} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Color</label>
                  <input type="text" placeholder="Ej: Negro" value={newVariant.color} onChange={e => setNewVariant({ ...newVariant, color: e.target.value })} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Stock inicial</label>
                  <input type="number" min="0" value={newVariant.stock} onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })} className="input w-full text-sm" />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => setAddVariant(false)} className="px-3 py-1.5 text-xs border border-gray-200 rounded font-semibold text-gray-600 hover:bg-gray-100">Cancelar</button>
                <button type="button" onClick={handleAddVariant} className="px-3 py-1.5 text-xs bg-[#9B1C1C] text-white rounded font-bold hover:bg-[#7f1d1d]">Guardar variante</button>
              </div>
            </div>
          )}

          {product.variants.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No hay variantes. Agrega al menos una talla.</p>
          ) : (
            <div className="space-y-2">
              {product.variants.map(v => (
                <div key={v.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package size={14} className="text-gray-400" />
                    <div>
                      <span className="font-bold text-sm text-gray-800">T: {v.size}</span>
                      {v.color && <span className="text-gray-500 text-sm ml-2">/ {v.color}</span>}
                      {v.sku && <span className="font-mono text-[10px] text-gray-400 ml-2">{v.sku}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-sm ${(v.stock ?? 0) === 0 ? "text-red-500" : (v.stock ?? 0) < 5 ? "text-orange-500" : "text-gray-800"}`}>
                      {v.stock ?? 0} uds.
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdjustVariant(v as any)}
                      className="text-xs font-bold text-blue-600 hover:underline px-2 py-1 rounded hover:bg-blue-50"
                    >
                      Ajustar stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteVariantId(String(v.id))}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                      title="Eliminar variante"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Imágenes actuales */}
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h2 className="font-bold text-base mb-5 border-b border-gray-100 pb-3">Imágenes</h2>

          {/* Existing images */}
          {product.images.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-5">
              {product.images.map((img, i) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                  <Image src={img.url} alt={`img-${i}`} fill className="object-cover" sizes="100px" />
                  {img.is_primary && (
                    <span className="absolute bottom-1 left-1 text-[8px] bg-black/70 text-white px-1 rounded">Principal</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New image previews */}
          {newPreviews.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-4">
              {newPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group border-2 border-dashed border-[#9B1C1C]/40">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setNewPreviews(p => p.filter((_, j) => j !== i));
                      setNewImages(p => p.filter((_, j) => j !== i));
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[8px] bg-[#9B1C1C] text-white px-1 rounded">Nueva</span>
                </div>
              ))}
            </div>
          )}

          <label className="btn btn-outline cursor-pointer inline-flex items-center gap-2 text-sm">
            <Upload size={15} /> Subir más imágenes
            <input type="file" multiple accept="image/*" onChange={handleImageFiles} className="hidden" />
          </label>
        </div>

        {/* Video de Producto (Opcional) */}
<div className="bg-white p-6 rounded-xl border border-gray-100">
  <h2 className="font-bold text-base mb-5 border-b border-gray-100 pb-3">Video del Producto (Opcional)</h2>
  <p className="text-xs text-gray-400 mb-4">Clip .mp4 corto para previsualización al pasar el cursor (hover-video). Se envía a Cloudinary.</p>

  {product.video_url || videoPreview ? (
    <div className="relative inline-block mb-4">
      <video
        src={videoPreview || product.video_url || ""}
        className="h-48 rounded-lg border border-gray-200 bg-gray-100"
        controls
        muted
        playsInline
      />
      <button
        type="button"
        onClick={handleRemoveVideo}
        disabled={uploadingVideo}
        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
      >
        <X size={14} />
      </button>
    </div>
  ) : (
    <label className="btn btn-outline cursor-pointer inline-flex items-center gap-2 text-sm">
      <Video size={15} /> Subir video
      <input
        type="file"
        accept="video/*"
        disabled={uploadingVideo}
        onChange={handleVideoUploadChange}
        className="hidden"
      />
    </label>
  )}
</div>

{/* Actions */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <Link href="/admin/productos" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center gap-2 px-8 shadow-md text-sm"
          >
            {saved
              ? <><CheckCircle size={16} /> ¡Guardado!</>
              : saving
              ? "Guardando..."
              : <><Save size={16} /> Guardar Cambios</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
