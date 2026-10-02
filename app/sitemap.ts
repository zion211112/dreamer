import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// The site: the node at the root, then its support routes. The Floor
// (/benben) is a local-first intake layer and the console is a build inside
// the node's write-up — both stay out of the index by design.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/roll`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/evidence`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
