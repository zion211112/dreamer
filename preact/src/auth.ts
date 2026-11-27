import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({ baseURL: globalThis.location?.origin ?? 'http://localhost:4200' });

export interface WorkspaceSession {
  session: { id: string };
  user: { id: string; name: string; email: string };
}

export async function getWorkspaceSession(): Promise<WorkspaceSession | null> {
  const result = await authClient.getSession();
  const data = result.data as WorkspaceSession | null;
  return data?.session && data.user ? data : null;
}
