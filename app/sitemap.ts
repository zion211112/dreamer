import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// The public architecture and evidence record. Personal, gated and
// local-first application surfaces stay out of the index.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/deploy`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/fab`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/studio`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/roll`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/roll/assets`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/evidence`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/ledger`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
