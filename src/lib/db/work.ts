import { getSupabase, isDemoMode } from '../supabase/client';

export type WorkStatus = 'draft' | 'brief' | 'team_composed' | 'in_progress' | 'evidence_submitted' | 'accepted' | 'closed';

export interface Undertaking {
  id: string;
  institution_id: string;
  coordinator_id: string | null;
  title: string;
  scope: string;
  deliverables: string[];
  status: WorkStatus;
  brief_id: string | null;
  agreed_cost: number | null;
  currency: string;
  started_at: string | null;
  accepted_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  version: number;
  created_by: string | null;
  updated_by: string | null;
}

export interface Package {
  id: string;
  undertaking_id: string;
  role_type: 'anchor' | 'builder' | 'apprentice' | 'coordinator';
  person_id: string;
  profile_id: string | null;
  capability_claims: string[];
  compensation: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface Milestone {
  id: string;
  undertaking_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  evidence_ids: string[];
  status: 'pending' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface WorkEvidence {
  id: string;
  undertaking_id: string;
  submitted_by: string;
  title: string;
  description: string | null;
  file_urls: string[];
  milestone_id: string | null;
  created_at: string;
}

// Undertaking CRUD
export async function createUndertaking(
  data: Omit<Undertaking, 'id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by'>,
  userId: string
): Promise<Undertaking> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: undertaking, error } = await supabase
    .from('undertakings')
    .insert({
      ...data,
      created_at: now,
      updated_at: now,
      version: 1,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return undertaking as Undertaking;
}

export async function getUndertaking(id: string): Promise<Undertaking | null> {
  if (isDemoMode) {
    return null;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('undertakings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as Undertaking;
}

export async function getUndertakingsByInstitution(institutionId: string): Promise<Undertaking[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('undertakings')
    .select('*')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Undertaking[];
}

export async function getUndertakingsByCoordinator(coordinatorId: string): Promise<Undertaking[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('undertakings')
    .select('*')
    .eq('coordinator_id', coordinatorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Undertaking[];
}

export async function updateUndertaking(
  id: string,
  updates: Partial<Omit<Undertaking, 'id' | 'created_at' | 'version' | 'created_by'>>,
  userId: string
): Promise<Undertaking> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('undertakings')
    .update({ ...updates, updated_at: now, updated_by: userId })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Undertaking;
}

// Package (Team) CRUD
export async function addPackage(
  data: Omit<Package, 'id' | 'created_at' | 'updated_at' | 'version'>
): Promise<Package> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: pkg, error } = await supabase
    .from('packages')
    .insert({
      ...data,
      created_at: now,
      updated_at: now,
      version: 1,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return pkg as Package;
}

export async function getPackages(undertakingId: string): Promise<Package[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('undertaking_id', undertakingId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Package[];
}

export async function updatePackage(
  id: string,
  updates: Partial<Omit<Package, 'id' | 'created_at' | 'version'>>,
): Promise<Package> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('packages')
    .update({ ...updates, updated_at: now })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Package;
}

export async function removePackage(id: string): Promise<void> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const { error } = await supabase.from('packages').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Milestone CRUD
export async function addMilestone(
  data: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>
): Promise<Milestone> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: milestone, error } = await supabase
    .from('milestones')
    .insert({
      ...data,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return milestone as Milestone;
}

export async function getMilestones(undertakingId: string): Promise<Milestone[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('undertaking_id', undertakingId)
    .order('due_date', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Milestone[];
}

export async function updateMilestone(
  id: string,
  updates: Partial<Omit<Milestone, 'id' | 'created_at'>>,
): Promise<Milestone> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('milestones')
    .update({ ...updates, updated_at: now })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Milestone;
}

// Work Evidence CRUD
export async function addWorkEvidence(
  data: Omit<WorkEvidence, 'id' | 'created_at'>,
): Promise<WorkEvidence> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: evidence, error } = await supabase
    .from('evidence')
    .insert({
      ...data,
      created_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return evidence as WorkEvidence;
}

export async function getWorkEvidence(undertakingId: string): Promise<WorkEvidence[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .eq('undertaking_id', undertakingId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as WorkEvidence[];
}

// Complete undertaking with all related data
export interface FullUndertaking {
  undertaking: Undertaking;
  packages: Package[];
  milestones: Milestone[];
  evidence: WorkEvidence[];
}

export async function getFullUndertaking(id: string): Promise<FullUndertaking | null> {
  if (isDemoMode) {
    return null;
  }
  const [undertaking, packages, milestones, evidence] = await Promise.all([
    getUndertaking(id),
    getPackages(id),
    getMilestones(id),
    getWorkEvidence(id),
  ]);

  if (!undertaking) return null;

  return { undertaking, packages, milestones, evidence };
}