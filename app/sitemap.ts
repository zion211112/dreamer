import type { MetadataRoute } from "next";
import { PLANE } from "@/lib/system";
import { SITE_URL } from "@/lib/site";

/**
 * The sitemap is derived from the same PLANE array that renders the
 * rail — a route cannot exist in navigation and be missing here, and a
 * dead URL cannot be published because the line items are minted from
 * live routes. Five public nodes; the console is intentionally absent
 * (see robots.ts and the console layout's noindex).
 *
 * VIEWS is the exception, and it exists because a view is not a node:
 * /lattice renders the same five nodes as a graph and is linked from the
 * rail beside them, but it is not one of them and adding it to PLANE would
 * make it a sixth stage. A route that is linked from the index and
 * reachable in two clicks is a published route whether or not it is a
 * node, so it is minted here from a named list — not left to rot out of a
 * sitemap that claimed to be derived.
 */
const VIEWS: readonly { path: string; priority: number }[] = [
  { path: "/lattice", priority: 0.7 },
];

/**
 * The product page.
 *
 * It carries the highest non-root priority on the site, above every
 * architecture node but below the homepage itself. That is a reversal of
 * the previous sitemap, which listed five architecture routes and no
 * product page — because the product page did not exist.
 */
const PRODUCT: readonly { path: string; priority: number }[] = [
  { path: "/product", priority: 0.9 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...PLANE.map((node) => ({
      url: `${SITE_URL}${node.href === "/" ? "/" : node.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: node.href === "/" ? 1 : 0.8,
    })),
    ...VIEWS.map((view) => ({
      url: `${SITE_URL}${view.path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: view.priority,
    })),
    ...PRODUCT.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: p.priority,
    })),
  ];
}
