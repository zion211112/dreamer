import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import Link from "next/link";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontsHref} rel="stylesheet" />
      </head>
      <body className="bg-obsidian text-ivory font-body antialiased">
        <Nav />
        {children}
        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row justify-between gap-3 text-sm text-muted">
            <span>APT-LABS · Kirinyaga, Kenya</span>
            <span className="flex gap-5">
              <Link href="/" className="hover:text-ivory">Home</Link>
              <Link href="/contact" className="hover:text-ivory">Contact</Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
