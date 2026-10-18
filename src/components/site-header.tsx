import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link aria-label="APT-LABS home" className="wordmark" href="/">
        <span aria-hidden="true" className="wordmark-symbol">A</span>
        <span>APT<span className="wordmark-dash">—</span>LABS</span>
      </Link>
      <nav aria-label="Main navigation" className="site-nav">
        <Link href="/tenders">Tender board</Link>
        <Link href="/roll">The Roll</Link>
        <Link href="/console">School Console</Link>
      </nav>
      <Link className="header-issue" href="/console?role=principal#issue-tender">
        Issue a need <ArrowUpRight aria-hidden="true" size={14} />
      </Link>
    </header>
  );
}
