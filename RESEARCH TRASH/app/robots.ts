import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// The Protocol Node lives at the root. The support routes — record, doctrine,
// evidence and engagement — stay indexed. The Floor is a local-first intake
// layer and the console is a build inside the node's write-up; both are kept
// out of the index on purpose.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/roll", "/about", "/evidence", "/contact"],
        disallow: ["/benben", "/console", "/protocol"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
