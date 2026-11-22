/**
 * APT-LABS — Supabase storage adapter (production backend).
 *
 * Implements the same readJson/writeJson/getItem/setItem/removeItem surface
 * as `src/lib/storage.ts` so `record-envelope.ts`, `relationship-store.ts`,
 * `evidence-store.ts`, `commitment-journey.ts`, `matching.ts` and every other
 * caller keep working unchanged when Supabase is configured.
 *
 * Every JSON document lives in the `public.apt_storage` key-value table under
 * a namespaced key (e.g. `aptlabs:records`). Values are stored as JSONB.
 *
 * Reads fall back to demo-mode localStorage when Supabase is not configured;
 * writes throw a clear error telling the operator to set env vars.
 */

import { getSupabase, isDemoMode } from './client';

// A single namespaced table holds every document. Keys are the existing
// localStorage keys so demo data and production data share the same shape.
const STORAGE_TABLE = 'apt_storage';

/** Lazily-created Supabase client (null in demo mode). */
function client() {
  if (isDemoMode) return null;
  return getSupabase();
}

/** Read a JSON value from Supabase, falling back to demo-mode store. */
export async function readJsonSupabase<T>(key: string, fallback: T): Promise<T> {
  const sb = client();
  if (!sb) {
    // Demo mode: delegate to the browser localStorage implementation.
    const { readJson } = await import('../storage');
    return readJson(key, fallback);
  }

  const { data, error } = await sb
    .from(STORAGE_TABLE)
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    // PGRST116 = row not found → return fallback (first-ever write).
    if ((error as { code?: string }).code === 'PGRST116') return fallback;
    throw new Error(`Supabase readJson(${key}) failed: ${error.message}`);
  }

  return (data as { value: T }).value as T;
}

/** Write a JSON value to Supabase (upsert). */
export async function writeJsonSupabase<T>(key: string, value: T): Promise<void> {
  const sb = client();
  if (!sb) {
    const { writeJson } = await import('../storage');
    return writeJson(key, value);
  }

  const now = new Date().toISOString();
  const { error } = await sb.from(STORAGE_TABLE).upsert(
    { key, value, updated_at: now },
    { onConflict: 'key' },
  );

  if (error) {
    throw new Error(`Supabase writeJson(${key}) failed: ${error.message}`);
  }
}

/** Read a raw string value. */
export async function getItemSupabase(key: string): Promise<string | null> {
  const sb = client();
  if (!sb) {
    const { getItem } = await import('../storage');
    return getItem(key);
  }

  const { data, error } = await sb
    .from(STORAGE_TABLE)
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if ((error as { code?: string }).code === 'PGRST116') return null;
    throw new Error(`Supabase getItem(${key}) failed: ${error.message}`);
  }

  return typeof (data as { value: unknown }).value === 'string'
    ? ((data as { value: string }).value)
    : JSON.stringify((data as { value: unknown }).value);
}

/** Write a raw string value. */
export async function setItemSupabase(key: string, value: string): Promise<void> {
  const sb = client();
  if (!sb) {
    const { setItem } = await import('../storage');
    return setItem(key, value);
  }

  const now = new Date().toISOString();
  const { error } = await sb.from(STORAGE_TABLE).upsert(
    { key, value, updated_at: now },
    { onConflict: 'key' },
  );

  if (error) {
    throw new Error(`Supabase setItem(${key}) failed: ${error.message}`);
  }
}

/** Remove a key. */
export async function removeItemSupabase(key: string): Promise<void> {
  const sb = client();
  if (!sb) {
    const { removeItem } = await import('../storage');
    return removeItem(key);
  }

  const { error } = await sb.from(STORAGE_TABLE).delete().eq('key', key);
  if (error) {
    throw new Error(`Supabase removeItem(${key}) failed: ${error.message}`);
  }
}

/** Test-only: clear every row in the storage table. */
export async function clearAllStoreSupabase(): Promise<void> {
  const sb = client();
  if (!sb) {
    const { clearAllStore } = await import('../storage');
    return clearAllStore();
  }

  const { error } = await sb.from(STORAGE_TABLE).delete().neq('key', '');
  if (error) {
    throw new Error(`Supabase clearAllStore failed: ${error.message}`);
  }
}

/** Returns true when Supabase is configured (production backend active). */
export function isSupabaseBackend(): boolean {
  return !isDemoMode;
}
