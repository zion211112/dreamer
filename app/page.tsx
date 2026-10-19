import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Boxes, Orbit, UsersRound } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { TenderCard } from '@/components/tender-card';
import { getMarketTenders } from '@/lib/tender-repository';
import { getWorkspaceContext } from '@/lib/workspace-access';

export default async function HomePage() {
  const [workspace, tenders] = await Promise.all([getWorkspaceContext(), getMarketTenders()]);
  const featured = tenders.find(tender => tender.slug === 'school-console');
  const portfolio = tenders.slice(0, 3);

  return (
    <main className="site-shell frontdoor-shell">
      <SiteHeader />
      <section className="frontdoor-hero">
        <div className="frontdoor-copy">
          <p className="eyebrow frontdoor-kicker"><span className="signal-dot" /> APT-LABS / SOVEREIGN COORDINATION ENGINE</p>
          <h1>Capital has a place<br />to <em>land.</em></h1>
          <p className="frontdoor-lede">Assets make the work legible. The Commons finds the team. The Roll keeps the proof.</p>
          <p className="frontdoor-body">A small, serious network for turning African infrastructure ideas into assets that can be built, measured, and remembered.</p>
          <div className="frontdoor-actions">
            <Link className="button button-primary" href="/tenders">Explore Assets <ArrowRight aria-hidden="true" size={15} /></Link>
            <Link className="text-link" href="/sign-in">Enter the studio <ArrowUpRight aria-hidden="true" size={14} /></Link>
          </div>
          <div className="frontdoor-coordinate"><span>00° / 00′ / LOCAL BY DESIGN</span><span>PROTOTYPE FIELD GUIDE · 001</span></div>
        </div>
        <div className="coordination-map" aria-label="Asset, Commons and Roll work together">
          <div className="map-coordinate map-coordinate-top">FIELD NOTE 001 — THE LOOP</div>
          <div className="map-lines" aria-hidden="true"><i /><i /><i /></div>
          <div className="map-node map-node-asset"><Boxes aria-hidden="true" size={19} /><span>01 / ASSET</span><strong>Back the build.</strong><small>Capital · BOM · yield model</small></div>
          <div className="map-node map-node-commons"><UsersRound aria-hidden="true" size={19} /><span>02 / COMMONS</span><strong>Find your people.</strong><small>Roles · skills · applications</small></div>
          <div className="map-node map-node-roll"><BadgeCheck aria-hidden="true" size={19} /><span>03 / ROLL</span><strong>Keep the proof.</strong><small>Deployment · capability</small></div>
          <div className="map-center"><Orbit aria-hidden="true" size={21} /><span>APT</span><small>COORDINATE</small></div>
          <div className="map-coordinate map-coordinate-bottom">A CLOSED LOOP, BUILT IN THE OPEN <ArrowDownRight aria-hidden="true" size={13} /></div>
          <div className="map-stamp">DEMO<br />PROTOTYPE</div>
        </div>
      </section>

      <section aria-labelledby="asset-one-title" className="asset-one-band">
        <div className="asset-one-index"><span>FLAGSHIP / ASSET 001</span><span>SOFTWARE · LOCAL-FIRST</span></div>
        <div className="asset-one-main">
          <div>
            <p className="eyebrow">THE FIRST BUILD IN THE PORTFOLIO</p>
            <h2 id="asset-one-title">School Console</h2>
            <p>A practical, device-local school tool—and an early test of how useful software can enter the Asset network without exporting school records.</p>
          </div>
          <div className="asset-one-actions">
            <Link className="button button-primary" href={featured ? `/tenders/${featured.slug}` : '/tenders'}>Inspect Asset 001 <ArrowUpRight aria-hidden="true" size={15} /></Link>
            <span>The teacher tool stays separate and local.</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="portfolio-heading" className="frontdoor-portfolio">
        <div className="section-heading">
          <div><p className="eyebrow">01 / ASSETS · OPPORTUNITY WITH A BLUEPRINT</p><h2 id="portfolio-heading">Browse the work worth doing.</h2></div>
          <Link className="text-link" href="/tenders">Open Asset register <ArrowRight aria-hidden="true" size={14} /></Link>
        </div>
        <div className="preview-grid">{portfolio.map(tender => <TenderCard key={tender.id} tender={tender} />)}</div>
        <p className="demo-boundary">Scenario records are labeled. Projected yield is a model—not a return. Capital Intent is not payment or escrow.</p>
      </section>

      <section className="frontdoor-pillars" aria-label="The network pillars">
        <article><span>02 / PEOPLE</span><h3>The Commons is where a crew starts.</h3><p>Asset-linked roles connect builders and founders around a defined piece of work—not an endless feed.</p><Link href="/commons/opportunities">Find opportunities <ArrowRight aria-hidden="true" size={13} /></Link></article>
        <article><span>03 / PROOF</span><h3>The Roll remembers the hands.</h3><p>Anchor-verified deployments are the source of capability proof. No credential is minted from a profile claim.</p><Link href="/roll">Read the public Roll <ArrowRight aria-hidden="true" size={13} /></Link></article>
        <article><span>THE WORKSHOP / TRY IT</span><h3>Walk the prototype first.</h3><p>Enter with no account. Guest mode is isolated from live applications, capital signals, and Roll records.</p><Link href="/workspace?mode=guest&view=assets">Try the studio <ArrowRight aria-hidden="true" size={13} /></Link></article>
      </section>

      <footer className="site-footer frontdoor-footer">
        <Link className="wordmark footer-wordmark" href="/"><span aria-hidden="true" className="wordmark-symbol">A</span><span>APT<span className="wordmark-dash">—</span>LABS</span></Link>
        <p>For the people, by the people—built with care.</p>
        <nav aria-label="Footer navigation"><Link href="/tenders">Assets</Link><Link href="/commons">Commons</Link><Link href="/roll">Roll</Link><Link href="/sign-in">{workspace.authenticated ? 'Workspace' : 'Sign in'}</Link></nav>
      </footer>
    </main>
  );
}
