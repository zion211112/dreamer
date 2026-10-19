import Link from 'next/link';
import { ArrowRight, BadgeCheck, CircleDot, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { formatMoney } from '@/lib/tender-data';
import { getPublicRoll } from '@/lib/tender-repository';

export const metadata = {
  title: 'The Roll — APT-LABS',
  description: 'A public ledger of completed local builds, recorded only after Anchor sign-off.',
};

export default async function RollPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const guest = false;
  const records = await getPublicRoll();
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="page-intro roll-intro">
        <p className="eyebrow"><span className="section-index">03</span> Public proof of work</p>
        <h1>The Roll.</h1>
        <p>Not a promise wall. A permanent record of completed builds: the asset, consented crew names, build economics, Blueprint provenance, and the Anchor sign-off behind it.</p>
      </section>
      <section aria-label="Completed deployments" className="roll-ledger">
        <div className="roll-table-head"><span>ASSET / REFERENCE</span><span>BUILD COST</span><span>CREW / PROOF</span><span>BLUEPRINT</span></div>
        {records.length > 0 ? records.map(record => (
          <article className="roll-row" key={record.id}>
            <div><span className="roll-record-index">{record.id}</span><strong>{record.assetName}</strong><small>{record.tenderId}</small></div>
            <strong className="roll-build-cost">{formatMoney(record.assetBuildCostMinor, record.currency)}</strong>
            <div><span>{record.crew.map(member => member.displayName).join(' · ')}</span><small><BadgeCheck aria-hidden="true" size={12} /> Anchor sign-off recorded</small></div>
            <details className="roll-blueprint">
              <summary>View Blueprint <small>{record.blueprintHash.slice(0, 12)}…</small></summary>
              <div className="roll-blueprint-lines">
                {record.blueprintLines.map(line => <div key={line.id}>
                  <span>{line.item}<small>{line.quantity} {line.unit}</small></span>
                  <strong>{formatMoney(line.quantity * line.unitCostMinor, record.currency)}</strong>
                </div>)}
                <small>Blueprint {record.blueprintId} · SHA-256 {record.blueprintHash}</small>
              </div>
            </details>
          </article>
        )) : (
          <div className="roll-empty">
            <span className="roll-empty-mark"><CircleDot aria-hidden="true" size={20} /></span>
            <p className="eyebrow">The ledger is intentionally empty</p>
            <h2>No deployments claimed yet.</h2>
            <p>The public examples on the board are planning records, not completed work. A Tender appears here only after an assigned Anchor signs the active Blueprint and deployment is recorded.</p>
            <div className="proof-chain">
              <span><ShieldCheck aria-hidden="true" size={15} /> Crew access</span><i />
              <span>Anchor sign-off</span><i />
              <span>Atomic Roll record</span>
            </div>
            <Link className="text-link" href={guest ? '/tenders?mode=guest' : '/tenders'}>Review open Tenders <ArrowRight aria-hidden="true" size={14} /></Link>
          </div>
        )}
      </section>
      <section className="roll-method">
        <div><p className="eyebrow">The Roll rule</p><h2>What gets recorded, stays inspectable.</h2></div>
        <p>A deployed Tender carries a single immutable proof snapshot. The blueprint hash, crew, asset build cost, and sign-off travel together. Illustrative examples can never enter this ledger.</p>
      </section>
      <footer className="page-footer"><span>APT-LABS / PROOF LEDGER</span><span>{records.length.toString().padStart(2, '0')} verified deployments</span></footer>
    </main>
  );
}
