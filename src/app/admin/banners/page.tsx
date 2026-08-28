"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { CmsBanner, Category, CmsAnnouncement, CmsSection } from "@/types";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Save,
  Check,
  Image as ImageIcon,
  Video,
  X,
  Smartphone,
  Tv,
  ExternalLink,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  Settings,
  Layers,
  Sparkles
} from "lucide-react";
import Image from "next/image";

type Tab = "banners" | "categories" | "settings";

export default function CMSAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("banners");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Data states
  const [banners, setBanners] = useState<CmsBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcement, setAnnouncement] = useState<CmsAnnouncement | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});

  // Editing forms
  const [editingBanner, setEditingBanner] = useState<Partial<CmsBanner> | null>(null);
  const [uploadingBannerFile, setUploadingBannerFile] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [uploadingCategoryFile, setUploadingCategoryFile] = useState(false);
  const [uploadingConfigMediaKey, setUploadingConfigMediaKey] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannersRes, categoriesRes, announcementRes, sectionsRes] = await Promise.all([
        adminApi.getBanners(),
        adminApi.getCategories(),
        adminApi.getAnnouncement(),
        adminApi.getSections()
      ]);

      setBanners(bannersRes.data || []);
      setCategories(categoriesRes.data || []);
      setAnnouncement(announcementRes.data || null);

      const sectionsMap: Record<string, string> = {};
      if (Array.isArray(sectionsRes.data)) {
        sectionsRes.data.forEach((s: any) => {
          sectionsMap[s.key] = s.content || "";
        });
      }
      setSections(sectionsMap);
    } catch (e) {
      console.error("Error loading CMS data:", e);
      showStatus("Error al cargar la información del servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (text: string, type: "success" | "error") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // ==========================================
  // BANNERS CRUD
  // ==========================================
  const handleEditBanner = (banner: CmsBanner) => {
    setEditingBanner({ ...banner });
  };

  const handleCreateBannerInit = () => {
    setEditingBanner({
      title: "",
      subtitle: "",
      image_url: "",
      video_url: "",
      link_url: "",
      link_text: "Comprar Ahora",
      position: banners.length,
      is_active: true
    });
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    setSaving(true);
    try {
      if (editingBanner.id) {
        // Update
        const res = await adminApi.updateBanner(editingBanner.id, editingBanner);
        setBanners(prev => prev.map(b => b.id === editingBanner.id ? (res.data as unknown as CmsBanner) : b));
        showStatus("Banner actualizado con éxito", "success");
      } else {
        // Create
        const res = await adminApi.createBanner(editingBanner);
        setBanners(prev => [...prev, (res.data as unknown as CmsBanner)]);
        showStatus("Banner creado con éxito", "success");
      }
      setEditingBanner(null);
    } catch (err) {
      console.error(err);
      showStatus("Error al guardar el banner", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id: number | string) => {
    if (!confirm("¿Está seguro de eliminar este banner?")) return;
    try {
      await adminApi.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      showStatus("Banner eliminado", "success");
    } catch (err) {
      showStatus("Error al eliminar el banner", "error");
    }
  };

  const handleMoveBanner = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    // Actualizar posiciones locales
    const reordered = newBanners.map((b, i) => ({ ...b, position: i }));
    setBanners(reordered);

    try {
      await adminApi.reorderBanners(reordered.map(b => b.id));
      showStatus("Posiciones actualizadas", "success");
    } catch (err) {
      showStatus("Error al guardar nuevo orden en el servidor", "error");
    }
  };

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBannerFile(true);
    try {
      const res = await adminApi.uploadBannerFile(file);
      const isVideo = res.data.resource_type === "video";

      if (isVideo) {
        setEditingBanner(prev => ({
          ...prev,
          video_url: res.data.url,
          image_url: "" // Clear image if video is uploaded
        }));
      } else {
        setEditingBanner(prev => ({
          ...prev,
          image_url: res.data.url,
          video_url: "" // Clear video if image is uploaded
        }));
      }
      showStatus("Archivo subido con éxito", "success");
    } catch (err) {
      console.error(err);
      showStatus("Error al subir archivo", "error");
    } finally {
      setUploadingBannerFile(false);
    }
  };

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  const handleEditCategory = (cat: Category) => {
    setEditingCategory({ ...cat });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setSaving(true);
    try {
      if (editingCategory.id) {
        const res = await adminApi.updateCategory(editingCategory.id, editingCategory);
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? res.data : c));
        showStatus("Categoría actualizada con éxito", "success");
      } else {
        const res = await adminApi.createCategory(editingCategory);
        setCategories(prev => [...prev, res.data]);
        showStatus("Categoría creada con éxito", "success");
      }
      setEditingCategory(null);
    } catch (err) {
      console.error(err);
      showStatus("Error al guardar la categoría", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCategoryFile(true);
    try {
      const res = await adminApi.uploadCategoryFile(file);
      const isVideo = res.data.resource_type === "video";

      if (isVideo) {
        setEditingCategory(prev => ({
          ...prev,
          video_url: res.data.url,
          image_url: ""
        }));
      } else {
        setEditingCategory(prev => ({
          ...prev,
          image_url: res.data.url,
          video_url: ""
        }));
      }
      showStatus("Media de categoría subida con éxito", "success");
    } catch (err) {
      console.error(err);
      showStatus("Error al subir el archivo de categoría", "error");
    } finally {
      setUploadingCategoryFile(false);
    }
  };

  const handleDeleteCategory = async (id: number | string) => {
    if (!confirm("¿Está seguro de eliminar esta categoría?")) return;
    try {
      const res = await adminApi.deleteCategory(id);
      if (res.data?.error) {
        showStatus(res.data.error, "error");
      } else {
        setCategories(prev => prev.filter(c => c.id !== id));
        showStatus("Categoría eliminada", "success");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Error al eliminar categoría";
      showStatus(msg, "error");
    }
  };

  // ==========================================
  // STORE SETTINGS & GENERAL CONFIG
  // ==========================================
  const handleSaveGeneralConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Guardar Anuncio (cms_announcement)
      if (announcement) {
        await adminApi.updateAnnouncement({
          text: announcement.text,
          link_url: announcement.link_url || "",
          bg_color: announcement.bg_color,
          text_color: announcement.text_color,
          is_active: announcement.is_active
        });
      }

      // 2. Guardar Secciones una por una (cms_sections)
      const keysToSave = Object.keys(sections);
      for (const key of keysToSave) {
        await adminApi.updateSection(key, {
          title: getSectionLabel(key),
          content: sections[key]
        });
      }

      showStatus("Configuraciones generales guardadas con éxito", "success");
    } catch (err) {
      console.error(err);
      showStatus("Error al guardar las configuraciones", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfigMediaUpload = async (key: string, file: File) => {
    setUploadingConfigMediaKey(key);
    try {
      // Usamos el endpoint de subida de banners para subir multimedia general
      const res = await adminApi.uploadBannerFile(file);
      setSections(prev => ({
        ...prev,
        [key]: res.data.url
      }));
      showStatus(`Media de '${getSectionLabel(key)}' subida correctamente`, "success");
    } catch (err) {
      console.error(err);
      showStatus("Error al subir archivo de configuración", "error");
    } finally {
      setUploadingConfigMediaKey(null);
    }
  };

  const getSectionLabel = (key: string): string => {
    const labels: Record<string, string> = {
      whatsapp_number: "Número de WhatsApp",
      social_instagram: "Instagram Link",
      social_tiktok: "TikTok Link",
      social_facebook: "Facebook Link",
      hero_title: "Título Hero",
      hero_subtitle: "Subtítulo Hero",
      hero_video_url: "Video de Fondo Hero",
      countdown_end_hour: "Hora Fin Oferta (0-23)",
      vip_vault_title: "Título de la Bóveda VIP",
      vip_vault_subtitle: "Subtítulo de la Bóveda VIP",
      vip_vault_video_url: "Video de Fondo Bóveda VIP"
    };
    return labels[key] || key;
  };

  return (
    <div className="pb-16 font-['Outfit']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">CMS & Configuración de Tienda</h1>
          <p className="text-gray-400 text-sm mt-1">Controla los visuales y configuraciones en vivo de la tienda.</p>
        </div>
      </div>

      {/* STATUS MESSAGE TOAST */}
      {statusMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-lg border text-sm shadow-xl transition-all duration-300 animate-slide-up ${
            statusMessage.type === "success"
              ? "bg-green-950/80 border-green-800 text-green-300 backdrop-blur-md"
              : "bg-red-950/80 border-red-800 text-red-300 backdrop-blur-md"
          }`}
        >
          <AlertCircle size={16} />
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* TABS SELECTOR */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => { setActiveTab("banners"); setEditingBanner(null); }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "banners"
              ? "border-[#9B1C1C] text-white bg-white/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Sparkles size={16} className={activeTab === "banners" ? "text-[#9B1C1C]" : ""} />
          Slider Banners (Hero)
        </button>
        <button
          onClick={() => { setActiveTab("categories"); setEditingCategory(null); }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "categories"
              ? "border-[#9B1C1C] text-white bg-white/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Layers size={16} className={activeTab === "categories" ? "text-[#9B1C1C]" : ""} />
          Categorías
        </button>
        <button
          onClick={() => { setActiveTab("settings"); }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "settings"
              ? "border-[#9B1C1C] text-white bg-white/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Settings size={16} className={activeTab === "settings" ? "text-[#9B1C1C]" : ""} />
          Configuración General & Homepage
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#9B1C1C] mb-4" size={40} />
          <p className="text-gray-400 text-sm">Cargando contenidos del CMS...</p>
        </div>
      ) : (
        <>
          {/* ============================================================ */}
          {/* TAB 1: BANNERS SLIDER */}
          {/* ============================================================ */}
          {activeTab === "banners" && (
            <div className="space-y-8">
              {!editingBanner ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold uppercase text-white">Banners en el Carrusel</h2>
                    <button
                      onClick={handleCreateBannerInit}
                      className="flex items-center gap-2 px-4 py-2 bg-[#9B1C1C] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-800 transition-colors"
                    >
                      <Plus size={14} /> Agregar Banner
                    </button>
                  </div>

                  <div className="bg-black/35 rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/5 border-b border-white/10 text-white font-bold uppercase text-xs">
                          <tr>
                            <th className="px-6 py-4 w-28">Preview</th>
                            <th className="px-6 py-4">Información</th>
                            <th className="px-6 py-4 w-32 text-center">Estado</th>
                            <th className="px-6 py-4 w-32 text-center">Posición</th>
                            <th className="px-6 py-4 w-40 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {banners.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-16 text-gray-500">
                                No hay banners creados. Agrega un banner para el carrusel de inicio.
                              </td>
                            </tr>
                          ) : (
                            banners.map((banner, index) => (
                              <tr key={banner.id} className="hover:bg-white/5 transition-colors">
                                {/* Preview */}
                                <td className="px-6 py-4">
                                  <div className="w-20 h-12 bg-black border border-white/10 rounded-lg overflow-hidden relative flex items-center justify-center">
                                    {banner.video_url ? (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Video size={16} className="text-red-500 z-10" />
                                        <video
                                          src={banner.video_url}
                                          className="w-full h-full object-cover opacity-60"
                                          muted
                                          playsInline
                                        />
                                      </div>
                                    ) : banner.image_url ? (
                                      <Image
                                        src={banner.image_url}
                                        alt={banner.title || ""}
                                        width={80}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon size={18} className="text-gray-600" />
                                    )}
                                  </div>
                                </td>

                                {/* Info */}
                                <td className="px-6 py-4">
                                  <p className="font-bold text-white text-sm">{banner.title || "— Sin título —"}</p>
                                  {banner.subtitle && <p className="text-xs text-gray-400 truncate max-w-sm">{banner.subtitle}</p>}
                                  {banner.link_url && (
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-red-400">
                                      <ExternalLink size={10} />
                                      <span>{banner.link_text || "Enlace"}: {banner.link_url}</span>
                                    </div>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                      banner.is_active
                                        ? "bg-green-950/60 text-green-400 border border-green-800"
                                        : "bg-white/5 text-gray-400 border border-white/10"
                                    }`}
                                  >
                                    {banner.is_active ? "Activo" : "Inactivo"}
                                  </span>
                                </td>

                                {/* Ordering */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleMoveBanner(index, "up")}
                                      disabled={index === 0}
                                      className="p-1 border border-white/10 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 hover:text-white"
                                    >
                                      <ArrowUp size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleMoveBanner(index, "down")}
                                      disabled={index === banners.length - 1}
                                      className="p-1 border border-white/10 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 hover:text-white"
                                    >
                                      <ArrowDown size={14} />
                                    </button>
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEditBanner(banner)}
                                      className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white text-xs font-bold uppercase transition-colors"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBanner(banner.id)}
                                      className="px-3 py-1.5 border border-red-950 text-red-400 hover:bg-red-950/50 rounded-lg text-xs font-bold uppercase transition-colors"
                                    >
                                      <Trash2 size={12} className="inline mr-1" /> Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* BANNER CREATE / EDIT FORM */
                <div className="bg-black/35 rounded-xl border border-white/10 p-6 max-w-2xl">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                    <h3 className="text-lg font-bold uppercase text-white">
                      {editingBanner.id ? "Editar Banner" : "Nuevo Banner"}
                    </h3>
                    <button
                      onClick={() => setEditingBanner(null)}
                      className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBanner} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={editingBanner.title || ""}
                          onChange={e => setEditingBanner(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                          placeholder="e.g. CULTURA EXCLUSIVA"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Subtítulo
                        </label>
                        <input
                          type="text"
                          value={editingBanner.subtitle || ""}
                          onChange={e => setEditingBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                          placeholder="e.g. Modelos de edición limitada"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          URL de Enlace
                        </label>
                        <input
                          type="text"
                          value={editingBanner.link_url || ""}
                          onChange={e => setEditingBanner(prev => ({ ...prev, link_url: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                          placeholder="e.g. /catalogo?category=zapatillas"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Texto del Botón
                        </label>
                        <input
                          type="text"
                          value={editingBanner.link_text || ""}
                          onChange={e => setEditingBanner(prev => ({ ...prev, link_text: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                          placeholder="e.g. Comprar Ahora"
                        />
                      </div>
                    </div>

                    {/* MEDIA FILE ZONE */}
                    <div className="border border-dashed border-white/15 rounded-lg p-6 flex flex-col items-center justify-center bg-black/20">
                      <div className="text-center mb-4">
                        <Upload size={32} className="mx-auto text-gray-500 mb-2" />
                        <p className="text-xs text-white font-bold uppercase tracking-wider">Subir Archivo Multimedia</p>
                        <p className="text-[10px] text-gray-400 mt-1">Soporta videos (.mp4, loop rápido) o imágenes (.jpg, .png)</p>
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleBannerFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingBannerFile}
                        />
                        <button
                          type="button"
                          disabled={uploadingBannerFile}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                        >
                          {uploadingBannerFile ? (
                            <>
                              <Loader2 className="animate-spin" size={12} /> Subiendo a Cloudinary...
                            </>
                          ) : (
                            "Seleccionar Archivo"
                          )}
                        </button>
                      </div>

                      {/* URL FIELDS */}
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                            URL Imagen
                          </label>
                          <input
                            type="text"
                            value={editingBanner.image_url || ""}
                            onChange={e => setEditingBanner(prev => ({ ...prev, image_url: e.target.value, video_url: "" }))}
                            className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                            URL Video (Bucle)
                          </label>
                          <input
                            type="text"
                            value={editingBanner.video_url || ""}
                            onChange={e => setEditingBanner(prev => ({ ...prev, video_url: e.target.value, image_url: "" }))}
                            className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* CURRENT PREVIEW */}
                      {(editingBanner.image_url || editingBanner.video_url) && (
                        <div className="w-full mt-4 p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Preview:</span>
                            {editingBanner.video_url ? (
                              <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold">
                                <Video size={14} /> Video de Fondo Activo
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold">
                                <ImageIcon size={14} /> Imagen Estática Activa
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingBanner(prev => ({ ...prev, image_url: "", video_url: "" }))}
                            className="text-[10px] text-red-500 hover:underline uppercase font-bold"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingBanner.is_active ?? true}
                          onChange={e => setEditingBanner(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="w-4 h-4 text-[#9B1C1C] bg-white/5 border-white/10 rounded focus:ring-0"
                        />
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Activo en Carrusel</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingBanner(null)}
                        className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 bg-[#9B1C1C] hover:bg-red-800 disabled:opacity-40 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="animate-spin" size={12} /> Guardando...
                          </>
                        ) : (
                          <>
                            <Save size={12} /> Guardar Banner
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: CATEGORÍAS */}
          {/* ============================================================ */}
          {activeTab === "categories" && (
            <div className="space-y-8">
              {!editingCategory ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold uppercase text-white">Categorías en la Homepage</h2>
                    <button
                      onClick={() => setEditingCategory({ name: "", slug: "", sort_order: categories.length, is_active: true })}
                      className="flex items-center gap-2 px-4 py-2 bg-[#9B1C1C] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-800 transition-colors"
                    >
                      <Plus size={14} /> Nueva Categoría
                    </button>
                  </div>

                  <div className="bg-black/35 rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/5 border-b border-white/10 text-white font-bold uppercase text-xs">
                          <tr>
                            <th className="px-6 py-4 w-28">Preview</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4 text-center">Fondo</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                            <th className="px-6 py-4 w-40 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {categories.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-16 text-gray-500">
                                No se encontraron categorías en el sistema.
                              </td>
                            </tr>
                          ) : (
                            categories.map(cat => (
                              <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                                {/* Preview */}
                                <td className="px-6 py-4">
                                  <div className="w-16 h-12 bg-black border border-white/10 rounded-lg overflow-hidden relative flex items-center justify-center">
                                    {cat.video_url ? (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Video size={14} className="text-red-500 z-10 animate-pulse" />
                                        <video
                                          src={cat.video_url}
                                          className="w-full h-full object-cover opacity-60"
                                          muted
                                          playsInline
                                        />
                                      </div>
                                    ) : cat.image_url ? (
                                      <Image
                                        src={cat.image_url}
                                        alt={cat.name}
                                        width={64}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Layers size={16} className="text-gray-600" />
                                    )}
                                  </div>
                                </td>

                                {/* Name */}
                                <td className="px-6 py-4">
                                  <p className="font-bold text-white">{cat.name}</p>
                                  <p className="text-[10px] text-gray-400">Orden de ordenamiento: {cat.sort_order}</p>
                                </td>

                                {/* Slug */}
                                <td className="px-6 py-4 font-mono text-xs text-gray-400">
                                  {cat.slug}
                                </td>

                                {/* Background type indicator */}
                                <td className="px-6 py-4 text-center">
                                  {cat.video_url ? (
                                    <span className="text-[10px] bg-red-950 text-red-400 font-bold px-2 py-0.5 rounded border border-red-900 uppercase">
                                      Video en bucle
                                    </span>
                                  ) : cat.image_url ? (
                                    <span className="text-[10px] bg-blue-950 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-900 uppercase">
                                      Imagen estática
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-gray-900 text-gray-500 font-bold px-2 py-0.5 rounded border border-gray-800 uppercase">
                                      Ninguno
                                    </span>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                      cat.is_active
                                        ? "bg-green-950/60 text-green-400 border border-green-800"
                                        : "bg-white/5 text-gray-400 border border-white/10"
                                    }`}
                                  >
                                    {cat.is_active ? "Activa" : "Inactiva"}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEditCategory(cat)}
                                      className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/10 text-xs font-bold uppercase transition-colors"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(cat.id)}
                                      className="px-3 py-1.5 border border-red-950 text-red-400 hover:bg-red-950/50 rounded-lg text-xs font-bold uppercase transition-colors"
                                    >
                                      <Trash2 size={12} className="inline mr-1" /> Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* CATEGORY EDIT FORM */
                <div className="bg-black/35 rounded-xl border border-white/10 p-6 max-w-2xl">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                    <h3 className="text-lg font-bold uppercase text-white">
                      {editingCategory.id ? `Editar Categoría: ${editingCategory.name}` : "Nueva Categoría"}
                    </h3>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCategory} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Nombre de la Categoría
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCategory.name || ""}
                          onChange={e => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                          placeholder="e.g. Botas Exclusivas"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Slug (identificador URL)
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCategory.slug || ""}
                          onChange={e => setEditingCategory(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                          placeholder="e.g. botas"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Orden de visualización (Sort Order)
                        </label>
                        <input
                          type="number"
                          value={editingCategory.sort_order ?? 0}
                          onChange={e => setEditingCategory(prev => ({ ...prev, sort_order: parseInt(e.target.value, 10) }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                        />
                      </div>
                    </div>

                    {/* MEDIA FILE ZONE FOR CATEGORY BACKGROUND */}
                    <div className="border border-dashed border-white/15 rounded-lg p-6 flex flex-col items-center justify-center bg-black/20">
                      <div className="text-center mb-4">
                        <Upload size={32} className="mx-auto text-gray-500 mb-2" />
                        <p className="text-xs text-white font-bold uppercase tracking-wider">Subir Multimedia de Portada</p>
                        <p className="text-[10px] text-gray-400 mt-1">Sube un video en bucle (.mp4) para reproducirlo en el bloque de categoría, o una imagen.</p>
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleCategoryFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingCategoryFile}
                        />
                        <button
                          type="button"
                          disabled={uploadingCategoryFile}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                        >
                          {uploadingCategoryFile ? (
                            <>
                              <Loader2 className="animate-spin" size={12} /> Subiendo a Cloudinary...
                            </>
                          ) : (
                            "Seleccionar Archivo"
                          )}
                        </button>
                      </div>

                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                            URL Imagen Portada
                          </label>
                          <input
                            type="text"
                            value={editingCategory.image_url || ""}
                            onChange={e => setEditingCategory(prev => ({ ...prev, image_url: e.target.value, video_url: "" }))}
                            className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                            URL Video Portada (Bucle)
                          </label>
                          <input
                            type="text"
                            value={editingCategory.video_url || ""}
                            onChange={e => setEditingCategory(prev => ({ ...prev, video_url: e.target.value, image_url: "" }))}
                            className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingCategory.is_active ?? true}
                          onChange={e => setEditingCategory(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="w-4 h-4 text-[#9B1C1C] bg-white/5 border-white/10 rounded focus:ring-0"
                        />
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Activo en la Tienda</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 bg-[#9B1C1C] hover:bg-red-800 disabled:opacity-40 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="animate-spin" size={12} /> Guardando...
                          </>
                        ) : (
                          <>
                            <Save size={12} /> Guardar Categoría
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: CONFIGURACIÓN GENERAL & HOMEPAGE */}
          {/* ============================================================ */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveGeneralConfig} className="space-y-8 max-w-4xl">
              {/* ACCIONES DEL FORMULARIO */}
              <div className="flex justify-between items-center bg-black/45 border border-white/10 p-4 rounded-xl">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Los cambios se aplican en vivo en la tienda
                </span>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#9B1C1C] hover:bg-red-800 disabled:opacity-40 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin animate-spin-fast" size={12} /> Guardando Ajustes...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Guardar Todos los Ajustes
                    </>
                  )}
                </button>
              </div>

              {/* SECCIÓN 1: AJUSTES DE ANUNCIOS */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                  <div className="w-2 h-5 bg-[#9B1C1C] rounded"></div>
                  <h3 className="text-base font-bold uppercase text-white tracking-wider">Barra de Anuncios Superior</h3>
                </div>

                {announcement && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={announcement.is_active}
                          onChange={e => setAnnouncement(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                          className="w-4 h-4 text-[#9B1C1C] bg-white/5 border-white/10 rounded focus:ring-0"
                        />
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Barra de Anuncios Activa</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Texto del Anuncio
                        </label>
                        <input
                          type="text"
                          value={announcement.text || ""}
                          onChange={e => setAnnouncement(prev => prev ? { ...prev, text: e.target.value } : null)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Enlace de Destino (Opcional)
                        </label>
                        <input
                          type="text"
                          value={announcement.link_url || ""}
                          onChange={e => setAnnouncement(prev => prev ? { ...prev, link_url: e.target.value } : null)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                          placeholder="e.g. /catalogo"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Color de Fondo (HEX)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={announcement.bg_color || "#9B1C1C"}
                            onChange={e => setAnnouncement(prev => prev ? { ...prev, bg_color: e.target.value } : null)}
                            className="w-10 h-10 border border-white/10 rounded bg-transparent p-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={announcement.bg_color || ""}
                            onChange={e => setAnnouncement(prev => prev ? { ...prev, bg_color: e.target.value } : null)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Color del Texto (HEX)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={announcement.text_color || "#FFFFFF"}
                            onChange={e => setAnnouncement(prev => prev ? { ...prev, text_color: e.target.value } : null)}
                            className="w-10 h-10 border border-white/10 rounded bg-transparent p-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={announcement.text_color || ""}
                            onChange={e => setAnnouncement(prev => prev ? { ...prev, text_color: e.target.value } : null)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 2: AJUSTES DE CONTACTO Y REDES */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                  <div className="w-2 h-5 bg-[#9B1C1C] rounded"></div>
                  <h3 className="text-base font-bold uppercase text-white tracking-wider">Ajustes de Tienda & Contacto</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      WhatsApp para Ventas (Cochabamba, Bolivia)
                    </label>
                    <input
                      type="text"
                      value={sections.whatsapp_number || ""}
                      onChange={e => setSections(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                      placeholder="e.g. 59170000000"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Escriba el número con código de país sin el signo + (ej. 591 para Bolivia).</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Temporizador: Hora de Finalización de Oferta Diaria
                    </label>
                    <select
                      value={sections.countdown_end_hour || "24"}
                      onChange={e => setSections(prev => ({ ...prev, countdown_end_hour: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C] appearance-none"
                    >
                      {Array.from({ length: 25 }).map((_, i) => (
                        <option key={i} value={String(i)} className="bg-neutral-900 text-white">
                          {i === 24 ? "24:00 (Fin del Día / Reset)" : `${String(i).padStart(2, "0")}:00 hrs`}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">El reloj de oferta en el banner superior calcula las horas restantes hasta esta hora.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Instagram Link
                    </label>
                    <input
                      type="text"
                      value={sections.social_instagram || ""}
                      onChange={e => setSections(prev => ({ ...prev, social_instagram: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      TikTok Link
                    </label>
                    <input
                      type="text"
                      value={sections.social_tiktok || ""}
                      onChange={e => setSections(prev => ({ ...prev, social_tiktok: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Facebook Link
                    </label>
                    <input
                      type="text"
                      value={sections.social_facebook || ""}
                      onChange={e => setSections(prev => ({ ...prev, social_facebook: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: DISEÑO HOMEPAGE (HERO & VIP VAULT) */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-6 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                    <div className="w-2 h-5 bg-[#9B1C1C] rounded"></div>
                    <h3 className="text-base font-bold uppercase text-white tracking-wider">Visuales Portada del Hero (Homepage)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Título del Hero
                        </label>
                        <textarea
                          rows={3}
                          value={sections.hero_title || ""}
                          onChange={e => setSections(prev => ({ ...prev, hero_title: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C] font-bold"
                          placeholder="Introduce el título. Usa \n para saltos de línea."
                        />
                        <p className="text-[10px] text-gray-500">Coloca saltos de línea para el estilo visual Brutalista.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Subtítulo del Hero
                        </label>
                        <textarea
                          rows={3}
                          value={sections.hero_subtitle || ""}
                          onChange={e => setSections(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Video de Fondo de Respaldo para el Hero
                      </label>
                      <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-4">
                        <input
                          type="text"
                          value={sections.hero_video_url || ""}
                          onChange={e => setSections(prev => ({ ...prev, hero_video_url: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#9B1C1C]"
                          placeholder="URL del video .mp4"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id="hero-video-upload"
                            accept="video/mp4"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleConfigMediaUpload("hero_video_url", file);
                            }}
                            disabled={uploadingConfigMediaKey !== null}
                          />
                          <label
                            htmlFor="hero-video-upload"
                            className="cursor-pointer px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[11px] font-bold uppercase text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors"
                          >
                            {uploadingConfigMediaKey === "hero_video_url" ? (
                              <>
                                <Loader2 className="animate-spin" size={10} /> Subiendo...
                              </>
                            ) : (
                              <>
                                <Upload size={10} /> Subir Video
                              </>
                            )}
                          </label>
                          {sections.hero_video_url && (
                            <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                              <Check size={10} /> Cargado
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500">Se reproduce en bucle como fondo del carrusel si no se configuran otros banners de video.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                    <div className="w-2 h-5 bg-[#9B1C1C] rounded"></div>
                    <h3 className="text-base font-bold uppercase text-white tracking-wider">Configuración de la Bóveda VIP</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Título de la Bóveda
                        </label>
                        <input
                          type="text"
                          value={sections.vip_vault_title || ""}
                          onChange={e => setSections(prev => ({ ...prev, vip_vault_title: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Subtítulo de la Bóveda
                        </label>
                        <textarea
                          rows={3}
                          value={sections.vip_vault_subtitle || ""}
                          onChange={e => setSections(prev => ({ ...prev, vip_vault_subtitle: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9B1C1C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Video de Fondo de la Bóveda VIP
                      </label>
                      <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-4">
                        <input
                          type="text"
                          value={sections.vip_vault_video_url || ""}
                          onChange={e => setSections(prev => ({ ...prev, vip_vault_video_url: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#9B1C1C]"
                          placeholder="URL del video .mp4"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id="vip-video-upload"
                            accept="video/mp4"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleConfigMediaUpload("vip_vault_video_url", file);
                            }}
                            disabled={uploadingConfigMediaKey !== null}
                          />
                          <label
                            htmlFor="vip-video-upload"
                            className="cursor-pointer px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[11px] font-bold uppercase text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors"
                          >
                            {uploadingConfigMediaKey === "vip_vault_video_url" ? (
                              <>
                                <Loader2 className="animate-spin" size={10} /> Subiendo...
                              </>
                            ) : (
                              <>
                                <Upload size={10} /> Subir Video
                              </>
                            )}
                          </label>
                          {sections.vip_vault_video_url && (
                            <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                              <Check size={10} /> Cargado
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500">Este video se reproduce en bucle en el fondo de la sección de Bóveda VIP en la Homepage.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
