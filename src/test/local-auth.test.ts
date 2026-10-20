import {
  LOCAL_SESSION_TTL_SECONDS,
  decodeLocalSession,
  encodeLocalSession,
  localSessionSecret,
  normalizeLocalEmail,
} from '@/lib/local-session';
import { isLocalAuthEnabled, localAuthActionBlock } from '@/lib/auth-mode';

const SECRET = 'test-secret-value';

function identity(overrides: Partial<{ email: string; issuedAt: number; expiresAt: number }> = {}) {
  const issuedAt = overrides.issuedAt ?? Date.now();
  return {
    email: overrides.email ?? 'person@example.com',
    issuedAt,
    expiresAt: overrides.expiresAt ?? issuedAt + LOCAL_SESSION_TTL_SECONDS * 1000,
  };
}

describe('Local session encoding', () => {
  it('round-trips a signed session', () => {
    const session = identity();
    const value = encodeLocalSession(session, SECRET);
    expect(decodeLocalSession(value, SECRET)).toEqual(session);
  });

  it('rejects a session signed with a different secret', () => {
    const value = encodeLocalSession(identity(), SECRET);
    expect(decodeLocalSession(value, 'another-secret-value')).toBeNull();
  });

  it('rejects a tampered payload', () => {
    const value = encodeLocalSession(identity(), SECRET);
    const [body, signature] = value.split('.');
    const forged = Buffer.from(JSON.stringify(identity({ email: 'attacker@example.com' })), 'utf8').toString('base64url');
    expect(decodeLocalSession(`${forged}.${signature}`, SECRET)).toBeNull();
    expect(decodeLocalSession(`${body}.${forged}`, SECRET)).toBeNull();
  });

  it('rejects an expired session', () => {
    const issuedAt = Date.now() - LOCAL_SESSION_TTL_SECONDS * 2000;
    const value = encodeLocalSession(identity({ issuedAt, expiresAt: issuedAt + 1000 }), SECRET);
    expect(decodeLocalSession(value, SECRET)).toBeNull();
  });

  it('rejects a malformed cookie', () => {
    expect(decodeLocalSession('', SECRET)).toBeNull();
    expect(decodeLocalSession('no-separator', SECRET)).toBeNull();
    expect(decodeLocalSession('.signature-only', SECRET)).toBeNull();
    expect(decodeLocalSession('bm90LWpzb24.signature', SECRET)).toBeNull();
  });

  it('normalises the email and falls back to a development secret', () => {
    expect(normalizeLocalEmail('  Person@Example.COM ')).toBe('person@example.com');
    const previous = process.env.DEV_AUTH_SECRET;
    delete process.env.DEV_AUTH_SECRET;
    expect(localSessionSecret()).toBe('apt-labs-local-development-identity');
    if (previous === undefined) {
      delete process.env.DEV_AUTH_SECRET;
    } else {
      process.env.DEV_AUTH_SECRET = previous;
    }
  });
});

describe('Auth mode resolution', () => {
  const originalFlag = process.env.DEV_AUTH_ENABLED;

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.DEV_AUTH_ENABLED;
    } else {
      process.env.DEV_AUTH_ENABLED = originalFlag;
    }
  });

  it('runs the local identity by default', () => {
    delete process.env.DEV_AUTH_ENABLED;
    expect(isLocalAuthEnabled()).toBe(true);
  });

  it('hands sign-in back to Supabase when the flag is switched off', () => {
    process.env.DEV_AUTH_ENABLED = 'false';
    expect(isLocalAuthEnabled()).toBe(false);
    expect(localAuthActionBlock()).toBeNull();
  });

  it('blocks shared-record actions while the local identity is enabled', () => {
    process.env.DEV_AUTH_ENABLED = 'true';
    expect(isLocalAuthEnabled()).toBe(true);
    expect(localAuthActionBlock()).toContain('Supabase');
  });
});
