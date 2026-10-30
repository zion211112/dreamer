import type { MarkedPaper } from './school-marking';

export interface SchoolTenderBOMLineDraft {
  id: string;
  item: string;
  quantity: string;
  unit: string;
  unitCost: string;
}

export interface SchoolTenderDraft {
  id: string;
  assetName: string;
  need: string;
  assetBuildCost: string;
  projectedAnnualYield: string;
  localSpendPercentage: string;
  crewWageAllocation: { anchor: string; builder: string; apprentice: string };
  economicModelNote: string;
  blueprintLines: SchoolTenderBOMLineDraft[];
  createdAt: string;
}

export interface LocalFeeNote {
  id: string;
  description: string;
  amountKes: number;
}

export interface ConsoleSnapshot {
  markedPapers: MarkedPaper[];
  lessonDraft: string;
  completedTasks: string[];
  inspectionChecks: string[];
  tenderDrafts: SchoolTenderDraft[];
  feeNotes: LocalFeeNote[];
  [key: string]: unknown;
}

export const initialConsoleSnapshot: ConsoleSnapshot = {
  markedPapers: [],
  lessonDraft: '',
  completedTasks: [],
  inspectionChecks: [],
  tenderDrafts: [],
  feeNotes: [],
};

const databaseName = 'apt-labs-school-console';
const objectStoreName = 'local-work';
const snapshotKey = 'school-console-v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string') throw new Error(`Stored Console ${label} is invalid.`);
  return value;
}

function normalizeTenderDraft(value: unknown, index: number): SchoolTenderDraft {
  if (!isRecord(value)) throw new Error(`Stored Console Tender draft ${index + 1} is invalid.`);
  const wageValue = value.crewWageAllocation;
  const wage = wageValue === undefined ? {} : wageValue;
  if (!isRecord(wage)) throw new Error(`Stored Console Tender draft ${index + 1} has invalid crew allocation.`);
  const linesValue = value.blueprintLines ?? [];
  if (!Array.isArray(linesValue)) throw new Error(`Stored Console Tender draft ${index + 1} has invalid Blueprint lines.`);
  const blueprintLines = linesValue.map((line, lineIndex): SchoolTenderBOMLineDraft => {
    if (!isRecord(line)) throw new Error(`Stored Console Blueprint line ${lineIndex + 1} is invalid.`);
    return {
      id: requireString(line.id, 'Blueprint line ID'),
      item: requireString(line.item, 'Blueprint item'),
      quantity: requireString(line.quantity, 'Blueprint quantity'),
      unit: requireString(line.unit, 'Blueprint unit'),
      unitCost: requireString(line.unitCost, 'Blueprint unit cost'),
    };
  });

  return {
    ...value,
    id: requireString(value.id, 'Tender draft ID'),
    assetName: requireString(value.assetName, 'Tender asset name'),
    need: requireString(value.need, 'Tender need'),
    assetBuildCost: value.assetBuildCost === undefined ? '' : requireString(value.assetBuildCost, 'Tender build cost'),
    projectedAnnualYield: value.projectedAnnualYield === undefined ? '' : requireString(value.projectedAnnualYield, 'Tender projected yield'),
    localSpendPercentage: value.localSpendPercentage === undefined ? '' : requireString(value.localSpendPercentage, 'Tender local spend percentage'),
    crewWageAllocation: {
      anchor: wage.anchor === undefined ? '' : requireString(wage.anchor, 'anchor allocation'),
      builder: wage.builder === undefined ? '' : requireString(wage.builder, 'builder allocation'),
      apprentice: wage.apprentice === undefined ? '' : requireString(wage.apprentice, 'apprentice allocation'),
    },
    economicModelNote: value.economicModelNote === undefined ? '' : requireString(value.economicModelNote, 'Tender model note'),
    blueprintLines,
    createdAt: requireString(value.createdAt, 'Tender creation date'),
  };
}

function normalizeMarkedPaper(value: unknown, index: number): MarkedPaper {
  if (!isRecord(value) || !isRecord(value.answers) || !Array.isArray(value.marksByQuestion)) {
    throw new Error(`Stored Console marked paper ${index + 1} is invalid.`);
  }
  const answers: Record<string, string> = {};
  for (const [questionId, answer] of Object.entries(value.answers)) {
    if (typeof answer !== 'string') throw new Error(`Stored Console answer ${questionId} is invalid.`);
    answers[questionId] = answer;
  }
  if (
    typeof value.student !== 'string'
    || !value.marksByQuestion.every(mark => typeof mark === 'number' && Number.isFinite(mark) && mark >= 0)
    || typeof value.score !== 'number'
    || !Number.isFinite(value.score)
    || value.score < 0
    || typeof value.maximum !== 'number'
    || !Number.isFinite(value.maximum)
    || value.maximum <= 0
    || value.score > value.maximum
  ) {
    throw new Error(`Stored Console marked paper ${index + 1} has invalid marks.`);
  }
  return { ...value, student: value.student, answers, marksByQuestion: value.marksByQuestion, score: value.score, maximum: value.maximum };
}

function normalizeFeeNote(value: unknown, index: number): LocalFeeNote {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.description !== 'string'
    || typeof value.amountKes !== 'number'
    || !Number.isFinite(value.amountKes)) {
    throw new Error(`Stored Console fee note ${index + 1} is invalid.`);
  }
  return { id: value.id, description: value.description, amountKes: value.amountKes };
}

function normalizeSnapshot(value: unknown): ConsoleSnapshot {
  if (!isRecord(value)) throw new Error('Stored School Console snapshot is malformed and was not changed.');
  const snapshot = { ...initialConsoleSnapshot, ...value };

  if (!Array.isArray(snapshot.markedPapers)
    || !Array.isArray(snapshot.completedTasks)
    || !Array.isArray(snapshot.inspectionChecks)
    || !Array.isArray(snapshot.tenderDrafts)
    || !Array.isArray(snapshot.feeNotes)) {
    throw new Error('Stored School Console snapshot contains invalid lists and was not changed.');
  }
  if (typeof snapshot.lessonDraft !== 'string'
    || !snapshot.completedTasks.every(item => typeof item === 'string')
    || !snapshot.inspectionChecks.every(item => typeof item === 'string')) {
    throw new Error('Stored School Console snapshot contains invalid values and was not changed.');
  }

  return {
    ...snapshot,
    markedPapers: snapshot.markedPapers.map(normalizeMarkedPaper),
    lessonDraft: snapshot.lessonDraft,
    completedTasks: snapshot.completedTasks,
    inspectionChecks: snapshot.inspectionChecks,
    tenderDrafts: snapshot.tenderDrafts.map(normalizeTenderDraft),
    feeNotes: snapshot.feeNotes.map(normalizeFeeNote),
  };
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('This browser does not provide IndexedDB.'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(objectStoreName)) {
        request.result.createObjectStore(objectStoreName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened.'));
    request.onblocked = () => reject(new Error('IndexedDB is blocked by another open Console tab.'));
  });
}

export async function loadConsoleSnapshot(): Promise<ConsoleSnapshot> {
  const database = await openDatabase();
  try {
    const raw = await new Promise<unknown>((resolve, reject) => {
      const request = database.transaction(objectStoreName, 'readonly')
        .objectStore(objectStoreName)
        .get(snapshotKey);
      request.onsuccess = () => resolve(request.result === undefined ? initialConsoleSnapshot : request.result);
      request.onerror = () => reject(request.error ?? new Error('Local Console data could not be read.'));
    });
    return normalizeSnapshot(raw);
  } finally {
    database.close();
  }
}

export async function saveConsoleSnapshot(snapshot: ConsoleSnapshot): Promise<void> {
  const safeSnapshot = normalizeSnapshot(snapshot);
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(objectStoreName, 'readwrite');
      transaction.objectStore(objectStoreName).put(safeSnapshot, snapshotKey);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Local Console data could not be saved.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('The local Console save was cancelled.'));
    });
  } finally {
    database.close();
  }
}