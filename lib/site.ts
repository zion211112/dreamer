// Single source of truth for the public base URL. Every consumer (root
// metadata, robots, sitemap) reads it so there is one place to set the
// domain. Set NEXT_PUBLIC_BASE_URL in Vercel (or here) at launch; the
// default keeps a valid absolute URL so `new URL()` never throws.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://apt-labs.vercel.app"
).replace(/\/+$/, "");
