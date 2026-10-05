import type { MetadataRoute } from "next";
import { CONSOLE, PLANE } from "@/lib/system";
import { SITE_URL } from "@/lib/site";

/**
 * The company homepage is its own route, not a topology node. The Field
 * node points to the device-local Console prototype, which stays out of
 * the sitemap and search index. The remaining public topology nodes are
 * derived from PLANE so the system map and search surface stay distinct.
 *
 * VIEWS is the exception, and it exists because a view is not a node:
 * /lattice renders the same five nodes as a graph and is linked from the
 * rail beside them, but it is not one of them and adding it to PLANE would
 * make it a sixth stage. /stack is the second view, and it sits here for
 * the same reason in the other direction: it is the page about what the
 * five nodes are the floor of — the company's own ontology rather than a
 * stage of its loop — so it cannot be a node either. A route that is
 * linked from the index and reachable in one click is a published route
 * whether or not it is a node, so it is minted here from a named list —
 * not left to rot out of a sitemap that claimed to be derived.
 */
const VIEWS: readonly { path: string; priority: number }[] = [
  { path: "/stack", priority: 0.9 },
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
  const publicNodes = PLANE.filter((node) => node.href !== CONSOLE.href);

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1,
    },
    ...publicNodes.map((node) => ({
      url: `${SITE_URL}${node.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
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
