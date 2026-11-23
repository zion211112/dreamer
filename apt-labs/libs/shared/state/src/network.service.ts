/**
 * @apt-labs/shared/state — NetworkService
 *
 * The Network surface is not its own data island: it projects the same
 * operational corpus (OPERATIONAL_PILOTS) the Workbench, Records and Value read,
 * into a live directory of people, crews, institutions and organizations. There
 * is no separate `listActors()` in the domain layer, so the directory is
 * *derived*: each participant is a person, each undertaking's assembled team is a
 * crew, and each commissioning body is an institution or organization. One
 * action that touches the corpus shows up here — the network and the record are
 * one system.
 */

import { Injectable, signal, computed } from '@angular/core';
import { OPERATIONAL_PILOTS, type OperationalPilot } from '@apt-labs/domain';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  /** For people: the role they hold in the undertaking. */
  role?: string;
  /** The institution / undertaking this entry acts under. */
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

/** Which pill a directory type files under. */
export function groupOf(type: DirectoryType): Exclude<NetworkGroup, 'all'> {
  for (const [group, types] of Object.entries(GROUP_TYPES)) {
    if (types.includes(type)) return group as Exclude<NetworkGroup, 'all'>;
  }
  return 'organizations';
}

// ---------------------------------------------------------------------------
// Derivation helpers
// ---------------------------------------------------------------------------

function unionCaps(pilot: OperationalPilot): string[] {
  return Array.from(new Set(pilot.participants.flatMap((p) => p.capabilityClaims)));
}

/** Classify a commissioning body as a formal organization or a community institution. */
function classifyOrg(name: string): DirectoryType {
  return /(coop|company|corporate|enterprise|lab|guild|consortium)/i.test(name)
    ? 'organization'
    : 'institution';
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function registeredAt(pilot: OperationalPilot): string {
  return (pilot.acceptance.acceptedAt ?? '').slice(0, 10) || '—';
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class NetworkService {
  /** The derived directory, built once from the operational corpus. */
  readonly directory: DirectoryRow[] = buildDirectory(OPERATIONAL_PILOTS);

  readonly filter = signal<NetworkGroup>('all');

  readonly groups = (Object.keys(GROUP_LABELS) as NetworkGroup[]).map((id) => ({ id, label: GROUP_LABELS[id] }));

  /** Pill counts over the whole directory. */
  readonly counts = computed<Record<NetworkGroup, number>>(() => {
    const c: Record<NetworkGroup, number> = { all: this.directory.length, people: 0, crews: 0, institutions: 0, organizations: 0 };
    for (const r of this.directory) c[groupOf(r.type)] += 1;
    return c;
  });

  /** The active pill's rows (All when 'all'). */
  readonly visible = computed(() =>
    this.filter() === 'all' ? this.directory : this.directory.filter((r) => groupOf(r.type) === this.filter()),
  );

  /** People & crews — the People surface. */
  readonly people = this.directory.filter((r) => r.type === 'person' || r.type === 'crew');

  /** Institutions & organizations — the Institutions surface. */
  readonly bodies = this.directory.filter((r) => r.type === 'institution' || r.type === 'organization');

  /** Case-insensitive search across an entry's identity, description and capabilities. */
  matchQuery(needle: string, r: DirectoryRow): boolean {
    const q = needle.trim().toLowerCase();
    if (!q) return true;
    return (r.name + ' ' + r.description + ' ' + r.capabilities.join(' ') + ' ' + (r.institution ?? '')).toLowerCase().includes(q);
  }
}

/** Derive the full directory from the operational corpus (people, bodies, crews). */
function buildDirectory(pilots: OperationalPilot[]): DirectoryRow[] {
  const rows: DirectoryRow[] = [];

  // People — one entry per distinct participant, capabilities merged.
  const seenPerson = new Map<string, DirectoryRow>();
  for (const pilot of pilots) {
    for (const p of pilot.participants) {
      const existing = seenPerson.get(p.personId);
      if (existing) {
        existing.capabilities = Array.from(new Set([...existing.capabilities, ...p.capabilityClaims]));
      } else {
        seenPerson.set(p.personId, {
          id: p.personId,
          type: 'person',
          name: p.personName,
          description: `${capitalize(p.role)} on ${pilot.label}.`,
          capabilities: [...p.capabilityClaims],
          assets: pilot.deliverables,
          registered: registeredAt(pilot),
          role: p.role,
          institution: pilot.institution.name,
        });
      }
    }
  }
  rows.push(...seenPerson.values());

  // Institutions & organizations — one entry per distinct commissioning body.
  const seenBody = new Map<string, DirectoryRow>();
  for (const pilot of pilots) {
    const inst = pilot.institution;
    if (seenBody.has(inst.id)) continue;
    seenBody.set(inst.id, {
      id: inst.id,
      type: classifyOrg(inst.name),
      name: inst.name,
      description: pilot.scope,
      capabilities: unionCaps(pilot),
      assets: pilot.deliverables,
      registered: registeredAt(pilot),
    });
  }
  rows.push(...seenBody.values());

  // Crews — the assembled team for each undertaking.
  for (const pilot of pilots) {
    rows.push({
      id: `crew-${pilot.id}`,
      type: 'crew',
      name: `${pilot.label} · team`,
      description: `${pilot.participants.length}-person crew assembled for ${pilot.label}.`,
      capabilities: unionCaps(pilot),
      assets: pilot.deliverables,
      registered: registeredAt(pilot),
      institution: pilot.institution.name,
    });
  }

  return rows;
}
