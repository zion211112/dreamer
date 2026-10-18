import { gradeAnswer, markPaper, parseCsvPapers, parseJsonPapers, type SchemeQuestion } from '@/lib/mark-engine';

const questions: SchemeQuestion[] = [
  { id: 'Q1', prompt: 'Formula for water?', topic: 'Matter', answer: 'H2O', keywords: ['H₂O'], marks: 1 },
  { id: 'Q2', prompt: 'Plant food process?', topic: 'Living things', answer: 'photosynthesis', keywords: ['photosynthesis'], marks: 2 },
];

describe('transparent local marking', () => {
  it('grades exact answers and explicit accepted phrases deterministically', () => {
    expect(gradeAnswer(questions[0], ' h2o ')).toBe(1);
    expect(gradeAnswer(questions[0], 'H₂O')).toBe(1);
    expect(gradeAnswer(questions[1], 'Photosynthesis')).toBe(2);
    expect(gradeAnswer(questions[1], 'A process that uses sunlight')).toBe(0);
  });

  it('marks a paper with score and maximum aligned to the published scheme', () => {
    expect(markPaper(questions, {
      student: 'Sample learner A',
      answers: { Q1: 'H2O', Q2: 'not sure' },
    })).toMatchObject({
      student: 'Sample learner A',
      marksByQuestion: [1, 0],
      score: 1,
      maximum: 3,
    });
  });

  it('parses quoted CSV cells and maps headers by question id', () => {
    const papers = parseCsvPapers('student,Q1,Q2\n"Sample, learner A",H2O,photosynthesis', questions);
    expect(papers).toEqual([{
      student: 'Sample, learner A',
      answers: { Q1: 'H2O', Q2: 'photosynthesis' },
    }]);
  });

  it('rejects malformed CSV and JSON instead of silently accepting partial results', () => {
    expect(() => parseCsvPapers('student,Q1,Q2\n"Missing quote,H2O,photosynthesis', questions))
      .toThrow('unclosed quoted field');
    expect(() => parseCsvPapers('name,Q1,Q2\nSample,H2O,photosynthesis', questions))
      .toThrow(/student.*column/);
    expect(() => parseJsonPapers('[{"student":"Sample","answers":{"Q1":4}}]', questions))
      .toThrow('must be text');
  });
});
