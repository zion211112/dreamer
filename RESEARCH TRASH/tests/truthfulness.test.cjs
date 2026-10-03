const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const read = (rel) => fs.readFileSync(path.join(__dirname, "..", rel), "utf8");

test("public truth surfaces do not ship seeded people or fake console credentials", () => {
  const ledger = read("lib/ledger.ts");
  const consolePage = read("app/(console)/console/page.tsx");
  assert.match(ledger, /SEED_MEMBERS: Member\[\] = \[\]/);
  assert.doesNotMatch(ledger, /SCHOOL_STATS|TREASURY|HALL_FEE|TEACHER_FEE|SCHOOL_FEE|SUBSCRIBED_SCHOOLS/);
  assert.doesNotMatch(consolePage, /RUNPILOT|PILOTRUN|gateOpen|GATE_NAME|GATE_SCHOOL/);
});

test("the runtime identity module does not bundle internal doctrine vocabulary", () => {
  const company = read("lib/company.ts");
  for (const term of ["sovereign", "covenant", "zion", "kemet", "atlantis", "rostau", "rosterau", "babylon", "genius fool"]) {
    assert.equal(company.toLowerCase().includes(term), false, term);
  }
});

test("public metadata uses a local base URL unless deployment config is supplied", () => {
  const site = read("lib/site.ts");
  assert.match(site, /NEXT_PUBLIC_BASE_URL/);
  assert.match(site, /localhost:3000/);
});
