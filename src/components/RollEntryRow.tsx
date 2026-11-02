import type { RollEntry } from '../lib/db/roll';
import { isDemoMode } from '../lib/supabase/client';

interface RollEntryRowProps {
  entry: RollEntry;
  onSelect?: () => void;
  onAction?: (action: 'view' | 'verify') => void;
  expanded?: boolean;
  onExpand?: () => void;
  columns?: ('type' | 'status' | 'evidence' | 'participants' | 'hash' | 'date' | 'actions')[];
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase() || '?';
}

function getTypeColor(type: RollEntry['undertaking_type']): string {
  return `var(--roll-${type})`;
}

function getStatusColor(hasAcceptance: boolean): string {
  return hasAcceptance ? 'var(--roll-sealed)' : 'var(--roll-draft)';
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

function countEvidenceByLayer(evidence: RollEntry['evidence']): Record<RollEntry['evidence'][0]['layer'], number> {
  const counts: Record<RollEntry['evidence'][0]['layer'], number> = { public: 0, participant: 0, restricted: 0 };
  for (const e of evidence) counts[e.layer]++;
  return counts;
}

export function RollEntryRow({
  entry,
  onSelect,
  onAction,
  expanded = false,
  onExpand,
  columns = ['type', 'status', 'evidence', 'participants', 'hash', 'date', 'actions'],
}: RollEntryRowProps) {
  const hasAcceptance = !!entry.acceptance.accepted_by;
  const evidenceCounts = countEvidenceByLayer(entry.evidence);
  const totalEvidence = entry.evidence.length;

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
          <div className="roll-table-name">
            <div
              className="roll-table-avatar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: getTypeColor(entry.undertaking_type),
                display: 'grid',
                placeItems: 'center',
                color: 'var(--net-paper)',
                font: '600 11px var(--roll-font-mono)',
              }}
              aria-hidden="true"
            >
              {getInitials(entry.commissioned_by.name)}
            </div>
            <div className="roll-table-name-text">
              <span className="roll-table-title">{entry.title}</span>
              <span className="roll-table-meta">
                <span className="roll-table-institution">{entry.commissioned_by.name}</span>
                <span
                  className="roll-table-type"
                  style={{ background: getTypeColor(entry.undertaking_type) }}
                >
                  {entry.undertaking_type}
                </span>
              </span>
            </div>
          </div>
        </td>
        {columns.includes('type') && (
          <td>
            <span
              className="roll-table-type-badge"
              style={{ background: getTypeColor(entry.undertaking_type) }}
            >
              {entry.undertaking_type}
            </span>
          </td>
        )}
        {columns.includes('status') && (
          <td>
            <span
              className="roll-table-status-badge"
              style={{ background: getStatusColor(hasAcceptance) }}
            >
              {getStatusLabel(hasAcceptance)}
            </span>
          </td>
        )}
        {columns.includes('evidence') && (
          <td>
            <div className="roll-table-evidence">
              <span
                className="roll-evidence-layer-chip"
                style={{ borderColor: getLayerColor('public') }}
                title={`${evidenceCounts.public} public`}
              >
                <span className="roll-evidence-dot" style={{ background: getLayerColor('public') }} />
                {evidenceCounts.public}
              </span>
              <span
                className="roll-evidence-layer-chip"
                style={{ borderColor: getLayerColor('participant') }}
                title={`${evidenceCounts.participant} participant`}
              >
                <span className="roll-evidence-dot" style={{ background: getLayerColor('participant') }} />
                {evidenceCounts.participant}
              </span>
              <span
                className="roll-evidence-layer-chip"
                style={{ borderColor: getLayerColor('restricted') }}
                title={`${evidenceCounts.restricted} restricted`}
              >
                <span className="roll-evidence-dot" style={{ background: getLayerColor('restricted') }} />
                {evidenceCounts.restricted}
              </span>
              {totalEvidence > 0 && (
                <span className="roll-total-evidence" style={{ color: 'var(--net-ink-faint)', font: 'var(--roll-text-xs) var(--roll-font-mono)', marginLeft: 'var(--roll-space-1)' }}>
                  {totalEvidence} total
                </span>
              )}
            </div>
          </td>
        )}
        {columns.includes('participants') && (
          <td>
            <div className="roll-table-participants">
              {entry.participants.slice(0, 3).map(p => (
                <span
                  key={p.person_id}
                  className="roll-participant-chip"
                  title={`${p.name} (${p.role_type})`}
                >
                  {getInitials(p.name)}
                </span>
              ))}
              {entry.participants.length > 3 && (
                <span className="roll-participant-chip overflow">
                  +{entry.participants.length - 3}
                </span>
              )}
            </div>
          </td>
        )}
        {columns.includes('hash') && (
          <td>
            {entry.hash_anchor ? (
              <div className="roll-table-hash">
                <code className="roll-hash-value" title={entry.hash_anchor}>{formatHash(entry.hash_anchor)}</code>
                <span className="roll-hash-unchecked">Stored</span>
              </div>
            ) : (
              <span className="roll-no-hash" style={{ color: 'var(--net-ink-faint)' }}>—</span>
            )}
          </td>
        )}
        {columns.includes('date') && (
          <td>
            <span className="roll-table-date">{formatDate(entry.recorded_at)}</span>
          </td>
        )}
        {columns.includes('actions') && (
          <td>
            <div className="roll-table-actions">
              <button
                className="primary"
                onClick={(e) => { e.stopPropagation(); onAction?.('verify'); }}
                type="button"
              >
                Inspect &amp; verify
              </button>
            </div>
          </td>
        )}
      </tr>
      {expanded && (
        <tr className="roll-table-detail-row">
          <td colSpan={columns.length + 1}>
            <div className="roll-table-detail">
              <div style={{ marginBottom: 'var(--roll-space-3)' }}>
                <span style={{ color: 'var(--net-ink-faint)', font: '600 var(--roll-text-xs) var(--roll-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Evidence Details
                </span>
                <div style={{ display: 'grid', gap: 'var(--roll-space-2)', marginTop: 'var(--roll-space-2)' }}>
                  {entry.evidence.map(evd => (
                    <div
                      key={evd.id}
                      className="roll-table-detail-item"
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
                        <span>ID: {evd.id}</span>
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
          </td>
        </tr>
      )}
    </>
  );
}