import Link from "next/link";
import { Nav } from "../../components/Nav";

// Site chrome: the sticky Nav up top, the hairline footer at the bottom.
// The console (app/(console)) deliberately skips this group so it can own
// the full viewport like a real app.
// All gates removed: the app is open — no paywall wraps these pages.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Nav />
      <div id="main-content">{children}</div>
      <footer className="border-t border-ivory/10 bg-void">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-3 px-6 py-10 text-sm text-ivory/45 sm:flex-row sm:items-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
            APT-LABS · Kirinyaga, Kenya
          </span>
          <span className="flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/" className="min-h-11 py-3 transition-colors hover:text-ivory">Home</Link>
            <Link href="/ledger" className="min-h-11 py-3 transition-colors hover:text-ivory">Ledger</Link>
            <Link href="/contact" className="min-h-11 py-3 transition-colors hover:text-ivory">Contact</Link>
          </span>
        </div>
      </footer>
    </>
  );
}