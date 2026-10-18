export function safeReturnPath(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/console';
  return value;
}

export function getSiteOrigin(
  configured = process.env.NEXT_PUBLIC_SITE_URL,
  isProduction = process.env.NODE_ENV === 'production',
): string | undefined {
  if (!configured) return isProduction ? undefined : 'http://localhost:3000';

  try {
    const url = new URL(configured);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      (isProduction && url.protocol !== 'https:')
    ) {
      return undefined;
    }
    return url.origin;
  } catch {
    return undefined;
  }
}
