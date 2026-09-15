// KCSE maths, kept in one place so every tool says the same thing.
//
// Means are on the 0–400 scale: each subject normalises to 0–100 and the
// eight subjects carry weights that sum to 8.0 (Mathematics 1.5, sciences
// 1.25, the rest 1.0). The band table is the standard one — it is a const,
// not a hard rule: when the board moves the cut-offs, edit this file.

import { Assessment } from "./school";

export const KCSE_SUBJECTS = [
  "English",
  "Kiswahili",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "History & Government",
  "Geography"
];

export const KCSE_WEIGHTS: Record<string, number> = {
  English: 1.0,
  Kiswahili: 1.0,
  Mathematics: 1.5,
  Biology: 1.25,
  Chemistry: 1.25,
  Physics: 1.25,
  "History & Government": 1.0,
  Geography: 1.0
};

export const KCSE_BANDS: { min: number; band: string; remark: string }[] = [
  { min: 350, band: "A", remark: "Excellent. Hold the standard." },
  { min: 300, band: "A-", remark: "Very good. A step from the top band." },
  { min: 250, band: "B+", remark: "Good. Reach for A-." },
  { min: 200, band: "B", remark: "Good. Steady work, keep it up." },
  { min: 150, band: "C+", remark: "Credit. Solid foundation." },
  { min: 100, band: "C", remark: "Credit. Close to the next band." },
  { min: 80, band: "C-", remark: "Credit. Below C — push up." },
  { min: 60, band: "D", remark: "Below credit. Needs attention." },
  { min: 40, band: "E", remark: "Weak. Needs support and drills." },
  { min: 0, band: "F", remark: "Failing. Needs remedial support." }
];

export function bandFor(mean: number): { band: string; remark: string } {
  const b = KCSE_BANDS.find((x) => mean >= x.min) ?? KCSE_BANDS[KCSE_BANDS.length - 1];
  return { band: b.band, remark: b.remark };
}

export function pointsToNext(mean: number): number {
  const idx = KCSE_BANDS.findIndex((x) => mean >= x.min);
  if (idx <= 0) return 0; // top band — nothing above
  return Math.max(0, KCSE_BANDS[idx - 1].min - mean);
}

export interface SubjectStanding {
  subject: string;
  weight: number;
  pct: number; // 0–100, or -1 when the subject has no score yet
  contribution: number; // pct/100 * weight — how much it is worth of the mean
}

export interface StudentForecast {
  mean: number; // 0–400 weighted
  band: string;
  remark: string;
  gap: number; // points to the band above; 0 in the top band
  weakest: SubjectStanding[]; // bottom two by contribution, with scores
  unscored: string[]; // subjects with no entry at all
  perExam: { exam: string; mean: number }[]; // chronological, for the trend line
}

// Every subject the student has, averaged across exams, weighted to 0–400.
export function forecast(assessments: Assessment[], studentId: string): StudentForecast | null {
  const mine = assessments.filter((a) => a.studentId === studentId);
  if (mine.length === 0) return null;

  const perSubject = new Map<string, { total: number; n: number }>();
  for (const a of mine) {
    const p = a.max > 0 ? (a.score / a.max) * 100 : 0;
    const cur = perSubject.get(a.subject) ?? { total: 0, n: 0 };
    cur.total += p;
    cur.n += 1;
    perSubject.set(a.subject, cur);
  }

  let raw = 0;
  const standings: SubjectStanding[] = [];
  for (const [subject, w] of Object.entries(KCSE_WEIGHTS)) {
    const rec = perSubject.get(subject);
    if (rec && rec.n > 0) {
      const pct = rec.total / rec.n;
      raw += (pct / 100) * w;
      standings.push({ subject, weight: w, pct: Math.round(pct * 10) / 10, contribution: (pct / 100) * w });
    }
  }
  const unscored = Object.keys(KCSE_WEIGHTS).filter((s) => !perSubject.has(s));

  standings.sort((a, b) => a.contribution - b.contribution);
  // raw is on the 0–8 scale (sum of weights); the KCSE mean is out of 400.
  const mean = Math.round(raw * 500) / 10;
  const { band, remark } = bandFor(mean);

  const examOrder: string[] = [];
  const examMeans = new Map<string, { total: number; n: number }>();
  for (const a of mine) {
    const p = a.max > 0 ? (a.score / a.max) * 100 : 0;
    if (!examMeans.has(a.exam)) {
      examMeans.set(a.exam, { total: 0, n: 0 });
      examOrder.push(a.exam);
    }
    const em = examMeans.get(a.exam)!;
    em.total += p;
    em.n += 1;
  }
  const perExam = examOrder.map((exam) => {
    const em = examMeans.get(exam)!;
    const flat = em.n > 0 ? em.total / em.n : 0;
    const w = [...perSubject.keys()].reduce(
      (sum, s) => (mine.some((a) => a.exam === exam && a.subject === s) ? sum + (KCSE_WEIGHTS[s] ?? 1) : sum),
      0
    );
    // Flat 0–100 across that exam's subjects, scaled to the same 0–400 scale.
    return { exam, mean: Math.round(flat * 0.5 * w * 10) / 10 };
  });

  return {
    mean,
    band,
    remark,
    gap: pointsToNext(mean),
    weakest: standings.slice(0, 2),
    unscored,
    perExam
  };
}


// A class ranked by mean — the position on the printed report card.
export function classRank(assessments: Assessment[], studentId: string, exam: string): {
  position: number;
  of: number;
} {
  const examScores = new Map<string, number>();
  for (const a of assessments)
    if (a.exam === exam) examScores.set(a.studentId, examScores.get(a.studentId) ?? 0 + (a.max > 0 ? a.score / a.max : 0));
  const ranked = [...examScores.entries()].sort((a, b) => b[1] - a[1]);
  const position = ranked.findIndex(([id]) => id === studentId) + 1;
  return { position: position > 0 ? position : 0, of: ranked.length };
}
