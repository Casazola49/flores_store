"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Product, ProductVariant } from "@/types";
import { Truck, ShieldCheck, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCartStore();

  const productData = useQuery(api.products.getProduct, { slug });
  const product = productData || null;
  const loading = productData === undefined;
  
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        const primary = product.images.find((img: any) => img.is_primary) || product.images[0];
        setSelectedImage(primary.url);
      }
      
      // Pre-seleccionar primera variante disponible
      const firstVariant = product.variants?.find((v: any) => v.is_active && (v.stock ?? 1) > 0);
      if (firstVariant) {
        setSelectedSize(firstVariant.size || "");
        setSelectedColor(firstVariant.color || "");
      }
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-12 bg-white">
        <div className="w-16 h-1 w-32 bg-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-black animate-slide-infinite" />
        </div>
        <p className="text-[10px] font-bold tracking-[0.5em] uppercase">Loading Archive</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 bg-white">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Producto no encontrado</p>
        <Link href="/productos" className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-black pb-2">Volver al catálogo</Link>
      </div>
    );
  }

  // Lógica de variantes
  const variants = product.variants || [];
  const availableSizes = Array.from(new Set(variants.map((v: any) => v.size))).filter(Boolean) as string[];
  const availableColorsForSize = Array.from(new Set(variants.filter((v: any) => v.size === selectedSize).map((v: any) => v.color))).filter(Boolean) as string[];

  // Variante seleccionada final
  const currentVariant = variants.find((v: any) => v.size === selectedSize && v.color === selectedColor);
  const currentPrice = currentVariant?.price || product.base_price;
  const isOutOfStock = currentVariant && (currentVariant.stock ?? 0) <= 0;

  const handleAddToCart = () => {
    if (!currentVariant) {
      alert("Por favor selecciona una talla y color disponibles");
      return;
    }
    addItem({
      product_id: product.id,
      variant_id: currentVariant.id,
      product_name: product.name,
      product_image: selectedImage,
      size: currentVariant.size,
      color: currentVariant.color,
      price: currentPrice,
      quantity: quantity
    });
  };

  return (
    <div className="bg-white min-h-screen pt-40 pb-40">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 text-[9px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-20">
            <Link href="/" className="hover:text-black transition-colors">Home</Link> 
            <span className="w-4 h-[1px] bg-gray-200" />
            <Link href="/productos" className="hover:text-black transition-colors">Archive</Link>
            <span className="w-4 h-[1px] bg-gray-200" />
            <span className="text-black">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-24 items-start">
          
          {/* Gallery */}
          <div className="w-full lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 relative aspect-[4/5] bg-[#F9F9F9] overflow-hidden border border-gray-100">
                <Image 
                    src={selectedImage} 
                    alt={product.name} 
                    fill 
                    className="object-cover"
                    priority
                />
            </div>
            {product.images?.map((img: any, idx: number) => (
                <div 
                  key={img.id} 
                  className={`relative aspect-[3/4] bg-[#F9F9F9] overflow-hidden border transition-all duration-300 group cursor-pointer ${selectedImage === img.url ? 'border-black' : 'border-gray-100'}`} 
                  onClick={() => setSelectedImage(img.url)}
                >
                    <Image src={img.url} alt={`${product.name} ${idx}`} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                </div>
            ))}
          </div>

          {/* Details */}
          <div className="w-full lg:w-2/5 sticky top-40">
            <div className="space-y-12">
                <div>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-[var(--color-accent)] block">In Stock — Aria Archive</span>
                      {product.is_new && <span className="text-[9px] bg-black text-white px-2 py-0.5 font-bold tracking-widest uppercase">New Arrival</span>}
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif font-black uppercase tracking-tighter leading-none mb-8">{product.name}</h1>
                    <div className="flex items-baseline gap-8">
                        <span className="text-4xl font-bold tracking-tighter">Bs. {Number(currentPrice).toFixed(0)}</span>
                        {product.compare_price && (
                          <span className="text-sm text-gray-300 line-through font-bold">Bs. {Number(product.compare_price).toFixed(0)}</span>
                        )}
                    </div>
                </div>

                <div className="border-y border-gray-100 py-12">
                    <p className="text-[11px] font-bold text-gray-500 leading-loose uppercase tracking-widest">
                        {product.description || "Pieza de liquidación exclusiva Aria. Diseño estructural enfocado en la durabilidad y estética atemporal."}
                    </p>
                </div>

                {/* Sizing & Colors */}
                <div className="space-y-10">
                  {availableSizes.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Select Size</span>
                        <Link href="/tallas" className="text-[9px] font-bold underline uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors">Size Guide</Link>
                      </div>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {availableSizes.map(size => (
                          <button
                            key={size}
                            onClick={() => {
                              setSelectedSize(size);
                              // Auto-seleccionar primer color disponible para esa talla
                              const color = variants.find((v: any) => v.size === size)?.color || "";
                              setSelectedColor(color);
                            }}
                            className={`h-14 flex items-center justify-center text-[11px] font-bold transition-all duration-300 border ${selectedSize === size ? 'bg-black text-white border-black shadow-xl scale-105' : 'border-gray-100 text-gray-400 hover:border-gray-300 hover:text-black'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableColorsForSize.length > 1 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block">Select Color</span>
                      <div className="flex gap-4">
                        {availableColorsForSize.map(color => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-6 h-12 flex items-center justify-center text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border ${selectedColor === color ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Engagement */}
                <div className="space-y-8 pt-8">
                    {isOutOfStock ? (
                      <div className="h-16 flex items-center justify-center bg-gray-100 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                        Out of Stock
                      </div>
                    ) : (
                      <div className="flex items-center gap-6">
                          <div className="flex items-center border border-gray-200 h-16">
                              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center hover:bg-gray-50"><Minus size={14} /></button>
                              <span className="w-12 text-center font-bold text-xs">{quantity}</span>
                              <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center hover:bg-gray-50"><Plus size={14} /></button>
                          </div>
                          
                          <button 
                              onClick={handleAddToCart}
                              className="flex-1 bg-black text-white h-16 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-[var(--color-accent)] transition-all duration-500 flex items-center justify-center gap-4 group"
                          >
                              <ShoppingBag size={16} /> 
                              Add to Archive 
                              <span className="w-0 group-hover:w-8 h-[1px] bg-white transition-all" />
                          </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-12 pt-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-[var(--color-accent)]">
                                <Truck size={16} />
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-black">Express</span>
                            </div>
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest leading-relaxed">Envíos prioritarios a todo el país.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-[var(--color-accent)]">
                                <ShieldCheck size={16} />
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-black">Quality</span>
                            </div>
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest leading-relaxed">Garantía Aria Studio en cada costura y material.</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

