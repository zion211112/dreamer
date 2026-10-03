// One-off audit: find classNames used in JSX that no CSS file defines.
// Run: node scripts/audit-classes.js
const fs = require("fs");
const path = require("path");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = [...walk("app"), ...walk("components")];
const css = files
  .filter((f) => f.endsWith(".css"))
  .map((f) => fs.readFileSync(f, "utf8"))
  .join("\n");

// Utilities Tailwind generates at build time, so they are absent from source CSS
// by design. Keep this list in sync when new utility families are used.
const tailwindish =
  /^(flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|static|container|isolate|truncate|italic|underline|uppercase|lowercase|capitalize|normal|antialiased|sr-only|group|peer|transition|delay|duration|ease|animate|transform|translate|scale|rotate|skew|origin|overflow|overscroll|basis|order|col|row|gap|space|divide|place|justify|items|self|content|shrink|grow|w|h|size|min|max|p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|text|font|leading|tracking|indent|align|tabular|whitespace|break|list|decoration|bg|from|via|to|border|rounded|ring|outline|shadow|opacity|mix|filter|backdrop|table|cursor|select|resize|appearance|pointer|touch|scroll|snap|z|inset|top|bottom|left|right|fill|stroke|aspect|object|columns|will|accent|caret|float|clear|prose)(-|$)/;

const used = new Map();
for (const f of files.filter((f) => /\.(tsx|ts)$/.test(f))) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    const raw = (m[1] || m[2] || "").replace(/\$\{[^}]*\}/g, " ");
    for (const t of raw.split(/\s+/)) {
      if (!t || !/^[a-z]/.test(t)) continue;
      if (/[:[\]/%]/.test(t)) continue;
      if (tailwindish.test(t)) continue;
      if (!used.has(t)) used.set(t, new Set());
      used.get(t).add(f);
    }
  }
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const missing = [];
for (const [cls, fl] of used) {
  if (new RegExp("\\." + escapeRe(cls) + "(?![\\w-])").test(css)) continue;
  missing.push([cls, [...fl]]);
}

console.log("=== USED IN JSX, NEVER DEFINED IN CSS: " + missing.length + " ===");
for (const [c, fl] of missing.sort()) {
  console.log(c.padEnd(26), "| " + fl.length + " file(s): " + fl.join(", "));
}

// Non-zero exit fails CI when a class is referenced but never styled.
if (missing.length > 0) process.exitCode = 1;
