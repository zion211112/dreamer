/**
 * APT-LABS — Coordination Matching (Gate 3 → Gate 4 bridge)
 *
 * "Reveals what is missing, enables what can be built." This engine takes the
 * needs a platform holds and the productive capacity its actors have registered,
 * and answers one question per need: *who can answer this, and what can't be
 * answered yet?*
 *
 * Matching is **declarative**, not fuzzy: a need names the capability
 * categories it requires (`requires`), and a provider matches when it offers a
 * capability in one of those categories. No opaque scoring — the result is
 * inspectable (`matchedOn` says exactly which requirement a provider satisfies),
 * which is what makes the coordination trustworthy. A need with no matching
 * provider is surfaced as *missing* — the concrete, actionable gap.
 */

import { getRecord, listRecords } from './record-envelope';
import type { ProductiveProfile } from './onboarding-journey';

// ---------------------------------------------------------------------------
// Provider input
// ---------------------------------------------------------------------------

export interface ProviderCapabilityRef {
  id: string;
  /** CAPABILITY type discriminator (e.g. 'Skill', 'OperationalCapacity'). */
  type: string;
  name: string;
}

export interface Provider {
  actorId: string;
  name: string;
  capabilities: ProviderCapabilityRef[];
}

/**
 * Build the matching input from composed productive profiles (the onboarding
 * result). Only active capability records count.
 */
export function providersFromProfiles(profiles: Array<ProductiveProfile | undefined>): Provider[] {
  return profiles
    .filter((p): p is ProductiveProfile => Boolean(p))
    .map((p) => ({
      actorId: p.actor.id,
      name: p.actor.name,
      capabilities: p.capabilities.map((rec) => ({
        id: rec.id,
        type: rec.type,
        name: ((rec.data as { name?: string }).name ?? rec.type) as string,
      })),
    }));
}

// ---------------------------------------------------------------------------
// Matching result
// ---------------------------------------------------------------------------

export interface ProviderMatch {
  providerActorId: string;
  providerName: string;
  /** The provider's capabilities that satisfy the need. */
  matchedCapabilityIds: string[];
  /** The requirement categories that a matched capability satisfies. */
  matchedOn: string[];
}

export interface NeedMatching {
  needId: string;
  need: string;
  /** The capability categories the need declared it requires. */
  requires: string[];
  matches: ProviderMatch[];
  /** True when no provider offers any of the required categories. */
  isMissing: boolean;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

function needPayload(needId: string): { need?: string; requires?: string[]; status?: string } {
  const rec = getRecord(needId);
  return (rec?.data ?? {}) as { need?: string; requires?: string[]; status?: string };
}

/**
 * Match a set of need ids against the providers that can answer them.
 * A provider matches a need when it offers a capability whose type is one of
 * the need's declared `requires` categories.
 */
export function matchNeeds(needIds: string[], providers: Provider[]): NeedMatching[] {
  return needIds.map((needId) => {
    const data = needPayload(needId);
    const requires = data.requires ?? [];

    const matches: ProviderMatch[] = [];
    for (const provider of providers) {
      const matchedCapabilityIds: string[] = [];
      const matchedOn: string[] = [];
      for (const cap of provider.capabilities) {
        if (requires.includes(cap.type)) {
          matchedCapabilityIds.push(cap.id);
          if (!matchedOn.includes(cap.type)) matchedOn.push(cap.type);
        }
      }
      if (matchedCapabilityIds.length > 0) {
        matches.push({
          providerActorId: provider.actorId,
          providerName: provider.name,
          matchedCapabilityIds,
          matchedOn,
        });
      }
    }

    return {
      needId,
      need: data.need ?? '',
      requires,
      matches,
      isMissing: matches.length === 0,
    };
  });
}

/**
 * The composed "what is missing" view: every currently-open need, matched
 * against the given providers, with the unmatched ones flagged. This is the
 * coordination surface that tells the platform what has not been built yet.
 */
export function matchOpenNeeds(providers: Provider[]): NeedMatching[] {
  const openNeedIds = listRecords({ family: 'INTENTION', type: 'Need' })
    .filter((rec) => ((rec.data as { status?: string }).status ?? 'open') === 'open')
    .map((rec) => rec.id);
  return matchNeeds(openNeedIds, providers);
}

/** The needs in a matching result that no provider can answer. */
export function findMissingNeeds(matchings: NeedMatching[]): NeedMatching[] {
  return matchings.filter((m) => m.isMissing);
}
