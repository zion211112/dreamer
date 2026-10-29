import 'server-only';
import { z } from 'zod';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';

const opportunitySchema = z.object({
  id: z.string().uuid(),
  tender_id: z.string().uuid(),
  organization_id: z.string().uuid().nullable(),
  asset_slug: z.string(),
  asset_name: z.string(),
  role_title: z.string(),
  description: z.string(),
  skill_tags: z.array(z.string()),
  created_at: z.string(),
  application_count: z.coerce.number().int().nonnegative(),
});

const applicationSchema = z.object({
  application_id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  applicant_id: z.string().uuid(),
  note: z.string(),
  status: z.enum(['submitted', 'reviewed', 'declined']),
  created_at: z.string(),
  applicant_name: z.string(),
  profile_is_public: z.boolean(),
  deployed_asset_count: z.coerce.number().int().nonnegative(),
  capability_badge_count: z.coerce.number().int().nonnegative(),
  derived_rank: z.string(),
  capability_badges: z.array(z.object({
    asset_name: z.string(),
    role: z.enum(['anchor', 'builder', 'apprentice']),
    issued_at: z.string(),
    blueprint_hash: z.string(),
  })),
});

export type CommonsOpportunity = z.infer<typeof opportunitySchema>;
export type CommonsApplication = {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  note: string;
  status: 'submitted' | 'reviewed' | 'declined';
  created_at: string;
  applicantName: string;
  profileIsPublic: boolean;
  deployedAssetCount: number;
  capabilityBadgeCount: number;
  capabilityBadges: z.infer<typeof applicationSchema>['capability_badges'];
  rank: string;
  isOwn: boolean;
};

export async function getCommonsOpportunities(): Promise<{
  configured: boolean;
  opportunities: CommonsOpportunity[];
  error: string | null;
}> {
  if (!hasSupabaseConfiguration()) return { configured: false, opportunities: [], error: null };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('public_commons_opportunities')
    .select('id,tender_id,organization_id,asset_slug,asset_name,role_title,description,skill_tags,created_at,application_count')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return { configured: true, opportunities: [], error: `Opportunities could not be loaded: ${error.message}` };
  try {
    return {
      configured: true,
      opportunities: z.array(opportunitySchema).parse(data ?? []),
      error: null,
    };
  } catch (parseError) {
    return {
      configured: true,
      opportunities: [],
      error: parseError instanceof Error ? parseError.message : 'Opportunity data was malformed.',
    };
  }
}

export async function getVisibleOpportunityApplications(
  opportunityIds: string[],
): Promise<CommonsApplication[]> {
  if (!hasSupabaseConfiguration() || !opportunityIds.length) return [];
  const supabase = await createSupabaseServerClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(`Application identity could not be verified: ${authError.message}`);
  if (!auth.user) return [];

  const { data, error } = await supabase.rpc('get_commons_opportunity_applications', {
    p_opportunity_ids: opportunityIds,
  });
  if (error) throw new Error(`Visible applications could not be loaded: ${error.message}`);
  return z.array(applicationSchema).parse(data ?? []).map(application => {
    return {
      id: application.application_id,
      opportunity_id: application.opportunity_id,
      applicant_id: application.applicant_id,
      note: application.note,
      status: application.status,
      created_at: application.created_at,
      applicantName: application.applicant_name,
      profileIsPublic: application.profile_is_public,
      deployedAssetCount: application.deployed_asset_count,
      capabilityBadgeCount: application.capability_badge_count,
      capabilityBadges: application.capability_badges,
      rank: application.derived_rank,
      isOwn: application.applicant_id === auth.user.id,
    };
  });
}
