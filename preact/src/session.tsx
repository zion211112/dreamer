import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { authClient, getWorkspaceSession, type WorkspaceSession } from './auth';

interface AuthState {
  session: WorkspaceSession | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({ session: null, loading: true, error: '', refresh: async () => {} });

export function AuthProvider({ children }: { children: preact.ComponentChildren }) {
  const [session, setSession] = useState<WorkspaceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      setSession(await getWorkspaceSession());
    } catch {
      setSession(null);
      setError('Authentication service is unavailable. Try again later.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void refresh(); }, []);
  const value = useMemo(() => ({ session, loading, error, refresh }), [session, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireSession({ children }: { children: preact.ComponentChildren }) {
  const { session, loading, error } = useAuth();
  const location = useLocation();
  useEffect(() => {
    if (!loading && !session) {
      const redirect = `${location.url}`;
      location.route(`/sign-in?redirect=${encodeURIComponent(redirect)}${error ? '&unavailable=1' : ''}`, true);
    }
  }, [loading, session, error]);
  if (loading || !session) return <div class="auth-check" role="status">{error || 'Checking your session…'}</div>;
  return <>{children}</>;
}

export async function signOut(): Promise<void> {
  await authClient.signOut();
}
