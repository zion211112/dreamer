/**
 * The canonical origin, resolved in one place.
 *
 * Every absolute URL the site publishes (sitemap, robots, metadata
 * base, OG image) is minted from this constant, so no route invents
 * its own hostname. Resolution order:
 *
 *   1. NEXT_PUBLIC_SITE_URL — an explicit override, always wins
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable production
 *      domain (not the per-deployment preview hostname)
 *   3. VERCEL_URL — the current deployment, correct on previews
 *   4. localhost — local development and self-hosted builds
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
