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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((cat) => (
        <Link 
          key={cat.slug} 
          href={`/categorias/${cat.slug}`}
          className="relative group overflow-hidden rounded-[var(--radius-lg)] aspect-[4/5] shadow-lg"
        >
          {/* Image Background */}
          <Image
            src={cat.image}
            alt={cat.title}
            fill
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />

          {/* Overlay - Yellow on Hover for Aria look */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-[var(--color-accent)]/80 transition-all duration-500" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
            <h3 className="text-2xl md:text-3xl font-black uppercase mb-4 drop-shadow-xl group-hover:text-black transition-colors">
              {cat.title}
            </h3>
            <span className="text-[10px] tracking-[0.4em] uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 font-black border-b-2 border-white group-hover:border-black pb-2 group-hover:text-black">
              COMPRAR
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
