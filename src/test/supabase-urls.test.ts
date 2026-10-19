import { getSiteOrigin, safeReturnPath } from '@/lib/supabase/urls';
import { getSupabaseConfigurationStatus } from '@/lib/supabase/configuration';
import {
  describeSignInFailure,
  readCredentialFormData,
  validateCredentials,
} from '@/lib/supabase/credentials';

describe('Supabase configuration detection', () => {
  it('reports missing settings when either value is absent', () => {
    expect(getSupabaseConfigurationStatus(undefined, undefined)).toBe('missing');
    expect(getSupabaseConfigurationStatus('https://abc.supabase.co', undefined)).toBe('missing');
    expect(getSupabaseConfigurationStatus(undefined, 'anon-key-value')).toBe('missing');
  });

  it('reports placeholder settings instead of treating them as configured', () => {
    expect(getSupabaseConfigurationStatus('https://abc.supabase.co', 'placeholder-anon-key-replace-with-real-key')).toBe('placeholder');
    expect(getSupabaseConfigurationStatus('https://abc.supabase.co', 'REPLACE-WITH-YOUR-KEY')).toBe('placeholder');
  });

  it('rejects URLs that are not Supabase projects', () => {
    expect(getSupabaseConfigurationStatus('not-a-url', 'anon-key-value')).toBe('invalid');
    expect(getSupabaseConfigurationStatus('https://example.com', 'anon-key-value')).toBe('invalid');
  });

  it('rejects a project ref that is not exactly 20 characters', () => {
    expect(getSupabaseConfigurationStatus('https://sbp_fc2280f80697f1329c7048edd663927ddffff248.supabase.co', 'anon-key-value')).toBe('invalid');
    expect(getSupabaseConfigurationStatus('https://shortref.supabase.co', 'anon-key-value')).toBe('invalid');
  });

  it('accepts a well-formed project URL and public key', () => {
    expect(getSupabaseConfigurationStatus('https://abcdefghijklmnopqrst.supabase.co', 'eyJhbGciOiJIUzI1NiJ9.anon')).toBe('ready');
  });
});

describe('Credential validation', () => {
  it('rejects a malformed email address', () => {
    expect(validateCredentials({ email: 'admin', password: 'secret', intent: 'sign-in' })).toBe('Enter a valid email address.');
    expect(validateCredentials({ email: 'a@b', password: 'secret', intent: 'sign-in' })).toBe('Enter a valid email address.');
  });

  it('requires a longer password when creating an account', () => {
    expect(validateCredentials({ email: 'a@b.co', password: 'short', intent: 'sign-in' })).toBeNull();
    expect(validateCredentials({ email: 'a@b.co', password: 'short', intent: 'sign-up' })).toContain('12');
  });

  it('rejects an empty password on sign-in', () => {
    expect(validateCredentials({ email: 'a@b.co', password: '', intent: 'sign-in' })).toBe('Enter your password.');
  });

  it('reads the intent and sanitises the return path from form data', () => {
    const formData = new FormData();
    formData.set('email', '  person@example.com  ');
    formData.set('password', 'a-valid-password');
    formData.set('intent', 'sign-up');
    formData.set('next', '//attacker.example');
    const parsed = readCredentialFormData(formData);
    expect(parsed.email).toBe('person@example.com');
    expect(parsed.intent).toBe('sign-up');
    expect(parsed.next).toBe('/workspace');
  });

  it('distinguishes an unconfirmed email from a rejected password', () => {
    expect(describeSignInFailure('Email not confirmed')).toContain('confirmation link');
    expect(describeSignInFailure('Invalid login credentials')).toContain('Create a basic account');
    expect(describeSignInFailure('Something else went wrong')).toBe('Email or password was not accepted.');
  });
});

describe('Supabase redirect URLs', () => {
  it('uses only an explicit HTTP(S) site origin', () => {
    expect(getSiteOrigin('https://apt-labs.example/path', false)).toBeUndefined();
    expect(getSiteOrigin('https://apt-labs.example', false)).toBe('https://apt-labs.example');
  });

  it('requires HTTPS in production and uses local development origin when unset', () => {
    expect(getSiteOrigin('http://apt-labs.example', true)).toBeUndefined();
    expect(getSiteOrigin(undefined, false)).toBe('http://localhost:3000');
    expect(getSiteOrigin(undefined, true)).toBeUndefined();
  });

  it('accepts only same-site return paths', () => {
    expect(safeReturnPath('/assembly/123?step=materials')).toBe('/assembly/123?step=materials');
    expect(safeReturnPath('//attacker.example')).toBe('/workspace');
    expect(safeReturnPath('/\\attacker.example')).toBe('/workspace');
  });
});
