import { levelForPercent, type CBCLevel } from './cbc';

/**
 * Term report arithmetic. Input is CONFIRMED marks only; drafts never reach a report.
 */

export type ConfirmedMark = {
  subjectCode: string;
  subjectName: string;
  score: number;
  maxScore: number;
};

export type SubjectLine = {
  subjectCode: string;
  subjectName: string;
  assessments: number;
  percent: number;
  level: CBCLevel;
};

export type TermSummary = {
  subjects: SubjectLine[];
  overallPercent: number | null;
  overallLevel: CBCLevel | null;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Each subject is total score over total maximum, so longer papers weigh more within a subject. */
export function summariseTerm(marks: ConfirmedMark[]): TermSummary {
  const bySubject = new Map<string, { name: string; score: number; maximum: number; count: number }>();
  for (const mark of marks) {
    if (mark.maxScore <= 0 || mark.score < 0 || mark.score > mark.maxScore) {
      throw new Error(`Invalid mark for ${mark.subjectCode}: ${mark.score} of ${mark.maxScore}.`);
    }
    const entry = bySubject.get(mark.subjectCode) ?? { name: mark.subjectName, score: 0, maximum: 0, count: 0 };
    entry.score += mark.score;
    entry.maximum += mark.maxScore;
    entry.count += 1;
    bySubject.set(mark.subjectCode, entry);
  }

  const subjects: SubjectLine[] = [...bySubject.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, entry]) => {
      const percent = round1((entry.score / entry.maximum) * 100);
      return { subjectCode: code, subjectName: entry.name, assessments: entry.count, percent, level: levelForPercent(percent) };
    });

  if (subjects.length === 0) return { subjects, overallPercent: null, overallLevel: null };
  // Mean of subject percentages: each subject counts equally, however many papers it has.
  const overallPercent = round1(subjects.reduce((total, line) => total + line.percent, 0) / subjects.length);
  return { subjects, overallPercent, overallLevel: levelForPercent(overallPercent) };
}

/** Share of marked days that were present or late, or null when nothing was marked. */
export function attendanceRate(counts: { present: number; late: number; absent: number; excused: number }): number | null {
  const marked = counts.present + counts.late + counts.absent + counts.excused;
  if (marked === 0) return null;
  return round1(((counts.present + counts.late) / marked) * 100);
}
