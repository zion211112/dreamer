import { useEffect, useState, useCallback } from 'preact/hooks';
import { supabase, isDemoMode } from '../supabase/client';
import type { AuthState, Profile, SignUpData, SignInData, AuthUser } from './types';

// Demo mode fallback using localStorage
const DEMO_AUTH_KEY = 'authUser';

function getDemoAuth(): { user: AuthUser; profile: Profile | null } | null {
  try {
    const raw = localStorage.getItem(DEMO_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      user: { id: 'demo-user', email: parsed.email, role: 'authenticated' } as AuthUser,
      profile: parsed.profile || null,
    };
  } catch {
    return null;
  }
}

function setDemoAuth(user: AuthUser, profile: Profile | null) {
  localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify({ email: user?.email, profile }));
}

function clearDemoAuth() {
  localStorage.removeItem(DEMO_AUTH_KEY);
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const refreshProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (isDemoMode) {
      const demo = getDemoAuth();
      const profile = demo?.profile || null;
      setState(s => ({ ...s, profile, loading: false }));
      return profile;
    }

    try {
      const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      const profile = data as Profile;
      setState(s => ({ ...s, profile, loading: false }));
      return profile;
    } catch {
      setState(s => ({ ...s, profile: null, loading: false, error: 'Failed to load profile' }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      const demo = getDemoAuth();
      setState({
        user: demo?.user || null,
        profile: demo?.profile || null,
        loading: false,
        error: null,
      });
      return;
    }

    // Initial session
    supabase!.auth.getSession().then(({ data: { session } }: { data: { session: { user: AuthUser } | null } }) => {
      if (session?.user) {
        setState(s => ({ ...s, user: session.user, loading: true }));
        refreshProfile(session.user.id);
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    // Auth state changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event: string, session: { user: AuthUser } | null) => {
      if (session?.user) {
        setState(s => ({ ...s, user: session.user, loading: true }));
        refreshProfile(session.user.id);
      } else {
        setState({ user: null, profile: null, loading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile]);

  const signUp = async (data: SignUpData) => {
    setState(s => ({ ...s, loading: true, error: null }));

    if (isDemoMode) {
      const profile: Profile = {
        id: 'demo-user',
        role: data.role,
        display_name: data.displayName,
        avatar_url: null,
        organization_name: data.organizationName || null,
        location: null,
        service_area: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        created_by: 'demo-user',
        updated_by: 'demo-user',
      };
      const user = { id: 'demo-user', email: data.email, role: 'authenticated' } as AuthUser;
      setDemoAuth(user, profile);
      setState({ user, profile, loading: false, error: null });
      return { user, profile, error: null };
    }

    const { data: authData, error: authError } = await supabase!.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { display_name: data.displayName, role: data.role } },
    });

    if (authError) {
      setState(s => ({ ...s, loading: false, error: authError.message }));
      return { user: null, profile: null, error: authError.message };
    }

    if (authData.user) {
      const { data: profile, error: profileError } = await supabase!
        .from('profiles')
        .insert({
          id: authData.user.id,
          role: data.role,
          display_name: data.displayName,
          organization_name: data.organizationName,
        })
        .select()
        .single();

      if (profileError) {
        setState(s => ({ ...s, loading: false, error: profileError.message }));
        return { user: authData.user, profile: null, error: profileError.message };
      }

      setState({ user: authData.user, profile: profile as Profile, loading: false, error: null });
      return { user: authData.user, profile: profile as Profile, error: null };
    }

    setState(s => ({ ...s, loading: false, error: 'Sign up failed' }));
    return { user: null, profile: null, error: 'Sign up failed' };
  };

  const signIn = async (data: SignInData) => {
    setState(s => ({ ...s, loading: true, error: null }));

    if (isDemoMode) {
      const existing = getDemoAuth();
      const profile: Profile = existing?.user?.email === data.email && existing.profile
        ? existing.profile
        : {
          id: 'demo-user',
          role: 'founder',
          display_name: data.email.split('@')[0],
          avatar_url: null,
          organization_name: null,
          location: null,
          service_area: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          created_by: 'demo-user',
          updated_by: 'demo-user',
        };
      const user = { id: 'demo-user', email: data.email, role: 'authenticated' } as AuthUser;
      setDemoAuth(user, profile);
      setState({ user, profile, loading: false, error: null });
      return { user, profile, error: null };
    }

    const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setState(s => ({ ...s, loading: false, error: authError.message }));
      return { user: null, profile: null, error: authError.message };
    }

    if (authData.user) {
      const profile = await refreshProfile(authData.user.id);
      if (!profile) return { user: authData.user, profile: null, error: 'Failed to load profile' };
      return { user: authData.user, profile, error: null };
    }

    setState(s => ({ ...s, loading: false, error: 'Sign in failed' }));
    return { user: null, profile: null, error: 'Sign in failed' };
  };

  const signOut = async () => {
    if (isDemoMode) {
      clearDemoAuth();
      setState({ user: null, profile: null, loading: false, error: null });
      return;
    }

    await supabase!.auth.signOut();
    setState({ user: null, profile: null, loading: false, error: null });
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) return { error: 'Not authenticated' };

    if (isDemoMode) {
      const newProfile = { ...state.profile!, ...updates, updated_at: new Date().toISOString(), version: state.profile!.version + 1 };
      setDemoAuth(state.user, newProfile);
      setState(s => ({ ...s, profile: newProfile }));
      return { error: null };
    }

    const { data, error } = await supabase!
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString(), version: state.profile!.version + 1 })
      .eq('id', state.user.id)
      .select()
      .single();

    if (error) return { error: error.message };
    setState(s => ({ ...s, profile: data as Profile }));
    return { error: null };
  };

  return { ...state, signUp, signIn, signOut, updateProfile, refreshProfile };
}
