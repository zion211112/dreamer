// The Kenyan curriculum, encoded — CBE/CBC learning areas per level, the
// weekly lesson load a wall timetable carries, and the working day a
// timetable designer must fit lessons into. Sourced from the KICD
// curriculum designs and the wall grids Kenyan schools actually hang.

export interface LearningArea {
  name: string;
  short: string;
  lessons: number; // periods per week on a typical wall grid
}

export interface SchoolLevel {
  id: string;
  label: string;
  classes: string[];
  areas: LearningArea[];
}

function A(name: string, lessons: number, short?: string): LearningArea {
  return { name, short: short ?? name, lessons };
}

export const CURRICULUM: SchoolLevel[] = [
  {
    id: "pp",
    label: "Pre-Primary (PP1–PP2)",
    classes: ["PP1", "PP2"],
    areas: [
      A("Language Activities", 5, "Lang"),
      A("Mathematical Activities", 5, "Maths"),
      A("Environmental Activities", 4, "Env"),
      A("Psychomotor & Creative", 5, "Creative"),
      A("Religious Education", 3, "RE"),
      A("Pastoral Instruction (PPI)", 1, "PPI")
    ]
  },
  {
    id: "lower",
    label: "Lower Primary (Grade 1–3)",
    classes: ["Grade 1", "Grade 2", "Grade 3"],
    areas: [
      A("Literacy", 5),
      A("Kiswahili", 4),
      A("English", 5),
      A("Indigenous Language", 2, "Ind Lang"),
      A("Mathematics", 5, "Maths"),
      A("Environmental Activities", 5, "Env"),
      A("Hygiene & Nutrition", 3, "Hygiene"),
      A("Religious Education", 3, "RE"),
      A("Movement & Creative", 5, "Creative"),
      A("Pastoral Instruction (PPI)", 1, "PPI")
    ]
  },
  {
    id: "upper",
    label: "Upper Primary (Grade 4–6)",
    classes: ["Grade 4", "Grade 5", "Grade 6"],
    areas: [
      A("English", 5),
      A("Kiswahili", 4),
      A("Mathematics", 5, "Maths"),
      A("Science & Technology", 4, "Sci & Tech"),
      A("Social Studies", 3, "SST"),
      A("Agriculture", 2, "Agri"),
      A("Home Science", 2, "Home Sci"),
      A("Religious Education", 3, "RE"),
      A("Creative Arts", 3),
      A("Physical & Health Education", 3, "PHE"),
      A("Pastoral Instruction (PPI)", 1, "PPI")
    ]
  },
  {
    id: "jss",
    label: "Junior Secondary (Grade 7–9)",
    classes: ["Grade 7", "Grade 8", "Grade 9"],
    areas: [
      A("English", 5),
      A("Kiswahili", 4),
      A("Mathematics", 5, "Maths"),
      A("Integrated Science", 5, "Int Sci"),
      A("Social Studies", 3, "SST"),
      A("Religious Education", 3, "RE"),
      A("Pre-Technical Studies", 4, "Pre-Tech"),
      A("Agriculture", 3, "Agri"),
      A("Business Studies", 3, "Business"),
      A("Creative Arts & Sports", 3, "Arts"),
      A("Health Education", 2, "Health"),
      A("Life Skills", 1),
      A("Pastoral Instruction (PPI)", 1, "PPI")
    ]
  },
  {
    id: "sec",
    label: "Senior Secondary (Form 1–4)",
    classes: ["Form 1", "Form 2", "Form 3", "Form 4"],
    areas: [
      A("English", 5),
      A("Kiswahili", 4),
      A("Mathematics", 5, "Maths"),
      A("Biology", 4, "Bio"),
      A("Chemistry", 4, "Chem"),
      A("Physics", 4, "Phy"),
      A("History & Government", 3, "Hist"),
      A("Geography", 3, "Geo"),
      A("CRE / IRE / HRE", 3, "RE"),
      A("Business Studies", 3, "Business"),
      A("Agriculture", 3, "Agri"),
      A("Computer Studies", 2, "Comp"),
      A("Pastoral Instruction (PPI)", 1, "PPI")
    ]
  }
];

export function levelForClass(className: string): SchoolLevel {
  const found = CURRICULUM.find((l) => l.classes.some((c) => className.startsWith(c)));
  return found ?? CURRICULUM[3];
}

// A standard Kenyan school day: 8 periods Mon–Thu, 6 on Friday after lunch
// for games/PPI, with the two breaks and lunch named the way wall grids
// name them. The timetable designer seeds from this.
export interface DaySlot {
  start: string;
  end: string;
  kind: "lesson" | "break" | "lunch" | "games" | "assembly";
  label?: string;
}

export const TYPICAL_DAY: DaySlot[] = [
  { start: "08:00", end: "08:20", kind: "assembly", label: "ASSEMBLY / ROLL" },
  { start: "08:20", end: "09:00", kind: "lesson" },
  { start: "09:00", end: "09:40", kind: "lesson" },
  { start: "09:40", end: "10:20", kind: "lesson" },
  { start: "10:20", end: "10:50", kind: "break", label: "BREAK" },
  { start: "10:50", end: "11:30", kind: "lesson" },
  { start: "11:30", end: "12:10", kind: "lesson" },
  { start: "12:10", end: "12:50", kind: "lesson" },
  { start: "12:50", end: "14:00", kind: "lunch", label: "LUNCH" },
  { start: "14:00", end: "14:40", kind: "lesson" },
  { start: "14:40", end: "15:20", kind: "lesson" }
];

export const FRIDAY_GAMES = ["FOOTBALL", "NETBALL", "ATHLETICS", "DRAMA", "MUSIC", "SCOUTING"];

export const CBC_PERFORMANCE = ["EE", "ME", "AE", "BE"] as const;
export const CBC_PERF_LABEL: Record<string, string> = {
  EE: "Exceeding Expectation",
  ME: "Meeting Expectation",
  AE: "Approaching Expectation",
  BE: "Below Expectation"
};

export const CBC_ASSESS = ["Class Activity", "Oral", "Practical", "Project", "Written", "Observation"];
