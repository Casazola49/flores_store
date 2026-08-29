// Single source of truth for canonical site URL
// All metadataBase / canonical / robots / sitemap must import from here
// to avoid duplicating the fallback "https://floresbolivia.com".
// Set NEXT_PUBLIC_SITE_URL in Vercel/VPS env to override (e.g. https://www.floresbolivia.com).

export const FALLBACK_SITE_URL = "https://floresbolivia.com";

// Trim and strip trailing slash so callers can safely do `${siteUrl}/path`
function normalize(url: string): string {
  return url.trim().replace(/\/$/, "");
}

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim()
    ? normalize(process.env.NEXT_PUBLIC_SITE_URL)
    : FALLBACK_SITE_URL;

export function getSiteUrl(): string {
  return siteUrl;
}
