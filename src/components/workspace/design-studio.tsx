import { Check, ChevronRight, Copy, Frame, Square, Type, MousePointer2, ArrowRight, CircleDot } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Layer = { id: string; name: string; kind: 'frame' | 'text' | 'button' | 'box'; text?: string; dir?: 'row' | 'col'; gap?: number; pad?: number; children?: Layer[] };
type DesignFrame = { id: string; name: string; size: string; root: Layer };

const initialFrames: DesignFrame[] = [
  { id: 'FRM-01', name: 'MetricCard', size: '320 × 140', root: { id: 'card', name: 'MetricCard', kind: 'frame', dir: 'col', gap: 8, pad: 16, children: [
    { id: 'label', name: 'Label', kind: 'text', text: 'Useful work' },
    { id: 'value', name: 'Value', kind: 'text', text: '1,284 APT' },
    { id: 'delta', name: 'Delta', kind: 'text', text: '+12.8% from last epoch' },
  ] } },
  { id: 'FRM-02', name: 'ActionRow', size: '360 × 56', root: { id: 'row', name: 'ActionRow', kind: 'frame', dir: 'row', gap: 8, pad: 12, children: [
    { id: 'title', name: 'Title', kind: 'text', text: 'Mint artifact' },
    { id: 'spacer', name: 'Spacer', kind: 'box' },
    { id: 'cta', name: 'Confirm', kind: 'button', text: 'Confirm' },
  ] } },
  { id: 'FRM-03', name: 'EmptyState', size: '400 × 200', root: { id: 'empty', name: 'EmptyState', kind: 'frame', dir: 'col', gap: 12, pad: 24, children: [
    { id: 'h', name: 'Heading', kind: 'text', text: 'No records yet' },
    { id: 'p', name: 'Body', kind: 'text', text: 'Create your first build to see it here.' },
    { id: 'b', name: 'Primary', kind: 'button', text: 'New build' },
  ] } },
];

export const designTokens = [
  { name: '--background', role: 'Canvas', value: 'oklch(0.14 0.01 260)' },
  { name: '--card', role: 'Surface', value: 'oklch(0.173 0.012 260)' },
  { name: '--primary', role: 'Signal', value: 'oklch(0.79 0.154 164)' },
  { name: '--output', role: 'Output', value: 'oklch(0.804 0.134 85)' },
  { name: '--muted-foreground', role: 'Secondary text', value: 'oklch(0.65 0.018 260)' },
  { name: '--border', role: 'Hairline', value: 'oklch(0.267 0.015 260)' },
];

const space = (n?: number) => (n ? `${n / 4}` : '0');
function toJsx(l: Layer, depth: number): string {
  const ind = '  '.repeat(depth);
  if (l.kind === 'text') return `${ind}<p className="text-sm text-foreground">{props.${l.id} ?? '${l.text}'}</p>`;
  if (l.kind === 'button') return `${ind}<Button size="sm" onClick={props.onAction}>${l.text}</Button>`;
  if (l.kind === 'box') return `${ind}<div className="flex-1" />`;
  const cls = `flex ${l.dir === 'row' ? 'items-center' : 'flex-col'} gap-${space(l.gap)} p-${space(l.pad)} rounded-lg border bg-card`;
  return `${ind}<div className="${cls}">\n${(l.children ?? []).map(c => toJsx(c, depth + 1)).join('\n')}\n${ind}</div>`;
}
export function generateComponent(f: DesignFrame) {
  const texts = (f.root.children ?? []).filter(c => c.kind === 'text').map(c => `  ${c.id}?: string;`);
  const hasButton = (f.root.children ?? []).some(c => c.kind === 'button');
  return `${hasButton ? "import { Button } from '@/components/ui/button';\n\n" : ''}export type ${f.name}Props = {\n${texts.join('\n')}${hasButton ? '\n  onAction?: () => void;' : ''}\n};\n\nexport function ${f.name}(props: ${f.name}Props) {\n  return (\n${toJsx(f.root, 2)}\n  );\n}\n`;
}

function Preview({ layer, selected, onSelect }: { layer: Layer; selected: string; onSelect: (id: string) => void }) {
  const sel = selected === layer.id ? 'is-selected' : '';
  const pick = (e: React.MouseEvent) => { e.stopPropagation(); onSelect(layer.id); };
  if (layer.kind === 'text') return <span className={`studio-node studio-text ${sel}`} onClick={pick}>{layer.text}</span>;
  if (layer.kind === 'button') return <span className={`studio-node studio-btn ${sel}`} onClick={pick}>{layer.text}</span>;
  if (layer.kind === 'box') return <span className={`studio-node studio-spacer ${sel}`} onClick={pick} />;
  return <div className={`studio-node studio-frame ${layer.dir === 'row' ? 'row' : ''} ${sel}`} style={{ gap: layer.gap, padding: layer.pad }} onClick={pick}>{layer.children?.map(c => <Preview key={c.id} layer={c} selected={selected} onSelect={onSelect} />)}</div>;
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return <Button variant="outline" size="sm" className="outline-action" onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1400); }}>{done ? <Check size={13} /> : <Copy size={13} />}{done ? 'Copied' : label}</Button>;
}

const kindIcon = { frame: Frame, text: Type, button: MousePointer2, box: Square };

const shipSteps = ['Compile TSX', 'Type check', 'Token lint', 'Sign artifact', 'Record on ledger'];
function hashOf(text: string) { let h = 2166136261; for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619); const x = (h >>> 0).toString(16).padStart(8, '0'); return `0x${x.slice(0, 4)}…${x.slice(4)}`; }

export function DesignStudio({ page, onNavigate, onShip }: { page: string; onNavigate: (page: string) => void; onShip?: (name: string, hash: string) => void }) {
  const [step, setStep] = useState(-1);
  const [shipped, setShipped] = useState<string | null>(null);
  const [frames, setFrames] = useState(initialFrames);
  const [frameId, setFrameId] = useState(initialFrames[0]!.id);
  const [layerId, setLayerId] = useState(initialFrames[0]!.root.id);
  const update = (patch: Partial<Layer>) => setFrames(fs => fs.map(f => f.id !== frameId ? f : { ...f, root: f.root.id === layerId ? { ...f.root, ...patch } : { ...f.root, children: (f.root.children ?? []).map(c => c.id === layerId ? { ...c, ...patch } : c) } }));
  const reset = () => setFrames(fs => fs.map(f => f.id === frameId ? initialFrames.find(i => i.id === frameId)! : f));
  const [approved, setApproved] = useState<string[]>([]);
  const frame = frames.find(f => f.id === frameId)!;
  const code = useMemo(() => generateComponent(frame), [frame]);
  const layers = [frame.root, ...(frame.root.children ?? [])];
  const layer = layers.find(l => l.id === layerId) ?? frame.root;

  if (page === 'Tokens') {
    const css = `:root {\n${designTokens.map(t => `  ${t.name}: ${t.value};`).join('\n')}\n}`;
    return <section className="studio">
      <div className="section-heading"><h2>Design tokens</h2><CopyButton text={css} label="Copy CSS" /></div>
      <div className="studio-tokens">{designTokens.map(t => <div key={t.name} className="studio-token"><span className="studio-swatch" style={{ background: `var(${t.name})` }} /><div><strong>{t.role}</strong><code>{t.name}</code></div><code className="studio-token-value">{t.value}</code></div>)}</div>
      <p className="studio-note">Tokens are the single source for color. Components reference them by name, never by raw value.</p>
    </section>;
  }

  if (page === 'Handoff') {
    return <section className="studio">
      <div className="section-heading"><h2>Review queue</h2><span className="mono">{approved.length}/{frames.length} APPROVED</span></div>
      <ol className="studio-flow">{['Design', 'Tokens', 'Component', 'Review'].map((s, i) => <li key={s} className={i < 3 || approved.length === frames.length ? 'done' : ''}><CircleDot size={12} />{s}{i < 3 && <ChevronRight size={12} />}</li>)}</ol>
      <div className="studio-handoff">{frames.map(f => { const ok = approved.includes(f.id); return <div key={f.id} className="studio-handoff-row">
        <code>{f.id}</code><div><strong>{f.name}.tsx</strong><span>{f.size} · {(f.root.children ?? []).length} layers</span></div>
        <Button variant="ghost" size="sm" onClick={() => { setFrameId(f.id); setLayerId(f.root.id); onNavigate('Frames'); }}>Inspect<ArrowRight size={12} /></Button>
        <Button variant={ok ? 'outline' : 'default'} size="sm" onClick={() => setApproved(a => ok ? a.filter(x => x !== f.id) : [...a, f.id])}>{ok ? <><Check size={13} />Approved</> : 'Approve'}</Button>
      </div>; })}</div>
      <div className="studio-ship">
        <div className="section-heading"><h2>Ship</h2><span className="mono">{shipped ? `RECORDED ${shipped}` : step >= 0 ? `${step}/${shipSteps.length}` : 'READY WHEN APPROVED'}</span></div>
        <ol className="studio-steps">{shipSteps.map((s, i) => <li key={s} className={step > i || shipped ? 'done' : step === i ? 'running' : ''}><span>{step > i || shipped ? <Check size={12} /> : String(i + 1).padStart(2, '0')}</span>{s}</li>)}</ol>
        <Button disabled={approved.length !== frames.length || step >= 0 || !!shipped} onClick={() => {
          const bundle = frames.map(generateComponent).join('\n'); const h = hashOf(bundle);
          let i = 0; setStep(0);
          const tick = () => { i += 1; setStep(i); if (i < shipSteps.length) setTimeout(tick, 420); else { setShipped(h); setStep(-1); onShip?.(`${frames.length} components`, h); } };
          setTimeout(tick, 420);
        }}>{shipped ? <><Check size={13} />Shipped</> : step >= 0 ? 'Shipping…' : `Ship ${frames.length} components`}<ArrowRight size={12} /></Button>
        <p className="studio-note">Runs locally in this preview. The hash is derived from the generated code, so any edit produces a new record.</p>
      </div>
    </section>;
  }

  return <section className="studio">
    <div className="studio-frames" role="tablist" aria-label="Frames">{frames.map(f => <Button key={f.id} variant="ghost" role="tab" aria-selected={f.id === frameId} className={f.id === frameId ? 'selected' : ''} onClick={() => { setFrameId(f.id); setLayerId(f.root.id); }}><Frame size={12} />{f.name}<span>{f.size}</span></Button>)}</div>
    <div className="studio-grid">
      <div className="studio-layers"><div className="studio-label">LAYERS</div>{layers.map((l, i) => { const Icon = kindIcon[l.kind]; return <button key={l.id} className={`studio-layer ${l.id === layerId ? 'selected' : ''}`} style={{ paddingLeft: i === 0 ? 10 : 26 }} onClick={() => setLayerId(l.id)}><Icon size={12} />{l.name}</button>; })}
        <div className="studio-label">PROPERTIES</div>
        <dl className="studio-props"><dt>Type</dt><dd>{layer.kind}</dd>{layer.dir && <><dt>Layout</dt><dd><button className="studio-toggle" onClick={() => update({ dir: layer.dir === 'row' ? 'col' : 'row' })}>{layer.dir === 'row' ? 'Horizontal' : 'Vertical'}</button></dd><dt>Gap</dt><dd><input aria-label="Gap" className="studio-input" type="number" min={0} max={48} step={4} value={layer.gap} onChange={e => update({ gap: Math.max(0, Math.min(48, Number(e.target.value))) })} /></dd><dt>Padding</dt><dd><input aria-label="Padding" className="studio-input" type="number" min={0} max={48} step={4} value={layer.pad} onChange={e => update({ pad: Math.max(0, Math.min(48, Number(e.target.value))) })} /></dd></>}{layer.text !== undefined && <><dt>Content</dt><dd><input aria-label="Content" className="studio-input wide" value={layer.text} maxLength={60} onChange={e => update({ text: e.target.value })} /></dd></>}</dl>
        <button className="studio-reset" onClick={reset}>Reset frame</button>
      </div>
      <div className="studio-canvas" onClick={() => setLayerId(frame.root.id)}><Preview layer={frame.root} selected={layerId} onSelect={setLayerId} /></div>
    </div>
    <div className="section-heading"><h2>{frame.name}.tsx <span className="studio-live"><span className="live-dot" />Live from canvas</span></h2><CopyButton text={code} label="Copy component" /></div>
    <pre className="studio-code"><code>{code}</code></pre>
  </section>;
}
