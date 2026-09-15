import type { MetadataRoute } from "next";

// The public face. The console and its data stay off the index — they are
// gated, local-first, and not crawlable in any meaningful sense.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://apt-labs.vercel.app";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 }
  ];
}
