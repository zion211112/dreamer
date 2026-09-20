import type { MetadataRoute } from "next";

// The public face. The console and its data stay off the index — they are
// gated, local-first, and not crawlable in any meaningful sense.
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL || "https://apt-labs.vercel.app";
  // Only routes that are both linked in the nav and allowed in robots.ts.
  // /search redirects, /dashboard and /benben are local-first and gated.
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/ledger`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
