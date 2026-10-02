import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// The Protocol Node lives at the root. The support routes — execution,
// record, doctrine, evidence and engagement — stay indexed. The Floor is a
// local-first intake layer and the console is the node's first product; both
// are linked from /work but kept out of the index on purpose.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/work", "/roll", "/about", "/evidence", "/contact"],
        disallow: ["/benben", "/console", "/protocol"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
