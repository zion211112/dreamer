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

const MODULES = [
  { id: 'asset', label: 'Asset Topology', icon: '◈' },
  { id: 'problem', label: 'Problem Briefs', icon: '◻' },
  { id: 'sequence', label: 'Work Sequence', icon: '▶' },
  { id: 'capability', label: 'Crew & Capability', icon: '◉' },
  { id: 'commons', label: 'Commons', icon: '≡' },
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
  const [kemetInput, setKemetInput] = useState('');
  const [kemetMsgs, setKemetMsgs] = useState<{ role: 'sys' | 'user'; text: string }[]>([
    { role: 'sys', text: 'Kemet-OS initialized. Ready to iterate on network topology.' },
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

  function sendKemet() {
    const v = kemetInput.trim();
    if (!v) return;
    setKemetMsgs(prev => [...prev, { role: 'user', text: `> ${v}` }]);
    setKemetInput('');
    setTimeout(() => setKemetMsgs(prev => [...prev, { role: 'sys', text: `Acknowledged. Processing "${v}" against network ledger... Action queued.` }]), 800);
  }

  const activeModule = MODULES.find(m => m.id === active) ?? MODULES[0];

  return (
    <div className="km-root">
      <header className="sys-header">
        <div className="brand">
          <div className="brand-icon">A</div>
          APT-LABS
        </div>
        <div className="sys-vitals">
          <div className="vital-item"><span className="vital-lbl">DID:</span><span className="vital-val">{userEmail ? userEmail.slice(0, 8) + '...' + userEmail.slice(-4) : '0x4a2f...8b1c'}</span></div>
          <div className="vital-item"><span className="vital-lbl">Rank:</span><span className="vital-val blue">TIER 1</span></div>
          <div className="vital-item"><span className="vital-lbl">Decay:</span><span className="vital-val warn">64%</span></div>
        </div>
        <div className="header-extras">
          {contexts.length > 0 && (
            <Suspense fallback={<span className="km-chip">Loading context…</span>}>
              <WorkspaceSwitcher defaultWorkspace={defaultWorkspace} contexts={contexts} defaultContextKey={defaultContextKey} canPersistPreference={canPersistPreference} />
            </Suspense>
          )}
          {localMode && <span className="local-badge">LOCAL</span>}
          <form action={signOut}><button className="ws-signout" type="submit">Sign out</button></form>
        </div>
      </header>

      <div className="app-grid">
        <div className="nav-pane">
          <div className="nav-header">Modules</div>
          <div className="nav-list">
            {MODULES.map(m => (
              <div key={m.id} className={`nav-item ${active === m.id ? 'active' : ''}`} onClick={() => { setActive(m.id); toast(m.label + ' selected.'); }}>
                <div className="icon">{m.icon}</div>
                <div className="nav-label">{m.label}</div>
                {m.id === 'problem' && briefs.length > 0 && <div className="nav-badge">{briefs.length}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="center-pane">
          <div className="center-head">
            <span>{activeModule.label}</span>
            <span>STATUS: ACTIVE</span>
          </div>

          {active === 'asset' && (
            <div className="node-tree">
              <div className="tree-node">
                <div className="node-card">
                  <div>
                    <div className="node-title">Kirinyaga Secondary Tower</div>
                    <div className="node-meta">Host Chassis · 4 Floors Operational</div>
                  </div>
                  <div className="node-status status-built">Active</div>
                </div>
                <div className="node-tree" style={{ marginTop: 16 }}>
                  <div className="tree-node">
                    <div className="node-card">
                      <div>
                        <div className="node-title">Mwea Animation Box</div>
                        <div className="node-meta">Acoustic Paneling · TND-KRG-2026-088</div>
                      </div>
                      <div className="node-status status-build">In Assembly</div>
                    </div>
                    <div className="sub-tasks">
                      <div className="sub-task"><div className="st-dot done" /><div className="st-title">Capital Intent Verified</div><div className="st-meta">KES 120K</div></div>
                      <div className="sub-task"><div className="st-dot done" /><div className="st-title">Materials Acquired</div><div className="st-meta">Timber + Steel</div></div>
                      <div className="sub-task"><div className="st-dot active" /><div className="st-title">Fabrication Phase</div><div className="st-meta">You are here</div></div>
                    </div>
                  </div>
                  <div className="tree-node" style={{ marginTop: 16 }}>
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
              {tenders.length > 0 && <div className="km-section-title">Live tenders: {tenders.length}</div>}
              {briefs.length > 0 && <div className="km-section-title">Problem briefs: {briefs.length}</div>}
            </div>
          )}

          {active === 'problem' && (
            <div>
              <div className="km-section-title">Problem Briefs</div>
              {briefs.length === 0 ? (
                <div className="km-empty">No problem briefs yet. Add a Problem Node.</div>
              ) : (
                <div className="km-list">
                  {briefs.map(b => (
                    <div key={b.id} className="km-row">
                      <strong>{b.title}</strong>
                      <small>{b.place || 'no place'} · {b.status}</small>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <button className="km-btn primary" type="button" onClick={() => setModalOpen(true)}>+ Add Problem Node</button>
              </div>
            </div>
          )}

          {active === 'sequence' && (
            <div className="km-list">
              {SEQUENCE.map((s, i) => (
                <div key={s.id} className="km-card">
                  <h3>{i + 1}. {s.label}</h3>
                  <small>{s.sub.join(' · ')}</small>
                </div>
              ))}
            </div>
          )}

          {active === 'capability' && (
            <div>
              <div className="km-section-title">Suggested Actions</div>
              <div className="suggest-item">
                <div className="suggest-title">Join Solar Dehydrator Assembly</div>
                <div className="suggest-meta">Role: Tier 1 Welder · 88% Match</div>
              </div>
              <div className="suggest-item">
                <div className="suggest-title">Review Land Tenure Covenant</div>
                <div className="suggest-meta">Role: Legal Mind · 94% Match</div>
              </div>
            </div>
          )}

          {active === 'commons' && (
            <div className="km-empty">Commons module — shared records surface. Connect to live data to populate.</div>
          )}
        </div>

        <div className="right-pane">
          <div className="right-scroll">
            <div className="profile-block">
              <div className="avatar">
                {(userEmail?.[0] || 'W').toUpperCase()}
                <div className="decay-ring" />
              </div>
              <div className="profile-name">{userEmail?.split('@')[0] || 'Wanjiru M.'}</div>
              <div className="profile-did">did:apt:0x4a2f...8b1c</div>
              <div className="decay-alert">
                Execution Signal: 64%<br />
                <span style={{ color: 'var(--km-ink-muted)', fontSize: 9 }}>Log milestone to reset.</span>
              </div>
            </div>
            <div className="action-block">
              <div className="sec-title">Suggested Actions</div>
              <div className="suggest-item">
                <div className="suggest-title">Join Solar Dehydrator Assembly</div>
                <div className="suggest-meta">Role: Tier 1 Welder · 88% Match</div>
              </div>
              <div className="suggest-item">
                <div className="suggest-title">Review Land Tenure Covenant</div>
                <div className="suggest-meta">Role: Legal Mind · 94% Match</div>
              </div>
            </div>
            <div className="action-block">
              <div className="sec-title">System Overrides</div>
              <button className="btn-add-node" onClick={() => setModalOpen(true)}>
                <span style={{ fontSize: 16 }}>+</span> Add Problem Node
              </button>
            </div>
          </div>

          <div className="kemet-os">
            <div className="kemet-header">
              <div className="kemet-title">
                <div className="kemet-dot" />
                KEMET-OS 1.0
              </div>
              <div style={{ fontFamily: 'var(--km-font-mono)', fontSize: 9, color: 'var(--km-ink-dim)' }}>ONLINE</div>
            </div>
            <div className="kemet-body">
              {kemetMsgs.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.text}</div>)}
            </div>
            <div className="kemet-input-wrap">
              <input className="kemet-input" value={kemetInput} onChange={e => setKemetInput(e.target.value)} placeholder="Type command or query..." onKeyDown={e => { if (e.key === 'Enter') sendKemet(); }} />
              <button className="kemet-send" onClick={sendKemet}>↵</button>
            </div>
          </div>
        </div>
      </div>

      <footer className="sys-footer">
        <div className="f-left">
          <div className="f-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="f-dot" /> NETWORK CONNECTED</div>
          <div className="f-item">NODE: KIRINYAGA</div>
        </div>
        <div className="f-right">
          <div className="f-item">SOVEREIGN LEDGER: ACTIVE</div>
          <div className="f-item">v1.0.4</div>
          {briefs.length > 0 && <div className="f-item">BRIEFS: {briefs.length}</div>}
          {tenders.length > 0 && <div className="f-item">TENDERS: {tenders.length}</div>}
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
