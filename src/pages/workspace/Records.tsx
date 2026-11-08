import { useEffect, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead, type PageHeadMetric } from '../../components/PageHead';
import { queryRollEntries, type RollEntry } from '../../lib/db/roll';

type Lens = 'canon' | 'annals' | 'roll';

const LENSES: { id: Lens; label: string; count: number }[] = [
  { id: 'canon', label: 'Canon', count: 0 },
  { id: 'annals', label: 'Annals', count: 0 },
  { id: 'roll', label: 'Roll', count: 0 },
];

const TIME_AXIS_LABELS = ['2026-09', '2026-10', '2026-11', '2026-12'];

export function Records() {
  const [lens, setLens] = useState<Lens>('roll');
  const [rollEntries, setRollEntries] = useState<RollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeIndex, setTimeIndex] = useState(TIME_AXIS_LABELS.length - 1);

  useEffect(() => {
    queryRollEntries({ limit: 50 }).then(entries => {
      setRollEntries(entries);
      LENSES[2].count = entries.length;
      setLoading(false);
    });
  }, []);

  const metrics: PageHeadMetric[] = [
    { label: 'Canon', value: LENSES[0].count, state: 'canon' },
    { label: 'Annals', value: LENSES[1].count, state: 'proposed' },
    { label: 'Roll', value: LENSES[2].count, state: 'caution' },
  ];

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
    if (loading) return <p className="records-loading">Loading Roll entries…</p>;

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
                  <span className="records-section-label">EVIDENCE LAYERS</span>
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
                  <span className="records-section-label">ACCEPTANCE</span>
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
                  <span className="records-section-label">REVISIONS</span>
                  <div className="records-revision-row">
                    <span className="records-revision-prev">Previous: <code>{entry.hash_anchor.slice(0, 12)}</code></span>
                    <span className="records-revision-arrow" aria-hidden="true">↳</span>
                    <span className="records-revision-new">New: <code>{entry.hash_anchor.slice(12, 24)}</code></span>
                    <span className="records-revision-type">(correction)</span>
                  </div>
                </div>

                <footer className="records-entry-actions">
                  <Link href={`/workspace/records/roll/${entry.id}`} className="records-action-link">
                    Open in Roll <span aria-hidden="true">→</span>
                  </Link>
                  <Link href={`/workspace/annals?entry=${entry.id}`} className="records-action-link quiet">
                    View Annals <span aria-hidden="true">→</span>
                  </Link>
                  <Link href={`/workspace/network/people?entity=${entry.commissioned_by.coordinator_id}`} className="records-action-link quiet">
                    View Entity <span aria-hidden="true">→</span>
                  </Link>
                </footer>
              </article>
            </li>
          ))}
          {rollEntries.length === 0 && (
            <li className="records-empty">No Roll entries in this browser.</li>
          )}
        </ul>
      </section>
    );
  }

  function renderAnnalsLens() {
    return (
      <section className="records-lens" aria-labelledby="annals-lens-title">
        <h2 id="annals-lens-title">Annals timeline</h2>
        <p className="records-placeholder">Annals event stream not yet connected. Cross-lens navigation: select an entity in Network → view its Annals events → trace to Roll evidence.</p>
        <div className="records-annals-preview">
          <h3>Prototype structure</h3>
          <ul>
            <li>Recorded sequence (Canon → Annals → Outcome)</li>
            <li>Proposed changes (Source → Draft → Review → Resolve)</li>
            <li>Fork glyph only in proposed-state contexts</li>
          </ul>
        </div>
      </section>
    );
  }

  function renderCanonLens() {
    return (
      <section className="records-lens" aria-labelledby="canon-lens-title">
        <h2 id="canon-lens-title">Canon records</h2>
        <p className="records-placeholder">Canon view shows the current qualified state of each record. Time-axis scrubs all three lenses in sync.</p>
        <div className="records-canon-preview">
          <h3>Prototype structure</h3>
          <ul>
            <li>Current qualified view per entity</li>
            <li>Correction history visible, not hidden</li>
            <li>Cross-lens: Canon → Annals events → Roll evidence</li>
          </ul>
        </div>
      </section>
    );
  }

  return (
    <WorkspaceLayout currentContext={`records:${lens}` as const}>
      <div className="records-page">
        <PageHead
          eyebrow="APT-LABS / RECORDS"
          title="Records"
          subtitle="Three lenses on the same evidence: Canon (qualified state), Annals (event chronology), Roll (evidence ledger)"
          metrics={metrics}
          quietActions={[
            { label: 'Export snapshot', onClick: () => {} },
            { label: 'Verify integrity', onClick: () => {} },
          ]}
        />

        <nav className="records-lens-nav" role="tablist" aria-label="Records lenses">
          {LENSES.map(l => (
            <button
              key={l.id}
              role="tab"
              aria-selected={lens === l.id}
              aria-controls={`records-panel-${l.id}`}
              className={`records-lens-tab${lens === l.id ? ' is-active' : ''}`}
              onClick={() => setLens(l.id)}
              type="button"
            >
              {l.label}
              <span className="records-lens-count">{l.count}</span>
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
            <li><Link href="/workspace/network/people">Entity in Network</Link> → Annals events → Roll evidence</li>
            <li><Link href="/workspace/records/roll">Roll entry</Link> → Annals timeline → Canon state</li>
            <li><Link href="/workspace/annals">Annals event</Link> → Roll evidence → Entity profile</li>
          </ul>
        </aside>
      </div>
    </WorkspaceLayout>
  );
}