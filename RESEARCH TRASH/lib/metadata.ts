import type { Metadata } from "next";
import { COMPANY } from "./company";

export interface FaceMetadataInput {
  title: string;
  description: string;
  path: string;
}

/** Complete, canonical metadata for every public face and evidence route. */
export function faceMetadata({ title, description, path }: FaceMetadataInput): Metadata {
  const fullTitle = `${title} — APT-LABS`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: COMPANY.name,
      locale: "en_KE",
      title: fullTitle,
      description,
      url: path,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/opengraph-image"],
    },
  };
}
