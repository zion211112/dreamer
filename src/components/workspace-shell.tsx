'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { createProblemBrief, type ProblemBrief } from '../../app/workspace/actions';
import type { Tender } from '@/lib/tender';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import type { WorkspaceContextOption } from '@/lib/workspace';
import type { WorkspaceKey } from '@/lib/workspace';
import { signOut } from '@/lib/supabase/sign-out';
import Link from 'next/link';

interface WorkspaceShellProps {
  initialTenders: Tender[];
  initialBriefs: ProblemBrief[];
  userEmail: string;
  localMode?: boolean;
  defaultWorkspace?: WorkspaceKey;
  contexts?: WorkspaceContextOption[];
  defaultContextKey?: string;
  canPersistPreference?: boolean;
}

const INSPECTOR: Record<string, { kicker: string; title: string; description: string; state: string; owner: string; gate: string; evidence: string; risk: string; check: string; warning: string }> = {
  problem: { kicker: 'Selected node / problem', title: 'Water-pumping cost', description: 'An illustrative institutional problem. The first task is to establish whether the problem exists, what it costs, and what constraints shape a safe solution.', state: 'Example only. No institution, baseline or operating data has been verified.', owner: 'Unassigned', gate: 'Confirm need', evidence: '0 verified', risk: 'Safety / cost', check: 'Identify a real host institution\nCollect bills / operating logs\nConfirm current system and constraints\nObtain qualified technical assessment\nCompare options before choosing a build', warning: 'Illustrative scenario. The costs, institution, crew, materials and funding are not real records.' },
  engineer: { kicker: 'Capability / design', title: 'Design & engineering', description: 'A role that converts an observed problem into requirements, a safe concept, a bill of materials and a testable plan.', state: 'Role defined for the example; no named engineer or verified credential is attached.', owner: 'Not assigned', gate: 'Find qualified reviewer', evidence: '0 verified', risk: 'Design / safety', check: 'Define the performance requirement\nRecord assumptions and constraints\nPrepare and cost a BOM\nObtain independent technical review\nDefine acceptance tests', warning: 'A capability category is not proof that a qualified person is available.' },
  builder: { kicker: 'Capability / field work', title: 'Local trades', description: 'Qualified local tradespeople may inspect, fabricate, install or maintain a solution.', state: 'Potential role only; no person, quotation, availability or credential is verified.', owner: 'Not assigned', gate: 'Identify and verify trades', evidence: '0 verified', risk: 'Safety / workmanship', check: 'Identify relevant trades\nCheck experience and references\nObtain scoped quotations\nAgree safe working method\nRecord labour and acceptance', warning: 'Do not publish personal credentials or award work without consent and appropriate checks.' },
};

INSPECTOR.host = { kicker: 'Institution / host', title: 'Host institution', description: 'The institution defines the real need, gives authorized access, provides baseline information and accepts the finished work.', state: 'No host institution has been identified in this example.', owner: 'Unidentified', gate: 'Conduct discovery meeting', evidence: '0 verified', risk: 'Authority / access', check: 'Identify decision-maker and operator\nConfirm the problem and priority\nAgree site access and data permissions\nEstablish baseline measures\nDefine who accepts and maintains the output', warning: 'Never imply endorsement, partnership or permission before an authorized person confirms it.' };
INSPECTOR.capital = { kicker: 'Capital / conditional support', title: 'Funding intent', description: 'Potential support should attach to a defined scope, credible budget and acceptance gates.', state: 'No funder, pledge, escrow, budget approval or transfer is recorded.', owner: 'None', gate: 'Cost a validated option', evidence: '0 verified', risk: 'Misrepresentation / misuse', check: 'Validate the need\nObtain comparable quotations\nDefine milestone-based release\nAgree controls and reporting\nReconcile funds and actual costs', warning: 'No capital is committed. Do not represent the illustrative panel as a real funding offer.' };
INSPECTOR.roll = { kicker: 'The Roll / evidence', title: 'Project evidence record', description: 'The record links people, work, materials, cost, technical documents, tests, acceptance and maintenance.', state: 'This is a UI demonstration, not a live or immutable ledger.', owner: 'Record steward TBD', gate: 'Define evidence schema', evidence: '3 sample entries', risk: 'Privacy / provenance', check: 'Source and timestamp each claim\nIdentify author and reviewer\nAttach permitted evidence\nPreserve corrections and state changes\nRestrict sensitive personal / institutional data', warning: 'The prototype does not provide cryptographic guarantees, access control, or persistent storage.' };

export function WorkspaceShell({ initialTenders, initialBriefs, userEmail, localMode = false, defaultWorkspace = 'apt', contexts = [], defaultContextKey = '', canPersistPreference = true }: WorkspaceShellProps) {
  const [briefs, setBriefs] = useState<ProblemBrief[]>(initialBriefs);
  const [selected, setSelected] = useState('problem');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState<string[]>(['Workspace loaded. Live records from Supabase where available; illustrative scenario data is marked.']);

  const info = INSPECTOR[selected] ?? INSPECTOR.problem;
  const tenders = initialTenders;

  function selectNode(key: string) {
    if (!INSPECTOR[key]) return;
    setSelected(key);
  }

  function applyZoom(next: number) {
    setZoom(Math.min(1.35, Math.max(0.75, next)));
  }

  async function saveProblem() {
    const t = title.trim();
    if (!t) { toast('Add a problem title first.'); return; }
    setSaving(true);
    try {
      const result = await createProblemBrief({ title: t, place: place.trim(), description: description.trim() });
      if (result.error) { toast(result.error); return; }
      if (result.brief) {
        setBriefs(prev => [result.brief!, ...prev]);
        setActivity(prev => ['Problem draft added and persisted to your account.', ...prev]);
        toast('Problem brief saved to your account.');
      }
      setTitle(''); setPlace(''); setDescription('');
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="workspace-dark" style={{ width: '100%' }}>
<header className="ws-topbar">
        <div className="ws-brand">
          <div className="ws-sigil"><span>A</span></div>
          APT-LABS <small>network workspace</small>
        </div>
        <nav className="ws-top-nav" aria-label="Primary">
          <Link href="/tenders">Assets</Link>
          <Link href="/commons">Commons</Link>
          <Link href="/roll">Roll</Link>
        </nav>
        <div className="ws-top-right">
          {contexts.length > 0 && (
            <Suspense fallback={<span className="workspace-switcher workspace-switcher-loading">Loading context…</span>}>
              <WorkspaceSwitcher
                defaultWorkspace={defaultWorkspace}
                contexts={contexts}
                defaultContextKey={defaultContextKey}
                canPersistPreference={canPersistPreference}
              />
            </Suspense>
          )}
          <span><span className="ws-state-dot" />{userEmail || 'signed in'}</span>
          {localMode && <span className="local-badge">LOCAL</span>}
          <span className="ws-honest-badge">prototype - honest</span>
          <form action={signOut}>
            <button className="ws-signout" type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <div className="ws-layout">
        <aside className="ws-rail">
          <div className="ws-workspace-label">Workspace</div>
          <nav className="ws-nav">
            {[
              { key: 'network', label: 'Network map', ico: 'O' },
              { key: 'problems', label: 'Problem briefs', ico: '+' },
              { key: 'crew', label: 'Crew & capability', ico: 'U' },
              { key: 'materials', label: 'Materials & sourcing', ico: 'M' },
              { key: 'capital', label: 'Capital intent', ico: '$' },
              { key: 'roll', label: 'The Roll', ico: 'R' },
              { key: 'diagnose', label: 'Operating sequence', ico: '>' },
            ].map(item => (
              <button key={item.key} type="button" onClick={() => {
                if (item.key === 'network') { toast('Network map selected.'); return; }
                const msgs: Record<string, string> = {
                  problems: 'Problem briefs: create an intake entry using New problem.',
                  crew: 'Crew & capability: roles are needs, not verified people.',
                  materials: 'Materials & sourcing: add quotations and provenance before marking available.',
                  capital: 'Capital intent: no funds are pledged or received in this example.',
                  roll: 'The Roll: record evidence, changes and acceptance.',
                  diagnose: 'Operating sequence: discover, diagnose, prove, record, repeat.',
                };
                toast(msgs[item.key] || 'Prototype navigation.');
                if (item.key === 'problems') setModalOpen(true);
                if (item.key === 'roll') selectNode('roll');
                if (item.key === 'capital') selectNode('capital');
                if (item.key === 'crew') selectNode('builder');
                if (item.key === 'materials') selectNode('engineer');
              }}>
                <span className="ws-ico">{item.ico}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className="ws-rail-note">
            <div className="ws-tiny-label">Honesty</div>
            <strong>Illustrative scenario</strong>
            <p>Map and crew roles are example data. Problem briefs you create are saved to your account. Tenders shown may be live Supabase records or illustrative samples.</p>
          </div>
        </aside>
        <main className="ws-main">
          <div className="ws-page-head">
            <div>
              <div className="ws-eyebrow">Network / Workspace</div>
              <h1>Make the next step visible.</h1>
              <p>Explore how a real-world problem, the people needed to solve it, the work, and its evidence fit together. Problem briefs persist to your account.</p>
            </div>
            <div className="ws-head-actions">
              <button className="ws-btn" type="button" onClick={() => toast('Node editor is a planned extension. Use New problem to capture a real issue.')}>+ Add node</button>
              <button className="ws-btn primary" type="button" onClick={() => setModalOpen(true)}>New problem</button>
            </div>
          </div>
          <div className="ws-metric-strip">
            <div className="ws-metric"><span className="ws-tiny-label">Open problem briefs</span><strong>{String(briefs.length).padStart(2, '0')} <em style={{ fontStyle: 'normal', color: 'var(--ws-dim)', fontSize: 10 }}>live</em></strong><small>Your persisted briefs</small></div>
            <div className="ws-metric"><span className="ws-tiny-label">Capability roles</span><strong>04 <em style={{ fontStyle: 'normal', color: 'var(--ws-dim)', fontSize: 10 }}>defined</em></strong><small>Not verified participants</small></div>
            <div className="ws-metric"><span className="ws-tiny-label">Capital intent</span><strong>Unconfirmed</strong><small>No money received or reserved</small></div>
            <div className="ws-metric"><span className="ws-tiny-label">Evidence records</span><strong>{String(tenders.length).padStart(2, '0')} <em style={{ fontStyle: 'normal', color: 'var(--ws-dim)', fontSize: 10 }}>live</em></strong><small>Tenders from Supabase</small></div>
          </div>
          <div className="ws-map-wrap">
            <div style={{ position: 'absolute', top: 12, left: 16, zIndex: 2, font: '10px var(--ws-mono)', color: 'var(--ws-muted)' }}>01 / Relationship map <span style={{ color: 'var(--ws-dim)' }}>— select a node to inspect</span></div>
            <svg className="ws-svg" viewBox="0 0 900 470" preserveAspectRatio="xMidYMid meet" style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin: '50% 50%' }}>
              <defs><filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
              <g>
                <path d="M440 218 C365 165 322 135 250 115" stroke="#477b59" fill="none" strokeWidth="1.5" />
                <path d="M440 218 C350 250 294 292 225 328" stroke="#2b332e" fill="none" />
                <path d="M440 218 C515 163 584 132 665 122" stroke="#2b332e" fill="none" />
                <path d="M440 218 C530 250 585 295 660 328" stroke="#d7b777" fill="none" />
                <path d="M440 218 C435 295 435 335 440 386" stroke="#2b332e" fill="none" />
              </g>
              {[
                { key: 'problem', label: 'Water-pumping cost', sub: 'Institutional utility', status: 'ILLUSTRATIVE - UNVERIFIED' },
                { key: 'engineer', cx: 250, cy: 115, label: 'Design & engineering', sub: 'Specification - BOM', status: 'ROLE DEFINED' },
                { key: 'builder', cx: 225, cy: 328, label: 'Local trades', sub: 'Plumbing - metalwork', status: 'PARTICIPANTS UNKNOWN' },
                { key: 'host', cx: 665, cy: 122, label: 'Institution', sub: 'Site - operating need', status: 'NOT YET IDENTIFIED' },
                { key: 'capital', cx: 660, cy: 328, label: 'Funding intent', sub: 'Conditional support', status: 'NO PLEDGE RECORDED' },
                { key: 'roll', cx: 440, cy: 386, label: 'Evidence record', sub: 'Cost - work - acceptance', status: 'SAMPLE' },
              ].map(n => {
                const cx = (n as { cx?: number }).cx ?? 440;
                const cy = (n as { cy?: number }).cy ?? 218;
                return (
                  <g key={n.key} onClick={() => selectNode(n.key)} style={{ cursor: 'pointer' }}>
                    <circle cx={cx} cy={cy} r={n.key === 'problem' ? 79 : 57} fill="none" stroke={selected === n.key ? '#9be2b0' : '#3a453d'} strokeWidth="1.5" />
                    <rect x={cx - 96} y={cy - 42} width={192} height={84} rx={8} fill="#141a16" stroke={selected === n.key ? '#9be2b0' : '#3a453d'} />
                    <text x={cx - 80} y={cy - 23} fill="#98a39b" fontSize="9" fontFamily="ui-monospace,monospace">{n.key.toUpperCase()}</text>
                    <text x={cx - 80} y={cy - 2} fill="#edf1eb" fontSize="11" fontFamily="ui-monospace,monospace">{n.label}</text>
                    <text x={cx - 80} y={cy + 15} fill="#98a39b" fontSize="10" fontFamily="ui-monospace,monospace">{n.sub}</text>
                    <text x={cx - 80} y={cy + 30} fill="#d7b777" fontSize="9" fontFamily="ui-monospace,monospace">{n.status}</text>
                  </g>
                );
              })}
            </svg>
            <div className="ws-zoom-controls">
              <button type="button" onClick={() => applyZoom(zoom + 0.1)}>+</button>
              <button type="button" onClick={() => applyZoom(zoom - 0.1)}>-</button>
              <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>fit</button>
            </div>
            <div style={{ position: 'absolute', bottom: 8, left: 16, font: '9px var(--ws-mono)', color: 'var(--ws-dim)' }}>ILLUSTRATIVE SCENARIO - NOT A LIVE PROJECT</div>
          </div>
          <div className="ws-evidence" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <h3>02 / Crew requirements</h3>
              <div className="ws-evidence-row"><span>EN</span><div><strong>Engineer / technical designer</strong><small>Requirements, safety, system sizing, BOM</small></div><span className="ws-tag">NEEDED</span></div>
              <div className="ws-evidence-row"><span>TR</span><div><strong>Qualified trade professional</strong><small>Inspect, fabricate/install, document work</small></div><span className="ws-tag">NEEDED</span></div>
              <div className="ws-evidence-row"><span>HI</span><div><strong>Host institution representative</strong><small>Confirm need, site access, acceptance</small></div><span className="ws-tag unverified">UNIDENTIFIED</span></div>
            </div>
            <div>
              <h3>03 / Evidence queue</h3>
              {briefs.length === 0 && <div className="ws-evidence-row"><span>+</span><div><strong>No problem briefs yet</strong><small>Use New problem to create one. It persists to your account.</small></div><span className="ws-tag unverified">EMPTY</span></div>}
              {briefs.map(b => (
                <div key={b.id} className="ws-evidence-row">
                  <span>+</span>
                  <div><strong>{b.title}</strong><small>{(b.place || 'Location unknown')} - {(b.description || 'No evidence details supplied')}</small></div>
                  <span className="ws-tag live">LIVE</span>
                </div>
              ))}
              <div className="ws-evidence-row"><span>O</span><div><strong>Problem statement</strong><small>Needs site interview and baseline bills</small></div><span className="ws-tag unverified">UNVERIFIED</span></div>
              <div className="ws-evidence-row"><span>~</span><div><strong>Technical feasibility</strong><small>Requires site survey and qualified review</small></div><span className="ws-tag unverified">NOT STARTED</span></div>
              <div className="ws-evidence-row"><span>=</span><div><strong>Cost / sourcing record</strong><small>No quotations or local sourcing survey attached</small></div><span className="ws-tag unverified">MISSING</span></div>
            </div>
          </div>
        </main>
        <aside className="ws-inspector">
          <div>
            <div className="ws-tiny-label">{info.kicker}</div>
            <h2>{info.title}</h2>
            <p>{info.description}</p>
          </div>
          <div className="ws-kv">
            <div><span>Current state</span><strong>{info.state}</strong></div>
            <div><span>Owner</span><strong>{info.owner}</strong></div>
            <div><span>Next gate</span><strong>{info.gate}</strong></div>
            <div><span>Evidence</span><strong>{info.evidence}</strong></div>
            <div><span>Risk</span><strong>{info.risk}</strong></div>
          </div>
          <div className="ws-tiny-label" style={{ marginTop: 8 }}>What must be established</div>
          <p style={{ whiteSpace: 'pre-line' }}>{info.check}</p>
          <div style={{ border: '1px solid var(--ws-line)', padding: 10, borderRadius: 6, marginTop: 8 }}>
            <strong style={{ fontSize: 11 }}>Evidence contract</strong>
            <p style={{ fontSize: 11 }}>A claim becomes verified only when a traceable source, responsible person, timestamp and review outcome are recorded. A proposed contribution or funding intention is not a completed contribution.</p>
          </div>
          <div className="ws-tag unverified" style={{ marginTop: 8, display: 'inline-block' }}>{info.warning}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="ws-btn" type="button" onClick={() => { toast('Evidence capture is a prototype action; no file or server record was created.'); setActivity(prev => ['Evidence action requested. No evidence attached; verification unchanged.', ...prev]); }}>+ Record evidence</button>
            <button className="ws-btn" type="button" onClick={() => { toast('Next task: ' + info.gate + '.'); setActivity(prev => ['Next task identified: ' + info.gate + '. This is a suggested action, not an assigned task.', ...prev]); }}>Create task</button>
          </div>
        </aside>
      </div>
      <div className="ws-activity">
        <h3>Activity</h3>
        {activity.map((a, i) => <div key={i} className="ws-activity-row"><b>{a.split('.')[0]}.</b> {a.split('.').slice(1).join('.')}</div>)}
      </div>
      {modalOpen && (
        <div className="ws-modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="ws-modal" role="dialog" aria-modal="true">
            <h2>Create a problem brief</h2>
            <p style={{ fontSize: 12, color: 'var(--ws-muted)' }}>Capture a field problem without presuming the solution. This is saved to your account.</p>
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Water pump operating cost" autoFocus />
            <label>Place</label>
            <input value={place} onChange={e => setPlace(e.target.value)} placeholder="Location" />
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is observed, and what evidence exists?" />
            <div className="ws-modal-actions">
              <button className="ws-btn subtle" type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="ws-btn primary" type="button" onClick={saveProblem} disabled={saving}>{saving ? 'Saving...' : 'Save problem'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
