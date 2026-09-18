const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
// Compile the pure domain module in memory using the project's existing compiler.
const source = fs.readFileSync(path.join(__dirname, '../lib/learning-demo.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } });
const mod = { exports: {} };
new Function('exports', 'require', 'module', compiled.outputText)(mod.exports, require, mod);
const { SAMPLE_BRIEF, SAMPLE_NOTES, briefError, parseNotes, buildQuestions, buildDocument, testDocument, scoreQuestions } = mod.exports;

test('worked example validates and has five distinct concepts', () => {
  assert.equal(briefError(SAMPLE_BRIEF), '');
  assert.equal(parseNotes(SAMPLE_NOTES).length, 5);
});
test('invalid, incomplete and ambiguous notes cannot generate a draft', () => {
  for (const patch of [{ title: '' }, { learner: '' }, { minutes: NaN }, { minutes: 9 }, { weeks: 17 }, { weeks: 6.5 }, { notes: 'A: a\nB: b' }, { notes: 'A: a\nA: b\nC: c' }, { notes: 'A: same\nB: same\nC: other' }, { notes: 'A: a\nB: b\nC: c\nmalformed' }]) {
    const brief = { ...SAMPLE_BRIEF, ...patch };
    assert.ok(briefError(brief));
    assert.throws(() => buildDocument(brief, 'lesson'));
  }
});
test('lesson stages add up to the selected duration at every supported length', () => {
  for (let minutes = 10; minutes <= 90; minutes++) {
    const draft = buildDocument({ ...SAMPLE_BRIEF, minutes }, 'lesson');
    const durations = [...draft.matchAll(/\/ (\d+) MIN/g)].map(m => Number(m[1]));
    assert.equal(durations.length, 4);
    assert.equal(durations.reduce((a, b) => a + b, 0), minutes);
  }
});
test('semester length is respected and marked as an outline, not a syllabus', () => {
  for (const weeks of [6, 12, 16]) {
    const draft = buildDocument({ ...SAMPLE_BRIEF, weeks }, 'semester');
    assert.equal((draft.match(/^Week \d+/gm) || []).length, weeks);
    assert.ok(draft.includes('not a complete syllabus'));
  }
});
test('sample tests have unambiguous answers and honour the short-test choice', () => {
  assert.equal(buildQuestions(SAMPLE_NOTES, 3).length, 3);
  assert.equal(buildQuestions(SAMPLE_NOTES, 8).length, 5);
  for (const q of buildQuestions(SAMPLE_NOTES, 5)) {
    assert.equal(new Set(q.options).size, 3);
    assert.ok(q.correct >= 0 && q.correct < q.options.length);
    assert.ok(q.explanation.length > 20);
  }
});
test('custom source changes both questions and their answer guide', () => {
  const notes = 'Evaporation: Liquid water changes into water vapour.\nCondensation: Water vapour changes into liquid water.\nPrecipitation: Water falls from clouds.';
  const questions = buildQuestions(notes, 5);
  assert.equal(questions.length, 3);
  questions.forEach((q, i) => assert.equal(q.options[q.correct], parseNotes(notes)[i].explanation));
  assert.ok(!testDocument({ ...SAMPLE_BRIEF, notes }, questions, true).includes('chapati'));
});
test('student export excludes answers; teacher guide includes them', () => {
  const questions = buildQuestions(SAMPLE_NOTES, 5);
  assert.ok(!testDocument(SAMPLE_BRIEF, questions, false).includes('Answer:'));
  assert.equal((testDocument(SAMPLE_BRIEF, questions, true).match(/Answer:/g) || []).length, 5);
  assert.equal(buildDocument(SAMPLE_BRIEF, 'test'), testDocument(SAMPLE_BRIEF, questions, false));
});
test('scoring returns only the concepts needing practice', () => {
  const questions = buildQuestions(SAMPLE_NOTES, 5);
  assert.deepEqual(scoreQuestions(questions, questions.map(q => q.correct)), { correct: 5, total: 5, revisit: [] });
  const answers = questions.map(q => q.correct);
  answers[2] = -1;
  assert.deepEqual(scoreQuestions(questions, answers), { correct: 4, total: 5, revisit: ['Whole'] });
  assert.equal(scoreQuestions(questions, []).correct, 0);
});
