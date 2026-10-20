import 'server-only';
import { cookies } from 'next/headers';
import type { WorkspaceContextOption } from '@/lib/workspace';
import {
  LOCAL_SESSION_COOKIE,
  LOCAL_SESSION_TTL_SECONDS,
  decodeLocalSession,
  encodeLocalSession,
  normalizeLocalEmail,
  type LocalIdentity,
} from '@/lib/local-session';

export const LOCAL_NETWORK_CONTEXT_KEY = 'network';

// The local development identity has no server-verified membership, so it
// receives the base network context only. School, crew and funder contexts
// stay reserved for identities the server has actually verified.
export function localWorkspaceContexts(): WorkspaceContextOption[] {
  return [
    {
      key: LOCAL_NETWORK_CONTEXT_KEY,
      kind: 'network',
      label: 'APT-LABS Network',
      role: 'member',
      organizationId: null,
      tenderId: null,
      tenderSlug: null,
      tenderStatus: null,
      assetName: null,
      isIllustrative: false,
    },
  ];
}

export async function createLocalSession(email: string): Promise<LocalIdentity> {
  const issuedAt = Date.now();
  const identity: LocalIdentity = {
    email: normalizeLocalEmail(email),
    issuedAt,
    expiresAt: issuedAt + LOCAL_SESSION_TTL_SECONDS * 1000,
  };
  const cookieStore = await cookies();
  cookieStore.set(LOCAL_SESSION_COOKIE, encodeLocalSession(identity), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: LOCAL_SESSION_TTL_SECONDS,
  });
  return identity;
}

export async function clearLocalSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(LOCAL_SESSION_COOKIE);
}

export async function getLocalIdentity(): Promise<LocalIdentity | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCAL_SESSION_COOKIE)?.value;
  if (!value) return null;
  return decodeLocalSession(value);
}
