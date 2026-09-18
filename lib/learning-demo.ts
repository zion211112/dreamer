// Console pitch: deterministic, source-backed teaching drafts. No network or AI service.
export type OutputKind = "lesson" | "semester" | "test";
export interface Fact { term: string; explanation: string }
export interface Question { prompt: string; options: string[]; correct: number; explanation: string; skill: string }
export interface LearningBrief { title: string; learner: string; minutes: number; weeks: number; notes: string }
export const SAMPLE_NOTES = `Whole: The complete object or group that a fraction refers to.
Numerator: The top number; it counts how many equal parts are selected.
Denominator: The bottom number; it counts how many equal parts make one whole.
Equivalent fractions: Different fractions that represent the same amount of the same whole.
Comparing fractions: When numerators are equal and the whole is the same, a smaller denominator means a larger part.`;
export const SAMPLE_BRIEF: LearningBrief = { title: "Fractions, made visible", learner: "Grade 5", minutes: 40, weeks: 12, notes: SAMPLE_NOTES };

export function parseNotes(notes: string): Fact[] {
  return notes.split(/\r?\n/).map((line) => {
    const split = line.indexOf(":");
    return { term: split < 0 ? "" : line.slice(0, split).trim(), explanation: split < 0 ? "" : line.slice(split + 1).trim() };
  }).filter((fact) => fact.term && fact.explanation);
}
export function briefError(brief: LearningBrief): string {
  if (!brief.title.trim() || !brief.learner.trim()) return "Add a topic and a class or learner.";
  const facts = parseNotes(brief.notes);
  const lines = brief.notes.split(/\r?\n/).filter((line) => line.trim());
  if (facts.length !== lines.length || facts.length < 3 || facts.length > 8) return "Use 3–8 notes, each on its own line as Concept: explanation.";
  if (new Set(facts.map((f) => f.term.toLowerCase())).size !== facts.length) return "Give each concept a different name.";
  if (new Set(facts.map((f) => f.explanation.toLowerCase())).size !== facts.length) return "Give each concept a different explanation so the answers are unambiguous.";
  if (!Number.isInteger(brief.minutes) || brief.minutes < 10 || brief.minutes > 90) return "Choose 10–90 minutes.";
  if (!Number.isInteger(brief.weeks) || brief.weeks < 6 || brief.weeks > 16) return "Choose a semester length of 6–16 weeks.";
  return "";
}

const FRACTION_QUESTIONS: Question[] = [
  { prompt: "A mango is cut into 4 equal pieces. You take 3. Which fraction did you take?", options: ["1/4", "3/4", "4/3"], correct: 1, skill: "Numerator", explanation: "3 pieces are selected out of 4 equal pieces: 3/4. The numerator counts the selected pieces." },
  { prompt: "In 2/5, what does the 5 tell you?", options: ["Two pieces were selected", "Five pieces were selected", "The whole has five equal parts"], correct: 2, skill: "Denominator", explanation: "The denominator counts all the equal parts in one whole, not the parts selected." },
  { prompt: "A small chapati and a large chapati are each cut in half. Are the two halves the same amount of food?", options: ["No, because the wholes have different sizes", "Yes, because both are halves", "Yes, because both use the number 2"], correct: 0, skill: "Whole", explanation: "A fraction refers to a particular whole. Half of a larger chapati is more food than half of a smaller one." },
  { prompt: "Which fraction is equivalent to 1/2 of the same whole?", options: ["1/4", "2/4", "2/3"], correct: 1, skill: "Equivalent fractions", explanation: "Two quarters cover exactly the same amount as one half. Multiply both numerator and denominator by 2." },
  { prompt: "Two equal-sized chapatis are shared. Which is more food: 1/3 of one or 1/4 of the other?", options: ["1/4, because 4 is bigger than 3", "They are equal", "1/3, because each of three equal parts is larger"], correct: 2, skill: "Comparing fractions", explanation: "For the same whole, dividing into fewer equal parts makes each part larger. So 1/3 is larger than 1/4." }
];

export function buildQuestions(notes: string, count: number): Question[] {
  const facts = parseNotes(notes);
  if (facts.length < 3) return [];
  const questions = notes.trim() === SAMPLE_NOTES ? FRACTION_QUESTIONS : facts.map((fact, i) => {
    const correct = i % 3;
    const options = [facts[(i + 1) % facts.length].explanation, facts[(i + 2) % facts.length].explanation];
    options.splice(correct, 0, fact.explanation);
    return { prompt: `Which explanation matches “${fact.term}”?`, options, correct, skill: fact.term, explanation: `${fact.term}: ${fact.explanation}` };
  });
  return questions.slice(0, Math.max(0, Math.min(count, questions.length)));
}
export function scoreQuestions(questions: Question[], answers: number[]) {
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  return { correct, total: questions.length, revisit: questions.filter((q, i) => answers[i] !== q.correct).map((q) => q.skill) };
}
export function buildDocument(brief: LearningBrief, kind: OutputKind): string {
  const error = briefError(brief);
  if (error) throw new Error(error);
  const facts = parseNotes(brief.notes);
  if (kind === "test") return testDocument(brief, buildQuestions(brief.notes, 8), false);
  if (kind === "semester") {
    return `${brief.title} — semester outline\n${brief.learner} · ${brief.weeks} weeks\n\nPlanning scaffold, not a complete syllabus. Expand the notes for broader coverage.\n\n` + Array.from({ length: brief.weeks }, (_, i) => {
      if (i === 0) return "Week 1 · Find the starting point\nAsk learners to explain what they already know. Record one question per learner and group the gaps.";
      if (i === brief.weeks - 1) return `Week ${brief.weeks} · Demonstrate & reflect\nLearners teach one concept using a new example. Repeat the starting questions and compare explanations, not just scores.`;
      const fact = facts[Math.min(facts.length - 1, Math.floor(((i - 1) * facts.length) / (brief.weeks - 2)))];
      return `Week ${i + 1} · ${fact.term}\nFocus: ${fact.explanation}\nActivity: model the idea, practise in pairs, then apply it to a new situation.\nEvidence: one independent explanation and one worked example. Revisit before advancing if either is unclear.`;
    }).join("\n\n");
  }
  const opening = Math.max(2, Math.round(brief.minutes * 0.125));
  const model = Math.round(brief.minutes * 0.25);
  const practice = Math.round(brief.minutes * 0.4);
  const close = brief.minutes - opening - model - practice;
  return `${brief.title}\n${brief.learner} · ${brief.minutes} minutes\n\nLEARNING INTENTION\nExplain ${facts.slice(0, 3).map((f) => f.term.toLowerCase()).join(", ")} and apply one idea without a prompt.\n\nBRING\nPaper, pencils and one everyday object per pair. Use the source video if available; these notes also work offline.\n\n01 · NOTICE / ${opening} MIN\nAsk: “What do you think ${facts[0].term.toLowerCase()} means?” Collect two different explanations before giving the answer.\n\n02 · MAKE IT VISIBLE / ${model} MIN\n${facts.map((f) => `${f.term}: ${f.explanation}`).join("\n")}\nModel one example and one non-example. Ask learners what changed.\n\n03 · TRY IT / ${practice} MIN\nPairs draw or build a model of ${facts[0].term.toLowerCase()}. One learner explains; the other asks why. Swap roles. Create a fresh example using ${facts[1].term.toLowerCase()}.\n\n04 · CHECK UNDERSTANDING / ${close} MIN\nIndividually: explain ${facts[1].term.toLowerCase()} in your own words, then give an example. Look for reasoning, not a copied definition.\n\nIF IT HAS NOT LANDED\nReturn to the physical model. Ask the learner to point to the part they mean, then explain again.\n\nIF THEY ARE READY\nCreate an example that could confuse a friend. Explain the mistake and how to correct it.\n\nTEACHER REVIEW\nCheck accuracy, learner readiness and curriculum fit before using this draft.`;
}

export function testDocument(brief: LearningBrief, questions: Question[], key: boolean): string {
  return [`${brief.title} — ${key ? "Answer guide" : "Practice test"}`, `${brief.learner} · ${brief.minutes} minutes · ${questions.length} marks`, "", key ? "One mark per correct answer. Use the explanation to discuss the idea." : "Name: ____________________  Date: __________\nChoose one answer for each question.", ...questions.map((q, i) => `\n${i + 1}. ${q.prompt}\n${q.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`).join("\n")}${key ? `\nAnswer: ${String.fromCharCode(65 + q.correct)}. ${q.explanation}` : ""}`)].join("\n");
}
