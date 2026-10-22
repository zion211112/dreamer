'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  FileText,
  Focus,
  List,
  ListChecks,
  Network,
  Plus,
  RotateCcw,
  ScrollText,
  UsersRound,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Tender } from '@/lib/tender';
import type { WorkspaceContextOption, WorkspaceKey } from '@/lib/workspace';
import { signOut } from '@/lib/supabase/sign-out';

interface WorkspaceShellProps {
  initialTenders?: Tender[];
  initialBriefs?: unknown[];
  userEmail: string;
  localMode?: boolean;
  defaultWorkspace?: WorkspaceKey;
  contexts?: WorkspaceContextOption[];
  defaultContextKey?: string;
  canPersistPreference?: boolean;
}

type WorkspaceView = 'topology' | 'problems' | 'sequence' | 'capability' | 'roll';

interface ProblemDraft {
  id: string;
  title: string;
  place: string;
  detail: string;
  measure: string;
}

interface TopologyRecord {
  icon: string;
  title: string;
  short: string;
  type: string;
  state: string;
  meta: string;
  source: string;
  description: string;
  evidence: string[];
  hint: string;
  relations: string[];
  actions: [string, string][];
}

const VIEWS: { key: WorkspaceView; label: string; icon: typeof Network }[] = [
  { key: 'topology', label: 'Topology', icon: Network },
  { key: 'problems', label: 'Problem briefs', icon: FileText },
  { key: 'sequence', label: 'Work sequence', icon: ListChecks },
  { key: 'capability', label: 'Crew & capability', icon: UsersRound },
  { key: 'roll', label: 'The Roll', icon: ScrollText },
];

const VIEW_COPY: Record<WorkspaceView, { kicker: string; title: string; subtitle: string }> = {
  topology: {
    kicker: '01 / RELATIONSHIP FIELD',
    title: 'Commons',
    subtitle: 'People · assets · work · evidence',
  },
  problems: {
    kicker: '02 / INTAKE REGISTER',
    title: 'Problem briefs',
    subtitle: 'Observed friction, before prescribed solutions.',
  },
  sequence: {
    kicker: '03 / DELIVERY LOGIC',
    title: 'Work sequence',
    subtitle: 'Six gates. No implied progress.',
  },
  capability: {
    kicker: '04 / PEOPLE & PROOF',
    title: 'Crew & capability',
    subtitle: 'Claims become useful when their scope is clear.',
  },
  roll: {
    kicker: '05 / EVIDENCE & PROVENANCE',
    title: 'The Roll',
    subtitle: 'A record trail, not a truth machine.',
  },
};

const RECORDS: Record<string, TopologyRecord> = {
  site: {
    icon: '⌂',
    title: 'Host institution',
    short: 'Institutional context',
    type: 'Context',
    state: 'Illustrative',
    meta: 'CONTEXT / UNCONFIRMED',
    source: 'Prototype example',
    description: 'Operational context, awaiting confirmation.',
    evidence: [
      'No site confirmation or authorised host is attached.',
      'No baseline or acceptance criteria are recorded.',
    ],
    hint: 'Confirm the host and baseline before scoping equipment.',
    relations: [
      'Solar crop dehydrator · conceptual association.',
      'The Roll · intended evidence destination.',
    ],
    actions: [['Draft a problem brief', 'draft'], ['Open work sequence', 'sequence']],
  },
  dryer: {
    icon: '◔',
    title: 'Solar crop dehydrator',
    short: 'Asset hypothesis',
    type: 'Conceptual asset proposal',
    state: 'Proposed',
    meta: 'HYPOTHESIS / UNTESTED',
    source: 'Illustrative brief',
    description: 'A drying concept with an unvalidated need and design.',
    evidence: [
      'Crop-loss baseline is unknown.',
      'No validated design, cost or performance test.',
      'No funding commitment or host acceptance.',
    ],
    hint: 'Measure crop, volume, season, current loss and food-safety needs first.',
    relations: [
      'Host institution · not confirmed.',
      'Fabrication package · possible dependency.',
    ],
    actions: [['Draft a problem brief', 'draft'], ['Open work sequence', 'sequence']],
  },
  fab: {
    icon: '⌁',
    title: 'Fabrication package',
    short: 'Potential work package',
    type: 'Potential work package',
    state: 'Unscoped',
    meta: 'WORK / UNSCOPED',
    source: 'Illustrative decomposition',
    description: 'Possible frame-and-assembly work. No job is approved.',
    evidence: ['No drawing or specification.', 'No crew, quotation or completion record.'],
    hint: 'Define requirements, materials, safety and acceptance before a quote.',
    relations: ['Solar crop dehydrator · potential parent concept.'],
    actions: [['Define work sequence', 'sequence'], ['Draft a problem brief', 'draft']],
  },
  roll: {
    icon: '▤',
    title: 'The Roll',
    short: 'Evidence & provenance',
    type: 'Evidence layer',
    state: 'No evidence',
    meta: 'PROVENANCE / CONCEPT',
    source: 'Product concept',
    description: 'A proposed record trail for artifacts, tests and acceptance.',
    evidence: [
      'No verified project evidence is connected.',
      'Review and acceptance must remain distinct from submission.',
    ],
    hint: 'A file or badge is not, by itself, proof that a build works.',
    relations: [
      'Host institution · possible verifier if authorised.',
      'Fabrication · possible contribution record.',
    ],
    actions: [['Review capability schema', 'capability'], ['Open work sequence', 'sequence']],
  },
};

const SEQUENCE = [
  { number: '01', title: 'Discover', description: 'Observe the work with the people affected.', state: 'Open', first: true },
  { number: '02', title: 'Diagnose', description: 'Separate symptoms, causes and assumptions.', state: 'Waiting' },
  { number: '03', title: 'Scope', description: 'Requirements · alternatives · cost · acceptance.', state: 'Waiting' },
  { number: '04', title: 'Build', description: 'Inputs, responsibilities, safety and revisions.', state: 'Waiting' },
  { number: '05', title: 'Test & accept', description: 'Compare results with the agreed criteria.', state: 'Waiting' },
  { number: '06', title: 'Maintain & learn', description: 'Repairs, failures and repeatable lessons.', state: 'Waiting' },
];

const CAPABILITY_FIELDS = [
  ['Claim', 'The work a person says they can do.'],
  ['Work sample', 'Artifact, task or demonstration.'],
  ['Verifier', 'Who checked it, and how.'],
  ['Scope', 'What the evidence does—and does not—establish.'],
  ['Recency', 'Only where freshness matters to the work.'],
];

const ROLL_FIELDS = [
  ['Contribution', 'Who did what.'],
  ['Artifact', 'What was produced, with a source and version.'],
  ['Test', 'Method, conditions, result and limitations.'],
  ['Acceptance', 'Who accepted, rejected or deferred—and why.'],
  ['Maintenance', 'Failure, repair, operating state and next review.'],
  ['Integrity', 'Submitted evidence remains distinct from reviewed evidence.'],
];

export function WorkspaceShell({
  userEmail,
  localMode = false,
  contexts = [],
}: WorkspaceShellProps) {
  const [view, setView] = useState<WorkspaceView>('topology');
  const [selectedRecordId, setSelectedRecordId] = useState('site');
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [topologyMode, setTopologyMode] = useState<'graph' | 'index'>('graph');
  const [drafts, setDrafts] = useState<ProblemDraft[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', place: '', detail: '', measure: '' });
  const titleInput = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentCopy = VIEW_COPY[view];
  const selectedRecord = RECORDS[selectedRecordId] ?? RECORDS.site;
  const selectedDraft = selectedDraftId
    ? drafts.find(draft => draft.id === selectedDraftId)
    : undefined;

  const notify = useCallback((message: string) => toast(message), []);

  const resetView = useCallback(() => {
    setView('topology');
    setSelectedRecordId('site');
    setSelectedDraftId(null);
    setTopologyMode('graph');
    notify('View reset.');
  }, [notify]);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    if (modalOpen) titleInput.current?.focus();
  }, [modalOpen]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && modalOpen) {
        closeModal();
        return;
      }
      const target = event.target;
      const isEditing = target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !isEditing) {
        event.preventDefault();
        openModal();
      }
    }

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [closeModal, modalOpen, openModal]);

  function selectRecord(id: string) {
    setSelectedRecordId(id);
    setSelectedDraftId(null);
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft: ProblemDraft = {
      id: `draft-${Date.now()}-${drafts.length}`,
      title: form.title.trim(),
      place: form.place.trim(),
      detail: form.detail.trim(),
      measure: form.measure.trim(),
    };
    setDrafts(current => [draft, ...current]);
    setForm({ title: '', place: '', detail: '', measure: '' });
    setSelectedDraftId(null);
    setView('problems');
    closeModal();
    notify('Saved to this session.');
  }

  function exportDraft(draft: ProblemDraft) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], {
      type: 'application/json',
    }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'apt-labs-problem-draft.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Draft exported.');
  }

  function handleInspectorAction(action: string) {
    if (action === 'draft') {
      openModal();
    } else if (action === 'export' && selectedDraft) {
      exportDraft(selectedDraft);
    } else if (action === 'sequence' || action === 'capability') {
      setView(action);
    }
  }

  const inspectorTitle = selectedDraft?.title ?? selectedRecord.title;
  const inspectorDescription = selectedDraft?.detail ?? selectedRecord.description;
  const evidence = selectedDraft
    ? ['Entered locally; not independently verified.', 'Baseline and acceptance method remain open.']
    : selectedRecord.evidence;
  const relations = selectedDraft
    ? [
      `Site · ${selectedDraft.place || 'Not specified'}`,
      `Measure · ${selectedDraft.measure || 'Not defined'}`,
    ]
    : selectedRecord.relations;
  const inspectorActions: [string, string][] = selectedDraft
    ? [['Open work sequence', 'sequence'], ['Export JSON', 'export']]
    : selectedRecord.actions;

  return (
    <div className="workspace-atlas">
      <header className="atlas-header">
        <a className="atlas-brand" href="/workspace" aria-label="APT-LABS workspace">
          <span className="atlas-brand-mark"><Boxes aria-hidden="true" size={17} strokeWidth={1.5} /></span>
          <span>APT<span>—</span>LABS</span>
        </a>
        <div className="atlas-header-context" aria-label="Workspace location">
          <span>FIELD ATLAS</span>
          <i />
          <span>WORKSPACE <b>{String(VIEWS.findIndex(item => item.key === view) + 1).padStart(2, '0')} / 05</b></span>
          <i />
          <span>{localMode ? 'LOCAL SESSION' : 'WORKSPACE'}</span>
        </div>
        <div className="atlas-header-actions">
          <span className={`atlas-session-pill ${localMode ? 'is-local' : ''}`}>
            <i />{localMode ? 'Local session' : 'Signed in'}
          </span>
          <button className="atlas-icon-button" type="button" onClick={resetView} aria-label="Reset workspace view" title="Reset view">
            <RotateCcw aria-hidden="true" size={15} />
          </button>
        </div>
      </header>

      <div className="atlas-layout">
        <aside className="atlas-rail">
          <div className="atlas-rail-label">Workspace index</div>
          <nav className="atlas-nav" aria-label="Workspace modules">
            {VIEWS.map((item, index) => {
              const Icon = item.icon;
              const active = item.key === view;
              return (
                <button
                  key={item.key}
                  className={`atlas-nav-item${active ? ' is-active' : ''}`}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setView(item.key)}
                >
                  <Icon aria-hidden="true" size={16} strokeWidth={1.6} />
                  <span>{item.label}</span>
                  {item.key === 'problems'
                    ? <span className="atlas-nav-count">{String(drafts.length).padStart(2, '0')}</span>
                    : <span className="atlas-nav-index">{String(index + 1).padStart(2, '0')}</span>}
                </button>
              );
            })}
          </nav>
          <div className="atlas-field-note">
            <div className="atlas-orbit" aria-hidden="true"><i /></div>
            <span className="atlas-rail-label">Field note / 01</span>
            <p>Observe before designing.</p>
          </div>
          <div className="atlas-account">
            <span className="atlas-avatar" aria-hidden="true">{(userEmail[0] || 'O').toUpperCase()}</span>
            <span className="atlas-account-copy">
              <strong>{userEmail.split('@')[0] || 'operator'}</strong>
              <span>{userEmail || 'Local session'}</span>
            </span>
            <button className="atlas-signout" type="button" onClick={() => signOut()}>Sign out</button>
          </div>
        </aside>

        <main className="atlas-main">
          <div className="atlas-main-scroll">
            <div className="atlas-main-top">
              <div>
                <div className="atlas-kicker">{currentCopy.kicker}</div>
                <div className="atlas-title-row">
                  <h1>{currentCopy.title}</h1>
                  <span className="atlas-title-state"><i />{view === 'topology' ? 'In view' : view === 'problems' ? 'Local' : 'Schema'}</span>
                </div>
                <p className="atlas-subtitle">{currentCopy.subtitle}</p>
              </div>
              <div className="atlas-main-tools">
                {view === 'topology' && (
                  <>
                    <button className="atlas-button atlas-button-quiet" type="button" onClick={openModal}>
                      <Plus aria-hidden="true" size={14} /> New brief
                    </button>
                    <button className="atlas-icon-button" type="button" aria-label="Focus relationship field" title="Focus relationship field" onClick={() => canvasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                      <Focus aria-hidden="true" size={15} />
                    </button>
                  </>
                )}
                {view === 'problems' && (
                  <button className="atlas-button atlas-button-primary" type="button" onClick={openModal}>
                    <Plus aria-hidden="true" size={14} /> New brief
                  </button>
                )}
              </div>
            </div>

            {view === 'topology' && (
              <>
                <div className="atlas-metrics">
                  <div className="atlas-metric"><span>⌘</span><div><small>Nodes in model</small><strong>04</strong></div></div>
                  <div className="atlas-metric"><span>⌁</span><div><small>Verified links</small><strong>00</strong></div></div>
                  <div className="atlas-metric"><span>◌</span><div><small>Open evidence</small><strong>04</strong></div></div>
                </div>
                <div className="atlas-section-head">
                  <h2>Relationship field</h2><span>ILLUSTRATIVE MODEL / NOT LIVE</span>
                </div>
                <div className="atlas-canvas" ref={canvasRef}>
                  <div className="atlas-canvas-bar">
                    <div className="atlas-filetab"><i /><strong>commons</strong><span>/</span><span>topology.graph</span></div>
                    <div className="atlas-view-switch" role="group" aria-label="Topology view">
                      <button type="button" className={topologyMode === 'graph' ? 'is-active' : ''} aria-pressed={topologyMode === 'graph'} onClick={() => setTopologyMode('graph')}>
                        <Network aria-hidden="true" size={13} /> Graph
                      </button>
                      <button type="button" className={topologyMode === 'index' ? 'is-active' : ''} aria-pressed={topologyMode === 'index'} onClick={() => setTopologyMode('index')}>
                        <List aria-hidden="true" size={13} /> Index
                      </button>
                    </div>
                  </div>
                  {topologyMode === 'graph' ? (
                    <div className="atlas-graph" aria-label="Illustrative asset relationships">
                      <svg className="atlas-edges" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M165 90 C255 55 390 52 500 78" />
                        <path className="is-soft" d="M500 78 C620 105 690 190 825 258" />
                        <path d="M825 258 C760 330 585 362 400 342" />
                        <path className="is-soft" d="M400 342 C280 310 180 220 165 90" />
                        <circle cx="315" cy="65" r="3" /><circle cx="660" cy="160" r="3" />
                        <circle cx="615" cy="350" r="3" /><circle cx="230" cy="260" r="3" />
                      </svg>
                      {Object.entries(RECORDS).map(([id, record]) => (
                        <button
                          key={id}
                          className={`atlas-node atlas-node-${id}${!selectedDraftId && selectedRecordId === id ? ' is-selected' : ''}`}
                          type="button"
                          aria-label={`Inspect ${record.title}`}
                          onClick={() => selectRecord(id)}
                        >
                          <i className="atlas-node-marker" />
                          <span className="atlas-node-glyph">{record.icon}</span>
                          <span className="atlas-node-copy"><strong>{record.title}</strong><small>{record.meta}</small></span>
                        </button>
                      ))}
                      <div className="atlas-graph-caption"><span><i />Connections are hypotheses</span><span>04 NODES · 00 VERIFIED LINKS</span></div>
                    </div>
                  ) : (
                    <div className="atlas-index-list">
                      {Object.entries(RECORDS).map(([id, record]) => (
                        <button key={id} type="button" className={`atlas-index-row${!selectedDraftId && selectedRecordId === id ? ' is-selected' : ''}`} onClick={() => selectRecord(id)}>
                          <span className="atlas-index-glyph">{record.icon}</span>
                          <span className="atlas-index-copy"><strong>{record.title}</strong><small>{record.type} · {record.state}</small></span>
                          <span className="atlas-state">{record.state}</span>
                          <ArrowUpRight aria-hidden="true" size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="atlas-node-foot"><span>Select a node to inspect its record</span><span>{topologyMode.toUpperCase()} / 01.05</span></div>
                <div className="atlas-underfield">
                  <div><small>Model state</small><strong>Illustrative structure</strong></div>
                  <div><small>Evidence</small><strong className="atlas-no-evidence">None verified</strong></div>
                  <div><small>Next transition</small><strong>Confirm the host</strong></div>
                </div>
                <div className="atlas-below">
                  <div className="atlas-mini">
                    <h3>Field conditions</h3>
                    <div><span>Site confirmation</span><strong>Pending</strong></div>
                    <div><span>Baseline</span><strong>Unknown</strong></div>
                    <div><span>Capital</span><strong>Unestablished</strong></div>
                  </div>
                  <div className="atlas-mini">
                    <h3>Sequence gates</h3>
                    <div><span>Observe → diagnose</span><strong>01 / 06</strong></div>
                    <div><span>Scope → build</span><strong>Not entered</strong></div>
                    <div><span>Test → maintain</span><strong>Not entered</strong></div>
                  </div>
                </div>
              </>
            )}

            {view === 'problems' && (
              <section className="atlas-block">
                <div className="atlas-block-head">
                  <div><h2>Local drafts</h2><p>Session-scoped · not submitted</p></div>
                  <span className="atlas-state atlas-state-draft">{String(drafts.length).padStart(2, '0')} DRAFTS</span>
                </div>
                <div className="atlas-block-body">
                  {drafts.length ? drafts.map(draft => (
                    <article className="atlas-draft-card" key={draft.id}>
                      <div className="atlas-draft-card-head"><h3>{draft.title}</h3><span className="atlas-state atlas-state-draft">LOCAL DRAFT</span></div>
                      <div className="atlas-fact-row"><span>Site / context</span><strong>{draft.place || 'Not specified'}</strong></div>
                      <p>{draft.detail}</p>
                      <div className="atlas-fact-row"><span>Measure</span><strong>{draft.measure || 'Not defined'}</strong></div>
                      <button className="atlas-text-action" type="button" onClick={() => { setSelectedDraftId(draft.id); setView('problems'); }}>
                        Inspect draft <ArrowUpRight aria-hidden="true" size={13} />
                      </button>
                    </article>
                  )) : (
                    <div className="atlas-empty">
                      <span><Plus aria-hidden="true" size={16} /></span>
                      <strong>No drafts in this session.</strong>
                      <p>Create a local note to record an observed problem.</p>
                      <button className="atlas-button" type="button" onClick={openModal}>Create a brief</button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {view === 'sequence' && (
              <section className="atlas-block">
                <div className="atlas-block-head">
                  <div><h2>Operating sequence</h2><p>Each gate needs evidence before transition.</p></div>
                  <span className="atlas-state">NOT STARTED</span>
                </div>
                <div className="atlas-block-body">
                  {SEQUENCE.map(step => (
                    <div className="atlas-sequence-step" key={step.number}>
                      <span className="atlas-step-number">{step.number}</span>
                      <div><strong>{step.title}</strong><p>{step.description}</p></div>
                      <span className={`atlas-state${step.first ? ' atlas-state-open' : ''}`}>{step.state}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {view === 'capability' && (
              <section className="atlas-block">
                <div className="atlas-block-head">
                  <div><h2>Capability record</h2><p>Suggested fields · no people connected</p></div>
                  <span className="atlas-state atlas-state-open">SCHEMA</span>
                </div>
                <div className="atlas-block-body">
                  {CAPABILITY_FIELDS.map(([label, description]) => (
                    <div className="atlas-schema-row" key={label}><strong>{label}</strong><span>{description}</span></div>
                  ))}
                </div>
              </section>
            )}

            {view === 'roll' && (
              <section className="atlas-block">
                <div className="atlas-block-head">
                  <div><h2>Provenance ledger</h2><p>Proposed structure · no live ledger connected</p></div>
                  <span className="atlas-state atlas-state-open">CONCEPT</span>
                </div>
                <div className="atlas-block-body">
                  {ROLL_FIELDS.map(([label, description]) => (
                    <div className="atlas-schema-row" key={label}><strong>{label}</strong><span>{description}</span></div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        <aside className="atlas-inspector">
          <div className="atlas-inspector-head">
            <div className="atlas-inspector-top"><span>01 — Record inspector</span><span className="atlas-inspector-icon">{selectedDraft ? '+' : selectedRecord.icon}</span></div>
            <h2>{inspectorTitle}</h2>
            <p>{inspectorDescription}</p>
            <div className="atlas-chips">
              <span className="atlas-chip"><i />{selectedDraft ? 'Local draft' : selectedRecord.state}</span>
              <span className="atlas-chip">{selectedDraft ? 'Problem brief' : selectedRecord.short}</span>
            </div>
          </div>
          <div className="atlas-inspector-scroll">
            <section className="atlas-inspector-section">
              <h3>Record metadata</h3>
              <div className="atlas-inspector-fact"><span>Class</span><strong>{selectedDraft ? 'User-authored draft' : selectedRecord.type}</strong></div>
              <div className="atlas-inspector-fact"><span>Provenance</span><strong>{selectedDraft ? 'Current browser session' : selectedRecord.source}</strong></div>
              <div className="atlas-inspector-fact"><span>Owner</span><strong>Unassigned</strong></div>
            </section>
            <section className="atlas-inspector-section">
              <h3>Evidence gaps</h3>
              {evidence.map(item => <div className="atlas-proof" key={item}><i /><span>{item}</span></div>)}
              <p className="atlas-hint">{selectedDraft
                ? 'Validate with affected people before selecting a solution.'
                : selectedRecord.hint}</p>
            </section>
            <section className="atlas-inspector-section">
              <h3>Relations</h3>
              {relations.map(item => <div className="atlas-proof" key={item}><i /><span>{item}</span></div>)}
            </section>
            <section className="atlas-inspector-section">
              <h3>Actions</h3>
              <div className="atlas-inspector-actions">
                {inspectorActions.map(([label, action]) => (
                  <button className="atlas-action-link" type="button" key={label} onClick={() => handleInspectorAction(action)}>
                    <span>{action === 'export' && <ArrowDownToLine aria-hidden="true" size={14} />}{label}</span>
                    {action !== 'export' && <ArrowRight aria-hidden="true" size={14} />}
                  </button>
                ))}
              </div>
            </section>
          </div>
          <div className="atlas-inspector-foot"><span><i />SESSION ONLY</span><span>NO SHARED WRITES</span></div>
        </aside>
      </div>

      <footer className="atlas-footer">
        <span><i /> {localMode ? 'LOCAL SESSION' : 'SIGNED-IN SESSION'} <span className="atlas-footer-muted">/ EXAMPLE DATA</span></span>
        <span>APT—LABS <span className="atlas-footer-muted">· FIELD ATLAS</span> <b>01.1</b></span>
        <span className="atlas-footer-contexts">{contexts.length > 0 ? `${contexts.length} contexts available` : 'No verified contexts'}</span>
      </footer>

      {modalOpen && (
        <div className="atlas-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="atlas-modal" role="dialog" aria-modal="true" aria-labelledby="atlas-modal-title">
            <div className="atlas-modal-head">
              <div><span className="atlas-kicker">Intake / local draft</span><h2 id="atlas-modal-title">New problem brief</h2><p>A local note. No network submission.</p></div>
              <button className="atlas-icon-button" type="button" aria-label="Close dialog" onClick={closeModal}><X aria-hidden="true" size={16} /></button>
            </div>
            <form className="atlas-form" onSubmit={saveDraft}>
              <label>Brief title<input ref={titleInput} required maxLength={100} placeholder="e.g. Produce loss during storage" value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} /></label>
              <label>Site / context<input maxLength={100} placeholder="Where does this occur?" value={form.place} onChange={event => setForm(current => ({ ...current, place: event.target.value }))} /></label>
              <label>Observed condition<textarea required maxLength={1200} rows={4} placeholder="What happens? Who is affected? What is known?" value={form.detail} onChange={event => setForm(current => ({ ...current, detail: event.target.value }))} /></label>
              <label>Measure of improvement<input maxLength={240} placeholder="What would a useful change look like?" value={form.measure} onChange={event => setForm(current => ({ ...current, measure: event.target.value }))} /></label>
              <div className="atlas-form-foot"><span>Stored in this page session only.</span><div><button className="atlas-button atlas-button-quiet" type="button" onClick={closeModal}>Cancel</button><button className="atlas-button atlas-button-primary" type="submit">Save local draft</button></div></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
