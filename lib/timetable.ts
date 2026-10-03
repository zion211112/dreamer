// The approved timetable. Built in the Timetable Solver, printed for the
// wall, approved once — then Today + Plan read from it. Two CBC Lower
// Primary demos distilled from real wall grids sit underneath.
export interface TimetableTime {
  start: string;
  end: string;
  kind: "lesson" | "break" | "lunch" | "roll";
}
export interface WeeklyTimetable {
  name: string;
  className: string;
  times: TimetableTime[];
  cells: Record<string, string[]>;
}
export const WEEKDAYS = ["MON", "TUE", "WED", "THUR", "FRI"] as const;
export type Weekday = (typeof WEEKDAYS)[number];
const T = (start: string, end: string, kind: TimetableTime["kind"] = "lesson"): TimetableTime => ({ start, end, kind });
export const DEMO_CBC_LOWER: WeeklyTimetable = {
  name: "CBC Lower Primary · wall grid",
  className: "Grade 3",
  times: [T("08:20", "08:55"), T("08:55", "09:30"), T("09:30", "09:50", "break"), T("09:50", "10:25"), T("10:25", "11:00"), T("11:00", "11:30", "break"), T("11:30", "12:05"), T("12:05", "12:40"), T("12:40", "14:00", "lunch"), T("14:00", "14:35")],
  cells: {
    MON: ["ENGLISH", "MATHS", "B", "IND LANG", "MOVEMENT ACTIVITIES", "B", "RELIGIOUS EDUCATION", "ENVIRONMENTAL ACTIVITIES", "L", ""],
    TUE: ["MATHS", "KISWAHILI", "R", "ENGLISH", "MOVEMENT ACTIVITIES", "R", "ENVIRONMENTAL ACTIVITIES", "RELIGIOUS EDUCATION", "U", ""],
    WED: ["ENGLISH", "MATHS", "E", "KISWAHILI", "MOVEMENT ACTIVITIES", "E", "CREATIVE (MUSIC)", "ENVIRONMENTAL ACTIVITIES", "N", "IND LANG"],
    THUR: ["MATHS", "KISWAHILI", "A", "ENGLISH", "MOVEMENT ACTIVITIES", "A", "ENVIRONMENTAL ACTIVITIES", "RELIGIOUS EDUCATION", "C", ""],
    FRI: ["PPI", "ENGLISH", "K", "MATHS", "MOVEMENT ACTIVITIES", "K", "KISWAHILI", "CREATIVE (Art & Craft)", "H", ""]
  }
};
export const DEMO_GRADE_123: WeeklyTimetable = {
  name: "Grade 1–3 · appendix grid",
  className: "Grade 2",
  times: [T("08:00", "08:20", "roll"), T("08:20", "08:50"), T("08:50", "09:20"), T("09:20", "09:30", "break"), T("09:30", "10:00"), T("10:00", "10:30"), T("10:30", "11:00", "break"), T("11:00", "11:30"), T("11:30", "12:00"), T("12:30", "13:30", "lunch")],
  cells: {
    MON: ["HEALTH CHECK & ROLL CALL", "INDIGENOUS LANGUAGE", "CREATIVE ACTIVITIES", "—", "ENGLISH LANGUAGE", "MATHEMATICAL ACTIVITIES", "—", "RELIGIOUS EDUCATION", "ENVIRONMENTAL ACTIVITIES", "LUNCH BREAK"],
    TUE: ["HEALTH CHECK & ROLL CALL", "KISWAHILI LANGUAGE", "MATHEMATICAL ACTIVITIES", "—", "ENGLISH LANGUAGE", "CREATIVE ACTIVITIES", "—", "INDIGENOUS LANGUAGE", "CREATIVE ACTIVITIES", "LUNCH BREAK"],
    WED: ["HEALTH CHECK & ROLL CALL", "ENGLISH LANGUAGE", "RELIGIOUS EDUCATION", "—", "MATHEMATICAL ACTIVITIES", "CREATIVE ACTIVITIES", "—", "KISWAHILI LANGUAGE", "ENVIRONMENTAL ACTIVITIES", "LUNCH BREAK"],
    THUR: ["HEALTH CHECK & ROLL CALL", "MATHEMATICAL ACTIVITIES", "CREATIVE ACTIVITIES", "—", "ENVIRONMENTAL ACTIVITIES", "KISWAHILI LANGUAGE", "—", "ENGLISH LANGUAGE", "CREATIVE ACTIVITIES", "LUNCH BREAK"],
    FRI: ["PPI", "ENGLISH LANGUAGE", "ENVIRONMENTAL ACTIVITIES", "—", "KISWAHILI LANGUAGE", "CREATIVE ACTIVITIES", "—", "MATHEMATICAL ACTIVITIES", "RELIGIOUS EDUCATION", "LUNCH BREAK"]
  }
};
// A senior school week, the shape a Form 2 wall grid actually takes:
// early bells, two short breaks, a long lunch, subjects in KICD order.
export const DEMO_FORM_2: WeeklyTimetable = {
  name: "Form 2 · Kenya",
  className: "Form 2",
  times: [T("07:40", "08:30"), T("08:30", "09:20"), T("09:20", "09:40", "break"), T("09:40", "10:30"), T("10:30", "11:20"), T("11:20", "11:40", "break"), T("11:40", "12:30"), T("12:30", "13:10"), T("13:10", "14:10", "lunch"), T("14:10", "15:00")],
  cells: {
    MON: ["ENGLISH", "MATHS", "B", "PHYSICS", "KISWAHILI", "B", "CHEMISTRY", "BIOLOGY", "L", "CRE"],
    TUE: ["MATHS", "PHYSICS", "B", "ENGLISH", "CHEMISTRY", "B", "KISWAHILI", "MATHS", "L", "PHE"],
    WED: ["ENGLISH", "CHEMISTRY", "B", "MATHS", "PHYSICS", "B", "BIOLOGY", "ICT", "L", "CRE"],
    THUR: ["KISWAHILI", "MATHS", "B", "PHYSICS", "ENGLISH", "B", "CHEMISTRY", "BIOLOGY", "L", "PHE"],
    FRI: ["SBA PRACTICAL", "ENGLISH", "B", "MATHS", "CRE", "B", "ICT", "KISWAHILI", "L", "SCHOOL PROGRAMME"]
  }
};

export const DEMO_TIMETABLES: WeeklyTimetable[] = [DEMO_CBC_LOWER, DEMO_GRADE_123, DEMO_FORM_2];

/* ------------------------------------------------------------------ */
/* Colour and calendar — the two things that make the week readable   */
/* ------------------------------------------------------------------ */

// A subject is always the same colour, everywhere in the console: one
// deterministic hash into a ten-colour muted palette. No config, no drift.
export const SUBJECT_PALETTE = [
  "#d4a53c", // gold (the house colour)
  "#4ea1d8",
  "#5fbf9f",
  "#d87a6e",
  "#a684d8",
  "#d8c25f",
  "#6fb3d8",
  "#c97bd8",
  "#8fbf6f",
  "#d88f6f"
];

export function subjectTint(name: string): string {
  const s = name.trim().toUpperCase();
  if (s === "" || s === "—" || s === "LUNCH" || s === "BREAK" || s === "ROLL CALL") return "";
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return SUBJECT_PALETTE[h % SUBJECT_PALETTE.length];
}

// Monday-first month grid — what the calendar view lays the week out on.
export function monthWeeks(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(year, month, 1 - startOffset);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(gridStart);
      dt.setDate(gridStart.getDate() + w * 7 + d);
      row.push(dt);
    }
    weeks.push(row);
  }
  return weeks;
}

/** 0 = MON … 4 = FRI, 5/6 = weekend. JS is Sunday-first; the school is not. */
export function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}
const APPROVED_KEY = "aptlabs.timetable.approved.v1";
export function loadApprovedTimetable(): WeeklyTimetable | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(APPROVED_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as WeeklyTimetable;
    if (!t || !Array.isArray(t.times) || !t.cells) return null;
    return t;
  } catch { return null; }
}
export function saveApprovedTimetable(t: WeeklyTimetable): void {
  try { window.localStorage.setItem(APPROVED_KEY, JSON.stringify(t)); } catch { /* memory-only */ }
}
export function clearApprovedTimetable(): void {
  try { window.localStorage.removeItem(APPROVED_KEY); } catch { /* noop */ }
}
const FURNITURE = new Set(["", "—", "-", "B", "R", "E", "A", "K", "L", "U", "N", "C", "H"]);
export function isTeachingCell(value: string, kind: TimetableTime["kind"]): boolean {
  const v = value.trim();
  if (FURNITURE.has(v)) return false;
  if (kind !== "lesson" && kind !== "roll") return false;
  if (/^lunch/i.test(v) || /^health break/i.test(v)) return false;
  return v !== "";
}
export function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bCbc\b/, "CBC").replace(/\bPpi\b/, "PPI");
}
export function subjectsInTimetable(t: WeeklyTimetable): string[] {
  const set = new Set<string>();
  for (const day of WEEKDAYS) {
    const row = t.cells[day] ?? [];
    t.times.forEach((slot, i) => {
      const v = (row[i] ?? "").trim();
      if (isTeachingCell(v, slot.kind)) set.add(titleCase(v));
    });
  }
  return [...set].sort();
}
export function weekdayKey(d = new Date()): Weekday {
  const n = d.getDay();
  if (n === 0 || n === 6) return "MON";
  return WEEKDAYS[n - 1] as Weekday;
}
export interface TimetableLesson { time: string; subject: string; className: string; }
export function lessonsForDay(t: WeeklyTimetable, day: string): TimetableLesson[] {
  const row = t.cells[day] ?? [];
  const out: TimetableLesson[] = [];
  t.times.forEach((slot, i) => {
    const raw = (row[i] ?? "").trim();
    if (!isTeachingCell(raw, slot.kind)) return;
    out.push({ time: slot.start, subject: titleCase(raw), className: t.className });
  });
  return out.sort((a, b) => (a.time < b.time ? -1 : 1));
}
export function prettyTime(hhmm: string): string {
  const parts = hhmm.split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h)) return hhmm;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ":" + String(m).padStart(2, "0") + " " + ap;
}
export function prettyRange(slot: TimetableTime): string {
  return prettyTime(slot.start) + " – " + prettyTime(slot.end);
}
