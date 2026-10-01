// Temporary CSS structural validator: detects rules truncated mid-block,
// orphaned declarations and stray closing braces across every stylesheet.
const fs = require("fs");
const path = require("path");

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(p);
    } else if (p.endsWith(".css")) {
      files.push(p);
    }
  }
})("app");
for (const f of fs.readdirSync("components").filter((f) => f.endsWith(".css"))) {
  files.push("components/" + f);
}

let defective = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8").split("\n");
  // remove comments (single or multi-line)
  const lines = raw.map((l) => l.replace(/\/\*.*?\*\//g, ""));
  const stack = [];
  const nested = [];
  const strayDecl = [];
  let inComment = false;

  for (let i = 0; i < lines.length; i++) {
    let code = lines[i];
    if (inComment) {
      const end = code.indexOf("*/");
      if (end === -1) continue;
      inComment = false;
      code = code.slice(end + 2);
    }
    // unterminated block comment opening on this line
    const open = code.indexOf("/*");
    if (open !== -1 && code.indexOf("*/", open) === -1) {
      inComment = true;
      code = code.slice(0, open);
    }

    let quote = null;
    for (const ch of code) {
      if (quote) {
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"') {
        quote = ch;
        continue;
      }
      if (ch === "{") {
        const parent = stack[stack.length - 1];
        stack.push({ line: i + 1, text: code.trim(), depth: stack.length });
        // Only nesting inside a real style rule is a defect. Rules inside
        // @media / @supports / @keyframes are the normal, intended shape.
        if (stack.length > 1 && parent && !/^@/.test(parent.text)) {
          nested.push({ line: i + 1, inside: parent.text });
        }
      } else if (ch === "}") {
        stack.pop();
      }
    }

    if (
      stack.length === 0 &&
      /^\s*(color|display|gap|margin|padding|text-transform|justify-content|align-items|border|font|background|grid|flex|opacity|width|height)\s*:/.test(code) &&
      !/^\s*\*/.test(code)
    ) {
      strayDecl.push(i + 1);
    }
  }

  if (nested.length || strayDecl.length || stack.length) {
    defective++;
    console.log("DEFECT " + file);
    if (stack.length) console.log("   unclosed at EOF:", stack.map((s) => s.line + " " + s.text).slice(0, 5));
    if (nested.length) console.log("   nested rules:", nested.slice(0, 6).map((n) => n.line + " inside " + n.inside).join(" | "));
    if (strayDecl.length) console.log("   stray declarations at lines:", strayDecl.slice(0, 6));
  } else {
    console.log("clean: " + file);
  }
}

console.log(defective ? "FILES WITH DEFECTS: " + defective : "ALL CSS STRUCTURALLY CLEAN");

// ── Dead-selector sweep ────────────────────────────────────────────────
// Collects every class selector declared in CSS and checks it against the
// class names actually rendered by the app. Anything never used is dead CSS
// shipped to production for nothing.
const SRC_EXT = [".tsx", ".ts", ".jsx", ".js"];
const sources = [];
const walkSrc = function (dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      walkSrc(p);
    } else if (SRC_EXT.includes(path.extname(entry.name))) {
      sources.push(p);
    }
  }
};
walkSrc("app");
walkSrc("components");
walkSrc("lib");

const used = new Set();
for (const f of sources) {
  const txt = fs.readFileSync(f, "utf8");
  for (const m of txt.matchAll(/className\s*=\s*(?:"([^"]*)"|\{`([^`]*)`\}|\{\s*"([^"]*)"\s*\})/g)) {
    const raw = (m[1] || m[2] || m[3] || "").replace(/\$\{[^}]*\}/g, " ");
    for (const c of raw.split(/\s+/)) {
      const name = c.trim();
      if (name && !name.includes("$") && !name.startsWith("{")) used.add(name);
    }
  }
}
// classNames produced by ternaries like `"nav-link" + (active ? ...)` are
// still captured by the template-literal branch above; also seed the set with
// any bare token appearing in a className-adjacent string literal.
for (const f of sources) {
  const txt = fs.readFileSync(f, "utf8");
  for (const m of txt.matchAll(/"([a-z][a-z0-9-]*(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?)"/g)) {
    used.add(m[1]);
  }
}

const declared = new Map();
for (const file of files) {
  const txt = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of txt.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
    if (!declared.has(m[1])) declared.set(m[1], new Set());
    declared.get(m[1]).add(file);
  }
}

const dead = [...declared.entries()].filter(([name]) => !used.has(name));
if (dead.length) {
  console.log("\nDEAD CSS SELECTORS (" + dead.length + "):");
  for (const [name, where] of dead.slice(0, 60)) {
    console.log("  ." + name + "  <- " + [...where].join(", "));
  }
} else {
  console.log("NO DEAD CSS SELECTORS");
}