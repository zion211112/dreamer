import Link from "next/link";
import { Nav } from "../../components/Nav";
import "../site.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <div className="site-content">
        {children}
      </div>
      <footer className="site-footer" role="contentinfo">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <span className="site-footer-mark" aria-hidden="true">A</span>
            <span className="site-footer-name">APT-LABS</span>
            <span className="site-footer-loc">Kirinyaga, Kenya</span>
          </div>
          <nav aria-label="Footer" className="site-footer-links">
            <Link href="/" className="site-footer-link">Home</Link>
            <Link href="/ledger" className="site-footer-link">Ledger</Link>
            <Link href="/benben" className="site-footer-link">Floor</Link>
            <Link href="/console" className="site-footer-link">Console</Link>
            <Link href="/contact" className="site-footer-link">Contact</Link>
          </nav>
          <p className="site-footer-copy">
            A public record of work, skill, and trust.
            Built open. Held local.
          </p>
        </div>
      </footer>
    </>
  );
}

