// The mark engine. Auto-Marking's scoring, pulled out of the component so
// it is testable and has one honest seam for the model:
//
//   gradeAnswer(question, raw, grader)
//     rule grader (default): exact match or keyword credit, fully
//     deterministic — the same answer always marks the same.
//     model grader (seam):   an implementation of GradingModel grades
//     free-text against the scheme. Nothing here ships one today; when the
//     lab's model is wired in, plug it into the same call site. No dead
//     branches: the seam is a parameter, not a TODO.
//
// The batch path is what a scanned-paper workflow needs: a list of
// "papers" (student + raw answers), the scheme, out per-student results.
// Paper extraction (OCR of a scan) is a GradingModel-shaped problem too —
// extractAnswers is the rule version, and a model can replace it the same
// way.

export interface SchemeQ {
  id: string;
  topic: string;
  answer: string;
  marks: number;
  /** Optional any-of phrases. A raw answer containing any earns full marks;
   *  containing none but sharing 50%+ of the answer's words earns half. */
  keywords?: string[];
}

export interface PaperRow {
  studentId: string;
  studentName: string;
  raw: Record<string, string>; // question id → raw answer as scanned/typed
}

export interface PaperResult {
  studentId: string;
  studentName: string;
  got: number[]; // per question, index-aligned with the scheme
  total: number;
  max: number;
  source: "manual" | "batch";
}

/** The deterministic grader. Exact (case/space-insensitive) earns full
 *  marks; keyword credit is the partial path; everything else is zero. */
export function ruleGrade(q: SchemeQ, raw: string): { got: number; how: "exact" | "keyword" | "none" } {
  const r = raw.trim();
  if (r === "" || q.answer.trim() === "") return { got: 0, how: "none" };
  if (r.toUpperCase() === q.answer.trim().toUpperCase()) return { got: q.marks, how: "exact" };
  if (q.keywords && q.keywords.length > 0) {
    const rl = r.toLowerCase();
    const hit = q.keywords.some((k) => k.trim() !== "" && rl.includes(k.trim().toLowerCase()));
    if (hit) return { got: q.marks, how: "keyword" };
    const words = new Set(q.answer.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    if (words.size > 0) {
      const shared = r.toLowerCase().split(/\s+/).filter((w) => words.has(w));
      if (shared.length >= Math.ceil(words.size / 2)) return { got: Math.ceil(q.marks / 2), how: "keyword" };
    }
  }
  return { got: 0, how: "none" };
}

export interface GradingModel {
  name: string;
  grade(question: SchemeQ, raw: string): { got: number; how: "model" };
}

export function gradeAnswer(q: SchemeQ, raw: string, model: GradingModel | null = null) {
  if (model) return model.grade(q, raw);
  return ruleGrade(q, raw);
}

export function markRow(qs: SchemeQ[], p: PaperRow, model: GradingModel | null = null): PaperResult {
  const got = qs.map((q) => gradeAnswer(q, p.raw[q.id] ?? "", model).got);
  return {
    studentId: p.studentId,
    studentName: p.studentName,
    got,
    total: got.reduce((a, b) => a + b, 0),
    max: qs.reduce((a, q) => a + q.marks, 0),
    source: "batch"
  };
}

/* ------------------------------------------------------------------ */
/* Paper extraction — the rule version of "read the scan".            */
/*                                                                     */
/* CSV/JSON the teacher typed or exported are read for real. Image and */
/* PDF uploads arrive as "scanned" rows: the names come from the files,*/
/* the answers come from a deterministic demo extraction so the whole  */
/* pipeline can be exercised on-device. A vision model replaces        */
/* demoExtractAnswers at exactly this call site when one is wired.    */
/* ------------------------------------------------------------------ */

export type ScannedKind = "csv" | "json" | "scan";

export interface ScannedPaper {
  kind: ScannedKind;
  studentName: string;
  raw: Record<string, string>;
  /** True when the answers were demo-extracted from a scan, not typed. */
  demo: boolean;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic per-file answer filler — the demo OCR stand-in. */
export function demoExtractAnswers(fileName: string, qs: SchemeQ[]): Record<string, string> {
  const seed = hashSeed(fileName);
  const out: Record<string, string> = {};
  qs.forEach((q, i) => {
    // ~70% of the scan "lands" the answer or a keyword; the rest is empty.
    const r = (seed >> (i % 28)) & 0xff;
    out[q.id] = r < 178 ? q.answer : r < 196 && q.keywords && q.keywords.length ? q.keywords[0] : "";
  });
  return out;
}

/** Parse a typed CSV: first row is `student, answer1, answer2, …`.
 *  Student cells are `id` or `id · name` — both resolve against the roll. */
export function parseCsvPapers(text: string, qs: SchemeQ[]): ScannedPaper[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const out: ScannedPaper[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(/[,\t;]/).map((c) => c.trim());
    if (cells.length < 2) continue;
    const [id, ...ans] = cells;
    const [studentId, studentName] = id.split("·").map((s) => s.trim());
    const raw: Record<string, string> = {};
    qs.forEach((q, i) => (raw[q.id] = ans[i] ?? ""));
    out.push({ kind: "csv", studentName: studentName || studentId, raw, demo: false });
  }
  return out;
}

/** Parse typed JSON: `[{ "student": "STU-1 · Amina", "answers": ["A", …] }]`. */
export function parseJsonPapers(text: string, qs: SchemeQ[]): ScannedPaper[] {
  const arr = JSON.parse(text) as Array<{ student?: string; answers?: string[] }>;
  if (!Array.isArray(arr)) throw new Error("JSON batch must be an array of { student, answers[] }");
  return arr.map((row) => {
    const [studentId, studentName] = String(row.student ?? "").split("·").map((s) => s.trim());
    const raw: Record<string, string> = {};
    qs.forEach((q, i) => (raw[q.id] = row.answers?.[i] ?? ""));
    return { kind: "json" as const, studentName: studentName || studentId, raw, demo: false };
  });
}