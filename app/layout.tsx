import type { Metadata } from "next";
import "./globals.css";

// Fonts load at runtime, not build time: the ledger is local-first, so a
// blocked network degrades to system fonts instead of breaking the build.
const fontsHref =
  "https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=Inter:wght@100..900&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:wght@600;700&display=swap";

export const metadata: Metadata = {
  title: "APT-LABS — We're making a list.",
  description:
    "The APT-LABS ledger: everyone in Kirinyaga who can actually do things. Build capacity, share work, and keep a trusted roll without the noise.",
  keywords: ["APT-LABS", "Kirinyaga", "skills ledger", "teachers", "youth jobs"]
};

// Bare shell. The site chrome (Nav + footer) lives in the (site) group
// layout so app-style routes like /console can own the full viewport.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontsHref} rel="stylesheet" />
      </head>
      <body className="bg-obsidian text-ivory font-body antialiased">{children}</body>
    </html>
  );
}
