// 2-width variant-B states (1440 desktop + 390 phone) from states-scoped.json.
// 1728 is structurally identical to 1440 for .coord, so it is omitted to keep the
// payload small enough to hand into inspect-spacing.
import { readFileSync, writeFileSync } from 'node:fs';

const src = JSON.parse(readFileSync(new URL('./states-scoped.json', import.meta.url), 'utf8'));
const KEYS = new Set(['padding', 'margin', 'rowGap', 'columnGap', 'display', 'flexDirection', 'alignItems', 'justifyContent', 'position']);

function trimState(st) {
  return {
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
  };
}

const states = [src.states[0], src.states[2]].map(trimState); // 1440, 390
const out = { title: 'Coordination Workbench (.coord)', states };
writeFileSync(new URL('./states-2w.json', import.meta.url), JSON.stringify(out));
console.log('states-2w bytes:', JSON.stringify(out).length, ' widths:', states.map((s) => s.viewport.width).join(','));
