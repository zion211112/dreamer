// src/modules/workbench/school-console/constants.ts
// Shared console data: answer scheme, daily tasks, role modules.
// Kept in the module so it is self-contained under assets.
export type ConsoleRole = 'teacher' | 'principal';
export type ConsoleModule = 'my-day' | 'auto-marking' | 'tender-drafts';

export const questions = [
  { id: 'Q1', prompt: 'What is the chemical formula for water?', topic: 'Matter', answer: 'H2O', keywords: ['H₂O'], marks: 1 },
  { id: 'Q2', prompt: 'Name the process plants use to make food from sunlight.', topic: 'Living things', answer: 'photosynthesis', keywords: ['photosynthesis'], marks: 2 },
];

export const dayTasks = [
  { id: 'lesson', time: '08:10', title: 'Form 2 Science · Matter' },
  { id: 'marking', time: '10:20', title: 'Review a practice set' },
  { id: 'reports', time: '14:00', title: 'Prepare a class note' },
];

export const roleModules: Record<ConsoleRole, { id: ConsoleModule; label: string; index: string }[]> = {
  teacher: [
    { id: 'my-day', label: 'My Day', index: '01' },
    { id: 'auto-marking', label: 'Auto-Marking', index: '02' },
  ],
  principal: [
    { id: 'tender-drafts', label: 'Tender drafts', index: '01' },
  ],
};
