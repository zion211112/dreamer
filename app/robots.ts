import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// Public architecture and evidence routes are discoverable. The console,
// dashboard and search surface remain outside the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/deploy",
          "/fab",
          "/studio",
          "/roll",
          "/roll/assets",
          "/evidence",
          "/ledger",
          "/contact",
        ],
        disallow: ["/dashboard", "/benben", "/search", "/console"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
