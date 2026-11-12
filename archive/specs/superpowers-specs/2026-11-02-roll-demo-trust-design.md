# Roll Demo Trust Boundary Design

## Goal

Make the Roll evidence and hash mechanics inspectable in browser-local demo mode without presenting sample data as authoritative or independently verified.

## Design contract

- The Roll directory is optimized for scanning and comparing records. Selecting verification opens an inspection dialog with the canonical JSON and both hashes.
- A persistent demo notice identifies fixtures and browser-local entries as synthetic, local to this browser, and non-authoritative.
- Evidence visibility (`public`, `participant`, `restricted`) is presented separately from hash integrity. A matching hash says only that the selected canonical fields currently hash to the stored digest.
- Creation and verification use one canonical JSON function. The canonical field list is explicit and deterministic.
- Demo fixture records are clearly synthetic and have all three evidence visibility layers. Their hashes are computed from the canonical representation.
- Demo-created records are saved under a separate localStorage key from immutable fixtures. Reads merge them with fixtures; malformed storage is surfaced as an error instead of silently appearing empty.
- Loading failure has a retryable error state, distinct from a genuinely empty result.
- Verification failures are visible in the dialog; success messaging does not claim that the record, identity, acceptance, or evidence is independently verified.

## Interaction and states

1. The directory begins in a scan-friendly card/table view and shows the demo-boundary notice.
2. The record action opens a details dialog. Its integrity section recomputes SHA-256 from the canonical fields and displays stored/computed digests and the exact canonical JSON.
3. Hash match and mismatch are described as byte-integrity outcomes, not truth or authority outcomes.
4. Loading, failed load, filtered-empty, and no-record states remain distinct and accessible.
5. Local demo creation persists user-created entries separately and does not mutate fixture records.

## Scope

Included: shared canonicalization, demo fixture hygiene, local demo persistence/read path, hash verification UI copy and errors, truthful load/empty states, focused tests.

Excluded: Supabase authorization or production immutability guarantees, Workbench simulation integration, participant exports, blueprint generation, independent/counterparty verification, revision workflows, and changing the undertaking taxonomy.

## Validation

- Unit tests cover deterministic canonical JSON, matching and mismatching hashes, fixture integrity, demo persistence/merge, malformed local storage, and load-error versus empty-state behavior where testable.
- Production build and unit test suite pass.
- Browser smoke test verifies the Roll demo renders and the verification dialog exposes canonical JSON and accurately qualified results.
