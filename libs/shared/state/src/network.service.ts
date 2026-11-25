/**
 * @apt-labs/shared/state — NetworkService
 *
 * Empty directory projection until real, permission-scoped actor records are
 * connected. Synthetic demo people are never presented as network members.
 */

import { Injectable, signal, computed } from '@angular/core';

export type NetworkGroup = 'all' | 'people' | 'crews' | 'institutions' | 'organizations';
export type DirectoryType = 'person' | 'crew' | 'institution' | 'organization';

/** One directory entry, shaped for the Network surfaces. */
export interface DirectoryRow {
  id: string;
  type: DirectoryType;
  name: string;
  description: string;
  capabilities: string[];
  assets: string[];
  registered: string;
  role?: string;
  institution?: string;
}

const GROUP_TYPES: Record<Exclude<NetworkGroup, 'all'>, DirectoryType[]> = {
  people: ['person'],
  crews: ['crew'],
  institutions: ['institution'],
  organizations: ['organization'],
};

export const GROUP_LABELS: Record<NetworkGroup, string> = {
  all: 'All',
  people: 'People',
  crews: 'Crews',
  institutions: 'Institutions',
  organizations: 'Organizations',
};

export function groupOf(type: DirectoryType): Exclude<NetworkGroup, 'all'> {
  for (const [group, types] of Object.entries(GROUP_TYPES)) {
    if (types.includes(type)) return group as Exclude<NetworkGroup, 'all'>;
  }
  return 'organizations';
}

@Injectable({ providedIn: 'root' })
export class NetworkService {
  /** Populated only from real actor records by the persistence adapter. */
  readonly directory: DirectoryRow[] = [];

  readonly filter = signal<NetworkGroup>('all');
  readonly groups = (Object.keys(GROUP_LABELS) as NetworkGroup[]).map((id) => ({ id, label: GROUP_LABELS[id] }));

  readonly counts = computed<Record<NetworkGroup, number>>(() => {
    const result: Record<NetworkGroup, number> = {
      all: this.directory.length,
      people: 0,
      crews: 0,
      institutions: 0,
      organizations: 0,
    };
    for (const row of this.directory) result[groupOf(row.type)] += 1;
    return result;
  });

  readonly visible = computed(() =>
    this.filter() === 'all' ? this.directory : this.directory.filter((row) => groupOf(row.type) === this.filter()),
  );

  readonly people = this.directory.filter((row) => row.type === 'person' || row.type === 'crew');
  readonly bodies = this.directory.filter((row) => row.type === 'institution' || row.type === 'organization');

  matchQuery(needle: string, row: DirectoryRow): boolean {
    const query = needle.trim().toLowerCase();
    if (!query) return true;
    return `${row.name} ${row.description} ${row.capabilities.join(' ')} ${row.institution ?? ''}`
      .toLowerCase()
      .includes(query);
  }
}
