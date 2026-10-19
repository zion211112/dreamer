import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Circle, FileText, Users } from 'lucide-react';
import { CapitalIntentDialog } from '@/components/capital-intent-dialog';
import { SiteHeader } from '@/components/site-header';
import { capitalAllocationState, capitalEfficiencyPercent } from '@/lib/tender';
import { categoryLabels, formatMoney } from '@/lib/tender-data';
import { getMarketTenderBySlug } from '@/lib/tender-repository';
import { getWorkspaceContext } from '@/lib/workspace-access';

export default async function TenderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ id }, { mode }] = await Promise.all([params, searchParams]);
  const guest = mode === 'guest';
  const [tender, workspace] = await Promise.all([
    getMarketTenderBySlug(id),
    getWorkspaceContext(),
  ]);
  if (!tender) notFound();

  const efficiency = capitalEfficiencyPercent(tender);
  const signalPercent = tender.fundingTargetMinor > 0
    ? Math.min(100, Math.floor(tender.currentSignaledAmountMinor / tender.fundingTargetMinor * 100))
    : 0;
  const allocationState = capitalAllocationState(tender);
  const allocationLabel = {
    unfunded: 'Unfunded',
    soft_committed: 'Soft-committed intent',
    awaiting_settlement: 'Target signaled · settlement pending',
    partially_settled: 'Partially settled offline',
    fully_capitalized: 'Fully capitalized · verified offline',
  }[allocationState];
  const milestones = ['Capital verified', 'Materials', 'Fabrication', 'Anchor sign-off', 'Deployed'];
  const completed = tender.status === 'deployed'
    ? milestones.length
    : tender.status === 'anchor_signed'
      ? 4
      : tender.status === 'fabrication'
        ? 3
        : tender.status === 'materials'
          ? 2
          : allocationState === 'fully_capitalized'
            ? 1
            : 0;
  const statusLabel = {
    draft: 'Draft',
    open: allocationState === 'fully_capitalized' ? 'Capital verified · Assembly ready' : 'Capital allocation open',
    capitalized_pending_settlement: 'Target signaled · settlement pending',
    materials: 'Materials in progress',
    fabrication: 'Fabrication',
    anchor_signed: 'Anchor signed',
    deployed: 'Deployed',
    cancelled: 'Cancelled',
  }[tender.status];
  const crewTotal = tender.crewWageAllocationMinor
    ? Object.values(tender.crewWageAllocationMinor).reduce((sum, value) => sum + value, 0)
    : null;

  return (
    <main className="site-shell">
      <SiteHeader guest={guest} />
      <div className="detail-back"><Link href={guest ? '/tenders?mode=guest' : '/tenders'}><ArrowLeft aria-hidden="true" size={14} /> Back to the asset register</Link><span>ASSET DOSSIER / {tender.id.toUpperCase()}</span></div>
      <div className="detail-layout">
        <article className="detail-main">
          <header className="detail-heading">
            <div className="detail-kickers"><span className="eyebrow">{categoryLabels[tender.category]}</span>{tender.isIllustrative && <span className="demo-chip">Scenario / illustrative</span>}</div>
            <h1>{tender.assetName}</h1>
            <p className="detail-summary">{tender.summary}</p>
            <p className="detail-byline">{tender.issuer} <span>·</span> {tender.location}</p>
            <div className="asset-state-stamp"><span className="signal-dot" /> {statusLabel}</div>
          </header>

          {tender.status === 'capitalized_pending_settlement' && (
            <div className="capitalized-banner" role="status">
              <BadgeCheck aria-hidden="true" size={19} />
              <div><strong>Target reached. Awaiting offline settlement to authorize Assembly.</strong><span>Signals are expressions of intent, not funds held or transferred by this platform.</span></div>
            </div>
          )}

          <section aria-labelledby="asset-economics-title" className="detail-section asset-economics-section">
            <div className="detail-section-head">
              <div><p className="eyebrow">01 / Capital allocation &amp; yield profile</p><h2 id="asset-economics-title">Measure what the asset can return.</h2></div>
              <span className="currency-tag">{tender.currency}</span>
            </div>
            <div className="asset-economics-grid">
              <div className="asset-economics-primary"><span>ASSET BUILD COST</span><strong>{formatMoney(tender.assetBuildCostMinor, tender.currency)}</strong><small>Blueprint total · proposed capital requirement</small></div>
              <div><span>PROJECTED ANNUAL YIELD</span><strong>{tender.projectedAnnualYieldMinor === null ? 'Not modeled' : formatMoney(tender.projectedAnnualYieldMinor, tender.currency)}</strong><small>{tender.economicModelNote ?? 'Operating assumptions and evidence have not been provided.'}</small></div>
              <div><span>CAPITAL EFFICIENCY</span><strong>{efficiency === null ? 'Not yet calculable' : `${efficiency}% / year`}</strong><small>Projected annual yield ÷ asset build cost</small></div>
              <div><span>LOCAL CAPITAL RETENTION</span><strong>{tender.localSpendPercentage === null ? 'Not reported' : `${tender.localSpendPercentage}%`}</strong><small>Share of build cost retained in the stated county</small></div>
            </div>
            <div className="crew-allocation-panel">
              <div><p className="eyebrow">CREW COMPENSATION / PROPOSED ALLOCATION</p><span>{crewTotal === null ? 'Not itemized in this dossier' : `Total · ${formatMoney(crewTotal, tender.currency)}`}</span></div>
              <div className="crew-allocation-grid">
                {(['anchor', 'builder', 'apprentice'] as const).map(role => (
                  <div key={role}><span>{role}</span><strong>{tender.crewWageAllocationMinor ? formatMoney(tender.crewWageAllocationMinor[role], tender.currency) : 'Not allocated'}</strong></div>
                ))}
              </div>
            </div>
            <div className="yield-rights-boundary">
              <strong>Projected yield is not a cash-flow right.</strong>
              <span>No entitlement, distribution waterfall, return, or claim on cooperative treasury funds is issued by this Tender. Those rights require a separately approved legal and settlement design.</span>
            </div>
            <p className="fine-print">{tender.isIllustrative
              ? 'Every financial figure in this scenario is illustrative, not a verified operating result, wage payment, yield, or live capital allocation.'
              : 'Yield is a projection, not realized revenue. Local retention and crew compensation require documented source data; settlement and payment are separate from this model.'}</p>
          </section>

          <section aria-labelledby="detail-brief-title" className="detail-section">
            <p className="eyebrow">02 / The brief</p><h2 id="detail-brief-title">Infrastructure with a constituency.</h2>
            <p className="prose-copy">{tender.description}</p>
          </section>

          <section aria-labelledby="detail-blueprint-title" className="detail-section">
            <div className="detail-section-head"><div><p className="eyebrow">03 / Version {tender.blueprint.version}</p><h2 id="detail-blueprint-title">Blueprint / bill of materials.</h2></div><FileText aria-hidden="true" className="section-mark" size={19} /></div>
            <div className="bom-table">
              {tender.blueprint.lines.map((line, index) => (
                <div className="bom-row" key={line.id}>
                  <span className="bom-number">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="bom-item">{line.item}<small>{line.quantity} {line.unit}{line.quantity > 1 ? 's' : ''}</small></span>
                  <strong>{formatMoney(line.quantity * line.unitCostMinor, tender.currency)}</strong>
                </div>
              ))}
              <div className="bom-total"><span>Asset build cost</span><strong>{formatMoney(tender.assetBuildCostMinor, tender.currency)}</strong></div>
            </div>
            <p className="fine-print">{tender.isIllustrative
              ? 'Scenario line items; availability, final quantities, and county-level spend require local verification.'
              : 'Published itemized lines. Confirm availability, prices, sourcing, and operating assumptions with the responsible organization before execution.'}</p>
          </section>

          <section aria-labelledby="detail-crew-title" className="detail-section">
            <div className="detail-section-head"><div><p className="eyebrow">04 / Responsible execution</p><h2 id="detail-crew-title">The tri-node crew.</h2></div><Users aria-hidden="true" className="section-mark" size={19} /></div>
            <div className="crew-list">
              {tender.crew.map(member => (
                <div className="crew-row" key={member.id}>
                  <span className={`crew-role role-${member.role}`}>{member.role}</span>
                  <strong>{member.displayName}</strong>
                  <span>{member.organization}</span>
                </div>
              ))}
            </div>
            <p className="fine-print">{tender.isIllustrative ? 'Illustrative crew profiles. Assignments are not verified.' : 'Crew identities are access-controlled; public names appear only with each member’s consent. The current Anchor sign-off is an authenticated database attestation, not a public-key-verifiable signature.'}</p>
          </section>

          <section aria-labelledby="detail-progress-title" className="detail-section">
            <p className="eyebrow">05 / Build sequence</p><h2 id="detail-progress-title">Capital moves only when evidence does.</h2>
            <ol className="milestone-list">
              {milestones.map((step, index) => <li className={index < completed ? 'complete' : ''} key={step}>
                <span>{index < completed ? <BadgeCheck aria-hidden="true" size={13} /> : <Circle aria-hidden="true" size={8} />}</span>{step}
              </li>)}
            </ol>
            <p className="fine-print">Assembly starts only after the required target is verified as settled offline by an authorized Tender issuer. Anchor sign-off and deployment remain separate accountable steps.</p>
          </section>
        </article>

        <aside className="detail-rail">
          <div className="rail-sticky capital-rail">
            <p className="eyebrow">CAPITAL ALLOCATION / NON-BINDING SIGNAL</p>
            <h2>{formatMoney(tender.fundingTargetMinor, tender.currency)}</h2>
            <p>Target capital for this asset · no funds are held by APT-LABS.</p>
            <div className="capital-signal-summary">
              <span>Capital allocation state</span>
              <strong>{allocationLabel}</strong>
              <span>Current intent total</span>
              <strong>{formatMoney(tender.currentSignaledAmountMinor, tender.currency)}</strong>
              <b>{signalPercent}% {signalPercent === 100 ? 'Signaled' : 'signaled'}</b>
              <span>Verified offline settlement</span>
              <strong>{formatMoney(tender.currentSettledAmountMinor, tender.currency)}</strong>
            </div>
            <div className="capital-state-note">
              {allocationState === 'fully_capitalized'
                ? 'Capital target verified by an authorized issuer; Assembly may begin.'
                : allocationState === 'awaiting_settlement'
                  ? 'Target signaled · awaiting authorized offline settlement verification.'
                  : allocationState === 'partially_settled'
                    ? 'Some capital is verified offline; the full target remains outstanding.'
                    : allocationState === 'soft_committed'
                      ? 'Intent is non-binding and does not count as settled capital.'
                      : `No capital intent recorded · Tender state: ${statusLabel}.`}
            </div>
            <CapitalIntentDialog
              acceptingSignals={
                (tender.status === 'open' || tender.status === 'capitalized_pending_settlement') &&
                tender.currentSignaledAmountMinor < tender.fundingTargetMinor
              }
              assetName={tender.assetName}
              authenticated={workspace.authenticated && !guest}
              currency={tender.currency}
              isIllustrative={tender.isIllustrative}
              targetAmountMinor={tender.fundingTargetMinor}
              tenderId={tender.id}
            />
            <p className="rail-legal">Intent is non-binding. No money moves here. Offline settlement requires authorized verification before Assembly.</p>
            <div className="rail-meta"><span>ISSUER</span><strong>{tender.issuer}</strong><span>LOCATION</span><strong>{tender.location}</strong><span>STATE</span><strong className="status-open"><i />{statusLabel}</strong></div>
          </div>
        </aside>
      </div>
      <footer className="page-footer"><span>APT-LABS / ASSET DOSSIER</span><span>Projection is not realized yield · intent is not settlement</span></footer>
    </main>
  );
}
