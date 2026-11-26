import { levelForScore, type CBCLevel } from './cbc';

/**
 * Deterministic auto-marking for objective and short-answer papers.
 *
 * The output is a DRAFT. Auto-marked scores are never published on their own:
 * a teacher reviews them and a principal or registrar confirms them.
 */

export type McqQuestion = { id: string; type: 'mcq'; marks: number; correctOption: number };
export type KeywordQuestion = { id: string; type: 'keyword'; marks: number; keywords: string[]; minKeywords?: number };
export type SchemeQuestion = McqQuestion | KeywordQuestion;

/** MCQ answers are option indexes; keyword answers are free text. */
export type Answer = number | string | null | undefined;

export type QuestionMark = { questionId: string; marks: number; maxMarks: number; note: string };
export type MarkedSubmission = {
  questions: QuestionMark[];
  score: number;
  maximum: number;
  percent: number;
  level: CBCLevel;
};

export function validateScheme(questions: SchemeQuestion[]): void {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('The answer scheme needs at least one question.');
  }
  const ids = new Set<string>();
  for (const question of questions) {
    if (!question || typeof question.id !== 'string' || !question.id.trim()) {
      throw new Error('Every scheme question needs an id.');
    }
    if (ids.has(question.id)) throw new Error(`Duplicate scheme question id "${question.id}".`);
    ids.add(question.id);
    if (!Number.isSafeInteger(question.marks) || question.marks <= 0) {
      throw new Error(`Question ${question.id} needs a positive whole-number mark value.`);
    }
    if (question.type === 'mcq') {
      if (!Number.isSafeInteger(question.correctOption) || question.correctOption < 0) {
        throw new Error(`MCQ question ${question.id} needs a correctOption index.`);
      }
    } else if (question.type === 'keyword') {
      if (!Array.isArray(question.keywords) || question.keywords.length === 0
        || question.keywords.some((keyword) => typeof keyword !== 'string' || !keyword.trim())) {
        throw new Error(`Keyword question ${question.id} needs non-empty keywords.`);
      }
      const min = question.minKeywords ?? Math.ceil(question.keywords.length / 2);
      if (!Number.isSafeInteger(min) || min < 1 || min > question.keywords.length) {
        throw new Error(`Keyword question ${question.id} has an invalid minKeywords.`);
      }
    } else {
      throw new Error(`Question ${String((question as { id?: string }).id)} has an unknown type.`);
    }
  }
}

function normalise(text: string): string {
  return text.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

export function markQuestion(question: SchemeQuestion, answer: Answer): QuestionMark {
  if (question.type === 'mcq') {
    if (answer === null || answer === undefined || answer === '') {
      return { questionId: question.id, marks: 0, maxMarks: question.marks, note: 'No option selected' };
    }
    if (typeof answer !== 'number' || !Number.isSafeInteger(answer)) {
      throw new Error(`MCQ answer for ${question.id} must be an option index.`);
    }
    const correct = answer === question.correctOption;
    return {
      questionId: question.id,
      marks: correct ? question.marks : 0,
      maxMarks: question.marks,
      note: correct ? 'Correct option' : 'Incorrect option',
    };
  }

  if (answer === null || answer === undefined) {
    return { questionId: question.id, marks: 0, maxMarks: question.marks, note: 'No answer' };
  }
  if (typeof answer !== 'string') throw new Error(`Answer for ${question.id} must be text.`);
  const text = normalise(answer);
  if (!text) return { questionId: question.id, marks: 0, maxMarks: question.marks, note: 'No answer' };

  const keywords = [...new Set(question.keywords.map(normalise))];
  const hits = keywords.filter((keyword) => text.includes(keyword)).length;
  const required = question.minKeywords ?? Math.ceil(keywords.length / 2);
  const marks = hits >= required ? question.marks : Math.floor((question.marks * hits) / required);
  return {
    questionId: question.id,
    marks: Math.min(marks, question.marks),
    maxMarks: question.marks,
    note: `Keywords matched ${hits} of ${required} required`,
  };
}

/** Marks one learner's paper. `answers` is keyed by question id. */
export function markSubmission(questions: SchemeQuestion[], answers: Record<string, Answer>): MarkedSubmission {
  validateScheme(questions);
  const marked = questions.map((question) => markQuestion(question, answers[question.id]));
  const score = marked.reduce((total, item) => total + item.marks, 0);
  const maximum = questions.reduce((total, question) => total + question.marks, 0);
  const percent = Math.round((score / maximum) * 1000) / 10;
  return { questions: marked, score, maximum, percent, level: levelForScore(score, maximum) };
}
