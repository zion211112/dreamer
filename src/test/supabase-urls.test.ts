import { getSiteOrigin, safeReturnPath } from '@/lib/supabase/urls';

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
