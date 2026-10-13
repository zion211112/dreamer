'use client';

import { MODULES, MODULE_ORDER, TREE, ANCHORS, findPage } from '@/lib/ontology';
import { highlight } from '@/lib/editor';

interface InspectorProps {
  module: string;
  page: string | null;
  onAction: (action: 'mint' | 'fork' | 'audit', page: string) => void;
}

export function Inspector({ module, page, onAction }: InspectorProps) {
  const mod = MODULES[module];
  const f = page ? findPage(page) : null;

  // Module overview — no page selected.
  if (!f) {
    const tree = TREE[module];
    return (
      <aside className="inspector" id="inspector">
        <div className="crumb">
          <span className="pill">
            <span className="ic">{mod.icon}</span>
            {mod.label}
          </span>
        </div>
        <div className="insp-path">/{mod.label}</div>
        <div className="meta-grid">
          <div className="meta-cell"><div className="k">module</div><div className="v small">{mod.label}</div></div>
          <div className="meta-cell"><div className="k">pages</div><div className="v">{tree.pages.length}</div></div>
          <div className="meta-cell"><div className="k">sub-depts</div><div className="v">{tree.dirs.length}</div></div>
          <div className="meta-cell"><div className="k">state</div><div className="v green small">ready</div></div>
        </div>
        <div className="insp-section-label">description</div>
        <div className="preview">{mod.desc}</div>
        <div className="insp-section-label">anchors · verified</div>
        {ANCHORS.map(a => (
          <div className="anchor-row" key={a.name}>
            <span className="av">{a.av}</span>
            {a.name}
            <span style={{ marginLeft: 'auto' }} className="sig">✓ signed</span>
          </div>
        ))}
      </aside>
    );
  }

  const fmod = MODULES[f.module];
  const previewLines = f.content.split('\n').slice(0, 12).join('\n');

  return (
    <aside className="inspector" id="inspector">
      <div className="crumb">
        <span className="pill">
          <span className="ic">{f.lang.toUpperCase().slice(0, 2)}</span>
          {f.name}
        </span>
      </div>
      <div className="insp-path">{f.id}</div>

      <div className="meta-grid">
        <div className="meta-cell"><div className="k">size</div><div className="v">{f.size}</div></div>
        <div className="meta-cell"><div className="k">lines</div><div className="v">{f.lines}</div></div>
        <div className="meta-cell"><div className="k">modified</div><div className="v small">just now</div></div>
        <div className="meta-cell">
          <div className="k">state</div>
          <div className={'v small ' + (f.state === 'built' ? 'green' : f.state === 'proto' ? 'amber' : 'cyan')}>
            {f.state}
          </div>
        </div>
      </div>

      <div className="insp-section-label">preview</div>
      <div
        className="preview"
        dangerouslySetInnerHTML={{
          __html: highlight(previewLines, f.lang) + (f.lines > 12 ? '\n…' : ''),
        }}
      />

      <div className="insp-section-label">provenance</div>
      <div className="anchor-row">
        <span className="av">A</span>
        aptlabs · genesis
        <span style={{ marginLeft: 'auto' }} className="sig">✓ 2026-09-14</span>
      </div>
      {f.state === 'built' && (
        <div className="anchor-row">
          <span className="av">W</span>
          wanjiru.m
          <span style={{ marginLeft: 'auto' }} className="sig">✓ signed</span>
        </div>
      )}

      <div className="insp-section-label">actions</div>
      <div className="anchor-row" style={{ cursor: 'pointer' }} onClick={() => onAction('mint', f.id)}>
        <span className="sig">◈</span>Mint to The Roll
      </div>
      <div className="anchor-row" style={{ cursor: 'pointer' }} onClick={() => onAction('fork', f.id)}>
        <span className="sig">⟐</span>Fork blueprint
      </div>
      <div className="anchor-row" style={{ cursor: 'pointer' }} onClick={() => onAction('audit', f.id)}>
        <span className="sig">◎</span>Request audit
      </div>

      {/* keep module reference for callers that need it */}
      <span style={{ display: 'none' }}>{fmod.icon}</span>
    </aside>
  );
}

export { MODULE_ORDER };
