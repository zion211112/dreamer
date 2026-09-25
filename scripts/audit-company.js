// audit-company.js — CI cross-check between the runtime truth and the human
// evidence record.
//
//   lib/company.ts          runtime source of truth for public claims
//   docs/EVIDENCE-PACK.md   human evidence record
//
// They may not disagree. This script fails the build when they do.
//
// Run: node scripts/audit-company.js

const fs = require("fs");
const path = require("path");

const COMPANY_TS = "lib/company.ts";
const PACK = "docs/EVIDENCE-PACK.md";
const problems = [];
const pass = (m) => console.log("  ok   " + m);
const fail = (m) => { problems.push(m); console.log("  FAIL " + m); };

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const norm = (s) => s.replace(/\s+/g, " ").trim();

/** Legal claim states — mirrors EvidenceState in lib/company.ts. */
const LEGAL_STATES = ["VERIFIED", "DEMONSTRATION", "PROTOTYPE", "TARGET", "PLANNED", "UNKNOWN", "DECLARED"];
const VOCABULARY_BANLIST = [
  "sovereign",
  "covenant",
  "zion",
  "kemet",
  "atlantis",
  "rostau",
  "rosterau",
  "babylon",
  "genius fool",
];

if (!fs.existsSync(COMPANY_TS)) { console.error("missing " + COMPANY_TS); process.exit(1); }
if (!fs.existsSync(PACK)) { console.error("missing " + PACK); process.exit(1); }

const src = fs.readFileSync(COMPANY_TS, "utf8");
const pack = fs.readFileSync(PACK, "utf8");
// Blockquote markers are markdown syntax, not content — strip them before
// comparing a quoted statement against the runtime constant.
const packNorm = norm(pack.replace(/^>\s?/gm, " "));

console.log("\n== 1. Evidence pack structure ==");

const REQUIRED_SECTIONS = [
  "Company", "Founder / Team", "Problem", "APT-LABS Architecture", "APT Deploy",
  "APT Fab", "APT Studio", "The Roll", "BenBen / The Floor",
  "Current Prototype State", "Pilot Partner(s)", "Unit Economics",
  "Local Procurement", "Impact Metrics", "Technical Evidence",
  "Photos / Media Evidence", "BOMs", "Asset Register", "Replication Model",
  "Known Unknowns", "Claims That Are Not Yet Verified",
];
REQUIRED_SECTIONS.forEach((s, i) => {
  const heading = `## ${i + 1}. ${s}`;
  if (pack.includes(heading)) pass(heading);
  else fail(`evidence pack missing section: ${heading}`);
});

console.log("\n== 2. Runtime truth agrees with the evidence record ==");

// COMPANY.description must appear verbatim (whitespace-normalised) in §1.
const companyBlock = (src.match(/export const COMPANY = \{[\s\S]*?\} as const;/) || [""])[0];
const description = (companyBlock.match(/description:\s*"([^"]+)"/) || [])[1];
if (!description) fail("COMPANY.description not found in lib/company.ts");
else if (!packNorm.includes(norm(description))) fail("COMPANY.description is not present in the evidence pack");
else pass("COMPANY.description matches the evidence pack");

const grab = (re, label) => {
  const m = src.match(re);
  if (!m) { fail(`${label} not found in lib/company.ts`); return ""; }
  return m[1];
};

const problem = grab(/export const PROBLEM =\s*\n?\s*"([^"]+)";/, "PROBLEM");
const response = grab(/export const RESPONSE =\s*\n?\s*"([^"]+)";/, "RESPONSE");
if (problem && packNorm.includes(norm(problem))) pass("PROBLEM appears in the evidence pack");
else if (problem) fail("PROBLEM is not present in the evidence pack");
if (response && packNorm.includes(norm(response))) pass("RESPONSE appears in the evidence pack");
else if (response) fail("RESPONSE is not present in the evidence pack");

// Status ledger: every row in company.ts must exist in pack §4's table.
const ledgerBlock = grab(/export const STATUS_LEDGER = \[([\s\S]*?)\];/, "STATUS_LEDGER");
const rows = [...ledgerBlock.matchAll(/face: "([^"]+)", status: "([^"]+)", route: "([^"]+)"/g)];
if (rows.length !== 4) fail(`STATUS_LEDGER has ${rows.length} rows, expected 4`);
rows.forEach(([, face, status, route]) => {
  const cell = `| ${face} | ${status} | ${route} |`;
  if (pack.includes(cell)) pass(`status ledger: ${face} · ${status} · ${route}`);
  else fail(`status ledger row missing from evidence pack §4: ${cell}`);
});

// Faces: name + status must be documented in the pack.
const faceBlock = grab(/export const FACES: Record<Face\["key"\], Face> = \{([\s\S]*?)\n\};/, "FACES");
const faces = [...faceBlock.matchAll(/key: "(\w+)",\s*\n\s*name: "([^"]+)",[\s\S]*?status: "([A-Z]+)",\s*\n\s*route: "([^"]+)"/g)];
if (faces.length !== 4) fail(`FACES has ${faces.length} entries, expected 4`);
faces.forEach(([, key, name, status, route]) => {
  if (pack.includes(name)) pass(`face documented: ${name}`);
  else fail(`face not documented in evidence pack: ${name}`);
  if (["VERIFIED", "DEMONSTRATION", "PROTOTYPE", "TARGET", "PLANNED", "UNKNOWN"].includes(status)) {
    pass(`face state legal: ${key} = ${status}`);
  } else fail(`face ${key} has illegal state: ${status}`);
});

console.log("\n== 3. The public surface is intentionally small ==");
// The four faces live on the Floor and inside the console; they are the
// internal architecture, not public marketing routes. The public site is
// deliberately cloaked to four quiet indexed routes plus one local-only
// intake layer (/benben): linked in chrome, with metadata, disallowed in
// robots, absent from the sitemap. Each must export metadata.
const PUBLIC_ROUTES = [
  { rel: "page.tsx", name: "Home" },
  { rel: "about/page.tsx", name: "About" },
  { rel: "evidence/page.tsx", name: "Evidence" },
  { rel: "contact/page.tsx", name: "Contact" },
];
PUBLIC_ROUTES.forEach(({ rel, name }) => {
  const page = path.join("app", "(site)", rel);
  if (fs.existsSync(page)) pass(`${name} route exists: ${rel}`);
  else fail(`${name} route has no page: ${page}`);
  if (fs.existsSync(page) && /export const metadata/.test(fs.readFileSync(page, "utf8"))) {
    pass(`${name} route exports metadata`);
  } else fail(`${name} route exports no metadata`);
});

// Local-only intake: metadata yes, robots disallow yes, sitemap no.
const benbenPage = path.join("app", "(site)", "benben", "page.tsx");
if (fs.existsSync(benbenPage)) pass("Floor route exists: benben/page.tsx");
else fail("Floor route has no page: app/(site)/benben/page.tsx");
if (fs.existsSync(benbenPage) && /export const metadata|faceMetadata/.test(fs.readFileSync(benbenPage, "utf8")) || fs.existsSync(path.join("app", "(site)", "benben", "layout.tsx"))) {
  pass("Floor route exports metadata");
} else fail("Floor route exports no metadata");
const robotsSrc = fs.existsSync("app/robots.ts") ? fs.readFileSync("app/robots.ts", "utf8") : "";
if (robotsSrc.includes('"/benben"') && robotsSrc.includes("disallow")) pass("Floor is disallowed in robots (local-only)");
else fail('Floor must be disallowed in robots.ts (local-only intake)');
const sitemapSrc = fs.existsSync("app/sitemap.ts") ? fs.readFileSync("app/sitemap.ts", "utf8") : "";
if (!sitemapSrc.includes("`${base}/benben`") && !sitemapSrc.includes('"/benben"') && !sitemapSrc.includes("'/benben'")) pass("Floor stays out of the sitemap (local-only)");
else fail("Floor must stay out of sitemap.ts (local-only intake)");
const benbenSrc = fs.existsSync(benbenPage) ? fs.readFileSync(benbenPage, "utf8") : "";
if (benbenSrc.includes("NO SEEDED BUILDS") && benbenSrc.includes("stays in this browser")) pass("Floor starts empty and visibly bounded");
else fail("Floor must state that seeded builds are absent and entries stay local");

console.log("\n== 4. Published metrics carry state and provenance ==");
const metricsBlock = grab(/export const METRICS: Metric\[\] = \[([\s\S]*?)\];/, "METRICS");
const metrics = [...metricsBlock.matchAll(/\{([\s\S]*?)\n  \}/g)].map((m) => m[1]);
const LEGAL = ["VERIFIED", "DEMONSTRATION", "TARGET", "PLANNED", "UNKNOWN", "DECLARED"];
metrics.forEach((m) => {
  const id = (m.match(/id: "([^"]+)"/) || [])[1] || "?";
  const state = (m.match(/state: "([A-Z]+)"/) || [])[1];
  const provenance = (m.match(/provenance:\s*\n?\s*"([^"]+)"/) || [])[1];
  if (LEGAL.includes(state)) pass(`metric ${id} state = ${state}`);
  else fail(`metric ${id} has illegal or missing state: ${state}`);
  if (provenance && provenance.length > 20) pass(`metric ${id} has provenance`);
  else fail(`metric ${id} has no provenance`);
});

console.log("\n== 5. Banned internal vocabulary is absent from public routes ==");
const banned = VOCABULARY_BANLIST;
// The banlist necessarily contains each forbidden word, and the company module
// necessarily declares it. The meaningful boundary is the rendered public
// source tree checked below: no doctrine term may appear in a route, component
// or stylesheet imported into one.

const publicFiles = [...walk("app"), ...walk("components")]
  .filter((f) => /\.(tsx|ts|css)$/.test(f));
let clean = true;
for (const f of publicFiles) {
  const body = fs.readFileSync(f, "utf8").toLowerCase();
  for (const term of banned) {
    if (body.includes(term.toLowerCase())) {
      clean = false;
      fail(`banned term "${term}" in public file ${f}`);
    }
  }
}
if (clean) pass(`no banned term from ${banned.length}-word banlist in app/ or components/`);

console.log("\n== 6. Internal doctrine stays internal ==");
if (fs.existsSync(path.join("lib", "source.ts"))) {
  fail("lib/source.ts exists — internal doctrine must live under docs/internal/");
} else pass("no doctrine file in lib/");
if (fs.existsSync(path.join("docs", "internal", "source.md"))) {
  pass("doctrine archived at docs/internal/source.md");
} else fail("docs/internal/source.md missing — doctrine should be archived, not lost");

console.log("\n== 7. Unsupported claim phrases ==");
const FORBIDDEN = [
  [/funded by/i, "funded by"],
  [/partnered with/i, "partnered with"],
  [/100% local/i, "100% local"],
  [/saved KES/i, "saved KES"],
];
let claimsClean = true;
for (const f of publicFiles.filter((x) => x.endsWith(".tsx"))) {
  const body = fs.readFileSync(f, "utf8");
  for (const [re, label] of FORBIDDEN) {
    if (re.test(body)) { claimsClean = false; fail(`unsupported claim "${label}" in ${f}`); }
  }
}
if (claimsClean) pass("no prohibited claim phrases in public components");

console.log("\n== audit-company ==");
if (problems.length === 0) {
  console.log("PASS — runtime truth and evidence record agree.\n");
} else {
  console.log(`FAIL — ${problems.length} problem(s):`);
  problems.forEach((p) => console.log("  - " + p));
  console.log("");
  process.exit(1);
}
