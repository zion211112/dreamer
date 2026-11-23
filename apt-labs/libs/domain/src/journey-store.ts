/**
 * APT-LABS — In-memory JourneyStore
 *
 * A concrete, framework-free `JourneyStore` the coordination journey functions
 * operate on. Backed by plain arrays so it can be seeded, reset, and asserted
 * without reactivity or a browser. A production deployment swaps this for a
 * Supabase / IndexedDB-backed store of the same shape; the journey logic — and
 * everything built on top of it — is unchanged.
 */

import type { JourneyStore } from './commitment-journey';

/** A fresh, empty in-memory journey store. */
export function createJourneyStore(): JourneyStore {
  return { records: [], relationships: [], auditEvents: [] };
}
