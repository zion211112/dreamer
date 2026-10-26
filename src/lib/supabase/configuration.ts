export type SupabaseConfigurationStatus = 'ready' | 'missing' | 'placeholder' | 'invalid';

const PLACEHOLDER_MARKERS = ['placeholder', 'replace-with', 'your-anon', 'changeme', 'your-key', 'dummy'];

// A Supabase project ref is exactly 20 characters. A longer string is a
// fabricated hostname that will never resolve in DNS.
const PROJECT_REF_LENGTH = 20;

function isPlaceholder(value: string): boolean {
  const lowered = value.trim().toLowerCase();
  if (!lowered) return true;
  return PLACEHOLDER_MARKERS.some(marker => lowered.includes(marker));
}

export function getSupabaseConfigurationStatus(
  url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
): SupabaseConfigurationStatus {
  if (!url || !key) return 'missing';
  if (isPlaceholder(url) || isPlaceholder(key)) return 'placeholder';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return 'invalid';
    if (parsed.hostname === 'localhost') return 'ready';
    if (!parsed.hostname.endsWith('.supabase.co')) return 'invalid';
    const ref = parsed.hostname.slice(0, -'.supabase.co'.length);
    if (ref.length !== PROJECT_REF_LENGTH) return 'invalid';
  } catch {
    return 'invalid';
  }
  return 'ready';
}

export function hasSupabaseConfiguration(
  url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
): boolean {
  return getSupabaseConfigurationStatus(url, key) === 'ready';
}