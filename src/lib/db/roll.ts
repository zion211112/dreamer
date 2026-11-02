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
    // Demo mode: write to localStorage
    const demoKey = 'demo_roll_entries';
    const existing = JSON.parse(localStorage.getItem(demoKey) || '[]');
    const newEntry: RollEntry = {
      ...data,
      id: crypto.randomUUID(),
      recorded_at: now,
      recorded_by: userId,
      hash_anchor,
      version: 1,
    };
    existing.unshift(newEntry);
    localStorage.setItem(demoKey, JSON.stringify(existing));
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
    title: 'Community Workshop Build-out',
    scope: 'Retrofit 2000sqft warehouse into multi-use fabrication space with CNC, woodworking, and assembly zones',
    deliverables: ['Floor plan & load calcs', 'Electrical & dust collection install', 'Tooling layout & safety signage', 'First cohort onboarding'],
    reusable_designs: { layout_template: 'warehouse-fab-v1', safety_protocol: 'fab-shop-standard' },
    commissioned_by: { institution_id: 'inst-001', name: 'Meridian Makerspace', coordinator_id: 'coord-001' },
    participants: [
      { role_type: 'coordinator', person_id: 'coord-001', profile_id: null, name: 'Alex Chen', capability_claims: ['project-coordination', 'shop-safety'], evidence_ids: ['evd-001'] },
      { role_type: 'anchor', person_id: 'person-002', profile_id: null, name: 'Maria Santos', capability_claims: ['cnc-programming', 'fusion-360'], evidence_ids: ['evd-002', 'evd-003'] },
      { role_type: 'builder', person_id: 'person-003', profile_id: null, name: 'James Okonkwo', capability_claims: ['electrical-install', 'dust-collection-design'], evidence_ids: ['evd-004'] },
      { role_type: 'apprentice', person_id: 'person-004', profile_id: null, name: 'Priya Patel', capability_claims: ['shop-assembly', 'material-handling'], evidence_ids: [] },
    ],
    evidence: [
      { id: 'evd-001', layer: 'public', title: 'Final walkthrough photos', file_url: null, description: '360° documentation of completed zones' },
      { id: 'evd-002', layer: 'public', title: 'CNC cut files & toolpaths', file_url: null, description: 'Reusable Fusion 360 setups for workbench series' },
      { id: 'evd-003', layer: 'participant', title: 'Maria Santos — CNC certification', file_url: null, description: 'Third-party verified CNC programming credential' },
      { id: 'evd-004', layer: 'restricted', title: 'Electrical permit & inspection report', file_url: null, description: 'City permit #EL-2024-0847, passed rough-in & final' },
    ],
    acceptance: { accepted_by: 'coord-001', accepted_at: '2024-11-15T14:30:00Z', inspection_report_id: 'rpt-001', cost_disclosed: { amount: 47500, currency: 'USD' } },
    maintenance_obligations: { dust_collection: 'quarterly filter replacement', cnc: 'annual calibration' },
    recorded_at: '2024-11-15T14:35:00Z',
    recorded_by: 'coord-001',
    hash_anchor: '', // Will be computed on load
    version: 1,
  },
  {
    id: 'demo-2',
    undertaking_id: 'undertaking-digital-001',
    undertaking_type: 'digital',
    title: 'Open-Source Grant Management Platform',
    scope: 'Build v1 of grant lifecycle manager: applications, review workflows, compliance tracking, and public dashboard',
    deliverables: ['API spec & data model', 'React admin + public frontend', 'Automated compliance checks', 'Documentation & deployment'],
    reusable_designs: { api_pattern: 'grant-lifecycle-rest', compliance_engine: 'rule-dsl-v1' },
    commissioned_by: { institution_id: 'inst-002', name: 'Civic Tech Collective', coordinator_id: 'coord-002' },
    participants: [
      { role_type: 'coordinator', person_id: 'coord-002', profile_id: null, name: 'Samira Al-Rashid', capability_claims: ['product-management', 'open-source-governance'], evidence_ids: ['evd-011'] },
      { role_type: 'anchor', person_id: 'person-005', profile_id: null, name: 'Diego Morales', capability_claims: ['typescript', 'postgres', 'api-design'], evidence_ids: ['evd-012'] },
      { role_type: 'builder', person_id: 'person-006', profile_id: null, name: 'Aisha Kim', capability_claims: ['react', 'accessibility', 'testing'], evidence_ids: ['evd-013'] },
    ],
    evidence: [
      { id: 'evd-011', layer: 'public', title: 'Public repo & release notes', file_url: 'https://github.com/civic-tech/grant-platform', description: 'MIT licensed, v1.0.0 tagged' },
      { id: 'evd-012', layer: 'participant', title: 'Architecture decision records', file_url: null, description: 'ADRs for auth, multi-tenancy, audit logging' },
      { id: 'evd-012', layer: 'restricted', title: 'Security audit report', file_url: null, description: 'Third-party pen test, 0 critical findings' },
    ],
    acceptance: { accepted_by: 'coord-002', accepted_at: '2024-10-28T10:00:00Z', inspection_report_id: 'rpt-002', cost_disclosed: { amount: 120000, currency: 'USD' } },
    maintenance_obligations: { security: 'quarterly dependency audit', compliance: 'annual rule review' },
    recorded_at: '2024-10-28T10:05:00Z',
    recorded_by: 'coord-002',
    hash_anchor: '',
    version: 1,
  },
  {
    id: 'demo-3',
    undertaking_id: 'undertaking-creative-001',
    undertaking_type: 'creative',
    title: 'Neighborhood Oral History Archive',
    scope: 'Record, transcribe, and publish 50 interviews with longtime residents; produce traveling exhibit and digital collection',
    deliverables: ['Interview guide & consent forms', '50 recorded + transcribed interviews', 'Traveling exhibit design', 'Digital archive with search'],
    reusable_designs: { interview_protocol: 'oral-history-standard', exhibit_system: 'modular-panel-v2' },
    commissioned_by: { institution_id: 'inst-003', name: 'Heritage District Council', coordinator_id: 'coord-003' },
    participants: [
      { role_type: 'coordinator', person_id: 'coord-003', profile_id: null, name: 'Elena Volkov', capability_claims: ['community-engagement', 'archival-practice'], evidence_ids: ['evd-021'] },
      { role_type: 'anchor', person_id: 'person-007', profile_id: null, name: 'Kwame Asante', capability_claims: ['audio-production', 'interview-technique'], evidence_ids: ['evd-022'] },
      { role_type: 'builder', person_id: 'person-008', profile_id: null, name: 'Sofia Andersson', capability_claims: ['transcription', 'metadata-schema'], evidence_ids: ['evd-023'] },
      { role_type: 'apprentice', person_id: 'person-009', profile_id: null, name: 'Liam O\'Connor', capability_claims: ['exhibit-fabrication', 'installation'], evidence_ids: [] },
    ],
    evidence: [
      { id: 'evd-021', layer: 'public', title: 'Published digital collection', file_url: 'https://archive.heritagedistrict.org', description: 'Searchable, CC-BY licensed' },
      { id: 'evd-022', layer: 'participant', title: 'Interview consent forms (redacted)', file_url: null, description: 'IRB-approved protocol, all signatures collected' },
      { id: 'evd-023', layer: 'restricted', title: 'Raw audio files (participants only)', file_url: null, description: 'Unedited recordings, access restricted per consent' },
    ],
    acceptance: { accepted_by: 'coord-003', accepted_at: '2024-09-20T16:00:00Z', inspection_report_id: 'rpt-003', cost_disclosed: { amount: 35000, currency: 'USD' } },
    maintenance_obligations: { archive: 'annual backup verification', exhibit: 'per-venue condition report' },
    recorded_at: '2024-09-20T16:10:00Z',
    recorded_by: 'coord-003',
    hash_anchor: '',
    version: 1,
  },
];

export async function queryRollEntries(
  filters: RollQueryFilters = {}
): Promise<RollEntry[]> {
  if (isDemoMode) {
    // Load demo entries and compute hashes if needed
    const entries = [...DEMO_ROLL_ENTRIES];
    for (const entry of entries) {
      if (!entry.hash_anchor) {
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
        entry.hash_anchor = await computeHashAnchor(canonical);
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