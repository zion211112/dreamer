/**
 * Computes a SHA-256 hash anchor for Roll entry immutability verification.
 * Uses Web Crypto API for browser compatibility.
 */

export async function computeHashAnchor(canonicalJson: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalJson);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyHashAnchor(canonicalJson: string, expectedHash: string): Promise<boolean> {
  const computed = await computeHashAnchor(canonicalJson);
  return computed === expectedHash;
}

/**
 * Creates canonical JSON for Roll entry hashing.
 * Ensures consistent ordering for reproducible hashes.
 */
export function createCanonicalRollJson(entry: {
  undertaking_id: string;
  undertaking_type: string;
  title: string;
  scope: string;
  deliverables: string[];
  commissioned_by: { institution_id: string; name: string; coordinator_id: string };
  participants: Array<{ role_type: string; person_id: string; profile_id: string | null; name: string; capability_claims: string[]; evidence_ids: string[] }>;
  acceptance: { accepted_by: string; accepted_at: string; inspection_report_id: string | null; cost_disclosed: { amount: number; currency: string } | null };
}): string {
  return JSON.stringify({
    undertaking_id: entry.undertaking_id,
    undertaking_type: entry.undertaking_type,
    title: entry.title,
    scope: entry.scope,
    deliverables: [...entry.deliverables].sort(),
    commissioned_by: entry.commissioned_by,
    participants: [...entry.participants].sort((a, b) => a.person_id.localeCompare(b.person_id)),
    acceptance: entry.acceptance,
  });
}