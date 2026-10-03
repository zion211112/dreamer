import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
// The lattice — the canvas surface. Split out because it is the one
// stylesheet whose job is to let a person act on the topology rather than
// read about it, and because the engine's own stylesheet has to be
// imported from somewhere that is processed on the client, which a
// Next.js CSS import from the root layout is.
import "@xyflow/react/dist/style.css";
import "./lattice.css";
import { COMPANY } from "@/lib/system";
import { SITE_URL } from "@/lib/site";

// The contract's supporting line is the site description, and the
// primary sentence is the title: those two strings are the memory
// target, so they are minted once in lib/system.ts and reused, never
// retyped per route. The OG/Twitter block repeats them because a link
// preview is a surface too — and it is the one most likely to be read
// out of context.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: COMPANY.primary,
    template: "%s — APT-LABS",
  },
  description: COMPANY.supporting,
  applicationName: COMPANY.name,
  publisher: COMPANY.name,
  category: "technology",
  openGraph: {
    type: "website",
    siteName: COMPANY.name,
    title: COMPANY.primary,
    description: COMPANY.supporting,
    locale: "en_GB",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: COMPANY.primary,
    description: COMPANY.supporting,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Dark by declaration, in metadata as well as CSS: the UA is told the
// scheme before first paint, so mobile browser chrome and form controls
// are built for a dark substrate instead of being re-tinted into one
// after the fact. The theme colour is the void token, not a hand-picked
// approximation of it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#04060a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* React 18 hoists these into <head>. Three faces carry the
            first viewport — prose, display, mono — so they are the
            three that get a head start; the rest stream in behind
            font-display: swap. */}
        <link
          rel="preload"
          href="/fonts/inter-latin-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/space-grotesk-latin-600.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/dm-mono-latin-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Structured data is restricted to what is established: the
            site's own name, origin and description. No organisation
            record, address or founder — those are UNKNOWN in the
            register, and schema is not exempt from the contract. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: COMPANY.name,
              url: SITE_URL,
              description: COMPANY.supporting,
            }),
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {/* The aura field. The ground is a light field, not a colour:
            three blooms on the golden reciprocals, a photographic
            falloff, and the grain plate that keeps a near-black
            gradient from banding on an 8-bit panel. Pure CSS and
            aria-hidden — it carries no information a screen reader
            should read, and it never intercepts a pointer. */}
        <div className="aura" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
