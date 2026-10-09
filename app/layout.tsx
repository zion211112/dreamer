import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

/* Font loading with variable font support */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "APT-LABS — Locally Owned Institutional Infrastructure Systems",
    template: "%s | APT-LABS",
  },
  description:
    "APT-LABS builds locally owned institutional infrastructure systems. Lower recurring operational cost, reduced downtime, easier repair and maintenance, better operational visibility, improved institutional workflows, locally maintainable capability, documented technical knowledge, measurable performance, repeatable infrastructure.",
  keywords: [
    "institutional infrastructure",
    "local-first software",
    "school management system",
    "data sovereignty",
    "offline-first",
    "Kenya",
    "Kirinyaga",
  ],
  authors: [{ name: "APT-LABS" }],
  creator: "APT-LABS",
  publisher: "APT-LABS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aptlabs.ke",
    siteName: "APT-LABS",
    title: "APT-LABS — Locally Owned Institutional Infrastructure Systems",
    description:
      "Build infrastructure that stays yours. Lower costs, reduced downtime, local maintainability.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "APT-LABS — Sovereign Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APT-LABS — Locally Owned Institutional Infrastructure",
    description: "Build infrastructure that stays yours.",
    images: ["/og-image.png"],
    creator: "@aptlabske",
  },
  verification: {
    google: "google-site-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-ui antialiased">
        {children}
      </body>
    </html>
  );
}