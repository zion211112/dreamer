# School Console Nested Port Design

**Status:** Approved for specification; awaiting user review
**Date:** 2026-10-30
**Scope:** Port the core local School Console into the active Vite + Preact app and open it from the School Management Console asset.

## Product intent

The School Management Console asset is a doorway to a product, not a claim that the institution's broader management model is complete. Opening it should enter a focused, local-first school tool for teachers and principals. The School Console and APT-LABS shared workspace have related but distinct responsibilities and data boundaries.

This port restores the existing console concept without reintroducing the archived Next.js application, server actions, or external service integrations. It is a browser-local demo, not a school information system suitable for real student records.

## Goals

1. Make the School Management Console asset open a dedicated nested School Console route.
2. Restore the core historical teacher and principal context, beginning with My Day, Auto-Marking, and principal tender drafts.
3. Preserve the existing browser-local console snapshot where possible.
4. Keep school and learner records out of Commons, Workbench, and other shared network records.
5. Clearly represent local-only behavior, draft state, and unavailable integrations.

## Non-goals

- Completing or redesigning the wider Institutions asset model.
- Restoring every historical module in this first port (including Fees, Inspection, Comms, roster management, and reporting modules beyond what is needed to display existing marks).
- Adding authentication, multi-user access control, synchronization, encryption claims, backup, or a backend.
- Calling Fikra API or any other external service for marking or content generation.
- Publishing a tender, creating a live opportunity, assigning contributors, or automatically relaying school data to APT-LABS.
- Pulling animator or contributor deliverables into school records. A future resource-review handoff requires its own consent, authorship, rights, and review design.

## Entry and navigation

The School Management Console record in Institutions remains the entry point. Its primary action navigates to a stable nested route, proposed as `/workspace/institutions/school-console`, rather than the Workbench tender form. The console provides a clear return link to the asset/Institutions context and has internal navigation for its modules.

The console uses the existing workspace shell conventions where appropriate, but presents an identifiable School Console context. A local Teacher / Principal switch changes the visible module set; it is a presentation control for the demo and does not authenticate or authorize a real person. Direct navigation and page refresh must continue to render the console route.

The asset record's text and action should only be adjusted enough to describe and open the local-first console prototype accurately. Do not expand the asset ontology or imply operational completeness.

## Visual quality

“Luxury pro-enterprise” means exact hierarchy, calm confidence, excellent information density, and careful interaction states—not decorative excess or a larger feature set. Preserve the active APT-LABS visual language and tokens while giving the console a distinct operational identity.

- Use a stable product frame: clear School Console identity and local-data context, a compact internal module rail on wide screens, and one focused work surface at a time.
- Prioritize legibility and scan order with measured editorial headings, compact provenance labels, aligned columns, consistent spacing, and quiet separators. Do not use nested cards, dashboard-stat tiles, glass effects, or gradients as substitutes for hierarchy.
- Keep the palette restrained and semantically meaningful. Use existing type families and tokens; do not introduce dependencies or a competing design system.
- Give forms, module selection, save states, empty states, errors, focus, and disabled controls equal design attention. Interactions must feel deliberate and remain keyboard-accessible.
- At narrow widths, collapse navigation without hiding the active module or local-data boundary. Avoid horizontal overflow and preserve a clear action hierarchy.
- Use only subtle, purposeful transitions and honor reduced-motion preferences.
- Do not add fabricated institutional metrics, activity, live status, learner identities, or connected-service indicators for visual fullness.

## Core workflows

### Teacher: My Day

Show a small, editable daily checklist based on the historical console concept. Completion state is local and reversible. Any seeded entries are clearly identified as examples and must not imply a live timetable, attendance feed, or school calendar.

### Teacher: Auto-Marking

Port the historical deterministic marking behavior and present the applicable answer scheme before marking. The historical engine grants marks for a case-insensitive, accent-sensitive canonical answer or when a configured accepted keyword appears within the response; keyword matching is intentionally transparent and may need teacher correction. It does not call an AI model and does not read scans or images. Typed practice input is the supported path. Results are provisional practice records: the teacher must review them, and the UI must not describe them as official grades or predictive outcomes.

Keep the rule engine independently testable. Invalid scheme definitions and malformed imports must return actionable errors without partially saving a batch. If CSV/JSON import is carried into this first slice, retain the historical typed-data-only limits and validate the entire file before persistence.

### Principal: Tender drafts

Allow a principal-view user to create, inspect, and discard local tender drafts. Drafts remain private to the School Console database. A save is not publication and does not create or update a Workbench opportunity. Do not expose a success message that implies network review, contributor assignment, or a live tender.

The local role switch is not an authorization boundary. Any real publication or cross-system handoff is explicitly out of scope.

## Storage and compatibility

The archived console used IndexedDB with:

- Database: `apt-labs-school-console`
- Object store: `local-work`
- Snapshot key: `school-console-v1`

The port should continue reading and writing this snapshot identity so previously saved same-origin browser data remains available. The historical snapshot includes `markedPapers`, `lessonDraft`, `completedTasks`, `inspectionChecks`, `tenderDrafts`, and `feeNotes`. Although this release surfaces only core modules, loading and saving must preserve fields belonging to modules not yet ported; hidden legacy values must not be dropped when a new My Day completion or mark is saved.

Read existing snapshots defensively, default missing fields, and tolerate older tender drafts with omitted optional values. Do not silently replace malformed existing data with an empty snapshot. If loading fails or the snapshot is malformed, keep persistence-affecting actions disabled for that session; do not overwrite the unreadable value. Report load/save failures in the console and do not claim persistence succeeded. Clearly state that IndexedDB is browser-local storage, not encrypted, synced, or backed up.

Use the historical data contract as a compatibility target; port/reimplement the required typed interfaces and deterministic engine in the active Preact codebase rather than importing React/Next modules. Do not add a dependency unless implementation demonstrates a concrete need.

## Shared-work boundary

The console snapshot is separate from local Commons and Workbench records. There is no implicit synchronization in either direction. A school need stays a console draft in this slice. Future integration must use an explicit, reviewed, minimal handoff and must never include learner answers, names, or classroom records in a network work request.

## Errors and empty states

- Empty My Day, mark, or tender states explain what can be created without fabricating activity.
- Storage unavailable or blocked is distinct from a successful save; after a failed load, persistence-affecting actions remain disabled rather than risking overwrite.
- Invalid answer schemes or import files do not produce marked results.
- A local tender draft is labeled local and unpublished wherever it appears.
- No placeholder counts, live status, real school roster, or connected-service success state is introduced.

## Acceptance criteria

1. Selecting “Open console” on the School Management Console asset opens the dedicated route; the route survives refresh and offers a clear return path.
2. The route runs in the active Vite + Preact + Wouter application with no Next.js or backend dependency.
3. Teacher and Principal views expose only their intended core modules; switching views does not claim to verify a person's role.
4. My Day changes persist locally and remain reversible.
5. Auto-Marking exposes its deterministic rules, supports typed practice data only, and clearly requires teacher review; no external model/API request occurs.
6. Principal tender drafts can be saved and discarded locally but are never labeled published, sent, authorized, or assigned.
7. Existing `apt-labs-school-console` snapshots load; saving core fields preserves legacy snapshot fields not rendered by this release.
8. IndexedDB read/write errors are visible and never produce false success confirmations; a failed load cannot be followed by a save that overwrites the unreadable snapshot.
9. No student/classroom payload enters Commons, Workbench, or network-facing storage.
10. The responsive console remains keyboard-operable and legible at narrow and desktop widths without horizontal overflow, with the active module and local-data boundary visible.
11. The console follows the Visual quality requirements without introducing fabricated data, nested-card dashboards, gradients, or a competing design system.
12. The asset remains an honest entry record and is not expanded into a claim of a complete school management system.

## Validation

- Add focused tests for the marking rules, malformed inputs, legacy snapshot defaults/round-tripping, and tender draft lifecycle where existing test infrastructure permits.
- Verify route entry from Institutions and direct route refresh in the running Vite app.
- Run `npm run build`.
- Inspect the teacher and principal views at mobile and desktop widths, including keyboard focus and the storage-failure state.
- Confirm through code/test inspection that the console performs no network request and does not write into Commons or Workbench records.