'use client';

import { MODULES, MODULE_ORDER, TREE, PEOPLE, ACTIVITY, TOTAL_BUILDS, BUILT_COUNT, ANCHORS, LEDGER, findFile, firstMeaningfulLine, stateColor, type OntoFile, type NavItemId } from '@/lib/ontology';
import { highlight } from '@/lib/editor';
import type { ViewId } from '@/components/TopNav';

interface ModuleSurfaceProps {
  view: ViewId;
  module: string | null;
  file: string | null;
  onNav: (id: NavItemId) => void;
  onSelectFile: (id: string) => void;
  onOpenFile: (id: string) => void;
  onView: (v: ViewId) => void;
  toast: (msg: string, icon?: string) => void;
}

export function ModuleSurface({ view, module, file, onNav, onSelectFile, onOpenFile, onView, toast }: ModuleSurfaceProps) {
  // A file is open — render the editor view.
  if (file) {
    const f = findFile(file);
    if (f) return <FileView f={f} />;
  }

  // Kemet-OS — the full one-page landing.
  if (view === 'kemet') return <KemetOsLanding onNav={onNav} onOpenFile={onOpenFile} onView={onView} />;

  // A module is selected — its landing.
  if (module) return <ModuleLanding moduleId={module} onSelectFile={onSelectFile} />;

  // The workspace dashboard.
  return <WorkspaceView onNav={onNav} onOpenFile={onOpenFile} toast={toast} />;
}

/* ══════════════════════════════════════════════════════════════
   SHARED — main head
   ══════════════════════════════════════════════════════════════ */

function MainHead({ title, desc, right }: { title: string; desc: string; right?: React.ReactNode }) {
  const mod = MODULES[MODULE_ORDER.find(id => MODULES[id].title === title) || ''];
  return (
    <div className="main-head">
      <div className="title">
        <div className="badge-ic" style={{ color: mod?.color || 'var(--accent)' }}>
          {mod?.icon || '◇'}
        </div>
        <div>
          <h1>{title}</h1>
          <div className="desc">{desc}</div>
        </div>
      </div>
      <div className="updated">{right || 'last updated: just now'}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   KEMET-OS — the full one-page aptlabs landing
   ══════════════════════════════════════════════════════════════ */

function KemetOsLanding({ onNav, onOpenFile, onView }: { onNav: (id: NavItemId) => void; onOpenFile: (id: string) => void; onView: (v: ViewId) => void }) {
  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: 'var(--accent)' }}>◇</div>
          <div>
            <h1>Kemet-OS</h1>
            <div className="desc">the aptlabs landing — one page, everything plain</div>
          </div>
        </div>
        <div className="updated">sovereign · open · on the roll</div>
      </div>

      <section className="section hero">
        <div className="section-label">kemetic os · the landing</div>
        <h2>Sovereign work.<br />The <em>record</em>, ours.</h2>
        <p className="lede">
          AptLabs is the cloak and the craft — sovereign infrastructure for
          builders who make physical things, from cognition to community.
          Identity first: claim your SBT, then build, vote, invest, and sign.
          Every blueprint open. Every claim checkable by someone who owes us nothing.
        </p>
        <div className="cta">
          <button className="btn btn-primary" onClick={() => onNav('kernel')}>Claim your identity SBT →</button>
          <button className="btn btn-ghost" onClick={() => onView('workspace')}>Enter the workspace</button>
          <button className="btn btn-ghost" onClick={() => onOpenFile('network/tally/smis.md')}>SMIS · live vote</button>
        </div>
        <div className="hint">
          <kbd>⌘K</kbd> search · <kbd>⌘0</kbd> kemet-os · <kbd>⌘B</kbd> workspace · <kbd>⌘⇧A</kbd> agent
        </div>
      </section>

      <section className="section">
        <div className="section-label">the ledger · members</div>
        <div className="ledger">
          {LEDGER.map(e => (
            <div className="ledger-row" key={e.sbt}>
              <span className="av" style={{ background: e.color }}>{e.av}</span>
              <span className="who">
                <span className="n">{e.name}</span>
                <span className="r">{e.role}</span>
              </span>
              <span className="rights">
                {e.rights.map(r => <span key={r}>{r}</span>)}
              </span>
              <span className="sbt">{e.sbt}</span>
              <span className="stamp">✓ on the roll</span>
            </div>
          ))}
        </div>
        <div className="hint" style={{ marginTop: '8px' }}>
          one SBT, one vote · the ledger holds members who can build, vote, sign
        </div>
      </section>

      <section className="section">
        <div className="section-label">insights · system vitals</div>
        <div className="vitals">
          <div className="vital"><div className="k">modules</div><div className="v">{MODULE_ORDER.length}</div></div>
          <div className="vital"><div className="k">builds</div><div className="v">{TOTAL_BUILDS}</div></div>
          <div className="vital"><div className="k">evidence</div><div className="v">{BUILT_COUNT}<span className="unit">built</span></div></div>
          <div className="vital"><div className="k">anchors</div><div className="v">{ANCHORS.length}<span className="unit">verified</span></div></div>
        </div>
        <div className="activity">
          {ACTIVITY.map(a => (
            <div className="row" key={a.p}>
              <span className="p">{a.p}</span>
              <span className="right">
                <span className={'state-pill ' + a.state}>{a.state}</span>
                <span className="t">· {a.time}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-label">the five modules</div>
        <div className="card-grid">
          {MODULE_ORDER.map(id => {
            const m = MODULES[id];
            const tree = TREE[id];
            return (
              <div className="card" key={id} onClick={() => onNav(id as NavItemId)}>
                <div className="card-head">
                  <div className="card-title">{m.label}</div>
                  <span className="state-pill built">open</span>
                </div>
                <div className="card-desc">{m.desc}</div>
                <div className="card-foot">
                  <span>{tree.files.length} files · {tree.dirs.length} submodules</span>
                  <span className="spacer" />
                  <span>{m.icon}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   WORKSPACE — the control dashboard
   ══════════════════════════════════════════════════════════════ */

function WorkspaceView({ onNav, onOpenFile, toast }: { onNav: (id: NavItemId) => void; onOpenFile: (id: string) => void; toast: (msg: string, icon?: string) => void }) {
  return (
    <main className="main" id="main">
      <MainHead title="Command Center" desc="control dashboard — system status, recent activity, quick actions" />

      <section className="section hero">
        <div className="section-label">the lab</div>
        <h2>The kernel, open.<br />The <em>record</em>, yours.</h2>
        <p className="lede">
          Identity, evidence, and proof-of-work — for builders who make physical things.
          Fork the mesh. Sign your work. Publish the blueprint. The second county
          pays nothing for the first county&apos;s learning curve.
        </p>
        <div className="cta">
          <button className="btn btn-primary" onClick={() => onNav('kernel')}>Open the kernel →</button>
          <button className="btn btn-ghost" onClick={() => onOpenFile('operations/audits/protocol.md')}>Read the protocol</button>
          <button className="btn btn-ghost" onClick={() => toast('Fork request queued · node will be provisioned', '⟐')}>Fork a node</button>
        </div>
        <div className="hint">
          <kbd>⌘K</kbd> search · <kbd>⌘P</kbd> commands · <kbd>⌘⇧A</kbd> agent
        </div>
      </section>

      <section className="section">
        <div className="section-label">people · on the roll</div>
        <div className="people">
          {PEOPLE.map(p => (
            <div className="person" key={p.name}>
              <div className="av" style={{ background: p.color }}>{p.av}</div>
              <div className="who">
                <span className="n">{p.name}</span>
                <span className="r">{p.role}</span>
              </div>
              <span className={'tag ' + p.tag}>{p.tag}</span>
              <span className="meta">{p.meta}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-label">insights · system vitals</div>
        <div className="vitals">
          <div className="vital"><div className="k">modules</div><div className="v">{MODULE_ORDER.length}</div></div>
          <div className="vital"><div className="k">builds</div><div className="v">{TOTAL_BUILDS}</div></div>
          <div className="vital"><div className="k">evidence</div><div className="v">{BUILT_COUNT}<span className="unit">built</span></div></div>
          <div className="vital"><div className="k">anchors</div><div className="v">{ANCHORS.length}<span className="unit">verified</span></div></div>
        </div>
        <div className="activity">
          {ACTIVITY.map(a => (
            <div className="row" key={a.p}>
              <span className="p">{a.p}</span>
              <span className="right">
                <span className={'state-pill ' + a.state}>{a.state}</span>
                <span className="t">· {a.time}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE LANDING — guide (kernel) + card grid
   ══════════════════════════════════════════════════════════════ */

function ModuleLanding({ moduleId, onSelectFile }: { moduleId: string; onSelectFile: (id: string) => void }) {
  const mod = MODULES[moduleId];
  const tree = TREE[moduleId];

  return (
    <main className="main" id="main">
      <MainHead title={mod.title} desc={mod.desc} />

      {moduleId === 'kernel' && (
        <section className="section">
          <div className="section-label">identity · claim your SBT</div>
          <div className="guide">
            <div className="step">
              <span className="n">1</span>
              <div>
                <div className="t">Register</div>
                <div className="d">Open the kernel. Name yourself — no papers, no gatekeeper.</div>
              </div>
            </div>
            <div className="step">
              <span className="n">2</span>
              <div>
                <div className="t">Sign</div>
                <div className="d">Sign the claim with your wallet. An anchor countersigns.</div>
              </div>
            </div>
            <div className="step">
              <span className="n">3</span>
              <div>
                <div className="t">Receive</div>
                <div className="d">Your SBT lands in your wallet. Soulbound: yours, unsellable.</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-label">{mod.label} · files</div>
        <div className="card-grid">
          {tree.files.map(f => (
            <div className="card" key={f.id} onClick={() => onSelectFile(f.id)}>
              <div className="card-head">
                <div className="card-title">{f.name.replace(/\.(ts|md|json)$/, '')}</div>
                <span className={'state-pill ' + f.state}>{f.state}</span>
              </div>
              <div className="card-desc">{firstMeaningfulLine(f.content)}</div>
              <div className="card-foot">
                <span>{f.lang}</span>
                <span className="spacer" />
                <span>{f.lines} lines · {f.size}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   FILE VIEW — editor with gutter + syntax highlighting
   ══════════════════════════════════════════════════════════════ */

function FileView({ f }: { f: OntoFile & { module: string } }) {
  const mod = MODULES[f.module];
  const lines = f.content.split('\n');
  const numbered = lines.map((_, i) => i + 1).join('\n');

  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: mod.color }}>{mod.icon}</div>
          <div>
            <div className="crumb">
              {f.module}
              <span className="sep">/</span>
              {f.id.split('/').slice(1).join('/')}
            </div>
            <h1>{f.name}</h1>
            <div className="desc">{f.lang} · {f.lines} lines · {f.size}</div>
          </div>
        </div>
        <div className="updated">
          <span className={'state-pill ' + f.state}>{f.state}</span>
        </div>
      </div>

      <section className="section" style={{ maxWidth: '100%' }}>
        <div className="editor">
          <div className="editor-tabs">
            <div className="editor-tab active">
              <span className="dot-state" style={{ background: stateColor(f.state) }} />
              {f.name}
            </div>
          </div>
          <div className="editor-body">
            <div className="editor-gutter">{numbered}</div>
            <div
              className="editor-code"
              dangerouslySetInnerHTML={{ __html: highlight(f.content, f.lang) }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export { stateColor };
