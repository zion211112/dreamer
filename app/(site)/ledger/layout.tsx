import type { Metadata } from "next";
import { faceMetadata } from "../../../lib/metadata";

export const metadata: Metadata = faceMetadata({
  title: "The Roll — People Register",
  description: "A device-local register interface for names, skills, credentials and seals. Records remain in the browser until exported; this is not a shared public directory.",
  path: "/ledger",
});

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}