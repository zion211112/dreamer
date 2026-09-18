// The My Day planner: import a pasted timetable, plan a mini calendar that
// flags collisions, and build a class label the classic way (ECDE → Form 6,
// with streams). These pin the pure helpers and the view's new contract.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

function load(rel, stubs) {
  const compiled = ts.transpileModule(read(rel), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 }
  });
  const fakeRequire = (name) => {
    for (const k of Object.keys(stubs)) if (name === k || name.endsWith(k)) return stubs[k];
    return require(name);
  };
  const mod = { exports: {} };
  new Function('exports', 'require', 'module', compiled.outputText)(mod.exports, fakeRequire, mod);
  return mod.exports;
}

const dbStub = { idbAll: async () => [], idbPut: async () => {}, idbBulkPut: async () => {}, idbClear: async () => {} };
const ev = load('lib/events.ts', { './db': dbStub, './school': {} });
const sch = load('lib/school.ts', { './db': dbStub });

test('parseTimetable reads a plain "time subject class" week', () => {
  const out = ev.parseTimetable('08:00 Maths Form 4\n10:00 English Grade 8 · Z\n13:00 Science Form 4');
  assert.equal(out.length, 3);
  assert.deepEqual({ t: out[0].time, s: out[0].subject, c: out[0].className }, { t: '08:00', s: 'Maths', c: 'Form 4' });
  assert.equal(out[1].subject, 'English');
  assert.equal(out[1].className, 'Grade 8 · Z');
  assert.equal(out[2].subject, 'Science');
});

test('parseTimetable tolerates time ranges, periods, and commas', () => {
  const a = ev.parseTimetable('08:00-08:40 Reading Form 2');
  assert.deepEqual({ t: a[0].time, s: a[0].subject, c: a[0].className }, { t: '08:00', s: 'Reading', c: 'Form 2' });
  const b = ev.parseTimetable('Period 1 — 09:00, Science, JSS 1');
  assert.equal(b[0].subject, 'Science');
  assert.equal(b[0].className, 'JSS 1');
});

test('parseTimetable keeps untimed items and never invents a time', () => {
  const out = ev.parseTimetable('Assembly\n08:00');
  assert.equal(out.length, 1);
  assert.equal(out[0].subject, 'Assembly');
  assert.equal(out[0].time, ''); // a bare "08:00" line has nothing to name
});

test('collisionsOn flags overlapping windows, not distant ones', () => {
  const mk = (id, time) => ({ id, date: '2026-09-17', time, title: 'x', kind: 'class' });
  const items = [mk('a', '08:00'), mk('b', '08:10'), mk('c', '10:00')];
  const coll = ev.collisionsOn(items, '2026-09-17');
  assert.ok(coll.has('a') && coll.has('b')); // 08:00–08:40 overlaps 08:10–08:50
  assert.ok(!coll.has('c'));
  assert.equal(ev.collisionsOn(items, '2026-09-18').size, 0); // other day
});

test('class taxonomy: ECDE → Form 6, streams, and base-class resolution', () => {
  assert.equal(sch.composeClassLabel('Grade 5', 'X'), 'Grade 5 · X');
  assert.equal(sch.composeClassLabel('Form 4'), 'Form 4');
  assert.equal(sch.baseClassName('Grade 5 · X'), 'Grade 5'); // roll keys on the base class
  assert.equal(sch.baseClassName('Form 4'), 'Form 4');
  assert.ok(sch.CLASS_CATEGORIES.some((c) => c.id === 'class' && c.classes.includes('Form 6')));
  assert.ok(sch.CLASS_CATEGORIES.some((c) => c.id === 'ecde'));
  assert.ok(sch.CLASS_STREAMS.includes('X'));
});

test('My Day gains import + mini calendar + classic class, drops the chatty lines', () => {
  const day = read('components/console/MyDay.tsx');
  assert.match(day, /Import timetable/); // the quick import
  assert.match(day, /Add your first lesson below/); // honest empty state
  assert.match(day, /Up next/); // the incoming-class cue
  assert.match(day, /ClassPicker/); // classic cascading class entry
  assert.match(day, /MiniCalendar/); // the elite mini calendar
  assert.match(day, /importTimetable/);
  assert.doesNotMatch(day, /Nothing invented — the day is yours/);
  assert.doesNotMatch(day, /No classes on your day/);
  assert.doesNotMatch(day, /Nothing on today yet/);
  assert.doesNotMatch(day, /placeholder="Teacher"/); // teacher field removed
  assert.match(day, /\+ Add to today/);
});

test('MiniCalendar flags collisions and offers personal vs class items', () => {
  const cal = read('components/console/MiniCalendar.tsx');
  assert.match(cal, /collisionsOn/);
  assert.match(cal, /⚠/);
  assert.match(cal, /personal/);
  assert.match(cal, /ClassPicker/);
});