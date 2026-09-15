// Content Studio (console 15/16) — the domain.
//
// Two halves. One is the KENYAN CBC shape: every item traces to a KRA (the
// learning experience it assesses), names one of the seven core competencies
// or a value, and sits on a grade band (Lower/Upper Primary, Junior). The
// other half is the ROOT DOCTRINE: an item that nobody can predict is an item
// worth writing. Each item carries a SURPRISE level (0 routine → 5 the exam
// itself is the hook) and names the MISCONCEPTION it targets — the
// prediction-error that does the teaching. The Critique pane is where the two
// meet: field a test, log the class responses, and the studio computes the
// prediction error (observed p vs. class mastery), difficulty and a
// point-biserial discriminator — then tells you which items are too
// predictable, too novel, or simply defective. All local; nothing leaves the
// device.

import { idbAll, idbBulkPut, idbClear } from "./db";
import { Assessment } from "./school";

/* ------------------------------------------------------------------ */
/* Taxonomy                                                          */
/* ------------------------------------------------------------------ */

export const CATEGORIES = [
  { id: "video", label: "Video · Animation" },
  { id: "vr-lab", label: "VR Lab" },
  { id: "audiobook", label: "Audiobook" },
  { id: "ebook", label: "E-book" },
  { id: "historical-doc", label: "Historical Doc" },
  { id: "test", label: "Test Item" },
  { id: "lesson", label: "Lesson" },
  { id: "timeline", label: "Timeline" }
] as const;
export type Category = (typeof CATEGORIES)[number]["id"];
export const CATEGORY_LABEL: Record<Category, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
) as Record<Category, string>;

// CBC grade bands: Lower Primary 1–3, Upper 4–6, Junior 7–9.
export const GRADE_BANDS = [
  "Lower 1",
  "Lower 2",
  "Lower 3",
  "Upper 1",
  "Upper 2",
  "Upper 3",
  "Junior 7",
  "Junior 8",
  "Junior 9",
  "All"
];

// Blooms, the cognitive demand an item asks for.
export const BLOOM_LEVELS = [
  "Knowledge",
  "Comprehension",
  "Application",
  "Analysis",
  "Evaluation",
  "Creation"
];

// The seven CBC core competencies + the values a paper should name.
export const COMPETENCIES = [
  "Communication & Language",
  "Thinking & Problem Solving",
  "Collaboration",
  "Self-Efficacy",
  "Citizenship",
  "Digital Literacy",
  "Creativity & Imagination"
];
export const VALUES = [
  "Patriotism",
  "Respect",
  "Honesty",
  "Responsibility",
  "Love",
  "Tolerance",
  "Unity"
];

// Item types for the written/practical half (CBC process tasks).
export const ITEM_TYPES = ["multiple-choice", "structured", "practical", "performance", "portfolio"];

// The surprise meter: 0 = pure recall, 5 = the exam itself is the hook.
// Levels 3+ are where the prediction error that does the teaching lives.
export const SURPRISE_LEVELS = [
  "Routine — direct recall",
  "Familiar context",
  "Applied — new context",
  "Novel — predict first",
  "Misconception trap",
  "Adversarial — the item is the hook"
];

/* ------------------------------------------------------------------ */
/* Model                                                             */
/* ------------------------------------------------------------------ */

export interface Trial {
  admissible: number; // out of 40 — the class score that trial came with
  name: string;
  correct: boolean;
}

export interface ContentItem {
  id: string;
  category: Category;
  title: string;
  subject: string;
  gradeBand: string;
  kras: string[]; // KRA codes the item traces to ("EN.4.1.1")
  competency: string; // one of COMPETENCIES/VALUES or "" — what the item targets
  surprise: number; // 0..5
  misconception: string; // the hook it lands on, "" when pure
  type: string; // ITEM_TYPES, test items only
  bloom: number; // index into BLOOM_LEVELS, test items only
  marks: number; // test items only
  durationMin: number; // media items
  status: "draft" | "published";
  responses: Trial[]; // fielded-class log, feeds the Critique
  createdAt: number;
}

export interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  gradeBand: string;
  term: string;
  durationMin: number;
  note: string; // instruction line on the paper
  items: string[]; // item ids, in paper order
  createdAt: number;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyItem(): ContentItem {
  return {
    id: uid("ci"),
    category: "test",
    title: "",
    subject: "",
    gradeBand: "Upper 3",
    kras: [],
    competency: "",
    surprise: 2,
    misconception: "",
    type: "multiple-choice",
    bloom: 2,
    marks: 5,
    durationMin: 5,
    status: "draft",
    responses: [],
    createdAt: Date.now()
  };
}

export function emptyPaper(): ExamPaper {
  return {
    id: uid("ex"),
    title: "",
    subject: "",
    gradeBand: "Upper 3",
    term: "Term 1",
    durationMin: 50,
    note: "Answer ALL questions. Show your working where asked.",
    items: [],
    createdAt: Date.now()
  };
}

/* ------------------------------------------------------------------ */
/* Storage — items and papers as tagged documents in the content store */
/* ------------------------------------------------------------------ */

export interface ContentDoc {
  id: string;
  kind: "item" | "exam";
  data: ContentItem | ExamPaper;
}

export function itemDoc(v: ContentItem): ContentDoc {
  return { id: v.id, kind: "item", data: v };
}
export function examDoc(v: ExamPaper): ContentDoc {
  return { id: v.id, kind: "exam", data: v };
}

export async function loadContent(): Promise<{ items: ContentItem[]; exams: ExamPaper[] }> {
  const docs = await idbAll<ContentDoc>("content");
  return {
    items: docs.filter((d) => d.kind === "item").map((d) => d.data as ContentItem),
    exams: docs.filter((d) => d.kind === "exam").map((d) => d.data as ExamPaper)
  };
}

export interface ContentDump {
  v: 1;
  kind: "content-studio";
  school: string;
  exportedAt: string;
  items: ContentItem[];
  exams: ExamPaper[];
}

export function makeContentDump(school: string, items: ContentItem[], exams: ExamPaper[]): string {
  return JSON.stringify(
    {
      v: 1,
      kind: "content-studio",
      school,
      exportedAt: new Date().toISOString(),
      items,
      exams
    },
    null,
    2
  );
}

export function loadContentDump(raw: string): { items: ContentItem[]; exams: ExamPaper[] } | null {
  try {
    const d = JSON.parse(raw) as ContentDump;
    if (d.kind !== "content-studio" || !Array.isArray(d.items) || !Array.isArray(d.exams)) return null;
    const items = d.items.filter((i) => i && typeof i.id === "string" && typeof i.title === "string");
    const exams = d.exams.filter((e) => e && typeof e.id === "string" && typeof e.title === "string");
    return { items, exams };
  } catch {
    return null;
  }
}

export async function replaceContent(items: ContentItem[], exams: ExamPaper[]): Promise<void> {
  await idbClear("content");
  await idbBulkPut("content", [...items.map(itemDoc), ...exams.map(examDoc)]);
}

/* ------------------------------------------------------------------ */
/* Critique — where the class's prediction error meets the item bank. */
/*                                                                     */
/* mastery = mean share across every score the device holds. An item  */
/* whose observed p deviates from mastery by more than 0.15 is doing  */
/* something — surprising the class or failing to — and gets named.  */
/* ------------------------------------------------------------------ */

export function classMastery(assessments: Assessment[]): number | null {
  const rows = assessments.filter((a) => a.max > 0);
  if (rows.length === 0) return null;
  return rows.reduce((s, a) => s + a.score / a.max, 0) / rows.length;
}

export type Verdict =
  | "evidence"
  | "calibrated"
  | "too-routine"
  | "too-novel"
  | "too-hard"
  | "weak-discriminator";

export interface ItemCritique {
  n: number;
  p: number | null; // observed difficulty
  pbis: number | null; // point-biserial vs admissible score, null when uncomputable
  predErr: number | null; // observed p − class mastery
  verdict: Verdict;
  line: string;
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function sd(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

export function itemCritique(item: ContentItem, mastery: number | null): ItemCritique {
  const rs = item.responses;
  const n = rs.length;
  if (n === 0)
    return {
      n,
      p: null,
      pbis: null,
      predErr: null,
      verdict: "evidence",
      line: "Not fielded yet — run it with a class, log the results, and the numbers appear here."
    };
  const c = rs.filter((r) => r.correct).length;
  const p = c / n;
  const expected = mastery ?? 0.5;
  const predErr = p - expected;
  // Point-biserial between the item and the admissible score, when logged.
  let pbis: number | null = null;
  const scored = rs.filter((r) => r.admissible > 0);
  if (scored.length >= 4) {
    const m1 = mean(scored.filter((r) => r.correct).map((r) => r.admissible));
    const m0 = mean(scored.filter((r) => !r.correct).map((r) => r.admissible));
    const s = sd(scored.map((r) => r.admissible));
    if (s > 0) pbis = Math.max(-1, Math.min(1, (m1 - m0) / s));
  }
  if (n < 5)
    return {
      n,
      p,
      pbis,
      predErr,
      verdict: "evidence",
      line: `Gathering evidence — ${n}/5 responses logged. ${
        p > 0.75 ? "Early signal: the class finds this easy." : p < 0.25 ? "Early signal: the class is losing it." : "No signal yet."
      }`
    };
  if (p >= 0.9)
    return {
      n,
      p,
      pbis,
      predErr,
      verdict: "too-routine",
      line: `Too predictable — ${Math.round(p * 100)}% got it right. Raise the surprise level or add the misconception hook; an item nobody can predict against teaches nothing.`
    };
  if (p <= 0.1)
    return {
      n,
      p,
      pbis,
      predErr,
      verdict: "too-hard",
      line: "Above class headroom or defective — under 10% got it. Re-read the wording before you blame the class."
    };
  if (pbis !== null && n >= 8 && pbis < 0.15)
    return {
      n,
      p,
      pbis,
      predErr,
      verdict: "weak-discriminator",
      line: `Weak discriminator (rpb ${pbis.toFixed(2)}) — correct and incorrect look random against the admissible score. It is not measuring what it should.`
    };
  if (Math.abs(predErr) <= 0.15)
    return {
      n,
      p,
      pbis,
      predErr,
      verdict: "calibrated",
      line: "Calibrated — the prediction error sits inside the useful band. Keep it as a baseline item."
    };
  if (predErr > 0)
    return {
      n,
      p,
      pbis,
      predErr,
      verdict: "too-novel",
      line: `Surprising the class — ${Math.round(
        p * 100
      )}% against an expected ${Math.round(expected * 100)}%. The hook is landing; log the misconception it targets so the next class gets it first.`
    };
  return {
    n,
    p,
    pbis,
    predErr,
    verdict: "too-routine",
    line: `Under-surprising — the class out-scored its own mastery here (got ${Math.round(
      p * 100
    )}%, expected ${Math.round(expected * 100)}%). Routine for this class; novel for the next band.`
  };
}

export interface ExamNote {
  sev: "ok" | "watch" | "fail";
  text: string;
}

// Critique a paper against the CBC shape and the surprise doctrine. This is
// the "critiqued CBC" — the known failure modes of CBC assessment (recall
// dressed up as competency, untraced items, time famine) made checkable.
export function examCritique(paper: ExamPaper, byId: Map<string, ContentItem>): ExamNote[] {
  const notes: ExamNote[] = [];
  const items = paper.items.map((id) => byId.get(id)).filter((i): i is ContentItem => !!i);
  const tests = items.filter((i) => i.category === "test");
  const marks = items.reduce((s, i) => s + (i.category === "test" ? i.marks : 0), 0);

  if (items.length === 0) {
    notes.push({ sev: "fail", text: "Empty paper — attach items from the Bank before printing." });
    return notes;
  }

  const need = 10 + marks * 2; // 10 min reading, ~2 min per mark
  if (marks > 0 && paper.durationMin < need)
    notes.push({ sev: "fail", text: `Time famine — ${marks} marks needs ~${need} min; the paper allows ${paper.durationMin}.` });
  else if (marks > 0)
    notes.push({
      sev: "ok",
      text: `Time fits — ${marks} marks in ${paper.durationMin} min is ${Math.max(0, paper.durationMin - need)} min above the ~${need} min needed.`
    });

  const above = tests.filter((i) => i.bloom >= 2).length;
  if (tests.length > 0 && above === 0)
    notes.push({
      sev: "fail",
      text: "Recall-heavy — every written item sits at Knowledge/Comprehension. CBC assessment must reach Application and above; a 7:3 paper that only recalls is the critique, not the model."
    });
  else if (tests.length > 0)
    notes.push({ sev: "ok", text: `Cognitive spread — ${above} of ${tests.length} written items reach Application or above.` });

  const avgSurprise = items.reduce((s, i) => s + i.surprise, 0) / items.length;
  if (avgSurprise < 2)
    notes.push({
      sev: "watch",
      text: `Routine paper — average surprise ${avgSurprise.toFixed(1)}/5. Surprise is the prediction-error signal this studio is built on; add at least one novel item.`
    });
  else notes.push({ sev: "ok", text: `Surprise index ${avgSurprise.toFixed(1)}/5 across ${items.length} items.` });

  const unaligned = tests.filter((i) => i.kras.length === 0).length;
  if (unaligned > 0)
    notes.push({
      sev: "fail",
      text: `${unaligned} written item${unaligned > 1 ? "s" : ""} trace to no KRA. CBC: assessment follows the learning experience — every item must name one.`
    });

  const noTarget = tests.filter((i) => !i.competency.trim()).length;
  if (noTarget > 0 && tests.length > 0)
    notes.push({
      sev: "watch",
      text: `${noTarget} item${noTarget > 1 ? "s" : ""} name no competency or value — the seven CBC competencies should be targeted, not implied.`
    });

  const drafts = items.filter((i) => i.status === "draft").length;
  if (drafts > 0)
    notes.push({ sev: "watch", text: `${drafts} item${drafts > 1 ? "s" : ""} on this paper are still drafts — publish or drop before printing.` });

  const process = items.some((i) => i.category === "vr-lab" || i.type === "practical" || i.type === "performance" || i.type === "portfolio");
  if (!process)
    notes.push({
      sev: "watch",
      text: "Pure written paper — attach one practical or performance task so the CBC process skills get assessed, not just the content."
    });

  const hooks = items.filter((i) => i.misconception.trim()).length;
  if (hooks === 0)
    notes.push({
      sev: "watch",
      text: "No item names the misconception it targets — the hook is the part that teaches; a paper without hooks only measures."
    });
  else notes.push({ sev: "ok", text: `${hooks} item${hooks > 1 ? "s" : ""} carry a misconception hook.` });

  return notes;
}

/* ------------------------------------------------------------------ */
/* Sample bank — the first impression of depth. Eight categories,     */
/* two papers, KRA-traced, hooks named. Seeded only into an empty     */
/* bank; the school's own items replace it.                            */
/* ------------------------------------------------------------------ */

function mk(i: Partial<ContentItem> & { id: string; title: string; subject: string; category: Category }): ContentItem {
  const base = emptyItem();
  return { ...base, ...i, id: i.id };
}

export function sampleContent(): { items: ContentItem[]; exams: ExamPaper[] } {
  const now = Date.now();
  const items: ContentItem[] = [
    mk({
      id: "smp-v1",
      category: "video",
      title: "Photosynthesis — predict first, then the leaf speaks",
      subject: "Kenya",
      gradeBand: "Upper 2",
      kras: ["KES.5.2.1", "KES.5.2.3"],
      competency: "Thinking & Problem Solving",
      surprise: 3,
      misconception: "Plants 'eat' soil; the green part is just colour.",
      durationMin: 6,
      status: "published"
    }),
    mk({
      id: "smp-v2",
      category: "video",
      title: "Rivers of Kenya — from the Aberdare source to the sea",
      subject: "Social Studies",
      gradeBand: "Upper 1",
      kras: ["SST.4.1.2"],
      competency: "Citizenship",
      surprise: 2,
      durationMin: 8,
      status: "published"
    }),
    mk({
      id: "smp-v3",
      category: "video",
      title: "Fractions on the market — pricing a mango by parts",
      subject: "Mathematics",
      gradeBand: "Lower 2",
      kras: ["MAT.3.1.4"],
      competency: "Communication & Language",
      surprise: 3,
      misconception: "Halves of different wholes are the same size.",
      durationMin: 5,
      status: "draft"
    }),
    mk({
      id: "smp-r1",
      category: "vr-lab",
      title: "Walk through a volcano — the plume, the vent, the ash",
      subject: "Science",
      gradeBand: "Junior 7",
      kras: ["SCI.J7.3.1"],
      competency: "Creativity & Imagination",
      surprise: 4,
      misconception: "Magma and lava are the same thing in the same place.",
      durationMin: 10,
      status: "published"
    }),
    mk({
      id: "smp-r2",
      category: "vr-lab",
      title: "Virtual titration — endpoints before the colour",
      subject: "Chemistry",
      gradeBand: "Junior 8",
      kras: ["CHI.J8.2.4"],
      competency: "Digital Literacy",
      surprise: 4,
      misconception: "The indicator 'finishes' the reaction.",
      durationMin: 12,
      status: "draft"
    }),
    mk({
      id: "smp-a1",
      category: "audiobook",
      title: "Kanyansimi tales of Kirinyaga (audiotaped)",
      subject: "Kiswahili",
      gradeBand: "Lower 1",
      kras: ["KSW.L1.4.1"],
      competency: "Citizenship",
      surprise: 2,
      durationMin: 15,
      status: "published"
    }),
    mk({
      id: "smp-a2",
      category: "audiobook",
      title: "The long walk — a freedom story, read",
      subject: "Social Studies",
      gradeBand: "Upper 3",
      kras: ["SST.6.3.1"],
      competency: "Patriotism",
      surprise: 2,
      misconception: "Independence was a single day, not a decade.",
      durationMin: 20,
      status: "published"
    }),
    mk({
      id: "smp-e1",
      category: "ebook",
      title: "Algebra primer — letters that stand for things",
      subject: "Mathematics",
      gradeBand: "Upper 2",
      kras: ["MAT.5.3.1", "MAT.5.3.2"],
      competency: "Thinking & Problem Solving",
      surprise: 2,
      misconception: "x times 2 is 'xtwo', not 2x.",
      durationMin: 0,
      status: "published"
    }),
    mk({
      id: "smp-e2",
      category: "ebook",
      title: "CBC learner's handbook — the assessment chapter, excerpt",
      subject: "All",
      gradeBand: "All",
      surprise: 1,
      durationMin: 0,
      status: "published"
    }),
    mk({
      id: "smp-h1",
      category: "historical-doc",
      title: "The independence address, 1963 — annotated",
      subject: "Social Studies",
      gradeBand: "Upper 3",
      kras: ["SST.6.3.2"],
      competency: "Communication & Language",
      surprise: 3,
      misconception: "The 1963 ceremony settled everything; nothing followed.",
      durationMin: 12,
      status: "published"
    }),
    mk({
      id: "smp-h2",
      category: "historical-doc",
      title: "Mau Mau trial records, Mumbi (transcribed excerpts)",
      subject: "Social Studies",
      gradeBand: "Junior 9",
      kras: ["SST.J9.1.3"],
      competency: "Honesty",
      surprise: 4,
      misconception: "One side of every archive is the whole story.",
      durationMin: 15,
      status: "draft"
    }),
    mk({
      id: "smp-t1",
      category: "timeline",
      title: "Kenya timeline, 1890–1964 (printable)",
      subject: "Social Studies",
      gradeBand: "All",
      kras: ["SST.6.3.1"],
      competency: "Responsibility",
      surprise: 1,
      status: "published"
    }),
    mk({
      id: "smp-l1",
      category: "lesson",
      title: "Lesson plan: fractions — the hook lands before the definition",
      subject: "Mathematics",
      gradeBand: "Lower 2",
      kras: ["MAT.3.1.4"],
      competency: "Collaboration",
      surprise: 3,
      misconception: "Bigger denominator, bigger fraction.",
      durationMin: 40,
      status: "published"
    }),
    mk({
      id: "smp-i1",
      category: "test",
      title: "A mango sells at ½ of the dozen price. Work out ¾ of a dozen from that. Show the two steps.",
      subject: "Mathematics",
      gradeBand: "Lower 2",
      kras: ["MAT.3.1.4"],
      competency: "Thinking & Problem Solving",
      surprise: 3,
      misconception: "Fractions of different wholes can't be compared.",
      type: "structured",
      bloom: 2,
      marks: 6,
      status: "published",
      responses: [
        { admissible: 31, name: "A1001", correct: true },
        { admissible: 24, name: "A1002", correct: true },
        { admissible: 18, name: "A1003", correct: false },
        { admissible: 29, name: "A1004", correct: true },
        { admissible: 15, name: "A1005", correct: false }
      ]
    }),
    mk({
      id: "smp-i2",
      category: "test",
      title: "Two leaves, different sun. Predict: which plant wilts first on a sealed day? Justify in two lines.",
      subject: "Kenya",
      gradeBand: "Upper 2",
      kras: ["KES.5.2.1"],
      competency: "Thinking & Problem Solving",
      surprise: 4,
      misconception: "The bigger leaf holds more water.",
      type: "structured",
      bloom: 3,
      marks: 8,
      status: "published",
      responses: [
        { admissible: 28, name: "A1001", correct: true },
        { admissible: 33, name: "A1002", correct: false },
        { admissible: 22, name: "A1003", correct: false },
        { admissible: 35, name: "A1004", correct: true },
        { admissible: 12, name: "A1005", correct: false },
        { admissible: 30, name: "A1006", correct: true },
        { admissible: 27, name: "A1007", correct: false }
      ]
    }),
    mk({
      id: "smp-i3",
      category: "test",
      title: "Name the capital of Kenya.",
      subject: "Social Studies",
      gradeBand: "Lower 1",
      kras: ["SST.1.1.1"],
      surprise: 0,
      type: "multiple-choice",
      bloom: 0,
      marks: 1,
      status: "published",
      responses: [
        { admissible: 34, name: "A1001", correct: true },
        { admissible: 31, name: "A1002", correct: true },
        { admissible: 29, name: "A1003", correct: true },
        { admissible: 26, name: "A1004", correct: true },
        { admissible: 24, name: "A1005", correct: true },
        { admissible: 22, name: "A1006", correct: true }
      ]
    }),
    mk({
      id: "smp-i4",
      category: "test",
      title: "Rebuild a paper circuit from the drawer: two cells, one switch, one lamp. Record why your arrangement glows brighter.",
      subject: "Science",
      gradeBand: "Junior 7",
      kras: ["SCI.J7.1.2"],
      competency: "Digital Literacy",
      surprise: 5,
      misconception: "More cells always mean brighter — arrangement is irrelevant.",
      type: "practical",
      bloom: 4,
      marks: 10,
      status: "draft"
    }),
    mk({
      id: "smp-i5",
      category: "test",
      title: "A trader says she doubled her stock three times and it is now 80. How many did she start with?",
      subject: "Mathematics",
      gradeBand: "Upper 1",
      kras: ["MAT.4.2.3"],
      competency: "Thinking & Problem Solving",
      surprise: 2,
      misconception: "Doubling three times is multiplying by 3.",
      type: "structured",
      bloom: 2,
      marks: 5,
      status: "published",
      responses: [
        { admissible: 30, name: "A1001", correct: true },
        { admissible: 21, name: "A1003", correct: true },
        { admissible: 33, name: "A1004", correct: true }
      ]
    })
  ];
  const exams: ExamPaper[] = [
    {
      id: "smp-p1",
      title: "Term 1 Midpoint — Mathematics",
      subject: "Mathematics",
      gradeBand: "Lower 2",
      term: "Term 1",
      durationMin: 50,
      note: "Answer ALL questions. Show your working where asked.",
      items: ["smp-i1", "smp-i5", "smp-l1", "smp-v3"],
      createdAt: now
    },
    {
      id: "smp-p2",
      title: "KCPE Mock — Science & Competency",
      subject: "Kenya",
      gradeBand: "Upper 3",
      term: "Term 2",
      durationMin: 80,
      note: "The first item of each section asks you to predict before you explain.",
      items: ["smp-i2", "smp-i4", "smp-r1", "smp-h2"],
      createdAt: now
    }
  ];
  return { items, exams };
}

