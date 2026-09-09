"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Truck, ShieldCheck, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import SizeGuideModal from "@/components/store/SizeGuideModal";
import FavoritesButton from "@/components/store/FavoritesButton";
import LowStockNote from "@/components/store/LowStockNote";
import WhatsAppOrderCTA from "@/components/store/WhatsAppOrderCTA";
import RelatedProducts from "@/components/store/RelatedProducts";

export default function ProductPageClient({ slug }: { slug: string }) {
  const { addItem } = useCartStore();

  const productData = useQuery(api.products.getProduct, { slug });
  const product = (productData as unknown as Product) || null;
  const loading = productData === undefined;

  const [selectedImageOverride, setSelectedImageOverride] = useState<string | null>(null);
  const [selectedSizeOverride, setSelectedSizeOverride] = useState<string | null>(null);
  const [selectedColorOverride, setSelectedColorOverride] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [variantError, setVariantError] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-12 bg-white">
        <div className="w-32 h-1 bg-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-black animate-slide-infinite" />
        </div>
        <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-gray-500">Cargando modelo</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 bg-white">
        <p className="text-sm font-bold text-gray-400">Producto no encontrado</p>
        <Link href="/productos" className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-black pb-2">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  // Lógica de variantes
  const variants: ProductVariant[] = product.variants || [];
  const availableSizes = Array.from(new Set(variants.map((v) => v.size))).filter(Boolean) as string[];

  // Primary and selected image
  const primaryImage = product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url || "";
  const selectedImage = selectedImageOverride ?? primaryImage;

  // Selected size: fallback to first variant with stock > 0, or first variant size
  const firstAvailableVariant = variants.find((v) => v.is_active && (v.stock ?? 0) > 0);
  const defaultSize = firstAvailableVariant?.size || variants[0]?.size || "";
  const selectedSize = selectedSizeOverride ?? defaultSize;

  // Available colors for the selected size
  const availableColorsForSize = Array.from(
    new Set(variants.filter((v) => v.size === selectedSize).map((v) => v.color))
  ).filter(Boolean) as string[];

  // Selected color: fallback to first available color for this size
  const defaultColor =
    variants.find((v) => v.size === selectedSize && (v.stock ?? 0) > 0)?.color ||
    variants.find((v) => v.size === selectedSize)?.color ||
    "";
  const selectedColor = selectedColorOverride ?? defaultColor;

  // Variante seleccionada final
  const currentVariant = variants.find((v) => v.size === selectedSize && v.color === selectedColor);
  const currentPrice = currentVariant?.price || product.base_price;
  const isOutOfStock = currentVariant && (currentVariant.stock ?? 0) <= 0;

  const isSizeOutOfStock = (size: string) => {
    const sizeVariants = variants.filter((v) => v.size === size);
    if (sizeVariants.length === 0) return true;
    return sizeVariants.every((v) => (v.stock ?? 0) <= 0);
  };

  const handleAddToCart = () => {
    if (!currentVariant) {
      setVariantError("Por favor selecciona una talla y color disponibles");
      return;
    }
    if ((currentVariant.stock ?? 0) <= 0) {
      setVariantError("Este modelo se encuentra agotado en la talla seleccionada");
      return;
    }
    setVariantError("");
    addItem({
      product_id: product.id,
      variant_id: currentVariant.id,
      product_name: product.name,
      product_image: selectedImage,
      size: currentVariant.size,
      color: currentVariant.color,
      price: currentPrice,
      quantity: quantity,
    });
  };

  return (
    <div className="bg-white min-h-screen pt-36 pb-32">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 text-label font-bold tracking-[0.4em] uppercase text-gray-400 mb-16">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="w-4 h-[1px] bg-gray-200" />
          <Link href="/productos" className="hover:text-black transition-colors">Catálogo</Link>
          <span className="w-4 h-[1px] bg-gray-200" />
          <span className="text-black">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">
          {/* Gallery */}
          <div className="w-full lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Large Image */}
            <div className="md:col-span-2 relative aspect-[4/5] bg-[var(--color-surface)] overflow-hidden border border-gray-100 rounded-none">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
                fetchPriority="high"
              />
            </div>

            {/* Thumbnail Buttons */}
            {product.images?.map((img, idx) => {
              const slotName = `${product.name} — imagen ${idx + 1}`;
              const isSelected = selectedImage === img.url;
              return (
                <button
                  key={img.id || img.url || idx}
                  type="button"
                  aria-label={slotName}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedImageOverride(img.url)}
                  className={`relative aspect-[3/4] bg-[var(--color-surface)] overflow-hidden border transition-all duration-300 group cursor-pointer rounded-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                    isSelected ? "border-black ring-1 ring-black" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={slotName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </button>
              );
            })}
          </div>

          {/* Details */}
          <div className="w-full lg:w-2/5 sticky top-32">
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-[var(--color-accent)] block">
                    Stock real
                  </span>
                  {product.is_new && (
                    <span className="text-label bg-black text-white px-2 py-0.5 font-bold tracking-widest uppercase rounded-none">
                      Nuevo
                    </span>
                  )}
                </div>

                {/* Title + Favorites Button */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <h1 className="text-display font-serif font-black uppercase tracking-tighter leading-none text-black">
                    {product.name}
                  </h1>
                  <FavoritesButton slug={product.slug} className="shrink-0 mt-1" />
                </div>

                <div className="flex items-baseline gap-6">
                  <span className="text-4xl font-bold tracking-tighter text-black">
                    Bs. {Number(currentPrice).toFixed(0)}
                  </span>
                  {product.compare_price && (
                    <span className="text-sm text-gray-300 line-through font-bold">
                      Bs. {Number(product.compare_price).toFixed(0)}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-y border-gray-100 py-8">
                <p className="text-[11px] font-bold text-gray-500 leading-loose">
                  {product.description || "Calzado Flores con diseño atemporal y confección de primera calidad."}
                </p>
              </div>

              {/* Sizing & Colors */}
              <div className="space-y-8">
                {availableSizes.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Elige tu talle</span>
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-label font-bold underline uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      >
                        Guía de talles
                      </button>
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2.5">
                      {availableSizes.map((size) => {
                        const outOfStock = isSizeOutOfStock(size);
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={outOfStock}
                            aria-disabled={outOfStock}
                            onClick={() => {
                              if (outOfStock) return;
                              setVariantError("");
                              setSelectedSizeOverride(size);
                              setSelectedColorOverride(null);
                            }}
                            className={`h-14 flex flex-col items-center justify-center text-[11px] font-bold transition-all duration-300 border rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                              outOfStock
                                ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                                : isSelected
                                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-xl scale-105 cursor-pointer"
                                : "border-gray-100 text-gray-400 hover:border-gray-300 hover:text-black cursor-pointer"
                            }`}
                          >
                            <span>{size}</span>
                            {outOfStock && (
                              <span className="text-[8px] font-normal uppercase tracking-wider text-gray-400">
                                Agotado
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Low Stock Note for selected variant */}
                    {currentVariant && currentVariant.size && (
                      <LowStockNote
                        stock={currentVariant.stock ?? 0}
                        size={currentVariant.size}
                        className="mt-3"
                      />
                    )}
                  </div>
                )}

                {availableColorsForSize.length > 1 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Elige color</span>
                    <div className="flex flex-wrap gap-3">
                      {availableColorsForSize.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setVariantError("");
                            setSelectedColorOverride(color);
                          }}
                          className={`px-5 h-11 flex items-center justify-center text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer ${
                            selectedColor === color
                              ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                              : "border-gray-100 text-gray-400 hover:border-gray-300 hover:text-black"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {variantError && (
                <p role="alert" aria-live="assertive" className="text-xs font-bold text-red-500">
                  {variantError}
                </p>
              )}

              {/* Engagement Controls */}
              <div className="space-y-4 pt-4">
                {isOutOfStock ? (
                  <div className="h-16 flex items-center justify-center bg-gray-100 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 rounded-none">
                    Agotado
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 h-16 rounded-none">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        aria-label="Disminuir cantidad"
                        className="w-12 h-full flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-12 text-center font-bold text-xs">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        aria-label="Aumentar cantidad"
                        className="w-12 h-full flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 bg-black text-white h-16 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-[var(--color-accent)] transition-all duration-300 flex items-center justify-center gap-4 group rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      <ShoppingBag size={16} />
                      Agregar al carrito
                      <span className="w-0 group-hover:w-8 h-[1px] bg-white transition-all" />
                    </button>
                  </div>
                )}

                {/* Secondary Single-Product WhatsApp Inquiry CTA */}
                <WhatsAppOrderCTA
                  productName={product.name}
                  size={selectedSize}
                  color={selectedColor}
                  price={currentPrice}
                />

                {/* Guarantees */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[var(--color-accent)]">
                      <Truck size={16} />
                      <span className="text-label font-bold uppercase tracking-[0.3em] text-black">Envío 48h</span>
                    </div>
                    <p className="text-label text-gray-400 leading-relaxed">Envíos prioritarios a todo el país.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[var(--color-accent)]">
                      <ShieldCheck size={16} />
                      <span className="text-label font-bold uppercase tracking-[0.3em] text-black">Garantía Flores</span>
                    </div>
                    <p className="text-label text-gray-400 leading-relaxed">Calidad en cada costura.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        categorySlug={product.category_slug || "botas"}
        gender={product.gender}
        currentSlug={product.slug}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        categorySlug={product.category_slug || "botas"}
      />
    </div>
  );
}
