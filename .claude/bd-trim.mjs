// Usage: node .claude/bd-trim.mjs <in.json> <out.json>
// Keeps spacing-relevant fields; drops optional fields the tool reads as CSS defaults.
import fs from "node:fs";

const [, , inFile, outFile] = process.argv;
if (!inFile || !outFile) {
  console.error("Usage: node bd-trim.mjs <in.json> <out.json>");
  process.exit(1);
}

const states = JSON.parse(fs.readFileSync(inFile, "utf8"));
const STYLE_KEYS = [
  "display", "flexDirection", "flexWrap", "alignItems", "justifyContent", "rowGap", "columnGap",
  "padding", "margin", "borderWidth", "overflowX", "overflowY", "textOverflow", "position", "zIndex",
];

const trimmed = states.map((state) => ({
  name: state.name,
  title: state.title,
  scope: state.scope,
  density: state.density,
  viewport: state.viewport,
  elements: state.elements.map((el) => {
    const out = { id: el.id, tag: el.tag, rect: el.rect };
    if (el.label !== undefined) out.label = el.label;
    if (el.parentId !== undefined) out.parentId = el.parentId;
    if (el.interactive !== undefined) out.interactive = el.interactive;
    if (el.inputType !== undefined) out.inputType = el.inputType;
    if (el.autoMargins !== undefined) out.autoMargins = el.autoMargins;
    if (el.clientWidth !== undefined) out.clientWidth = el.clientWidth;
    if (el.clientHeight !== undefined) out.clientHeight = el.clientHeight;
    if (el.scrollWidth !== undefined) out.scrollWidth = el.scrollWidth;
    if (el.scrollHeight !== undefined) out.scrollHeight = el.scrollHeight;
    if (el.inertCrop !== undefined) out.inertCrop = el.inertCrop;
    if (el.style) {
      const s = {};
      for (const k of STYLE_KEYS) if (el.style[k] !== undefined) s[k] = el.style[k];
      if (Object.keys(s).length) out.style = s;
    }
    return out;
  }),
}));

fs.writeFileSync(outFile, JSON.stringify(trimmed));
console.log(`${outFile}: ${JSON.stringify(trimmed).length} bytes, ${trimmed.map((t) => t.elements.length).join("/")} elements`);
