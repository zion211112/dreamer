import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// The quiet public routes are discoverable. The console is a local-first
// product and is kept out of the index on purpose.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/evidence", "/contact"],
        disallow: ["/console"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
