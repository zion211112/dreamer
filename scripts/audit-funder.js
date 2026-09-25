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

const required = [
  "lib/company.ts",
  "docs/EVIDENCE-PACK.md",
  "scripts/audit-company.js",
  "scripts/audit-classes.js",
  "app/(site)/deploy/page.tsx",
  "app/(site)/fab/page.tsx",
  "app/(site)/studio/page.tsx",
  "app/(site)/roll/page.tsx",
  "app/(site)/roll/assets/page.tsx",
  "app/(site)/benben/page.tsx",
];
required.forEach((file) => file && (fs.existsSync(file) ? pass(`exists: ${file}`) : fail(`missing: ${file}`)));

const faces = [
  ["APT Deploy", "/deploy", "app/(site)/deploy/page.tsx"],
  ["APT Fab", "/fab", "app/(site)/fab/page.tsx"],
  ["APT Studio", "/studio", "app/(site)/studio/page.tsx"],
  ["The Roll", "/roll", "app/(site)/roll/page.tsx"],
];
const robots = read("app/robots.ts");
const sitemap = read("app/sitemap.ts");
for (const [name, route, file] of faces) {
  if (fs.existsSync(file)) {
    const body = read(file);
    /export const metadata/.test(body) ? pass(`${name} metadata exists`) : fail(`${name} metadata missing`);
    robots.includes(`"${route}"`) ? pass(`${name} allowed by robots`) : fail(`${name} missing from robots`);
    sitemap.includes(`\`\${base}${route}\``) ? pass(`${name} present in sitemap`) : fail(`${name} missing from sitemap`);
  }
}

const company = read("lib/company.ts");
if (company.includes("isFace: false")) pass("BenBen / The Floor is an intake layer, not a face");
else fail("INTAKE.isFace must be false");

const home = read("app/(site)/page.tsx");
if (home.includes("INTAKE.name") && home.includes("Intake layer")) pass("homepage presents Floor as intake");
else fail("homepage must present Floor as an intake layer");
if (home.includes("Three working surfaces") || home.includes("The ledger of useful work")) fail("homepage still contains retired framing");
else pass("homepage uses the four-face framing");

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

const ledger = read("app/(site)/ledger/page.tsx");
if (ledger.includes("DEMONSTRATION DATA") && ledger.includes("Unknown — no verified pilot")) pass("ledger demo values are visibly bounded");
else fail("ledger demo values must carry a demonstration/unknown notice");
const benben = read("app/(site)/benben/page.tsx");
if (benben.includes("DEMONSTRATION DATA — NOT A VERIFIED PROJECT RESULT")) pass("Floor seeded data is visibly bounded");
else fail("Floor seeded data must carry the demonstration notice");

const dead = ["BoardCard", "BuildCard", "DoorsModal", "ZionChamber"];
for (const name of dead) {
  const references = publicFiles.filter((file) => read(file).includes(name));
  references.length ? fail(`dead component reference remains: ${name}`) : pass(`no public reference to ${name}`);
}
if (!fs.existsSync("app/(site)/roll/assets/page.tsx")) fail("asset register route missing");
else pass("asset register route exists");

const deploy = read("app/(site)/deploy/page.tsx");
if (deploy.includes("What exists today") && deploy.includes("Offline resilience") && deploy.includes("Evidence status")) pass("Deploy has public content before the console gate");
else fail("Deploy needs a public overview before the console gate");

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
