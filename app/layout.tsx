import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
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

// Light-only, declared in metadata as well as CSS: the UA is told the
// scheme before first paint, so mobile browser chrome matches the paper
// ground instead of guessing.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#f6f6f4",
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
        {children}
      </body>
    </html>
  );
}
