import 'server-only';
import { z } from 'zod';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';

const profileSchema = z.object({
  user_id: z.string().uuid(),
  display_name: z.string(),
  deployed_asset_count: z.coerce.number().int().nonnegative(),
  capability_badge_count: z.coerce.number().int().nonnegative(),
  last_verified_build_at: z.string().nullable(),
  derived_rank: z.string(),
});

const badgeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  display_name: z.string(),
  asset_slug: z.string(),
  asset_name: z.string(),
  role: z.enum(['anchor', 'builder', 'apprentice']),
  issued_at: z.string(),
  blueprint_hash: z.string(),
});

export type PublicRollProfile = z.infer<typeof profileSchema>;
export type PublicCapabilityBadge = z.infer<typeof badgeSchema>;

export async function getPublicRollProfile(userId: string): Promise<{
  profile: PublicRollProfile | null;
  badges: PublicCapabilityBadge[];
  error: string | null;
}> {
  if (!hasSupabaseConfiguration()) return { profile: null, badges: [], error: null };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('public_roll_profiles')
    .select('user_id,display_name,deployed_asset_count,capability_badge_count,last_verified_build_at,derived_rank')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { profile: null, badges: [], error: `Roll profile could not be loaded: ${error.message}` };
  if (!data) return { profile: null, badges: [], error: null };
  try {
    const profile = profileSchema.parse(data);
    const { data: badgeRows, error: badgesError } = await supabase
      .from('public_roll_capability_badges')
      .select('id,user_id,display_name,asset_slug,asset_name,role,issued_at,blueprint_hash')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });
    if (badgesError) return { profile: null, badges: [], error: `Capability proofs could not be loaded: ${badgesError.message}` };
    return { profile, badges: z.array(badgeSchema).parse(badgeRows ?? []), error: null };
  } catch (parseError) {
    return {
      profile: null,
      badges: [],
      error: parseError instanceof Error ? parseError.message : 'Roll profile data was malformed.',
    };
  }
}
