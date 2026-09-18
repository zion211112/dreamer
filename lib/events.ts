// The day-layer ledger. Every action a teacher takes in My Day — marking a
// register, entering a score, noting a concern, messaging a guardian — is
// one append-only event in the "events" store. Nothing downstream re-stores
// it: Term Reports, Grade Forecast and Auto-Marking keep their own stores;
// events are the day, reports stay the term.
//
// Local-first like everything else in the console: the events live in
// IndexedDB on the device, next to the roll. Nothing leaves the browser.
//
// The teacher's pinned classes live here too (a "meta" doc) — the honest
// stand-in for a timetable until the Timetable Solver ships. My Day does
// not invent a schedule; the teacher declares their classes once and the
// desk is built on that.

import { idbAll, idbPut } from "./db";
import { Assessment, Student } from "./school";

export type DayEventType = "attendance" | "grade" | "note" | "message";

export interface DayEvent {
  id: string;
  ts: string; // ISO timestamp
  type: DayEventType;
  studentId: string;
  studentName: string;
  className: string;
  teacher: string;
  // attendance: "present" | "absent" · grade: "75/100 Algebra" ·
  // note / message: the body or a preview.
  text: string;
}

export function newEventId(): string {
  return `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function loadEvents(): Promise<DayEvent[]> {
  const rows = await idbAll<DayEvent>("events");
  return rows.sort((a, b) => (a.ts < b.ts ? 1 : -1)); // newest first
}

export function saveEvent(e: DayEvent): Promise<void> {
  return idbPut("events", e);
}

export function makeEvent(
  type: DayEventType,
  s: Student,
  teacher: string,
  text: string
): DayEvent {
  return {
    id: newEventId(),
    ts: new Date().toISOString(),
    type,
    studentId: s.id,
    studentName: s.name,
    className: [s.className, s.stream].filter(Boolean).join(" "),
    teacher,
    text
  };
}

/* ------------------------------------------------------------------ */
/* Pinned classes — the honest timetable.                              */
/* ------------------------------------------------------------------ */

const CLASSES_ID = "teacher-classes";

interface ClassesDoc {
  id: string;
  classes: string[];
}

export async function loadTeacherClasses(): Promise<string[]> {
  const rows = await idbAll<Partial<ClassesDoc>>("meta");
  return rows.find((m) => m.id === CLASSES_ID)?.classes ?? [];
}

export function saveTeacherClasses(classes: string[]): Promise<void> {
  return idbPut<ClassesDoc>("meta", { id: CLASSES_ID, classes: [...new Set(classes)] });
}

// ── Day plan ─────────────────────────────────────────────────────────────
// The teacher's honest timetable. My Day never invents one — it renders
// exactly what the teacher declared, and shows nothing when the day is empty.
// Every lesson carries the same three actions (attendance, grades, notes).

export interface Lesson {
  id: string;
  time: string; // "08:00" — "" when the teacher hasn't fixed a slot
  className: string; // a class on the roll, or a free-form label (e.g. "Staff meeting")
  subject?: string;
  room?: string;
  teacher?: string;
}

const DAY_PLAN_ID = "teacher-day-plan";
interface DayPlanDoc {
  id: string;
  lessons: Lesson[];
}

export async function loadDayPlan(): Promise<Lesson[]> {
  const rows = await idbAll<Partial<DayPlanDoc>>("meta");
  const doc = rows.find((m) => m.id === DAY_PLAN_ID);
  return doc?.lessons ?? [];
}

export function saveDayPlan(lessons: Lesson[]): Promise<void> {
  return idbPut<DayPlanDoc>("meta", { id: DAY_PLAN_ID, lessons });
}

/* ------------------------------------------------------------------ */
/* Schedules — the mini calendar. Items live on specific dates (any    */
/* day of the month) and can be class lessons or personal; the         */
/* calendar flags the ones that collide in time. The week the teacher  */
/* plans lives here, not invented.                                     */
/* ------------------------------------------------------------------ */

export interface ScheduleItem {
  id: string;
  date: string; // local "YYYY-MM-DD"
  time: string; // "HH:MM" or "" for all-day
  title: string;
  kind: "class" | "personal";
  className?: string;
  subject?: string;
}

export interface Schedules {
  items: ScheduleItem[];
}

export function makeScheduleItem(
  date: string,
  time: string,
  title: string,
  kind: ScheduleItem["kind"],
  className = "",
  subject = ""
): ScheduleItem {
  return {
    id: `SCH-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    date,
    time,
    title,
    kind,
    className,
    subject
  };
}

const SCHEDULES_ID = "teacher-schedules";
interface SchedulesDoc {
  id: string;
  items: ScheduleItem[];
}

export async function loadSchedules(): Promise<Schedules> {
  const rows = await idbAll<Partial<SchedulesDoc>>("meta");
  const doc = rows.find((m) => m.id === SCHEDULES_ID);
  return { items: doc?.items ?? [] };
}

export function saveSchedules(s: Schedules): Promise<void> {
  return idbPut<SchedulesDoc>("meta", { id: SCHEDULES_ID, items: s.items });
}

// A class lesson occupies ~40 minutes. Two timed items on the same day
// collide when their windows overlap.
const SCHEDULE_SPAN_MS = 40 * 60 * 1000;
export function collisionsOn(items: ScheduleItem[], date: string): Set<string> {
  const timed = items
    .filter((i) => i.date === date && /^\d{1,2}:\d{2}$/.test(i.time))
    .map((i) => {
      const start = timeToMs(i.time, new Date(`${date}T00:00:00`).getTime());
      return { id: i.id, s: start, e: start + SCHEDULE_SPAN_MS };
    });
  const hit = new Set<string>();
  for (let a = 0; a < timed.length; a++)
    for (let b = a + 1; b < timed.length; b++)
      if (timed[a].s < timed[b].e && timed[b].s < timed[a].e) {
        hit.add(timed[a].id);
        hit.add(timed[b].id);
      }
  return hit;
}

/* ------------------------------------------------------------------ */
/* Timetable import: parse a pasted schedule into today's lessons.     */
/* Tolerant of "08:00  Maths  Form 4", "08:00-08:40 English | Form 8", */
/* "Period 1 — 08:00, Reading, Grade 5 X". No time → untimed.         */
/* ------------------------------------------------------------------ */

const CLASS_KEYWORDS = /^(form|grade|jss|junior|nursery|pre-?nursery|creche|kindergarten|kindy|primary)\s*/i;

export function parseTimetable(text: string): Lesson[] {
  const out: Lesson[] = [];
  const seen = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/(\d{1,2}):(\d{2})/);
    const time = m ? `${m[1].padStart(2, "0")}:${m[2]}` : "";
    const rest = line
      .replace(/\d{1,2}:\d{2}(?:\s*[-–—]\s*\d{1,2}:\d{2})?/g, " ")
      .replace(/^(?:period|pd|lesson|per)\s*\d*[\s:.\-–—]*/i, " ")
      .replace(/[\t|,]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const tokens = rest.split(" ").filter(Boolean);
    if (tokens.length === 0) continue;
    let ci = tokens.findIndex((t) => CLASS_KEYWORDS.test(t));
    let className = "";
    let subject = "";
    if (ci >= 0) {
      className = tokens.slice(ci).join(" ");
      subject = tokens.slice(0, ci).join(" ");
    } else {
      subject = tokens.join(" ");
    }
    const key = `${time}|${className}|${subject}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: `LES-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      time,
      className,
      subject,
      room: "",
      teacher: ""
    });
  }
  return out;
}

// ── Honest time + state helpers: read this device's ledger, never fake ──

// ISO instant for the start of the local day — the cutoff for "today".
export function todayStartIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// Events recorded since local midnight.
export function eventsSinceToday(events: DayEvent[]): DayEvent[] {
  const start = todayStartIso();
  return events.filter((e) => e.ts >= start);
}

// A class-level line, not attached to any learner (e.g. a note to a whole class).
export function makeClassNote(className: string, teacher: string, text: string): DayEvent {
  return {
    id: newEventId(),
    ts: new Date().toISOString(),
    type: "note",
    studentId: "",
    studentName: className,
    className,
    teacher,
    text
  };
}

// Does a "HH:MM" slot sit at or before right now (same local day)?
export function isTimePast(time: string, nowMs: number): boolean {
  if (!/^\d{1,2}:\d{2}$/.test(time)) return false;
  const [h, m] = time.split(":").map(Number);
  const slot = new Date(nowMs);
  slot.setHours(h, m, 0, 0);
  return nowMs >= slot.getTime();
}

// A lesson's "HH:MM" resolved to a timestamp on the local day — for sorting.
export function timeToMs(time: string, nowMs: number): number {
  if (!/^\d{1,2}:\d{2}$/.test(time)) return nowMs + 86_400_000; // untimed sorts last
  const [h, m] = time.split(":").map(Number);
  const d = new Date(nowMs);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

/* ------------------------------------------------------------------ */
/* Queries the desk reads. Pure functions — no store access, so they   */
/* are trivial to test and cheap to recompute on render.               */
/* ------------------------------------------------------------------ */

export function classLabel(s: Student): string {
  return [s.className, s.stream].filter(Boolean).join(" ") || "Unassigned";
}

export function eventsForStudent(events: DayEvent[], studentId: string): DayEvent[] {
  return events.filter((e) => e.studentId === studentId);
}

export function absencesSince(events: DayEvent[], sinceIso: string): DayEvent[] {
  return events.filter((e) => e.type === "attendance" && e.text === "absent" && e.ts >= sinceIso);
}

export function notesSince(events: DayEvent[], sinceIso: string): DayEvent[] {
  return events.filter((e) => e.type === "note" && e.ts >= sinceIso);
}

export function startOfWeek(): string {
  const d = new Date();
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1; // Monday = start
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

// Students in a class with no score recorded at all — the alert that
// matters most, and the one that is always honest because it is a pure
// set difference over the roll.
export function unmarkedInClass(
  students: Student[],
  assessments: Assessment[],
  className: string
): Student[] {
  const cls = students.filter((s) => s.className === className);
  const scored = new Set(assessments.map((a) => a.studentId));
  return cls.filter((s) => !scored.has(s.id));
}

export function classesOnRoll(students: Student[]): string[] {
  return [...new Set(students.map((s) => s.className).filter(Boolean))].sort();
}