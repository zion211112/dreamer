export interface SchemeQuestion {
  id: string;
  prompt: string;
  topic: string;
  answer: string;
  keywords?: string[];
  marks: number;
}

export interface Paper {
  student: string;
  answers: Record<string, string>;
}

export interface MarkedPaper extends Paper {
  marksByQuestion: number[];
  score: number;
  maximum: number;
}

export function gradeAnswer(question: SchemeQuestion, raw: string): number {
  if (!Number.isSafeInteger(question.marks) || question.marks <= 0) {
    throw new Error(`Question ${question.id} must have a positive whole-number mark value.`);
  }
  const answer = raw.trim();
  if (!answer) return 0;
  if (answer.localeCompare(question.answer.trim(), undefined, { sensitivity: 'accent' }) === 0) {
    return question.marks;
  }
  const normalized = answer.toLocaleLowerCase();
  if (question.keywords?.some(keyword => keyword.trim() && normalized.includes(keyword.trim().toLocaleLowerCase()))) {
    return question.marks;
  }
  return 0;
}

export function markPaper(questions: SchemeQuestion[], paper: Paper): MarkedPaper {
  if (!paper.student.trim()) throw new Error('Each paper needs a student label.');
  const marksByQuestion = questions.map(question => gradeAnswer(question, paper.answers[question.id] ?? ''));
  return {
    ...paper,
    student: paper.student.trim(),
    marksByQuestion,
    score: marksByQuestion.reduce((total, mark) => total + mark, 0),
    maximum: questions.reduce((total, question) => total + question.marks, 0),
  };
}

export function parseCsvPapers(text: string, questions: SchemeQuestion[]): Paper[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error('CSV needs a header row and at least one paper.');
  const headers = rows[0].map(value => value.trim().toLocaleLowerCase());
  const studentIndex = headers.findIndex(header => header === 'student');
  if (studentIndex < 0) throw new Error('CSV must include a "student" column.');
  const questionIndexes = questions.map(question => {
    const index = headers.findIndex(header => header === question.id.toLocaleLowerCase());
    if (index < 0) throw new Error(`CSV is missing the ${question.id} answer column.`);
    return index;
  });
  return rows.slice(1).map((row, rowIndex) => {
    const student = row[studentIndex]?.trim();
    if (!student) throw new Error(`CSV row ${rowIndex + 2} has no student label.`);
    return {
      student,
      answers: Object.fromEntries(questions.map((question, index) => [
        question.id,
        row[questionIndexes[index]] ?? '',
      ])),
    };
  });
}

export function parseJsonPapers(text: string, questions: SchemeQuestion[]): Paper[] {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('JSON must be a non-empty array of { "student": "...", "answers": { "Q1": "..." } }.');
  }
  return parsed.map((value, index) => {
    if (typeof value !== 'object' || value === null || !('student' in value) || !('answers' in value)) {
      throw new Error(`JSON row ${index + 1} must contain student and answers.`);
    }
    const student = value.student;
    const answers = value.answers;
    if (typeof student !== 'string' || typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
      throw new Error(`JSON row ${index + 1} has an invalid student label or answers object.`);
    }
    const cleanAnswers: Record<string, string> = {};
    for (const question of questions) {
      const answer = (answers as Record<string, unknown>)[question.id];
      if (answer !== undefined && typeof answer !== 'string') {
        throw new Error(`Answer ${question.id} in JSON row ${index + 1} must be text.`);
      }
      cleanAnswers[question.id] = answer ?? '';
    }
    return { student, answers: cleanAnswers };
  });
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some(cell => cell.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(field);
  if (row.some(cell => cell.trim())) rows.push(row);
  return rows;
}
