import { COMPANY } from "../../lib/company";
import { SITE_URL } from "../../lib/site";
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: COMPANY.name,
            url: SITE_URL,
            description: COMPANY.oneSentence,
            email: COMPANY.contact.email,
            telephone: COMPANY.contact.whatsapp,
          }),
        }}
      />
      <Nav />
      <div className="site-content">
        {children}
      </div>
      <footer className="site-footer" role="contentinfo">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <span className="site-footer-mark" aria-hidden="true">A</span>
            <span className="site-footer-name">{COMPANY.name}</span>
            <span className="site-footer-loc">{COMPANY.geography.text}</span>
          </div>
          <nav aria-label="Footer" className="site-footer-links">
            <Link href="/" className="site-footer-link">Home</Link>
            <Link href="/about" className="site-footer-link">About</Link>
            <Link href="/evidence" className="site-footer-link">Evidence</Link>
            <Link href="/contact" className="site-footer-link">Contact</Link>
            <Link href="/console" className="site-footer-link">Console</Link>
          </nav>
          <p className="site-footer-copy">
            A quiet prototype, built to be owned, repaired and reproduced locally.
          </p>
        </div>
      </footer>
    </>
  );
}

