// Pick the smallest trim that still drives a spacing/alignment review.
// Works off raw.json (no browser).
import { readFileSync } from 'node:fs';
const raw = JSON.parse(readFileSync(new URL('./raw.json', import.meta.url), 'utf8'));
const els = raw.elements;

const base = (el) => ({ id: el.id, tag: el.tag, rect: el.rect });
function styleKeep(el, keys) {
  if (!el.style) return undefined;
  const out = {};
  for (const k of keys) if (el.style[k] !== undefined) out[k] = el.style[k];
  return Object.keys(out).length ? out : undefined;
}

const SPACING = ['padding', 'margin', 'rowGap', 'columnGap'];
const LAYOUT = ['display', 'flexDirection', 'alignItems', 'justifyContent', 'position'];
const VISUAL = ['borderRadius', 'textAlign'];

function build(mode) {
  const st = styleKeep;
  return els.map((el) => {
    const o = base(el);
    if (el.parentId) o.parentId = el.parentId;
    if (el.label) o.label = el.label;
    if (el.interactive) o.interactive = true;
    if (el.inputType) o.inputType = el.inputType;
    if (el.lineCount) o.lineCount = el.lineCount;
    if (mode.text) o.textMetrics = el.textMetrics;
    const keys = [...SPACING];
    if (mode.layout) keys.push(...LAYOUT);
    if (mode.visual) keys.push(...VISUAL);
    const s = st(el, keys);
    if (s) o.style = s;
    if (el.clientWidth != null) { o.clientWidth = el.clientWidth; if (el.scrollWidth != null) { o.scrollWidth = el.scrollWidth; o.scrollHeight = el.scrollHeight; } }
    return o;
  });
}

function sizeOf(mode) {
  const state = { name: raw.name, scope: raw.scope, viewport: raw.viewport, elements: build(mode) };
  return JSON.stringify(state).length;
}

const variants = [
  ['A: spacing only', { text: false, layout: false, visual: false }],
  ['B: spacing+layout', { text: false, layout: true, visual: false }],
  ['C: spacing+layout+visual', { text: false, layout: true, visual: true }],
  ['D: B + textMetrics', { text: true, layout: true, visual: false }],
  ['E: full', { text: true, layout: true, visual: true }],
];
for (const [label, mode] of variants) {
  const one = sizeOf(mode);
  console.log(`${label.padEnd(38)} ${one} B/state  ~${one * 3} B for 3`);
}
