const fs = require("fs");
const path = require("path");

const problems = [];
const pass = (message) => console.log(`  ok   ${message}`);
const fail = (message) => {
  problems.push(message);
  console.log(`  FAIL ${message}`);
};

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, acc);
    else acc.push(file);
  }
  return acc;
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

// The Protocol Node is the product, at the root. Support routes — execution
// (Work), record (Roll), doctrine (About), evidence (Evidence), engagement
// (Contact) — hang off it. The Floor and the console are local-first tracks.
const required = [
  "lib/company.ts",
  "docs/EVIDENCE-PACK.md",
  "docs/protocol-node.md",
  "scripts/audit-company.js",
  "scripts/audit-classes.js",
  "app/(site)/page.tsx",
  "app/(site)/protocol/layout.tsx",
  "app/(site)/work/page.tsx",
  "app/(site)/roll/page.tsx",
  "app/(site)/about/page.tsx",
  "app/(site)/evidence/page.tsx",
  "app/(site)/contact/page.tsx",
  "app/(site)/benben/layout.tsx",
  "app/(site)/benben/page.tsx",
];
required.forEach((file) => file && (fs.existsSync(file) ? pass(`exists: ${file}`) : fail(`missing: ${file}`)));

// No retired company-model routes may return.
for (const dead of ["app/(site)/deploy", "app/(site)/fab", "app/(site)/studio", "app/(site)/ledger", "app/(site)/dashboard", "app/(site)/search"]) {
  fs.existsSync(dead) ? fail(`retired route still present: ${dead}`) : pass(`retired route absent: ${dead}`);
}

// One product: the Protocol Node, at the root. Support routes carry the
// execution surfaces, the record, doctrine, evidence and engagement.
const robots = read("app/robots.ts");
const sitemap = read("app/sitemap.ts");
for (const [name, route] of [["Protocol Node", "/"], ["APT Fab", "/work"], ["APT Studio", "/work"], ["The Roll", "/roll"]]) {
  robots.includes(`"${route}"`) ? pass(`${name} allowed by robots (${route})`) : fail(`${name} missing from robots (${route})`);
  sitemap.includes(route === "/" ? "url: base" : `\`\${base}${route}\``) ? pass(`${name} present in sitemap (${route})`) : fail(`${name} missing from sitemap (${route})`);
}
for (const [name, file] of [["Work", "app/(site)/work/page.tsx"], ["The Roll", "app/(site)/roll/page.tsx"], ["BenBen / The Floor", "app/(site)/benben/layout.tsx"], ["Contact", "app/(site)/contact/page.tsx"]]) {
  fs.existsSync(file) && /export const metadata/.test(read(file)) ? pass(`${name} metadata exists`) : fail(`${name} metadata missing`);
}
// The node is a local-first surface: indexed for its root, but its
// demonstration state is labelled — it is never a deployment claim.
const nodeLayout = read("app/(site)/protocol/layout.tsx");
if (nodeLayout.includes("redirect")) pass("legacy /protocol deep link redirects to the root");
else fail("/protocol must redirect to the root (the node now lives at /)");
// Tracks stay out of the index.
for (const track of ["/benben", "/console"]) {
  robots.includes(track) && /disallow/.test(robots) ? pass(`track disallowed in robots: ${track}`) : fail(`track must be disallowed in robots: ${track}`);
}
sitemap.includes("benben") && /`\${base}\/benben`/.test(sitemap) ? fail("Floor must stay out of sitemap") : pass("Floor stays out of the sitemap");

// The node's first product ships on the BenBen Builds track.
const company = read("lib/company.ts");
if (company.includes("BENBEN_BUILDS") && company.includes("isFace: false")) pass("BenBen Builds is the node's product track, not a face");
else fail("BENBEN_BUILDS track with isFace: false must exist");
if (/key: "deploy"|APT Deploy/.test(company)) fail("retired Deploy model remains in lib/company.ts");
else pass("no Deploy face in lib/company.ts");

// The header navigates the node's support routes, never the console.
const nav = read("components/Nav.tsx");
if (!nav.includes('"/console"') && !nav.includes("'/console'")) pass("header links no product console");
else fail("header must not link /console (products live on /work)");
for (const item of ['"/work"', '"/roll"', '"/about"', '"/contact"']) {
  nav.includes(item) ? pass(`header links ${item}`) : fail(`header missing ${item}`);
}

// One product, one surface: the node is the only thing the root presents.
const home = read("app/(site)/page.tsx");
if (home.includes("protocol-node") && home.includes("ProtocolNode")) pass("root mounts the protocol node surface (the product)");
else fail("root must mount the protocol node — the single product");
if (/APT Deploy/.test(home)) fail("root references the retired Deploy face");
else pass("root names no Deploy face");

// The node component exists and carries an explicit evidence posture.
const node = read("components/protocol-node.tsx");
if (fs.existsSync("components/protocol-node.tsx") && /illustrative|prototype|proposed/i.test(node)) pass("protocol node labels its records (illustrative / proposed / prototype)");
else fail("protocol node must label its records — nothing is a deployment claim");
if (home.includes("BENBEN_BUILDS") || read("lib/company.ts").includes("BENBEN_BUILDS")) pass("BenBen Builds product track remains a first-class record in lib/company.ts");
else fail("BenBen Builds track must remain documented in lib/company.ts");

const publicFiles = [...walk("app"), ...walk("components")].filter((file) => /\.(ts|tsx|css)$/.test(file));
const banned = ["sovereign", "covenant", "zion", "kemet", "atlantis", "rostau", "rosterau", "babylon", "genius fool"];
for (const file of publicFiles) {
  const body = read(file).toLowerCase();
  for (const term of banned) {
    if (body.includes(term)) fail(`banned public term "${term}" in ${file}`);
  }
}
if (!problems.some((problem) => problem.startsWith("banned public term"))) pass("public routes contain no banned doctrine terms");

const prohibited = [
  [/funded by/i, "funded by"],
  [/partnered with/i, "partnered with"],
  [/100% local/i, "100% local"],
  [/saved KES/i, "saved KES"],
  [/serves [0-9]/i, "unsupported beneficiary count"],
];
for (const file of publicFiles.filter((item) => item.endsWith(".tsx"))) {
  const body = read(file);
  for (const [pattern, label] of prohibited) if (pattern.test(body)) fail(`unsupported claim "${label}" in ${file}`);
}
if (!problems.some((problem) => problem.startsWith("unsupported claim"))) pass("public routes contain no prohibited claim phrases");

const roll = read("app/(site)/roll/page.tsx");
if (roll.includes("REGISTERS") && roll.includes("People Register") && /shared server-backed register is published|no shared server-backed/i.test(roll)) pass("Roll presents both registers with honest bounds");
else fail("Roll must present People and Asset registers with explicit bounds");
const floor = read("app/(site)/benben/page.tsx");
if (floor.includes("NO SEEDED BUILDS") && floor.includes("stays in this browser")) pass("Floor starts empty and visibly bounded");
else fail("Floor must state that seeded builds are absent and entries stay local");

const dead = ["BoardCard", "BuildCard", "DoorsModal", "ZionChamber"];
for (const name of dead) {
  const references = publicFiles.filter((file) => read(file).includes(name));
  references.length ? fail(`dead component reference remains: ${name}`) : pass(`no public reference to ${name}`);
}

const work = read("app/(site)/work/page.tsx");
if (work.includes("FACES.fab") && work.includes("FACES.studio") && work.includes("BENBEN_BUILDS") && work.includes("product.route") && work.includes("product.floorRoute")) pass("Work presents the execution surfaces plus the product track with its intake");
else fail("Work must present Fab, Studio, BenBen Builds, the School Console, and links to /console and /benben");

const ledgerSource = read("lib/ledger.ts");
if (ledgerSource.includes("SEED_MEMBERS: Member[] = []")) pass("People Register has no seeded records");
else fail("SEED_MEMBERS must remain empty until records are evidenced");
if (!/SCHOOL_STATS|TREASURY|HALL_FEE|TEACHER_FEE|SCHOOL_FEE|SUBSCRIBED_SCHOOLS/.test(ledgerSource)) pass("legacy public demo constants removed");
else fail("legacy public demo constants remain in lib/ledger.ts");
const consoleSource = read("app/(console)/console/page.tsx") + read("lib/console.ts") + read("components/console/ConsoleSession.tsx");
if (!/RUNPILOT|PILOTRUN|GATE_NAME|GATE_SCHOOL|gateOpen/.test(consoleSource)) pass("no fake console credential gate remains");
else fail("fake console credential gate remains");

const grantFiles = [
  "mastercard-ihub.md", "usaid-div.md", "dprize.md", "gca.md", "heva.md", "giz.md", "kenia.md", "safaricom.md", "roddenberry.md", "mozilla.md",
];
for (const file of grantFiles) {
  const body = read(path.join("docs/grants", file));
  ["Eligibility/status", "Leading APT-LABS face", "Evidence required", "Missing evidence", "Claims prohibited", "Application thesis"].every((field) => body.includes(field))
    ? pass(`grant lens complete: ${file}`)
    : fail(`grant lens incomplete: ${file}`);
}

console.log("\n== audit-funder ==");
if (problems.length) {
  console.log(`FAIL — ${problems.length} problem(s).`);
  process.exit(1);
}
console.log("PASS — public architecture, evidence boundaries, and grant lenses are coherent.\n");
