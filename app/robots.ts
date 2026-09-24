import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// Contacts live behind acceptance and identity. Crawlers get the porch:
// landing and contact only. Everything human stays human-readable,
// nothing machine-harvestable.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contact", "/ledger"],
        // No trailing slashes: the exclusion standard matches on prefix, so
        // "/ledger/" would leave "/ledger" fully crawlable.
        disallow: ["/dashboard", "/benben", "/search", "/console"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
