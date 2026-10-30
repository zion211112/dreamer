import { useEffect, useMemo, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import {
  createLocalId,
  assignLocalSteward,
  createCommonsProposal,
  decideCommonsProposal,
  hasLocalStewardRole,
  readCommonsGovernance,
  readFieldSignals,
  writeFieldSignals,
  type CommonsGovernanceRecord,
  type FieldSignal,
  type ProposalStatus,
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

function getCurrentEmail(): string {
  try {
    const stored = localStorage.getItem('authUser');
    const user = stored ? JSON.parse(stored) as { email?: unknown } : null;
    return typeof user?.email === 'string' ? user.email.trim().toLocaleLowerCase() : '';
  } catch {
    return '';
  }
}

export function Commons() {
  const [, navigate] = useLocation();
  const [commonsView, setCommonsView] = useState<'signals' | 'decisions'>('signals');
  const [institutionScope, setInstitutionScope] = useState('');
  const [signals, setSignals] = useState<FieldSignal[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const [search, setSearch] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [actorEmail, setActorEmail] = useState('');
  const [governance, setGovernance] = useState<CommonsGovernanceRecord>({ stewards: [], proposals: [] });
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [newStewardEmail, setNewStewardEmail] = useState('');
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setActorEmail(getCurrentEmail());
    try {
      const savedSignals = readFieldSignals();
      const requestedInstitution = new URLSearchParams(window.location.search).get('institution');
      const initialSignal = savedSignals.find(signal => signal.institutionId === requestedInstitution) ?? savedSignals[0];
      setSignals(savedSignals);
      setSelectedId(initialSignal?.id ?? '');
      setInstitutionScope(initialSignal?.institutionId ?? requestedInstitution ?? '');
      if (requestedInstitution) setSearch(requestedInstitution);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Local field signals could not be loaded.');
    }
    try {
      setGovernance(readCommonsGovernance());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Local governance records could not be loaded.');
    }
    setLoaded(true);
  }, []);

  const selected = signals.find(signal => signal.id === selectedId) ?? null;
  const activeInstitutionId = institutionScope || selected?.institutionId || '';
  const activeInstitutionName = activeInstitutionId ? institutionNames[activeInstitutionId]
    ?? selected?.institutionName
    ?? signals.find(signal => signal.institutionId === activeInstitutionId)?.institutionName
    ?? selected?.institutionName
    ?? 'Institution' : 'All institutions';
  const authorityInstitutionId = selected?.institutionId ?? activeInstitutionId;
  const activeStewards = governance.stewards.filter(steward => steward.institutionId === authorityInstitutionId);
  const isSteward = hasLocalStewardRole(governance, authorityInstitutionId, actorEmail);
  const institutionProposals = governance.proposals.filter(proposal => !activeInstitutionId || proposal.institutionId === activeInstitutionId);
  const approvedProposal = selected
    ? governance.proposals.find(proposal => proposal.sourceSignalId === selected.id && proposal.status === 'approved') ?? null
    : null;
  const institutionOptions = [...new Map([
    ...signals.map(signal => [signal.institutionId, signal.institutionName] as const),
    ...governance.proposals.map(proposal => [proposal.institutionId, proposal.institutionName] as const),
  ]).entries()];
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

  function registerInitialSteward() {
    try {
      setGovernance(assignLocalSteward(activeInstitutionId, actorEmail));
      setError('');
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : 'Steward role could not be recorded.');
    }
  }

  function addSteward(event: Event) {
    event.preventDefault();
    try {
      setGovernance(assignLocalSteward(activeInstitutionId, newStewardEmail, actorEmail));
      setNewStewardEmail('');
      setError('');
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : 'Steward could not be assigned.');
    }
  }

  function submitProposal(event: Event) {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget as HTMLFormElement;
    const values = new FormData(form);
    try {
      const updated = createCommonsProposal({
        institutionId: selected.institutionId,
        institutionName: selected.institutionName,
        sourceSignalId: selected.id,
        title: String(values.get('proposal-title') ?? '').trim(),
        rationale: String(values.get('proposal-rationale') ?? '').trim(),
        rule: String(values.get('proposal-rule') ?? '').trim(),
      }, actorEmail);
      setGovernance(updated);
      setShowProposalForm(false);
      setError('');
      form.reset();
    } catch (proposalError) {
      setError(proposalError instanceof Error ? proposalError.message : 'Proposal could not be recorded.');
    }
  }

  function recordDecision(proposalId: string, status: Exclude<ProposalStatus, 'proposed'>) {
    const noteText = decisionNotes[proposalId]?.trim() ?? '';
    if (noteText.length < 5) {
      setError('Add a short reason before recording a steward decision.');
      return;
    }
    try {
      setGovernance(decideCommonsProposal(proposalId, status, noteText, actorEmail));
      setDecisionNotes(current => ({ ...current, [proposalId]: '' }));
      setError('');
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Decision could not be recorded.');
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
    setInstitutionScope(signal.institutionId);
    setShowReportForm(false);
    form.reset();
  }

  function changeStatus(status: SignalStatus) {
    if (!selected) return;
    if (status === 'resolved' && !isSteward) {
      setError('Only a designated steward can close this observation.');
      return;
    }
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
            <p className="eyebrow">COMMONS / WORK SIGNALS</p>
            <h1>Commons</h1>
            <p>Observation → steward decision → work.</p>
          </div>
          <div className="signal-head-actions">
            <span className="local-only-stamp">LOCAL · NOT SHARED</span>
            <button className="signal-primary-action" onClick={() => setShowReportForm(value => !value)} type="button">
              {showReportForm ? 'Close form' : '＋ Report an issue'}
            </button>
          </div>
        </header>

        <p className="commons-note">Observations are reports. Only steward decisions authorize work.</p>

        <nav className="commons-modebar" aria-label="Commons views" role="tablist">
          <button
            aria-pressed={commonsView === 'signals'}
            className={commonsView === 'signals' ? 'is-active' : ''}
            onClick={() => setCommonsView('signals')}
            type="button"
          >
            Observations <span>{signals.length.toString().padStart(2, '0')}</span>
          </button>
          <button
            aria-pressed={commonsView === 'decisions'}
            className={commonsView === 'decisions' ? 'is-active' : ''}
            onClick={() => setCommonsView('decisions')}
            type="button"
          >
            Decisions <span>{governance.proposals.length.toString().padStart(2, '0')}</span>
          </button>
          <label className="commons-scope-select">
            <span className="visually-hidden">Institution scope</span>
            <select
              onChange={event => {
                const nextInstitutionId = (event.currentTarget as HTMLSelectElement).value;
                setInstitutionScope(nextInstitutionId);
                setSelectedId(signals.find(signal => signal.institutionId === nextInstitutionId)?.id ?? '');
              }}
              value={institutionScope}
            >
              <option value="">All institutions</option>
              {institutionOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <span className="commons-mode-hint">{activeInstitutionName}</span>
        </nav>

        {error && <p className="local-data-warning" role="alert">{error}</p>}

        {showReportForm && (
          <form className="signal-report-form" onSubmit={submitReport}>
            <div className="signal-form-heading">
              <div><p className="eyebrow">NEW OBSERVATION</p><h2>What changed?</h2></div>
              <span>Saved locally</span>
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

        <section className="commons-governance" aria-labelledby="commons-governance-title" hidden={commonsView !== 'decisions'}>
          <div className="commons-governance-head">
            <div>
              <p className="eyebrow">GOVERNANCE / {activeInstitutionName.toUpperCase()}</p>
              <h2 id="commons-governance-title">Decision register</h2>
            </div>
            {isSteward && selected && (
              <button
                className="signal-secondary-action"
                onClick={() => setShowProposalForm(value => !value)}
                type="button"
              >
                {showProposalForm ? 'Close proposal' : 'Make proposal'}
              </button>
            )}
          </div>

          <div className="commons-authority">
            <div>
              <span className="commons-authority-label">Steward authority</span>
              <strong>{isSteward ? actorEmail : activeStewards.length ? 'Steward decision required' : 'No steward recorded'}</strong>
              {activeStewards.length > 0 && (
                <ul className="commons-steward-list">
                  {activeStewards.map(steward => <li key={steward.email}>{steward.email}</li>)}
                </ul>
              )}
              <small>Role records are stored in this browser; identity and authority are not independently authenticated.</small>
            </div>
            {!activeStewards.length && actorEmail && activeInstitutionId && (
              <button className="signal-secondary-action" onClick={registerInitialSteward} type="button">
                Register first steward
              </button>
            )}
            {!actorEmail && <span className="commons-authority-prompt">Sign in to record a steward role.</span>}
          </div>

          {isSteward && (
            <form className="commons-steward-form" onSubmit={addSteward}>
              <label>
                Add institution steward
                <input
                  autoComplete="email"
                  onInput={event => setNewStewardEmail((event.currentTarget as HTMLInputElement).value)}
                  placeholder="steward@institution.org"
                  required
                  type="email"
                  value={newStewardEmail}
                />
              </label>
              <button className="signal-quiet-action" disabled={!newStewardEmail.trim()} type="submit">Add steward</button>
            </form>
          )}

          {showProposalForm && isSteward && selected && (
            <form className="commons-proposal-form" onSubmit={submitProposal}>
              <p className="eyebrow">PROPOSAL / LINKED OBSERVATION</p>
              <label>Proposed action
                <input defaultValue={`Respond to: ${selected.title}`} maxLength={120} minLength={5} name="proposal-title" required />
              </label>
              <label>Rule or mandate
                <input maxLength={160} minLength={3} name="proposal-rule" placeholder="Reference the institution's authority or rule" required />
              </label>
              <label>Reason and expected outcome
                <textarea maxLength={1200} minLength={12} name="proposal-rationale" placeholder="What should happen, and how will it help?" required rows={3} />
              </label>
              <div className="commons-proposal-footer">
                <span>Only an authorized decision can open a work brief.</span>
                <button className="signal-primary-action" type="submit">Record proposal</button>
              </div>
            </form>
          )}

          <div className="commons-proposal-list">
            {institutionProposals.map(proposal => (
              <article className="commons-proposal" key={proposal.id}>
                <div className="commons-proposal-topline">
                  <span className={`commons-proposal-status commons-proposal-status--${proposal.status}`}>{proposal.status}</span>
                  <time dateTime={proposal.createdAt}>{formatSignalDate(proposal.createdAt)}</time>
                </div>
                <h3>{proposal.title}</h3>
                <div className="commons-proposal-context">{proposal.institutionName}</div>
                <p>{proposal.rationale}</p>
                <div className="commons-proposal-rule"><span>Rule</span><strong>{proposal.rule}</strong></div>
                <ol className="commons-decision-history">
                  {proposal.events.map(event => (
                    <li key={event.id}>
                      <span>{event.status}</span>
                      <span>{event.actor}</span>
                      <small>{event.note}</small>
                    </li>
                  ))}
                </ol>
                {proposal.status === 'proposed' && hasLocalStewardRole(governance, proposal.institutionId, actorEmail) && (
                  <div className="commons-decision-controls">
                    <label className="visually-hidden" htmlFor={`decision-note-${proposal.id}`}>Decision reason</label>
                    <input
                      id={`decision-note-${proposal.id}`}
                      maxLength={280}
                      onInput={event => setDecisionNotes(current => ({ ...current, [proposal.id]: (event.currentTarget as HTMLInputElement).value }))}
                      placeholder="Reason for the decision"
                      value={decisionNotes[proposal.id] ?? ''}
                    />
                    <button className="signal-primary-action" onClick={() => recordDecision(proposal.id, 'approved')} type="button">Approve</button>
                    <button className="signal-secondary-action" onClick={() => recordDecision(proposal.id, 'returned')} type="button">Return</button>
                    <button className="signal-quiet-action" onClick={() => recordDecision(proposal.id, 'rejected')} type="button">Reject</button>
                  </div>
                )}
                {proposal.status === 'approved' && (
                  <button
                    className="signal-primary-action"
                    onClick={() => navigate(`/workspace/workbench?proposal=${encodeURIComponent(proposal.id)}`)}
                    type="button"
                  >
                    Open approved work brief
                  </button>
                )}
              </article>
            ))}
            {institutionProposals.length === 0 && (
              <p className="commons-no-proposals">No proposals for this institution. Observations stay separate until a steward proposes an action.</p>
            )}
          </div>
        </section>

        <section aria-label="Field signal queue" className="signal-workspace" hidden={commonsView !== 'signals'}>
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
                  onClick={() => {
                    setSelectedId(signal.id);
                    setInstitutionScope(signal.institutionId);
                  }}
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
                {selected.id === 'scenario-pump-pressure' && (
                  <section aria-label="Illustrative Fikra machine scan" className="signal-machine-scan">
                    <div className="signal-machine-scan-head">
                      <p className="eyebrow">FIKRA API / MACHINE DISCOVERY</p>
                      <span>MOCK SCAN // BROWSER-LOCAL DEMO MODE</span>
                    </div>
                    <p>Suggested checks: compare inlet pressure at rest and under load; record pump cycling. No live telemetry or cause assessment is available in this example.</p>
                  </section>
                )}
                <section className="signal-next-step">
                  <div>
                    <p className="eyebrow">NEXT ACTION</p>
                    <strong>
                      {selected.status === 'new' ? 'Review the observation' :
                        selected.status === 'triaged' ? 'Steward review before work' :
                          selected.status === 'brief' ? 'Approved work brief' : 'Observation closed'}
                    </strong>
                    <span>{selected.status === 'brief' && !approvedProposal
                      ? 'No approved proposal is linked. This observation cannot authorize a work brief.'
                      : 'An observation describes a condition; a steward decision authorizes the next action.'}</span>
                  </div>
                  {selected.status === 'new' && <button className="signal-secondary-action" onClick={() => changeStatus('triaged')} type="button">Move to triage</button>}
                  {selected.status === 'triaged' && <button className="signal-primary-action" onClick={() => setCommonsView('decisions')} type="button">Open decision register</button>}
                  {selected.status === 'brief' && approvedProposal && <button className="signal-primary-action" onClick={() => navigate(`/workspace/workbench?proposal=${encodeURIComponent(approvedProposal.id)}`)} type="button">Open approved work brief</button>}
                  {selected.status !== 'resolved' && isSteward && <button className="signal-quiet-action" onClick={() => changeStatus('resolved')} type="button">Close observation</button>}
                  {selected.status === 'resolved' && <button className="signal-secondary-action" onClick={() => changeStatus('new')} type="button">Reopen</button>}
                </section>
                <details className="signal-history">
                  <summary className="signal-history-heading"><span>Activity &amp; notes</span><span>{selected.updates.length.toString().padStart(2, '0')}</span></summary>
                  <form className="signal-note-form" onSubmit={addNote}>
                    <input
                      aria-label="Record a work note"
                      maxLength={280}
                      onInput={event => setNote((event.currentTarget as HTMLInputElement).value)}
                      placeholder="Evidence, next step, or open question"
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
                </details>
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
