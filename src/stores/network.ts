/**
 * APT-LABS — Network directory store (the real-integration layer for the
 * per-module surfaces)
 *
 * Drives the Network surface from the system of record: every row is a real
 * Actor read from `listActors()`, composed with its productive profile
 * (what it has, what it can do) by `getProductiveProfile()`. No mock arrays —
 * an empty directory is a true empty state, pointing at the onboarding flow.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  listActors,
  ACTOR_TYPE_LABELS,
  type Actor,
  type ActorType,
} from '@/lib/actors';
import { getProductiveProfile, type ProductiveProfile } from '@/lib/onboarding-journey';

export type NetworkGroup = 'all' | 'people' | 'crews' | 'institutions' | 'organizations';

export interface DirectoryRow {
  actor: Actor;
  typeLabel: string;
  /** What the actor can do (CAPABILITY records). */
  capabilities: string[];
  /** What the actor has (RESOURCE records). */
  assets: string[];
}

const GROUP_TYPES: Record<Exclude<NetworkGroup, 'all'>, ActorType[]> = {
  people: ['individual'],
  crews: ['crew'],
  institutions: [
    'institution',
    'university',
    'school',
    'researchLab',
    'governmentUnit',
    'ngo',
  ],
  organizations: [
    'company',
    'enterprise',
    'startup',
    'cooperative',
    'communityOrganisation',
    'consortium',
    'other',
  ],
};

export const GROUP_LABELS: Record<NetworkGroup, string> = {
  all: 'All',
  people: 'People',
  crews: 'Crews',
  institutions: 'Institutions',
  organizations: 'Organizations',
};

export function groupOf(type: ActorType): Exclude<NetworkGroup, 'all'> {
  for (const [group, types] of Object.entries(GROUP_TYPES)) {
    if (types.includes(type)) return group as Exclude<NetworkGroup, 'all'>;
  }
  return 'organizations';
}

export const useNetworkStore = defineStore('network', () => {
  const profiles = ref<ProductiveProfile[]>([]);
  const filter = ref<NetworkGroup>('all');

  /** Re-read the system of record (localStorage in demo mode). */
  function load(): void {
    profiles.value = listActors()
      .map((a) => getProductiveProfile(a.id))
      .filter((p): p is ProductiveProfile => Boolean(p));
  }

  const rows = computed<DirectoryRow[]>(() =>
    profiles.value.map((p) => ({
      actor: p.actor,
      typeLabel: ACTOR_TYPE_LABELS[p.actor.type],
      capabilities: p.capabilities.map(
        (c) => ((c.data as { name?: string }).name ?? c.type) as string,
      ),
      assets: p.assets.map((a) => ((a.data as { name?: string }).name ?? a.type) as string),
    })),
  );

  const visible = computed(() =>
    filter.value === 'all'
      ? rows.value
      : rows.value.filter((r) => groupOf(r.actor.type) === filter.value),
  );

  const counts = computed(() => {
    const c: Record<NetworkGroup, number> = {
      all: rows.value.length,
      people: 0,
      crews: 0,
      institutions: 0,
      organizations: 0,
    };
    for (const r of rows.value) c[groupOf(r.actor.type)] += 1;
    return c;
  });

  load();

  return { profiles, filter, rows, visible, counts, load };
});
