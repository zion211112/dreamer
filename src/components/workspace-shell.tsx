'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Boxes, Plus, Wallet, Send, User } from 'lucide-react';
import type { Tender } from '@/lib/tender';
import type { WorkspaceContextOption } from '@/lib/workspace';
import type { WorkspaceKey } from '@/lib/workspace';
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

const ASSETS = [
  { id: 'school', label: 'School Console', meta: 'local · device records' },
  { id: 'mwea', label: 'Mwea Animation Box', meta: 'host · build' },
  { id: 'nyamindi', label: 'Nyamindi Hydro Node', meta: 'host · hydro' },
  { id: 'tender', label: 'Tender System', meta: 'commons · live' },
];

const MODULES = [
  { key: 'asset', label: 'Asset Topology', icon: Boxes, blurb: 'Hosts, builds and the assets they carry.' },
  { key: 'problem', label: 'Problem Briefs', icon: 'ClipboardList' as const, blurb: 'Observed problems, stated without a presumed answer.' },
  { key: 'sequence', label: 'Work Sequence', icon: 'Layers' as const, blurb: 'The order that moves an idea into the world.' },
  { key: 'capability', label: 'Crew & Capability', icon: 'Users' as const, blurb: 'Who is available, and what they are trusted to do.' },
  { key: 'commons', label: 'Commons', icon: 'Layers' as const, blurb: 'Shared records that outlive any single actor.' },
];

export function WorkspaceShell({ userEmail, localMode = false, contexts = [], canPersistPreference = true }: WorkspaceShellProps) {
  const [notes, setNotes] = useState<{ role: 'sys' | 'user'; text: string }[]>([
    { role: 'sys', text: 'Agent 1.0 ready.' },
  ]);
  const [notesInput, setNotesInput] = useState('');
  const [activeModule, setActiveModule] = useState<string>('asset');

  function addNote() {
    const t = notesInput.trim();
    if (!t) return;
    setNotes(prev => [...prev, { role: 'user', text: t }]);
    setNotesInput('');
  }

  return (
    <div className="km-root">
      <div className="app-grid">
        <aside className="nav-pane">
          <div className="nav-header">
            <div className="brand">
              <div className="brand-icon"><Boxes aria-hidden="true" size={16} /></div>
              <div>
                <div className="brand-dash">APT-LABS</div>
                <div className="nav-label">Workspace</div>
              </div>
            </div>
            {localMode && <div className="local-badge">Local</div>}
          </div>
          <div className="nav-list">
            {MODULES.map((m, i) => (
              <button
                key={m.key}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${activeModule === m.key ? "bg-jade" : "hover:bg-jade-dim"} text-ink data-[state=active]:bg-jade data-[state=active]:text-bg`}
                onClick={() => setActiveModule(m.key)}
                style={{ color: "#25231f" }}
              >
                <span className="nav-index" style={{ color: "#c9572a" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="nav-label" style={{ color: "#25231f" }}>{m.label}</span>
                <span className="nav-badge" style={{ background: activeModule === m.key ? "#f2dfd2" : "transparent", color: "#c9572a" }}>{activeModule === m.key ? "4" : ""}</span>
              </button>
            ))}
          </div>
          <div className="profile-block">
            <div className="profile-name">{userEmail.split('@')[0] || 'operator'}</div>
            <div className="profile-did">{userEmail || 'local session'}</div>
            <button className="ws-signout" onClick={() => signOut()}>Sign out</button>
          </div>
        </aside>

        <main className="center-pane">
          <div className="center-scroll">
            <div className="center-head">
              <div className="center-head-index">01</div>
              <div className="center-head-title">Asset Topology</div>
              <div className="center-head-status">4 nodes</div>
            </div>
            <p className="center-lede">What are these: the four live assets that make up this workspace, and how they connect.</p>
            <div className="center-action">
              <button className="btn-add-node" onClick={() => toast('Add asset node coming soon.')}>
                <Plus aria-hidden="true" size={15} /> Add asset node
              </button>
            </div>

            <div className="space-y-4" style={{ background: "#faf6ec", borderRadius: "xl", padding: "1.5rem" }}>
              {ASSETS.map((a, i) => (
                <div key={a.id} className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex-shrink-0" style={{ background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                    <div className="flex items-center justify-center" style={{ width: "100", height: "100" }}>
                      <Boxes size={28} className="text-jade" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: "#c9572a" }}>{a.label}</div>
                    <div className="text-xs opacity-60" style={{ color: "#716b60" }}>{a.meta}</div>
                  </div>
                  {i < ASSETS.length - 1 && (
                    <div className="w-1 h-6 rounded-full bg-jade dim flex-shrink-0" style={{ background: "#f2dfd2" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        <aside className="right-pane">
          <div className="right-scroll">
            <div className="profile-block">
              <div className="profile-name">{userEmail.split('@')[0] || 'operator'}</div>
              <div className="profile-did">{userEmail || 'local session'}</div>
            </div>
            <div className="action-block">
              <div className="sec-title">Wallet</div>
              <button className="km-btn primary" onClick={() => toast('Wallet coming soon.')}>
                <Wallet aria-hidden="true" size={14} /> Bank / Wallet
              </button>
            </div>
            <div className="action-block">
              <div className="sec-title">Suggested actions</div>
              <div className="suggest-item"><div className="suggest-title">Open jobs</div><div className="suggest-meta">0 active</div></div>
              <div className="suggest-item"><div className="suggest-title">Review pending</div><div className="suggest-meta">0 pending</div></div>
            </div>
          </div>
          <div className="kemet-os">
            <div className="kemet-header">
              <div className="kemet-title"><User aria-hidden="true" size={13} strokeWidth={1.6} /> Agent 1.0</div>
              <div>minimal</div>
            </div>
            <div className="kemet-body">
              {notes.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.text}</div>)}
            </div>
            <div className="kemet-input-wrap">
              <input className="kemet-input" value={notesInput} onChange={e => setNotesInput(e.target.value)} placeholder="Ask agent 1.0…" aria-label="Ask agent" onKeyDown={e => { if (e.key === 'Enter') addNote(); }} />
              <button className="kemet-send" aria-label="Send" onClick={addNote}><Send aria-hidden="true" size={13} strokeWidth={1.6} /></button>
            </div>
          </div>
        </aside>
      </div>

      <footer className="sys-footer">
        <div className="f-left">
          <div className="f-item"><div className="f-dot" /> {localMode ? 'Local session' : 'Signed in'}</div>
          <div className="f-item">{contexts.length > 0 ? `${contexts.length} verified contexts` : 'No verified contexts'}</div>
        </div>
        <div className="f-right">
          <div className="f-item">Prototype · 001</div>
        </div>
      </footer>
    </div>
  );
}
