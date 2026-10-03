// The exemplar bank — a worked example of every kind of material the
// Content Studio produces, built on the real Kenyan curriculum. Not
// placeholders: each item traces to a learning area, names the
// misconception it diagnoses, carries its marking key, and two of them
// (ex-i-maths, ex-i-sci) form the paper the Auto-Marking trial runs on.
//
// Seeded once into an empty bank; the school's own material replaces it.

import { Category, ContentItem, ExamPaper } from "./content";

export function mk(i: Partial<ContentItem> & { id: string; title: string; subject: string; category: Category }): ContentItem {
  const base: ContentItem = {
    id: i.id,
    category: i.category,
    title: i.title,
    subject: i.subject,
    gradeBand: i.gradeBand ?? "Junior 7",
    kras: i.kras ?? [],
    competency: i.competency ?? "",
    misconception: i.misconception ?? "",
    rubric: i.rubric ?? "",
    plan: i.plan ?? "",
    type: i.type ?? "multiple-choice",
    bloom: i.bloom ?? 2,
    marks: i.marks ?? 5,
    durationMin: i.durationMin ?? 10,
    status: i.status ?? "published",
    createdAt: i.createdAt ?? 1750000000000
  };
  return base;
}

export const EXEMPLAR_ITEMS: ContentItem[] = [
  mk({
    id: "ex-i-maths",
    category: "test",
    title: "A trader sells a dress for KSh 1,200 after a 20% discount. What was the marked price?",
    subject: "Mathematics",
    gradeBand: "Junior 7",
    kras: ["MAT.7.2.1"],
    competency: "Thinking & Problem Solving",
    misconception: "Learners add 20% of 1,200 to 1,200 — treating the discounted price as the whole.",
    type: "structured",
    bloom: 3,
    marks: 5,
    rubric: "Method (3): 80% of marked price = 1,200, so marked price = 1,200 × 100/80. Answer (2): KSh 1,500. Adding 20% to 1,200 (KSh 1,440) earns method only — the trap is the base.",
    status: "published"
  }),
  mk({
    id: "ex-i-sci",
    category: "test",
    title: "Grace sets up two circuits: one cell and one lamp, then two cells and the same lamp. Which glows brighter, and why?",
    subject: "Integrated Science",
    gradeBand: "Junior 7",
    kras: ["SCI.7.1.2"],
    competency: "Digital Literacy",
    misconception: "Cells in series 'share' the current, so brightness is unchanged.",
    type: "practical",
    bloom: 4,
    marks: 10,
    rubric: "Assembly (4): circuit complete, lamp lit, no loose connections. Explanation (6): two cells in series raise the voltage across the lamp; current rises; the lamp glows brighter. Drawings of both arrangements earn the method marks.",
    status: "published"
  }),
  mk({
    id: "ex-i-eng",
    category: "test",
    title: "Read: 'The early morning wind whispered through the kakamega trees.' Which figure of speech is used, and what does it suggest?",
    subject: "English",
    gradeBand: "Junior 8",
    kras: ["ENG.8.1.3"],
    competency: "Communication & Language",
    misconception: "Personification is 'any descriptive sentence'.",
    type: "multiple-choice",
    bloom: 4,
    marks: 3,
    rubric: "Personification (2) — the wind is given the human action of whispering. Suggestion (1): the morning is calm and the bush alive.",
    status: "published"
  }),
  mk({
    id: "ex-i-sst",
    category: "test",
    title: "Name the county where the Yala Swamp lies, and one economic activity it supports.",
    subject: "Social Studies",
    gradeBand: "Junior 7",
    kras: ["SST.7.3.1"],
    competency: "Citizenship",
    misconception: "Learners place physical features by memorised county towns, not by map reference.",
    type: "structured",
    bloom: 1,
    marks: 4,
    rubric: "Siaya (2) — accept Kisumu with a reasoned boundary. Activity (2): fishing, papyrus weaving or rice irrigation, with a one-line link to the swamp.",
    status: "published"
  }),
  mk({
    id: "ex-i-kisw",
    category: "test",
    title: "Tunga neno lililo sahihi: 'Watu ___ sokoni asubuhi.' (wendi / kwenda / wanaenda)",
    subject: "Kiswahili",
    gradeBand: "Lower 3",
    kras: ["KIS.3.1.1"],
    competency: "Communication & Language",
    misconception: "Learners match the plural subject to the infinitive, not the tensed verb.",
    type: "multiple-choice",
    bloom: 1,
    marks: 2,
    rubric: "'Wanaenda' (2). 'Kwenda' is the infinitive — it cannot carry the subject. Half mark for guessing with a stated rule.",
    status: "published"
  }),
  mk({
    id: "ex-i-agne",
    category: "test",
    title: "Which of these belongs in a farm's production record — the milk yields, or the committee minutes?",
    subject: "Agriculture",
    gradeBand: "Junior 9",
    kras: ["AGR.9.2.2"],
    competency: "Self-Efficacy",
    misconception: "Any written farm document counts as a production record.",
    type: "multiple-choice",
    bloom: 2,
    marks: 2,
    rubric: "Milk yields (2). Minutes are administrative records — the distinction is the whole point.",
    status: "published"
  }),
  mk({
    id: "ex-i-up",
    category: "test",
    title: "Your class compost bin smells and attracts flies after two weeks. What went wrong, and what do you turn in?",
    subject: "Science & Technology",
    gradeBand: "Upper 1",
    kras: ["SCI.4.4.2"],
    competency: "Creativity & Imagination",
    misconception: "Compost is 'anything wet rots' — layering and turning are optional.",
    type: "structured",
    bloom: 3,
    marks: 6,
    rubric: "Diagnosis (3): too much wet waste, no dry 'brown' layer, not turned — air is missing. Fix (3): layer dry leaves, turn weekly, cover after rain. Full marks need both, named.",
    status: "published"
  }),
  mk({
    id: "ex-i-lp",
    category: "test",
    title: "Count the mangoes in the basket. Circle the numeral that matches what you counted.",
    subject: "Mathematics",
    gradeBand: "Lower 2",
    kras: ["MAT.2.1.1"],
    competency: "Thinking & Problem Solving",
    misconception: "Learners recite the count sequence faster than they tag objects — the last number named is not the total.",
    type: "practical",
    bloom: 1,
    marks: 3,
    rubric: "One-to-one tagging (2): touches each mango once while saying the number. Total (1): the final tagged number is the count. Watch for double-taps — that is the misconception, not carelessness.",
    status: "published"
  })
];

export const EXEMPLAR_EXAMS: ExamPaper[] = [
  {
    id: "ex-p-jss",
    title: "Endterm — Mathematics & Science (Auto-Marking trial paper)",
    subject: "Mathematics",
    gradeBand: "Junior 7",
    term: "Term 1",
    durationMin: 60,
    note: "Answer ALL questions. Show your working where asked.",
    items: ["ex-i-maths", "ex-i-sci", "ex-i-sst", "ex-i-agne"],
    createdAt: 1750000000000
  },
  {
    id: "ex-p-lp",
    title: "Midterm — Lower Primary integrated check",
    subject: "Mathematics",
    gradeBand: "Lower 2",
    term: "Term 2",
    durationMin: 40,
    note: "Do all the tasks. Your teacher will read with you.",
    items: ["ex-i-lp", "ex-i-kisw", "ex-i-up", "ex-i-eng"],
    createdAt: 1750000000000
  }
];

export const EXEMPLAR_COUNT = { tests: 8, media: 15, papers: 2 };


