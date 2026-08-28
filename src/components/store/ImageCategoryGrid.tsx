"use client";

import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    title: "Botas",
    slug: "botas",
    image: "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=1000",
  },
  {
    title: "Zapatillas",
    slug: "zapatillas",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000",
  },
  {
    title: "Tacos",
    slug: "tacos",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000",
  },
  {
    title: "Zapatos",
    slug: "zapatos",
    image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=1000",
  }
];

export default function ImageCategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {categories.map((cat) => (
        <Link 
          key={cat.slug} 
          href={`/categorias/${cat.slug}`}
          className="relative group overflow-hidden aspect-[4/5] bg-gray-100"
        >
          {/* Image Background */}
          <div className="absolute inset-0">
            <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
            />
          </div>

          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-2 opacity-60">Colección</span>
            <h3 className="text-3xl md:text-4xl font-serif font-black uppercase tracking-tighter group-hover:text-[var(--color-accent)] transition-colors duration-500">
              {cat.title}
            </h3>
            
            <div className="w-0 group-hover:w-full h-[1px] bg-[var(--color-accent)] mt-6 transition-all duration-700" />
          </div>
        </Link>
      ))}
    </div>
  );
}
