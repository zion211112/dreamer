// The school's own data: the roll (students) and scores (assessments).
// Shapes, parsing, and the JSON backup. The "how much is there yet" answer
// the console header shows comes from here, not from a copy in a page.

import { idbAll, idbBulkPut, idbClear } from "./db";

export interface Student {
  id: string;
  admNo: string;
  name: string;
  sex: string; // "M" | "F" | ""
  className: string; // "Form 1"
  stream: string; // "" when the class has no streams
  dob: string;
  parentName: string;
  parentPhone: string;
}

export interface Assessment {
  key: string; // exam|studentId|subject — upserts replace, no duplicates
  exam: string;
  studentId: string;
  subject: string;
  score: number;
  max: number;
}

export function scoreKey(exam: string, studentId: string, subject: string): string {
  return [exam, studentId, subject].join("|");
}

export function emptyStudent(): Omit<Student, "id"> {
  return {
    admNo: "",
    name: "",
    sex: "",
    className: "",
    stream: "",
    dob: "",
    parentName: "",
    parentPhone: ""
  };
}

export function studentId(admNo: string, name: string, className: string): string {
  if (admNo.trim()) return `STU-${admNo.trim().toUpperCase()}`;
  const slug = `${name.trim()} ${className.trim()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `STU-${slug || Date.now().toString(36)}`;
}

/* ------------------------------------------------------------------ */
/* Roster CSV: auto column mapping. KPLIS-flavoured headers first,   */
/* then positional fallback. Tabs and commas both parse.            */
/* ------------------------------------------------------------------ */

export interface ParsedRosterRow {
  student: Omit<Student, "id">;
  dupe: boolean; // same id already on the roll
  raw: string;
}

export interface RosterParse {
  rows: ParsedRosterRow[];
  notes: string[];
}

const HEADER_ALIASES: Record<string, string[]> = {
  admNo: ["adm no", "admno", "admission", "adm", "reg no", "index"],
  name: ["name", "full name", "student"],
  sex: ["sex", "gender"],
  className: ["class", "grade", "form", "class name"],
  stream: ["stream", "division", "section"],
  dob: ["dob", "date of birth", "birth"],
  parentName: ["parent", "parent name", "guardian", "guardian name"],
  parentPhone: ["phone", "parent phone", "guardian phone", "tel", "telno"]
};

function splitLine(line: string, delim: string): string[] {
  // Minimal quoted-field handling: "a,b" stays one field.
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseRosterCsv(text: string, existing: Student[]): RosterParse {
  const notes: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return { rows: [], notes };

  const delim = lines[0].includes("\t") ? "\t" : ",";
  const existingIds = new Set(existing.map((s) => s.id));

  // Header row?
  const head = splitLine(lines[0], delim).map((h) => h.toLowerCase());
  const looksLikeHeader = head.some((h) =>
    Object.values(HEADER_ALIASES)
      .flat()
      .some((a) => h.includes(a))) && !/^\d+$/.test(head[0] || "");

  let map: (keyof Omit<Student, "id"> | null)[];
  let start = 0;
  if (looksLikeHeader) {
    start = 1;
    map = head.map((h) => {
      for (const [field, aliases] of Object.entries(HEADER_ALIASES))
        if (aliases.some((a) => h === a || h.includes(a))) return field as keyof Omit<Student, "id">;
      return null;
    });
  } else {
    // Positional: Adm No, Name, Sex, Class, Stream, DOB, Parent, Phone
    map = ["admNo", "name", "sex", "className", "stream", "dob", "parentName", "parentPhone"].map(
      (f) => f as keyof Omit<Student, "id">
    );
    notes.push("No header row found — columns read as Adm No, Name, Sex, Class, Stream, DOB, Parent, Phone.");
  }

  const rows: ParsedRosterRow[] = [];
  for (let i = start; i < lines.length; i++) {
    const cells = splitLine(lines[i], delim);
    const s = emptyStudent();
    map.forEach((field, idx) => {
      if (field !== null && cells[idx] !== undefined) (s as Record<string, string>)[field] = cells[idx].slice(0, 40);
    });
    if (!s.name && !s.admNo) continue; // blank or junk line
    const id = studentId(s.admNo, s.name, s.className);
    rows.push({
      student: { ...s, sex: s.sex === "M" || s.sex === "F" ? s.sex[0] : s.sex },
      dupe: existingIds.has(id),
      raw: lines[i]
    });
  }
  return { rows, notes };
}

export const SAMPLE_ROSTER = `Adm No,Name,Sex,Class,Stream,DOB,Parent,Phone
A1001,Amina Wanjiru,F,Form 1,,2010-04-12,Mercy Wanjiru,0712345678
A1002,Brian Otieno,M,Form 1,Science,2010-07-01,Daniel Otieno,0723456789
A1003,Cynthia Njoroge,F,Form 1,Humanities,2010-09-18,Grace Njoroge,0734567890
A1004,Davis Mwangi,M,Form 2,Science,2009-05-25,John Mwangi,0745678901
A1005,Ezra Kiptoo,M,Form 2,,2009-11-02,Susan Kiptoo,0756789012`;

/* ------------------------------------------------------------------ */
/* Readiness: what is actually here on this device. The console header */
/* and the empty states read this — one answer, everywhere.           */
/* ------------------------------------------------------------------ */

export interface Readiness {
  students: number;
  scores: number;
  scored: number;
  pct: number;
  next: string; // the one action that unblocks the most
}

export function readiness(students: Student[], assessments: Assessment[]): Readiness {
  if (students.length === 0)
    return { students: 0, scores: 0, scored: 0, pct: 0, next: "Import the roster to open the console" };
  const known = new Set(students.map((s) => s.id));
  const scored = new Set(assessments.filter((a) => known.has(a.studentId)).map((a) => a.studentId));
  const pct = Math.round((scored.size / students.length) * 100);
  const next =
    assessments.length === 0
      ? "Enter scores to open Term Reports and Grade Forecast"
      : pct < 100
        ? `${scored.size} of ${students.length} students have scores`
        : "All tools open — every student has scores";
  return { students: students.length, scores: assessments.length, scored: scored.size, pct, next };
}

/* ------------------------------------------------------------------ */
/* Backup: the whole school rolls off this device as one JSON file.  */
/* This is the story until a backend exists — a USB stick moves a    */
/* school between devices.                                             */
/* ------------------------------------------------------------------ */

export interface SchoolDump {
  v: 1;
  school: string;
  exportedAt: string;
  students: Student[];
  assessments: Assessment[];
}

export function dumpSchool(school: string, students: Student[], assessments: Assessment[]): string {
  return JSON.stringify({ v: 1, school, exportedAt: new Date().toISOString(), students, assessments }, null, 2);
}

export function loadDump(raw: string): { students: Student[]; assessments: Assessment[] } | null {
  try {
    const d = JSON.parse(raw) as SchoolDump;
    if (!Array.isArray(d.students) || !Array.isArray(d.assessments)) return null;
    const students = d.students.filter((s) => s && typeof s.id === "string" && typeof s.name === "string");
    const assessments = d.assessments.filter((a) => a && typeof a.key === "string" && typeof a.studentId === "string");
    return { students, assessments };
  } catch {
    return null;
  }
}

export async function replaceSchool(students: Student[], assessments: Assessment[]): Promise<void> {
  await idbClear("students");
  await idbClear("assessments");
  await idbBulkPut("students", students);
  await idbBulkPut("assessments", assessments);
}

export async function loadStudents(): Promise<Student[]> {
  const list = await idbAll<Student>("students");
  return list.sort((a, b) => (a.className + a.name).localeCompare(b.className + b.name));
}

export async function loadAssessments(): Promise<Assessment[]> {
  return idbAll<Assessment>("assessments");
}

