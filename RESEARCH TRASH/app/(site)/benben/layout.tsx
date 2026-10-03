import type { Metadata } from "next";
import { faceMetadata } from "../../../lib/metadata";

export const metadata: Metadata = faceMetadata({
  title: "BenBen / The Floor",
  description:
    "A local-first intake layer for capability, work, makers and ideas. It starts empty and keeps entries in the browser until exported.",
  path: "/benben",
});

export default function BenBenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
