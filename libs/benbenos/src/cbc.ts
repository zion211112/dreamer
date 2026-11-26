/**
 * Benben-OS — Kenya CBC (Competency-Based Curriculum) domain model.
 *
 * Pure data and functions: no Angular, no Node, no database. Shared by the API
 * and the school console UI so both agree on grades, subjects and levels.
 */

export const CBC_GRADES = [4, 5, 6, 7, 8, 9] as const;
export type CBCGrade = (typeof CBC_GRADES)[number];

export type CBCLevel = 'EE' | 'ME' | 'AE' | 'BE';

/** Performance bands. Lower bounds are inclusive; bands are contiguous over 0–100. */
export const CBC_LEVELS: Record<CBCLevel, { label: string; description: string; minPercent: number }> = {
  EE: { label: 'Exceeding Expectations', description: 'Consistently meets and exceeds curriculum outcomes.', minPercent: 80 },
  ME: { label: 'Meeting Expectations', description: 'Meets most curriculum outcomes with minimal support.', minPercent: 65 },
  AE: { label: 'Approaching Expectations', description: 'Partially meets outcomes; needs targeted support.', minPercent: 50 },
  BE: { label: 'Below Expectations', description: 'Does not yet meet outcomes; requires intervention.', minPercent: 0 },
};

/** Level for a percentage in [0, 100]. Fractional values are banded, never dropped. */
export function levelForPercent(percent: number): CBCLevel {
  if (!Number.isFinite(percent)) throw new Error('Percentage must be a finite number.');
  if (percent >= CBC_LEVELS.EE.minPercent) return 'EE';
  if (percent >= CBC_LEVELS.ME.minPercent) return 'ME';
  if (percent >= CBC_LEVELS.AE.minPercent) return 'AE';
  return 'BE';
}

/** Level for a raw score out of a maximum. */
export function levelForScore(score: number, maxScore: number): CBCLevel {
  if (!Number.isFinite(maxScore) || maxScore <= 0) throw new Error('Maximum score must be positive.');
  return levelForPercent((score / maxScore) * 100);
}

export const CBC_GRADE_NAMES: Record<CBCGrade, string> = {
  4: 'Grade 4', 5: 'Grade 5', 6: 'Grade 6', 7: 'Grade 7', 8: 'Grade 8', 9: 'Grade 9',
};

export type Strand = { id: string; name: string; substrands: string[] };
export type CBCSubject = { code: string; name: string; grades: CBCGrade[]; strands: Strand[] };

// Subject and strand catalogue ported from the legacy Benben-OS module.
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
  return CBC_SUBJECTS.filter((subject) => subject.grades.includes(grade));
}

export function subjectByCode(code: string): CBCSubject | undefined {
  return CBC_SUBJECTS.find((subject) => subject.code === code);
}
