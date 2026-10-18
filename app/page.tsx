import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { TenderCard } from '@/components/tender-card';
import { formatMoney } from '@/lib/tender-data';
import { getMarketTenders } from '@/lib/tender-repository';

export default async function HomePage() {
  const tenders = await getMarketTenders();
  const featured = tenders.find(tender => tender.slug === 'school-console');
  const marketSelection = tenders.filter(tender => tender.slug !== 'school-console').slice(0, 3);

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow hero-kicker"><span className="signal-dot" /> A market for things worth making</p>
          <h1>Africa imports its hardware and its stories.<br /><em>{' '}We fund and build it locally.</em></h1>
          <p className="hero-intro">
            Open Tenders connect the people who need a thing, the capital to make it, and the crew who can build it. Every quote is visible. Every completed build earns its place on the Roll.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/tenders">View the Tender Board <ArrowRight aria-hidden="true" size={16} /></Link>
            <Link className="text-link" href="/roll">See how proof works <ArrowDownRight aria-hidden="true" size={15} /></Link>
          </div>
          <div className="hero-roles" aria-label="The Tender connects three groups">
            <span><b>01</b> Capital</span><i aria-hidden="true" />
            <span><b>02</b> Demand</span><i aria-hidden="true" />
            <span><b>03</b> Execution</span>
          </div>
        </div>
        <div aria-label="Illustrative Tender quote comparison" className="hero-ledger">
          <div className="ledger-header">
            <span className="eyebrow">Tender / 001</span>
            <span className="status-tag">{featured?.isIllustrative ? 'DEMO DATA' : 'MARKET LISTING'}</span>
          </div>
          <div className="ledger-title">
            <span className="ledger-mark">01</span>
            <div><h2>School Console</h2><p>Software · Nairobi, Kenya</p></div>
            <MoveUpRight aria-hidden="true" className="ledger-arrow" size={17} />
          </div>
          <div className="ledger-ruler"><span>THE MATH</span><i /></div>
          <div className="ledger-quote"><span>Imported alternative</span><strong className="import-quote">{featured ? formatMoney(featured.importQuoteMinor, featured.currency) : '—'}</strong></div>
          <div className="ledger-quote"><span>Local build estimate</span><strong>{featured ? formatMoney(featured.localBomMinor, featured.currency) : '—'}</strong></div>
          <div className="ledger-savings"><span>Potential import cost avoided</span><strong>{featured ? formatMoney(featured.importQuoteMinor - featured.localBomMinor, featured.currency) : '—'}</strong></div>
          <p className="ledger-disclaimer">{featured?.isIllustrative ? 'Illustrative planning figures. No funds collected; no completed deployment claimed.' : 'Listed quotes are planning figures. Verify suppliers before committing; this is not a payment account.'}</p>
          <Link className="ledger-open" href={featured ? `/tenders/${featured.slug}` : '/tenders'}>Open the Tender <ArrowUpRight aria-hidden="true" size={15} /></Link>
        </div>
        <div aria-hidden="true" className="hero-index">APT / MARKET <span>—</span> 001</div>
      </section>

      <section aria-labelledby="market-preview-title" className="market-preview">
        <div className="section-heading">
          <div><p className="eyebrow">Open calls · Multiple kinds of build</p><h2 id="market-preview-title">The board is the beginning.</h2></div>
          <Link className="text-link" href="/tenders">All open Tenders <ArrowRight aria-hidden="true" size={15} /></Link>
        </div>
        <div className="preview-grid">{marketSelection.map(tender => <TenderCard key={tender.id} tender={tender} />)}</div>
      </section>

      <section className="console-callout">
        <div className="console-callout-index">PRODUCT / 01</div>
        <div>
          <p className="eyebrow">One build among many</p>
          <h2>School Console is a Tender.<br /><span>And something a teacher can use today.</span></h2>
          <p>A local-first school utility for lesson work and transparent, rule-based marking. Its product build is on the Board; the Console itself stays in its own lane.</p>
        </div>
        <div className="console-callout-actions">
          <Link className="button button-outline" href="/console">Enter the Console <ArrowUpRight aria-hidden="true" size={15} /></Link>
          <Link className="text-link" href={featured ? `/tenders/${featured.slug}` : '/tenders'}>See its Tender <ArrowRight aria-hidden="true" size={14} /></Link>
        </div>
      </section>

      <section className="method-strip" aria-label="How the Tender model works">
        <article><span>01 / MAKE THE NEED VISIBLE</span><h3>A real thing. A clear brief.</h3><p>Schools, startups and communities publish what they need and why.</p></article>
        <article><span>02 / SHOW THE MATH</span><h3>Import beside local.</h3><p>A proposed bill of materials makes the local quote inspectable.</p></article>
        <article><span>03 / PROVE THE BUILD</span><h3>Anchor signs. Roll records.</h3><p>Completion is a state change with accountable sign-off, not a claim in a pitch deck.</p></article>
      </section>

      <section aria-labelledby="participants-title" className="participants-section">
        <div className="participants-heading"><p className="eyebrow">One public ledger · Different ways in</p><h2 id="participants-title">A Tender is where roles meet.</h2><p>Not every participant is a funder, and not every build is a school tool. The shared object is the work: a visible need, a local quote and a crew accountable for delivery.</p></div>
        <div className="participants-grid">
          <article><span>CAPITAL</span><h3>Back a build.</h3><p>Review the import/local comparison and start a conversation. This MVP does not collect pledges or move funds.</p><Link className="text-link" href="/tenders">Compare opportunities <ArrowRight size={14} /></Link></article>
          <article><span>DEMAND</span><h3>Make the need legible.</h3><p>Schools can draft a need in the Console. Other demand issuers require a verified organization account before shared publishing.</p><Link className="text-link" href="/console?role=principal#issue-tender">School Console <ArrowRight size={14} /></Link></article>
          <article><span>EXECUTION</span><h3>Build with evidence.</h3><p>Assigned Anchors, Builders and Apprentices move through a strict sequence; only a signed deployment enters the Roll.</p><Link className="text-link" href="/roll">See the proof rule <ArrowRight size={14} /></Link></article>
        </div>
      </section>

      <footer className="site-footer">
        <Link className="wordmark footer-wordmark" href="/"><span aria-hidden="true" className="wordmark-symbol">A</span><span>APT<span className="wordmark-dash">—</span>LABS</span></Link>
        <p>Local demand. Open numbers. Proof that stays.</p>
        <nav aria-label="Footer navigation"><Link href="/tenders">Market</Link><Link href="/roll">Roll</Link><Link href="/console">School Console</Link></nav>
        <span className="footer-note">Illustrative records are labeled. No payments move here.</span>
      </footer>
    </main>
  );
}
