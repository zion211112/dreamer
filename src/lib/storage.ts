/**
 * APT-LABS — Storage abstraction (Gate 1 — Foundations)
 *
 * Browser: localStorage. Node / tests: in-memory fallback so the same module
 * logic runs under Vitest's node environment without a DOM.
 *
 * Modules that keep records locally (actors, audit, records, …) call into
 * this instead of touching localStorage directly, so persistence swaps in
 * Supabase (production) without changing call sites.
 */

const memoryStore = new Map<string, string>();

function hasNativeStorage(): boolean {
  return typeof globalThis !== 'undefined'
    && typeof (globalThis as Record<string, unknown>).localStorage !== 'undefined'
    && (globalThis as Record<string, unknown>).localStorage !== null;
}

function nativeStorage(): Storage | undefined {
  return hasNativeStorage() ? (globalThis as unknown as { localStorage?: Storage }).localStorage : undefined;
}

/** Read a JSON value from the active store, falling back on missing or invalid data. */
export function readJson<T>(key: string, fallback: T): T {
  const ls = nativeStorage();
  let raw: string | null = null;
  if (ls) {
    try {
      raw = ls.getItem(key);
    } catch {
      raw = null;
    }
  } else {
    raw = memoryStore.get(key) ?? null;
  }
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Write a JSON value to the active store. */
export function writeJson<T>(key: string, value: T): void {
  const ls = nativeStorage();
  if (ls) {
    try {
      ls.setItem(key, JSON.stringify(value));
    } catch {
      // Quota or serialization failure is non-fatal for demo mode.
    }
  } else {
    memoryStore.set(key, JSON.stringify(value));
  }
}

/** Read a raw string value. */
export function getItem(key: string): string | null {
  const ls = nativeStorage();
  if (ls) {
    try {
      return ls.getItem(key);
    } catch {
      return null;
    }
  }
  return memoryStore.get(key) ?? null;
}

/** Write a raw string value. */
export function setItem(key: string, value: string): void {
  const ls = nativeStorage();
  if (ls) {
    try {
      ls.setItem(key, value);
    } catch {
      // Ignore quota failures in demo mode.
    }
  } else {
    memoryStore.set(key, value);
  }
}

/** Remove a key. */
export function removeItem(key: string): void {
  const ls = nativeStorage();
  if (ls) {
    try {
      ls.removeItem(key);
    } catch {
      // Ignore.
    }
  } else {
    memoryStore.delete(key);
  }
}

/**
 * Test-only: clear the in-memory fallback store. In the browser this is a no-op
 * relative to real localStorage; tests that run in node call it to reset state.
 */
export function clearAllStore(): void {
  memoryStore.clear();
}
