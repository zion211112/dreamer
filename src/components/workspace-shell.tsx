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

export function WorkspaceShell({ userEmail, localMode = false, contexts = [] }: WorkspaceShellProps) {
  const [notes, setNotes] = useState<{ role: 'sys' | 'user'; text: string }[]>([
    { role: 'sys', text: 'Agent 1.0 ready.' },
  ]);
  const [notesInput, setNotesInput] = useState('');

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
            <div className="nav-item active">
              <div className="nav-index">01</div>
              <div className="nav-label">Asset Topology</div>
              <div className="nav-badge">4</div>
            </div>
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

            <div className="node-tree">
              {ASSETS.map((a, i) => (
                <div key={a.id} className="tree-node">
                  <div className="node-card">
                    <div className="node-status" />
                    <div className="node-title">{a.label}</div>
                    <div className="node-meta">{a.meta}</div>
                  </div>
                  {i < ASSETS.length - 1 && <div className="node-connector" aria-hidden="true" />}
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
