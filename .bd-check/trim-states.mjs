// Trim the captured gate4 states to the two new panels:
// - Records: the .records-search wrapper (input + clear + count line)
// - Coordination: the Knowledge section
// Keeps original ids so parentId links stay valid; includes one level of
// parent for layout context.
import { readFileSync, writeFileSync } from 'node:fs';

const { states } = JSON.parse(readFileSync('states-gate4.json', 'utf8'));

function byId(state) {
  const map = new Map(state.elements.map((e) => [e.id, e]));
  return map;
}

function ancestorsOf(id, map) {
  const out = [];
  let cur = id;
  while (cur && map.has(cur)) {
    cur = map.get(cur).parentId;
    if (cur) out.push(cur);
  }
  return out;
}

function keep(state, topId, map) {
  const top = map.get(topId);
  const keepIds = new Set([topId, top.parentId].filter(Boolean));
  for (const el of state.elements) {
    if (ancestorsOf(el.id, map).includes(topId)) keepIds.add(el.id);
  }
  return {
    name: state.name,
    title: state.title,
    scope: state.scope,
    viewport: state.viewport,
    elements: state.elements.filter((e) => keepIds.has(e.id)),
  };
}

const results = [];
for (const state of states) {
  const map = byId(state);
  if (state.name.includes('records-page')) {
    const input = state.elements.find((e) => e.inputType === 'search');
    const top = map.get(input.parentId).parentId; // .records-search wrapper
    const trimmed = keep(state, top, map);
    trimmed.name = state.name.replace('viewport-1440', 'records-search-1440').replace('viewport-390', 'records-search-390');
    results.push(trimmed);
  } else if (state.name.includes('.coord')) {
    const h2 = state.elements.find((e) => e.label === 'Knowledge' && e.tag === 'h2');
    let top = h2.parentId;
    while (top && map.get(top).tag !== 'section') top = map.get(top).parentId;
    const trimmed = keep(state, top, map);
    trimmed.name = state.name.replace('viewport-1440', 'knowledge-1440').replace('viewport-390', 'knowledge-390');
    results.push(trimmed);
  }
}

for (const r of results) {
  const file = `state-${r.name.replace(/[^a-z0-9-]/gi, '-')}.json`;
  writeFileSync(file, JSON.stringify(r, null, 1));
  console.log(file, r.elements.length, 'elements');
}
