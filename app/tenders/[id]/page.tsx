import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Circle, FileText, Users } from 'lucide-react';
import { FundingIntentDialog } from '@/components/funding-intent-dialog';
import { SiteHeader } from '@/components/site-header';
import { fundedPercent } from '@/lib/tender';
import { categoryLabels, formatMoney } from '@/lib/tender-data';
import { getMarketTenderBySlug } from '@/lib/tender-repository';

export default async function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tender = await getMarketTenderBySlug(id);
  if (!tender) notFound();
  const savings = tender.importQuoteMinor - tender.localBomMinor;
  const savingsPercent = tender.importQuoteMinor > 0 ? Math.round(savings / tender.importQuoteMinor * 100) : 0;
  const milestones = ['Materials', 'Fabrication', 'Anchor sign-off', 'Deployed'];
  const completed = tender.status === 'deployed'
    ? milestones.length
    : tender.status === 'anchor_signed'
      ? 3
      : tender.status === 'fabrication'
        ? 2
        : tender.status === 'materials'
          ? 1
          : 0;
  const progress = fundedPercent(tender);
  const statusLabel = {
    draft: 'Draft',
    open: 'Open for review',
    materials: 'Materials in progress',
    fabrication: 'Fabrication',
    anchor_signed: 'Anchor signed',
    deployed: 'Deployed',
    cancelled: 'Cancelled',
  }[tender.status];

  return (
    <main className="site-shell">
      <SiteHeader />
      <div className="detail-back"><Link href="/tenders"><ArrowLeft aria-hidden="true" size={14} /> Back to the board</Link><span>PUBLIC TENDER / {tender.id.toUpperCase()}</span></div>
      <div className="detail-layout">
        <article className="detail-main">
          <header className="detail-heading">
            <div className="detail-kickers"><span className="eyebrow">{categoryLabels[tender.category]}</span>{tender.isIllustrative && <span className="demo-chip">Illustrative example</span>}</div>
            <h1>{tender.assetName}</h1>
            <p className="detail-summary">{tender.summary}</p>
            <p className="detail-byline">{tender.issuer} <span>·</span> {tender.location}</p>
          </header>

          <section aria-labelledby="detail-math-title" className="detail-section">
            <div className="detail-section-head"><div><p className="eyebrow">01 / The comparison</p><h2 id="detail-math-title">Make the import cost visible.</h2></div><span className="currency-tag">{tender.currency}</span></div>
            <div className="math-table">
              <div><span>Imported alternative</span><strong className="import-quote">{formatMoney(tender.importQuoteMinor, tender.currency)}</strong></div>
              <div><span>Proposed local build</span><strong>{formatMoney(tender.localBomMinor, tender.currency)}</strong></div>
              <div className="math-highlight"><span>Estimated difference · {savingsPercent}%</span><strong>{formatMoney(savings, tender.currency)}</strong></div>
            </div>
            <p className="fine-print">Planning estimate in {tender.currency}; not a verified saving, payment quote, or guarantee. Verify supplier pricing before committing.</p>
          </section>

          <section aria-labelledby="detail-brief-title" className="detail-section">
            <p className="eyebrow">02 / The brief</p><h2 id="detail-brief-title">What is being built.</h2>
            <p className="prose-copy">{tender.description}</p>
          </section>

          <section aria-labelledby="detail-blueprint-title" className="detail-section">
            <div className="detail-section-head"><div><p className="eyebrow">03 / Version {tender.blueprint.version}</p><h2 id="detail-blueprint-title">Blueprint / proposed bill.</h2></div><FileText aria-hidden="true" className="section-mark" size={19} /></div>
            <div className="bom-table">
              {tender.blueprint.lines.map((line, index) => (
                <div className="bom-row" key={line.id}>
                  <span className="bom-number">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="bom-item">{line.item}<small>{line.quantity} {line.unit}{line.quantity > 1 ? 's' : ''}</small></span>
                  <strong>{formatMoney(line.quantity * line.unitCostMinor, tender.currency)}</strong>
                </div>
              ))}
              <div className="bom-total"><span>Proposed local BOM</span><strong>{formatMoney(tender.localBomMinor, tender.currency)}</strong></div>
            </div>
            <p className="fine-print">{tender.isIllustrative
              ? 'Illustrative line items; supplier availability and final quantities require local verification before fabrication.'
              : 'School-supplied itemized lines. Supplier availability and prices are not independently verified; confirm them before fabrication.'}</p>
          </section>

          <section aria-labelledby="detail-crew-title" className="detail-section">
            <div className="detail-section-head"><div><p className="eyebrow">04 / Responsible execution</p><h2 id="detail-crew-title">The proposed crew.</h2></div><Users aria-hidden="true" className="section-mark" size={19} /></div>
            <div className="crew-list">
              {tender.crew.map(member => (
                <div className="crew-row" key={member.id}>
                  <span className={`crew-role role-${member.role}`}>{member.role === 'apprentice' ? 'Youth' : member.role}</span>
                  <strong>{member.displayName}</strong>
                  <span>{member.organization}</span>
                </div>
              ))}
            </div>
            <p className="fine-print">{tender.isIllustrative ? 'Illustrative crew profiles. Assignment and identity are not verified until an authenticated organization confirms them.' : 'Assigned crew identities are access-controlled; public names appear only with each member’s consent.'}</p>
          </section>

          <section aria-labelledby="detail-progress-title" className="detail-section">
            <p className="eyebrow">05 / Build sequence</p><h2 id="detail-progress-title">Proof is a sequence, not a badge.</h2>
            <ol className="milestone-list">
              {milestones.map((step, index) => <li className={index < completed ? 'complete' : ''} key={step}>
                <span>{index < completed ? <BadgeCheck aria-hidden="true" size={13} /> : <Circle aria-hidden="true" size={8} />}</span>{step}
              </li>)}
            </ol>
            <p className="fine-print">{tender.isIllustrative ? 'This example has no deployed Roll record. A real Roll entry is created only after assigned-Anchor sign-off.' : 'Deployment and Roll proof appear only after the assigned Anchor signs the active Blueprint.'}</p>
          </section>
        </article>

        <aside className="detail-rail">
          <div className="rail-sticky">
            <p className="eyebrow">Capital / signal</p>
            <h2>{formatMoney(tender.fundingTargetMinor, tender.currency)}</h2>
            <p>{tender.isIllustrative ? 'Illustrative target · not a live funding account' : 'Proposed target · no funds collected in this product'}</p>
            <div className="rail-progress"><span style={{ width: `${progress}%` }} /></div>
            <div className="rail-progress-label"><span>Public funding signal</span><strong>{progress}%</strong></div>
            {tender.funders.length > 0 && <div className="funder-list">{tender.funders.map(row => <div key={row.id}><span>{row.funder}<small>{row.basis === 'illustrative' ? 'Illustrative only' : 'Independently verified signal'}</small></span><strong>{formatMoney(row.amountMinor, row.currency)}</strong></div>)}</div>}
            <FundingIntentDialog tender={tender} />
            <p className="rail-legal">Enquiry only. No pledge, allocation or transfer is recorded.</p>
            <div className="rail-meta"><span>ISSUER</span><strong>{tender.issuer}</strong><span>LOCATION</span><strong>{tender.location}</strong><span>STATUS</span><strong className="status-open"><i />{statusLabel}</strong></div>
            <Link className="rail-console-link" href="/console">See the School Console utility <span aria-hidden="true">↗</span></Link>
          </div>
        </aside>
      </div>
      <footer className="page-footer"><span>APT-LABS / TENDER DETAIL</span><span>Quotes are planning estimates unless explicitly verified.</span></footer>
    </main>
  );
}
