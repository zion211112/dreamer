# People Capability Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the graph-first People landing with a searchable, capability-led directory for individuals and crews, while preserving the explicit relationship map as a secondary view.

**Architecture:** Keep `NetworkEntity` and `NetworkRelationship` as the shared example/import boundary. Add focused capability, evidence, availability, service, contact, and user-authored profile types without changing other Studio modules. Extract pure search/filter and local-profile persistence rules for unit tests; render People and Crews in a shared directory and reuse one entity inspector in both Directory and Network views.

**Tech Stack:** Vite, Preact, TypeScript, Vitest, existing `src/styles.css`; no added dependency.

**Spec:** `docs/superpowers/specs/2026-10-31-people-capability-workspace-design.md`

## Global Constraints

- Keep the active app Vite + Preact; do not add a backend.
- Limit this change to People and focused People components/styles/tests.
- Preserve the Studio shell, existing routes, imported portable People records, and their source data.
- Studio example records are read-only; imported records are never overwritten; similar names never auto-merge.
- Only explicit, valid relationships create contextual links; no inferred people, availability, capacity, or match.
- Contact details are hidden unless the person explicitly opts to display them; do not add messaging.
- In this slice, only imported portable records can start a local revision; the editor changes availability and contact preferences only. It creates no new people or crew entities.
- The browser-local demo identity is only an ownership key, not authentication, secure access control, or a displayed contact method.
- Do not add a dependency without a concrete approved need.

## Review Focus

- Legacy portable records omit new fields or local storage is malformed: preserve source data and report the read error without destructive fallback (Tasks 1 and 4).
- A contact value exists but display is disabled: keep it out of search, details, links, and accessibility text (Tasks 1 and 4).
- Availability is absent or `not-stated`: do not infer capacity or availability, and hide an unhelpful availability filter (Tasks 1 and 2).
- Similar names, IDs shared by sample/imported datasets, or unresolved relationship IDs occur: keep imported revisions scoped to imported records, do not merge records, and render no invalid contextual links (Tasks 1, 3, and 5).
- The browser-local demo owner is absent or a save fails: do not expose an unusable editor or claim a revision was saved (Task 4).

---

### Task 1: People profile domain and local records

**Files:**
- Modify: `src/lib/people-network.ts`
- Create: `src/lib/people-profiles.ts`
- Test: `src/lib/people-profiles.test.ts`

**Interfaces:**
- `PeopleAvailability = 'open-to-enquiries' | 'limited-availability' | 'not-taking-work' | 'not-stated'`.
- `CapabilityClaim`: `{ id, subjectId, name, scope, visibility: 'public' | 'private', claimSource: 'self-declared' | 'attributed' | 'unspecified', evidenceIds }`.
- `PeopleEvidence`: `{ id, sourceId, type, suppliedBy, issuedBy?, supportsCapabilityId, verificationStatus: 'unverified' | 'verified', verifiedBy? }`; `type` is `work-sample | reference | credential | institutional-attestation | accepted-contribution`.
- `PeopleServiceOffer`: `{ id, subjectId, title, scope, deliverables, serviceArea?, indicativeTerms? }`.
- `PeopleContactMethod`: `{ id, type, value, display, preferred }`; render only methods with `display: true`. `PeopleAvailability` and optional `availabilityUpdatedAt` belong to a person/crew profile.
- `PeopleProfileOrigin = 'user-authored' | 'imported' | 'studio-example'`; `PeopleProfileRecord` contains `{ id, subjectId, origin, ownerId?, sourceRecordId?, availability, availabilityUpdatedAt?, claims, offers, contactMethods }`.
- Export pure helpers `getDisplayableContactMethods(profile)`, `canEditPeopleProfile(profile, ownerId)`, and `createUserProfileRevision(imported, ownerId)`. Imported source records are immutable; revision creates a new user-authored record linked by `sourceRecordId`.
- Export `getCapabilityEvidence(capabilityId, evidenceRecords)` to return only evidence explicitly linked to that capability, preserving its type, supplier/issuer, verification status, and verifier without promoting one evidence type into another.
- Persist user-authored profile records separately under `aptlabs:people-profiles:v1`. Use the existing browser-local identity only as a demo ownership key; it is not authentication or secure access control and must not be shown as contact data.

- [x] **Step 1: Add failing tests** named `acceptsOnlySupportedAvailabilityValues`, `keepsClaimSourceSeparateFromVerification`, `hidesContactMethodsUnlessDisplayIsTrue`, `allowsEditingOnlyUserAuthoredOwnedProfiles`, and `createsLinkedRevisionWithoutChangingImportedRecord`.
- [x] **Step 2: Run focused tests and confirm they fail** with missing types/functions or validation.
- [x] **Step 3: Add the typed profile records and versioned local store.** Keep new fields optional when reading existing `NetworkEntity` and portable v1 payloads; validate every new record before save/load; never mutate imported source records.
- [x] **Step 4: Add tests** named `loadsLegacyPortableRecordsWithoutMutation`, `rejectsMalformedProfileWithoutReplacingStoredData`, and `keepsSimilarNamesAsSeparateRecords`.
- [x] **Step 5: Run `npm run test:unit -- --run src/lib/people-profiles.test.ts`** and confirm all profile/domain tests pass.

### Task 2: Searchable People and Crews directory

**Files:**
- Modify: `src/pages/workspace/People.tsx`
- Create: `src/components/people/PeopleDirectory.tsx`
- Create: `src/lib/people-discovery.ts`
- Test: `src/lib/people-discovery.test.ts`
- Modify: `src/styles.css`

**Interfaces:**
- `PeopleDirectoryEntry` projects one `NetworkEntity` plus its capability claims, offers, explicit availability, and supplied service areas.
- `searchPeople(records: readonly PeopleDirectoryEntry[], query: string): PeopleDirectoryEntry[]` searches name, role, capability, service, and supplied working area; it does not search hidden contact values.
- `filterPeople(records: readonly PeopleDirectoryEntry[], filters: PeopleFilters): PeopleDirectoryEntry[]` filters by capability, supplied service area, and explicit availability; unset values never satisfy availability filters.
- `hasUsefulAvailabilityFilter(records: readonly PeopleDirectoryEntry[]): boolean` is true only when at least one result has a value other than `not-stated`.
- Directory views are **People**, **Crews**, and **Network**. Assets remain contextual records, not a People directory tab.

- [x] **Step 1: Add failing tests** named `searchesNameRoleCapabilityOfferAndArea`, `combinesCapabilityAreaAndAvailabilityFilters`, `doesNotSearchHiddenContactValues`, and `hidesAvailabilityFilterWhenAllValuesAreNotStated`.
- [x] **Step 2: Run `npm run test:unit -- --run src/lib/people-discovery.test.ts`** and confirm the new tests fail.
- [x] **Step 3: Implement the pure discovery functions** in `src/lib/people-discovery.ts` and pass their tests.
- [x] **Step 4: Build the compact directory** in `PeopleDirectory.tsx`; wire People/Crews/Network view state, search, useful filters, clear/reset, and selectable list rows in `People.tsx`. Keep the current Studio shell and preserve query/filter/scroll state while details open.
- [x] **Step 5: Add People-scoped list and control styles** using current tokens. Do not add profile cards, KPI tiles, completion meters, rating stars, decorative graph treatments, or an Add Profile action without a working save path.
- [x] **Step 6: Run discovery tests and `npm run build`**; confirm directory view wiring type-checks.

### Task 3: Shared profile inspector and explicit contact

**Files:**
- Modify: `src/components/people/EntityInspector.tsx`
- Modify: `src/pages/workspace/People.tsx`
- Modify: `src/components/people/NetworkMap.tsx` only if needed to pass the shared selection callback/state
- Modify: `src/styles.css`

**Interfaces:**
- Directory rows and Network nodes select the same entity ID and render the same `EntityInspector` with the same profile/evidence/relationship records.
- `getCapabilityEvidence(capabilityId: string, records: readonly PeopleEvidence[]): PeopleEvidence[]` preserves evidence type and verification fields without inferring accepted work from a verified credential.
- Add pure helper `getContextualAnchorLinks(subjectId: string, relationships: readonly NetworkRelationship[], validAnchorIds: ReadonlySet<string>): string[]`; return only directly related valid IDs and return no placeholders for absent/invalid edges.
- Inspector order: identity/practice; capabilities/services; selected work/evidence; collaborations/affiliations; contact preferences.
- `open-to-enquiries`, `limited-availability`, `not-taking-work`, and `not-stated` are the only availability values; optional `lastUpdated` is display metadata, not a schedule.
- Contextual anchor links render only when their target exists and an explicit valid relationship connects it. Treat Kemetos1 as a software asset, School Management Console as a software product reference, Lake Basin Cold Store Chamber A as a physical asset, Open Design Library as an institution, and Kimunye Tea Factory as an asset reference. Community Tool Library remains a distinct asset.

- [x] **Step 1: Add failing tests** named `returnsOnlyEvidenceLinkedToCapability`, `preservesEvidenceTypeAndVerificationSeparately`, `issuerVerifiedCredentialDoesNotImplyAcceptedWork`, `projectsCrewOwnedContactRoute`, `omitsUndisclosedContacts`, and `returnsOnlyExplicitValidAnchorLinks`.
- [x] **Step 2: Run the focused People tests** and confirm the relevant cases fail before implementation.
- [x] **Step 3: Update `EntityInspector`** to display person- and crew-specific sections, claim source separately from verification, explicit availability, attributable evidence, collaborations, and only opted-in contact routes. Never source contact data from `authUser`.
- [x] **Step 4: Reuse that inspector from both directory and Network selection.** Keep Network as a secondary view and do not add graph-specific profile fields or interpretations.
- [x] **Step 5: Keep profile actions aligned with the approved slice.** Only imported records may start a local revision; sample records stay read-only, and no new person/crew entity is created. Do not render an edit action without a valid local owner and persistence path.
- [x] **Step 6: Run focused tests** and confirm both discovery paths resolve to the same selected entity and inspector data.

### Task 4: Responsive, accessible integration

**Files:**
- Modify: `src/pages/workspace/People.tsx`
- Modify: `src/components/people/PeopleDirectory.tsx`
- Modify: `src/components/people/EntityInspector.tsx`
- Modify: `src/components/people/NetworkMap.tsx` only for shared state or keyboard fixes
- Modify: `src/styles.css`

- [x] **Step 1: Verify keyboard flow** through tabs, search, filters, rows, inspector close, contact links, and the graph's directory alternative; ensure visible focus and sensible focus return.
- [x] **Step 2: Verify mobile detail behavior** at 320px and 768px; selection opens a labeled dismissible sheet/dialog, preserves search/filter state, and does not expose hidden contact values.
- [x] **Step 3: Verify desktop layouts** at 1024px and 1440px; inspector remains contextual and the compact directory stays scannable.
- [x] **Step 4: Verify reduced motion and long content** including long names, capability scopes, evidence titles, and zero/large result sets.
- [x] **Step 5: Run `npm run test:unit -- --run` and `npm run build`.** Review browser screenshots at 320, 768, 1024, and 1440px and correct only People-scoped issues.

### Task 5: Imported profile revision editor

**Files:**
- Modify: `src/components/people/EntityInspector.tsx`
- Modify: `src/pages/workspace/People.tsx`
- Modify: `src/lib/people-profiles.ts`
- Test: `src/lib/people-profiles.test.ts`
- Modify: `src/styles.css`

**Interfaces:**
- `createImportedPeopleProfile(entity: NetworkEntity): PeopleProfileRecord` creates a read-only imported baseline from the selected imported person/crew without changing the source record. Its availability is `not-stated`; capability claims are source-unspecified; offers and contacts start empty.
- `updateUserProfileRevision(profile: PeopleProfileRecord, ownerId: string, changes: Pick<PeopleProfileRecord, 'availability' | 'availabilityUpdatedAt' | 'contactMethods'>): PeopleProfileRecord` accepts only an owned user-authored revision and changes only the approved profile fields.
- `readPeopleProfileOwnerId(storage?: PeopleProfileStorage): string` reads the browser-local demo email as a normalized ownership key; it returns an empty string when no demo identity exists and reports unreadable/malformed storage explicitly.
- The inspector offers “Create local revision” only for an imported record with a browser-local demo owner; after the first save it offers an editor for that owner’s revision. It never edits imported identity, capability, work, or relationship data.
- The editor has explicit Save/Cancel, availability options from the spec, and repeatable contact rows with type, value, display opt-in, and at most one preferred method. When availability changes, save records the current ISO timestamp in `availabilityUpdatedAt`. Saved revisions stay in `aptlabs:people-profiles:v1` and are labeled local/unpublished.

- [x] **Step 1: Add failing domain tests** named `createsImportedBaselineWithoutChangingEntity`, `createsLinkedRevisionForImportedRecord`, `updatesOnlyOwnedRevisionFields`, `rejectsEditingAnUnownedOrImportedRecord`, and `readsBrowserLocalDemoOwnerId`.
- [x] **Step 2: Run `npm run test:unit -- --run src/lib/people-profiles.test.ts`** and confirm the new cases fail.
- [x] **Step 3: Implement `createImportedPeopleProfile` and `updateUserProfileRevision`** in `src/lib/people-profiles.ts`; validate input before save and preserve the original imported record.
- [x] **Step 4: Add save-failure and undisclosed-contact tests**; confirm malformed values do not replace stored records and non-display contacts remain absent from display helpers.
- [x] **Step 5: Add the inspector editor** with explicit create/edit, save/cancel, local/unpublished copy, accessible validation errors, and no action when local ownership is unavailable.
- [x] **Step 6: Verify the editor** at 320px, 768px, 1024px, and 1440px; check keyboard-only Save/Cancel, focus return, hidden-contact privacy, failed storage, that create/edit/cancel never mutates imported source data, and that switching to sample data never applies an imported revision.
- [x] **Step 7: Run `npm run test:unit -- --run` and `npm run build`.**

## Scope freeze

This plan covers People only. Commons changes are tracked and validated in a separate plan and commit. Do not change Institutions, School Console, Workbench, Roll, the shared Studio shell, or asset catalogs. Do not implement procurement, bidding, negotiation, payment, scheduling, messaging, AI recommendations, external services, or backend persistence. Do not add dependencies.
