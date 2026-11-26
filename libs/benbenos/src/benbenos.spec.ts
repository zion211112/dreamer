import { describe, expect, it } from 'vitest';
import {
  attendanceRate,
  balanceCents,
  BB_CAPABILITIES,
  can,
  formatKes,
  isBBRole,
  levelForPercent,
  levelForScore,
  markSubmission,
  parseKesToCents,
  subjectsForGrade,
  summariseTerm,
  validateScheme,
  type SchemeQuestion,
} from './index';

describe('CBC levels', () => {
  it('bands are contiguous: fractional percentages never fall between bands', () => {
    expect(levelForPercent(79.5)).toBe('ME');
    expect(levelForPercent(80)).toBe('EE');
    expect(levelForPercent(64.99)).toBe('AE');
    expect(levelForPercent(65)).toBe('ME');
    expect(levelForPercent(49.9)).toBe('BE');
    expect(levelForPercent(50)).toBe('AE');
    expect(levelForPercent(0)).toBe('BE');
    expect(levelForPercent(100)).toBe('EE');
  });

  it('rejects non-finite input and non-positive maxima', () => {
    expect(() => levelForPercent(Number.NaN)).toThrow();
    expect(() => levelForScore(5, 0)).toThrow();
  });

  it('exposes only grades 4 to 9 and subjects that belong to them', () => {
    expect(subjectsForGrade(4).some((subject) => subject.code === 'MAT')).toBe(true);
    expect(subjectsForGrade(9).length).toBeGreaterThan(0);
  });
});

describe('auto-marking', () => {
  const scheme: SchemeQuestion[] = [
    { id: 'q1', type: 'mcq', marks: 2, correctOption: 1 },
    { id: 'q2', type: 'keyword', marks: 4, keywords: ['photosynthesis', 'sunlight', 'chlorophyll', 'glucose'] },
  ];

  it('MCQ scores only the keyed option (regression: any selected option was marked correct before)', () => {
    expect(markSubmission(scheme, { q1: 0, q2: '' }).questions[0].marks).toBe(0);
    expect(markSubmission(scheme, { q1: 1, q2: '' }).questions[0].marks).toBe(2);
    expect(markSubmission(scheme, { q2: '' }).questions[0].marks).toBe(0);
  });

  it('keyword answers earn full marks at the threshold and part marks below it', () => {
    // default threshold for 4 keywords is 2
    expect(markSubmission(scheme, { q1: 1, q2: 'Sunlight and CHLOROPHYLL' }).questions[1].marks).toBe(4);
    expect(markSubmission(scheme, { q1: 1, q2: 'It uses sunlight' }).questions[1].marks).toBe(2);
    expect(markSubmission(scheme, { q1: 1, q2: 'I do not know' }).questions[1].marks).toBe(0);
  });

  it('totals, percent and level are derived from the marked questions', () => {
    const result = markSubmission(scheme, { q1: 1, q2: 'sunlight glucose' });
    expect(result).toMatchObject({ score: 6, maximum: 6, percent: 100, level: 'EE' });
  });

  it('validates schemes before marking', () => {
    expect(() => validateScheme([])).toThrow();
    expect(() => validateScheme([{ id: 'a', type: 'mcq', marks: 0, correctOption: 0 }])).toThrow();
    expect(() => validateScheme([
      { id: 'a', type: 'mcq', marks: 1, correctOption: 0 },
      { id: 'a', type: 'mcq', marks: 1, correctOption: 0 },
    ])).toThrow(/Duplicate/);
    expect(() => validateScheme([{ id: 'k', type: 'keyword', marks: 2, keywords: ['x'], minKeywords: 3 }])).toThrow();
  });

  it('rejects answers of the wrong shape instead of guessing', () => {
    expect(() => markSubmission(scheme, { q1: 'b', q2: '' })).toThrow();
    expect(() => markSubmission(scheme, { q1: 1, q2: 7 as unknown as string })).toThrow();
  });
});

describe('money', () => {
  it('parses shillings into cents and formats them back', () => {
    expect(parseKesToCents('12,500')).toBe(1250000);
    expect(parseKesToCents('12500.5')).toBe(1250050);
    expect(formatKes(1250050)).toBe('KES 12,500.50');
    expect(balanceCents(1250000, 500000)).toBe(750000);
  });

  it('rejects ambiguous or zero amounts', () => {
    expect(() => parseKesToCents('12.345')).toThrow();
    expect(() => parseKesToCents('-5')).toThrow();
    expect(() => parseKesToCents('0')).toThrow();
    expect(() => parseKesToCents('abc')).toThrow();
  });
});

describe('term summary', () => {
  it('averages each subject by total score over total maximum and derives the overall level', () => {
    const summary = summariseTerm([
      { subjectCode: 'MAT', subjectName: 'Mathematics', score: 9, maxScore: 10 },
      { subjectCode: 'MAT', subjectName: 'Mathematics', score: 4, maxScore: 10 },
      { subjectCode: 'ENG', subjectName: 'English', score: 5, maxScore: 10 },
    ]);
    expect(summary.subjects).toEqual([
      { subjectCode: 'ENG', subjectName: 'English', assessments: 1, percent: 50, level: 'AE' },
      { subjectCode: 'MAT', subjectName: 'Mathematics', assessments: 2, percent: 65, level: 'ME' },
    ]);
    expect(summary.overallPercent).toBe(57.5);
    expect(summary.overallLevel).toBe('AE');
  });

  it('reports nothing when there are no confirmed marks', () => {
    expect(summariseTerm([])).toEqual({ subjects: [], overallPercent: null, overallLevel: null });
  });

  it('refuses impossible marks', () => {
    expect(() => summariseTerm([{ subjectCode: 'MAT', subjectName: 'M', score: 11, maxScore: 10 }])).toThrow();
  });

  it('attendance rate counts present and late as attended', () => {
    expect(attendanceRate({ present: 8, late: 1, absent: 1, excused: 0 })).toBe(90);
    expect(attendanceRate({ present: 0, late: 0, absent: 0, excused: 0 })).toBeNull();
  });
});

describe('roles', () => {
  it('teachers cannot confirm marks or manage money; principals can do everything', () => {
    expect(can('teacher', 'marks.write')).toBe(true);
    expect(can('teacher', 'marks.confirm')).toBe(false);
    expect(can('teacher', 'fees.write')).toBe(false);
    expect(can('bursar', 'marks.write')).toBe(false);
    for (const capability of BB_CAPABILITIES) expect(can('principal', capability)).toBe(true);
  });

  it('recognises only known roles', () => {
    expect(isBBRole('teacher')).toBe(true);
    expect(isBBRole('admin')).toBe(false);
    expect(isBBRole(undefined)).toBe(false);
  });
});
