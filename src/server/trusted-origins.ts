export function parseTrustedOrigins(baseURL: string | undefined, additions = ''): string[] {
  return [...new Set([baseURL ?? '', ...additions.split(',')].flatMap((value) => {
    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:' ? [url.origin] : [];
    } catch {
      return [];
    }
  }))];
}

export function isTrustedRequestOrigin(origin: string | undefined, trustedOrigins: string[]): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.origin === origin && trustedOrigins.includes(origin);
  } catch {
    return false;
  }
}
