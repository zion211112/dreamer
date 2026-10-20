import { createHmac, timingSafeEqual } from 'node:crypto';

export const LOCAL_SESSION_COOKIE = 'apt-labs-dev-session';
export const LOCAL_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const FALLBACK_SECRET = 'apt-labs-local-development-identity';
const MAX_EMAIL_LENGTH = 254;

export interface LocalIdentity {
  email: string;
  issuedAt: number;
  expiresAt: number;
}

export function normalizeLocalEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH);
}

export function localSessionSecret(): string {
  return process.env.DEV_AUTH_SECRET?.trim() || FALLBACK_SECRET;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function encodeLocalSession(identity: LocalIdentity, secret = localSessionSecret()): string {
  const body = Buffer.from(JSON.stringify(identity), 'utf8').toString('base64url');
  return `${body}.${sign(body, secret)}`;
}

export function decodeLocalSession(value: string, secret = localSessionSecret()): LocalIdentity | null {
  const separator = value.indexOf('.');
  if (separator <= 0) return null;
  const body = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!signature) return null;

  const expected = Buffer.from(sign(body, secret), 'utf8');
  const provided = Buffer.from(signature, 'utf8');
  if (expected.length !== provided.length) return null;
  if (!timingSafeEqual(expected, provided)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;

  const record = parsed as Record<string, unknown>;
  if (typeof record.email !== 'string' || !record.email) return null;
  if (typeof record.issuedAt !== 'number' || !Number.isFinite(record.issuedAt)) return null;
  if (typeof record.expiresAt !== 'number' || !Number.isFinite(record.expiresAt)) return null;
  if (record.expiresAt <= Date.now()) return null;

  return { email: record.email, issuedAt: record.issuedAt, expiresAt: record.expiresAt };
}
