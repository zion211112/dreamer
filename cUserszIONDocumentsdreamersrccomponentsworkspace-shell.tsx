'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

interface WorkspaceShellProps {
  initialTenders: unknown[];
  initialBriefs: unknown[];
  userEmail: string;
  localMode?: boolean;
  defaultWorkspace?: string;
  contexts?: unknown[];
  defaultContextKey?: string;
  canPersistPreference?: boolean;
}

type View = 'topology' | 'problems' | 'sequence' | 'capability' | 'roll';

const VIEWS: View[] = ['topology', 'problems', 'sequence', 'capability', 'roll'];

interface NodeRecord {
  icon: string;
  title: string;
  short: string;
  type: string;
  state: string;
  meta: string;
  source: string;
  desc: string;
  evidence: string[];
  hint: string;
  relations: string[];
  actions: [string, string][];
}

const DATA: Record<string, NodeRecord> = {
  site: {
    icon: '⌂',
    title: 'Host institution',
    short: 'Institutional context',
    type: 'Context',
    state: 'Illustrative',
    meta: 'CONTEXT / UNCONFIRMED',
    source: 'Prototype example',
    desc: 'Operational context, awaiting confirmation.',
    evidence: ['No site confirmation or authorised host is attached.', 'No baseline or acceptance criteria are recorded.'],
    hint: 'Confirm the host and baseline before scoping equipment.',
    relations: ['Solar crop dehydrator · conceptual association.', 'The Roll · intended evidence destination.'],
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
    desc: 'A drying concept with an unvalidated need and design.',
    evidence: ['Crop-loss baseline is unknown.', 'No validated design, cost or performance test.', 'No funding commitment or host acceptance.'],
    hint: 'Measure crop, volume, season, current loss and food-safety needs first.',
    relations: ['Host institution · not confirmed.', 'Fabrication package · possible dependency.'],
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
    desc: 'Possible frame-and-assembly work. No job is approved.',
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
    desc: 'A proposed record trail for artifacts, tests and acceptance.',
    evidence: ['No verified project evidence is connected.', 'Review and acceptance must remain distinct from submission.'],
    hint: 'A file or badge is not, by itself, proof that a build works.',
    relations: ['Host institution · possible verifier if authorised.', 'Fabrication · possible contribution record.'],
    actions: [['Review capability schema', 'capability'], ['Open work sequence', 'sequence']],
  },
};

const VIEW_COPY: Record<View, [string, string, string]> = {
  topology: ['01 / RELATIONSHIP FIELD', 'Commons', 'People · assets · work · evidence'],
  problems: ['02 / INTAKE REGISTER', 'Problem briefs', 'Observed friction, before prescribed solutions.'],
  sequence: ['03 / DELIVERY LOGIC', 'Work sequence', 'Six gates. No implied progress.'],
  capability: ['04 / PEOPLE & PROOF', 'Crew & capability', 'Claims become useful when their scope is clear.'],
  roll: ['05 / EVIDENCE & PROVENANCE', 'The Roll', 'A record trail, not a truth machine.'],
};

const SEQUENCE = [
  { n: '01', title: 'Discover', desc: 'Observe the work with the people affected.', state: 'Open', kind: 'demo' },
  { n: '02', title: 'Diagnose', desc: 'Separate symptoms, causes and assumptions.', state: 'Waiting' },
  { n: '03', title: 'Scope', desc: 'Requirements · alternatives · cost · acceptance.', state: 'Waiting' },
  { n: '04', title: 'Build', desc: 'Inputs, responsibilities, safety and revisions.', state: 'Waiting' },
  { n: '05', title: 'Test & accept', desc: 'Compare results with the agreed criteria.', state: 'Waiting' },
  { n: '06', title: 'Maintain & learn', desc: 'Repairs, failures and repeatable lessons.', state: 'Waiting' },
];

const NAV_ICONS: Record<View, string> = {
  topology: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 7v4M12 11 6 16M12 11l6 5"/></svg>',
  problems: '<svg viewBox="0 0 24 24"><path d="M7 3.5h7l4 4V21H7zM14 4v4h4M10 13h5M10 16h5"/></svg>',
  sequence: '<svg viewBox="0 0 24 24"><path d="M4 6h5M4 12h5M4 18h5M12 6h8M12 12h8M12 18h8"/></svg>',
  capability: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.2 2.5-5 6-5s6 1.8 6 5M16 5.5a3 3 0 0 1 0 5.8M17 15c2.5.3 4 2 4 4.5"/></svg>',
  roll: '<svg viewBox="0 0 24 24"><path d="M6 4.5h12v15H6zM9 8h6M9 12h6M9 16h4"/></svg>',
};

const NAV_LABELS: Record<View, string> = {
  topology: 'Topology',
  problems: 'Problem briefs',
  sequence: 'Work sequence',
  capability: 'Crew & capability',
  roll: 'The Roll',
};

const NAV_INDEX: Record<View, string> = {
  topology: '01',
  problems: '02',
  sequence: '03',
  capability: '04',
  roll: '05',
};

export function WorkspaceShell({
  initialTenders,
  initialBriefs,
  userEmail,
  localMode = false,
}: WorkspaceShellProps) {
  const [selected, setSelected] = useState<string>('site');
  const [view, setViewState] = useState<View>('topology');
  const [mode, setMode] = useState<'graph' | 'index'>('graph');
  const [drafts, setDrafts] = useState<{ id: string; title: string; place: string; detail: string; measure: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [inspectDraftId, setInspectDraftId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', place: '', detail: '', measure: '' });
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [kicker, titleText, subtitle] = VIEW_COPY[view];
  const titleStateText = view === 'topology' ? 'In view' : view === 'problems' ? 'Local' : 'Schema';
  const node = DATA[selected];
  const inspectDraft = inspectDraftId ? drafts.find(d => d.id === inspectDraftId) : undefined;
  const src = inspectDraft || node;

  const evidenceItems = inspectDraft
    ? ['Entered locally; not independently verified.', 'Baseline and acceptance method remain open.']
    : src ? src.evidence : [];
  const relationsItems = inspectDraft
    ? [`Site · ${inspectDraft.place || 'Not specified'}`, `Measure · ${inspectDraft.measure || 'Not defined'}`]
    : src ? src.relations : [];
  const actionsItems = inspectDraft
    ? [['Open work sequence', 'sequence'], ['Export JSON', 'export']]
    : src ? src.actions : [];

  const pad = (n: number) => String(n).padStart(2, '0');

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2200);
  }, []);

  const select = useCallback((id: string) => {
    if (!DATA[id]) return;
    setSelected(id);
    setInspectDraftId(null);
  }, []);

  const setView = useCallback((v: View) => {
    setViewState(v);
  }, []);

  const toggleMode = useCallback((m: 'graph' | 'index') => {
    setMode(m);
  }, []);

  const resetView = useCallback(() => {
    setViewState('topology');
    setSelected('site');
    setMode('graph');
    setInspectDraftId(null);
    toast('View reset.');
  }, [toast]);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setModalOpen(false);
      return;
    }
    if (
      e.key === '/' &&
      !e.ctrlKey &&
      !e.metaKey &&
      e.target &&
      (e.target as HTMLElement).tagName !== 'INPUT' &&
      (e.target as HTMLElement).tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
      setModalOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  const handleAction = useCallback((action: string) => {
    if (action === 'draft') {
      openModal();
      return;
    }
    if (action === 'sequence' || action === 'capability') {
      setViewState(action);
      return;
    }
    if (action === 'export') {
      const p = inspectDraft;
      if (!p) return;
      const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const el = document.createElement('a');
      el.href = url;
      el.download = 'apt-labs-problem-draft.json';
      el.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Draft exported.');
    }
  }, [inspectDraft, openModal, toast, setViewState]);

  const saveDraft = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = {
      id: 'draft-' + (drafts.length + 1),
      title: form.title.trim(),
      place: form.place.trim(),
      detail: form.detail.trim(),
      measure: form.measure.trim(),
    };
    setDrafts([d, ...drafts]);
    setForm({ title: '', place: '', detail: '', measure: '' });
    setModalOpen(false);
    setViewState('problems');
    toast('Saved to this session.');
  }, [drafts.length, form, toast, setViewState]);

  const topologyNodes = ['site', 'dryer', 'fab', 'roll'].map(key => {
    const r = DATA[key];
    const isSel = selected === key;
    return (
      <button
        key={key}
        className={`node ${key} ${isSel ? 'selected' : ''}`}
        data-id={key}
        aria-label={`Inspect ${r.title}`}
        onClick={() => select(key)}
      >
        <span className="node-marker"></span>
        <span className="node-glyph">{r.icon}</span>
        <span className="node-copy">
          <span className="node-title">{r.title}</span>
          <span className="node-meta">{r.meta}</span>
        </span>
      </button>
    );
  });

  const listRows = Object.keys(DATA).map(key => {
    const r = DATA[key];
    const isSel = selected === key;
    return (
      <button key={key} className={`list-row ${isSel ? 'selected' : ''}`} data-id={key} onClick={() => select(key)}>
        <span className="glyph">{r.icon}</span>
        <span className="node-copy">
          <span className="node-title">{r.title}</span>
          <span className="node-meta">{r.type} · {r.state}</span>
        </span>
        <span className={`state ${r.state === 'Proposed' ? 'demo' : ''}`}>{r.state}</span>
      </button>
    );
  });

  return (
    <div className="app">
      <header>
        <div className="brand">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 18.5 12 4l8 14.5M7.1 13h9.8" fill="none" stroke="#50664f" strokeWidth={1.7} strokeLinecap="round" strokeLineJoin="round" />
              <circle cx={12} cy={4} r={1.5} fill="#b8a5cd" />
            </svg>
          </span>
          <span>APT—LABS</span>
        </div>
        <div className="header-context">
          <span>FIELD ATLAS</span>
          <i className="sep"></i>
          <span>WORKSPACE <b>01 / 05</b></span>
          <i className="sep"></i>
          <span>LOCAL MODEL</span>
        </div>
        <div className="header-right">
          <span className="local-pill">
            <i className="live-dot"></i> Local preview
          </span>
          <button className="icon-btn" id="reset" title="Reset view" aria-label="Reset view" onClick={resetView}>
            <svg viewBox="0 0 24 24">
              <path d="M4 7v5h5M5 12a7 7 0 1 0 2-5" />
            </svg>
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="left">
          <div className="left-label eyebrow">Workspace index</div>
          <nav className="nav-list" id="nav-list">
            {VIEWS.map(v => {
              const isActive = view === v;
              const showCount = v === 'problems';
              return (
                <button
                  key={v}
                  className={`nav ${isActive ? 'active' : ''}`}
                  data-view={v}
                  onClick={() => setView(v)}
                >
                  <span className="nav-icon" dangerouslySetInnerHTML={{ __html: NAV_ICONS[v] }} />
                  <span className="nav-text">{NAV_LABELS[v]}</span>
                  {showCount ? <span className="nav-count" id="count">{pad(drafts.length)}</span> : <span className="nav-index">{NAV_INDEX[v]}</span>}
                </button>
              );
            })}
          </nav>
          <div className="left-bottom">
            <div className="orbit-mark"><span className="orbit-dot"></span></div>
            <div className="left-foot-title">FIELD NOTE / 01</div>
            <div className="left-foot-copy">Observe before designing.</div>
          </div>
        </aside>

        <main className="main">
          {VIEWS.map(v => {
            const [kc, tc, sc] = VIEW_COPY[v];
            return (
              <section key={v} id={`view-${v}`} className="view-panel" hidden={view !== v}>
                <div className="main-top">
                  <div>
                    <div className="kicker" id={v === 'topology' ? 'kicker' : undefined}>{kc}</div>
                    <div className="title-row">
                      <h1 id={v === 'topology' ? 'title' : undefined}>{tc}</h1>
                      <span className="title-state" id={v === 'topology' ? 'title-state' : undefined}>
                        <span></span>
                        <b>{titleStateText}</b>
                      </span>
                    </div>
                    <p className="subtitle" id={v === 'topology' ? 'subtitle' : undefined}>{sc}</p>
                  </div>
                  {v === 'topology' && (
                    <div className="main-tools">
                      <button className="btn quiet" id="new-problem" onClick={openModal}>
                        <span>＋</span> New brief
                      </button>
                      <button
                        className="icon-btn"
                        id="focus-map"
                        aria-label="Focus topology"
                        title="Focus topology"
                        onClick={() => toast('Relationship field focused.')}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
                          <circle cx={12} cy={12} r={3} />
                        </svg>
                      </button>
                    </div>
                  )}
                  {v === 'problems' && (
                    <div className="main-tools">
                      <button className="btn primary" id="new-problem-2" onClick={openModal}>
                        ＋ New brief
                      </button>
                    </div>
                  )}
                </div>

                {v === 'topology' && (
                  <>
                    <div className="metrics">
                      <div className="metric">
                        <span className="metric-glyph">⌘</span>
                        <div>
                          <span className="metric-label">Nodes in model</span>
                          <strong className="metric-value">04</strong>
                        </div>
                      </div>
                      <div className="metric">
                        <span className="metric-glyph">⌁</span>
                        <div>
                          <span className="metric-label">Verified links</span>
                          <strong className="metric-value">00</strong>
                        </div>
                      </div>
                      <div className="metric">
                        <span className="metric-glyph">◌</span>
                        <div>
                          <span className="metric-label">Open evidence</span>
                          <strong className="metric-value">04</strong>
                        </div>
                      </div>
                    </div>
                    <div className="section-head">
                      <h2>Relationship field</h2>
                      <span className="rightnote">ILLUSTRATIVE MODEL / NOT LIVE</span>
                    </div>
                    <div className="canvas-shell">
                      <div className="canvas-bar">
                        <div className="filetab">
                          <span className="file-dot"></span>
                          <strong>commons</strong>
                          <span>/</span>
                          <span>topology.graph</span>
                        </div>
                        <div className="canvas-tools">
                          <span className="canvas-coords">x 042.8 · y 018.2</span>
                          <div className="switch">
                            <button
                              id="map"
                              className={mode === 'graph' ? 'active' : ''}
                              aria-pressed={mode === 'graph'}
                              onClick={() => toggleMode('graph')}
                            >
                              Graph
                            </button>
                            <button
                              id="list"
                              className={mode === 'index' ? 'active' : ''}
                              aria-pressed={mode === 'index'}
                              onClick={() => toggleMode('index')}
                            >
                              Index
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="topology" id="topology-canvas" style={{ display: mode === 'graph' ? 'block' : 'none' }}>

                        <svg className="tree-lines" viewBox="0 0 1000 420" preserveAspectRatio="none" ariaHidden={true}>
                          <defs>
                            <linearGradient id="linkTone" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0" stopColor="#a1b39a" />
                              <stop offset="1" stopColor="#c7b6d5" />
                            </linearGradient>
                          </defs>
                          <path className="edge" d="M165 90 C255 55 390 52 500 78" />
                          <circle className="edge-dot" cx={315} cy={65} r={3} />
                          <path className="edge soft" d="M500 78 C620 105 690 190 825 258" />
                          <circle className="edge-dot" cx={660} cy={160} r={3} />
                          <path className="edge" d="M825 258 C760 330 585 362 400 342" />
                          <circle className="edge-dot" cx={615} cy={350} r={3} />
                          <path className="edge soft" d="M400 342 C280 310 180 220 165 90" />
                          <circle className="edge-dot" cx={230} cy={260} r={3} />
                        </svg>
                        {topologyNodes}
                        <div className="canvas-caption">
                          <span><i></i> CONNECTIONS ARE HYPOTHESES</span>
                          <span>04 NODES · 00 VERIFIED LINKS</span>
                        </div>
                      </div>
                      <div className="list-view" id="list-view" style={{ display: mode === 'index' ? 'block' : 'none' }}>
                        {listRows}
                      </div>
                    </div>
                    <div className="node-foot">
                      <span>SELECT A NODE TO INSPECT ITS RECORD</span>
                      <span>GRAPH / 01.05</span>
                    </div>
                    <div className="underfield">
                      <div className="under-cell">
                        <div className="under-label">Model state</div>
                        <div className="under-value">Illustrative structure</div>
                      </div>
                      <div className="under-cell">
                        <div className="under-label">Evidence</div>
                        <div className="under-value"><em>None verified</em></div>
                      </div>
                      <div className="under-cell">
                        <div className="under-label">Next transition</div>
                        <div className="under-value">Confirm the host</div>
                      </div>
                    </div>
                    <div className="below" id="below">
                      <div className="mini">
                        <h3>Field conditions</h3>
                        <div className="line">
                          <span>Site confirmation</span>
                          <span className="value">Pending</span>
                        </div>
                        <div className="line">
                          <span>Baseline</span>
                          <span className="value">Unknown</span>
                        </div>
                        <div className="line">
                          <span>Capital</span>
                          <span className="value">Unestablished</span>
                        </div>
                      </div>
                      <div className="mini">
                        <h3>Sequence gates</h3>
                        <div className="line">
                          <span>Observe → diagnose</span>
                          <span className="value">01 / 06</span>
                        </div>
                        <div className="line">
                          <span>Scope → build</span>
                          <span className="value">Not entered</span>
                        </div>
                        <div className="line">
                          <span>Test → maintain</span>
                          <span className="value">Not entered</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {v === 'problems' && (
                  <div className="view-block">
                    <div className="block-head">
                      <div>
                        <h2>Local drafts</h2>
                        <p>Session-scoped · not submitted</p>
                      </div>
                      <span className="state draft" id="draft-state">
                        {pad(drafts.length)} DRAFTS
                      </span>
                    </div>
                    <div className="block-body" id="problems-list">
                      {drafts.length > 0 ? (
                        drafts.map(p => (
                          <article key={p.id} className="mini" style={{ margin: '0 0 10px' }}>
                            <div className="section-head">
                              <h2 style={{ fontSize: '11px', margin: 0 }}>{p.title}</h2>
                              <span className="state draft">LOCAL DRAFT</span>
                            </div>
                            <div className="line">
                              <span>Site / context</span>
                              <span className="value">{p.place || 'Not specified'}</span>
                            </div>
                            <p className="muted">{p.detail}</p>
                            <div className="line">
                              <span>Measure</span>
                              <span className="value">{p.measure || 'Not defined'}</span>
                            </div>
                            <button
                              className="btn quiet small"
                              data-draft={p.id}
                              onClick={() => {
                                setInspectDraftId(p.id);
                                setViewState('problems');
                              }}
                              style={{ marginTop: 8 }}
                            >
                              Inspect ↗
                            </button>
                          </article>
                        ))
                      ) : (
                        <div className="empty-state">
                          <div>
                            <div className="empty-glyph">＋</div>
                            No drafts in this session.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {v === 'sequence' && (
                  <div className="view-block">
                    <div className="block-head">
                      <div>
                        <h2>Operating sequence</h2>
                        <p>Each gate needs evidence before transition.</p>
                      </div>
                      <span className="state">NOT STARTED</span>
                    </div>
                    <div className="block-body">
                      {SEQUENCE.map(s => (
                        <div key={s.n} className="sequence-step">
                          <div className="step-num">{s.n}</div>
                          <div>
                            <div className="step-title">{s.title}</div>
                            <div className="step-desc">{s.desc}</div>
                          </div>
                          <span className={`state ${s.kind || ''}`}>{s.state}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {v === 'capability' && (
                  <div className="view-block">
                    <div className="block-head">
                      <div>
                        <h2>Capability record</h2>
                        <p>Suggested fields · no people connected</p>
                      </div>
                      <span className="state demo">SCHEMA</span>
                    </div>
                    <div className="block-body">
                      <div className="table-row">
                        <span className="table-key">Claim</span>
                        <span className="table-val">The work a person says they can do.</span>
                      </div>
                      <div className="table-row">
                        <span className="table-key">Work sample</span>
                        <span className="table-val">Artifact, task or demonstration.</span>
                      </div>
                      <div className="table-row">
                        <span className="table-key">Verifier</span>
                        <span className="table-val">Who checked it, and how.</span>
                      </div>
                      <div className="table-row">
                        <span className="table-key">Scope</span>
                        <span className="table-val">What the evidence does—and does not—establish.</span>
                      </div>
                      <div className="table-row">
                        <span className="table-key">Recency</span>
                        <span className="table-val">Only where freshness matters to the work.</span>
                      </div>
                    </div>
                  </div>
                )}

                {v === 'roll' && (
                  <div className="view-block">
                    <div className="block-head">
                      <div>
                        <h2>Provenance ledger</h2>
                        <p>Proposed structure · no live ledger connected</p>
                      </div>
                      <span className="state demo">CONCEPT</span>
                    </div>
                    <div className="block-body">
                      <div className="table-row">
                        <span className="table-key">Contribution</span>
                        <span className="table-val">Who did what.</span>
                      </div>
                      <div className="table-row">
                        <span className="table-key">Artifact</span>
                        <span className="table-val">What was produced, with a source and version.</span>
                      </div>
                      <div className="table-row">
                        <span className="table-key">Test</span>
                        <span className="table-val">Method, conditions, result and limitations.</span>
                      </div>
                      <div className="table-row">
                        <span className="table-key">Acceptance</span>
                        <span className="table-val">Who accepted, rejected or deferred—and why.</span>
                      </div>
                      <div className="table-row">
                        <span className="table-key">Maintenance</span>
                        <span className="table-val">Failure, repair, operating state and next review.</span>
                      </div>
                      <div className="table-row">
                        <span className="table-key">Integrity</span>
                        <span className="table-val">Submitted evidence remains distinct from reviewed evidence.</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </main>

        <aside className="right">
          <div className="inspect-head">
            <div className="inspect-top">
              <span className="inspect-label">01 — Record inspector</span>
              <span className="inspect-icon" id="inspect-icon">
                {inspectDraft ? '＋' : (node ? node.icon : '')}
              </span>
            </div>
            <h2 id="inspect-title">{inspectDraft ? inspectDraft.title : (node ? node.title : '')}</h2>
            <p id="inspect-desc">{inspectDraft ? inspectDraft.detail : (node ? node.desc : '')}</p>
            <div className="inspector-chips">
              <span className="chip">
                <i className="mini-dot"></i>
                <span id="inspect-state">{inspectDraft ? 'Local draft' : (node ? node.state : '')}</span>
              </span>
              <span className="chip" id="inspect-type-chip">
                {inspectDraft ? 'Problem brief' : (node ? node.short : '')}
              </span>
            </div>
          </div>
          <div className="inspect-content">
            <div className="inspect-section">
              <h3>Record metadata</h3>
              <div className="fact">
                <span className="label">Class</span>
                <span className="value" id="fact-type">{inspectDraft ? 'User-authored draft' : (node ? node.type : '')}</span>
              </div>
              <div className="fact">
                <span className="label">Provenance</span>
                <span className="value" id="fact-source">{inspectDraft ? 'Current browser session' : (node ? node.source : '')}</span>
              </div>
              <div className="fact">
                <span className="label">Owner</span>
                <span className="value">Unassigned</span>
              </div>
            </div>
            <div className="inspect-section">
              <h3>Evidence gaps</h3>
              <div id="evidence">
                {evidenceItems.map((x, i) => (
                  <div key={i} className="proof">
                    <i className="dot"></i>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
              <div className="hint" id="hint">
                {inspectDraft ? 'Validate with affected people before selecting a solution.' : (node ? node.hint : '')}
              </div>
            </div>
            <div className="inspect-section">
              <h3>Relations</h3>
              <div className="relations" id="relations">
                {relationsItems.map((x, i) => (
                  <div key={i} className="proof">
                    <i className="dot"></i>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="inspect-section">
              <h3>Actions</h3>
              <div className="actions" id="actions">
                {actionsItems.map(([label, action]) => (
                  <button key={label} className="btn" data-action={action} onClick={() => handleAction(action)}>
                    <span>{label}</span>
                    <span>↗</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="right-bottom">
            <span>
              <i className="status-square"></i> SESSION ONLY
            </span>
            <span>NO SHARED WRITES</span>
          </div>
        </aside>
      </div>

      <footer>
        <div>
          <span style={{ color: '#738b70' }}>●</span>&nbsp; LOCAL SESSION <span className="footer-hide">&nbsp; / &nbsp; EXAMPLE DATA</span>
        </div>
        <div>
          APT—LABS <span className="footer-hide">&nbsp; · &nbsp; FIELD ATLAS</span>&nbsp; <span>01.1</span>
        </div>
      </footer>

      {modalOpen && (
        <div className="modal-bg open" id="modal-bg" role="dialog" aria-modal={true} aria-labelledby="modal-title">
          <div className="modal">
            <div className="modal-top">
              <div>
                <div className="eyebrow">Intake / local draft</div>
                <h2 id="modal-title">New problem brief</h2>
                <p>A local note. No network submission.</p>
              </div>
              <button type="button" className="btn quiet small" id="close" onClick={closeModal}>
                Esc
              </button>
            </div>
            <form id="problem-form" onSubmit={saveDraft}>
              <div className="field">
                <label htmlFor="p-title">Brief title</label>
                <input
                  id="p-title"
                  required
                  maxLength={100}
                  placeholder="e.g. Produce loss during storage"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="p-place">Site / context</label>
                <input
                  id="p-place"
                  maxLength={100}
                  placeholder="Where does this occur?"
                  value={form.place}
                  onChange={e => setForm({ ...form, place: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="p-detail">Observed condition</label>
                <textarea
                  id="p-detail"
                  required
                  maxLength={1200}
                  placeholder="What happens? Who is affected? What is known?"
                  value={form.detail}
                  onChange={e => setForm({ ...form, detail: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="p-measure">Measure of improvement</label>
                <input
                  id="p-measure"
                  maxLength={240}
                  placeholder="e.g. loss per week; downtime hours"
                  value={form.measure}
                  onChange={e => setForm({ ...form, measure: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn quiet" id="cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn primary">Save local draft ↗</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`toast${toastMsg ? ' show' : ''}`} id="toast" role="status" aria-live="polite">
        {toastMsg}
      </div>
    </div>
  );
}
