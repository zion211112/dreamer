import { useEffect, useMemo, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import {
  createLocalId,
  readFieldSignals,
  writeFieldSignals,
  type FieldSignal,
  type SignalStatus,
} from '../../lib/local-workflows';

const statusLabels: Record<SignalStatus, string> = {
  new: 'New',
  triaged: 'In triage',
  brief: 'Work brief',
  resolved: 'Resolved',
};

const filters: Array<'all' | SignalStatus> = ['all', 'new', 'triaged', 'brief', 'resolved'];
const institutionNames: Record<string, string> = {
  'mwea-school': 'Mwea Community School',
  'mwea-water': 'Mwea Water Cooperative',
  'lake-basin-cold-store': 'Lake Basin Cold Store',
};

function formatSignalDate(value: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

export function Commons() {
  const [location, navigate] = useLocation();
  const [signals, setSignals] = useState<FieldSignal[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const [search, setSearch] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedSignals = readFieldSignals();
      const requestedInstitution = new URLSearchParams(location.split('?')[1] ?? '').get('institution');
      setSignals(savedSignals);
      setSelectedId(savedSignals.find(signal => signal.institutionId === requestedInstitution)?.id ?? savedSignals[0]?.id ?? '');
      if (requestedInstitution) setSearch(requestedInstitution);
      setLoaded(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Local field signals could not be loaded.');
    }
  }, []);

  const selected = signals.find(signal => signal.id === selectedId) ?? null;
  const visibleSignals = useMemo(() => signals
    .filter(signal => filter === 'all' || signal.status === filter)
    .filter(signal => {
      const query = search.trim().toLocaleLowerCase();
      if (!query) return true;
      return `${signal.title} ${signal.institutionName} ${signal.institutionId} ${signal.assetName} ${signal.location}`
        .toLocaleLowerCase()
        .includes(query);
    }), [signals, filter, search]);

  function persist(nextSignals: FieldSignal[]): boolean {
    try {
      writeFieldSignals(nextSignals);
      setSignals(nextSignals);
      setError('');
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Local field signals could not be saved.');
      return false;
    }
  }

  function submitReport(event: Event) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const values = new FormData(form);
    const title = String(values.get('title') ?? '').trim();
    const institutionId = String(values.get('institution') ?? '');
    const institutionName = String(values.get('institution-name') ?? '').trim()
      || institutionNames[institutionId]
      || '';
    const assetName = String(values.get('asset') ?? '').trim();
    const locationName = String(values.get('location') ?? '').trim();
    const details = String(values.get('details') ?? '').trim();
    if (title.length < 5 || details.length < 12 || !institutionName || !assetName) {
      setError('Add an institution, asset, short issue title, and enough detail to triage.');
      return;
    }

    const now = new Date().toISOString();
    const signal: FieldSignal = {
      id: createLocalId('signal'),
      institutionId,
      institutionName,
      assetName,
      location: locationName,
      title,
      details,
      urgency: values.get('urgency') === 'urgent' || values.get('urgency') === 'soon'
        ? values.get('urgency') as FieldSignal['urgency']
        : 'routine',
      status: 'new',
      createdAt: now,
      updatedAt: now,
      updates: [{ id: createLocalId('update'), text: 'Signal captured in this browser. Not shared or verified.', createdAt: now }],
      scenario: false,
    };
    const next = [signal, ...signals];
    if (!persist(next)) return;
    setSelectedId(signal.id);
    setShowReportForm(false);
    form.reset();
  }

  function changeStatus(status: SignalStatus) {
    if (!selected) return;
    const now = new Date().toISOString();
    const update = {
      id: createLocalId('update'),
      text: status === 'triaged'
        ? 'Moved to triage in this browser.'
        : status === 'brief'
          ? 'Work brief preparation started in this browser.'
          : status === 'resolved'
            ? 'Marked resolved in this browser; no work verification is implied.'
            : 'Reopened in this browser.',
      createdAt: now,
    };
    persist(signals.map(signal => signal.id === selected.id
      ? { ...signal, status, updatedAt: now, updates: [update, ...signal.updates] }
      : signal));
  }

  function addNote(event: Event) {
    event.preventDefault();
    if (!selected || !note.trim()) return;
    const now = new Date().toISOString();
    const update = { id: createLocalId('update'), text: note.trim(), createdAt: now };
    const saved = persist(signals.map(signal => signal.id === selected.id
      ? { ...signal, updatedAt: now, updates: [update, ...signal.updates] }
      : signal));
    if (saved) setNote('');
  }

  return (
    <WorkspaceLayout currentContext="commons">
      <main className="signal-desk">
        <header className="signal-desk-head">
          <div>
            <p className="eyebrow">COMMONS / SIGNAL DESK</p>
            <h1>Notice the change.<br /><em>Move the work.</em></h1>
            <p>Human-reported field signals, privately kept on this device until reviewed.</p>
          </div>
          <div className="signal-head-actions">
            <span className="local-only-stamp">LOCAL · NOT SHARED</span>
            <button className="signal-primary-action" onClick={() => setShowReportForm(value => !value)} type="button">
              {showReportForm ? 'Close report' : '＋ Report a problem'}
            </button>
          </div>
        </header>

        <div className="signal-boundary" role="note">
          Demo workspace. Reports are browser-local, unverified, and visible only in this browser. No sensors, alerts, or institution accounts are connected.
        </div>

        {error && <p className="local-data-warning" role="alert">{error}</p>}

        {showReportForm && (
          <form className="signal-report-form" onSubmit={submitReport}>
            <div className="signal-form-heading">
              <div><p className="eyebrow">NEW / FIELD REPORT</p><h2>What changed?</h2></div>
              <span>Private draft · this browser only</span>
            </div>
            <div className="signal-form-grid">
              <label>Institution
                <select name="institution" required>
                  <option value="mwea-school">Mwea Community School</option>
                  <option value="mwea-water">Mwea Water Cooperative</option>
                  <option value="lake-basin-cold-store">Lake Basin Cold Store</option>
                </select>
              </label>
              <label>Institution name (if different)
                <input name="institution-name" placeholder="Use the selected example or enter another" />
              </label>
              <label>Asset or place
                <input name="asset" placeholder="Pump 02, cold room, classroom…" required />
              </label>
              <label>Location
                <input name="location" placeholder="Town, site, or building" />
              </label>
              <label className="signal-form-wide">Short issue
                <input maxLength={120} name="title" placeholder="What changed?" required />
              </label>
              <label className="signal-form-wide">What did you observe?
                <textarea maxLength={1200} minLength={12} name="details" placeholder="Describe what was noticed. Separate observation from suspected cause." required rows={3} />
              </label>
              <label>Attention
                <select name="urgency">
                  <option value="routine">Routine</option>
                  <option value="soon">Needs attention</option>
                  <option value="urgent">Urgent · needs human review</option>
                </select>
              </label>
            </div>
            <div className="signal-form-footer">
              <span>Urgency is a reporter’s note, not an automated priority.</span>
              <button className="signal-primary-action" type="submit">Save local signal</button>
            </div>
          </form>
        )}

        <section aria-label="Field signal queue" className="signal-workspace">
          <aside className="signal-queue">
            <div className="signal-queue-heading">
              <div><p className="eyebrow">QUEUE / {signals.length.toString().padStart(2, '0')}</p><h2>Field signals</h2></div>
              <span className="signal-queue-count">{visibleSignals.length}</span>
            </div>
            <label className="signal-search">
              <span aria-hidden="true">⌕</span>
              <input aria-label="Search signals" onInput={event => setSearch((event.currentTarget as HTMLInputElement).value)} placeholder="Find an asset or signal" value={search} />
            </label>
            <div aria-label="Filter signals by status" className="signal-filters" role="group">
              {filters.map(item => (
                <button
                  aria-pressed={filter === item}
                  className={filter === item ? 'is-active' : ''}
                  key={item}
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item === 'all' ? 'All' : statusLabels[item]}
                </button>
              ))}
            </div>
            <div className="signal-list">
              {visibleSignals.map(signal => (
                <button
                  aria-current={selected?.id === signal.id ? 'true' : undefined}
                  className={`signal-list-item${selected?.id === signal.id ? ' is-selected' : ''}`}
                  key={signal.id}
                  onClick={() => setSelectedId(signal.id)}
                  type="button"
                >
                  <span className={`signal-status-mark signal-status-${signal.status}`} />
                  <span className="signal-list-copy">
                    <strong>{signal.title}</strong>
                    <small>{signal.institutionName} · {signal.assetName}</small>
                  </span>
                  <span className="signal-list-date">{formatSignalDate(signal.updatedAt)}</span>
                </button>
              ))}
              {loaded && visibleSignals.length === 0 && (
                <p className="signal-list-empty">No signals match this view. Report a change to start a local record.</p>
              )}
            </div>
          </aside>

          <article className="signal-detail">
            {selected ? (
              <>
                <header className="signal-detail-head">
                  <div>
                    <div className="signal-detail-kickers">
                      <span className={`signal-status-label signal-status-${selected.status}`}>{statusLabels[selected.status]}</span>
                      {selected.scenario && <span className="signal-scenario-label">DEMO SCENARIO</span>}
                    </div>
                    <h2>{selected.title}</h2>
                    <p>{selected.institutionName} <span>·</span> {selected.assetName} <span>·</span> {selected.location}</p>
                  </div>
                  <span className="signal-updated">UPDATED {formatSignalDate(selected.updatedAt).toUpperCase()}</span>
                </header>
                <section className="signal-observation">
                  <p className="eyebrow">OBSERVATION / {selected.urgency.toUpperCase()}</p>
                  <p>{selected.details}</p>
                  {selected.scenario && <small>This is sample content for the local prototype, not an operational report.</small>}
                </section>
                <section className="signal-next-step">
                  <div>
                    <p className="eyebrow">NEXT ACTION</p>
                    <strong>
                      {selected.status === 'new' ? 'Review the observation' :
                        selected.status === 'triaged' ? 'Prepare a work brief if needed' :
                          selected.status === 'brief' ? 'Continue shaping the work brief' : 'Signal marked resolved'}
                    </strong>
                    <span>Status changes here are private demo actions, not institutional decisions.</span>
                  </div>
                  {selected.status === 'new' && <button className="signal-secondary-action" onClick={() => changeStatus('triaged')} type="button">Move to triage</button>}
                  {selected.status === 'triaged' && <button className="signal-primary-action" onClick={() => { changeStatus('brief'); navigate(`/workspace/workbench?signal=${encodeURIComponent(selected.id)}`); }} type="button">Prepare work brief</button>}
                  {selected.status === 'brief' && <button className="signal-primary-action" onClick={() => navigate(`/workspace/workbench?signal=${encodeURIComponent(selected.id)}`)} type="button">Open in Workbench</button>}
                  {selected.status !== 'resolved' && <button className="signal-quiet-action" onClick={() => changeStatus('resolved')} type="button">Mark resolved</button>}
                  {selected.status === 'resolved' && <button className="signal-secondary-action" onClick={() => changeStatus('new')} type="button">Reopen</button>}
                </section>
                <section className="signal-history">
                  <div className="signal-history-heading"><p className="eyebrow">LOCAL HISTORY</p><span>{selected.updates.length.toString().padStart(2, '0')} entries</span></div>
                  <form className="signal-note-form" onSubmit={addNote}>
                    <input
                      aria-label="Add a private note"
                      maxLength={280}
                      onInput={event => setNote((event.currentTarget as HTMLInputElement).value)}
                      placeholder="Add a private note or next step…"
                      value={note}
                    />
                    <button className="signal-secondary-action" disabled={!note.trim()} type="submit">Add note</button>
                  </form>
                  <ol className="signal-update-list">
                    {selected.updates.map(update => (
                      <li key={update.id}>
                        <time dateTime={update.createdAt}>{formatSignalDate(update.createdAt)}</time>
                        <span>{update.text}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </>
            ) : (
              <div className="signal-detail-empty">
                <p className="eyebrow">NO SIGNAL SELECTED</p>
                <h2>{loaded ? 'The queue is clear.' : 'Opening local signals…'}</h2>
                <p>{loaded ? 'Choose a signal or report a new observation to begin.' : 'Reading this browser’s demo records.'}</p>
              </div>
            )}
          </article>
        </section>
      </main>
    </WorkspaceLayout>
  );
}
