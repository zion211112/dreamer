import type { MetadataRoute } from "next";

// Contacts live behind acceptance and identity. Crawlers get the porch:
// landing and contact only. Everything human stays human-readable,
// nothing machine-harvestable.
export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://apt-labs.vercel.app";
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
    sitemap: `${base}/sitemap.xml`,
  };
}
