import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Crawler policy.
 *
 * The public plane is open. The console is not in the index: it is a
 * device-local prototype surface, and a search result that implies an
 * institution is running it would be the exact claim this system is
 * built to prevent. `follow` stays on so crawlers still discover the
 * public routes from console pages they might land on.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/console"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
