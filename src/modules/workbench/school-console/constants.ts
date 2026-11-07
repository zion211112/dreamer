// Shared console data: answer schemes, daily tasks, role modules.
// Kenyan curriculum: KCPE (primary) and KCSE (secondary) schemes for automark.

export type ConsoleRole = 'teacher' | 'principal' | 'developer';
export type ConsoleModule =
  | 'my-day'
  | 'auto-marking'
  | 'tender-drafts'
  | 'kenyan-marking'
  | 'class-view'
  | 'school-overview'
  | 'developer-tools'
  | 'integration-hooks'
  | 'capability-coordination';

export type SchemeQuestion = {
  id: string;
  prompt: string;
  topic: string;
  answer: string;
  keywords?: string[];
  marks: number;
};

export type ConsoleRoleConfig = {
  id: ConsoleModule;
  label: string;
  index: string;
};

export const questions: SchemeQuestion[] = [
  { id: 'Q1', prompt: 'What is the chemical formula for water?', topic: 'Matter', answer: 'H2O', keywords: ['H₂O'], marks: 1 },
  { id: 'Q2', prompt: 'Name the process plants use to make food from sunlight.', topic: 'Living things', answer: 'photosynthesis', keywords: ['photosynthesis'], marks: 2 },
];

export const dayTasks = [
  { id: 'lesson', time: '08:10', title: 'Form 2 Science · Matter' },
  { id: 'marking', time: '10:20', title: 'Review a practice set' },
  { id: 'reports', time: '14:00', title: 'Prepare a class note' },
];

// ── Kenyan KCPE Mathematics (sample scheme) ──────────────────────────────
export const kcpeMathQuestions: SchemeQuestion[] = [
  { id: 'q1', prompt: 'What is 12 + 15?', topic: 'Addition', answer: '27', marks: 2 },
  { id: 'q2', prompt: 'What is 36 ÷ 6?', topic: 'Division', answer: '6', marks: 2 },
  { id: 'q3', prompt: 'Round 348 to the nearest ten.', topic: 'Rounding', answer: '350', keywords: ['350'], marks: 2 },
  { id: 'q4', prompt: 'What is 7 × 8?', topic: 'Multiplication', answer: '56', marks: 2 },
  { id: 'q5', prompt: 'What is 1⁄4 of 100?', topic: 'Fractions', answer: '25', keywords: ['25'], marks: 2 },
  { id: 'q6', prompt: 'Convert 0.75 to a fraction in simplest form.', topic: 'Decimals', answer: '3/4', keywords: ['3/4', 'three quarters'], marks: 3 },
  { id: 'q7', prompt: 'What is the perimeter of a square with side 6 cm?', topic: 'Measurement', answer: '24 cm', keywords: ['24'], marks: 3 },
  { id: 'q8', prompt: 'If x + 5 = 12, what is x?', topic: 'Algebra', answer: '7', keywords: ['7'], marks: 3 },
  { id: 'q9', prompt: 'What is 15% of 200?', topic: 'Percentages', answer: '30', keywords: ['30'], marks: 3 },
  { id: 'q10', prompt: 'What is the area of a rectangle 8 cm by 5 cm?', topic: 'Measurement', answer: '40 cm²', keywords: ['40'], marks: 3 },
];

// ── Kenyan KCPE English (sample scheme) ──────────────────────────────────
export const kcpeEnglishQuestions: SchemeQuestion[] = [
  { id: 'q1', prompt: 'Choose the correct word: The child ___ playing outside.', topic: 'Grammar', answer: 'is', keywords: ['is'], marks: 2 },
  { id: 'q2', prompt: 'What is the plural of "child"?', topic: 'Grammar', answer: 'children', keywords: ['children'], marks: 2 },
  { id: 'q3', prompt: 'Complete: She ___ to school every day.', topic: 'Grammar', answer: 'goes', keywords: ['goes'], marks: 2 },
  { id: 'q4', prompt: 'Opposite of "happy"?', topic: 'Vocabulary', answer: 'sad', keywords: ['sad', 'unhappy'], marks: 2 },
  { id: 'q5', prompt: 'Identify the noun: "The dog barked loudly."', topic: 'Grammar', answer: 'dog', keywords: ['dog'], marks: 2 },
  { id: 'q6', prompt: 'Past tense of "go"?', topic: 'Grammar', answer: 'went', keywords: ['went'], marks: 2 },
  { id: 'q7', prompt: 'Synonym of "big"?', topic: 'Vocabulary', answer: 'large', keywords: ['large', 'huge'], marks: 2 },
  { id: 'q8', prompt: 'Correct spelling: "recieve" or "receive"?', topic: 'Spelling', answer: 'receive', keywords: ['receive'], marks: 2 },
  { id: 'q9', prompt: 'Punctuation: "where are you going" needs what at the end?', topic: 'Punctuation', answer: '?', keywords: ['?', 'question mark'], marks: 2 },
  { id: 'q10', prompt: 'Adjective in: "The red car is fast."', topic: 'Grammar', answer: 'red', keywords: ['red'], marks: 2 },
];

// ── Kenyan KCPE Kiswahili (sample scheme) ────────────────────────────────
export const kcpeKiswahiliQuestions: SchemeQuestion[] = [
  { id: 'q1', prompt: 'Neno linaloolingana na "furaha"?', topic: 'Lugha', answer: 'furaha', keywords: ['furaha', 'furaha'], marks: 2 },
  { id: 'q2', prompt: 'Kitambulisho cha "mtoto"?', topic: 'Neno', answer: 'mtoto', keywords: ['mtoto'], marks: 2 },
  { id: 'q3', prompt: 'Alama ya mwisho wa sentensi?', topic: 'Aina', answer: '.', keywords: ['.', 'kazi'], marks: 2 },
  { id: 'q4', prompt: 'Opposite of "bora" (good)?', topic: 'Neno', answer: 'baya', keywords: ['baya'], marks: 2 },
  { id: 'q5', prompt: 'Jina la jinsi ya "mwalimu"?', topic: 'Neno', answer: 'mwalimu', keywords: ['mwalimu'], marks: 2 },
];

// ── Kenyan KCPE Science (sample scheme) ──────────────────────────────────
export const kcpeScienceQuestions: SchemeQuestion[] = [
  { id: 'q1', prompt: 'Which part of the plant makes food?', topic: 'Living things', answer: 'leaves', keywords: ['leaves', 'leaf'], marks: 2 },
  { id: 'q2', prompt: 'State of water at 100°C?', topic: 'Matter', answer: 'gas', keywords: ['gas', 'steam', 'vapor'], marks: 2 },
  { id: 'q3', prompt: 'Organ that pumps blood?', topic: 'Human body', answer: 'heart', keywords: ['heart'], marks: 2 },
  { id: 'q4', prompt: 'Planet closest to the sun?', topic: 'Earth and space', answer: 'Mercury', keywords: ['Mercury'], marks: 2 },
  { id: 'q5', prompt: 'Source of light during the day?', topic: 'Energy', answer: 'sun', keywords: ['sun'], marks: 2 },
];

// ── Kenyan KCPE Social Studies (sample scheme) ───────────────────────────
export const kcpeSocialStudiesQuestions: SchemeQuestion[] = [
  { id: 'q1', prompt: 'Capital city of Kenya?', topic: 'Civics', answer: 'Nairobi', keywords: ['Nairobi'], marks: 2 },
  { id: 'q2', prompt: 'Currency of Kenya?', topic: 'Civics', answer: 'shilling', keywords: ['shilling', 'KES', 'Kenyan shilling'], marks: 2 },
  { id: 'q3', prompt: 'Largest lake in Kenya?', topic: 'Geography', answer: 'Victoria', keywords: ['Victoria', 'Lake Victoria'], marks: 2 },
  { id: 'q4', prompt: 'First President of Kenya?', topic: 'History', answer: 'Kenyatta', keywords: ['Kenyatta', 'Jomo Kenyatta'], marks: 2 },
  { id: 'q5', prompt: 'Ocean bordering Kenya to the east?', topic: 'Geography', answer: 'Indian Ocean', keywords: ['Indian Ocean'], marks: 2 },
];

// KCPE subject registry
export const kcpeSubjects: Array<{ id: string; label: string; code: string; questions: SchemeQuestion[] }> = [
  { id: 'kcpe-math', label: 'Mathematics', code: 'KCPE-MATH', questions: kcpeMathQuestions },
  { id: 'kcpe-english', label: 'English', code: 'KCPE-ENG', questions: kcpeEnglishQuestions },
  { id: 'kcpe-kiswahili', label: 'Kiswahili', code: 'KCPE-KIS', questions: kcpeKiswahiliQuestions },
  { id: 'kcpe-science', label: 'Science', code: 'KCPE-SCI', questions: kcpeScienceQuestions },
  { id: 'kcpe-social', label: 'Social Studies', code: 'KCPE-SS', questions: kcpeSocialStudiesQuestions },
];

// KCSE subject registry (starter set)
export const kcseSubjects: Array<{ id: string; label: string; code: string; questions: SchemeQuestion[] }> = [
  { id: 'kcse-math', label: 'Mathematics', code: 'KCSE-MATH', questions: kcpeMathQuestions },
  { id: 'kcse-english', label: 'English', code: 'KCSE-ENG', questions: kcpeEnglishQuestions },
  { id: 'kcse-biology', label: 'Biology', code: 'KCSE-BIO', questions: kcpeScienceQuestions },
];

// ── Role modules ─────────────────────────────────────────────────────────
export const roleModules: Record<ConsoleRole, ConsoleRoleConfig[]> = {
  teacher: [
    { id: 'my-day', label: 'My Day', index: '01' },
    { id: 'kenyan-marking', label: 'Kenyan Marking', index: '02' },
    { id: 'class-view', label: 'Class', index: '03' },
  ],
  principal: [
    { id: 'school-overview', label: 'School Overview', index: '01' },
    { id: 'tender-drafts', label: 'Tender Drafts', index: '02' },
  ],
  developer: [
    { id: 'developer-tools', label: 'Developer Tools', index: '01' },
    { id: 'integration-hooks', label: 'Tender Hooks', index: '02' },
    { id: 'capability-coordination', label: 'Capability Coordination', index: '03' },
  ],
};

export const ROLE_LABELS: Record<ConsoleRole, string> = {
  teacher: 'Teacher',
  principal: 'Principal',
  developer: 'Developer',
};

export const ROLE_DESCRIPTIONS: Record<ConsoleRole, string> = {
  teacher: 'Daily planning, Kenyan automarking, class management',
  principal: 'School oversight, tender drafts, institutional decisions',
  developer: 'API hooks, integration, capability coordination',
};