import { describe, expect, it } from 'vitest';
import { isTrustedRequestOrigin, parseTrustedOrigins } from './trusted-origins';

describe('trusted browser origins', () => {
  it('normalizes and deduplicates explicitly configured HTTP origins', () => {
    expect(parseTrustedOrigins('http://localhost:4200/path', 'http://127.0.0.1:4200, http://localhost:4200')).toEqual([
      'http://localhost:4200', 'http://127.0.0.1:4200',
    ]);
  });

  it('rejects missing, malformed, non-HTTP, and unconfigured mutation origins', () => {
    expect(isTrustedRequestOrigin(undefined, ['http://localhost:4200'])).toBe(false);
    expect(isTrustedRequestOrigin('null', ['http://localhost:4200'])).toBe(false);
    expect(isTrustedRequestOrigin('http://localhost:4200.evil.test', ['http://localhost:4200'])).toBe(false);
    expect(isTrustedRequestOrigin('http://127.0.0.1:5173', ['http://localhost:4200'])).toBe(false);
  });

  it('allows only exact configured origin matches', () => {
    expect(isTrustedRequestOrigin('http://localhost:4200', ['http://localhost:4200'])).toBe(true);
  });
});
