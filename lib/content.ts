// Content Studio (console 15) — the domain. The atelier: exam design,
// lesson plans, media and classroom papers for the Kenyan CBC, built on
// this device.
//
// One half is the CBC shape itself: every item traces to a KRA (the
// learning experience it assesses), names one of the seven core
// competencies or a value, and sits on a grade band. The other half is
// design science, not prediction: each item names the MISCONCEPTION it is
// built to elicit — the specific break in the thinking — and carries its
// evidence (a marking key for written items, a five-line scaffold for
// lessons, a runtime for media). The audit layer is a set of
// deterministic, expert-tuned checks an education engineer can sign off on;
// the Check[] shape is intentionally the seam where a scored model plugs in
// later. All local; nothing leaves the device.

import { idbAll, idbBulkPut, idbClear } from "./db";

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

// KRA codes carry their own address: "MAT.4.2.3" reads as subject MAT,
// grade 4, strand 2, KRA 3; Junior codes letter the grade (SCI.J7.1.2).
// The parser only splits — it never claims to know what a strand is called.
export interface KraRef {
  code: string;
  subject: string;
  grade: string;
  strand: string;
  kra: string;
}

export function parseKra(code: string): KraRef {
  const [subject, grade, strand, kra] = code.split(".").filter(Boolean);
  return { code, subject: subject ?? "?", grade: grade ?? "?", strand: strand ?? "?", kra: kra ?? "?" };
}

/* ------------------------------------------------------------------ */
/* Model                                                             */
/* ------------------------------------------------------------------ */

export interface ContentItem {
  id: string;
  category: Category;
  title: string;
  subject: string;
  gradeBand: string;
  kras: string[]; // KRA codes the item traces to ("EN.4.1.1")
  competency: string; // one of COMPETENCIES/VALUES or "" — what the item develops
  misconception: string; // the diagnostic hook — the specific wrong answer the item is built to expose
  rubric: string; // written items: the marking key — what earns full marks, what earns half
  plan: string; // lessons: the five-line scaffold — intention, inputs, activity, evidence, adjustment
  type: string; // ITEM_TYPES, test items only
  bloom: number; // index into BLOOM_LEVELS, test items only
  marks: number; // test items only
  durationMin: number; // media items
  status: "draft" | "published";
  createdAt: number;
}

// Legacy dumps may predate rubric/plan (or carry fields we no longer read).
// One normalizer keeps the studio crash-free against either shape.
export function normalizeItem(i: ContentItem): ContentItem {
  return { ...i, kras: i.kras ?? [], rubric: i.rubric ?? "", plan: i.plan ?? "", status: i.status ?? "draft" };
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
    misconception: "",
    rubric: "",
    plan: "",
    type: "multiple-choice",
    bloom: 2,
    marks: 5,
    durationMin: 5,
    status: "draft",
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
    items: docs.filter((d) => d.kind === "item").map((d) => normalizeItem(d.data as ContentItem)),
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
    const items = d.items
      .filter((i) => i && typeof i.id === "string" && typeof i.title === "string")
      .map(normalizeItem);
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
/* Expert audit — design science, not prediction.                       */
/*                                                                      */
/* The studio's critique is a set of deterministic, expert-tuned     */
/* checks (lib/audit.ts): trace items to their KRA, place the          */
/* cognitive demand, name the diagnostic hook, write the marking key, */
/* budget time against marks. The Check[] shape is the seam where a   */
/* scored model plugs in later — the ML team owns that file.          */
/* ------------------------------------------------------------------ */

export * from "./audit";

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
      title: "Photosynthesis — the leaf does the work",
      subject: "Kenya",
      gradeBand: "Upper 2",
      kras: ["KES.5.2.1", "KES.5.2.3"],
      competency: "Thinking & Problem Solving",
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
      misconception: "Bigger denominator, bigger fraction.",
      plan: "Intention: compare fractions of equal wholes. Inputs: one mango, paper, pencils. Activity: halve, quarter, order the pieces. Evidence: the ordering strip each pair produces. Adjustment: halves first, for the pairs that stall.",
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
      misconception: "Fractions of different wholes can't be compared.",
      type: "structured",
      bloom: 2,
      marks: 6,
      rubric:
        "Step 1 (3): the unit price — ½ of the dozen price, worked per mango. Step 2 (3): ¾ of a dozen is 9, priced from the unit. Full marks need both steps named; the final number alone is half.",
      status: "published"
    }),
    mk({
      id: "smp-i2",
      category: "test",
      title: "Two leaves, different sun. Which plant wilts first on a sealed day? Justify in two lines.",
      subject: "Kenya",
      gradeBand: "Upper 2",
      kras: ["KES.5.2.1"],
      competency: "Thinking & Problem Solving",
      misconception: "The bigger leaf holds more water.",
      type: "structured",
      bloom: 3,
      marks: 8,
      rubric:
        "Claim (2): a plant named with a reason that names water loss. Justification (6): the sealed day — transpiration stops, and the bigger leaf was losing the most. A bare 'the big one' earns 4 at most.",
      status: "published"
    }),
    mk({
      id: "smp-i3",
      category: "test",
      title: "Name the capital of Kenya.",
      subject: "Social Studies",
      gradeBand: "Lower 1",
      kras: ["SST.1.1.1"],
      type: "multiple-choice",
      bloom: 0,
      marks: 1,
      rubric: "Nairobi. Any response that names the capital takes the mark.",
      status: "published"
    }),
    mk({
      id: "smp-i4",
      category: "test",
      title: "Rebuild a paper circuit from the drawer: two cells, one switch, one lamp. Record why your arrangement glows brighter.",
      subject: "Science",
      gradeBand: "Junior 7",
      kras: ["SCI.J7.1.2"],
      competency: "Digital Literacy",
      misconception: "More cells always mean brighter — arrangement is irrelevant.",
      type: "practical",
      bloom: 4,
      marks: 10,
      rubric:
        "Assembly (4): circuit complete, lamp lit, no loose connections. Record (6): two arrangements drawn, the brighter one named, and the reason — series adds voltage, parallel splits it.",
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
      misconception: "Doubling three times is multiplying by 3.",
      type: "structured",
      bloom: 2,
      marks: 5,
      rubric:
        "Work backward (4): 80 → 40 → 20 → 10, one halving per doubling. Answer (1): she started with 10. '80 × 3' earns nothing — the doubling is the trap.",
      status: "published"
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
      note: "Answer ALL questions. Show your working where asked.",
      items: ["smp-i2", "smp-i4", "smp-r1", "smp-h2"],
      createdAt: now
    }
  ];
  return { items, exams };
}

