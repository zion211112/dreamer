import { getSupabase, isDemoMode } from '../supabase/client';
import { computeHashAnchor, createCanonicalRollJson } from './roll-hash';

export type RollLayer = 'public' | 'participant' | 'restricted';
export type UndertakingType = 'physical' | 'digital' | 'creative' | 'hybrid';

export interface RollEntry {
  id: string;
  undertaking_id: string;
  undertaking_type: UndertakingType;
  title: string;
  scope: string;
  deliverables: string[];
  reusable_designs: Record<string, unknown> | null;
  commissioned_by: {
    institution_id: string;
    name: string;
    coordinator_id: string;
  };
  participants: Array<{
    role_type: 'anchor' | 'builder' | 'apprentice' | 'coordinator';
    person_id: string;
    profile_id: string | null;
    name: string;
    capability_claims: string[];
    evidence_ids: string[];
  }>;
  evidence: Array<{
    id: string;
    layer: RollLayer;
    title: string;
    file_url: string | null;
    description: string | null;
  }>;
  acceptance: {
    accepted_by: string;
    accepted_at: string;
    inspection_report_id: string | null;
    cost_disclosed: { amount: number; currency: string } | null;
  };
  maintenance_obligations: Record<string, unknown> | null;
  recorded_at: string;
  recorded_by: string;
  hash_anchor: string;
  version: number;
}

export interface RollRevision {
  id: string;
  entry_id: string;
  revised_by: string;
  revised_at: string;
  previous_hash: string;
  new_hash: string;
  change_summary: string;
  change_type: 'correction' | 'restriction_change' | 'evidence_added';
}

export interface RollEvidenceFile {
  id: string;
  entry_id: string;
  layer: RollLayer;
  title: string;
  description: string | null;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface RollQueryFilters {
  undertaking_type?: UndertakingType;
  institution_id?: string;
  person_id?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

const DEMO_ROLL_STORAGE_KEY = 'demo_roll_entries';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isRollParticipant(value: unknown): value is RollEntry['participants'][number] {
  return isRecord(value)
    && ['anchor', 'builder', 'apprentice', 'coordinator'].includes(String(value.role_type))
    && typeof value.person_id === 'string'
    && (typeof value.profile_id === 'string' || value.profile_id === null)
    && typeof value.name === 'string'
    && isStringArray(value.capability_claims)
    && isStringArray(value.evidence_ids);
}

function isRollEvidence(value: unknown): value is RollEntry['evidence'][number] {
  return isRecord(value)
    && typeof value.id === 'string'
    && ['public', 'participant', 'restricted'].includes(String(value.layer))
    && typeof value.title === 'string'
    && (typeof value.file_url === 'string' || value.file_url === null)
    && (typeof value.description === 'string' || value.description === null);
}

function isRollEntry(value: unknown): value is RollEntry {
  if (!isRecord(value)) return false;
  const commissionedBy = value.commissioned_by;
  const acceptance = value.acceptance;
  const costDisclosed = isRecord(acceptance) ? acceptance.cost_disclosed : undefined;
  return typeof value.id === 'string'
    && typeof value.undertaking_id === 'string'
    && ['physical', 'digital', 'creative', 'hybrid'].includes(String(value.undertaking_type))
    && typeof value.title === 'string'
    && typeof value.scope === 'string'
    && isStringArray(value.deliverables)
    && (value.reusable_designs === null || isRecord(value.reusable_designs))
    && isRecord(commissionedBy)
    && typeof commissionedBy.institution_id === 'string'
    && typeof commissionedBy.name === 'string'
    && typeof commissionedBy.coordinator_id === 'string'
    && Array.isArray(value.participants)
    && value.participants.every(isRollParticipant)
    && Array.isArray(value.evidence)
    && value.evidence.every(isRollEvidence)
    && isRecord(acceptance)
    && typeof acceptance.accepted_by === 'string'
    && typeof acceptance.accepted_at === 'string'
    && (typeof acceptance.inspection_report_id === 'string' || acceptance.inspection_report_id === null)
    && (costDisclosed === null || (isRecord(costDisclosed)
      && typeof costDisclosed.amount === 'number'
      && typeof costDisclosed.currency === 'string'))
    && (value.maintenance_obligations === null || isRecord(value.maintenance_obligations))
    && typeof value.recorded_at === 'string'
    && typeof value.recorded_by === 'string'
    && typeof value.hash_anchor === 'string'
    && typeof value.version === 'number';
}

function readDemoRollEntries(): RollEntry[] {
  let serialized: string | null;
  try {
    serialized = localStorage.getItem(DEMO_ROLL_STORAGE_KEY);
  } catch (error) {
    throw new Error('Demo Roll entries are unreadable from this browser.', { cause: error });
  }
  if (serialized === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    throw new Error('Demo Roll entries are unreadable: stored data is not valid JSON.', { cause: error });
  }
  if (!Array.isArray(parsed) || !parsed.every(isRollEntry)) {
    throw new Error('Demo Roll entries are unreadable: stored data does not match the Roll entry format.');
  }
  return parsed;
}

function writeDemoRollEntries(entries: RollEntry[]): void {
  try {
    localStorage.setItem(DEMO_ROLL_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    throw new Error('Demo Roll entries could not be saved in this browser.', { cause: error });
  }
}

// Create Roll Entry (the primary write operation)
export async function createRollEntry(
  data: Omit<RollEntry, 'id' | 'recorded_at' | 'hash_anchor' | 'version'>,
  userId: string
): Promise<RollEntry> {
  const now = new Date().toISOString();

  // Compute hash anchor from canonical JSON (shared with verification)
  const canonical = createCanonicalRollJson({
    undertaking_id: data.undertaking_id,
    undertaking_type: data.undertaking_type,
    title: data.title,
    scope: data.scope,
    deliverables: data.deliverables,
    commissioned_by: data.commissioned_by,
    participants: data.participants,
    acceptance: data.acceptance,
  });

  const hash_anchor = await computeHashAnchor(canonical);

  if (isDemoMode) {
    const existing = readDemoRollEntries();
    const newEntry: RollEntry = {
      ...data,
      id: crypto.randomUUID(),
      recorded_at: now,
      recorded_by: userId,
      hash_anchor,
      version: 1,
    };
    existing.unshift(newEntry);
    writeDemoRollEntries(existing);
    return newEntry;
  }

  const supabase = getSupabase();
  const { data: entry, error } = await supabase
    .from('roll_entries')
    .insert({
      ...data,
      recorded_at: now,
      recorded_by: userId,
      hash_anchor,
      version: 1,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return entry as RollEntry;
}

export async function getRollEntry(id: string): Promise<RollEntry | null> {
  if (isDemoMode) {
    return null;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('roll_entries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as RollEntry;
}

// Demo fixtures for local evaluation
const DEMO_ROLL_ENTRIES: RollEntry[] = [
  {
    id: 'demo-1',
    undertaking_id: 'undertaking-physical-001',
    undertaking_type: 'physical',
    title: 'DEMO · Community Workshop Build-out',
    scope: 'Example scope for converting a shared room into a flexible workshop.',
    deliverables: ['Example layout', 'Sample equipment plan', 'Demo orientation checklist'],
    reusable_designs: { layout_template: 'example-workshop-layout' },
    commissioned_by: { institution_id: 'demo-inst-001', name: 'Example Makerspace · Demo', coordinator_id: 'demo-coord-001' },
    participants: [
      { role_type: 'coordinator', person_id: 'demo-coord-001', profile_id: null, name: 'Demo Coordinator 1', capability_claims: ['example-coordination'], evidence_ids: ['demo-evd-001'] },
      { role_type: 'anchor', person_id: 'demo-person-002', profile_id: null, name: 'Demo Participant 2', capability_claims: ['example-workshop-planning'], evidence_ids: ['demo-evd-002'] },
      { role_type: 'builder', person_id: 'demo-person-003', profile_id: null, name: 'Demo Participant 3', capability_claims: ['example-assembly'], evidence_ids: ['demo-evd-003'] },
    ],
    evidence: [
      { id: 'demo-evd-001', layer: 'public', title: 'Example handover checklist', file_url: null, description: 'Synthetic example of a public-layer record.' },
      { id: 'demo-evd-002', layer: 'participant', title: 'Example participant notes', file_url: null, description: 'Synthetic example of participant-layer material.' },
      { id: 'demo-evd-003', layer: 'restricted', title: 'Example internal checklist', file_url: null, description: 'Synthetic example of restricted-layer material.' },
    ],
    acceptance: { accepted_by: 'demo-coord-001', accepted_at: '2026-10-15T14:30:00Z', inspection_report_id: null, cost_disclosed: null },
    maintenance_obligations: null,
    recorded_at: '2026-10-15T14:35:00Z',
    recorded_by: 'demo-coord-001',
    hash_anchor: '',
    version: 1,
  },
  {
    id: 'demo-2',
    undertaking_id: 'undertaking-digital-001',
    undertaking_type: 'digital',
    title: 'DEMO · Community Resource Directory',
    scope: 'Example scope for a searchable directory of fictional community resources.',
    deliverables: ['Example data model', 'Sample directory screen', 'Demo usage notes'],
    reusable_designs: { api_pattern: 'example-directory-pattern' },
    commissioned_by: { institution_id: 'demo-inst-002', name: 'Example Civic Lab · Demo', coordinator_id: 'demo-coord-002' },
    participants: [
      { role_type: 'coordinator', person_id: 'demo-coord-002', profile_id: null, name: 'Demo Coordinator 2', capability_claims: ['example-planning'], evidence_ids: ['demo-evd-011'] },
      { role_type: 'anchor', person_id: 'demo-person-005', profile_id: null, name: 'Demo Participant 5', capability_claims: ['example-data-design'], evidence_ids: ['demo-evd-012'] },
      { role_type: 'builder', person_id: 'demo-person-006', profile_id: null, name: 'Demo Participant 6', capability_claims: ['example-interface-design'], evidence_ids: ['demo-evd-013'] },
    ],
    evidence: [
      { id: 'demo-evd-011', layer: 'public', title: 'Example directory preview', file_url: null, description: 'Synthetic example of a public-layer record.' },
      { id: 'demo-evd-012', layer: 'participant', title: 'Example design notes', file_url: null, description: 'Synthetic example of participant-layer material.' },
      { id: 'demo-evd-013', layer: 'restricted', title: 'Example internal notes', file_url: null, description: 'Synthetic example of restricted-layer material.' },
    ],
    acceptance: { accepted_by: 'demo-coord-002', accepted_at: '2026-10-07T10:00:00Z', inspection_report_id: null, cost_disclosed: null },
    maintenance_obligations: null,
    recorded_at: '2026-10-07T10:05:00Z',
    recorded_by: 'demo-coord-002',
    hash_anchor: '',
    version: 1,
  },
  {
    id: 'demo-3',
    undertaking_id: 'undertaking-creative-001',
    undertaking_type: 'creative',
    title: 'DEMO · Neighborhood Story Collection',
    scope: 'Example scope for collecting fictional stories and arranging them in a small exhibit.',
    deliverables: ['Example prompt sheet', 'Sample exhibit outline', 'Demo collection index'],
    reusable_designs: { exhibit_system: 'example-modular-panels' },
    commissioned_by: { institution_id: 'demo-inst-003', name: 'Example Heritage Group · Demo', coordinator_id: 'demo-coord-003' },
    participants: [
      { role_type: 'coordinator', person_id: 'demo-coord-003', profile_id: null, name: 'Demo Coordinator 3', capability_claims: ['example-collection-planning'], evidence_ids: ['demo-evd-021'] },
      { role_type: 'anchor', person_id: 'demo-person-007', profile_id: null, name: 'Demo Participant 7', capability_claims: ['example-story-editing'], evidence_ids: ['demo-evd-022'] },
      { role_type: 'builder', person_id: 'demo-person-008', profile_id: null, name: 'Demo Participant 8', capability_claims: ['example-exhibit-layout'], evidence_ids: ['demo-evd-023'] },
    ],
    evidence: [
      { id: 'demo-evd-021', layer: 'public', title: 'Example exhibit outline', file_url: null, description: 'Synthetic example of a public-layer record.' },
      { id: 'demo-evd-022', layer: 'participant', title: 'Example editing notes', file_url: null, description: 'Synthetic example of participant-layer material.' },
      { id: 'demo-evd-023', layer: 'restricted', title: 'Example working notes', file_url: null, description: 'Synthetic example of restricted-layer material.' },
    ],
    acceptance: { accepted_by: 'demo-coord-003', accepted_at: '2026-09-29T16:00:00Z', inspection_report_id: null, cost_disclosed: null },
    maintenance_obligations: null,
    recorded_at: '2026-09-29T16:10:00Z',
    recorded_by: 'demo-coord-003',
    hash_anchor: '',
    version: 1,
  },
];

function cloneRollEntry(entry: RollEntry): RollEntry {
  return {
    ...entry,
    deliverables: [...entry.deliverables],
    reusable_designs: entry.reusable_designs ? structuredClone(entry.reusable_designs) : null,
    commissioned_by: { ...entry.commissioned_by },
    participants: entry.participants.map(participant => ({
      ...participant,
      capability_claims: [...participant.capability_claims],
      evidence_ids: [...participant.evidence_ids],
    })),
    evidence: entry.evidence.map(evidence => ({ ...evidence })),
    acceptance: {
      ...entry.acceptance,
      cost_disclosed: entry.acceptance.cost_disclosed ? { ...entry.acceptance.cost_disclosed } : null,
    },
    maintenance_obligations: entry.maintenance_obligations
      ? structuredClone(entry.maintenance_obligations)
      : null,
  };
}

export async function queryRollEntries(
  filters: RollQueryFilters = {}
): Promise<RollEntry[]> {
  if (isDemoMode) {
    const entries = [
      ...DEMO_ROLL_ENTRIES.map(cloneRollEntry),
      ...readDemoRollEntries().map(cloneRollEntry),
    ];
    for (const entry of entries) {
      if (!entry.hash_anchor) {
        entry.hash_anchor = await computeHashAnchor(createCanonicalRollJson(entry));
      }
    }

    // Apply filters
    let result = entries;
    if (filters.undertaking_type) {
      result = result.filter(e => e.undertaking_type === filters.undertaking_type);
    }
    if (filters.institution_id) {
      result = result.filter(e => e.commissioned_by.institution_id === filters.institution_id);
    }
    if (filters.person_id) {
      result = result.filter(e => e.participants.some(p => p.person_id === filters.person_id));
    }
    if (filters.from_date) {
      result = result.filter(e => e.recorded_at >= filters.from_date!);
    }
    if (filters.to_date) {
      result = result.filter(e => e.recorded_at <= filters.to_date!);
    }
    result.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    if (filters.limit) {
      result = result.slice(filters.offset || 0, (filters.offset || 0) + filters.limit);
    }
    return result;
  }

  const supabase = getSupabase();
  let query = supabase.from('roll_entries').select('*');

  if (filters.undertaking_type) {
    query = query.eq('undertaking_type', filters.undertaking_type);
  }
  if (filters.institution_id) {
    query = query.eq('commissioned_by->>institution_id', filters.institution_id);
  }
  if (filters.person_id) {
    query = query.contains('participants', [{ person_id: filters.person_id }]);
  }
  if (filters.from_date) {
    query = query.gte('recorded_at', filters.from_date);
  }
  if (filters.to_date) {
    query = query.lte('recorded_at', filters.to_date);
  }

  query = query.order('recorded_at', { ascending: false });

  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as RollEntry[];
}

// Participant export - returns only participant-layer data
export async function getParticipantRollEntries(personId: string): Promise<RollEntry[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('roll_entries')
    .select('*')
    .contains('participants', [{ person_id: personId }])
    .order('recorded_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as RollEntry[];
}

// Roll Revisions
export async function addRollRevision(
  data: Omit<RollRevision, 'id' | 'revised_at'>,
  userId: string
): Promise<RollRevision> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: revision, error } = await supabase
    .from('roll_revisions')
    .insert({
      ...data,
      revised_by: userId,
      revised_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return revision as RollRevision;
}

export async function getRollRevisions(entryId: string): Promise<RollRevision[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('roll_revisions')
    .select('*')
    .eq('entry_id', entryId)
    .order('revised_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as RollRevision[];
}

// Evidence Files
export async function addRollEvidenceFile(
  data: Omit<RollEvidenceFile, 'id' | 'uploaded_at'>,
  userId: string
): Promise<RollEvidenceFile> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: file, error } = await supabase
    .from('roll_evidence_files')
    .insert({
      ...data,
      uploaded_by: userId,
      uploaded_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return file as RollEvidenceFile;
}

export async function getRollEvidenceFiles(entryId: string, layer?: RollLayer): Promise<RollEvidenceFile[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  let query = supabase
    .from('roll_evidence_files')
    .select('*')
    .eq('entry_id', entryId);

  if (layer) {
    query = query.eq('layer', layer);
  }

  const { data, error } = await query.order('uploaded_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as RollEvidenceFile[];
}

// Access control helper
export function getRollAccess(
  entry: RollEntry,
  viewerId: string,
  viewerRole: string
): { public: boolean; participant: boolean; restricted: boolean } {
  const isCommissioner = viewerId === entry.commissioned_by.institution_id;
  const isCoordinator = viewerId === entry.commissioned_by.coordinator_id;
  const isParticipant = entry.participants.some(p => p.person_id === viewerId);
  const isAdmin = viewerRole === 'admin';

  return {
    public: true,
    participant: isCommissioner || isCoordinator || isParticipant || isAdmin,
    restricted: isCommissioner || isCoordinator || isAdmin,
  };
}

export function filterRollEntryByAccess(entry: RollEntry, access: { public: boolean; participant: boolean; restricted: boolean }): RollEntry {
  const filtered = { ...entry };

  // Filter evidence by layer access
  filtered.evidence = entry.evidence.filter(e => {
    if (e.layer === 'public') return access.public;
    if (e.layer === 'participant') return access.participant;
    if (e.layer === 'restricted') return access.restricted;
    return false;
  });

  // For non-participant/restricted access, remove sensitive fields
  if (!access.participant) {
    filtered.participants = entry.participants.map(p => ({
      ...p,
      // Remove evidence_ids for non-participants
      evidence_ids: [],
    }));
  }

  return filtered;
}

// Verify a Roll entry by recomputing its hash anchor from canonical JSON
export async function verifyRollEntry(entry: RollEntry): Promise<{
  valid: boolean;
  canonicalJson: string;
  computedHash: string;
  storedHash: string;
}> {
  const canonical = createCanonicalRollJson({
    undertaking_id: entry.undertaking_id,
    undertaking_type: entry.undertaking_type,
    title: entry.title,
    scope: entry.scope,
    deliverables: entry.deliverables,
    commissioned_by: entry.commissioned_by,
    participants: entry.participants,
    acceptance: entry.acceptance,
  });
  const computedHash = await computeHashAnchor(canonical);
  return {
    valid: computedHash === entry.hash_anchor,
    canonicalJson: canonical,
    computedHash,
    storedHash: entry.hash_anchor,
  };
}