// The exemplar school — a complete, coherent prototype dataset so the
// console opens like a school that has been using it for a term, not a
// blank slate. One school ("Kitengela ABC Academy") is fully populated:
// 60 learners across Grade 7 streams Kopa/Kondo, a term of assessment
// scores, fee payments and day events — every module has material to
// work on immediately. The other nine schools form the exemplar register.
//
// Seeded once into empty IndexedDB stores; the school's own data
// replaces it. Deterministic — the same seed builds the same school.

import { Student, Assessment, scoreKey } from "./school";
import { FeeTerm, FeePayment } from "./fees";

/* ------------------------------------------------------------------ */
/* The exemplar register — ten Kenyan schools                          */
/* ------------------------------------------------------------------ */

export interface ExemplarSchool {
  id: string;
  name: string;
  kind: string;
  county: string;
  enrolment: number;
  streamClasses: string[]; // the classes the console demo populates
  motto: string;
}

export const EXEMPLAR_SCHOOLS: ExemplarSchool[] = [
  { id: "sch-abc", name: "Kitengela ABC Academy", kind: "Private Academy", county: "Kajiado", enrolment: 640, streamClasses: ["Grade 7 · Kopa", "Grade 7 · Kondo"], motto: "Knowledge with character" },
  { id: "sch-mangu", name: "Mang'u High School", kind: "National School", county: "Kiambu", enrolment: 1120, streamClasses: ["Form 3 · North", "Form 3 · South"], motto: "Jishinde Ushinde" },
  { id: "sch-khadija", name: "Khadija Primary School", kind: "Public Primary", county: "Mombasa", enrolment: 980, streamClasses: ["Grade 6 · Simba", "Grade 6 · Chui"], motto: "Elimu ni Nuru" },
  { id: "sch-ogembo", name: "Ogembo Junior School", kind: "Public Junior", county: "Kisii", enrolment: 420, streamClasses: ["Grade 8 · Green", "Grade 8 · White"], motto: "Learn today, lead tomorrow" },
  { id: "sch-kapsabet", name: "Kapsabet Boys High School", kind: "National School", county: "Nandi", enrolment: 1450, streamClasses: ["Form 4 · East", "Form 4 · West"], motto: "Committed to Excellence" },
  { id: "sch-stlucy", name: "St. Lucy Ikonyero Primary", kind: "Public Primary", county: "Vihiga", enrolment: 510, streamClasses: ["Grade 5 · A", "Grade 5 · B"], motto: "Strive for the best" },
  { id: "sch-moikamusinga", name: "Moi Girls Kamusinga", kind: "Extra-County Secondary", county: "Bungoma", enrolment: 1240, streamClasses: ["Form 2 · Red", "Form 2 · Blue"], motto: "Education for Service" },
  { id: "sch-loitokitok", name: "Loitokitok Junior Secondary", kind: "Public Junior", county: "Kajiado", enrolment: 380, streamClasses: ["Grade 9 · Kali", "Grade 9 · Nyati"], motto: "Forward ever" },
  { id: "sch-nyahururu", name: "Nyahururu Special School", kind: "Special Needs", county: "Laikipia", enrolment: 190, streamClasses: ["Grade 4 · Tumaini"], motto: "Every learner counts" },
  { id: "sch-taita", name: "Taita Taveta Secondary", kind: "County Secondary", county: "Taita-Taveta", enrolment: 720, streamClasses: ["Form 1 · North", "Form 1 · South"], motto: "Hard work pays" }
];

/* ------------------------------------------------------------------ */
/* Names — 30 first + 40 surname pools, seeded round-robin. Kenyan.   */
/* ------------------------------------------------------------------ */

const BOYS = ["Brian", "Kelvin", "Dennis", "Mutua", "Kipchoge", "Otieno", "Samuel", "Ian", "Victor", "Collins", "Erick", "Boniface", "Daniel", "Joseph", "Kamau", "Eliud", "Peter", "Kevin", "Amos", "Nicholas", "Wesley", "Michael", "Gabriel", "Stephen", "Alex", "Titus", "Rono", "Shadrack", "Emmanuel", "Isaac"];
const GIRLS = ["Faith", "Mercy", "Brenda", "Cynthia", "Nafula", "Wanjiku", "Sharon", "Joyce", "Esther", "Gladys", "Njeri", "Purity", "Caroline", "Chebet", "Lucy", "Ann", "Beatrice", "Damaris", "Rose", "Halima", "Zawadi", "Neema", "Everlyne", "Millicent", "Priscilla", "Rehema", "Sophia", "Tabitha", "Winnie", "Yvonne"];
const SURNAMES = ["Wanjiru", "Ochieng", "Kiptoo", "Njoroge", "Mwende", "Chelimo", "Atieno", "Mutiso", "Wafula", "Njeri", "Korir", "Muthoni", "Omondi", "Nyambura", "Barasa", "Chebet", "Kilonzo", "Achieng", "Kimani", "Owino", "Mumo", "Rotich", "Wekesa", "Nduta", "Simiyu", "Kariuki", "Oduor", "Wambui", "Mutinda", "Jepkemboi", "Onyango", "Mwikali", "Kemboi", "Ndegwa", "Anyango", "Kamau", "Muthoka", "Chepkoech", "Otieno", "Mwangi"];
const PARENT_NAMES = ["Joseph", "Mary", "Peter", "Grace", "Samuel", "Esther", "David", "Sarah", "John", "Daniel", "Rebecca", "Simon", "Beatrice", "Paul", "Janet", "Michael", "Alice", "Stephen", "Ruth", "Naomi"];

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return s / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* The roll: 60 learners, Grade 7 Kopa (30) + Kondo (30)               */
/* ------------------------------------------------------------------ */

export const EXEMPLAR_ROSTER: Student[] = (() => {
  const rand = seeded(20260920);
  const out: Student[] = [];
  const streams: Array<[string, string, number]> = [
    ["Grade 7", "Kopa", 30],
    ["Grade 7", "Kondo", 30]
  ];
  let n = 0;
  for (const [className, stream, count] of streams) {
    for (let i = 0; i < count; i += 1) {
      const sex = rand() < 0.5 ? "M" : "F";
      const first = sex === "M" ? BOYS[Math.floor(rand() * BOYS.length)] : GIRLS[Math.floor(rand() * GIRLS.length)];
      const sur = SURNAMES[Math.floor(rand() * SURNAMES.length)];
      n += 1;
      const admNo = `KC7${String(1000 + n)}`;
      const birthYear = 2013 - Math.floor(rand() * 2);
      const month = 1 + Math.floor(rand() * 12);
      const day = 1 + Math.floor(rand() * 28);
      const parent = PARENT_NAMES[Math.floor(rand() * PARENT_NAMES.length)];
      out.push({
        id: `STU-${admNo}`,
        admNo,
        name: `${first} ${sur}`,
        sex,
        className,
        stream,
        dob: `${birthYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        parentName: `${parent} ${sur}`,
        parentPhone: `07${Math.floor(10000000 + rand() * 89999999)}`
      });
    }
  }
  return out;
})();

export const EXEMPLAR_SCHOOL_NAME = "Kitengela ABC Academy";
export const EXEMPLAR_TEACHER = "Wanjala M.";

/* ------------------------------------------------------------------ */
/* Scores: three exams across the CBC Grade 7 learning areas, with     */
/* KJSEA-style performance levels (BE/AB/AE/ME/EE).                    */
/* ------------------------------------------------------------------ */

export const GRADE7_SUBJECTS = [
  "Mathematics",
  "English",
  "Kiswahili",
  "Integrated Science",
  "Social Studies",
  "Religious Education",
  "Business Studies",
  "Agriculture"
] as const;

export const PERF_LEVELS = [
  { id: "BE", label: "Below Expectation", min: 0 },
  { id: "AB", label: "Approaching Expectation", min: 30 },
  { id: "AE", label: "Approaching Expectation+", min: 45 },
  { id: "ME", label: "Meeting Expectation", min: 58 },
  { id: "EE", label: "Exceeding Expectation", min: 76 }
] as const;

export function perfLevel(pct: number): (typeof PERF_LEVELS)[number] {
  return [...PERF_LEVELS].reverse().find((p) => pct >= p.min) ?? PERF_LEVELS[0];
}

export const EXEMPLAR_EXAMS = ["Opener Exam", "Midterm Exam", "Endterm Exam"] as const;

export const EXEMPLAR_ASSESSMENTS: Assessment[] = (() => {
  const rand = seeded(97531);
  const out: Assessment[] = [];
  for (const st of EXEMPLAR_ROSTER) {
    // each learner has an underlying ability; each exam wobbles around it
    const ability = 38 + rand() * 55; // 38–93
    EXEMPLAR_EXAMS.forEach((exam, ei) => {
      for (const subject of GRADE7_SUBJECTS) {
        const wobble = (rand() - 0.5) * 18;
        const score = Math.max(8, Math.min(99, Math.round(ability + wobble - ei * 1.5)));
        out.push({ key: scoreKey(exam, st.id, subject), exam, studentId: st.id, subject, score, max: 100 });
      }
    });
  }
  return out;
})();

/* ------------------------------------------------------------------ */
/* Fees: one term invoice + a realistic payment pattern.              */
/* ------------------------------------------------------------------ */

export const EXEMPLAR_FEE_TERM: FeeTerm = {
  id: "2026-t1",
  term: "2026 T1",
  amount: 12500,
  ts: Date.UTC(2026, 0, 1)
};

export const EXEMPLAR_FEE_PAYMENTS: FeePayment[] = (() => {
  const rand = seeded(24680);
  const out: FeePayment[] = [];
  for (const st of EXEMPLAR_ROSTER) {
    const roll = rand();
    // 62% paid in full early, 20% partial, 12% late partial, 6% never
    const plan =
      roll < 0.62 ? [12500] :
      roll < 0.82 ? [6000, 4300] :
      roll < 0.94 ? [4000] :
      [];
    const baseDay = 10 + Math.floor(rand() * 50);
    plan.forEach((amount, i) => {
      const day = baseDay + i * 24 + Math.floor(rand() * 10);
      const date = new Date(Date.UTC(2026, 0, 1) + day * 86400000).toISOString().slice(0, 10);
      out.push({
        id: `2026 T1|${st.id}|Q${st.admNo}${i}`,
        term: "2026 T1",
        studentId: st.id,
        amount,
        ref: `Q${Math.floor(rand() * 900 + 100)}${st.admNo.slice(-4)}${i}`,
        on: date
      });
    });
  }
  return out;
})();
