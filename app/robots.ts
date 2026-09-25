import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// The company pages are discoverable. The Floor is a local-first intake
// layer and the console is a BenBen Builds local-first product — both are
// linked from /work but kept out of the index on purpose.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/work", "/roll", "/about", "/evidence", "/contact"],
        disallow: ["/benben", "/console"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
