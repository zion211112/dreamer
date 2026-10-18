import { SiteHeader } from '@/components/site-header';
import { TenderBoard } from '@/components/tender-board';
import { getMarketTenders } from '@/lib/tender-repository';

export const metadata = {
  title: 'Tender Board — APT-LABS',
  description: 'Open local-build opportunities with transparent import and local quotes.',
};

export default async function TendersPage() {
  const tenders = await getMarketTenders();
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="page-intro board-intro">
        <p className="eyebrow"><span className="section-index">01</span> Capital meets demand</p>
        <h1>The Tender Board.</h1>
        <p>Every call starts with an asset, an import quote, and a proposed local bill. Illustrative examples are marked; live school Tenders appear only after an authorized account assigns a complete crew.</p>
      </section>
      <section aria-label="Open tenders" className="board-section">
        <TenderBoard tenders={tenders} />
      </section>
      <footer className="page-footer"><span>APT-LABS / PUBLIC MARKET</span><span>Quotes in each Tender&apos;s own currency · no cross-currency comparisons</span></footer>
    </main>
  );
}
