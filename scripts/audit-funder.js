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

// The company site: five indexed pages plus two local-first tracks.
// Products live on BenBen Builds; the header never sells a prototype.
const required = [
  "lib/company.ts",
  "docs/EVIDENCE-PACK.md",
  "scripts/audit-company.js",
  "scripts/audit-classes.js",
  "app/(site)/page.tsx",
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

// Three pillars, presented on Work (Fab, Studio) and Roll.
const robots = read("app/robots.ts");
const sitemap = read("app/sitemap.ts");
for (const [name, route] of [["APT Fab", "/work"], ["APT Studio", "/work"], ["The Roll", "/roll"]]) {
  robots.includes(`"${route}"`) ? pass(`${name} allowed by robots (${route})`) : fail(`${name} missing from robots (${route})`);
  sitemap.includes(`\`\${base}${route}\``) ? pass(`${name} present in sitemap (${route})`) : fail(`${name} missing from sitemap (${route})`);
}
for (const [name, file] of [["Work", "app/(site)/work/page.tsx"], ["The Roll", "app/(site)/roll/page.tsx"], ["BenBen / The Floor", "app/(site)/benben/layout.tsx"], ["Contact", "app/(site)/contact/page.tsx"]]) {
  fs.existsSync(file) && /export const metadata/.test(read(file)) ? pass(`${name} metadata exists`) : fail(`${name} metadata missing`);
}
// Tracks stay out of the index.
for (const track of ["/benben", "/console"]) {
  robots.includes(track) && /disallow/.test(robots) ? pass(`track disallowed in robots: ${track}`) : fail(`track must be disallowed in robots: ${track}`);
}
sitemap.includes("benben") && /`\${base}\/benben`/.test(sitemap) ? fail("Floor must stay out of sitemap") : pass("Floor stays out of the sitemap");

const company = read("lib/company.ts");
if (company.includes("BENBEN_BUILDS") && company.includes("isFace: false")) pass("BenBen Builds is a track, not a face");
else fail("BENBEN_BUILDS track with isFace: false must exist");
if (/key: "deploy"|APT Deploy/.test(company)) fail("retired Deploy model remains in lib/company.ts");
else pass("no Deploy face in lib/company.ts");

// The header sells the company, never a prototype.
const nav = read("components/Nav.tsx");
if (!nav.includes('"/console"') && !nav.includes("'/console'")) pass("header links no product console");
else fail("header must not link /console (products live on /work)");
for (const item of ['"/work"', '"/roll"', '"/about"', '"/contact"']) {
  nav.includes(item) ? pass(`header links ${item}`) : fail(`header missing ${item}`);
}

const home = read("app/(site)/page.tsx");
if (home.includes("BenBen Builds") && home.includes("BENBEN_BUILDS")) pass("homepage presents the build track separately");
else fail("homepage must present BenBen Builds with the School Console as a track, not a pillar");
if (home.includes("Systems your institutions can own") || /four faces|FOUR FACES/i.test(home)) fail("homepage still contains retired framing");
else pass("homepage uses the pillar framing");
if (/APT Deploy/.test(home)) fail("homepage references the retired Deploy face");
else pass("homepage names no Deploy face");

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
if (work.includes("FACES.fab") && work.includes("FACES.studio") && work.includes("BENBEN_BUILDS") && work.includes("product.route") && work.includes("product.floorRoute")) pass("Work presents pillars plus the track with its product and intake");
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
