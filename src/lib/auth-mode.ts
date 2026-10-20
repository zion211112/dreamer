export type AuthMode = 'local' | 'supabase';

const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSY_VALUES = new Set(['0', 'false', 'no', 'off']);

// The prototype is still in development and has no connected backend. While
// the local development identity is enabled, /sign-in accepts any email and
// password and stores a signed cookie in the browser only. Nothing is written
// to a server, no shared record is created, and every action that would write
// a shared record stays disabled. Set DEV_AUTH_ENABLED=false to hand sign-in
// back to Supabase Auth.
export function isLocalAuthEnabled(): boolean {
  const raw = process.env.DEV_AUTH_ENABLED ?? process.env.NEXT_PUBLIC_DEV_AUTH ?? '';
  const flag = raw.trim().toLowerCase();
  if (FALSY_VALUES.has(flag)) return false;
  if (TRUTHY_VALUES.has(flag)) return true;
  return true;
}

export const LOCAL_IDENTITY_ACTION_BLOCK =
  'This action writes a shared record and needs a connected Supabase project. The local development identity can open the Studio but cannot publish, record Capital Intent or change Assembly state.';

export function localAuthActionBlock(): string | null {
  return isLocalAuthEnabled() ? LOCAL_IDENTITY_ACTION_BLOCK : null;
}
