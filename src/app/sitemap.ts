import type { MetadataRoute } from "next";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600; // ISR 1h — evita golpear Convex en cada request de sitemap, sigue fresco para SEO

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Try to expand with real PDPs from Convex (public query, no auth).
  // Must never break the build: if Convex is unreachable at build time
  // (missing env, network, deployment asleep) we silently return only
  // static routes. No throw, no empty sitemap.
  try {
    const result = (await fetchQuery(api.products.getProducts, {
      limit: 100,
    })) as { data: { slug: string; updated_at?: string }[] } | null;

    const products = result?.data ?? [];
    if (products.length === 0) return staticRoutes;

    const pdpRoutes: MetadataRoute.Sitemap = products
      .filter((p) => typeof p.slug === "string" && p.slug.length > 0)
      .map((p) => ({
        url: `${siteUrl}/productos/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...pdpRoutes];
  } catch {
    return staticRoutes;
  }
}
