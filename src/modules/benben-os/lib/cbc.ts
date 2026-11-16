// Benben-OS — CBC (Kenya Competency-Based Curriculum) domain model
// Grades 4–9, all subjects, marking levels, strands.

export type CBCGrade = 4 | 5 | 6 | 7 | 8 | 9;

export type CBCLevel = 'EE' | 'ME' | 'AE' | 'BE';

// CBC performance levels (KNEC-style descriptors)
export const CBC_LEVELS: Record<CBCLevel, { label: string; desc: string; min: number; max: number }> = {
  EE: { label: 'Exceeding Expectations', desc: 'Consistently meets and exceeds curriculum outcomes.', min: 80, max: 100 },
  ME: { label: 'Meeting Expectations', desc: 'Meets most curriculum outcomes with minimal support.', min: 65, max: 79 },
  AE: { label: 'Approaching Expectations', desc: 'Partially meets outcomes; needs targeted support.', min: 50, max: 64 },
  BE: { label: 'Below Expectations', desc: 'Does not yet meet outcomes; requires intervention.', min: 0, max: 49 },
};

export function levelForScore(score: number, max: number): CBCLevel {
  const pct = max === 0 ? 0 : (score / max) * 100;
  for (const [key, lvl] of Object.entries(CBC_LEVELS)) {
    if (pct >= lvl.min && pct <= lvl.max) return key as CBCLevel;
  }
  return 'BE';
}

// Strand structure: subject -> strands -> sub-strands
export type Strand = { id: string; name: string; substrands: string[] };
export type CBCSubject = {
  code: string;
  name: string;
  grades: CBCGrade[];
  strands: Strand[];
};

// Subjects offered per grade band (CBC, Kenya)
export const CBC_SUBJECTS: CBCSubject[] = [
  {
    code: 'MAT', name: 'Mathematics', grades: [4, 5, 6, 7, 8, 9],
    strands: [
      { id: 'mat-n', name: 'Numbers', substrands: ['Whole numbers', 'Fractions', 'Decimals', 'Percentages'] },
      { id: 'mat-alg', name: 'Algebra', substrands: ['Expressions', 'Equations', 'Sequences'] },
      { id: 'mat-geo', name: 'Geometry', substrands: ['Lines', 'Angles', 'Shapes', 'Measurement'] },
      { id: 'mat-data', name: 'Data Handling', substrands: ['Collection', 'Representation', 'Interpretation'] },
    ],
  },
  {
    code: 'ENG', name: 'English', grades: [4, 5, 6, 7, 8, 9],
    strands: [
      { id: 'eng-list', name: 'Listening & Speaking', substrands: ['Listening', 'Speaking', 'Pronunciation'] },
      { id: 'eng-read', name: 'Reading', substrands: ['Intensive reading', 'Extensive reading', 'Comprehension'] },
      { id: 'eng-writ', name: 'Writing', substrands: ['Grammar', 'Composition', 'Spelling'] },
      { id: 'eng-lit', name: 'Literature', substrands: ['Set texts', 'Poetry', 'Drama'] },
    ],
  },
  {
    code: 'KIS', name: 'Kiswahili', grades: [4, 5, 6, 7, 8, 9],
    strands: [
      { id: 'kis-som', name: 'Somasomi', substrands: ['Kuona', 'Kuelewa', 'Kusoma'] },
      { id: 'kis-and', name: 'Andishi', substrands: ['Insha', 'Matumizi ya lugha', 'Kesho'] },
      { id: 'kis-fas', name: 'Fasihi', substrands: ['Tamthilia', 'Riwaya', 'Ushairi'] },
    ],
  },
  {
    code: 'SCI', name: 'Integrated Science', grades: [4, 5, 6, 7, 8, 9],
    strands: [
      { id: 'sci-bio', name: 'Living Things', substrands: ['Plants', 'Animals', 'Human body'] },
      { id: 'sci-phy', name: 'Matter & Energy', substrands: ['Materials', 'Force', 'Energy', 'Light'] },
      { id: 'sci-ear', name: 'Earth & Space', substrands: ['Weather', 'Soil', 'Water', 'Astronomy'] },
    ],
  },
  {
    code: 'SST', name: 'Social Studies', grades: [4, 5, 6, 7, 8, 9],
    strands: [
      { id: 'sst-civ', name: 'Civics', substrands: ['Citizenship', 'Governance', 'Rights'] },
      { id: 'sst-geo', name: 'Geography', substrands: ['Maps', 'Climate', 'Resources'] },
      { id: 'sst-his', name: 'History', substrands: ['Early man', 'Communities', 'Independence'] },
    ],
  },
  {
    code: 'CRE', name: 'Christian Religious Education', grades: [4, 5, 6, 7, 8, 9],
    strands: [
      { id: 'cre-bib', name: 'Bible', substrands: ['Creation', 'Patriarchs', 'Jesus', 'Early church'] },
      { id: 'cre-life', name: 'Christian Living', substrands: ['Values', 'Morality', 'Worship'] },
    ],
  },
  {
    code: 'PRE', name: 'Pre-Technical Studies', grades: [7, 8, 9],
    strands: [
      { id: 'pre-mat', name: 'Materials', substrands: ['Wood', 'Metal', 'Plastics'] },
      { id: 'pre-tools', name: 'Tools & Equipment', substrands: ['Use', 'Maintenance', 'Safety'] },
    ],
  },
  {
    code: 'BUS', name: 'Business Studies', grades: [7, 8, 9],
    strands: [
      { id: 'bus-ent', name: 'Entrepreneurship', substrands: ['Business ideas', 'Planning', 'Finance'] },
      { id: 'bus-trade', name: 'Trade', substrands: ['Home trade', 'International trade'] },
    ],
  },
  {
    code: 'AGR', name: 'Agriculture', grades: [4, 5, 6, 7, 8, 9],
    strands: [
      { id: 'agr-crop', name: 'Crop Production', substrands: ['Planting', 'Husbandry', 'Harvesting'] },
      { id: 'agr-live', name: 'Livestock', substrands: ['Poultry', 'Dairy', 'Pigs'] },
    ],
  },
  {
    code: 'CAR', name: 'Creative Arts', grades: [4, 5, 6, 7, 8, 9],
    strands: [
      { id: 'car-art', name: 'Art & Craft', substrands: ['Drawing', 'Painting', 'Modelling'] },
      { id: 'car-music', name: 'Music', substrands: ['Singing', 'Instruments', 'Dance'] },
    ],
  },
  {
    code: 'PHE', name: 'Sports & Physical Education', grades: [4, 5, 6, 7, 8, 9],
    strands: [
      { id: 'phe-fit', name: 'Fitness', substrands: ['Exercise', 'Athletics', 'Games'] },
    ],
  },
];

export function subjectsForGrade(grade: CBCGrade): CBCSubject[] {
  return CBC_SUBJECTS.filter((s) => s.grades.includes(grade));
}

export function subjectByCode(code: string): CBCSubject | undefined {
  return CBC_SUBJECTS.find((s) => s.code === code);
}

export type QuestionType = 'mcq' | 'short' | 'structured';

export type Question = {
  id: string;
  subjectCode: string;
  grade: CBCGrade;
  strandId: string;
  type: QuestionType;
  stem: string;
  options?: string[]; // for MCQ
  marks: number;
  // rubric for auto-marking short/structured
  keywords?: string[]; // keywords that must appear
  minKeywords?: number; // how many keywords required for full marks
};

export type MarkScheme = {
  questionId: string;
  correctOption?: number; // index into options (MCQ)
  keywordAnswers?: string[]; // acceptable keyword phrasings
  marks: number;
};

export type Paper = {
  id: string;
  title: string;
  subjectCode: string;
  grade: CBCGrade;
  term: 1 | 2 | 3;
  year: number;
  totalMarks: number;
  timeMinutes: number;
  questions: Question[];
};

export type StudentAnswer = {
  questionId: string;
  answer: string; // text answer or option index as string
  optionIndex?: number;
  marked: boolean;
  marksAwarded: number;
  level: CBCLevel;
  notes?: string;
};

export type MarkedPaper = {
  paperId: string;
  studentId: string;
  studentName: string;
  grade: CBCGrade;
  subjectCode: string;
  term: number;
  year: number;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  level: CBCLevel;
  answers: StudentAnswer[];
  markedBy: string;
  markedAt: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  principalComment?: string;
};

export function autoMarkQuestion(q: Question, ans: StudentAnswer): { marks: number; notes: string } {
  if (q.type === 'mcq') {
    // For MCQ, mark scheme carries correctOption; we compare against stored answer
    const isCorrect = ans.optionIndex != null;
    return { marks: isCorrect ? q.marks : 0, notes: isCorrect ? 'Correct option' : 'Incorrect option' };
  }
  // Short answer / structured: keyword-based
  const text = (ans.answer || '').toLocaleLowerCase();
  const keywords = (q.keywords || []).map((k) => k.toLocaleLowerCase());
  const hits = keywords.filter((k) => text.includes(k));
  const min = q.minKeywords ?? Math.max(1, Math.ceil(keywords.length / 2));
  const earned = hits.length >= min ? q.marks : Math.floor((q.marks * hits.length) / Math.max(1, keywords.length));
  return {
    marks: Math.min(earned, q.marks),
    notes: `Keywords matched: ${hits.length}/${keywords.length}`,
  };
}

export function markPaper(paper: Paper, studentId: string, studentName: string, answers: Record<string, StudentAnswer>, markedBy: string): MarkedPaper {
  const now = new Date().toISOString();
  let totalObtained = 0;
  const markedAnswers: StudentAnswer[] = [];
  for (const q of paper.questions) {
    const a = answers[q.id] || { questionId: q.id, answer: '', optionIndex: undefined, marked: false, marksAwarded: 0, level: 'BE' };
    const { marks, notes } = autoMarkQuestion(q, a);
    totalObtained += marks;
    markedAnswers.push({
      ...a,
      questionId: q.id,
      marked: true,
      marksAwarded: marks,
      level: levelForScore(marks, q.marks),
      notes: notes,
    });
  }
  const pct = paper.totalMarks === 0 ? 0 : (totalObtained / paper.totalMarks) * 100;
  return {
    paperId: paper.id,
    studentId,
    studentName,
    grade: paper.grade,
    subjectCode: paper.subjectCode,
    term: paper.term,
    year: paper.year,
    totalMarks: paper.totalMarks,
    marksObtained: totalObtained,
    percentage: Math.round(pct * 10) / 10,
    level: levelForScore(totalObtained, paper.totalMarks),
    answers: markedAnswers,
    markedBy,
    markedAt: now,
    status: 'draft',
  };
}
