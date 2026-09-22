// The Kenya layer. Everything the console assumes about the curriculum it
// runs on — levels, learning areas, bells, terms, the assessment gates and
// the SBA split — lives here, in one file, so the tools never hard-code it.
//
// Sources: KICD curriculum designs (2-6-6-3: PP1-2, Grade 1-3, 4-6, 7-9,
// 10-12), the KJSEA/KPSEA assessment framework (school-based assessment
// 60%, summative 40%, performance levels EE/ME/AE/BE), and the standard
// three-term Kenyan year. When KICD moves, edit this file — the tools follow.
//
// The proto-schools are real Kenyan schools used as load-bearing examples:
// pick one at the console door and the whole console arrives populated —
// roll, marks, fees, timetable — the way a teacher's term actually looks.

import { Assessment, Student, studentId, scoreKey } from "./school";
import { WeeklyTimetable, TimetableTime } from "./timetable";

/* ------------------------------------------------------------------ */
/* Levels and learning areas                                          */
/* ------------------------------------------------------------------ */

export interface Level {
  id: string;
  label: string;
  grades: string[]; // class labels as a teacher writes them
  lessonMin: number;
  subjects: string[]; // learning areas, in scheme-of-work order
}

export const LEVELS: Level[] = [
  {
    id: "pp",
    label: "Pre-Primary (PP1–PP2)",
    grades: ["PP1", "PP2"],
    lessonMin: 30,
    subjects: [
      "Language Activities",
      "Mathematical Activities",
      "Environmental Activities",
      "Psychomotor & Creative",
      "CRE Activities"
    ]
  },
  {
    id: "lp",
    label: "Lower Primary (Grade 1–3)",
    grades: ["Grade 1", "Grade 2", "Grade 3"],
    lessonMin: 35,
    subjects: [
      "English",
      "Kiswahili",
      "Literacy",
      "Indigenous Language",
      "Mathematics",
      "Environmental Activities",
      "Hygiene & Nutrition",
      "CRE",
      "Movement & Creative"
    ]
  },
  {
    id: "up",
    label: "Upper Primary (Grade 4–6)",
    grades: ["Grade 4", "Grade 5", "Grade 6"],
    lessonMin: 40,
    subjects: [
      "English",
      "Kiswahili",
      "Mathematics",
      "Science & Technology",
      "Social Studies",
      "CRE",
      "Creative Arts",
      "PHE",
      "Agriculture",
      "Home Science"
    ]
  },
  {
    id: "jss",
    label: "Junior Secondary (Grade 7–9)",
    grades: ["Grade 7", "Grade 8", "Grade 9"],
    lessonMin: 40,
    subjects: [
      "English",
      "Kiswahili",
      "Mathematics",
      "Integrated Science",
      "Pre-Technical Studies",
      "Social Studies",
      "CRE",
      "Business Studies",
      "Agriculture",
      "Computer Science"
    ]
  },
  {
    id: "ss",
    label: "Senior School (Grade 10–12)",
    grades: ["Form 3", "Form 4"],
    lessonMin: 40,
    subjects: [
      "English",
      "Kiswahili",
      "General Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Geography",
      "History & Citizenship",
      "Computer Studies"
    ]
  }
];

export function levelOfClass(cls: string): Level {
  const c = cls.trim().toLowerCase();
  return (
    LEVELS.find((l) => l.grades.some((g) => c === g.toLowerCase() || c.startsWith(g.toLowerCase() + " "))) ??
    LEVELS[1]
  );
}

export function subjectsForClass(cls: string): string[] {
  return levelOfClass(cls).subjects;
}

/* ------------------------------------------------------------------ */
/* Assessment framework                                               */
/* ------------------------------------------------------------------ */

// SBA: the school's own assessment carries 60%, the national summative 40%.
// The console's whole marking pipeline feeds the 60 — that is the point.
export const SBA_SPLIT = { formative: 60, summative: 40 } as const;

export const PERFORMANCE_LEVELS = [
  { id: "BE", name: "Below Expectation", range: "0–39", note: "Needs structured support before the next strand." },
  { id: "AE", name: "Approaching Expectation", range: "40–59", note: "Close — target the named misconception." },
  { id: "ME", name: "Meeting Expectation", range: "60–79", note: "Solid. Stretch with applied tasks." },
  { id: "EE", name: "Exceeding Expectation", range: "80–100", note: "Working above the strand. Give leadership roles." }
] as const;

export function performanceLevel(pct: number): (typeof PERFORMANCE_LEVELS)[number] {
  if (pct >= 80) return PERFORMANCE_LEVELS[3];
  if (pct >= 60) return PERFORMANCE_LEVELS[2];
  if (pct >= 40) return PERFORMANCE_LEVELS[1];
  return PERFORMANCE_LEVELS[0];
}

// The national gates: where the summative sits in the journey.
export const ASSESSMENT_GATES = [
  { grade: "Grade 6", gate: "KPSEA", note: "Summative 40% · transitions to Junior Secondary." },
  { grade: "Grade 9", gate: "KJSEA", note: "Summative 40% · placement to Senior School pathway." },
  { grade: "Form 4", gate: "KCSE", note: "The old gate — phased out as CBE cohorts arrive." }
] as const;

export const TERMS = [
  { id: "t1", name: "Term 1", weeks: 13, note: "Opener → Midterm → Endterm" },
  { id: "t2", name: "Term 2", weeks: 14, note: "The longest term — exam-heavy." },
  { id: "t3", name: "Term 3", weeks: 12, note: "Short. National assessments sit here." }
] as const;

export const EXAMS_PER_TERM = ["Opener Exam", "Midterm Exam", "Endterm Exam"] as const;
export const SUMMARY_EXAM: string = EXAMS_PER_TERM[2];

/* ------------------------------------------------------------------ */
/* The proto schools — ten real Kenyan schools, the load-bearing demo  */
/* ------------------------------------------------------------------ */

export interface ProtoSchool {
  id: string;
  name: string;
  motto: string;
  county: string;
  kind: string;
  crestSeed: number; // picks the GeoArt motif so each school gets a mark
}

// Ten real schools across county/national/extra-county tiers and both the
// 8-4-4 tail and the CBE wave — a console must survive all of them.
export const PROTO_SCHOOLS: ProtoSchool[] = [
  { id: "mangu",      name: "Mang'u High School",          motto: "Semper Sursum",              county: "Kiambu",        kind: "National · Boys",      crestSeed: 0 },
  { id: "kenya-high", name: "Kenya High School",           motto: "Servire Regnare",            county: "Nairobi",       kind: "National · Girls",     crestSeed: 1 },
  { id: "alliance",   name: "Alliance High School",        motto: "Strong to Serve",            county: "Kiambu",        kind: "National · Boys",      crestSeed: 2 },
  { id: "moi-kabarak", name: "Moi Kabarak High School",    motto: "Education for Life",         county: "Nakuru",        kind: "National · Mixed",     crestSeed: 3 },
  { id: "masseno",    name: "Maseno School",               motto: "Perseverantia et Successio", county: "Kisumu",        kind: "National · Boys",      crestSeed: 4 },
  { id: "singore",    name: "Singore Girls High School",   motto: "Towards Greater Heights",    county: "Elgeyo-Marakwet", kind: "Extra-county · Girls", crestSeed: 5 },
  { id: "bura",       name: "Bura Girls High School",      motto: "Forward with Hope",          county: "Taita-Taveta",  kind: "Extra-county · Girls", crestSeed: 6 },
  { id: "st-lucy",    name: "St. Lucy's School for the Blind, Meru", motto: "Committed to Serve", county: "Meru",       kind: "Special-needs · Girls", crestSeed: 7 },
  { id: "kachiba",    name: "Kachiba Girls High School",   motto: "Knowledge is Virtue",        county: "Taita-Taveta",  kind: "County · Girls",       crestSeed: 8 },
  { id: "murangaa",   name: "Murang'a High School",        motto: "Elimu Nguvu Yetu",           county: "Murang'a",      kind: "County · Boys",        crestSeed: 9 }
];

export function schoolById(id: string): ProtoSchool | undefined {
  return PROTO_SCHOOLS.find((s) => s.id === id);
}

/* ------------------------------------------------------------------ */
/* The proto dataset — a whole term in one deterministic generator     */
/* ------------------------------------------------------------------ */

export interface ProtoDataset {
  school: ProtoSchool;
  term: string;
  students: Student[];
  assessments: Assessment[];
}

const FIRST_F: string[] = ["Amina", "Wanjiku", "Mercy", "Faith", "Njeri", "Cynthia", "Zawadi", "Neema", "Joy", "Purity", "Shamim", "Brenda", "Cate", "Lydia", "Halima", "Esther", "Nafula", "Chebet", "Kendi", "Winnie"];
const FIRST_M: string[] = ["Brian", "Kevin", "Dennis", "Samuel", "Elijah", "Baraka", "Trevor", "Collins", "Hassan", "Ibrahim", "Peter", "Wesley", "Boniface", "Victor", "Mutua", "Kariuki", "Omondi", "Kipchoge", "Ochieng", "Kamande"];
const SURNAMES: string[] = ["Wanjiru", "Otieno", "Njoroge", "Mwangi", "Kiptoo", "Achieng", "Kamau", "Njoki", "Korir", "Chebet", "Mutiso", "Omondi", "Wafula", "Ndirangu", "Nyambura", "Barasa", "Cherono", "Mwende", "Odhiambo", "Kilonzo"];

// Deterministic PRNG — the same school id always produces the same roll,
// so screenshots, reports and demos agree with each other.
function rng(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const EXAM_PTS: Record<string, number> = { "Opener Exam": 0.62, "Midterm Exam": 0.82, "Endterm Exam": 1.0 };

const GIRLS: readonly string[] = ["kenya-high", "singore", "bura", "st-lucy", "kachiba"];

export function buildProtoSchool(school: ProtoSchool): ProtoDataset {
  const rand = rng(school.crestSeed * 7919 + 104729);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  // Classes: the school's real shape — CBE Junior Secondary + an 8-4-4 tail.
  const allGirls = GIRLS.includes(school.id);
  const classes: Array<{ cls: string; stream: string; n: number; sex: "M" | "F" | "X" }> = allGirls
    ? [
        { cls: "Grade 7", stream: "N", n: 44, sex: "F" },
        { cls: "Grade 8", stream: "N", n: 41, sex: "F" },
        { cls: "Grade 9", stream: "N", n: 38, sex: "F" },
        { cls: "Form 3", stream: "E", n: 42, sex: "F" },
        { cls: "Form 4", stream: "E", n: 39, sex: "F" }
      ]
    : [
        { cls: "Grade 7", stream: "S", n: 45, sex: "X" },
        { cls: "Grade 8", stream: "S", n: 43, sex: "X" },
        { cls: "Grade 9", stream: "S", n: 40, sex: "X" },
        { cls: "Form 3", stream: "N", n: 42, sex: "M" },
        { cls: "Form 4", stream: "N", n: 44, sex: "M" }
      ];

  const students: Student[] = [];
  let adm = 8001 + school.crestSeed * 7;
  for (const c of classes) {
    for (let i = 0; i < c.n; i++) {
      const sex: "M" | "F" = c.sex === "X" ? (rand() < 0.5 ? "M" : "F") : c.sex;
      const first = sex === "F" ? pick(FIRST_F) : pick(FIRST_M);
      const surname = pick(SURNAMES);
      const name = `${first} ${surname}`;
      adm += 1 + Math.floor(rand() * 3);
      const label = c.stream ? `${c.cls} ${c.stream}` : c.cls;
      students.push({
        id: studentId(String(adm), name, label),
        admNo: String(adm),
        name,
        sex,
        className: c.cls,
        stream: c.stream,
        dob: `20${String(9 + Math.floor(rand() * 5)).padStart(2, "0")}-0${1 + Math.floor(rand() * 9)}-${String(1 + Math.floor(rand() * 28)).padStart(2, "0")}`,
        parentName: `${rand() < 0.5 ? pick(FIRST_F) : pick(FIRST_M)} ${surname}`,
        parentPhone: `07${2 + Math.floor(rand() * 8)}${String(Math.floor(rand() * 10000000)).padStart(8, "0")}`
      });
    }
  }

  // Marks: three exams × the class's subjects, a stable per-learner ability
  // plus an exam ramp so the term shows progress. This is what Auto-Marking,
  // Term Reports and the forecast tools read.
  const assessments: Assessment[] = [];
  for (const s of students) {
    const subj = subjectsForClass(s.className);
    const ability = 38 + rand() * 44; // 38–82, the honest school band
    for (const exam of Object.keys(EXAM_PTS)) {
      for (let si = 0; si < subj.length; si++) {
        const jitter = (rand() - 0.5) * 16;
        const affinity = (si % 5) * 1.3;
        const score = Math.max(12, Math.min(97, Math.round(ability * EXAM_PTS[exam] + jitter + affinity)));
        assessments.push({ key: scoreKey(exam, s.id, subj[si]), exam, studentId: s.id, subject: subj[si], score, max: 100 });
      }
    }
  }

  return { school, term: `${new Date().getFullYear() + 1} T1`, students, assessments };
}

/* ------------------------------------------------------------------ */
/* Fees seed — one term invoice, M-Pesa-pattern payments               */
/* ------------------------------------------------------------------ */

export interface ProtoFeeTerm {
  id: string;
  term: string;
  amount: number;
  ts: number;
}

export interface ProtoFeePayment {
  id: string;
  term: string;
  studentId: string;
  amount: number;
  ref: string;
  on: string;
}

export function buildFees(students: Student[]): { term: ProtoFeeTerm; payments: ProtoFeePayment[] } {
  const term = "2027 T1";
  const amount = 18500;
  const rand = rng(31337);
  const payments: ProtoFeePayment[] = [];
  for (const s of students) {
    const r = rand();
    // A real fee ledger: most pay in parts, some clear, some vanish.
    const parts = r < 0.12 ? 0 : r < 0.55 ? 1 : r < 0.85 ? 2 : 3;
    let paid = 0;
    for (let p = 0; p < parts; p++) {
      const share = p === parts - 1 ? amount - paid : Math.round((amount / parts) * (0.7 + rand() * 0.6));
      paid += share;
      const ref = `Q${p}${Math.floor(rand() * 900 + 100)}X${s.admNo.slice(-2)}`;
      payments.push({
        id: `${term}|${s.id}|${ref}`,
        term,
        studentId: s.id,
        amount: share,
        ref,
        on: `2027-01-${String(6 + Math.floor(rand() * 22)).padStart(2, "0")}`
      });
    }
  }
  return { term: { id: "2027-t1", term, amount, ts: Date.now() }, payments };
}

/* ------------------------------------------------------------------ */
/* Timetables — period-true grids distilled from real school weeks     */
/* ------------------------------------------------------------------ */

export const KENYA_BELLS: TimetableTime[] = [
  { start: "07:40", end: "08:00", kind: "roll" },
  { start: "08:00", end: "08:40", kind: "lesson" },
  { start: "08:40", end: "09:20", kind: "lesson" },
  { start: "09:20", end: "09:40", kind: "break" },
  { start: "09:40", end: "10:20", kind: "lesson" },
  { start: "10:20", end: "11:00", kind: "lesson" },
  { start: "11:00", end: "11:20", kind: "break" },
  { start: "11:20", end: "12:00", kind: "lesson" },
  { start: "12:00", end: "12:40", kind: "lesson" },
  { start: "12:40", end: "14:00", kind: "lunch" },
  { start: "14:00", end: "14:40", kind: "lesson" },
  { start: "14:40", end: "15:20", kind: "lesson" },
  { start: "15:20", end: "15:30", kind: "break" },
  { start: "15:30", end: "16:10", kind: "lesson" }
];

// A JSS (Grade 7–9) week — the 40-minute shape KICD designs assume.
const JSS_SUBJ = ["ENGLISH", "KISWAHILI", "MATHEMATICS", "INT. SCIENCE", "PRE-TECHNICAL", "SOCIAL STUDIES", "CRE", "BUSINESS", "COMPUTER"];

function jssWeek(cls: string): WeeklyTimetable {
  const c = (r: number[]) => r.map((i) => (i < 0 ? "—" : JSS_SUBJ[i]));
  return {
    name: `${cls} · CBE week`,
    className: cls,
    times: KENYA_BELLS,
    cells: {
      MON:  c([0, 1, -1, 2, 3, -1, 4, 5, -1, 6, 7, -1, 8]),
      TUE:  c([6, 2, -1, 1, 8, -1, 3, 4, -1, 5, 0, -1, 7]),
      WED:  c([3, 4, -1, 7, 2, -1, 8, 1, -1, 0, 6, -1, 5]),
      THUR: c([5, 7, -1, 0, 6, -1, 2, 3, -1, 8, 4, -1, 1]),
      FRI:  c([4, 8, -1, 6, 5, -1, 1, 0, -1, 7, 3, -1, -1])
    }
  };
}

// A Form 3 8-4-4 week — doubles, games Wednesday afternoon.
function formWeek(cls: string): WeeklyTimetable {
  const S = ["ENGLISH", "KISWAHILI", "MATH", "BIO", "CHEM", "PHY", "HISTORY", "GEO", "COMPUTER"];
  const c = (r: number[]) => r.map((i) => (i < 0 ? "—" : S[i]));
  return {
    name: `${cls} · exam-class week`,
    className: cls,
    times: KENYA_BELLS,
    cells: {
      MON:  c([2, 4, -1, 0, 6, -1, 5, 1, -1, 8, 7, -1, 3]),
      TUE:  c([4, 2, -1, 3, 0, -1, 7, 5, -1, 1, 8, -1, 6]),
      WED:  c([0, 1, -1, 5, 7, -1, 4, 2, -1, -1, -1, -1, 3]),
      THUR: c([3, 5, -1, 8, 1, -1, 0, 4, -1, 2, 6, -1, 7]),
      FRI:  c([6, 0, -1, 1, 2, -1, 7, 8, -1, 5, 3, -1, -1])
    }
  };
}

// Lower-primary week — 35-minute lessons, activity-led.
function lowerWeek(cls: string): WeeklyTimetable {
  const times: TimetableTime[] = [
    { start: "08:00", end: "08:15", kind: "roll" },
    { start: "08:15", end: "08:50", kind: "lesson" },
    { start: "08:50", end: "09:25", kind: "lesson" },
    { start: "09:25", end: "09:45", kind: "break" },
    { start: "09:45", end: "10:20", kind: "lesson" },
    { start: "10:20", end: "10:55", kind: "lesson" },
    { start: "10:55", end: "11:15", kind: "break" },
    { start: "11:15", end: "11:50", kind: "lesson" },
    { start: "12:30", end: "13:30", kind: "lunch" },
    { start: "13:30", end: "14:05", kind: "lesson" }
  ];
  const S = ["ENGLISH", "KISWAHILI", "LITERACY", "MATH", "ENVIRONMENTAL", "CRE", "HYGIENE", "MOVEMENT"];
  const c = (r: number[]) => r.map((i) => (i < 0 ? "—" : S[i]));
  return {
    name: `${cls} · activity week`,
    className: cls,
    times,
    cells: {
      MON:  c([0, 1, -1, 3, 4, -1, 5, 6, -1, 7]),
      TUE:  c([3, 0, -1, 1, 7, -1, 4, 5, -1, 2]),
      WED:  c([1, 3, -1, 4, 2, -1, 0, 7, -1, 5]),
      THUR: c([4, 5, -1, 0, 3, -1, 2, 1, -1, 6]),
      FRI:  c([6, 4, -1, 5, 0, -1, 3, 2, -1, 7])
    }
  };
}

export function protoTimetable(cls: string): WeeklyTimetable {
  const c = cls.trim().toLowerCase();
  if (c.startsWith("grade 1") || c.startsWith("grade 2") || c.startsWith("grade 3")) return lowerWeek(cls);
  if (c.startsWith("grade")) return jssWeek(cls);
  return formWeek(cls);
}



