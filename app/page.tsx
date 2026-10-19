import Link from 'next/link';
import { ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { TenderCard } from '@/components/tender-card';
import { formatMoney } from '@/lib/tender-data';
import { getMarketTenders } from '@/lib/tender-repository';
import { getWorkspaceContext } from '@/lib/workspace-access';
import { capitalEfficiencyPercent } from '@/lib/tender';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const workspace = await getWorkspaceContext();
  if (workspace.authenticated) {
    const params = new URLSearchParams({ context: workspace.defaultContextKey, view: 'demand' });
    redirect(`/workspace?${params.toString()}`);
  }

  const tenders = await getMarketTenders();
  const featured = tenders.find(tender => tender.slug === 'school-console');
  const marketSelection = tenders.filter(tender => tender.slug !== 'school-console').slice(0, 3);
  const efficiency = featured ? capitalEfficiencyPercent(featured) : null;

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow hero-kicker"><span className="signal-dot" /> APT-LABS / SOVEREIGN ASSET ENGINE</p>
          <h1>Capital gets a blueprint.<br /><em>{' '}Communities get an engine.</em></h1>
          <p className="hero-intro">
            We turn shared needs into durable infrastructure—priced in the open, built by accountable crews, and recorded when the work is verified. The revolution is less slogan, more serviceable pump.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/tenders">Explore the asset market <ArrowRight aria-hidden="true" size={16} /></Link>
            <Link className="text-link" href="/roll">Inspect the Roll <ArrowUpRight aria-hidden="true" size={15} /></Link>
          </div>
          <div className="hero-roles" aria-label="The sovereign asset loop">
            <span><b>01</b> Need</span><i aria-hidden="true" />
            <span><b>02</b> Capital</span><i aria-hidden="true" />
            <span><b>03</b> Build</span><i aria-hidden="true" />
            <span><b>04</b> Proof</span>
          </div>
        </div>
        <div aria-label="Illustrative sovereign asset economics" className="hero-ledger">
          <div className="ledger-header">
            <span className="eyebrow">ASSET DOSSIER / 001</span>
            <span className="status-tag">{featured?.isIllustrative ? 'SCENARIO / ILLUSTRATIVE' : 'PUBLISHED ASSET'}</span>
          </div>
          <div className="ledger-title">
            <span className="ledger-mark">A/01</span>
            <div><h2>{featured?.assetName ?? 'Community infrastructure'}</h2><p>{featured?.category ?? 'Asset'} · {featured?.location ?? 'Local execution node'}</p></div>
            <MoveUpRight aria-hidden="true" className="ledger-arrow" size={17} />
          </div>
          <div className="ledger-ruler"><span>CAPITAL EFFICIENCY / YEAR 01</span><i /></div>
          <div className="ledger-quote"><span>Asset build cost</span><strong>{featured ? formatMoney(featured.assetBuildCostMinor, featured.currency) : '—'}</strong></div>
          <div className="ledger-quote"><span>Projected annual yield</span><strong>{featured?.projectedAnnualYieldMinor !== null && featured ? formatMoney(featured.projectedAnnualYieldMinor, featured.currency) : 'Model pending'}</strong></div>
          <div className="ledger-savings"><span>Yield / build cost</span><strong>{efficiency === null ? 'Not modeled' : `${efficiency}% scenario`}</strong></div>
          <p className="ledger-disclaimer">{featured?.economicModelNote ?? 'A modeled return is not realized revenue. This profile requires an evidence-backed operating model.'} {featured?.isIllustrative ? 'Illustrative scenario only; no live asset or cash flow is claimed.' : ''}</p>
          <Link className="ledger-open" href={featured ? `/tenders/${featured.slug}` : '/tenders'}>Inspect the asset profile <ArrowUpRight aria-hidden="true" size={15} /></Link>
        </div>
        <div aria-hidden="true" className="hero-index">APT / MARKET <span>—</span> 001</div>
      </section>

      <section aria-labelledby="market-preview-title" className="market-preview">
        <div className="section-heading">
          <div><p className="eyebrow">Execution nodes · Community infrastructure</p><h2 id="market-preview-title">Build what keeps value working here.</h2></div>
          <Link className="text-link" href="/tenders">Explore the asset register <ArrowRight aria-hidden="true" size={15} /></Link>
        </div>
        <div className="preview-grid">{marketSelection.map(tender => <TenderCard key={tender.id} tender={tender} />)}</div>
      </section>

      <section className="console-callout">
        <div className="console-callout-index">PRODUCT / 01</div>
        <div>
          <p className="eyebrow">One build among many</p>
          <h2>A useful tool at the gate.<br /><span>A school’s need can become infrastructure.</span></h2>
          <p>The School Console helps with the school week on this device. A school leader can separately prepare an asset Tender through the authorized publication flow; student records stay local.</p>
        </div>
        <div className="console-callout-actions">
          <Link className="button button-outline" href="/console">Enter the Console <ArrowUpRight aria-hidden="true" size={15} /></Link>
          <Link className="text-link" href={featured ? `/tenders/${featured.slug}` : '/tenders'}>See its Tender <ArrowRight aria-hidden="true" size={14} /></Link>
        </div>
      </section>

      <section className="method-strip" aria-label="How the Tender model works">
        <article><span>01 / SURFACE THE NEED</span><h3>A real asset. A legible brief.</h3><p>Communities define the infrastructure they need and the people it will serve.</p></article>
        <article><span>02 / ALLOCATE CAPITAL</span><h3>Cost, crew, yield assumptions.</h3><p>An itemized build plan makes capital allocation and local participation inspectable.</p></article>
        <article><span>03 / PROVE THE WORK</span><h3>Anchor signs. The Roll remembers.</h3><p>Completion is an accountable state transition—not a claim in a pitch deck.</p></article>
      </section>

      <section aria-labelledby="participants-title" className="participants-section">
        <div className="participants-heading"><p className="eyebrow">One engine · Many hands</p><h2 id="participants-title">Company form. Community purpose.</h2><p>APT-LABS uses the discipline of capital allocation to build infrastructure people can maintain, govern, and use. Public assets and verified work stay inspectable; permissions remain tied to real relationships.</p></div>
        <div className="participants-grid">
          <article><span>CAPITAL / 01</span><h3>Make allocation inspectable.</h3><p>See asset build cost, modeled yield, local retention, crew allocation, and which assumptions still need evidence.</p><Link className="text-link" href="/tenders">Explore asset dossiers <ArrowRight size={14} /></Link></article>
          <article><span>COMMONS / 02</span><h3>Knowledge travels with work.</h3><p>Browse maker activity and an inspectable library of resources with provenance and license labels.</p><Link className="text-link" href="/commons">Enter the Commons <ArrowRight size={14} /></Link></article>
          <article><span>PROOF / 03</span><h3>Follow what is verified.</h3><p>Only completed deployments signed by the assigned Anchor enter the immutable Roll.</p><Link className="text-link" href="/roll">Read the Roll <ArrowRight size={14} /></Link></article>
        </div>
      </section>

      <footer className="site-footer">
        <Link className="wordmark footer-wordmark" href="/"><span aria-hidden="true" className="wordmark-symbol">A</span><span>APT<span className="wordmark-dash">—</span>LABS</span></Link>
        <p>For the people, by the people—built to keep working.</p>
        <nav aria-label="Footer navigation"><Link href="/tenders">Assets</Link><Link href="/commons">Commons</Link><Link href="/roll">Roll</Link><Link href="/console">School Console</Link></nav>
        <span className="footer-note">Modeled yield is not realized revenue. Illustrative records are labeled. No capital is held by this platform.</span>
      </footer>
    </main>
  );
}
