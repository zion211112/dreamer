import type { Metadata, Viewport } from "next";
import { COMPANY } from "../lib/company";
import { SITE_URL } from "../lib/site";
import "./globals.css";
// Self-hosted @font-face (bundled into the CSS graph — no manual <link>).
import "./fonts.css";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "APT-LABS — Locally owned institutional infrastructure.",
    template: "%s — APT-LABS",
  },
  description: COMPANY.description,
  keywords: ["institutional infrastructure", "offline-first software", "local ownership", "reproducible infrastructure"],
  openGraph: {
    type: "website",
    siteName: COMPANY.name,
    locale: "en_KE",
    title: "APT-LABS — Locally owned institutional infrastructure.",
    description: COMPANY.oneSentence,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "APT-LABS — Locally owned institutional infrastructure.",
    description: COMPANY.oneSentence,
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml", sizes: "any" },
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='4' fill='%23060708'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='16' font-weight='700' fill='%2314B8A6'>A</text></svg>",
    ],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  // Dark-only by design. Advertising a light theme the site never renders
  // sends the browser chrome a false signal.
  themeColor: "#060708",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload the face that renders first (body) to avoid a late FOUT.
            The @font-face rules ship in the bundled CSS (fonts.css). */}
        <link
          rel="preload"
          href="/fonts/inter-latin-400.woff2"
          as="font"
          type="font/woff2"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
