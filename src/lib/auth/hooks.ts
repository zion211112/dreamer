import { onMounted, onUnmounted, ref } from 'vue';
import { supabase, isDemoMode } from '../supabase/client';
import type { AuthState, Profile, SignUpData, SignInData } from './types';

// Demo mode fallback using localStorage
const DEMO_AUTH_KEY = 'authUser';

function getDemoAuth(): { user: AuthState['user']; profile: Profile | null } | null {
  try {
    const raw = localStorage.getItem(DEMO_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      user: { id: 'demo-user', email: parsed.email, role: 'authenticated' } as AuthState['user'],
      profile: parsed.profile || null,
    };
  } catch {
    return null;
  }
}

function setDemoAuth(user: AuthState['user'], profile: Profile | null) {
  localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify({ email: user?.email, profile }));
}

function clearDemoAuth() {
  localStorage.removeItem(DEMO_AUTH_KEY);
}

/**
 * Vue composable (formerly Preact hooks — migrated for the Vue 3 single stack).
 * Must be called inside a Vue component's setup.
 */
export function useAuth() {
  const user = ref<AuthState['user']>(null);
  const profile = ref<Profile | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  let authSubscription: { unsubscribe: () => void } | null = null;

  const refreshProfile = async (userId: string): Promise<Profile | null> => {
    if (isDemoMode) {
      const demo = getDemoAuth();
      profile.value = demo?.profile || null;
      loading.value = false;
      return profile.value;
    }

    try {
      const { data, error: queryError } = await supabase!.from('profiles').select('*').eq('id', userId).single();
      if (queryError) throw queryError;
      profile.value = data as Profile;
      loading.value = false;
      return profile.value;
    } catch {
      profile.value = null;
      loading.value = false;
      error.value = 'Failed to load profile';
      return null;
    }
  };

  onMounted(() => {
    if (isDemoMode) {
      const demo = getDemoAuth();
      user.value = demo?.user || null;
      profile.value = demo?.profile || null;
      loading.value = false;
      error.value = null;
      return;
    }

    // Initial session
    supabase!.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        user.value = session.user as AuthState['user'];
        loading.value = true;
        void refreshProfile(session.user.id);
      } else {
        loading.value = false;
      }
    });

    // Auth state changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        user.value = session.user as AuthState['user'];
        loading.value = true;
        void refreshProfile(session.user.id);
      } else {
        user.value = null;
        profile.value = null;
        loading.value = false;
        error.value = null;
      }
    });
    authSubscription = subscription;
  });

  onUnmounted(() => {
    authSubscription?.unsubscribe();
    authSubscription = null;
  });

  const signUp = async (data: SignUpData) => {
    loading.value = true;
    error.value = null;

    if (isDemoMode) {
      const newProfile: Profile = {
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
      const newUser = { id: 'demo-user', email: data.email, role: 'authenticated' } as AuthState['user'];
      setDemoAuth(newUser, newProfile);
      user.value = newUser;
      profile.value = newProfile;
      loading.value = false;
      error.value = null;
      return { user: newUser, profile: newProfile, error: null };
    }

    const { data: authData, error: authError } = await supabase!.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { display_name: data.displayName, role: data.role } },
    });

    if (authError) {
      loading.value = false;
      error.value = authError.message;
      return { user: null, profile: null, error: authError.message };
    }

    if (authData.user) {
      const { data: createdProfile, error: profileError } = await supabase!
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
        loading.value = false;
        error.value = profileError.message;
        return { user: authData.user, profile: null, error: profileError.message };
      }

      user.value = authData.user;
      profile.value = createdProfile as Profile;
      loading.value = false;
      error.value = null;
      return { user: authData.user, profile: createdProfile as Profile, error: null };
    }

    loading.value = false;
    error.value = 'Sign up failed';
    return { user: null, profile: null, error: 'Sign up failed' };
  };

  const signIn = async (data: SignInData) => {
    loading.value = true;
    error.value = null;

    if (isDemoMode) {
      const existing = getDemoAuth();
      const newProfile: Profile = existing?.user?.email === data.email && existing.profile
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
      const newUser = { id: 'demo-user', email: data.email, role: 'authenticated' } as AuthState['user'];
      setDemoAuth(newUser, newProfile);
      user.value = newUser;
      profile.value = newProfile;
      loading.value = false;
      error.value = null;
      return { user: newUser, profile: newProfile, error: null };
    }

    const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      loading.value = false;
      error.value = authError.message;
      return { user: null, profile: null, error: authError.message };
    }

    if (authData.user) {
      user.value = authData.user;
      const loadedProfile = await refreshProfile(authData.user.id);
      if (!loadedProfile) return { user: authData.user, profile: null, error: 'Failed to load profile' };
      return { user: authData.user, profile: loadedProfile, error: null };
    }

    loading.value = false;
    error.value = 'Sign in failed';
    return { user: null, profile: null, error: 'Sign in failed' };
  };

  const signOut = async () => {
    if (isDemoMode) {
      clearDemoAuth();
      user.value = null;
      profile.value = null;
      loading.value = false;
      error.value = null;
      return;
    }

    await supabase!.auth.signOut();
    user.value = null;
    profile.value = null;
    loading.value = false;
    error.value = null;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user.value) return { error: 'Not authenticated' };

    if (isDemoMode) {
      const newProfile = { ...profile.value!, ...updates, updated_at: new Date().toISOString(), version: profile.value!.version + 1 };
      setDemoAuth(user.value, newProfile);
      profile.value = newProfile;
      return { error: null };
    }

    const { data, error: queryError } = await supabase!
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString(), version: profile.value!.version + 1 })
      .eq('id', user.value!.id)
      .select()
      .single();

    if (queryError) return { error: queryError.message };
    profile.value = data as Profile;
    return { error: null };
  };

  return { user, profile, loading, error, signUp, signIn, signOut, updateProfile, refreshProfile };
}

// Type augmentation for Supabase user
declare module '@supabase/supabase-js' {
  interface User {
    profile?: Profile;
  }
}
