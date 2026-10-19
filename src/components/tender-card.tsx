import Link from 'next/link';
import { ArrowUpRight, Compass, GraduationCap, Leaf, Radio, Sun } from 'lucide-react';
import { categoryLabels, formatMoney } from '@/lib/tender-data';
import { capitalAllocationState, capitalEfficiencyPercent } from '@/lib/tender';
import type { Tender } from '@/lib/tender';

const icons = {
  education: GraduationCap,
  energy: Sun,
  media: Radio,
  agriculture: Leaf,
  infrastructure: Compass,
  software: Compass,
} as const;

export function TenderCard({ tender, guest = false }: { tender: Tender; guest?: boolean }) {
  const dossierHref = `/tenders/${tender.slug}${guest ? '?mode=guest' : ''}`;
  const Icon = icons[tender.category];
  const signaledPercent = tender.fundingTargetMinor > 0
    ? Math.min(100, Math.floor(tender.currentSignaledAmountMinor / tender.fundingTargetMinor * 100))
    : 0;
  const efficiency = capitalEfficiencyPercent(tender);
  const allocationState = capitalAllocationState(tender);
  const allocationNote = {
    unfunded: 'No capital intent recorded',
    soft_committed: 'Non-binding intent · not settled',
    awaiting_settlement: 'Target signaled · awaiting offline settlement verification',
    partially_settled: 'Partially settled offline · balance outstanding',
    fully_capitalized: 'Fully capitalized · verified offline',
  }[allocationState];
  return (
    <article className="tender-card">
      <div className="tender-card-top">
        <span className="category-icon"><Icon aria-hidden="true" size={17} /></span>
        <span className="eyebrow">{categoryLabels[tender.category]}</span>
        {tender.isIllustrative && <span className="demo-chip">Illustrative</span>}
      </div>
      <h3><Link href={dossierHref}>{tender.assetName}</Link></h3>
      <p className="tender-summary">{tender.summary}</p>
      <p className="tender-location">{tender.issuer} <span>·</span> {tender.location}</p>
      <div className="quote-pair asset-economics-compact">
        <div><span>Asset build cost</span><strong>{formatMoney(tender.assetBuildCostMinor, tender.currency)}</strong></div>
        <div><span>Projected annual yield</span><strong>{tender.projectedAnnualYieldMinor === null ? 'Not modeled' : formatMoney(tender.projectedAnnualYieldMinor, tender.currency)}</strong></div>
        <div><span>Capital efficiency</span><strong className="saved-value">{efficiency === null ? 'Evidence pending' : `${efficiency}% / year`}</strong></div>
      </div>
      <div className="funding-line capital-signal-line">
        <div className="funding-label"><span>Capital intent · non-binding</span><strong>{signaledPercent}% signaled</strong></div>
        <div aria-label={`${signaledPercent}% of the capital target signaled; no funds are held`} className="funding-track" role="img">
          <span style={{ width: `${signaledPercent}%` }} />
        </div>
        <small>{tender.isIllustrative ? 'Scenario only · no live capital signal' : allocationNote}</small>
      </div>
      <Link className="card-link" href={dossierHref}>
        Inspect Asset <ArrowUpRight aria-hidden="true" size={15} />
      </Link>
    </article>
  );
}
