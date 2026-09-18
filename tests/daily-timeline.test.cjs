// The day is a timeline, not a dashboard: time is the spine, every class row
// carries the same three actions, and a single flag says the state. These
// tests pin the honest, pure helpers that make the timeline work, plus the
// shape of the MyDay view itself (no separate alerts panel, no invented day).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

// Load lib/events.ts as CommonJS, stubbing the IndexedDB + school modules so
// the pure helpers (which never touch a store) run under node.
const compiled = ts.transpileModule(read('lib/events.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 }
});
const fakeRequire = (name) => {
  if (name === './db' || name.endsWith('db.ts')) return { idbAll: async () => [], idbPut: async () => {}, idbBulkPut: async () => {} };
  if (name === './school' || name.endsWith('school.ts')) return {};
  return require(name);
};
const mod = { exports: {} };
new Function('exports', 'require', 'module', compiled.outputText)(mod.exports, fakeRequire, mod);
const ev = mod.exports;

const base = new Date(2026, 8, 17, 9, 0, 0).getTime(); // 09:00 local

test('isTimePast marks a slot at-or-before now, not after', () => {
  assert.equal(ev.isTimePast('08:00', base), true);
  assert.equal(ev.isTimePast('09:00', base), true);
  assert.equal(ev.isTimePast('14:00', base), false);
  assert.equal(ev.isTimePast('', base), false); // untimed slots are never "past"
});

test('timeToMs orders slots and sorts untimed items last', () => {
  assert.ok(ev.timeToMs('08:00', base) < ev.timeToMs('09:20', base));
  assert.ok(ev.timeToMs('14:00', base) < ev.timeToMs('16:00', base));
  assert.ok(ev.timeToMs('', base) > ev.timeToMs('16:00', base)); // untimed after all timed
});

test('eventsSinceToday keeps only records at-or-after local midnight', () => {
  const old = { id: 'a', ts: '2000-01-01T00:00:00.000Z', type: 'note', studentId: '', studentName: '', className: '', teacher: '', text: '' };
  const now = { id: 'b', ts: new Date().toISOString(), type: 'attendance', studentId: 'x', studentName: '', className: '', teacher: '', text: '' };
  assert.deepEqual(ev.eventsSinceToday([old, now]), [now]);
});

test('makeClassNote writes one class-level line, not tied to a learner', () => {
  const e = ev.makeClassNote('Form 1', 'Mwangi', 'Quiet, good work');
  assert.equal(e.type, 'note');
  assert.equal(e.studentId, '');
  assert.equal(e.className, 'Form 1');
  assert.equal(e.teacher, 'Mwangi');
  assert.equal(e.text, 'Quiet, good work');
  assert.ok(e.id && e.ts);
});

test('My Day renders a uniform timeline: same three actions, a NOW marker, an honest footer', () => {
  const day = read('components/console/MyDay.tsx');
  // The three actions, always in the same order, on every class row.
  assert.match(day, /actionBtn\(lesson, "att", attSt, "Attendance"\)/);
  assert.match(day, /actionBtn\(lesson, "grades", grSt, "Grades"\)/);
  assert.match(day, /actionBtn\(lesson, "notes", notesSt, "Notes"\)/);
  // Time is the spine; the NOW hairline moves with the day.
  assert.match(day, /hasTimes && i === nowIndex/);
  assert.match(day, /Now · /);
  // State lives in the row as one flag.
  assert.match(day, /"✓"/);
  assert.match(day, /"!/);
  // The footer tells the truth: online/offline + today's record count + one add-link.
  assert.match(day, /\+ Add to today/);
  assert.match(day, /todayEvents\.length/);
  // The day is declared, never invented.
  assert.match(day, /loadDayPlan/);
  assert.match(day, /saveDayPlan/);
  // No separate alerts panel, no wall of quick actions, no pinned-class cards.
  assert.doesNotMatch(day, /unmarkedInClass/);
  assert.doesNotMatch(day, /Quick actions/);
  assert.doesNotMatch(day, /Today's classes/);
});

test('state is computed from the ledger, matched by learner id (class+stream safe)', () => {
  const day = read('components/console/MyDay.tsx');
  assert.match(day, /const idsFor = \(cls: string\) => new Set\(roster\(cls\)\.map\(\(s\) => s\.id\)\)/);
  assert.match(day, /e\.type === "attendance" && ids\.has\(e\.studentId\)/);
});
