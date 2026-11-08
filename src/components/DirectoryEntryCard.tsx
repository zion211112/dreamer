import { useState, useRef, useEffect } from 'preact/hooks';
import type { DirectoryEntry, Capability, Evidence } from '../lib/db/network';

interface DirectoryEntryCardProps {
  entry: DirectoryEntry;
  onSelect?: () => void;
  onAction?: (action: 'view' | 'message' | 'save') => void;
  compact?: boolean;
  className?: string;
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

function countEvidenceByType(evidence: Evidence[]): { evd: number; sbt: number } {
  let evd = 0;
  let sbt = 0;
  for (const e of evidence) {
    if (e.verification_status === 'issuer_verified') sbt++;
    else if (e.verification_status === 'counterparty_confirmed') evd++;
    else evd++;
  }
  return { evd, sbt };
}

function getTopEvidence(evidence: Evidence[], limit = 3): Evidence[] {
  return evidence
    .sort((a, b) => {
      const aRank = a.verification_status === 'issuer_verified' ? 3 : a.verification_status === 'counterparty_confirmed' ? 2 : 1;
      const bRank = b.verification_status === 'issuer_verified' ? 3 : b.verification_status === 'counterparty_confirmed' ? 2 : 1;
      return bRank - aRank;
    })
    .slice(0, limit);
}

function getEvidenceMark(evidence: Evidence): { label: string; class: string } {
  if (evidence.verification_status === 'issuer_verified') {
    return { label: 'SBT', class: 'sbt' };
  }
  if (evidence.verification_status === 'counterparty_confirmed') {
    return { label: 'EVD', class: 'evd' };
  }
  return { label: 'EVD', class: 'evd' };
}

export function DirectoryEntryCard({
  entry,
  onSelect,
  onAction,
  compact = false,
  className = '',
}: DirectoryEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { evd, sbt } = countEvidenceByType(entry.primary_evidence ? [entry.primary_evidence] : []);
  const topEvidence = getTopEvidence(entry.primary_evidence ? [entry.primary_evidence] : []);
  const topOffers = entry.service_offers.slice(0, 2);
  const allCapabilities = entry.capabilities;
  const visibleCapabilities = allCapabilities.slice(0, 3);
  const overflowCount = allCapabilities.length - 3;

  // Calculate EVD percentage for ring (capped at 5 for visual)
  const evdPct = Math.min(evd / 5, 1) * 100;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!expanded) return;
      if (event.key === 'Escape') {
        setExpanded(false);
        cardRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expanded]);

  const handleClick = (event: MouseEvent) => {
    // Don't expand on action button clicks
    if ((event.target as HTMLElement).closest('button')) return;
    setExpanded(!expanded);
    onSelect?.();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setExpanded(!expanded);
      onSelect?.();
    }
  };

  return (
    <article
      ref={cardRef}
      className={`net-entry-card ${compact ? 'compact' : ''} ${expanded ? 'expanded' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-expanded={expanded}
    >
      <header className="net-entry-header">
        <div
          className="net-entry-avatar"
          aria-hidden="true"
        >
          {getInitials(entry.profile.name)}
        </div>
        <div className="net-entry-identity">
          <h3 className="net-entry-name">{entry.profile.name}</h3>
          <span className="net-entry-role">{entry.profile.type}</span>
          {entry.profile.location && (
            <span className="net-entry-location">{entry.profile.location}</span>
          )}
        </div>
      </header>

      {entry.profile.headline && (
        <p className="net-entry-headline">{entry.profile.headline}</p>
      )}

      <div className="net-entry-capabilities">
        {visibleCapabilities.map(cap => (
          <span
            key={cap.id}
            className="net-capability-chip"
            title={`${cap.name} — ${cap.basis}`}
          >
            {cap.label || cap.name}
            <span
              className={`basis-indicator ${cap.basis}`}
              style={{ background: getBasisColor(cap.basis) }}
              aria-label={`Basis: ${cap.basis.replace('_', ' ')}`}
            />
          </span>
        ))}
        {overflowCount > 0 && (
          <span className="net-capability-chip overflow-count">
            +{overflowCount} more
          </span>
        )}
      </div>

      <div className="net-evidence-summary">
        <div
          className="net-evidence-ring evd"
          style={{ '--evd-pct': `${evdPct}%` } as any}
          aria-label={`Work evidence: ${evd}`}
        >
          <span>{evd}</span>
        </div>
        <div className="net-evidence-ring-label">
          <span className="label-key">EVD</span> Work evidence
        </div>
        {sbt > 0 && (
          <>
            <div className="net-evidence-ring sbt" aria-label={`Verified credentials: ${sbt}`}>
              <span>{sbt}</span>
            </div>
            <div className="net-evidence-ring-label">
              <span className="label-key">SBT</span> Verified
            </div>
          </>
        )}
      </div>

      {expanded && !compact && (
        <div className="net-entry-expanded" style={{ animation: 'net-expand 200ms ease-out' }}>
          <div style={{ marginBottom: 'var(--net-space-3)' }}>
            <span style={{ color: 'var(--net-ink-faint)', font: '600 var(--net-text-xs) var(--net-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Capabilities
            </span>
            <div className="net-entry-capabilities" style={{ marginTop: 'var(--net-space-2)' }}>
              {allCapabilities.map(cap => (
                <span
                  key={cap.id}
                  className="net-capability-chip"
                  title={`${cap.name} — ${cap.basis}`}
                >
                  {cap.label || cap.name}
                  <span
                    className={`basis-indicator ${cap.basis}`}
                    style={{ background: getBasisColor(cap.basis) }}
                  />
                </span>
              ))}
            </div>
          </div>

          {topEvidence.length > 0 && (
            <div style={{ marginBottom: 'var(--net-space-3)' }}>
              <span style={{ color: 'var(--net-ink-faint)', font: '600 var(--net-text-xs) var(--net-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Evidence
              </span>
              <div style={{ display: 'grid', gap: 'var(--net-space-2)', marginTop: 'var(--net-space-2)' }}>
                {topEvidence.map(evd => {
                  const mark = getEvidenceMark(evd);
                  return (
                    <div
                      key={evd.id}
                      className="net-table-detail-item"
                      style={{ padding: 'var(--net-space-2)', border: '1px solid var(--border)', borderRadius: 'var(--net-radius-tight)', background: 'var(--bg)' }}
                    >
                      <span className={`item-mark ${mark.class}`} style={{ background: mark.class === 'sbt' ? 'var(--net-basis-counterparty)' : 'var(--net-basis-supported)' }}>
                        {mark.label}
                      </span>
                      <div className="item-content">
                        <div className="item-title">{evd.title}</div>
                        {evd.description && <div className="item-meta">{evd.description}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {topOffers.length > 0 && (
            <div style={{ marginBottom: 'var(--net-space-3)' }}>
              <span style={{ color: 'var(--net-ink-faint)', font: '600 var(--net-text-xs) var(--net-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Offers
              </span>
              <div className="net-table-detail-offers" style={{ marginTop: 'var(--net-space-2)' }}>
                {topOffers.map(offer => (
                  <span key={offer.id} className="net-table-detail-offer">
                    {offer.title}
                    {offer.currency && offer.indicative_terms && (
                      <span style={{ color: 'var(--net-ink-faint)' }}> · {offer.currency}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="net-entry-actions">
        <button
          onClick={(e) => { e.stopPropagation(); onAction?.('view'); }}
          type="button"
        >
          View Profile
        </button>
        <button
          className="primary"
          onClick={(e) => { e.stopPropagation(); onAction?.('message'); }}
          type="button"
        >
          Message
        </button>
      </footer>
    </article>
  );
}