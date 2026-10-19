import { SiteHeader } from '@/components/site-header';
import { TenderBoard } from '@/components/tender-board';
import { getMarketTenders } from '@/lib/tender-repository';

export const metadata = {
  title: 'Asset Register — APT-LABS',
  description: 'Community infrastructure assets with transparent build cost, capital allocation, and modeled yield.',
};

export default async function TendersPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const guest = mode === 'guest';
  const tenders = await getMarketTenders();
  return (
    <main className="site-shell">
      <SiteHeader guest={guest} />
      <section className="page-intro board-intro">
        <p className="eyebrow"><span className="section-index">01</span> People invest in assets. Teams build from the Commons.</p>
        <h1>The Asset Register.</h1>
        <p>Each Asset is an execution node: a defined build, its cost and yield model, and the team accountable for delivery. Illustrative scenarios are marked; published work requires an authorized issuer and assigned crew.</p>
      </section>
      <section aria-label="Investable assets" className="board-section">
        <TenderBoard guest={guest} tenders={tenders} />
      </section>
      <footer className="page-footer"><span>APT-LABS / SOVEREIGN ASSET REGISTER</span><span>Yield is modeled, not realized · individual capital intent remains private</span></footer>
    </main>
  );
}
