import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
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

  // TODO: Expand with real PDPs once Convex is reachable at build.
  // getProducts is public (no auth) — read via fetchQuery from convex/nextjs
  // and generate one entry per product with changeFrequency weekly priority 0.7.
  return staticRoutes;
}
