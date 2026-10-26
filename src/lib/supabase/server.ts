import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isLocalAuthEnabled } from '@/lib/auth-mode';
import { getSupabaseConfigurationStatus } from '@/lib/supabase/configuration';

export { getSupabaseConfigurationStatus };
export type { SupabaseConfigurationStatus } from '@/lib/supabase/configuration';

// The shared Supabase backend is only active when the deployment is not
// running on the local development identity. With that identity enabled the
// prototype stays on its own demo records, so the Studio never depends on a
// remote project being reachable or migrated.
export function hasSupabaseConfiguration(): boolean {
  if (isLocalAuthEnabled()) return false;
  return getSupabaseConfigurationStatus() === 'ready';
}

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  if (getSupabaseConfigurationStatus(url, key) !== 'ready') {
    throw new Error('Supabase configuration is present but not usable. Check the project URL and public key.');
  }
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; middleware refreshes sessions.
        }
      },
    },
  });
}
