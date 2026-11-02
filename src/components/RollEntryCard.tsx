import { useState, useRef, useEffect } from 'preact/hooks';
import type { RollEntry } from '../lib/db/roll';
import { isDemoMode } from '../lib/supabase/client';

interface RollEntryCardProps {
  entry: RollEntry;
  onAction?: (action: 'view' | 'verify') => void;
  compact?: boolean;
  className?: string;
}

function getLayerColor(layer: RollEntry['evidence'][0]['layer']): string {
  switch (layer) {
    case 'public': return 'var(--roll-layer-public)';
    case 'participant': return 'var(--roll-layer-participant)';
    case 'restricted': return 'var(--roll-layer-restricted)';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatHash(hash: string): string {
  return `${hash.slice(0, 12)}…${hash.slice(-8)}`;
}

function getStatusLabel(hasAcceptance: boolean): string {
  if (!hasAcceptance) return 'Draft';
  return isDemoMode ? 'Sample acceptance' : 'Sealed';
}

export function RollEntryCard({
  entry,
  onAction,
  compact = false,
  className = '',
}: RollEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const hasAcceptance = !!entry.acceptance.accepted_by;
  const publicEvidence = entry.evidence.filter(e => e.layer === 'public');
  const participantEvidence = entry.evidence.filter(e => e.layer === 'participant');
  const restrictedEvidence = entry.evidence.filter(e => e.layer === 'restricted');

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
    if ((event.target as HTMLElement).closest('button')) return;
    setExpanded(!expanded);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <article
      ref={cardRef}
      className={`roll-entry-card ${compact ? 'compact' : ''} ${expanded ? 'expanded' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-expanded={expanded}
    >
      <header className="roll-entry-header">
        <div className="roll-entry-identity">
          <div className="roll-entry-title-line">
            <h3 className="roll-entry-name">{entry.title}</h3>
            <span className="roll-entry-type" data-type={entry.undertaking_type}>
              {entry.undertaking_type}
            </span>
            <span className="roll-entry-status" data-status={hasAcceptance ? 'sealed' : 'draft'}>
              {getStatusLabel(hasAcceptance)}
            </span>
          </div>
          <div className="roll-entry-meta">
            <span className="roll-entry-institution">{entry.commissioned_by.name}</span>
            <span aria-hidden="true">·</span>
            <span className="roll-entry-date">{formatDate(entry.recorded_at)}</span>
          </div>
        </div>
      </header>

      <div className="roll-evidence-layers">
        <div className="roll-layer-summary">
          <span className="roll-layer-label">Evidence</span>
          <div className="roll-layer-chips" aria-label="Evidence by visibility">
            <span
              className="roll-layer-chip"
              style={{ borderColor: getLayerColor('public') }}
            >
              <span className="roll-layer-dot" style={{ background: getLayerColor('public') }} />
              P {publicEvidence.length}
            </span>
            <span
              className="roll-layer-chip"
              style={{ borderColor: getLayerColor('participant') }}
            >
              <span className="roll-layer-dot" style={{ background: getLayerColor('participant') }} />
              Part. {participantEvidence.length}
            </span>
            <span
              className="roll-layer-chip"
              style={{ borderColor: getLayerColor('restricted') }}
            >
              <span className="roll-layer-dot" style={{ background: getLayerColor('restricted') }} />
              Rest. {restrictedEvidence.length}
            </span>
          </div>
        </div>

        {entry.hash_anchor && (
          <div className="roll-hash-anchor">
            <span className="roll-hash-label">SHA-256</span>
            <code className="roll-hash-value" title={entry.hash_anchor}>{formatHash(entry.hash_anchor)}</code>
            <span className="roll-hash-unchecked">Stored · not verified</span>
          </div>
        )}
      </div>

      <div className="roll-entry-participants">
        <span className="roll-participants-label">
          {entry.participants.length} {entry.participants.length === 1 ? 'participant' : 'participants'}
        </span>
      </div>

      {expanded && !compact && (
        <div className="roll-entry-expanded">
          <div style={{ marginBottom: 'var(--roll-space-3)' }}>
            <span style={{ color: 'var(--net-ink-faint)', font: '600 var(--roll-text-xs) var(--roll-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Evidence Details
            </span>
            <div style={{ display: 'grid', gap: 'var(--roll-space-2)', marginTop: 'var(--roll-space-2)' }}>
              {entry.evidence.map(evd => (
                <div
                  key={evd.id}
                  className="roll-evidence-item"
                  style={{ padding: 'var(--roll-space-2)', border: '1px solid var(--border)', borderRadius: 'var(--roll-radius-tight)', background: 'var(--bg)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--roll-space-2)', marginBottom: 'var(--roll-space-1)' }}>
                    <span
                      className="roll-evidence-layer"
                      style={{ background: getLayerColor(evd.layer) }}
                    >
                      {evd.layer.charAt(0).toUpperCase() + evd.layer.slice(1)}
                    </span>
                    <strong>{evd.title}</strong>
                  </div>
                  {evd.description && <div className="roll-evidence-desc">{evd.description}</div>}
                  <div className="roll-evidence-meta">
                    {evd.file_url && <span>📎 File attached</span>}
                    <span>Added: {evd.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 'var(--roll-space-3)' }}>
            <span style={{ color: 'var(--net-ink-faint)', font: '600 var(--roll-text-xs) var(--roll-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              All Participants
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--roll-space-2)', marginTop: 'var(--roll-space-2)' }}>
              {entry.participants.map(p => (
                <span key={p.person_id} className="roll-participant-chip" style={{ padding: 'var(--roll-space-1) var(--roll-space-2)' }}>
                  <strong>{p.name}</strong>
                  <span style={{ color: 'var(--net-ink-faint)', marginLeft: 'var(--roll-space-1)' }}>({p.role_type})</span>
                </span>
              ))}
            </div>
          </div>

          {entry.hash_anchor && (
            <div className="roll-hash-detail">
              <span style={{ color: 'var(--net-ink-faint)', font: '600 var(--roll-text-xs) var(--roll-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Stored Hash Anchor
              </span>
              <div style={{ marginTop: 'var(--roll-space-2)', padding: 'var(--roll-space-3)', background: 'var(--roll-hash-bg)', color: 'var(--roll-hash-text)', borderRadius: 'var(--roll-radius-tight)', fontFamily: 'var(--roll-font-mono)', fontSize: 'var(--roll-text-xs)', wordBreak: 'break-all', border: '1px solid var(--roll-hash-border)' }}>
                {entry.hash_anchor}
              </div>
              <div style={{ marginTop: 'var(--roll-space-2)', fontSize: 'var(--roll-text-xs)', color: 'var(--net-ink-faint)' }}>
                SHA-256 of canonical Roll fields. Use Inspect &amp; verify to compare the current digest.
              </div>
            </div>
          )}

          <div style={{ marginBottom: 'var(--roll-space-3)' }}>
            <span style={{ color: 'var(--net-ink-faint)', font: '600 var(--roll-text-xs) var(--roll-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Scope & Deliverables
            </span>
            <div style={{ marginTop: 'var(--roll-space-2)', padding: 'var(--roll-space-2)', border: '1px solid var(--border)', borderRadius: 'var(--roll-radius-tight)', background: 'var(--bg)' }}>
              <strong>Scope:</strong> {entry.scope}
              <div style={{ marginTop: 'var(--roll-space-1)' }}>
                <strong>Deliverables:</strong>
                <ul style={{ margin: 'var(--roll-space-1) 0 0 var(--roll-space-3)', padding: 0 }}>
                  {entry.deliverables.map(d => (
                    <li key={d} style={{ fontSize: 'var(--roll-text-sm)' }}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="roll-entry-actions">
        <button
          onClick={(e) => { e.stopPropagation(); onAction?.('view'); }}
          type="button"
        >
          Inspect &amp; verify
        </button>
      </footer>
    </article>
  );
}