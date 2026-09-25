import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// The public surface is intentionally small: home, the posture, the proof, and
// contact. The console is a local-first product and stays out of the index.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/evidence`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
