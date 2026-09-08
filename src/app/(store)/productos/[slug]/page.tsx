import type { Metadata } from "next";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Product } from "@/types";
import ProductPageClient from "./ProductPageClient";

import { siteUrl } from "@/lib/site";

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fallbackTitle = `${slugToTitle(slug)} | Flores`;
  const fallbackDescription = `Compra ${slugToTitle(slug)} en Flores. Calzado premium con stock real. Envíos a todo Bolivia.`;

  // Try to read the product from Convex (public query, no auth) for richer
  // metadata. If the deployment is unreachable at request time, fall back to a
  // slug-derived title/description so the PDP never fails to render.
  try {
    const product = (await fetchQuery(api.products.getProduct, {
      slug,
    })) as Product | null;

    if (!product) {
      return {
        title: fallbackTitle,
        description: fallbackDescription,
        alternates: { canonical: `/productos/${slug}` },
        robots: { index: false, follow: true },
        openGraph: {
          locale: "es_BO",
          type: "website",
          siteName: "Flores",
          title: fallbackTitle,
          description: fallbackDescription,
          url: `/productos/${slug}`,
        },
      };
    }

    const title = product.meta_title || `${product.name} | Flores`;
    const description =
      product.meta_desc ||
      product.description ||
      `Compra ${product.name} en Flores. Calzado premium con stock real. Envíos a todo Bolivia.`;
    const primaryImage =
      product.images?.find((img) => img.is_primary)?.url ||
      product.images?.[0]?.url;

    return {
      title,
      description,
      alternates: { canonical: `/productos/${slug}` },
      openGraph: {
        locale: "es_BO",
        type: "website",
        siteName: "Flores",
        title,
        description,
        url: `/productos/${slug}`,
        ...(primaryImage ? { images: [primaryImage] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        ...(primaryImage ? { images: [primaryImage] } : {}),
      },
    };
  } catch {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: { canonical: `/productos/${slug}` },
      openGraph: {
        locale: "es_BO",
        type: "website",
        siteName: "Flores",
        title: fallbackTitle,
        description: fallbackDescription,
        url: `/productos/${slug}`,
      },
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
