import type { Metadata, Viewport } from "next";
import { Playfair_Display, JetBrains_Mono, Inter, Space_Grotesk, DM_Mono } from "next/font/google";
import { COMPANY } from "../lib/company";
import { SITE_URL } from "../lib/site";
import "./globals.css";


// Self-hosted, preloaded, subsetted — replaces the render-blocking CSS
// @import. Weights match the faces the site actually uses.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Site display system — self-hosted via next/font (no runtime font requests).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const dmmono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dmmono",
  display: "swap",
});

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
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='4' fill='%23060708'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='16' font-weight='700' fill='%2314B8A6'>A</text></svg>",
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
    <html
      lang="en"
      className={`${playfair.variable} ${jetbrains.variable} ${inter.variable} ${grotesk.variable} ${dmmono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
