// Benben-OS — CBC demo seed data (grades 4–9, all subjects)
// Labelling: illustrative demo data only.

import type { Paper, CBCGrade } from './cbc';

export const CBC_DEMO_SCHOOL = {
  name: 'Benben-OS Academy',
  county: 'Nairobi',
  subCounty: 'Westlands',
  emsCode: 'CBC-DEMO-001',
};

export type GradeSummary = {
  grade: CBCGrade;
  learners: number;
  papersMarked: number;
  average: number;
  ee: number;
  me: number;
  ae: number;
  be: number;
};

export const GRADE_SUMMARIES: GradeSummary[] = [
  { grade: 4, learners: 42, papersMarked: 126, average: 72, ee: 14, me: 18, ae: 7, be: 3 },
  { grade: 5, learners: 40, papersMarked: 120, average: 68, ee: 10, me: 16, ae: 10, be: 4 },
  { grade: 6, learners: 38, papersMarked: 114, average: 70, ee: 12, me: 14, ae: 9, be: 3 },
  { grade: 7, learners: 45, papersMarked: 135, average: 66, ee: 9, me: 17, ae: 12, be: 7 },
  { grade: 8, learners: 41, papersMarked: 123, average: 64, ee: 7, me: 15, ae: 13, be: 6 },
  { grade: 9, learners: 36, papersMarked: 108, average: 67, ee: 8, me: 14, ae: 10, be: 4 },
];

// A real CBC-style Mathematics paper for Grade 5
export const GRADE5_MATH_T1_2025: Paper = {
  id: 'P-MAT-5-T1-2025-001',
  title: 'Mathematics — Grade 5, Term 1, 2025',
  subjectCode: 'MAT',
  grade: 5,
  term: 1,
  year: 2025,
  totalMarks: 50,
  timeMinutes: 90,
  questions: [
    {
      id: 'q1',
      subjectCode: 'MAT',
      grade: 5,
      strandId: 'mat-n',
      type: 'mcq',
      stem: 'What is the place value of digit 7 in the number 47,382?',
      options: ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten thousands'],
      marks: 2,
    },
    {
      id: 'q2',
      subjectCode: 'MAT',
      grade: 5,
      strandId: 'mat-n',
      type: 'short',
      stem: 'Write 3,405 in words.',
      marks: 2,
      keywords: ['three', 'thousand', 'four', 'hundred', 'five'],
      minKeywords: 4,
    },
    {
      id: 'q3',
      subjectCode: 'MAT',
      grade: 5,
      strandId: 'mat-alg',
      type: 'structured',
      stem: 'Solve: x + 15 = 37',
      marks: 3,
      keywords: ['x', '22'],
      minKeywords: 2,
    },
    {
      id: 'q4',
      subjectCode: 'MAT',
      grade: 5,
      strandId: 'mat-geo',
      type: 'mcq',
      stem: 'A square has 4 equal sides. If one side is 6 cm, what is the perimeter?',
      options: ['12 cm', '18 cm', '24 cm', '30 cm'],
      marks: 2,
    },
    {
      id: 'q5',
      subjectCode: 'MAT',
      grade: 5,
      strandId: 'mat-data',
      type: 'short',
      stem: 'State two ways of collecting data.',
      marks: 2,
      keywords: ['observation', 'interview', 'questionnaire', 'reading'],
      minKeywords: 2,
    },
  ],
};

// Grade 6 Integrated Science paper
export const GRADE6_SCI_T1_2025: Paper = {
  id: 'P-SCI-6-T1-2025-002',
  title: 'Integrated Science — Grade 6, Term 1, 2025',
  subjectCode: 'SCI',
  grade: 6,
  term: 1,
  year: 2025,
  totalMarks: 50,
  timeMinutes: 90,
  questions: [
    {
      id: 'q1',
      subjectCode: 'SCI',
      grade: 6,
      strandId: 'sci-bio',
      type: 'mcq',
      stem: 'Which part of the plant makes food?',
      options: ['Roots', 'Stem', 'Leaves', 'Flowers'],
      marks: 2,
    },
    {
      id: 'q2',
      subjectCode: 'SCI',
      grade: 6,
      strandId: 'sci-bio',
      type: 'short',
      stem: 'Name two functions of the skeleton.',
      marks: 2,
      keywords: ['support', 'protection', 'movement', 'shape'],
      minKeywords: 2,
    },
    {
      id: 'q3',
      subjectCode: 'SCI',
      grade: 6,
      strandId: 'sci-phy',
      type: 'structured',
      stem: 'Explain how a lever helps to lift a heavy load.',
      marks: 3,
      keywords: ['fulcrum', 'effort', 'load', 'force'],
      minKeywords: 3,
    },
    {
      id: 'q4',
      subjectCode: 'SCI',
      grade: 6,
      strandId: 'sci-ear',
      type: 'mcq',
      stem: 'The layer of air surrounding the earth is called:',
      options: ['Hydrosphere', 'Lithosphere', 'Atmosphere', 'Biosphere'],
      marks: 2,
    },
    {
      id: 'q5',
      subjectCode: 'SCI',
      grade: 6,
      strandId: 'sci-phy',
      type: 'short',
      stem: 'State one use of solar energy.',
      marks: 2,
      keywords: ['heating', 'lighting', 'electricity', 'drying'],
      minKeywords: 1,
    },
  ],
};

// Grade 9 English paper
export const GRADE9_ENG_T1_2025: Paper = {
  id: 'P-ENG-9-T1-2025-003',
  title: 'English — Grade 9, Term 1, 2025',
  subjectCode: 'ENG',
  grade: 9,
  term: 1,
  year: 2025,
  totalMarks: 50,
  timeMinutes: 90,
  questions: [
    {
      id: 'q1',
      subjectCode: 'ENG',
      grade: 9,
      strandId: 'eng-read',
      type: 'mcq',
      stem: 'Choose the correct synonym of "happy":',
      options: ['Sad', 'Joyful', 'Angry', 'Tired'],
      marks: 1,
    },
    {
      id: 'q2',
      subjectCode: 'ENG',
      grade: 9,
      strandId: 'eng-writ',
      type: 'short',
      stem: 'Write one compound sentence.',
      marks: 2,
      keywords: ['and', 'but', 'or', 'so'],
      minKeywords: 1,
    },
    {
      id: 'q3',
      subjectCode: 'ENG',
      grade: 9,
      strandId: 'eng-lit',
      type: 'structured',
      stem: 'Describe the main character in the set text you read.',
      marks: 5,
      keywords: ['character', 'brave', 'kind', 'honest'],
      minKeywords: 3,
    },
    {
      id: 'q4',
      subjectCode: 'ENG',
      grade: 9,
      strandId: 'eng-writ',
      type: 'short',
      stem: 'Punctuate this sentence: nairobi is the capital of kenya',
      marks: 2,
      keywords: ['Nairobi', 'Kenya', '.'],
      minKeywords: 3,
    },
    {
      id: 'q5',
      subjectCode: 'ENG',
      grade: 9,
      strandId: 'eng-list',
      type: 'short',
      stem: 'State two qualities of a good listener.',
      marks: 2,
      keywords: ['attentive', 'patient', 'focused', 'respectful'],
      minKeywords: 2,
    },
  ],
};

export const ALL_PAPERS: Paper[] = [GRADE5_MATH_T1_2025, GRADE6_SCI_T1_2025, GRADE9_ENG_T1_2025];

export function paperById(id: string): Paper | undefined {
  return ALL_PAPERS.find((p) => p.id === id);
}

export function papersForGrade(grade: CBCGrade): Paper[] {
  return ALL_PAPERS.filter((p) => p.grade === grade);
}
