"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api";

export default function NuevoProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: 1, // Por defecto Botas (id: 1 según el seed)
    base_price: "",
    compare_price: "",
    is_new: true,
  });

  const [variant, setVariant] = useState({
    size: "38",
    color: "Negro",
    stock: "10"
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear el producto base
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const productRes = await adminApi.createProduct({
        ...formData,
        slug,
        short_desc: formData.description.substring(0, 100) + '...',
        base_price: parseFloat(formData.base_price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null
      });

      const productId = productRes.data.id;

      // 2. Crear la variante inicial (talla y color)
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      await adminApi.createVariant(productId, {
        size: variant.size,
        color: variant.color,
        sku: `${slug.substring(0,3).toUpperCase()}-${variant.size}-${variant.color.substring(0,3).toUpperCase()}-${randomSuffix}`,
        price: parseFloat(formData.base_price),
        stock: parseInt(variant.stock)
      });

      // 3. Subir Imágenes a Cloudinary
      for (const file of images) {
        await adminApi.uploadProductImage(productId, file);
      }

      alert("¡Producto creado con éxito!");
      router.push("/admin/inventario");
      
    } catch (err) {
      console.error(err);
      alert("Hubo un error al crear el producto. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/inventario" className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-black font-['Outfit'] uppercase mb-1">Nuevo Producto</h1>
          <p className="text-gray-500 text-sm">Añade un artículo al catálogo y su inventario inicial</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Sección: Información Básica */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-bold text-lg mb-6 border-b border-gray-100 pb-4">Información Principal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Producto</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Botas de Cuero Combat"
                className="input w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción Completa</label>
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Detalles sobre el material, uso, etc."
                className="input w-full"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
              <select 
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}
                className="input w-full"
              >
                <option value={1}>Botas</option>
                <option value={2}>Zapatos</option>
                <option value={3}>Zapatillas</option>
                <option value={4}>Zapatillas Deportivas</option>
                <option value={5}>Tacos</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-8">
              <input 
                type="checkbox" 
                id="isNew" 
                checked={formData.is_new}
                onChange={e => setFormData({...formData, is_new: e.target.checked})}
                className="w-4 h-4 text-[var(--color-primary)] rounded border-gray-300 focus:ring-[var(--color-primary)] cursor-pointer"
              />
              <label htmlFor="isNew" className="text-sm font-bold text-gray-700 cursor-pointer">Marcar como "Novedad"</label>
            </div>
          </div>
        </div>

        {/* Sección: Precios */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-bold text-lg mb-6 border-b border-gray-100 pb-4">Precios (Bs)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Precio Base *</label>
              <input 
                required
                type="number" 
                step="0.01"
                value={formData.base_price}
                onChange={e => setFormData({...formData, base_price: e.target.value})}
                placeholder="0.00"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Precio de Oferta (Opcional)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.compare_price}
                onChange={e => setFormData({...formData, compare_price: e.target.value})}
                placeholder="0.00"
                className="input w-full"
              />
              <p className="text-xs text-gray-400 mt-1">Si llenas esto, el producto aparecerá tachado en rojo.</p>
            </div>
          </div>
        </div>

        {/* Sección: Inventario Inicial */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-bold text-lg mb-6 border-b border-gray-100 pb-4">Variante e Inventario Inicial</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Talla</label>
              <input 
                required
                type="text" 
                value={variant.size}
                onChange={e => setVariant({...variant, size: e.target.value})}
                placeholder="Ej. 38, 40, Única"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
              <input 
                required
                type="text" 
                value={variant.color}
                onChange={e => setVariant({...variant, color: e.target.value})}
                placeholder="Ej. Negro"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stock Disponible</label>
              <input 
                required
                type="number" 
                min="0"
                value={variant.stock}
                onChange={e => setVariant({...variant, stock: e.target.value})}
                className="input w-full font-bold text-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Sección: Imágenes Cloudinary */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-bold text-lg mb-6 border-b border-gray-100 pb-4">Imágenes (Se enviarán a Cloudinary)</h2>
          
          <div className="mb-4">
            <label className="btn btn-outline cursor-pointer inline-flex items-center gap-2">
              <Upload size={16} /> Subir Imágenes
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-4 pt-4">
          <Link href="/admin/inventario" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
            Cancelar
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary flex items-center gap-2 px-8 shadow-lg"
          >
            {loading ? 'Guardando...' : <><Save size={18} /> Guardar Producto</>}
          </button>
        </div>

      </form>
    </div>
  );
}
