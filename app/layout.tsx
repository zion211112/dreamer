import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "APT-LABS — Your learning has a receipt",
  description:
    "Osawi Ledger: proof of learning, skills and work for youth in Kirinyaga. For partners, schools and donors. No unicorns.",
  keywords: ["APT-LABS", "Osawi Ledger", "Kenya", "education", "partners", "donate"]
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
          <Link href="/papers" className="hover:text-ink transition">Papers</Link>
          <Link href="/community" className="hover:text-ink transition">Community</Link>
          <Link href="/#partners" className="hidden sm:inline hover:text-ink transition">Partners</Link>
          <Link href="/#donate" className="rounded-full bg-ink px-4 py-2 text-white text-[13px] hover:bg-river transition">
            Donate
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
          <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted">
            <span>APT-LABS · Osawi · Kirinyaga 2026 — no unicorns, only goats that read.</span>
            <span>Osawi in one line: feed, power, teach, own — together.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
