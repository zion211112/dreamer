import type { MetadataRoute } from "next";

// Contacts live behind acceptance and identity. Crawlers get the porch:
// landing and contact only. Everything human stays human-readable,
// nothing machine-harvestable.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contact"],
        disallow: ["/dashboard/", "/halls", "/crucible", "/cert", "/zep-tepi/"]
      }
    ]
  };
}
