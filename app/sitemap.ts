import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// The public surface is intentionally small: home, the posture, the proof, and
// contact. The Floor (/benben) is a local-first intake layer and the console
// is a local-first product — both stay out of the index by design.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/evidence`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
