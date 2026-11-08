import type { DirectoryEntry, Capability, Evidence, ServiceOffer } from '../lib/db/network';

interface DirectoryEntryRowProps {
  entry: DirectoryEntry;
  onSelect?: () => void;
  onAction?: (action: 'view' | 'message' | 'save') => void;
  expanded?: boolean;
  onExpand?: () => void;
  columns?: ('capabilities' | 'evidence' | 'offers' | 'rate' | 'actions')[];
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase() || '?';
}

function getBasisColor(basis: Capability['basis']): string {
  switch (basis) {
    case 'declared': return 'var(--net-basis-declared)';
    case 'supported': return 'var(--net-basis-supported)';
    case 'counterparty_confirmed': return 'var(--net-basis-counterparty)';
    case 'independently_verified': return 'var(--net-basis-independent)';
  }
}

function countEvidence(evidence: Evidence[]): { evd: number; sbt: number } {
  let evd = 0;
  let sbt = 0;
  for (const e of evidence) {
    if (e.verification_status === 'issuer_verified') sbt++;
    else evd++;
  }
  return { evd, sbt };
}

function getFirstRate(offers: ServiceOffer[]): string | null {
  if (!offers.length) return null;
  const offer = offers[0];
  if (offer.indicative_terms) return offer.indicative_terms;
  return offer.currency ? `${offer.currency}` : null;
}

function getOfferTitles(offers: ServiceOffer[]): string {
  return offers.slice(0, 2).map(o => o.title).join(', ') + (offers.length > 2 ? ` +${offers.length - 2} more` : '');
}

export function DirectoryEntryRow({
  entry,
  onSelect,
  onAction,
  expanded = false,
  onExpand,
  columns = ['capabilities', 'evidence', 'offers', 'rate', 'actions'],
}: DirectoryEntryRowProps) {
  const { evd, sbt } = countEvidence(entry.primary_evidence ? [entry.primary_evidence] : []);
  const topCapabilities = entry.capabilities.slice(0, 4);
  const overflowCapabilities = entry.capabilities.length - 4;
  const rate = getFirstRate(entry.service_offers);
  const offerTitles = getOfferTitles(entry.service_offers);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onExpand?.();
    }
  };

  const handleRowClick = () => {
    onExpand?.();
    onSelect?.();
  };

  return (
    <>
      <tr
        className={expanded ? 'expanded' : ''}
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ cursor: 'pointer' }}
      >
        <td>
          <div className="net-table-name">
            <div
              className="net-table-avatar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, var(--net-basis-counterparty), #A0782E)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--net-paper)',
                font: '600 11px var(--net-font-mono)',
              }}
              aria-hidden="true"
            >
              {getInitials(entry.profile.name)}
            </div>
            <div className="net-table-name-text">
              <span className="net-table-name-main">{entry.profile.name}</span>
              <span className="net-table-name-meta">
                <span className="net-table-role">{entry.profile.type}</span>
                {entry.profile.location && <span>{entry.profile.location}</span>}
              </span>
            </div>
          </div>
        </td>
        {columns.includes('capabilities') && (
          <td>
            <div className="net-table-capabilities">
              {topCapabilities.map(cap => (
                <span
                  key={cap.id}
                  className="net-capability-chip"
                  title={`${cap.name} — ${cap.basis}`}
                >
                  {cap.label || cap.name}
                  <span
                    className="basis-indicator"
                    style={{ background: getBasisColor(cap.basis) }}
                  />
                </span>
              ))}
              {overflowCapabilities > 0 && (
                <span className="net-capability-chip overflow-count">
                  +{overflowCapabilities}
                </span>
              )}
            </div>
          </td>
        )}
        {columns.includes('evidence') && (
          <td>
            <div className="net-table-evidence">
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'conic-gradient(var(--net-basis-supported) calc(var(--evd-pct, 0) * 1%), var(--border) 0)',
                position: 'relative',
                color: 'var(--net-paper)',
                font: '600 var(--net-text-xs) var(--net-font-mono)',
                '--evd-pct': `${Math.min(evd / 5, 1) * 100}%`,
              }}>
                <span style={{ position: 'relative', zIndex: 1 }}>{evd}</span>
                <span style={{
                  content: '""',
                  position: 'absolute',
                  inset: '3px',
                  borderRadius: '50%',
                  background: 'var(--bg-elev)',
                }} />
              </span>
              <span style={{ color: 'var(--net-ink-faint)', font: 'var(--net-text-xs) var(--net-font-mono)' }}>
                <span style={{ color: 'var(--net-ink)', fontWeight: 600 }}>EVD</span>:{evd}
              </span>
              {sbt > 0 && (
                <>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--net-basis-counterparty)',
                    color: 'var(--net-paper)',
                    font: '600 var(--net-text-xs) var(--net-font-mono)',
                  }}>{sbt}</span>
                  <span style={{ color: 'var(--net-ink-faint)', font: 'var(--net-text-xs) var(--net-font-mono)' }}>
                    <span style={{ color: 'var(--net-ink)', fontWeight: 600 }}>SBT</span>:{sbt}
                  </span>
                </>
              )}
            </div>
          </td>
        )}
        {columns.includes('offers') && (
          <td>
            <span className="net-table-offers" title={entry.service_offers.map(o => o.title).join('; ')}>
              {offerTitles || '—'}
            </span>
          </td>
        )}
        {columns.includes('rate') && (
          <td>
            <span className="net-table-rate">{rate || '—'}</span>
          </td>
        )}
        {columns.includes('actions') && (
          <td>
            <div className="net-table-actions">
              <button
                className="primary"
                onClick={(e) => { e.stopPropagation(); onAction?.('view'); }}
                type="button"
              >
                View
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAction?.('message'); }}
                type="button"
              >
                Message
              </button>
            </div>
          </td>
        )}
      </tr>
      {expanded && (
        <tr className="net-table-detail-row">
          <td colSpan={columns.length + 1}>
            <div className="net-table-detail">
              {columns.includes('capabilities') && entry.capabilities.length > 4 && (
                <div className="net-table-detail-section">
                  <h4 className="net-table-detail-title">All Capabilities</h4>
                  <div className="net-table-detail-list">
                    {entry.capabilities.map(cap => (
                      <div key={cap.id} className="net-table-detail-item">
                        <span className="net-capability-chip" style={{ display: 'inline-flex' }}>
                          {cap.label || cap.name}
                          <span
                            className="basis-indicator"
                            style={{ background: getBasisColor(cap.basis) }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {entry.primary_evidence && (
                <div className="net-table-detail-section">
                  <h4 className="net-table-detail-title">Evidence</h4>
                  <div className="net-table-detail-list">
                    {[entry.primary_evidence].filter(Boolean).map(evd => {
                      const isSBT = evd.verification_status === 'issuer_verified';
                      return (
                        <div key={evd.id} className="net-table-detail-item">
                          <span className={`item-mark ${isSBT ? 'sbt' : 'evd'}`} style={{ background: isSBT ? 'var(--net-basis-counterparty)' : 'var(--net-basis-supported)' }}>
                            {isSBT ? 'SBT' : 'EVD'}
                          </span>
                          <div className="item-content">
                            <div className="item-title">{evd.title}</div>
                            {evd.description && <div className="item-meta">{evd.description}</div>}
                            <div className="item-meta">
                              Status: {evd.verification_status.replace('_', ' ')}
                              {evd.verified_by && ` · Verified by ${evd.verified_by}`}
                              {evd.verified_at && ` · ${new Date(evd.verified_at).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {entry.service_offers.length > 0 && (
                <div className="net-table-detail-section">
                  <h4 className="net-table-detail-title">Service Offers</h4>
                  <div className="net-table-detail-offers">
                    {entry.service_offers.map(offer => (
                      <span key={offer.id} className="net-table-detail-offer">
                        <strong>{offer.title}</strong>
                        {offer.scope && <span> — {offer.scope}</span>}
                        {offer.currency && offer.indicative_terms && (
                          <span> · {offer.indicative_terms} {offer.currency}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(entry.profile.location || entry.profile.service_area.length > 0) && (
                <div className="net-table-detail-section">
                  <h4 className="net-table-detail-title">Contact & Location</h4>
                  <div className="net-table-detail-contact">
                    {entry.profile.location && (
                      <span>📍 {entry.profile.location}</span>
                    )}
                    {entry.profile.service_area.length > 0 && (
                      <span>🗺 {entry.profile.service_area.join(', ')}</span>
                    )}
                    {/* Contact info would come from ContactMethod in real implementation */}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}