import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// The quiet public routes are discoverable. The Floor is a local-first
// intake layer and the console is a local-first product — both are linked
// in the chrome but kept out of the index on purpose.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/evidence", "/contact"],
        disallow: ["/benben", "/console"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
