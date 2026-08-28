import type { MetadataRoute } from "next";

// TODO: Set NEXT_PUBLIC_SITE_URL to the production canonical domain. No env var
// exists yet, so we reuse the same fallback as layout.tsx / robots.ts.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://floresbolivia.com";

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
