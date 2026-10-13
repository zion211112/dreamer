'use client';

import { MODULES, MODULE_ORDER, TREE, PEOPLE, ACTIVITY, TOTAL_BUILDS, BUILT_COUNT, ANCHORS, findFile, firstMeaningfulLine, stateColor, type OntoFile, type NavItemId } from '@/lib/ontology';
import { highlight } from '@/lib/editor';

interface ModuleSurfaceProps {
  module: string;
  file: string | null;
  onNav: (id: NavItemId) => void;
  onSelectFile: (id: string) => void;
  onOpenFile: (id: string) => void;
  toast: (msg: string, icon?: string) => void;
}

export function ModuleSurface({ module, file, onNav, onSelectFile, onOpenFile, toast }: ModuleSurfaceProps) {
  // If a file is selected, render the file editor view.
  if (file) {
    const f = findFile(file);
    if (f) return <FileView f={f} />;
  }

  if (module === 'workspace') return <WorkspaceView onNav={onNav} onOpenFile={onOpenFile} toast={toast} />;

  return <ModuleLanding moduleId={module} onSelectFile={onSelectFile} />;
}

/* ══════════════════════════════════════════════════════════════
   SHARED — main head
   ══════════════════════════════════════════════════════════════ */

function MainHead({ title, desc, right }: { title: string; desc: string; right?: React.ReactNode }) {
  const mod = MODULES[moduleKey(title)];
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

function moduleKey(title: string): string {
  const entry = MODULE_ORDER.find(id => MODULES[id].title === title);
  return entry || 'workspace';
}

/* ══════════════════════════════════════════════════════════════
   WORKSPACE — hero · people · vitals · activity
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
   MODULE LANDING — card grid
   ══════════════════════════════════════════════════════════════ */

function ModuleLanding({ moduleId, onSelectFile }: { moduleId: string; onSelectFile: (id: string) => void }) {
  const mod = MODULES[moduleId];
  const tree = TREE[moduleId];

  return (
    <main className="main" id="main">
      <MainHead title={mod.title} desc={mod.desc} />
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
