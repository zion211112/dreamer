import Link from "next/link";
import { COMPANY } from "@/lib/system";

/**
 * Public company shell. Products lead; infrastructure and evidence
 * explain how they are designed and what is established.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="company-site">
      <header className="company-header">
        <Link href="/" className="company-brand" aria-label="APT-LABS home">
          <span className="company-brand-mark" aria-hidden="true" />
          <span>APT-LABS</span>
        </Link>
        <nav className="company-nav" aria-label="Main navigation">
          <Link href="/#portfolio">Portfolio</Link>
          <Link href="/stack">Infrastructure</Link>
          <Link href="/evidence">Evidence</Link>
        </nav>
        <a
          className="company-contact"
          href={`mailto:${COMPANY.contact.email}`}
          aria-label={`Email APT-LABS at ${COMPANY.contact.email}`}
        >
          Email APT-LABS <span aria-hidden="true">↗</span>
        </a>
      </header>
      <main className="company-main" id="main-content">{children}</main>
      <footer className="company-footer">
        <Link href="/">APT-LABS</Link>
        <div className="company-footer-contact">
          <a href={`mailto:${COMPANY.contact.email}`}>{COMPANY.contact.email}</a>
          <span>{COMPANY.contact.note}</span>
        </div>
        <span>{COMPANY.kind}</span>
        <Link href="/lattice">System map <span aria-hidden="true">↗</span></Link>
      </footer>
    </div>
  );
}