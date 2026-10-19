import { SiteHeader } from '@/components/site-header';
import { TenderBoard } from '@/components/tender-board';
import { getMarketTenders } from '@/lib/tender-repository';

export const metadata = {
  title: 'Tender Board — APT-LABS',
  description: 'Community infrastructure assets with transparent build cost, capital allocation, and modeled yield.',
};

export default async function TendersPage() {
  const tenders = await getMarketTenders();
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="page-intro board-intro">
        <p className="eyebrow"><span className="section-index">01</span> Capital meets community infrastructure</p>
        <h1>The Asset Register.</h1>
        <p>Each Tender is an execution node: a defined asset, an itemized build cost, a crew, and an economic model whose assumptions are visible. Illustrative scenarios are marked; published work requires an authorized issuer and complete crew.</p>
      </section>
      <section aria-label="Open tenders" className="board-section">
        <TenderBoard tenders={tenders} />
      </section>
      <footer className="page-footer"><span>APT-LABS / SOVEREIGN ASSET REGISTER</span><span>Yield is modeled, not realized · individual capital intent remains private</span></footer>
    </main>
  );
}
