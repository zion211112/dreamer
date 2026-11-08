// Local Supabase types to avoid @supabase/supabase-js dependency
export interface SupabaseUser {
  id: string;
  email?: string;
  role?: string;
  aud?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  factors?: unknown[];
  identities?: unknown[];
  profile?: Profile;
}

export type UserRole = 'institution' | 'founder' | 'coordinator' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  organization_name: string | null;
  location: string | null;
  service_area: string[];
  created_at: string;
  updated_at: string;
  version: number;
  created_by: string | null;
  updated_by: string | null;
}

export interface AuthUser extends SupabaseUser {
  profile?: Profile;
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  organizationName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}
