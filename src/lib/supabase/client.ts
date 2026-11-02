import { createClient } from '@supabase/supabase-js';

declare const importMetaEnv: {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_DEMO_MODE: string;
};

const supabaseUrl = importMetaEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = importMetaEnv.VITE_SUPABASE_ANON_KEY;

export const isDemoMode = !supabaseUrl || !supabaseAnonKey || importMetaEnv.VITE_DEMO_MODE === 'true';

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

export function getSupabase() {
  if (isDemoMode) {
    throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or set VITE_DEMO_MODE=false');
  }
  return supabase!;
}