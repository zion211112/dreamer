import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead } from '../../components/PageHead';
import { EXAMPLE_FIELD_SIGNALS } from '../../lib/ecosystem-examples';
import { WORK_OPPORTUNITIES } from '../../lib/local-workbench';
import { PEOPLE_NETWORK } from '../../lib/people-network';
import { filterRadarSignals, getSelectedRadarSignal, paginateRadarSignals } from '../../lib/radar-view';
import { loadConsoleSnapshot } from '../../lib/school-console-storage';
import { RadarSpatialPanel } from '../../components/RadarSpatialPanel';
import {
  createLocalId,
  hasRegisteredInstitution,
  parseConsoleDraftId,
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
  triaged: 'Being checked',
  brief: 'Work planning',
  resolved: 'Closed',
};

const filters: Array<'all' | SignalStatus> = ['all', 'new', 'triaged', 'brief', 'resolved'];
const RADAR_PAGE_SIZE = 12;
const institutionNames = Object.fromEntries(PEOPLE_NETWORK
  .filter(entity => entity.type === 'institution')
  .map(entity => [entity.id, entity.name]));
const featuredPossibility = EXAMPLE_FIELD_SIGNALS.find(signal => signal.id === 'scenario-kibera-making-space');

function formatSignalDate(value: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

function signalCategory(signal: FieldSignal): string {
  const title = signal.title.toLocaleLowerCase();
  if (title.includes('crossing') || title.includes('road') || title.includes('drainage')) return 'Access';
  if (title.includes('power') || title.includes('solar') || title.includes('microgrid')) return 'Energy';
  if (title.includes('cold-room') || title.includes('temperature') || title.includes('equipment')) return 'Equipment';
  return 'Ground';
}

function signalPlace(signal: FieldSignal): string {
  const assetName = signal.assetName?.trim();
  return assetName && !assetName.toLocaleLowerCase().startsWith(signal.institutionName.toLocaleLowerCase())
    ? assetName
    : signal.institutionName;
}

function signalContext(signal: FieldSignal): string {
  const place = signalPlace(signal);
  if (place !== signal.institutionName) return `${signal.institutionName} · ${place}`;
  const location = signal.location.trim();
  return location && location !== 'Site not specified'
    ? `${signal.institutionName} · ${location}`
    : signal.institutionName;
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
  const contributeButtonRef = useRef<HTMLButtonElement>(null);
  const reportInstitutionRef = useRef<HTMLSelectElement>(null);
  const [commonsView, setCommonsView] = useState<'signals' | 'opportunities' | 'decisions'>('signals');
  const [institutionScope, setInstitutionScope] = useState('');
  const [signals, setSignals] = useState<FieldSignal[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const [search, setSearch] = useState('');
  const [signalPage, setSignalPage] = useState(0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showContributionMenu, setShowContributionMenu] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('kemetos-agi1-software');
  const [sourceConsoleDraftId, setSourceConsoleDraftId] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [actorEmail, setActorEmail] = useState('');
  const [governance, setGovernance] = useState<CommonsGovernanceRecord>({ stewards: [], proposals: [] });
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [newStewardEmail, setNewStewardEmail] = useState('');
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const selectedOpportunity = WORK_OPPORTUNITIES.find(opportunity => opportunity.id === selectedOpportunityId)
    ?? WORK_OPPORTUNITIES[0];

  useEffect(() => {
    if (showReportForm) reportInstitutionRef.current?.focus();
  }, [showReportForm]);

  useEffect(() => {
    let active = true;
    setActorEmail(getCurrentEmail());
    try {
      const savedSignals = readFieldSignals();
      const searchParams = new URLSearchParams(window.location.search);
      const requestedInstitution = searchParams.get('institution');
      const requestedSignal = searchParams.get('signal');
      const initialSignal = requestedSignal
        ? savedSignals.find(signal => signal.id === requestedSignal) ?? savedSignals[0]
        : requestedInstitution
          ? savedSignals.find(signal => signal.institutionId === requestedInstitution) ?? savedSignals[0]
          : savedSignals[0];
      setSignals(savedSignals);
      setSelectedId(initialSignal?.id ?? '');
      const initialInstitution = requestedInstitution ?? initialSignal?.institutionId ?? '';
      setInstitutionScope(initialInstitution);
      setSearch('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Local field signals could not be loaded.');
    }
    try {
      setGovernance(readCommonsGovernance());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Local governance records could not be loaded.');
    }
    setLoaded(true);
    const requestedDraftId = parseConsoleDraftId(window.location.search);
    if (requestedDraftId) {
      void loadConsoleSnapshot().then(snapshot => {
        const draft = snapshot.tenderDrafts.find(item => item.id === requestedDraftId);
        if (!draft) throw new Error('The selected School Console draft is no longer available.');
        const title = draft.assetName.trim();
        const details = draft.need.trim();
        if (title.length < 5 || details.length < 12) {
          throw new Error('The selected Console draft needs a clear title and at least 12 characters of need detail before it can be reviewed here.');
        }
        if (!active) return;
        setSourceConsoleDraftId(draft.id);
        setReportTitle(title);
        setReportDetails(details);
        setShowReportForm(true);
      }).catch(loadError => {
        if (active) setError(loadError instanceof Error
          ? loadError.message
          : 'The selected School Console draft could not be loaded.');
      });
    }
    return () => { active = false; };
  }, []);

  const institutionOptions = PEOPLE_NETWORK
    .filter(entity => entity.type === 'institution')
    .map(entity => [entity.id, entity.name] as const);
  const visibleSignals = useMemo(() => filterRadarSignals(signals, {
    institutionId: institutionScope,
    status: filter,
    query: search,
  }), [signals, institutionScope, filter, search]);
  const paginatedSignals = paginateRadarSignals(visibleSignals, signalPage, RADAR_PAGE_SIZE);
  const selected = getSelectedRadarSignal(visibleSignals, selectedId);

  useEffect(() => {
    if (selected?.id !== selectedId) setSelectedId(selected?.id ?? '');
  }, [selected?.id, selectedId]);

  useEffect(() => {
    if (paginatedSignals.page !== signalPage) setSignalPage(paginatedSignals.page);
  }, [paginatedSignals.page, signalPage]);

  const activeInstitutionId = institutionScope || (selected?.scenario ? '' : selected?.institutionId) || '';
  const activeInstitutionName = activeInstitutionId ? institutionNames[activeInstitutionId]
    ?? selected?.institutionName
    ?? signals.find(signal => signal.institutionId === activeInstitutionId)?.institutionName
    ?? selected?.institutionName
    ?? 'Institution' : 'All institutions';
  const scopeInstitutionName = institutionScope ? institutionNames[institutionScope]
    ?? signals.find(signal => signal.institutionId === institutionScope)?.institutionName
    ?? 'Institution' : 'All institutions';
  const authorityInstitutionId = selected?.institutionId ?? activeInstitutionId;
  const activeStewards = governance.stewards.filter(steward => steward.institutionId === authorityInstitutionId);
  const isSteward = hasLocalStewardRole(governance, authorityInstitutionId, actorEmail);
  const institutionProposals = governance.proposals.filter(proposal => !activeInstitutionId || proposal.institutionId === activeInstitutionId);
  const approvedProposal = selected
    ? governance.proposals.find(proposal => proposal.sourceSignalId === selected.id && proposal.status === 'approved') ?? null
    : null;
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
    if (!selected || selected.scenario) return;
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
    const institutionName = institutionNames[institutionId] ?? '';
    const assetName = String(values.get('asset') ?? '').trim();
    const locationName = String(values.get('location') ?? '').trim();
    const details = String(values.get('details') ?? '').trim();
    if (title.length < 5 || details.length < 12
      || !hasRegisteredInstitution(institutionId, Object.keys(institutionNames))) {
      setError('Select a registered institution, add a short issue title, and provide enough detail to review.');
      return;
    }

    const now = new Date().toISOString();
    const signal: FieldSignal = {
      id: createLocalId('signal'),
      institutionId,
      institutionName,
      ...(assetName ? { assetName } : {}),
      ...(sourceConsoleDraftId ? { sourceConsoleDraftId } : {}),
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
    setSignalPage(0);
    setShowReportForm(false);
    setSourceConsoleDraftId(null);
    setReportTitle('');
    setReportDetails('');
    navigate('/workspace/commons');
    form.reset();
  }

  function closeReportForm() {
    setShowReportForm(false);
    setSourceConsoleDraftId(null);
    setReportTitle('');
    setReportDetails('');
    contributeButtonRef.current?.focus();
    if (parseConsoleDraftId(window.location.search)) navigate('/workspace/commons');
  }

  function changeStatus(status: SignalStatus) {
    if (!selected || selected.scenario) return;
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
    if (!selected || selected.scenario || !note.trim()) return;
    const now = new Date().toISOString();
    const update = { id: createLocalId('update'), text: note.trim(), createdAt: now };
    const saved = persist(signals.map(signal => signal.id === selected.id
      ? { ...signal, updatedAt: now, updates: [update, ...signal.updates] }
      : signal));
    if (saved) setNote('');
  }

  return (
    <WorkspaceLayout currentContext="commons">
      <div className="signal-desk">
        <div className="signal-desk-head">
          <PageHead
            eyebrow="COMMONS / RADAR KWA GROUND"
            title="Signals from the ground"
          />
          <div className="signal-head-actions">
            <div className="commons-contribute">
              <button
                aria-expanded={showContributionMenu}
                className="signal-primary-action"
                onClick={() => {
                  if (showReportForm) closeReportForm();
                  else setShowContributionMenu(value => !value);
                }}
                ref={contributeButtonRef}
                type="button"
              >
                {showReportForm ? 'Close form' : '+ Contribute'}
              </button>
              {showContributionMenu && (
                <div aria-label="Contribution options" className="commons-contribute-menu" role="group">
                  <button
                    onClick={() => {
                      setShowContributionMenu(false);
                      setShowReportForm(true);
                    }}
                    type="button"
                  >
                    Add a signal
                  </button>
                  <button
                    onClick={() => {
                      setShowContributionMenu(false);
                      setCommonsView('opportunities');
                    }}
                    type="button"
                  >
                    Explore opportunities
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="commons-modebar" aria-label="Commons views">
          <button
            aria-pressed={commonsView === 'signals'}
            className={commonsView === 'signals' ? 'is-active' : ''}
            onClick={() => setCommonsView('signals')}
            type="button"
          >
            Signals <span>{visibleSignals.length.toString().padStart(2, '0')}</span>
          </button>
          <button
            aria-pressed={commonsView === 'opportunities'}
            className={commonsView === 'opportunities' ? 'is-active' : ''}
            onClick={() => setCommonsView('opportunities')}
            type="button"
          >
            Opportunities
          </button>
          <button
            aria-pressed={commonsView === 'decisions'}
            className={commonsView === 'decisions' ? 'is-active' : ''}
            onClick={() => setCommonsView('decisions')}
            type="button"
          >
            Decisions <span>{governance.proposals.length.toString().padStart(2, '0')}</span>
          </button>
          <label className="commons-scope-select" hidden={commonsView === 'opportunities'}>
            <span className="visually-hidden">Institution scope</span>
            <select
              onChange={event => {
                const nextInstitutionId = (event.currentTarget as HTMLSelectElement).value;
                setInstitutionScope(nextInstitutionId);
                setSignalPage(0);
              }}
              value={institutionScope}
            >
              <option value="">All institutions</option>
              {institutionOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <span className="commons-mode-hint">{scopeInstitutionName}</span>
        </nav>

        {error && <p className="local-data-warning" role="alert">{error}</p>}

        {showReportForm && (
          <form className="signal-report-form" onSubmit={submitReport}>
            <div className="signal-form-heading">
              <div><p className="eyebrow">NEW SIGNAL</p><h2>What did you notice?</h2></div>
            </div>
            <div className="signal-form-grid">
              <label>Institution
                <select name="institution" ref={reportInstitutionRef} required>
                  <option value="">Select a registered institution</option>
                  {Object.entries(institutionNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </label>
              <label>Asset or place
                <input name="asset" placeholder="Optional · select or describe if known" />
              </label>
              <label>Location
                <input name="location" placeholder="Town, site, or building" />
              </label>
              <label className="signal-form-wide">Signal headline
                <input maxLength={120} name="title" onInput={event => setReportTitle((event.currentTarget as HTMLInputElement).value)} placeholder="Describe what you noticed" required value={reportTitle} />
              </label>
              <label className="signal-form-wide">What happened?
                <textarea maxLength={1200} minLength={12} name="details" onInput={event => setReportDetails((event.currentTarget as HTMLTextAreaElement).value)} placeholder="Share what you saw. Keep observation separate from possible cause." required rows={3} value={reportDetails} />
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
              <span>{sourceConsoleDraftId ? 'Review and edit this observation before saving; the Console draft remains unchanged.' : 'Urgency is a reporter’s note, not an automated priority.'}</span>
              <div>
                <button className="signal-quiet-action" onClick={closeReportForm} type="button">Cancel</button>
                <button className="signal-primary-action" type="submit">Save signal</button>
              </div>
            </div>
          </form>
        )}

        <section className="commons-governance" aria-labelledby="commons-governance-title" hidden={commonsView !== 'decisions'}>
          <div className="commons-governance-head">
            <div>
              <p className="eyebrow">GOVERNANCE / {activeInstitutionName.toUpperCase()}</p>
              <h2 id="commons-governance-title">Decision register</h2>
            </div>
            {isSteward && selected && !selected.scenario && (
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
              <small>Authority is local to the working record and should be confirmed by the responsible institution.</small>
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

        <section aria-labelledby="commons-opportunities-title" className="commons-opportunities" hidden={commonsView !== 'opportunities'}>
          <header className="commons-opportunities-head">
            <div>
              <p className="eyebrow">COMMONS / OPPORTUNITIES</p>
              <h2 id="commons-opportunities-title">Example opportunities</h2>
            </div>
            <span>Not open for applications</span>
          </header>
          <div className="commons-opportunity-workspace">
            <nav aria-label="Example work contexts" className="commons-opportunity-list">
              {WORK_OPPORTUNITIES.map(opportunity => (
                <button
                  aria-pressed={selectedOpportunity.id === opportunity.id}
                  className={selectedOpportunity.id === opportunity.id ? 'is-selected' : ''}
                  key={opportunity.id}
                  onClick={() => setSelectedOpportunityId(opportunity.id)}
                  type="button"
                >
                  <span>{opportunity.discipline} · Example</span>
                  <strong>{opportunity.title}</strong>
                  <small>{opportunity.context}</small>
                </button>
              ))}
            </nav>
            <article className="commons-opportunity-detail">
              <div className="commons-opportunity-meta">
                <span>{selectedOpportunity.discipline}</span>
                <span>Example path</span>
              </div>
              <h3>{selectedOpportunity.title}</h3>
              <p>{selectedOpportunity.summary}</p>
              <dl>
                <div>
                  <dt>Scope</dt>
                  <dd>{selectedOpportunity.scope}</dd>
                </div>
                <div>
                  <dt>What it could produce</dt>
                  <dd>{selectedOpportunity.deliverables.join(' · ')}</dd>
                </div>
                <div>
                  <dt>Skills</dt>
                  <dd>{selectedOpportunity.capability.join(' · ')}</dd>
                </div>
              </dl>
              <p className="commons-opportunity-disclosure">Example only · Terms not published · No application or work is open.</p>
            </article>
          </div>
        </section>

        <section aria-label="Field signal workspace" className="signal-workspace" hidden={commonsView !== 'signals'}>
          <aside className="signal-queue">
            <div className="commons-signal-tools">
              <label className="signal-search">
                <span aria-hidden="true">⌕</span>
                <input aria-label="Search signals" onInput={event => {
                  setSearch((event.currentTarget as HTMLInputElement).value);
                  setSignalPage(0);
                }} placeholder="Find a signal" value={search} />
              </label>
              <details className="commons-signal-filter">
                <summary>{filter === 'all' ? 'Filter' : statusLabels[filter]}</summary>
                <div aria-label="Filter signals by status" className="signal-filters" role="group">
                  {filters.map(item => (
                    <button
                      aria-pressed={filter === item}
                      className={filter === item ? 'is-active' : ''}
                      key={item}
                      onClick={event => {
                        setFilter(item);
                        setSignalPage(0);
                        (event.currentTarget as HTMLButtonElement).closest('details')?.removeAttribute('open');
                      }}
                      type="button"
                    >
                      {item === 'all' ? 'All' : statusLabels[item]}
                    </button>
                  ))}
                </div>
              </details>
            </div>
            <div className="signal-list">
              {paginatedSignals.items.map(signal => (
                <button
                  aria-current={selected?.id === signal.id ? 'true' : undefined}
                  className={`signal-list-item${selected?.id === signal.id ? ' is-selected' : ''}`}
                  key={signal.id}
                  onClick={() => {
                    setSelectedId(signal.id);
                  }}
                  type="button"
                >
                  <span className={`signal-status-mark signal-status-${signal.status}`} />
                  <span className="signal-list-copy">
                    <small className="commons-signal-meta">{signalCategory(signal)} · {signal.scenario ? 'Example signal' : formatSignalDate(signal.updatedAt)}</small>
                    <strong>{signal.title}</strong>
                    <small>{signalPlace(signal)}</small>
                  </span>
                  <span className="signal-list-date" aria-hidden="true">→</span>
                </button>
              ))}
              {loaded && paginatedSignals.items.length === 0 && (
                <p className="signal-list-empty">
                  {search.trim() || filter !== 'all' || institutionScope
                    ? 'No signals match this view.'
                    : 'No signals here yet.'}
                </p>
              )}
            </div>
            {paginatedSignals.pageCount > 0 && (
              <nav className="radar-pagination" aria-label="Signal pages">
                <span aria-live="polite">
                  Showing {paginatedSignals.page * RADAR_PAGE_SIZE + 1}–{paginatedSignals.page * RADAR_PAGE_SIZE + paginatedSignals.items.length} of {paginatedSignals.total} local matches
                </span>
                <div>
                  <button
                    aria-label="Previous signal page"
                    disabled={paginatedSignals.page === 0}
                    onClick={() => setSignalPage(page => Math.max(0, page - 1))}
                    type="button"
                  >
                    Previous
                  </button>
                  <span>Page {paginatedSignals.page + 1} of {paginatedSignals.pageCount}</span>
                  <button
                    aria-label="Next signal page"
                    disabled={paginatedSignals.page >= paginatedSignals.pageCount - 1}
                    onClick={() => setSignalPage(page => Math.min(paginatedSignals.pageCount - 1, page + 1))}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </nav>
            )}
            {featuredPossibility && (
              <section className="commons-featured-opportunity">
                <p className="eyebrow">POSSIBILITY / EXAMPLE SIGNAL</p>
                <h3>{featuredPossibility.title}</h3>
                <p>{signalPlace(featuredPossibility)}</p>
                <button
                  onClick={() => {
                    setCommonsView('signals');
                    setSelectedId(featuredPossibility.id);
                    setInstitutionScope('');
                    setSearch('');
                    setFilter('all');
                    setSignalPage(0);
                  }}
                  type="button"
                >
                  Review signal <span aria-hidden="true">→</span>
                </button>
                <small>Illustrative · not verified</small>
              </section>
            )}
          </aside>

          <RadarSpatialPanel signals={visibleSignals} />

          <article className="signal-detail">
            {selected ? (
              <>
                <header className="signal-detail-head">
                  <div>
                    <div className="signal-detail-kickers">
                      <span className={`signal-status-label signal-status-${selected.status}`}>{statusLabels[selected.status]}</span>
                      {selected.scenario && <span className="signal-scenario-label">EXAMPLE SIGNAL</span>}
                    </div>
                    <h2>{selected.title}</h2>
                    <p>{signalContext(selected)}</p>
                    {selected.sourceConsoleDraftId && (
                      <button
                        className="signal-source-console-link"
                        onClick={() => navigate(`/workspace/institutions/school-console?draft=${encodeURIComponent(selected.sourceConsoleDraftId!)}#school-draft-${encodeURIComponent(selected.sourceConsoleDraftId!)}`)}
                        type="button"
                      >
                        Open source Console draft
                      </button>
                    )}
                  </div>
                  <span className="signal-updated">{selected.scenario ? 'ILLUSTRATIVE' : `UPDATED ${formatSignalDate(selected.updatedAt).toUpperCase()}`}</span>
                </header>
                <section className="signal-observation">
                  <p className="eyebrow">OBSERVATION</p>
                  <p>{selected.details}</p>
                  {selected.scenario && <small>Illustrative record · not live or verified.</small>}
                </section>
                {selected.scenario && (
                  <details aria-label="Example evidence and review boundary" className="signal-scenario-evidence">
                    <summary>Evidence checks</summary>
                    <dl>
                      <div><dt>Suspected cause</dt><dd>{selected.suspectedCause ?? 'Unknown; not assessed.'}</dd></div>
                      <div><dt>Verified priority</dt><dd>{selected.verifiedPriority === 'not-assessed' ? 'Not assessed' : 'Unknown'}</dd></div>
                      <div><dt>Evidence on hand</dt><dd>{selected.evidenceOnHand?.join(' ') ?? 'No evidence attached.'}</dd></div>
                      <div><dt>Missing checks</dt><dd>{selected.missingChecks?.join(' · ') ?? 'No checks documented.'}</dd></div>
                    </dl>
                  </details>
                )}
                <section className="signal-next-step">
                  <div>
                    <p className="eyebrow">NEXT STEP</p>
                    <strong>
                      {selected.scenario ? selected.suggestedNextStep ?? 'Review evidence with an authorized person.' :
                        selected.status === 'new' ? 'Review the observation' :
                        selected.status === 'triaged' ? 'Steward review before work' :
                          selected.status === 'brief' ? 'Approved work brief' : 'Observation closed'}
                    </strong>
                    <span>{selected.scenario
                      ? 'Example only · no work authorized.'
                      : selected.status === 'brief' && !approvedProposal
                        ? 'No approved work brief is linked.'
                        : 'Steward decision required before work.'}</span>
                  </div>
                  {!selected.scenario && selected.status === 'new' && <button className="signal-secondary-action" onClick={() => changeStatus('triaged')} type="button">Move to triage</button>}
                  {!selected.scenario && selected.status === 'triaged' && <button className="signal-primary-action" onClick={() => setCommonsView('decisions')} type="button">Open decision register</button>}
                  {!selected.scenario && selected.status === 'brief' && approvedProposal && <button className="signal-primary-action" onClick={() => navigate(`/workspace/workbench?proposal=${encodeURIComponent(approvedProposal.id)}`)} type="button">Open approved work brief</button>}
                  {!selected.scenario && selected.status !== 'resolved' && isSteward && <button className="signal-quiet-action" onClick={() => changeStatus('resolved')} type="button">Close observation</button>}
                  {!selected.scenario && selected.status === 'resolved' && <button className="signal-secondary-action" onClick={() => changeStatus('new')} type="button">Reopen</button>}
                </section>
                <details className="signal-history">
                  <summary className="signal-history-heading"><span>Activity &amp; notes</span><span>{selected.updates.length.toString().padStart(2, '0')}</span></summary>
                  {selected.scenario
                    ? <p className="signal-scenario-readonly">Example history is not editable.</p>
                    : (
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
                    )}
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
                <h2>{loaded ? 'Nothing here yet.' : 'Loading signals…'}</h2>
                <p>{loaded ? 'Add a signal or explore opportunities.' : 'Please wait.'}</p>
              </div>
            )}
          </article>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
