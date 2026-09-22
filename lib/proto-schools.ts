// The proto dataset: ten real Kenyan schools a teacher would recognise,
// one of them — the demo school — already alive with a full roll,
// timetable, content bank, marks, fees and events.

export interface ProtoSchool {
  id: string;
  name: string;
  county: string;
  kind: string;
  levels: string[];
  streams: number;
  roll: number;
  staff: number;
  fees: number;
  note: string;
}

export const PROTO_SCHOOLS: ProtoSchool[] = [
  { id: "kibarani", name: "Kibarani Primary School", county: "Kilifi", kind: "Public · day · CBE primary", levels: ["PP1–PP2", "Grade 1–6", "JSS 7–9"], streams: 3, roll: 1184, staff: 34, fees: 0, note: "The demo school. Fully loaded: roll, timetable, content bank, marks, fees, events." },
  { id: "tumaini", name: "Tumaini Academy", county: "Nakuru", kind: "Private · day & boarding", levels: ["PP1–PP2", "Grade 1–6", "JSS 7–8"], streams: 2, roll: 642, staff: 28, fees: 38500, note: "Boarding wing from Grade 4. Four-bus transport fleet." },
  { id: "st-austins", name: "St. Austins Junior School", county: "Nairobi", kind: "Faith-based · day", levels: ["PP1–PP2", "Grade 1–6", "JSS 7–9"], streams: 2, roll: 518, staff: 24, fees: 42000, note: "Cathedral parish school. Choir and scouting programme." },
  { id: "mwisho", name: "Mwisho wa Lami Primary", county: "Kajiado", kind: "Public · day · ASAL", levels: ["PP1–PP2", "Grade 1–6"], streams: 1, roll: 386, staff: 12, fees: 0, note: "Feeding programme site. One stream per grade." },
  { id: "lakeview", name: "Lakeview Junior Secondary", county: "Kisumu", kind: "Public · day · JSS centre", levels: ["JSS 7–9"], streams: 4, roll: 704, staff: 22, fees: 0, note: "Domiciled JSS hosting feeder primaries." },
  { id: "baraka", name: "Baraka Girls Secondary", county: "Kericho", kind: "Public · boarding · girls", levels: ["Form 1–4"], streams: 3, roll: 892, staff: 41, fees: 53400, note: "County girls boarding. KCSE mean 7.1 last year." },
  { id: "mpaka", name: "Mpaka Secondary School", county: "Mandera", kind: "Public · day · mixed", levels: ["Form 1–4"], streams: 2, roll: 447, staff: 19, fees: 12000, note: "Day secondary with evening preps. Water project on site." },
  { id: "neema", name: "Neema Special Unit", county: "Mombasa", kind: "Public · SNE unit", levels: ["PP1–PP2", "Grade 1–6"], streams: 1, roll: 96, staff: 9, fees: 0, note: "Integrated special needs unit with therapy room." },
  { id: "elimu", name: "Elimu Bora Community School", county: "Turkana", kind: "Community · low-cost", levels: ["PP1–PP2", "Grade 1–4"], streams: 1, roll: 214, staff: 8, fees: 4500, note: "NGO-supported. Mobile library every second Thursday." },
  { id: "mwangaza", name: "Mwangaza International", county: "Kiambu", kind: "Private · CBE + IGCSE", levels: ["PP1–PP2", "Grade 1–9", "IGCSE 10–11"], streams: 2, roll: 733, staff: 46, fees: 185000, note: "Dual CBE/IGCSE track from Grade 9. Robotics lab." }
];

// Kenyan learner names for the seeded demo roll — first, last, parent.
const FIRST_M = ["Baraka", "Brian", "Dennis", "Elvis", "Felix", "George", "Hassan", "Ian", "Joel", "Kevin", "Leon", "Martin", "Nelson", "Peter", "Samuel"];
const FIRST_F = ["Achieng", "Amina", "Beatrice", "Cynthia", "Doreen", "Faith", "Grace", "Halima", "Irene", "Janet", "Keziah", "Lydia", "Mercy", "Naomi", "Zawadi"];
const LAST = ["Achieng", "Atieno", "Barasa", "Chebet", "Githinji", "Juma", "Kamau", "Kiptoo", "Maina", "Moraa", "Muthoni", "Mwangi", "Njoroge", "Nyambura", "Ochieng", "Odongo", "Okoth", "Otieno", "Wafula", "Wanjiru"];
const PARENT_M = ["Daniel Otieno", "John Mwangi", "Peter Kamau", "George Ochieng", "Samuel Maina", "David Barasa"];
const PARENT_F = ["Mercy Wanjiru", "Grace Njoroge", "Susan Kiptoo", "Faith Moraa", "Janet Nyambura", "Lydia Atieno"];


const DEMO_CLASSES = ["Grade 5 · X", "Grade 7 · E", "Grade 7 · W", "Grade 8 · E", "Grade 9 · E"];

export interface DemoStudent {
  admNo: string;
  name: string;
  sex: string;
  className: string;
  stream: string;
  dob: string;
  parentName: string;
  parentPhone: string;
}

function pick<T>(arr: T[], i: number, salt: number): T {
  return arr[(i * 7 + salt * 13) % arr.length];
}

export function demoRoster(): DemoStudent[] {
  const rows: DemoStudent[] = [];
  let n = 1001;
  DEMO_CLASSES.forEach((cls, ci) => {
    const [base, stream] = cls.split(" · ");
    const count = ci === 0 ? 34 : ci === 4 ? 28 : 30;
    for (let i = 0; i < count; i++) {
      const female = (i + ci) % 2 === 0;
      const year = base.startsWith("Grade 5") ? 2015 : base.startsWith("Grade 7") ? 2013 : base.startsWith("Grade 8") ? 2012 : 2011;
      rows.push({
        admNo: `KB${n++}`,
        name: `${female ? pick(FIRST_F, i, ci) : pick(FIRST_M, i, ci)} ${pick(LAST, i + 3, ci)}`,
        sex: female ? "F" : "M",
        className: base,
        stream,
        dob: `${year}-${String(((i * 5 + ci) % 11) + 1).padStart(2, "0")}-${String(((i * 3 + ci * 2) % 27) + 1).padStart(2, "0")}`,
        parentName: female ? pick(PARENT_F, i, ci) : pick(PARENT_M, i, ci),
        parentPhone: `07${String(10000000 + ((i * 7919 + ci * 104729) % 89999999))}`
      });
    }
  });
  return rows;
}

export const GRADE5_SUBJECTS = ["English", "Kiswahili", "Mathematics", "Science & Technology", "Social Studies", "Agriculture", "Home Science", "Religious Education", "Creative Arts", "PHE"];

export const JSS_SUBJECTS = ["English", "Kiswahili", "Mathematics", "Integrated Science", "Social Studies", "Religious Education", "Pre-Technical Studies", "Agriculture", "Business Studies", "Creative Arts & Sports", "Health Education"];

export function abilityOf(admNo: string): number {
  let h = 0;
  for (let i = 0; i < admNo.length; i++) h = (h * 31 + admNo.charCodeAt(i)) % 1000;
  return 42 + (h % 48);
}

export interface DemoScore { admNo: string; subject: string; score: number; perf: string; }

export function demoScores(): DemoScore[] {
  const out: DemoScore[] = [];
  for (const s of demoRoster()) {
    const subjects = s.className.startsWith("Grade 5") ? GRADE5_SUBJECTS : JSS_SUBJECTS;
    const ability = abilityOf(s.admNo);
    subjects.forEach((subject, si) => {
      const wobble = ((s.admNo.charCodeAt(2) + si * 11) % 17) - 8;
      const score = Math.max(28, Math.min(98, ability + wobble));
      out.push({ admNo: s.admNo, subject, score, perf: score >= 80 ? "EE" : score >= 60 ? "ME" : score >= 40 ? "AE" : "BE" });
    });
  }
  return out;
}
