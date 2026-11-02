import { getSupabase, isDemoMode } from '../supabase/client';
import { computeHashAnchor } from './roll-hash';

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
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  // Compute hash anchor from canonical JSON
  const canonical = JSON.stringify({
    undertaking_id: data.undertaking_id,
    undertaking_type: data.undertaking_type,
    title: data.title,
    scope: data.scope,
    deliverables: data.deliverables.sort(),
    commissioned_by: data.commissioned_by,
    participants: data.participants.sort((a, b) => a.person_id.localeCompare(b.person_id)),
    acceptance: data.acceptance,
  });

  const hash_anchor = await computeHashAnchor(canonical);

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

export async function queryRollEntries(
  filters: RollQueryFilters = {}
): Promise<RollEntry[]> {
  if (isDemoMode) {
    return [];
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