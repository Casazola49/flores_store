// ============================================================
// Guía de talles estática (ES-BO)
// Mapeo por category_slug a familias de talles y largo de pie en cm.
// ============================================================

export type SizeGuideEntry = {
  size: string;   // e.g. "35"
  footCm: string; // e.g. "22.5"
};

export type SizeGuideCategory = {
  label: string; // e.g. "Mujer", "Hombre", "Unisex"
  sizes: SizeGuideEntry[];
};

export type SizeGuideMap = Record<string, SizeGuideCategory[]>;

/**
 * Tabla de equivalencias de talles de calzado en Bolivia.
 * Todas las familias de mujer cubren estrictamente de la talla 34 a la 41 sin valores nulos.
 */
export const SIZE_GUIDE: SizeGuideMap = {
  "botas": [
    {
      label: "Mujer",
      sizes: [
        { size: "34", footCm: "21.5" },
        { size: "35", footCm: "22.0" },
        { size: "36", footCm: "22.5" },
        { size: "37", footCm: "23.0" },
        { size: "38", footCm: "23.5" },
        { size: "39", footCm: "24.0" },
        { size: "40", footCm: "24.5" },
        { size: "41", footCm: "25.0" },
      ],
    },
  ],
  "zapatos": [
    {
      label: "Mujer",
      sizes: [
        { size: "34", footCm: "21.5" },
        { size: "35", footCm: "22.0" },
        { size: "36", footCm: "22.5" },
        { size: "37", footCm: "23.0" },
        { size: "38", footCm: "23.5" },
        { size: "39", footCm: "24.0" },
        { size: "40", footCm: "24.5" },
        { size: "41", footCm: "25.0" },
      ],
    },
  ],
  "zapatillas": [
    {
      label: "Mujer",
      sizes: [
        { size: "34", footCm: "21.5" },
        { size: "35", footCm: "22.0" },
        { size: "36", footCm: "22.5" },
        { size: "37", footCm: "23.0" },
        { size: "38", footCm: "23.5" },
        { size: "39", footCm: "24.0" },
        { size: "40", footCm: "24.5" },
        { size: "41", footCm: "25.0" },
      ],
    },
    {
      label: "Unisex",
      sizes: [
        { size: "38", footCm: "23.5" },
        { size: "39", footCm: "24.0" },
        { size: "40", footCm: "24.5" },
        { size: "41", footCm: "25.0" },
      ],
    },
  ],
  "zapatillas-deportivas": [
    {
      label: "Hombre",
      sizes: [
        { size: "39", footCm: "24.0" },
        { size: "40", footCm: "24.5" },
        { size: "41", footCm: "25.0" },
        { size: "42", footCm: "25.5" },
        { size: "43", footCm: "26.0" },
        { size: "44", footCm: "26.5" },
      ],
    },
    {
      label: "Mujer",
      sizes: [
        { size: "34", footCm: "21.5" },
        { size: "35", footCm: "22.0" },
        { size: "36", footCm: "22.5" },
        { size: "37", footCm: "23.0" },
        { size: "38", footCm: "23.5" },
        { size: "39", footCm: "24.0" },
        { size: "40", footCm: "24.5" },
        { size: "41", footCm: "25.0" },
      ],
    },
  ],
  "tacos": [
    {
      label: "Mujer",
      sizes: [
        { size: "34", footCm: "21.5" },
        { size: "35", footCm: "22.0" },
        { size: "36", footCm: "22.5" },
        { size: "37", footCm: "23.0" },
        { size: "38", footCm: "23.5" },
        { size: "39", footCm: "24.0" },
        { size: "40", footCm: "24.5" },
        { size: "41", footCm: "25.0" },
      ],
    },
  ],
};

/**
 * Resuelve las entradas de la guía de talles para un category_slug dado.
 * Si la categoría no existe en el mapa, recurre a "zapatos".
 */
export function getSizeGuideForCategory(categorySlug: string): SizeGuideCategory[] {
  return SIZE_GUIDE[categorySlug] ?? SIZE_GUIDE["zapatos"] ?? [];
}
