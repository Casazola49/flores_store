import type { MetadataRoute } from "next";

// TODO: Set NEXT_PUBLIC_SITE_URL to the production canonical domain. No env var
// exists yet, so we reuse the same fallback as layout.tsx / sitemap.ts.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://floresbolivia.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/*",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
