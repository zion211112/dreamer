/**
 * Lexicon audit for the APT-LABS editorial boundary.
 *
 * This site publishes only claims it can cite, and it never publishes the
 * operational detail of a local demo console — fees, attendance, marking,
 * learners, a school timetable — on a route where the reader takes it as a
 * claim about real institutions. That rule had been broken repeatedly and
 * every leak reached the site the same way: through lib/system.ts, which
 * stated the contract in a doc comment and exported nothing anybody could
 * read. A rule that is only written down is a rule kept only by whoever
 * happens to be reading.
 *
 * The banned vocabulary therefore lives in code, in lib/system.ts, as
 * CONSOLE_VOCABULARY, and this script reads that one declaration instead of
 * carrying a copy of the list. A second copy is a fifth thing to keep in
 * step, which is the exact failure the export was written to stop: if the
 * declaration cannot be found, or parses to nothing, this script refuses to
 * run instead of passing on an empty ban. A check that quietly stops
 * checking is worse than a check that is missing.
 *
 *   1. ROUTE LEXICON     — no console noun inside a string a public route
 *                          renders.
 *   2. IMPORT DIRECTION  — no public route imports the console's own
 *                          vocabulary. The dependency runs the wrong way
 *                          today and has to keep running the wrong way;
 *                          this is the assertion that would have failed on
 *                          the first line of every leak, because every leak
 *                          was written into lib/system.ts rather than
 *                          imported, and a leak through the source of
 *                          truth is indistinguishable from the source of
 *                          truth until somebody reads the words.
 *   3. CROSS-FILE DRIFT  — lib/system.ts and lib/console.ts share no name
 *                          literal, so the console's module list can never
 *                          be re-typed into the architecture.
 *   4. CITED SOURCES     — every id in a `sources: [...]` array resolves to
 *                          a record declared elsewhere in lib/system.ts.
 *
 * Run: npm run check:lexicon  (also part of `npm run check`)
 * Exits non-zero on any violation: fix the route, not the check.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (rel) =>
  readFileSync(fileURLToPath(new URL(`../${rel}`, import.meta.url)), "utf8");

/* ═══════════════════════════════════════════════════════════════════
   A lexical scanner, not a parser.

   A real TypeScript AST would answer "is this string rendered?" exactly.
   Nothing here can: a term can reach the page through a template literal, a
   concatenation, a value minted in lib/system.ts three files away, or a
   prop defaulted at the call site. What a scanner *can* do is find every
   quoted string on a route and apply a stated, reviewable rule to it, which
   is worth more than an exact answer nobody had time to write — and the
   rule below is written out in full because a ban whose scope is not legible
   from its source is a ban that stops being read and starts being worked
   around.
   ═══════════════════════════════════════════════════════════════════ */

/** End index of the string literal opening at `start`. */
function stringEnd(text, start) {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === quote) return i;
    /* An unterminated quote ends at the newline rather than swallowing the
       rest of the file, so one stray apostrophe in a comment cannot turn the
       remainder of a route into a single quoted string. */
    if (quote !== "`" && c === "\n") return i - 1;
  }
  return text.length - 1;
}

/** Comments become spaces, not deletions, so every offset — and therefore
    every line number this script reports — is still the one in the file the
    maintainer will open. */
const blank = (s) => s.replace(/[^\n]/g, " ");

function stripComments(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      const end = stringEnd(text, i);
      out += text.slice(i, end + 1);
      i = end + 1;
    } else if (c === "/" && text[i + 1] === "/") {
      const nl = text.indexOf("\n", i);
      const end = nl === -1 ? text.length : nl;
      out += blank(text.slice(i, end));
      i = end;
    } else if (c === "/" && text[i + 1] === "*") {
      const close = text.indexOf("*/", i + 2);
      const end = close === -1 ? text.length : close + 2;
      out += blank(text.slice(i, end));
      i = end;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

/** Every quoted string in already-comment-stripped text. */
function literals(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      const end = stringEnd(text, i);
      out.push({ start: i, value: text.slice(i + 1, end) });
      i = end + 1;
    } else {
      i++;
    }
  }
  return out;
}

/** Index of the bracket that closes the one at `open`. */
function blockEnd(text, open) {
  const pairs = { "[": "]", "{": "}" };
  const closeCh = pairs[text[open]];
  if (!closeCh) throw new Error(`blockEnd called on "${text[open]}"`);
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      i = stringEnd(text, i);
    } else if (c === "/" && text[i + 1] === "/") {
      const nl = text.indexOf("\n", i);
      i = nl === -1 ? text.length : nl;
    } else if (c === "/" && text[i + 1] === "*") {
      const close = text.indexOf("*/", i + 2);
      i = close === -1 ? text.length : close + 1;
    } else if (c === text[open]) {
      depth++;
    } else if (c === closeCh && --depth === 0) {
      return i;
    }
  }
  return -1;
}

/** Inner text of a named `export const` array or object, or a refusal.

    The optional `where` is for the two files the script reads as its own
    subject. There, a declaration that cannot be found means the check is
    auditing a list it did not read — which is why it throws rather than
    returning an empty one and letting the table print PASS over it. */
function blockOf(text, name, where) {
  const decl = new RegExp(`export\\s+const\\s+${name}\\b[\\s\\S]{0,400}?=\\s*([\\[{])`).exec(text);
  if (!decl) {
    throw new Error(
      `No \`export const ${name}\` declaration could be read from ${where}. ` +
        `It has been renamed, moved or rewritten — re-point scripts/check-lexicon.mjs ` +
        `at its current form, because a checker that keeps running against a list ` +
        `it can no longer see is not a checker.`
    );
  }
  const open = text.indexOf(decl[1], decl.index + decl[0].length - 1);
  const close = blockEnd(text, open);
  if (close < 0) throw new Error(`The ${name} declaration in ${where} never closes.`);
  return text.slice(open + 1, close);
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

/** One line, no longer than the table. */
const clip = (s) => {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > 72 ? `${flat.slice(0, 71)}…` : flat;
};

const TEXT_FILE = /\.[cm]?[jt]sx?$/;

/** Every source file under a directory, as repo-relative posix paths. */
function walk(dir) {
  const at = fileURLToPath(new URL(`../${dir}`, import.meta.url));
  let entries;
  try {
    entries = readdirSync(at, { withFileTypes: true });
  } catch {
    throw new Error(
      `${dir} is not there. The public surface moved and this script is still ` +
        `reading the old shape of it — re-point scripts/check-lexicon.mjs.`
    );
  }
  const out = [];
  for (const e of entries) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...walk(rel));
    else if (TEXT_FILE.test(e.name)) out.push(rel);
  }
  return out.sort();
}

/* ═══════════════════════════════════════════════════════════════════
   THE BAN, read from the declaration that holds it.

   lib/system.ts:72 owns this list. It is read here rather than restated
   because one list in that file and one list in this one would be two
   answers to a single question, and the day they disagreed the site would
   be enforcing a vocabulary nobody chose.
   ═══════════════════════════════════════════════════════════════════ */

const SYSTEM = stripComments(read("lib/system.ts"));

const VOCABULARY = [
  ...blockOf(SYSTEM, "CONSOLE_VOCABULARY", "lib/system.ts").matchAll(/"([^"]*)"/g),
]
  .map((m) => m[1])
  .filter((t) => t.length > 0);

if (VOCABULARY.length === 0) {
  throw new Error(
    "CONSOLE_VOCABULARY parsed out of lib/system.ts is empty. An empty ban list " +
      "passes every route, so the script stops rather than reporting a clean " +
      "audit of nothing. Re-point scripts/check-lexicon.mjs at the declaration."
  );
}

/* Whole words, case-insensitively. Substring matching is how a ban list
   gets worked around within a week of being written: `class` inside
   `classification`, `mark` inside `marker`, and then somebody starts
   spelling around the rule instead of reading it. `marks` is a different
   word from `mark` and is still the console's, which is why the boundary is
   the word and not the stem. Terms are escaped because "pay statement"
   would otherwise carry a quantifier rather than a space. */
const BANNED = VOCABULARY.map((term) => [
  term,
  new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
]);

function offendingTerms(value) {
  return BANNED.filter(([, re]) => re.test(value)).map(([term]) => term);
}

const results = [];
const record = (check, ok, detail, evidence = []) =>
  results.push({ check, ok, detail, evidence });

/* ═══════════════════════════════════════════════════════════════════
   1. ROUTE LEXICON

   The public surface: every file under app/(site) and components/site,
   plus the handful of app-level files that render to a reader without
   belonging to a route group. Each is read, stripped of comments, and every
   quoted string that survives the exclusions below is tested against the
   ban.

   The exclusions, in full, because the rule is the check:

     · import statements and module specifiers — `@/lib/system` is a path,
       not a claim;
     · className, id, key, aria-label and href values — a `className` is a
       token in a stylesheet and a `href` is a route; neither is copy;
     · anything inside a /* … *\/ or // … comment — the reasoning about a
       ban belongs to whoever maintains it, not to the reader;
     · anything beginning `@/`, `~/`, `./` or `../` — the same path, written
       as a JSX import.

   What this does NOT cover, stated plainly: JSX text children, and every
   value minted in lib/system.ts or composed at a call site. A leak written
   as `<p>Fees collected</p>` is invisible here. That is accepted rather than
   papered over, because this repository mints its copy in lib/system.ts —
   a route's own strings are class names and hrefs — so the surface where a
   leak has historically entered is the one assertion 2 and 3 watch.
   ═══════════════════════════════════════════════════════════════════ */

const SITE_ROOTS = ["app/(site)", "components/site"];
const APP_FILES = [
  "app/layout.tsx",
  "app/not-found.tsx",
  "app/error.tsx",
  "app/global-error.tsx",
  "app/opengraph-image.tsx",
  "app/sitemap.ts",
  "app/robots.ts",
];

const ROUTE_FILES = [...SITE_ROOTS.flatMap(walk), ...APP_FILES];

for (const file of APP_FILES) {
  try {
    read(file);
  } catch {
    throw new Error(
      `${file} is named by scripts/check-lexicon.mjs and is not there. A named ` +
        `file that has quietly gone is a surface the lexicon audit stops ` +
        `covering while the table still prints PASS — re-point the script.`
    );
  }
}

/* The two forms an excluded JSX attribute takes around a string: the bare
   form (`className="…"`) and the braced form (`className={"…"}`,
   `className={`…`}`). A string reached through `={…}` is still a literal
   this scanner can see, so it has to be excluded here too or every template
   literal on a route reads as an exemption hole. */
const ATTR_BRACED = /\b(?:className|id|key|aria-label|href)\s*=\s*\{\s*$/;
const ATTR_BARE = /\b(?:className|id|key|aria-label|href)\s*=\s*$/;
/* `from "…"`, `import "…"`, `import("…")`, `require("…")`. */
const SPECIFIER = /(?:^|[^\w$])(?:from|import|require)\s*(?:\(\s*)?$/;
const PATH_LIKE = /^[@~]|^[.\/]/;

let audited = 0;
const leaks = [];

for (const file of ROUTE_FILES) {
  const text = stripComments(read(file));
  for (const lit of literals(text)) {
    const before = text.slice(Math.max(0, lit.start - 240), lit.start);
    if (SPECIFIER.test(before)) continue;
    if (ATTR_BRACED.test(before) || ATTR_BARE.test(before)) continue;
    if (PATH_LIKE.test(lit.value)) continue;
    audited++;
    const terms = offendingTerms(lit.value);
    if (terms.length > 0) {
      leaks.push({
        at: `${file}:${lineOf(text, lit.start)}`,
        detail: `${terms.join(", ")}  →  ${JSON.stringify(clip(lit.value))}`,
      });
    }
  }
}

record(
  "route lexicon",
  leaks.length === 0,
  `${VOCABULARY.length} terms banned · ${leaks.length} of ${audited} rendered ` +
    `strings in ${ROUTE_FILES.length} files`,
  leaks
);

/* ═══════════════════════════════════════════════════════════════════
   2. IMPORT DIRECTION

   The assertion that actually prevents recurrence. Nothing under
   app/(site) or components/site may import @/lib/console or @/lib/school:
   the console's vocabulary lives in those two files, and the console never
   reads lib/system.ts, so the dependency has to stay one-way.

   It passes today and it is the check worth having. Every previous leak
   arrived through lib/system.ts, which means an import assertion alone
   would have watched all of them go past — the architecture importing
   nothing would still have published the console's nouns, because the nouns
   were copied rather than imported. Assertions 1 and 3 are what cover the
   copy; this one is what stops the route reaching in once somebody
   reasonably concludes that lib/system.ts is where the console's own
   subjects are written down.
   ═══════════════════════════════════════════════════════════════════ */

const CONSOLE_MODULES = ["@/lib/console", "@/lib/school"];
const reachings = [];
let siteFiles = 0;

for (const dir of SITE_ROOTS) {
  for (const file of walk(dir)) {
    siteFiles++;
    const text = stripComments(read(file));
    for (const m of text.matchAll(
      /(?:from|import|require)\s*\(?\s*["'](@\/lib\/(?:console|school))["']/g
    )) {
      reachings.push({
        at: `${file}:${lineOf(text, m.index)}`,
        detail: `${m[1]}  —  the console's vocabulary, imported into the public surface`,
      });
    }
  }
}

record(
  "import direction",
  reachings.length === 0,
  `${siteFiles} site files · ${reachings.length} import ${CONSOLE_MODULES.join(" or ")}`,
  reachings
);

/* ═══════════════════════════════════════════════════════════════════
   3. CROSS-FILE DRIFT

   lib/console.ts holds the console's module list, its menu keys and its
   tool titles: the same names three times over, all of them the console's
   own business. lib/system.ts must not contain any of them.

   The comparison is case-exact, and that is the point rather than a
   loophole. CONSOLE_VOCABULARY holds lowercase console *nouns* — `fees`,
   `timetable` — because the architecture borrows those words in its own
   sense and its doc comment says so; a checker that folded case here would
   collide that documented distinction and fail on a file that has done
   nothing. What must never cross is a *name*: `Fees` and `Timetable` are
   menu entries, and a hand-copied module list into the source of truth is
   exactly the seven-copies-of-a-count failure this repo already paid for
   once, seven times over.

   The names are read from the declarations rather than typed here, so the
   console cutting or adding a module changes what is banned without anyone
   touching this file.
   ═══════════════════════════════════════════════════════════════════ */

const CONSOLE = stripComments(read("lib/console.ts"));

const consoleNames = new Set([
  ...blockOf(CONSOLE, "CONSOLE_MODULES", "lib/console.ts").matchAll(/"([^"]*)"/g),
].map((m) => m[1]));

for (const m of blockOf(CONSOLE, "CONSOLE_TOOLS", "lib/console.ts").matchAll(
  /\btitle:\s*"([^"]*)"/g
)) {
  consoleNames.add(m[1]);
}

/* The menu restates the module list a third time. Reading it costs one
   regex and removes the copy that is most likely to be the one that
   drifts. */
for (const m of blockOf(CONSOLE, "CONSOLE_MENU", "lib/console.ts").matchAll(
  /^\s*"([^"]+)"\s*:/gm
)) {
  consoleNames.add(m[1]);
}

if (consoleNames.size === 0) {
  throw new Error(
    "lib/console.ts yielded no module or tool names. The drift assertion would " +
      "compare two empty sets and report PASS, which is the shape of a check " +
      "that has stopped checking — re-point scripts/check-lexicon.mjs."
  );
}

const SYSTEM_LITERALS = literals(SYSTEM).map((l) => l.value);
const shared = [...new Set(SYSTEM_LITERALS.filter((v) => consoleNames.has(v)))].sort();

record(
  "cross-file drift",
  shared.length === 0,
  `${consoleNames.size} console names · ${shared.length} of ${SYSTEM_LITERALS.length} ` +
    `lib/system.ts literals shared`
);

/* ═══════════════════════════════════════════════════════════════════
   4. CITED SOURCES RESOLVE

   RULE-05 says a VERIFIED row without a source is a bug. The mirror of it
   is a row that *names* a source which does not exist: the three SIGNALS
   used to cite ASSESSMENT-01, MARK-KEY-01, ATTENDANCE-01 and FEE-01, ids
   defined nowhere in this repository, rendered on /intelligence as
   citation chips — a record asserting evidence that was never recorded.
   They are `sources: []` now, which is the correction: a derived reading
   that rests on nothing has to say so rather than cite a filename-shaped
   lie. An empty array is therefore legal here and passes.

   The resolvable set is the three record families a derived reading may
   legitimately rest on — REGISTERS ords, SIGNAL ids, MEASURES keys.
   Widening it is a decision about what counts as a record, not a
   convenience for the next row that would rather not fail, so it is left
   narrow until somebody argues the other case in a comment.
   ═══════════════════════════════════════════════════════════════════ */

const resolvable = new Set([
  ...blockOf(SYSTEM, "REGISTERS", "lib/system.ts").matchAll(/\bord:\s*"([^"]*)"/g),
].map((m) => m[1]));
for (const m of blockOf(SYSTEM, "SIGNALS", "lib/system.ts").matchAll(/\bid:\s*"([^"]*)"/g)) {
  resolvable.add(m[1]);
}
for (const m of blockOf(SYSTEM, "MEASURES", "lib/system.ts").matchAll(/\bkey:\s*"([^"]*)"/g)) {
  resolvable.add(m[1]);
}

const cited = [];
let arrays = 0;
for (const m of SYSTEM.matchAll(/\bsources\s*:\s*\[/g)) {
  arrays++;
  const open = m.index + m[0].length - 1;
  const close = blockEnd(SYSTEM, open);
  if (close < 0) {
    throw new Error("A `sources:` array in lib/system.ts never closes.");
  }
  for (const lit of literals(SYSTEM.slice(open + 1, close))) {
    cited.push({ id: lit.value, at: lineOf(SYSTEM, open + 1 + lit.start) });
  }
}

const dangling = cited.filter((c) => !resolvable.has(c.id));

record(
  "cited sources resolve",
  dangling.length === 0,
  `${arrays} sources arrays · ${cited.length} cited ids · ${resolvable.size} ids ` +
    `declared in lib/system.ts`,
  dangling.map((d) => ({ at: `lib/system.ts:${d.at}`, detail: `${d.id}  —  cited by nothing in this file` }))
);

/* ═══════════════════════════════════════════════════════════════════
   Report
   ═══════════════════════════════════════════════════════════════════ */

const failed = results.filter((r) => !r.ok);
const pad = Math.max(...results.map((r) => r.check.length));

console.log(
  "\nAPT-LABS lexicon audit — console vocabulary on the public surface\n" +
    "=".repeat(pad + 66)
);

for (const { check, detail, ok, evidence } of results) {
  console.log(`${check.padEnd(pad)}  ${ok ? "PASS" : "FAIL"}  ${detail}`);
  /* The evidence sits under the invariant it breaks rather than beside it:
     the table is four named invariants, and a file:line under the one that
     failed is the difference between a finding and a number. */
  for (const e of evidence) {
    console.log(`${"".padEnd(pad)}      ${e.at}  ${e.detail}`);
  }
}
console.log("=".repeat(pad + 66));

if (failed.length > 0) {
  const found = failed.reduce((n, r) => n + r.evidence.length, 0);
  console.error(
    `\n${failed.length} invariant(s) broken, ${found} occurrence(s). The vocabulary is the ` +
      `boundary — fix the route, not the check.\n`
  );
  process.exit(1);
}
console.log(
  `\nAll ${results.length} invariants hold: one banned list, one direction of import, ` +
    `one name list, every citation resolvable.\n`
);
