import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "APT-LABS — Hire verified youth. Proof, not promises.",
  description:
    "The APT-LABS ledger: registered youth by trade and town, community-voted tasks, fast hiring for pilot schools. Lose your certificate? We kept the hash.",
  keywords: ["APT-LABS", "youth jobs", "skills ledger", "Kenya schools", "verify certificate"]
};

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white text-sm">◉</span>
          APT-LABS
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/ledger" className="hover:text-ink transition">Ledger</Link>
          <Link href="/work" className="hover:text-ink transition">Work</Link>
          <Link href="/work#hire" className="rounded-full bg-ink px-4 py-2 text-white text-[13px] hover:bg-river transition">
            Post work
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">
        <Nav />
        {children}
        <footer className="border-t border-black/5">
          <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row justify-between gap-3 text-sm text-muted">
            <span>APT-LABS · Kirinyaga, Kenya</span>
            <span className="flex gap-5">
              <Link href="/ledger" className="hover:text-ink">Ledger</Link>
              <Link href="/work" className="hover:text-ink">Work</Link>
            </span>
            <span>Proof of work, not promises.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
