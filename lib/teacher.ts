// Tool 10 — the Teacher Console: the teacher's own desk. Three zones on
// one screen, in the posture the plan keeps repeating — teacher lighter:
//   PLAN   evidence-based lesson plans, seeded + the teacher's own, each
//          written as the five-line scaffold (intention, inputs, activity,
//          evidence, adjustment) the Content Studio audits.
//   DROP   link-drop assignments: a task, a due line, an optional mark
//          key — copied out as a clean WhatsApp message. Marking the
//          returns is Auto-Marking's job (tool 7); this desk hands it the
//          key.
//   LISTEN Pilot 1: what the parents answered on /digest, aggregated on
//          this device — the console and the digest facing each other.
// Custom plans and drops live in the IndexedDB "meta" store, next to the
// Auto-Marking scheme. Nothing leaves the device.

import { idbAll, idbPut } from "./db";

/* ------------------------------------------------------------------ */
/* Zone 1 · PLAN — the five-line lesson scaffold.                      */
/* ------------------------------------------------------------------ */

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  gradeBand: string;
  minutes: number;
  intention: string; // what the lesson exists to do
  inputs: string; // what the learner brings, and what you bring
  activity: string; // the sequence
  evidence: string; // how you will know it landed
  adjustment: string; // where you flex when it does not
  source: "seed" | "teacher";
  createdAt: string;
}

// The seeded library: burnout relief. Each plan is written around one
// named misconception — the same ones the Content Studio's sample items
// are built to elicit, so the desk and the atelier share one diagnosis.
export const SEED_LESSONS: LessonPlan[] = [
  {
    id: "seed-l1",
    title: "Fractions live on a whole — comparing them needs the same pie",
    subject: "Mathematics",
    gradeBand: "Upper 2",
    minutes: 40,
    intention:
      "Before any comparison, fix the idea that a fraction is a part of a particular whole. Two fractions of different wholes cannot be compared.",
    inputs:
      "Learners bring number-line instinct and whole-number comparison. You bring paper strips of two different lengths — the unequal wholes are the material, not a mistake.",
    activity:
      "Open with ½ of a strip versus ½ of a shorter strip: equal fractions, unequal lengths. Let the contradiction sit. Then pairs build equal wholes and compare ⅓ and ¼ on them. Close with each learner writing one pair they cannot compare and why.",
    evidence:
      "Every learner writes one justified non-comparison in their book. Two learners explain the whole aloud to the class without you answering anything.",
    adjustment:
      "If the whole is shaky, stop — do not move on to common denominators. Re-run the strip station in small groups and book the comparison for next time.",
    source: "seed",
    createdAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "seed-l2",
    title: "Reading for the question, not the word — comprehension before vocabulary",
    subject: "English",
    gradeBand: "Upper 3",
    minutes: 45,
    intention:
      "Break the habit of decoding vocabulary in isolation. Learners read to answer a question they chose, so understanding carries the words.",
    inputs:
      "Learners bring the term's text and a fear of 'unknown words'. You bring one unfamiliar text with a wall of new words and zero glossary.",
    activity:
      "Learners pick one question from the text first. Read the text once, silently, to answer only that question. Pair-explain the answer in two lines; mark it against the text. Finally, the class lists the words that actually mattered — almost none of the scary ones.",
    evidence:
      "The two-line answer quotes the text. The class list shows 90% of flagged words as irrelevant to their questions.",
    adjustment:
      "If pairs stall, the question is too wide — halve it. If flying high, add a second question that forces a reread of a different section.",
    source: "seed",
    createdAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "seed-l3",
    title: "Two leaves, different sun — the sealed-day transpiration lab",
    subject: "Integrated Science",
    gradeBand: "Upper 2",
    minutes: 50,
    intention:
      "Learners predict which plant wilts first on a sealed, dark day and defend it. The misconception under attack: bigger leaf = more water held.",
    inputs:
      "Two potted plants with different leaf sizes, one sealed bag each. Learners bring the water-cycle vocabulary; you bring the prediction sheet.",
    activity:
      "Predict in pairs, written, with a reason. Seal both setups. Walk the evidence: transpiration stops without light; the bigger leaf was losing the most. Read back to the predictions and name what the data did to them.",
    evidence:
      "A written prediction plus a written revision when the evidence contradicts it. The revision is the mark that counts.",
    adjustment:
      "No plants? The drawer-version: two glass jars, one with a leaf, sealed, a dark corner. The logic holds without the pot.",
    source: "seed",
    createdAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "seed-l4",
    title: "The doubling trap — work backwards before forwards",
    subject: "Mathematics",
    gradeBand: "Grade 7–9",
    minutes: 35,
    intention:
      "Kill the 'doubling three times is ×3' trap. Learners feel backwards-working as a first tool, not a last resort.",
    inputs:
      "Learners bring repeated multiplication; you bring one riddle: a trader doubled her stock three times and now has 80 — how did she start?",
    activity:
      "Solve forward: everyone gets 80 × 3 = 240 (the trap, on purpose). Then reverse one doubling at a time, aloud, on the board: 80 → 40 → 20 → 10. Each learner writes the chain for a new start-value you call out.",
    evidence:
      "The chain written one halving per doubling. '80 × 3' alone earns nothing — the trap is named in the notes.",
    adjustment:
      "If halving is shaky, use money: KES 80 notes halved. Money never lies about doubling.",
    source: "seed",
    createdAt: "2026-09-01T00:00:00.000Z"
  }
];

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyLesson(): Omit<LessonPlan, "id" | "source" | "createdAt"> {
  return {
    title: "",
    subject: "",
    gradeBand: "Upper 3",
    minutes: 40,
    intention: "",
    inputs: "",
    activity: "",
    evidence: "",
    adjustment: ""
  };
}

/* ------------------------------------------------------------------ */
/* Zone 2 · DROP — the link-drop assignment.                          */
/* ------------------------------------------------------------------ */

// One mark-key line: the topic it traces to, the answer, the marks. Same
// shape Auto-Marking grades against, so a drop's key lands in tool 7 as is.
export interface SchemeLine {
  topic: string;
  answer: string;
  marks: number;
}

export interface TeacherTask {
  id: string;
  title: string;
  subject: string;
  task: string; // the assignment body, in the teacher's own words
  due: string; // free line: "Thursday 18:00"
  scheme: SchemeLine[]; // empty is fine — not every drop is marked
  status: "draft" | "dropped" | "marked";
  createdAt: string;
  updatedAt: string;
}

export function emptyTask(): Omit<TeacherTask, "id" | "status" | "createdAt" | "updatedAt"> {
  return { title: "", subject: "", task: "", due: "", scheme: [] };
}

export function schemeTotal(scheme: SchemeLine[]): number {
  return scheme.reduce((n, l) => n + (l.marks || 0), 0);
}

// The drop message: what the teacher pastes into WhatsApp. Plain, warm,
// no marketing. The key goes to Auto-Marking, not to the parent.
export function taskMessage(t: TeacherTask, school: string): string {
  const key =
    t.scheme.length > 0
      ? `Mark key: ${t.scheme.length} item${t.scheme.length > 1 ? "s" : ""}, ${schemeTotal(t.scheme)} marks total — answers will be marked and the weak points come back.`
      : "Answers come back as notes, not marks.";
  return [
    `${school} · Assignment — ${t.subject || "General"}`,
    t.title,
    "",
    t.task,
    "",
    `Due: ${t.due || "not set"}`,
    key
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* Zone 3 · LISTEN — Pilot 1, read-only here. The aggregation lives   */
/* in lib/digest; this file only re-exposes the read.                  */
/* ------------------------------------------------------------------ */

export { aggregate, loadResponses } from "./digest";
export type { DigestResponse } from "./digest";

/* ------------------------------------------------------------------ */
/* Persistence: the meta store, next to the Auto-Marking scheme.       */
/* ------------------------------------------------------------------ */

const LESSONS_ID = "teacher-lessons";
const TASKS_ID = "teacher-tasks";

interface LessonDoc {
  id: string;
  lessons: LessonPlan[];
}
interface TaskDoc {
  id: string;
  tasks: TeacherTask[];
}

export async function loadCustomLessons(): Promise<LessonPlan[]> {
  const rows = await idbAll<Partial<LessonDoc>>("meta");
  return rows.find((m) => m.id === LESSONS_ID)?.lessons ?? [];
}

export function saveCustomLessons(lessons: LessonPlan[]): Promise<void> {
  return idbPut<LessonDoc>("meta", { id: LESSONS_ID, lessons });
}

// The desk's library = the seeded relief plans + the teacher's own.
export function lessonLibrary(custom: LessonPlan[]): LessonPlan[] {
  return [...SEED_LESSONS, ...custom];
}

export async function loadTasks(): Promise<TeacherTask[]> {
  const rows = await idbAll<Partial<TaskDoc>>("meta");
  const tasks = rows.find((m) => m.id === TASKS_ID)?.tasks ?? [];
  // newest first on the desk
  return tasks.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function saveTasks(tasks: TeacherTask[]): Promise<void> {
  return idbPut<TaskDoc>("meta", { id: TASKS_ID, tasks });
}

export function newTaskId(): string {
  return uid("tk");
}
export function newLessonId(): string {
  return uid("lp");
}
