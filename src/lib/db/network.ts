import { getSupabase, isDemoMode } from '../supabase/client';
import type { Profile } from '../auth/types';

export interface NetworkProfile {
  id: string;
  owner_id: string;
  type: 'founder' | 'business' | 'crew' | 'individual' | 'institution';
  name: string;
  headline: string | null;
  location: string | null;
  service_area: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  version: number;
  created_by: string | null;
  updated_by: string | null;
}

export interface Capability {
  id: string;
  profile_id: string;
  name: string;
  label: string;
  category: string;
  basis: 'declared' | 'supported' | 'counterparty_confirmed' | 'independently_verified';
  evidence_ids: string[];
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  version: number;
  created_by: string | null;
  updated_by: string | null;
}

export interface ServiceOffer {
  id: string;
  profile_id: string;
  title: string;
  scope: string;
  deliverables: string[];
  indicative_terms: string | null;
  service_area: string[];
  availability: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
  version: number;
  created_by: string | null;
  updated_by: string | null;
}

export interface Evidence {
  id: string;
  profile_id: string;
  type: 'work_sample' | 'reference' | 'credential' | 'institutional_attestation' | 'accepted_contribution';
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  verification_status: 'unverified' | 'counterparty_confirmed' | 'issuer_verified';
  verified_by: string | null;
  verified_at: string | null;
  related_capability_ids: string[];
  related_service_offer_ids: string[];
  created_at: string;
  updated_at: string;
  version: number;
  created_by: string | null;
  updated_by: string | null;
}

export interface ContactMethod {
  id: string;
  profile_id: string;
  type: 'email' | 'phone' | 'website' | 'other';
  value: string;
  is_preferred: boolean;
  display: boolean;
  created_at: string;
}

export interface DirectoryEntry {
  profile: NetworkProfile;
  capabilities: Capability[];
  service_offers: ServiceOffer[];
  primary_evidence: Evidence | null;
}

export interface SearchFilters {
  capabilities?: string[];
  categories?: string[];
  location?: string;
  service_area?: string;
  availability?: string;
  basis?: Capability['basis'][];
  type?: NetworkProfile['type'][];
  query?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// Profile CRUD
export async function createNetworkProfile(
  data: Omit<NetworkProfile, 'id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by'>,
  user: Profile
): Promise<NetworkProfile> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      ...data,
      created_at: now,
      updated_at: now,
      version: 1,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return profile as NetworkProfile;
}

export async function getNetworkProfile(id: string): Promise<NetworkProfile | null> {
  if (isDemoMode) {
    return null;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as NetworkProfile;
}

export async function getMyNetworkProfile(userId: string): Promise<NetworkProfile | null> {
  return getNetworkProfile(userId);
}

export async function updateNetworkProfile(
  id: string,
  updates: Partial<Omit<NetworkProfile, 'id' | 'created_at' | 'version' | 'created_by'>>,
  user: Profile
): Promise<NetworkProfile> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: now, version: user.version + 1, updated_by: user.id })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as NetworkProfile;
}

// Capability CRUD
export async function addCapability(
  data: Omit<Capability, 'id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by'>,
  user: Profile
): Promise<Capability> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: cap, error } = await supabase
    .from('capabilities')
    .insert({
      ...data,
      created_at: now,
      updated_at: now,
      version: 1,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return cap as Capability;
}

export async function getCapabilities(profileId: string): Promise<Capability[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('capabilities')
    .select('*')
    .eq('profile_id', profileId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Capability[];
}

export async function updateCapability(
  id: string,
  updates: Partial<Omit<Capability, 'id' | 'created_at' | 'version' | 'created_by'>>,
  user: Profile
): Promise<Capability> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('capabilities')
    .update({ ...updates, updated_at: now, version: user.version + 1, updated_by: user.id })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Capability;
}

export async function deleteCapability(id: string): Promise<void> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const { error } = await supabase.from('capabilities').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Service Offer CRUD
export async function addServiceOffer(
  data: Omit<ServiceOffer, 'id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by'>,
  user: Profile
): Promise<ServiceOffer> {
  if (isDemoMode) {
    throw new Error('Demo mode: Supabase not configured');
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: offer, error } = await supabase
    .from('service_offers')
    .insert({
      ...data,
      created_at: now,
      updated_at: now,
      version: 1,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return offer as ServiceOffer;
}

export async function getServiceOffers(profileId: string): Promise<ServiceOffer[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('service_offers')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as ServiceOffer[];
}

// Evidence CRUD
export async function addEvidence(
  data: Omit<Evidence, 'id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by'>,
  user: Profile
): Promise<Evidence> {
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
      updated_at: now,
      version: 1,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return evidence as Evidence;
}

export async function getEvidence(profileId: string): Promise<Evidence[]> {
  if (isDemoMode) {
    return [];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Evidence[];
}

// Search & Discovery
export async function searchNetwork(
  filters: SearchFilters,
  page = 1,
  pageSize = 20
): Promise<PaginatedResult<DirectoryEntry>> {
  if (isDemoMode) {
    return { items: [], total: 0, page, page_size: pageSize };
  }
  const supabase = getSupabase();

  // Build capability filter
  let capabilityQuery = supabase.from('capabilities').select('profile_id');

  if (filters.capabilities && filters.capabilities.length > 0) {
    capabilityQuery = capabilityQuery.in('name', filters.capabilities);
  }
  if (filters.categories && filters.categories.length > 0) {
    capabilityQuery = capabilityQuery.in('category', filters.categories);
  }
  if (filters.basis && filters.basis.length > 0) {
    capabilityQuery = capabilityQuery.in('basis', filters.basis);
  }

  const { data: capabilityProfiles, error: capError } = await capabilityQuery;
  if (capError) throw new Error(capError.message);

  const profileIds = [...new Set(capabilityProfiles?.map(c => c.profile_id) || [])];

  // Build profile query
  let profileQuery = supabase.from('profiles').select('*', { count: 'exact' });

  if (profileIds.length > 0) {
    profileQuery = profileQuery.in('id', profileIds);
  } else if (filters.capabilities || filters.categories || filters.basis) {
    // No matching capabilities
    return { items: [], total: 0, page, page_size: pageSize };
  }

  if (filters.type && filters.type.length > 0) {
    profileQuery = profileQuery.in('type', filters.type);
  }
  if (filters.location) {
    profileQuery = profileQuery.ilike('location', `%${filters.location}%`);
  }
  if (filters.service_area) {
    profileQuery = profileQuery.contains('service_area', [filters.service_area]);
  }
  if (filters.query) {
    const q = `%${filters.query}%`;
    profileQuery = profileQuery.or(`name.ilike.${q},headline.ilike.${q}`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  profileQuery = profileQuery.range(from, to).order('created_at', { ascending: false });

  const { data: profiles, error: profError, count } = await profileQuery;
  if (profError) throw new Error(profError.message);

  // Fetch related data for each profile
  const entries: DirectoryEntry[] = [];
  for (const profile of profiles || []) {
    const [capabilities, serviceOffers, evidence] = await Promise.all([
      getCapabilities(profile.id),
      getServiceOffers(profile.id),
      getEvidence(profile.id),
    ]);

    // Filter capabilities by availability if specified
    let filteredCapabilities = capabilities;
    if (filters.availability) {
      // Check service offers for availability match
      const matchingOffers = serviceOffers.filter(o => o.availability?.includes(filters.availability!));
      const capabilityIds = new Set(matchingOffers.flatMap(o => o.deliverables));
      filteredCapabilities = capabilities.filter(c => capabilityIds.has(c.name));
    }

    const primaryEvidence = evidence.find(e => e.verification_status !== 'unverified') || evidence[0] || null;

    entries.push({
      profile: profile as NetworkProfile,
      capabilities: filteredCapabilities,
      service_offers: serviceOffers,
      primary_evidence: primaryEvidence,
    });
  }

  return {
    items: entries,
    total: count || 0,
    page,
    page_size: pageSize,
  };
}

export async function getDirectoryEntry(profileId: string): Promise<DirectoryEntry | null> {
  if (isDemoMode) {
    return null;
  }
  const profile = await getNetworkProfile(profileId);
  if (!profile) return null;

  const [capabilities, serviceOffers, evidence] = await Promise.all([
    getCapabilities(profileId),
    getServiceOffers(profileId),
    getEvidence(profileId),
  ]);

  const primaryEvidence = evidence.find(e => e.verification_status !== 'unverified') || evidence[0] || null;

  return {
    profile,
    capabilities,
    service_offers: serviceOffers,
    primary_evidence: primaryEvidence,
  };
}