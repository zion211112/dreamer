'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import {
  Boxes,
  ClipboardList,
  GitBranch,
  Layers,
  MessageSquare,
  Plus,
  Send,
  Users,
} from 'lucide-react';
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

const MODULES = [
  { id: 'asset', label: 'Asset Topology', icon: Boxes, blurb: 'Hosts, builds and the assets they carry.' },
  { id: 'problem', label: 'Problem Briefs', icon: ClipboardList, blurb: 'Observed problems, stated without a presumed answer.' },
  { id: 'sequence', label: 'Work Sequence', icon: GitBranch, blurb: 'The order that moves an idea into the world.' },
  { id: 'capability', label: 'Crew & Capability', icon: Users, blurb: 'Who is available, and what they are trusted to do.' },
  { id: 'commons', label: 'Commons', icon: Layers, blurb: 'Shared records that outlive any single actor.' },
];

const SEQUENCE = [
  { id: 'problem', label: 'Problem', sub: ['Observe', 'Measure', 'Name'] },
  { id: 'evidence', label: 'Evidence', sub: ['Source', 'Timestamp', 'Review'] },
  { id: 'host', label: 'Host', sub: ['Access', 'Baseline', 'Acceptance'] },
  { id: 'capability', label: 'Capability', sub: ['Design', 'BOM', 'Review'] },
  { id: 'capital', label: 'Capital', sub: ['Scope', 'Milestone', 'Reconcile'] },
  { id: 'build', label: 'Build', sub: ['Fabricate', 'Install', 'Test'] },
  { id: 'roll', label: 'Roll', sub: ['Record', 'Accept', 'Maintain'] },
  { id: 'sovereignty', label: 'Sovereignty', sub: ['Own', 'Operate', 'Improve'] },
];

export function WorkspaceShell({ initialTenders, initialBriefs, userEmail, localMode = false, defaultWorkspace = 'apt', contexts = [], defaultContextKey = '', canPersistPreference = true }: WorkspaceShellProps) {
  const [briefs, setBriefs] = useState<ProblemBrief[]>(initialBriefs);
  const [active, setActive] = useState('asset');
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [notes, setNotes] = useState<{ role: 'sys' | 'user'; text: string }[]>([
    { role: 'sys', text: 'Studio notes. Drafts stay in this browser tab until you save them to a problem brief.' },
  ]);

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
        toast('Problem brief saved.');
      }
      setTitle(''); setPlace(''); setDescription(''); setModalOpen(false);
    } finally { setSaving(false); }
  }

  function addNote() {
    const v = notesInput.trim();
    if (!v) return;
    setNotes(prev => [...prev, { role: 'user', text: v }]);
    setNotesInput('');
  }

  const activeModule = MODULES.find(m => m.id === active) ?? MODULES[0];

  return (
    <div className="km-root">
      <header className="sys-header">
        <div className="brand">
          <div className="brand-icon">A</div>
          <span>APT<span className="brand-dash">—</span>LABS</span>
        </div>
        <div className="sys-vitals">
          <div className="vital-item"><span className="vital-lbl">Signed in</span><span className="vital-val">{userEmail || 'Local session'}</span></div>
          <div className="vital-item"><span className="vital-lbl">Context</span><span className="vital-val blue">{contexts.length > 0 ? `${contexts.length} verified` : 'Local'}</span></div>
          <div className="vital-item"><span className="vital-lbl">Briefs</span><span className="vital-val">{briefs.length}</span></div>
        </div>
        <div className="header-extras">
          {contexts.length > 0 && (
            <Suspense fallback={<span className="km-chip">Loading context…</span>}>
              <WorkspaceSwitcher defaultWorkspace={defaultWorkspace} contexts={contexts} defaultContextKey={defaultContextKey} canPersistPreference={canPersistPreference} />
            </Suspense>
          )}
          {localMode && <span className="local-badge">Local session</span>}
          <form action={signOut}><button className="ws-signout" type="submit">Sign out</button></form>
        </div>
      </header>

      <div className="app-grid">
        <div className="nav-pane">
          <div className="nav-header">Studio modules</div>
          <div className="nav-list">
            {MODULES.map((m, i) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-current={active === m.id ? 'page' : undefined}
                  className={`nav-item ${active === m.id ? 'active' : ''}`}
                  onClick={() => { setActive(m.id); toast(m.label + ' opened.'); }}
                >
                  <span className="nav-index">{String(i + 1).padStart(2, '0')}</span>
                  <Icon aria-hidden="true" className="icon" size={15} strokeWidth={1.6} />
                  <span className="nav-label">{m.label}</span>
                  {m.id === 'problem' && briefs.length > 0 && <span className="nav-badge">{briefs.length}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="center-pane">
          <div className="center-head">
            <div className="center-head-title">
              <span className="center-head-index">{String(MODULES.findIndex(m => m.id === active) + 1).padStart(2, '0')}</span>
              <span>{activeModule.label}</span>
            </div>
            <span className="center-head-status">Active module</span>
          </div>

          <div className="center-scroll">
            <p className="center-lede">{activeModule.blurb}</p>
          {active === 'asset' && (
            <div className="node-tree">
              <div className="km-section-title">Illustrative preview</div>
              <p className="center-note">The topology below is sample structure for this prototype. Live tenders and briefs are loaded from the shared record layer and listed beneath.</p>
              <div className="tree-node">
                <div className="node-card">
                  <div>
                    <div className="node-title">Kirinyaga Secondary Tower</div>
                    <div className="node-meta">Host Chassis · 4 Floors Operational</div>
                  </div>
                  <div className="node-status status-built">Active</div>
                </div>
                <div className="node-tree">
                  <div className="tree-node">
                    <div className="node-card">
                      <div>
                        <div className="node-title">Mwea Animation Box</div>
                        <div className="node-meta">Acoustic Paneling · TND-KRG-2026-088</div>
                      </div>
                      <div className="node-status status-build">In Assembly</div>
                    </div>
                    <div className="sub-tasks">
                      <div className="sub-task"><div className="st-dot done" /><div className="st-title">Capital intent verified</div><div className="st-meta">Sample figure</div></div>
                      <div className="sub-task"><div className="st-dot done" /><div className="st-title">Materials acquired</div><div className="st-meta">Timber + steel</div></div>
                      <div className="sub-task"><div className="st-dot active" /><div className="st-title">Fabrication phase</div><div className="st-meta">Current stage</div></div>
                    </div>
                  </div>
                  <div className="tree-node">
                    <div className="node-card">
                      <div>
                        <div className="node-title">Solar Crop Dehydrator</div>
                        <div className="node-meta">Agri-Compute · TND-KRG-2026-014</div>
                      </div>
                      <div className="node-status status-built">Built</div>
                    </div>
                  </div>
                </div>
              </div>
              {tenders.length > 0 && <div className="km-section-title">Live tenders · {tenders.length}</div>}
              {briefs.length > 0 && <div className="km-section-title">Problem briefs · {briefs.length}</div>}
            </div>
          )}

          {active === 'problem' && (
            <div>
              <div className="km-section-title">Problem briefs</div>
              {briefs.length === 0 ? (
                <div className="km-empty">No problem briefs yet. Add one to begin.</div>
              ) : (
                <div className="km-list">
                  {briefs.map((b, i) => (
                    <div key={b.id} className="km-row">
                      <div className="km-row-head">
                        <span className="km-row-index">{String(i + 1).padStart(2, '0')}</span>
                        <strong>{b.title}</strong>
                      </div>
                      <small>{b.place || 'No place recorded'} · {b.status}</small>
                    </div>
                  ))}
                </div>
              )}
              <div className="center-action">
                <button className="km-btn primary" type="button" onClick={() => setModalOpen(true)}><Plus aria-hidden="true" size={14} /> Add problem brief</button>
              </div>
            </div>
          )}

          {active === 'sequence' && (
            <div className="km-list">
              {SEQUENCE.map((s, i) => (
                <div key={s.id} className="km-card">
                  <div className="km-row-head"><span className="km-row-index">{String(i + 1).padStart(2, '0')}</span><h3>{s.label}</h3></div>
                  <small>{s.sub.join(' · ')}</small>
                </div>
              ))}
            </div>
          )}

          {active === 'capability' && (
            <div>
              <div className="km-section-title">Suggested actions</div>
              <div className="suggest-item">
                <div className="suggest-title">Join Solar Dehydrator Assembly</div>
                <div className="suggest-meta">Welder · 88% match</div>
              </div>
              <div className="suggest-item">
                <div className="suggest-title">Review Land Tenure Covenant</div>
                <div className="suggest-meta">Legal review · 94% match</div>
              </div>
            </div>
          )}

          {active === 'commons' && (
            <div className="km-empty">Commons records surface here once the shared record layer is connected for this context.</div>
          )}
          </div>
        </div>

        <div className="right-pane">
          <div className="right-scroll">
            <div className="profile-block">
              <div className="avatar">
                {(userEmail?.[0] || 'L').toUpperCase()}
              </div>
              <div className="profile-name">{userEmail?.split('@')[0] || 'Local session'}</div>
              <div className="profile-did">{localMode ? 'This device only' : 'Verified account'}</div>
              <div className="decay-alert">
                Execution signal is not yet recorded for this account.
                <span> Log a milestone to begin tracking it.</span>
              </div>
            </div>
            <div className="action-block">
              <div className="sec-title">Suggested actions</div>
              <div className="suggest-item">
                <div className="suggest-title">Join Solar Dehydrator Assembly</div>
                <div className="suggest-meta">Welder · 88% match</div>
              </div>
              <div className="suggest-item">
                <div className="suggest-title">Review Land Tenure Covenant</div>
                <div className="suggest-meta">Legal review · 94% match</div>
              </div>
            </div>
            <div className="action-block">
              <div className="sec-title">Create</div>
              <button className="btn-add-node" onClick={() => setModalOpen(true)}>
                <Plus aria-hidden="true" size={15} /> Add problem brief
              </button>
            </div>
          </div>

          <div className="kemet-os">
            <div className="kemet-header">
              <div className="kemet-title">
                <MessageSquare aria-hidden="true" size={13} strokeWidth={1.6} />
                Studio notes
              </div>
              <div>Local draft</div>
            </div>
            <div className="kemet-body">
              {notes.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.text}</div>)}
            </div>
            <div className="kemet-input-wrap">
              <input
                className="kemet-input"
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                placeholder="Draft a note for this session…"
                aria-label="Draft a studio note"
                onKeyDown={e => { if (e.key === 'Enter') addNote(); }}
              />
              <button className="kemet-send" aria-label="Add studio note" onClick={addNote}><Send aria-hidden="true" size={13} strokeWidth={1.6} /></button>
            </div>
          </div>
        </div>
      </div>

      <footer className="sys-footer">
        <div className="f-left">
          <div className="f-item"><div className="f-dot" /> {localMode ? 'Local session' : 'Signed in'}</div>
          <div className="f-item">{contexts.length > 0 ? `${contexts.length} verified contexts` : 'No verified contexts'}</div>
        </div>
        <div className="f-right">
          <div className="f-item">Prototype · 001</div>
          {briefs.length > 0 && <div className="f-item">Briefs · {briefs.length}</div>}
          {tenders.length > 0 && <div className="f-item">Tenders · {tenders.length}</div>}
        </div>
      </footer>

      {modalOpen && (
        <div className="km-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="km-modal" role="dialog" aria-modal="true">
            <h2>Create a problem brief</h2>
            <p>Capture a field problem without presuming the solution. Saved to your account.</p>
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Water pump operating cost" autoFocus />
            <label>Place</label>
            <input value={place} onChange={e => setPlace(e.target.value)} placeholder="Location" />
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is observed, and what evidence exists?" />
            <div className="km-modal-actions">
              <button className="km-btn subtle" type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="km-btn primary" type="button" onClick={saveProblem} disabled={saving}>{saving ? 'Saving...' : 'Save problem'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
