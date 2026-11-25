import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({ baseURL: globalThis.location?.origin ?? 'http://localhost:4200' });
