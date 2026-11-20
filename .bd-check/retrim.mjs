// Re-trim the already-captured 3-width states (states-scoped.json) down to
// variant B: spacing + layout fields only. No browser needed.
import { readFileSync, writeFileSync } from 'node:fs';

const src = JSON.parse(readFileSync(new URL('./states-scoped.json', import.meta.url), 'utf8'));
const KEYS = new Set(['padding', 'margin', 'rowGap', 'columnGap', 'display', 'flexDirection', 'alignItems', 'justifyContent', 'position']);

const states = src.states.map((st) => ({
  name: st.name,
  title: st.title,
  scope: st.scope,
  viewport: st.viewport,
  elements: st.elements.map((el) => {
    const o = { id: el.id, tag: el.tag, rect: el.rect };
    if (el.parentId) o.parentId = el.parentId;
    if (el.label) o.label = el.label;
    if (el.interactive) o.interactive = true;
    if (el.inputType) o.inputType = el.inputType;
    if (el.lineCount) o.lineCount = el.lineCount;
    if (el.clientWidth != null) {
      o.clientWidth = el.clientWidth;
      if (el.clientHeight != null) o.clientHeight = el.clientHeight;
      if (el.scrollWidth != null) { o.scrollWidth = el.scrollWidth; o.scrollHeight = el.scrollHeight; }
    }
    if (el.style) {
      const kept = {};
      for (const k of Object.keys(el.style)) if (KEYS.has(k)) kept[k] = el.style[k];
      if (Object.keys(kept).length) o.style = kept;
    }
    return o;
  }),
}));

const out = { title: src.title, states };
writeFileSync(new URL('./states-final.json', import.meta.url), JSON.stringify(out));
console.log('states-final bytes:', JSON.stringify(out).length, ' elements/state:', states.map((s) => s.elements.length).join(','));
