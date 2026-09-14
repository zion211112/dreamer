import Link from "next/link";
import { Nav } from "../../components/Nav";

// Site chrome: the sticky Nav up top, the hairline footer at the bottom.
// The console (app/(console)) deliberately skips this group so it can own
// the full viewport like a real app.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}