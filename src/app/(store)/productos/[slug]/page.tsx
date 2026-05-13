"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { publicApi } from "@/lib/api";
import type { Product, ProductVariant } from "@/types";
import { Truck, ShieldCheck, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const ZapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

// Mock products for MVP matching the list page
const MOCK_PRODUCTS: Product[] = [
  {
    id: 991, name: "Bota Chelsea Noir", slug: "bota-chelsea-noir", brand: "Aria Premium", base_price: 450, is_new: true,
    images: [
      { id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=1000" },
      { id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000" }
    ],
    description: "La bota definitiva para el estilo urbano. Calidad premium con acabados artesanales.",
    category_id: 1, variants: [
      { id: 101, product_id: 991, size: "38", color: "Negro", price: 450, is_active: true },
      { id: 102, product_id: 991, size: "39", color: "Negro", price: 450, is_active: true }
    ], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: ""
  },
  {
    id: 992, name: "Sneaker Urban White", slug: "sneaker-urban-white", brand: "Aria Premium", base_price: 320, is_new: false,
    images: [{ id: 1, product_id: 1, sort_order: 1, is_primary: true, url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000" }],
    description: "Comodidad y diseño en cada paso. Un clásico renovado para tu colección.",
    category_id: 2, variants: [], is_featured: false, is_active: true, sort_order: 1, created_at: "", updated_at: ""
  }
];

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await publicApi.getProduct(slug);
        if (res.data) {
          setProduct(res.data);
          if (res.data.images?.length > 0) setSelectedImage(res.data.images[0].url);
        } else {
          const mock = MOCK_PRODUCTS.find(p => p.slug === slug);
          if (mock) {
            setProduct(mock);
            setSelectedImage(mock.images[0].url);
          }
        }
      } catch (err) {
        const mock = MOCK_PRODUCTS.find(p => p.slug === slug);
        if (mock) {
          setProduct(mock);
          setSelectedImage(mock.images[0].url);
        }
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-black animate-spin rounded-full" />
        <p className="text-[10px] font-black tracking-[0.4em] uppercase">Cargando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 px-4 text-center">
        <h2 className="text-4xl font-black uppercase">Pieza no encontrada</h2>
        <Link href="/productos" className="bg-black text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest">Volver al Catálogo</Link>
      </div>
    );
  }

  const sizes = product.variants ? Array.from(new Set(product.variants.filter(v => v.is_active).map(v => v.size))).filter(Boolean) as string[] : [];
  
  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedVariant) {
      alert("Por favor selecciona una talla");
      return;
    }
    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.id || 999,
      product_name: product.name,
      product_image: selectedImage,
      size: selectedVariant?.size,
      color: selectedVariant?.color,
      price: selectedVariant?.price || product.base_price,
      quantity: quantity
    });
  };

  return (
    <div className="bg-white">
      {/* Liquidación Banner */}
      <div className="bg-black text-[var(--color-accent)] py-3 text-center text-[10px] font-black tracking-widest uppercase">
        <ZapIcon /> 
        Oferta por Tiempo Limitado
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Imágenes de Producto */}
          <div className="w-full lg:w-3/5 flex flex-col-reverse lg:flex-row gap-6">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar">
              {product.images?.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-24 h-32 flex-shrink-0 bg-gray-50 rounded-[var(--radius-md)] overflow-hidden border-2 transition-all duration-300 ${selectedImage === img.url ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img.url} alt={`${product.name} ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            
            <div className="relative flex-1 aspect-[4/5] bg-gray-50 rounded-[var(--radius-lg)] overflow-hidden shadow-2xl">
              <Image 
                src={selectedImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000"} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Detalles de la Pieza */}
          <div className="w-full lg:w-2/5 flex flex-col pt-4">
            <div className="flex items-center gap-3 mb-6">
               <span className="bg-[var(--color-accent)] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                En Stock
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Ref: {product.slug.substring(0, 8)}</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">{product.name}</h1>
            
            <div className="flex items-center gap-6 mb-12">
              <span className="text-4xl font-black tracking-tighter">Bs. {Number(selectedVariant?.price || product.base_price).toFixed(0)}</span>
              <span className="text-xl text-gray-300 line-through font-bold">Bs. {Number(product.base_price * 1.5).toFixed(0)}</span>
            </div>

            <div className="bg-[#f9f9f9] p-8 rounded-[var(--radius-lg)] mb-12">
              <p className="text-sm font-bold text-gray-500 leading-relaxed uppercase tracking-wider">
                {product.description || "Calzado Aria Liquidación. Diseño exclusivo y comodidad insuperable. Stock limitado."}
              </p>
            </div>

            {/* Tallas Aria Style */}
            {sizes.length > 0 && (
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase tracking-widest">Talla Disponibles</span>
                  <Link href="/tallas" className="text-[10px] font-bold underline uppercase tracking-widest text-gray-400 hover:text-black">Guía</Link>
                </div>
                <div className="flex flex-wrap gap-4">
                  {sizes.map(size => {
                    const isSelected = selectedVariant?.size === size;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          const variant = product.variants.find(v => v.size === size);
                          if (variant) setSelectedVariant(variant);
                        }}
                        className={`
                          w-16 h-16 flex items-center justify-center text-sm font-black rounded-full transition-all duration-300 border-2
                          ${isSelected ? 'bg-black text-white border-black scale-110' : 'border-gray-100 hover:border-black text-black'}
                        `}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-4 mb-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-full px-6 py-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-[var(--color-accent)]"><Minus size={18} /></button>
                  <span className="w-12 text-center font-black text-sm tracking-widest">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="hover:text-[var(--color-accent)]"><Plus size={18} /></button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white py-5 rounded-full text-xs font-black tracking-[0.3em] uppercase hover:bg-black/90 transition-all flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={18} /> Agregar a la Bolsa
                </button>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-12 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--color-accent)] rounded-full flex items-center justify-center text-black">
                   <Truck size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Envío Express</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Todo Bolivia</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-[var(--color-accent)]">
                   <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Pago Seguro</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Calidad Aria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
