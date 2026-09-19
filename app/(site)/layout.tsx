import Link from "next/link";
import { Nav } from "../../components/Nav";

// Site chrome: the sticky Nav up top, the hairline footer at the bottom.
// The console (app/(console)) deliberately skips this group so it can own
// the full viewport like a real app.
// All gates removed: the app is open — no paywall wraps these pages.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <footer className="border-t border-white/10 bg-[#0a0d26]">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-3 px-6 py-10 text-sm text-white/45 sm:flex-row sm:items-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
            APT-LABS · Kirinyaga, Kenya
          </span>
          <span className="flex gap-6">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <Link href="/ledger" className="transition-colors hover:text-white">Ledger</Link>
            <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
          </span>
        </div>
      </footer>
    </>
  );
}