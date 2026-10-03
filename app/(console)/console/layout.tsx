import type { Metadata } from "next";

// Every console route (/console, /console/[id], ...) is open.
// All gates removed: no name lock, no paywall reaches the console.
export const metadata: Metadata = {
  // The console is a local-first product, not a marketing face. Keep it out of
  // the index so search surfaces only the public site + evidence routes.
  robots: { index: false, follow: true, googleBot: { index: false, noimageindex: true } },
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
