import type { MarkedPaper } from './mark-engine';
import type { SchoolTenderBOMLineDraft } from './school-tender';

export interface SchoolTenderDraft {
  id: string;
  assetName: string;
  need: string;
  importQuote: string;
  localQuote: string;
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

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('This browser does not provide IndexedDB.'));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(objectStoreName);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened.'));
    request.onblocked = () => reject(new Error('IndexedDB is blocked by another open Console tab.'));
  });
}

export async function loadConsoleSnapshot(): Promise<ConsoleSnapshot> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(objectStoreName, 'readonly')
        .objectStore(objectStoreName)
        .get(snapshotKey);
      request.onsuccess = () => {
        const snapshot = (request.result as ConsoleSnapshot | undefined) ?? initialConsoleSnapshot;
        resolve({
          ...initialConsoleSnapshot,
          ...snapshot,
          tenderDrafts: (snapshot.tenderDrafts ?? []).map(draft => ({
            ...draft,
            blueprintLines: Array.isArray(draft.blueprintLines) ? draft.blueprintLines : [],
          })),
        });
      };
      request.onerror = () => reject(request.error ?? new Error('Local Console data could not be read.'));
    });
  } finally {
    database.close();
  }
}

export async function saveConsoleSnapshot(snapshot: ConsoleSnapshot): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(objectStoreName, 'readwrite');
      transaction.objectStore(objectStoreName).put(snapshot, snapshotKey);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Local Console data could not be saved.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('The local Console save was cancelled.'));
    });
  } finally {
    database.close();
  }
}
