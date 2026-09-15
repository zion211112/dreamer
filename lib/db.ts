// School data persistence for the console. Hand-rolled IndexedDB, zero deps.
// One database, four stores; upserts by key. If IndexedDB is unavailable
// (private mode, blocked) every call resolves with empty results and writes
// are dropped — the console keeps working in memory for the session.
//
// Nothing here touches the network. This is where a school's roll lives on
// the device, and where the JSON export in Student Records copies from.

export type StoreName = "students" | "assessments" | "meta" | "content";

const DB_NAME = "aptlabs-school-v1";
const DB_VERSION = 2;

let dbp: Promise<IDBDatabase | null> | null = null;

function open(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (!dbp) {
    dbp = new Promise((resolve) => {
      let req: IDBOpenDBRequest;
      try {
        req = indexedDB.open(DB_NAME, DB_VERSION);
      } catch {
        return resolve(null);
      }
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("students"))
          db.createObjectStore("students", { keyPath: "id" });
        if (!db.objectStoreNames.contains("assessments"))
          db.createObjectStore("assessments", { keyPath: "key" });
        if (!db.objectStoreNames.contains("meta"))
          db.createObjectStore("meta", { keyPath: "id" });
        // Content Studio (15/16): the content bank and exam papers. Items and
        // papers are documents in one store, tagged by kind.
        if (!db.objectStoreNames.contains("content"))
          db.createObjectStore("content", { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    });
  }
  return dbp;
}

export async function idbAll<T>(store: StoreName): Promise<T[]> {
  const db = await open();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function idbPut<T>(store: StoreName, value: T): Promise<void> {
  const db = await open();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function idbBulkPut<T>(store: StoreName, values: T[]): Promise<void> {
  const db = await open();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(store, "readwrite");
      const os = tx.objectStore(store);
      for (const v of values) os.put(v);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function idbDelete(store: StoreName, key: IDBValidKey): Promise<void> {
  const db = await open();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function idbClear(store: StoreName): Promise<void> {
  const db = await open();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}
