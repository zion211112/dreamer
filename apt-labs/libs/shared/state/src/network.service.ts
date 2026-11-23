/**
 * @apt-labs/shared/state — NetworkService
 *
 * Angular signal-based replacement for the Pinia `useNetworkStore`.
 * Drives the Network surface from the system of record using signals.
 */

import { Injectable, signal, computed } from '@angular/core';

// Domain imports (to be wired once libs/domain is populated)
// import {
//   listActors,
//   ACTOR_TYPE_LABELS,
//   type Actor,
//   type ActorType,
// } from '@apt-labs/domain/actors';
// import { getProductiveProfile, type ProductiveProfile } from '@apt-labs/domain/onboarding-journey';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NetworkGroup = 'all' | 'people' | 'crews' | 'institutions' | 'organizations';

export interface DirectoryRow {
  actor: unknown; // Actor
  typeLabel: string;
  capabilities: string[];
  assets: string[];
}

const GROUP_TYPES: Record<Exclude<NetworkGroup, 'all'>, string[]> = {
  people: ['individual'],
  crews: ['crew'],
  institutions: [
    'Institution',
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

export function groupOf(type: string): Exclude<NetworkGroup, 'all'> {
  for (const [group, types] of Object.entries(GROUP_TYPES)) {
    if (types.includes(type)) return group as Exclude<NetworkGroup, 'all'>;
  }
  return 'organizations';
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class NetworkService {
  readonly profiles = signal<unknown[]>([]);
  readonly filter = signal<NetworkGroup>('all');

  /** Re-read the system of record. */
  load(): void {
    // Will be wired when domain functions are available
  }

  readonly rows = computed<DirectoryRow[]>(() =>
    this.profiles().map((p: any) => ({
      actor: p?.actor,
      typeLabel: (p?.actor?.type as string) ?? 'Unknown',
      capabilities: (p?.capabilities ?? []).map(
        (c: any) => (c?.data?.name ?? c?.type ?? '') as string,
      ),
      assets: (p?.assets ?? []).map((a: any) => (a?.data?.name ?? a?.type ?? '') as string),
    })),
  );

  readonly visible = computed(() =>
    this.filter() === 'all'
      ? this.rows()
      : this.rows().filter((r) => groupOf(r.actor as any) === this.filter()),
  );

  readonly counts = computed(() => {
    const c: Record<NetworkGroup, number> = {
      all: this.rows().length,
      people: 0,
      crews: 0,
      institutions: 0,
      organizations: 0,
    };
    for (const r of this.rows()) {
      c[groupOf(r.actor as any)] += 1;
    }
    return c;
  });
}
