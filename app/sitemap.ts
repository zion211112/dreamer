import type { MetadataRoute } from "next";
import { PLANE } from "@/lib/system";
import { SITE_URL } from "@/lib/site";

/**
 * The sitemap is derived from the same PLANE array that renders the
 * rail — a route cannot exist in navigation and be missing here, and a
 * dead URL cannot be published because the line items are minted from
 * live routes. Five public nodes; the console is intentionally absent
 * (see robots.ts and the console layout's noindex).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PLANE.map((node) => ({
    url: `${SITE_URL}${node.href === "/" ? "/" : node.href}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: node.href === "/" ? 1 : 0.8,
  }));
}
