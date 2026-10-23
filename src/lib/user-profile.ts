import 'server-only';
import { z } from 'zod';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';

const badgeSchema = z.object({
  id: z.string().uuid(),
  roll_record_id: z.string().uuid(),
  role: z.enum(['anchor', 'builder', 'apprentice']),
  issued_at: z.string(),
});

const capitalIntentSchema = z.object({
  id: z.string().uuid(),
  tender_id: z.string().uuid(),
  amount_minor: z.coerce.number().int().positive().safe(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  status: z.enum(['SIGNALED', 'WITHDRAWN', 'SETTLED_OFFLINE']),
  created_at: z.string(),
});

const displayNameSchema = z.object({ display_name: z.string() });

export type UserProfileBadge = z.infer<typeof badgeSchema>;
export type UserCapitalIntent = z.infer<typeof capitalIntentSchema>;

export interface UserProfileData {
  authenticated: boolean;
  displayName: string | null;
  profileError: string | null;
  roll: {
    deployedAssetCount: number;
    capabilityBadgeCount: number;
    rank: string;
    badges: UserProfileBadge[];
    error: string | null;
  } | null;
  capitalIntents: {
    records: UserCapitalIntent[];
    error: string | null;
  } | null;
}

function parseError(label: string, error: unknown): string {
  console.error(`${label} data could not be parsed.`, error);
  return `${label} data is unavailable.`;
}

export async function getAuthenticatedUserProfileData(): Promise<UserProfileData> {
  if (!hasSupabaseConfiguration()) {
    return {
      authenticated: false,
      displayName: null,
      profileError: null,
      roll: null,
      capitalIntents: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(`Profile identity could not be verified: ${authError.message}`);
  }
  if (!auth.user) {
    return {
      authenticated: false,
      displayName: null,
      profileError: null,
      roll: null,
      capitalIntents: null,
    };
  }

  const [profileResult, badgeResult, capitalResult] = await Promise.all([
    supabase
      .from('commons_profiles')
      .select('display_name')
      .eq('user_id', auth.user.id)
      .maybeSingle(),
    supabase
      .from('roll_capability_badges')
      .select('id,roll_record_id,role,issued_at')
      .eq('user_id', auth.user.id)
      .order('issued_at', { ascending: false }),
    supabase
      .from('capital_intents')
      .select('id,tender_id,amount_minor,currency,status,created_at')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  let displayName: string | null = null;
  let profileError: string | null = null;
  if (profileResult.error) {
    console.error('The signed-in user profile could not be loaded.', profileResult.error);
    profileError = 'Account profile details are unavailable.';
  } else if (profileResult.data) {
    const parsed = displayNameSchema.safeParse(profileResult.data);
    if (parsed.success) displayName = parsed.data.display_name;
    else {
      console.error('The signed-in user profile was malformed.', parsed.error);
      profileError = 'Account profile details are unavailable.';
    }
  }

  let roll: UserProfileData['roll'];
  if (badgeResult.error) {
    console.error('The signed-in user Roll records could not be loaded.', badgeResult.error);
    roll = {
      deployedAssetCount: 0,
      capabilityBadgeCount: 0,
      rank: 'Unavailable',
      badges: [],
      error: 'Verified Roll records are unavailable.',
    };
  } else {
    const parsed = z.array(badgeSchema).safeParse(badgeResult.data ?? []);
    if (!parsed.success) {
      roll = {
        deployedAssetCount: 0,
        capabilityBadgeCount: 0,
        rank: 'Unavailable',
        badges: [],
        error: parseError('Verified Roll', parsed.error),
      };
    } else {
      const deployedAssetCount = new Set(parsed.data.map(badge => badge.roll_record_id)).size;
      roll = {
        deployedAssetCount,
        capabilityBadgeCount: parsed.data.length,
        rank: deployedAssetCount >= 3 ? 'Tier 2' : deployedAssetCount > 0 ? 'Tier 1' : 'New builder',
        badges: parsed.data,
        error: null,
      };
    }
  }

  let capitalIntents: UserProfileData['capitalIntents'];
  if (capitalResult.error) {
    console.error('The signed-in user capital-intent records could not be loaded.', capitalResult.error);
    capitalIntents = { records: [], error: 'Capital-intent records are unavailable.' };
  } else {
    const parsed = z.array(capitalIntentSchema).safeParse(capitalResult.data ?? []);
    capitalIntents = parsed.success
      ? { records: parsed.data, error: null }
      : { records: [], error: parseError('Capital-intent', parsed.error) };
  }

  return {
    authenticated: true,
    displayName,
    profileError,
    roll,
    capitalIntents,
  };
}
