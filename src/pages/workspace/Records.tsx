import { useEffect, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead } from '../../components/PageHead';
import { queryRollEntries, type RollEntry } from '../../lib/db/roll';
import { getRollEmptyStateMessage } from '../../lib/records-view';
import { isDemoMode } from '../../lib/supabase/client';
import { PEOPLE_NETWORK, type NetworkEntity } from '../../lib/people-network';
import { RingedEvidenceMarker } from '../../components/RingedEvidenceMarker';
import { ForkGlyph } from '../../components/ForkGlyph';

type Lens = 'canon' | 'annals' | 'roll';

const LENSES: { id: Lens; label: string }[] = [
  { id: 'canon', label: 'Canon' },
  { id: 'annals', label: 'Annals' },
  { id: 'roll', label: 'Roll' },
];

const TIME_AXIS_LABELS = ['2026-09', '2026-10', '2026-11', '2026-12'];

export function Records() {
  const [lens, setLens] = useState<Lens>('roll');
  const [rollEntries, setRollEntries] = useState<RollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [timeIndex, setTimeIndex] = useState(TIME_AXIS_LABELS.length - 1);

  useEffect(() => {
    let active = true;
    queryRollEntries({ limit: 50 })
      .then(entries => {
        if (active) setRollEntries(entries);
      })
      .catch(error => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : 'Roll entries could not be loaded.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function renderLensContent() {
    switch (lens) {
      case 'roll':
        return renderRollLens();
      case 'annals':
        return renderAnnalsLens();
      case 'canon':
        return renderCanonLens();
    }
  }

  function renderRollLens() {
    if (loading) return <p className="records-loading" role="status">Loading Roll entries…</p>;
    if (loadError) {
      return (
        <div className="records-query-error" role="alert">
          <strong>Roll entries could not be loaded.</strong>
          <p>{loadError}</p>
        </div>
      );
    }

    return (
      <section className="records-lens" aria-labelledby="roll-lens-title">
        <div className="records-list-header">
          <h2 id="roll-lens-title">Roll entries</h2>
          <div className="records-time-axis" role="slider" aria-label="Evidence as of" aria-valuemin={0} aria-valuemax={TIME_AXIS_LABELS.length - 1} aria-valuenow={timeIndex} aria-disabled={true}>
            <span className="records-time-label">Evidence as of</span>
            <div className="records-time-track">
              {TIME_AXIS_LABELS.map((label, i) => (
                <button
                  key={label}
                  className={`records-time-tick${i === timeIndex ? ' is-active' : ''}`}
                  onClick={() => setTimeIndex(i)}
                  disabled
                  type="button"
                  aria-label={label}
                  aria-pressed={i === timeIndex}
                >
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <span className="records-time-disabled" aria-hidden="true">(disabled — requires Annals event stream)</span>
          </div>
        </div>

        <ul className="records-roll-list" role="list">
          {rollEntries.slice(0, 3).map((entry) => (
            <li key={entry.id} className="records-roll-entry">
              <article className="records-entry-card">
                <header className="records-entry-header">
                  <div className="records-entry-meta">
                    <span className="records-entry-type">{entry.undertaking_type}</span>
                    <span className="records-entry-id">{entry.id}</span>
                  </div>
                  <h3 className="records-entry-title">{entry.title}</h3>
                </header>

                <div className="records-entry-evidence" role="group" aria-label={`Evidence layers for ${entry.title}`}>
                  <span className="records-section-label">Evidence layers</span>
                  <div className="records-evidence-bands">
                    {(['public', 'participant', 'restricted'] as const).map(layer => {
                      const evidence = entry.evidence.filter(e => e.layer === layer);
                      return (
                        <div key={layer} className={`records-evidence-band ${layer}`}>
                          <span className="records-band-label">{layer}</span>
                          <span className="records-band-count">{evidence.length}</span>
                          {evidence.length > 0 && (
                            <details className="records-evidence-details">
                              <summary>{evidence[0].title}</summary>
                              <p>{evidence[0].description}</p>
                            </details>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="records-entry-acceptance" role="group" aria-label="Acceptance block">
                  <span className="records-section-label">Acceptance</span>
                  <div className="records-acceptance-grid">
                    <div>
                      <span className="records-acceptance-label">Accepted by</span>
                      <span className="records-acceptance-value">{entry.acceptance.accepted_by}</span>
                    </div>
                    <div>
                      <span className="records-acceptance-label">At</span>
                      <span className="records-acceptance-value">{new Date(entry.acceptance.accepted_at).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="records-acceptance-label">Hash anchor</span>
                      <code className="records-hash">{entry.hash_anchor.slice(0, 16)}…</code>
                    </div>
                  </div>
                </div>

                <div className="records-entry-revisions" role="group" aria-label="Roll revisions">
                  <span className="records-section-label">Revisions</span>
                  <div className="records-revision-row">
                    <span className="records-revision-prev">Previous: <code>{entry.hash_anchor.slice(0, 12)}</code></span>
                    <span className="records-revision-arrow" aria-hidden="true">↳</span>
                    <span className="records-revision-new">New: <code>{entry.hash_anchor.slice(12, 24)}</code></span>
                    <span className="records-revision-type">(correction)</span>
                  </div>
                </div>

                <footer className="records-entry-actions">
                  <Link href={`/workspace/records/roll/${entry.id}`} className="records-action-link">
                    Open in Roll
                  </Link>
                  <Link href={`/workspace/records/annals?entry=${entry.id}`} className="records-action-link quiet">
                    View Annals
                  </Link>
                  <Link href={`/workspace/network/people?entity=${entry.commissioned_by.coordinator_id}`} className="records-action-link quiet">
                    View Entity
                  </Link>
                </footer>
              </article>
            </li>
          ))}
          {rollEntries.length === 0 && (
            <li className="records-empty" role="status">{getRollEmptyStateMessage(isDemoMode)}</li>
          )}
        </ul>
      </section>
    );
  }

  function renderAnnalsLens() {
    return (
      <section className="records-lens" aria-labelledby="annals-lens-title">
        <h2 id="annals-lens-title">Annals timeline</h2>
        <p className="records-annals-note">
          <strong>Prototype — explicit gaps.</strong> Annals requires a unified cross-module event stream (work events: submitted to under review to selected or declined) that does not yet exist. The Roll lens ships first; Annals is a structural placeholder until that stream is built.
        </p>
        <div className="records-annals-preview">
          <h3>Proposed structure</h3>
          <ul>
            <li>Recorded sequence: Canon then Annals then outcome</li>
            <li>Proposed changes: source then draft then review then resolve</li>
            <li>Fork glyph only in proposed-state contexts</li>
          </ul>
        </div>
      </section>
    );
  }

  function entityStateColor(type: NetworkEntity['type']): string {
    switch (type) {
      case 'person': return 'var(--state-canon)';
      case 'crew': return 'var(--state-proposed)';
      case 'asset': return 'var(--state-caution)';
      case 'institution': return 'var(--state-risk)';
      case 'work': return 'var(--text-muted)';
      case 'evidence': return 'var(--text-faint)';
      default: return 'var(--text-faint)';
    }
  }

  function renderCanonLens() {
    return (
      <section className="records-lens" aria-labelledby="canon-lens-title">
        <h2 id="canon-lens-title">Canon records</h2>
        <p className="records-canon-subtitle">Current qualified state of each entity in the APT-LABS network. recordBasis marks whether a record is illustrative, locally profiled, or project-reported.</p>
        <ul className="records-canon-list" role="list">
          {PEOPLE_NETWORK.map(entity => {
            const color = entityStateColor(entity.type);
            return (
              <li key={entity.id} className="records-canon-entry">
                <div className="records-canon-body">
                  <div className="records-canon-identity">
                    <RingedEvidenceMarker size={12} color={color} />
                    <div>
                      <span className="records-canon-name">{entity.name}</span>
                      <span className="records-canon-type">{entity.type}</span>
                    </div>
                    <p className="records-canon-role">{entity.role}</p>
                  </div>
                  <div className="records-canon-meta">
                    {entity.location && <span className="records-canon-meta-item">{entity.location}</span>}
                    <span className="records-canon-meta-item">{entity.recordBasis ?? 'qualified'}</span>
                    {entity.capabilities.length > 0 && <span className="records-canon-meta-item">{entity.capabilities.join(', ')}</span>}
                  </div>
                </div>
                {entity.recordBasis === 'illustrative' && (
                  <span className="records-canon-proposed">
                    <ForkGlyph size={10} color="var(--state-caution)" /> illustrative
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <WorkspaceLayout currentContext={`records:${lens}` as const}>
      <div className="records-page">
        <PageHead
          eyebrow="Records"
          title="Records"
          subtitle="Three lenses on the same evidence: Canon (qualified state), Annals (event chronology), Roll (evidence ledger)"
        />

        <nav className="records-lens-nav" role="tablist" aria-label="Records lenses">
          {LENSES.map(l => (
            <button
              key={l.id}
              id={`records-tab-${l.id}`}
              role="tab"
              aria-selected={lens === l.id}
              aria-controls={`records-panel-${l.id}`}
              className={`records-lens-tab${lens === l.id ? ' is-active' : ''}`}
              onClick={() => setLens(l.id)}
              type="button"
            >
              {l.label}
              <span className="records-lens-count">
                {l.id === 'roll' ? (loading || loadError ? 'N/A' : rollEntries.length) : 'N/A'}
              </span>
            </button>
          ))}
        </nav>

        <div className="records-time-axis-global" role="group" aria-label="Global time axis (scrubs all lenses)">
          <span className="records-time-global-label">Time axis</span>
          <div className="records-time-global-track">
            {TIME_AXIS_LABELS.map((label, i) => (
              <button
                key={label}
                className={`records-time-global-tick${i === timeIndex ? ' is-active' : ''}`}
                onClick={() => setTimeIndex(i)}
                type="button"
                aria-label={label}
                aria-pressed={i === timeIndex}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div id={`records-panel-${lens}`} role="tabpanel" aria-labelledby={`records-tab-${lens}`}>
          {renderLensContent()}
        </div>

        <aside className="records-cross-lens" aria-label="Cross-lens navigation">
          <h3>Cross-lens paths</h3>
          <ul>
            <li><Link href="/workspace/network/people">Entity in Network</Link> then Annals events then Roll evidence</li>
            <li><Link href="/workspace/records/roll">Roll entry</Link> then Annals timeline then Canon state</li>
            <li><Link href="/workspace/annals">Annals event</Link> then Roll evidence then Entity profile</li>
          </ul>
        </aside>
      </div>
    </WorkspaceLayout>
  );
}
