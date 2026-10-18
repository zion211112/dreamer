import Link from 'next/link';
import { ArrowUpRight, Compass, GraduationCap, Leaf, Radio, Sun } from 'lucide-react';
import { categoryLabels, formatMoney } from '@/lib/tender-data';
import type { Tender } from '@/lib/tender';

const icons = {
  education: GraduationCap,
  energy: Sun,
  media: Radio,
  agriculture: Leaf,
  infrastructure: Compass,
  software: Compass,
} as const;

export function TenderCard({ tender }: { tender: Tender }) {
  const Icon = icons[tender.category];
  const funded = tender.fundingTargetMinor > 0
    ? Math.min(100, Math.floor(tender.funders.reduce((sum, funder) => sum + funder.amountMinor, 0) / tender.fundingTargetMinor * 100))
    : 0;
  const signalDescription = tender.funders.length === 0
    ? 'No funding signal recorded · no funds collected'
    : tender.funders.every(funder => funder.basis === 'illustrative')
      ? 'Illustrative interest only · no funds collected'
      : tender.funders.some(funder => funder.basis === 'illustrative')
        ? 'Includes illustrative interest · no funds collected'
        : 'Verified signals only · no payment processed';
  const savings = tender.importQuoteMinor - tender.localBomMinor;
  return (
    <article className="tender-card">
      <div className="tender-card-top">
        <span className="category-icon"><Icon aria-hidden="true" size={17} /></span>
        <span className="eyebrow">{categoryLabels[tender.category]}</span>
        {tender.isIllustrative && <span className="demo-chip">Illustrative</span>}
      </div>
      <h3><Link href={`/tenders/${tender.slug}`}>{tender.assetName}</Link></h3>
      <p className="tender-summary">{tender.summary}</p>
      <p className="tender-location">{tender.issuer} <span>·</span> {tender.location}</p>
      <div className="quote-pair">
        <div><span>Import quote</span><strong className="import-quote">{formatMoney(tender.importQuoteMinor, tender.currency)}</strong></div>
        <div><span>Local build</span><strong>{formatMoney(tender.localBomMinor, tender.currency)}</strong></div>
        <div><span>Potential saved</span><strong className="saved-value">{formatMoney(savings, tender.currency)}</strong></div>
      </div>
      <div className="funding-line">
        <div className="funding-label"><span>Funding signal</span><strong>{funded}%</strong></div>
        <div aria-label={`${funded}% of target represented by public funding signals`} className="funding-track" role="img">
          <span style={{ width: `${funded}%` }} />
        </div>
        <small>{signalDescription}</small>
      </div>
      <Link className="card-link" href={`/tenders/${tender.slug}`}>
        Read the Tender <ArrowUpRight aria-hidden="true" size={15} />
      </Link>
    </article>
  );
}
