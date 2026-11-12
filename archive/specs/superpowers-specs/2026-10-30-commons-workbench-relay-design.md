# Commons and Workbench Relay Design

**Status:** Approved for implementation
**Date:** 2026-10-30
**Scope:** Commons signal triage and Workbench brief preparation

## Product intent

APT-LABS makes local needs legible, connects them to institutions and assets, and moves authorized work toward accountable execution. Commons and Workbench are two distinct stages in that system, not two views of the same record:

- **Commons** is the cross-institutional signal queue. It captures observations and machine-assisted discoveries before a work commitment exists.
- **Workbench** is a focused brief editor. It turns a reviewed need into a scoped draft that an institution can assess.
- **Institutions** owns institutional identity, asset/provider discovery, and the authority to approve work. Lacesse Co is the company; Fikra API is its independently discoverable service asset and an APT-LABS infrastructure partner.
- **Authorized work systems** remain downstream. Saving a Workbench brief does not publish a tender, recruit a crew, reserve capital, or create escrow.

The central rule is: **a machine scan can organize evidence; only an authorized human decision can authorize the next step.**

## Relay lifecycle

`Observation → optional Fikra scan → steward review → approved decision → Workbench draft → separate institutional authorization → authorized work`

A signal may come from a person or a connected device. The scan is optional and is stored as evidence associated with a signal, not as the signal's authoritative status. A scan result may include a classification, questions to verify, or candidate materials; each is a suggestion with its provider, mode, time, and source recorded. Scan completion is not human verification.

A steward reviews the signal and records a scoped decision. Only an approved decision may seed a linked Workbench draft. The institution must take a separate authorized action before any later tender, call sheet, crew, or capital workflow. Those execution and finance workflows are outside this design and must not be simulated by this prototype.

## Commons experience

### Primary screen

Commons opens on the signal queue. The desktop layout uses a compact, scannable list beside one selected signal's detail. Search, status filters, and institution scope support discovery without competing with the queue. On small screens, the queue and selected detail stack in that order; selecting a signal exposes its detail without horizontal scrolling.

Each signal makes these facts easy to scan:

- What was observed, and when.
- Affected institution, asset, and place.
- Origin: human report, connected sensor, or illustrative example.
- Current human workflow state and the next permitted action.
- Any linked machine scan, clearly separated from human notes and steward decisions.

Commons remains free of likes, follower counts, promotional partner panels, and automatic work-creation controls. Cross-institution patterns can be found through the queue and its filters, but a pattern is not itself an authorization.

### Fikra scan presentation

Fikra API is an APT-LABS backend partner, not a browser-side assistant. A production scan is requested and recorded server-side. The signal detail may show a restrained provenance row or disclosure with the exact label:

`AI DISCOVERY // UNVERIFIED MACHINE SCAN`

It may show the classification, uncertainty, candidate checks/materials, and a link to the scan's source or receipt when those values exist. It must not call a suggestion a diagnosis, verified telemetry, quotation, or approved BOM. A scan cannot change steward authority or advance a signal into authorized work.

Until a live `/v1` integration is connected, any displayed scan uses the exact badge:

`MOCK SCAN // BROWSER-LOCAL DEMO MODE`

Mock output is static illustrative content, never represented as a live model response or real sensor reading. The prototype must not expose API credentials or send signal data to a provider from the browser. If no scan exists, show no scan result rather than a success-shaped placeholder.

### State and actions

Keep observation state distinct from scan state and governance state. A machine scan can be absent, pending, or returned; a signal can be new, triaged, in brief preparation, or resolved; a proposal can be proposed, approved, returned, or rejected. These labels must never be collapsed into one green “verified” state.

The signal's primary action depends on its human state: record or add evidence, move it into review, inspect the decision record, or open the linked brief after approval. No action may bypass steward authorization. Keep the report form short and structured around institution, asset/place, issue, observation, and reporter-noted urgency.

## Workbench experience

Workbench is a focused work brief, not an IDE or a generic dashboard. Remove editor chrome that implies source-code work: project explorer, pseudo-files, breadcrumbs, and file tabs. Use one document surface with a narrow context rail on wide screens; on mobile, place context after the document.

The brief contains:

1. **Problem and scope:** what needs inspection, repair, or other physical action.
2. **Materials and BOM candidates:** item, quantity, unit, and source to confirm. AI-suggested materials remain candidates, not a quote or procurement.
3. **Unknowns and risks:** site facts, diagnostics, safety questions, and assumptions that remain unresolved.
4. **Acceptance criteria:** observable evidence that would demonstrate completion, such as a measurement or reviewed photo. A criterion is not proof that the work happened.

The context rail links to the originating Commons signal, its steward decision, and the institution/asset record when those records exist. It shows missing context honestly; it does not invent asset history or approval.

A saved brief is always labeled **DRAFT**. The save action stores draft content only. It cannot authorize execution, publish a job, issue a call sheet, lock capital, create escrow, or imply crew assignment. The next action after drafting is an explicit institutional review path, if one exists.

## Fikra and Lacesse representation

Fikra API can support APT-LABS capabilities such as Commons signal scanning and School Console automarking through backend integrations. Those are product capabilities, not a Commons promotional placement. Keep the provider relationship discoverable in Institutions: Lacesse Co is the institution/company and Fikra API is its service asset. Job or investment actions appear only when their real, authorized destination and eligibility exist; otherwise show factual profile information without dead-end calls to action.

School records, student data, and private signal content must not be sent to Fikra without an explicitly designed, authorized backend flow and appropriate data minimization. School Console automarking is outside this Commons/Workbench implementation slice.

## Visual direction

Use a restrained field-console aesthetic consistent with the active APT-LABS tokens: paper and ink surfaces, quiet green for permitted progress, amber for provisional attention, and red only for genuine urgency. Use editorial headings, compact monospaced provenance labels, thin dividers, and direct language. Prefer unframed lists and document sections over nested cards, dashboard tiles, gradients, or partner promotion.

Commons prioritizes scanning and comparison. Workbench prioritizes writing and reviewing a single brief. Shared tokens make them feel related; their distinct visual hierarchy makes their different authority clear. Preserve keyboard access, visible focus, sufficient contrast, and reduced-motion behavior.

## Data and compatibility

The active Vite + Preact app currently stores signals, governance decisions, and drafts in browser `localStorage`; it has no active server-side Fikra client. The first implementation slice remains an explicitly local prototype.

- Preserve existing local signal and brief records. Any added optional scan or risk fields must tolerate older saved records without data loss.
- Keep scan data separate from signal status and proposal authorization.
- Keep existing approved-proposal gating when opening a linked Workbench draft.
- Do not persist a mock scan as if it were a server receipt or real provider response.
- Do not add credentials, provider calls, escrow behavior, or a backend as part of this UI slice.

A later live integration requires a server-side contract for authorization, scan provenance, request/response validation, cost/budget handling if applicable, and provider receipts. The UI should consume that contract; it must not make direct browser calls to a credentialed endpoint.

## Error and empty states

- Missing signal, scan, asset record, or approved decision is stated plainly; no fabricated evidence fills the gap.
- A failed local read/write is surfaced without claiming the operation succeeded.
- A missing or unavailable live scan is distinct from a mock scan and from a negative scan result.
- Rejected or returned steward proposals remain visible with their recorded reasons; they do not produce a linked authorized draft.

## Acceptance criteria

1. Commons opens queue-first, supports search/status/institution scope, and presents the selected observation with origin and allowed next action.
2. Human observations, sensor-originated data, illustrative examples, machine scans, and steward decisions have distinguishable provenance and authority.
3. A browser-local mock scan is visibly labeled `MOCK SCAN // BROWSER-LOCAL DEMO MODE`; it creates no network request and cannot authorize work.
4. A production Fikra result, when available in a later server integration, is labeled `AI DISCOVERY // UNVERIFIED MACHINE SCAN` and shown as non-authoritative evidence.
5. Only an approved steward decision can seed a linked Workbench draft; creating or saving a draft does not publish or fund work.
6. Workbench presents scope, materials/BOM candidates, unknowns/risks, and acceptance criteria without IDE-style file navigation.
7. The context rail links to existing source/decision/institution records and does not invent missing history or authority.
8. Existing browser-local signal, proposal, and draft data remains readable; old records without optional scan data continue to work.
9. Lacesse Co and Fikra API are represented in Institutions, not as promotional Commons content; no dead-end job or investment action is shown.
10. Both surfaces remain usable by keyboard and at narrow mobile and desktop widths without horizontal overflow.
11. No browser-held Fikra key, live provider call, escrow, capital lock, tender publication, or crew assignment is introduced by this design slice.

## Validation

- Run the production TypeScript/Vite build.
- Verify locally that a mock scan is clearly labeled, stays browser-local, and does not alter human or governance state.
- Verify that only an approved proposal opens a linked draft and that saving it remains draft-only.
- Verify existing saved local data still loads.
- Review Commons and Workbench at 320, 768, 1024, and 1440 pixels; check keyboard focus and reduced-motion behavior.
