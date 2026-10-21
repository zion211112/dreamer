'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { createProblemBrief, type ProblemBrief } from '../../app/workspace/actions';
import type { Tender } from '@/lib/tender';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import type { WorkspaceContextOption } from '@/lib/workspace';
import type { WorkspaceKey } from '@/lib/workspace';
import { signOut } from '@/lib/supabase/sign-out';

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

type Step = { id: string; label: string; sub: string[]; note: string };

const PATH: Step[] = [
  { id: 'problem', label: 'Problem', sub: ['Observe', 'Measure', 'Name'], note: 'Start with what hurts, not what sells.' },
  { id: 'evidence', label: 'Evidence', sub: ['Source', 'Timestamp', 'Review'], note: 'A claim is a claim until a source signs it.' },
  { id: 'host', label: 'Host', sub: ['Access', 'Baseline', 'Acceptance'], note: 'No host, no project. Just a pitch.' },
  { id: 'capability', label: 'Capability', sub: ['Design', 'BOM', 'Review'], note: 'Roles are not people. Verify the person.' },
  { id: 'capital', label: 'Capital', sub: ['Scope', 'Milestone', 'Reconcile'], note: 'Intent is not a transfer.' },
  { id: 'build', label: 'Build', sub: ['Fabricate', 'Install', 'Test'], note: 'Cheap is a lie until tested.' },
  { id: 'roll', label: 'Roll', sub: ['Record', 'Accept', 'Maintain'], note: 'The record outlives the builder.' },
  { id: 'sovereignty', label: 'Sovereignty', sub: ['Own', 'Operate', 'Improve'], note: 'The goal is not the build. It is who owns it after.' },
];

const THOTH: Record<string, string> = {
  problem: 'Thoth 1.0: before solutions, measure. A pump is not a problem; a bill is.',
  evidence: 'Thoth 1.0: if you cannot source it, timestamp it, and name who reviewed it, it is gossip.',
  host: 'Thoth 1.0: find the person who pays the bill and the person who fixes it. Often different.',
  capability: 'Thoth 1.0: a capability is a category until a credential and a quotation exist.',
  capital: 'Thoth 1.0: money follows evidence, not enthusiasm. Define the milestone first.',
  build: 'Thoth 1.0: the cheapest quote is the most expensive surprise.',
  roll: 'Thoth 1.0: if it is not recorded, it did not happen. If it is not accepted, it is not done.',
  sovereignty: 'Thoth 1.0: sovereignty is not independence. It is the right to refuse and the capacity to maintain.',
};

export function WorkspaceShell({ initialTenders, initialBriefs, userEmail, localMode = false, defaultWorkspace = 'apt', contexts = [], defaultContextKey = '', canPersistPreference = true }: WorkspaceShellProps) {
  const [briefs, setBriefs] = useState<ProblemBrief[]>(initialBriefs);
  const [selected, setSelected] = useState('problem');
  const [open, setOpen] = useState<string | null>('problem');
  const [zoom, setZoom] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState<string[]>(['Workspace loaded. Live records where available; the rest is marked.']);

  const step = PATH.find(s => s.id === selected) ?? PATH[0];
  const tenders = initialTenders;

  async function saveProblem() {
    const t = title.trim();
    if (!t) { toast('Add a problem title first.'); return; }
    setSaving(true);
    try {
      const result = await createProblemBrief({ title: t, place: place.trim(), description: description.trim() });
      if (result.error) { toast(result.error); return; }
      if (result.brief) {
        setBriefs(prev => [result.brief!, ...prev]);
        setActivity(prev => ['Problem draft persisted to your account.', ...prev]);
        toast('Problem brief saved.');
      }
      setTitle(''); setPlace(''); setDescription(''); setModalOpen(false);
    } finally { setSaving(false); }
  }

  return (
    <div className="workspace-dark">
      <header className="ws-topbar">
        <div className="ws-brand">
          <div className="ws-sigil"><span>A</span></div>
          APT-LABS <small>network workspace</small>
        </div>
        <div className="ws-top-right">
          {contexts.length > 0 && (
            <Suspense fallback={<span className="workspace-switcher workspace-switcher-loading">Loading context…</span>}>
              <WorkspaceSwitcher defaultWorkspace={defaultWorkspace} contexts={contexts} defaultContextKey={defaultContextKey} canPersistPreference={canPersistPreference} />
            </Suspense>
          )}
          <span><span className="ws-state-dot" />{userEmail || 'signed in'}</span>
          {localMode && <span className="local-badge">LOCAL</span>}
          <span className="ws-honest-badge">prototype - honest</span>
          <form action={signOut}><button className="ws-signout" type="submit">Sign out</button></form>
        </div>
      </header>

      <div className="ws-layout">
        <aside className="ws-rail">
          <div className="ws-workspace-label">Thoth Agent 1.0</div>
          <div className="ws-thoth">
            <div className="ws-thoth-head">agent / online</div>
            <p className="ws-thoth-msg">{THOTH[selected]}</p>
            <div className="ws-thoth-foot">hint, not authority</div>
          </div>
          <div className="ws-workspace-label" style={{ marginTop: 16 }}>Workspace</div>
          <nav className="ws-nav">
            {PATH.map(s => (
              <button key={s.id} type="button" className={selected === s.id ? 'active' : ''} onClick={() => { setSelected(s.id); setOpen(s.id); toast(s.label + ' selected.'); }}>
                <span className="ws-nav-ico">{s.label[0]}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>
          <div className="ws-workspace-label" style={{ marginTop: 16 }}>Network</div>
          <div style={{ padding: '0 9px', fontSize: 10, color: 'var(--ws-dim)', lineHeight: 1.5 }}>community layer: planned, not live. The end state is a superior network, not a feed.</div>
          <div className="ws-rail-foot">
            <button className="ws-btn primary" type="button" onClick={() => setModalOpen(true)}>+ New problem</button>
          </div>
        </aside>

        <main className="ws-center">
          <div className="ws-center-head">
            <div>
              <div className="ws-tiny-label">sovereignty path / recursive</div>
              <h1>The path to ownership.</h1>
              <p className="ws-center-sub">Each step opens into smaller steps. Nothing is marked done until evidence exists. The end is not a build; it is who maintains it.</p>
            </div>
            <div className="ws-zoom-controls">
              <button type="button" onClick={() => setZoom(z => Math.max(0.8, z - 0.1))}>−</button>
              <button type="button" onClick={() => setZoom(1)}>reset</button>
              <button type="button" onClick={() => setZoom(z => Math.min(1.3, z + 0.1))}>+</button>
            </div>
          </div>

          <div className="ws-path" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            {PATH.map((s, i) => {
              const active = selected === s.id;
              const expanded = open === s.id;
              return (
                <div key={s.id} className={`ws-step ${active ? 'active' : ''}`}>
                  <button type="button" className="ws-step-head" onClick={() => { setSelected(s.id); setOpen(expanded ? null : s.id); }}>
                    <span className="ws-step-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ws-step-label">{s.label}</span>
                    <span className="ws-step-note">{s.note}</span>
                    <span className="ws-step-toggle">{expanded ? '−' : '+'}</span>
                  </button>
                  {expanded && (
                    <div className="ws-step-body">
                      <div className="ws-step-subs">
                        {s.sub.map((sub, j) => (
                          <div key={sub} className="ws-sub">
                            <span className="ws-sub-num">{i + 1}.{j + 1}</span>
                            <span>{sub}</span>
                            <span className="ws-sub-state">open</span>
                          </div>
                        ))}
                      </div>
                      {s.id === 'problem' && briefs.length > 0 && (
                        <div className="ws-briefs">
                          <div className="ws-tiny-label">your briefs ({briefs.length})</div>
                          {briefs.slice(0, 4).map(b => (
                            <div key={b.id} className="ws-brief">
                              <strong>{b.title}</strong>
                              <small>{b.place || 'no place'} · {b.status}</small>
                            </div>
                          ))}
                        </div>
                      )}
                      {s.id === 'problem' && tenders.length > 0 && (
                        <div className="ws-tiny-label" style={{ marginTop: 8 }}>live tenders: {tenders.length}</div>
                      )}
                    </div>
                  )}
                  {i < PATH.length - 1 && <div className="ws-step-connector" />}
                </div>
              );
            })}
          </div>
        </main>

        <aside className="ws-inspector">
          <div className="ws-tiny-label">{step.label} / selected</div>
          <h2>{step.label}</h2>
          <p>{step.note}</p>
          <div className="ws-kv">
            <div><span>current state</span><strong>unverified</strong></div>
            <div><span>next gate</span><strong>{step.sub[0]}</strong></div>
            <div><span>evidence</span><strong>0 verified</strong></div>
            <div><span>risk</span><strong>misrepresentation</strong></div>
          </div>
          <div className="ws-tiny-label" style={{ marginTop: 12 }}>what must be established</div>
          <ul className="ws-checklist">
            {step.sub.map(sub => <li key={sub}>{sub}</li>)}
          </ul>
          <div className="ws-evidence-contract">
            A claim becomes verified only when a traceable source, responsible person, timestamp and review outcome are recorded.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="ws-btn" type="button" onClick={() => { toast('Evidence capture is a prototype action.'); setActivity(prev => ['Evidence action requested. No evidence attached.', ...prev]); }}>+ Record evidence</button>
            <button className="ws-btn" type="button" onClick={() => { toast('Next task: ' + step.sub[0] + '.'); setActivity(prev => ['Next task identified: ' + step.sub[0] + '.', ...prev]); }}>Create task</button>
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
            <p style={{ fontSize: 12, color: 'var(--ws-muted)' }}>Capture a field problem without presuming the solution. Saved to your account.</p>
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
