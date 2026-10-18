# Sovereign Tender Engine — Design

**Status:** Approved in chat; pending user review of this spec
**Date:** 2026-10-19
**Product:** APT-LABS

## 1. Purpose

APT-LABS connects capital, local demand, and execution through open Tenders.
The atomic product record is a Tender, not a user profile or a dashboard
module. A Tender describes an asset to build, the import alternative, the
local bill of materials, its responsible crew, and the evidence required to
prove delivery.

The School Console is one such product: a fundable software Tender on the
Market and a usable school utility at `/console`. A school using the Console
can issue its own Tenders for equipment, services, media, and other needs.
Those procurement records are separate Tenders linked to the Console product
that originated them and to the issuing school.

## 2. Goals and non-goals

### Goals

- Replace the Dashboard/Workspace product architecture with a tender-first
  public Market, a functional School Console, private crew Assembly, and a
  public proof Roll.
- Use Next.js App Router as the sole application framework.
- Persist shared market, crew, assembly, and Roll data in managed Postgres;
  authenticate users and enforce crew access on the server.
- Keep school roster, assessment, and other student records on-device for
  offline operation and data minimization.
- Enforce relational integrity and legal state transitions at both domain and
  database boundaries.
- Clearly distinguish illustrative pitch data from real commitments and
  completed work.

### Non-goals

- Processing, holding, or transferring money; operating escrow; or promising
  funder yield.
- Live OCR, AI grading, SMS, WhatsApp delivery, or live network telemetry.
- Putting student records, assessment answers, or marks in the shared Market
  database.
- Treating a user-selected demo role or a hidden route as authentication.
- Rebuilding the old generic IDE/dashboard as the product shell.

## 3. Product surfaces and routes

### Public Market

- `/`: High-contrast manifesto: “Africa imports its hardware and its stories.
  We fund and build it locally.” Lead into the Tender Board with a direct
  “View the Tender Board” action. Feature the School Console software Tender
  as one of the opportunities, not as a separate privileged product.
- `/tenders`: Public list of open Tenders, including software, hardware,
  media, services, and school-issued needs. Each card identifies its asset,
  import quote, local BOM quote, currency, funding target/status, and whether
  its data is illustrative.
- `/tenders/[id]`: Detail view for the exact quote comparison and estimated
  savings, blueprint/BOM, assigned Anchor/Builder/Apprentice, funder examples,
  funding progress, and execution milestones. “Fund this Tender” opens a
  prefilled contact/intent route. It does not create a pledge or imply a
  transfer.
- `/roll`: Public ledger of real completed deployments. Each record snapshots
  the asset, import savings, crew, Anchor sign-off, deployment date, and
  blueprint reference. Illustrative examples, if shown, are explicitly
  separated from the ledger and never count as proof.

### School Console

- `/console`: A usable, offline-first product surface with clear Teacher and
  Principal contexts. Its funding Tender is visible from the Market and
  linked from the Console product page.
- Preserve the recovered nine-module/ten-tool scope: Content Studio,
  Auto-Marking, My Day, Timetable, Roster, Term Reports, Grade Forecast,
  Fees, Inspection, and Comms.
- Teacher context centers on lesson/content work, class-scoped roster and
  timetable use, marking, My Day, and reports. Principal context includes
  school-wide roster/timetable oversight, fee records, inspection, school
  communication drafts, and issuing Tenders. Teaching tools remain usable by
  principals; school-wide actions are not silently presented as teacher
  authority.
- Teachers can create a deterministic mark scheme, enter answers or import
  CSV/JSON papers, review results, inspect topic-level weaknesses, and produce
  reports. Scanned image/PDF answer extraction is excluded until genuine OCR
  is implemented; no synthetic answers may be described as marks.
- Principals can manage school workflows, review Console activity, and issue
  a Tender from a school need. Publishing requires a configured authenticated
  school account and explicit confirmation.
- Offline/demo Console data is stored in the browser's IndexedDB and is
  labeled as local demo data. Imports, exports, and persistence errors are
  visible. Publishing a Tender sends only the Tender fields explicitly
  reviewed by the user; student data is never attached.
- Demo rosters contain no real student data. The Console makes the local
  device boundary explicit: IndexedDB is not server-side access control or an
  encrypted multi-user school database, and staff must not treat the public
  pitch/demo profile as a place to enter real student records.
- Fee entry and M-Pesa statement parsing are local bookkeeping utilities;
  they do not initiate or verify payments. Comms prepares individual,
  recipient-reviewed SMS/WhatsApp deep links; it does not send bulk messages
  through a server or claim delivery. Inspection is a locally generated
  checklist/report, not external certification.
- When Supabase credentials are absent, local demo tools remain usable, but
  authenticated publishing and shared actions show a clear setup-required
  state rather than a success-shaped fallback.

### Private Assembly

- `/assembly/[tenderId]`: Dedicated execution surface for the assigned crew.
  It presents the Materials → Fabrication → Anchor Sign-off → Deployed
  progression and the evidence required at each stage.
- Server-side session and crew-membership checks protect every read and
  mutation. An unauthorized user receives no Assembly record; hiding a link
  in the client is not a security boundary.
- No payment release, cryptographic signature, inspection certification, or
  network action is claimed unless a real integration exists. MVP sign-off is
  an authenticated, attributable application event.

## 4. Domain model

All identifiers are collision-safe UUIDs. Foreign keys, unique constraints,
checks, and transactions are part of the contract, not optional validation.
Money is stored as integer minor units with an explicit ISO currency code;
cross-currency comparisons are rejected unless an exchange-rate source is
added in a later design.

### Entities

- **Organization** — a School, Startup, or other Demand issuer. A school has
  its own membership and role assignments.
- **OrganizationMembership** — links an authenticated identity to an
  Organization as a Principal, Teacher, or authorized issuer. Console-local
  demo roles do not create server-side memberships.
- **Tender** — the aggregate root. Includes issuer organization, unique
  public slug, title, description, asset/category, location, currency,
  import-cost quote, local BOM total, funding target, lifecycle status,
  optional source-product Tender, and illustrative-data marker.
- **CrewMember** — an authenticated person assigned to a Tender with an
  Anchor, Builder, or Apprentice/Youth role. A Tender has exactly one
  assigned Anchor; membership references the authenticated identity.
- **Blueprint** — a versioned Tender specification with BOM lines, source,
  quantity, unit, unit cost, and currency. The sum of line totals must equal
  the Tender's local BOM quote. A stable content hash identifies the version
  used for sign-off and Roll proof.
- **Funder** — a public display identity for a person or organization
  providing capital information. Public names/aliases require consent; private
  contact details are never returned by public queries.
- **FundingAllocation** — records funding data only where it is explicitly
  illustrative or independently verified and references a Funder and Tender.
  It is not created by the contact CTA and does not represent money received,
  escrow, or a binding pledge.
- **AnchorSignOff** — an attributable sign-off by the Tender's assigned
  Anchor, tied to the blueprint version/hash and timestamp.
- **RollRecord** — an immutable deployment snapshot with a unique Tender
  reference, crew names/roles, verified quotes, estimated savings, blueprint
  reference/hash, Anchor sign-off, and deployment timestamp.
### Relationships and constraints

- A Tender belongs to one issuing Organization and may reference the product
  Tender through which it was issued. A school-issued Tender created in the
  School Console references the Console software Tender as its source while
  remaining owned by the issuing school.
- A Tender owns one or more versioned Blueprints and crew assignments.
- Crew assignments are unique per `(tender_id, user_id, role)`; only one
  active Anchor assignment may exist for a Tender.
- A RollRecord has a unique `tender_id`; it cannot be duplicated by retries.
- An AnchorSignOff references the assigned Anchor, the Tender, and the
  exact Blueprint version. It cannot be reassigned to another crew identity.
- A real RollRecord can be created only for a non-illustrative Tender after
  valid deployment. Sample market records cannot create real Roll proof.
- Savings are computed as import quote minus local BOM in the same currency
  and are labeled estimated until deployment and quote verification.
- `fundedPercent` is derived from eligible allocation rows divided by the
  target and capped at 100. With no financial provider, real production
  allocations are not created by this MVP; sample percentages come only from
  visibly illustrative rows. Contact interactions never change this value.

## 5. Tender lifecycle and transaction semantics

Tender states are `draft`, `open`, `materials`, `fabrication`,
`anchor_signed`, `deployed`, and `cancelled`.

Allowed progression:

1. An authorized issuer creates a draft and a valid Blueprint.
2. Publishing moves it to `open`.
3. The assigned crew advances the work through `materials` and
   `fabrication`, recording only evidence available in the MVP.
4. The assigned Anchor signs the exact Blueprint version to enter
   `anchor_signed`.
5. Deployment is allowed only from `anchor_signed`.
6. One database transaction changes the Tender to `deployed` and inserts its
   immutable RollRecord. A unique constraint and idempotent server action
   prevent duplicate Roll entries on retries.

Illegal skips, missing or stale sign-offs, wrong-crew actions, mismatched
currencies, and duplicate identifiers fail explicitly. No state transition
changes a financial balance.

## 6. Authentication, authorization, and persistence

- Supabase Auth provides authenticated identities; Supabase Postgres is the
  shared source of truth for organizations, published Tenders, crew
  assignments, sign-offs, and the real Roll.
- Next.js server-only repositories and actions use typed Supabase clients.
  Row-level security policies restrict private records; server actions also
  validate roles and crew membership before calling the domain transition.
- Public users may read published non-private Tender fields and real Roll
  records. Private sign-off evidence and Assembly notes are not exposed by
  public detail queries.
- School Console student/assessment information remains in per-browser
  IndexedDB. Console demo role selection is a local UX context, not an
  authenticated identity. Shared Tender publishing requires Supabase Auth.
- Schema changes are versioned SQL migrations. Sample fixtures are marked
  illustrative and cannot satisfy the real deployment-to-Roll transaction.
- Required Supabase URL and keys are documented as environment variables;
  credentials are never committed. Missing configuration is surfaced on
  authenticated operations.

## 7. Visual and interaction design

- Use the supplied HTML as a visual reference: near-black canvas, fine
  blueprint grid, compact mono labels, high-contrast type, restrained violet
  for capital, cyan for execution, green for savings/proof, amber for Anchor
  sign-off, and red only for import cost.
- Simplify its dense three-pane IDE into a responsive public site. Keep
  quote comparison, evidence, and next action visually dominant.
- Desktop Tender detail uses a narrow Market/context rail, central Tender
  narrative, and compact funding/crew summary; mobile stacks these sections
  in reading order and never depends on horizontal scrolling.
- Use semantic controls and keyboard-accessible navigation. All workspace
  visual roles live in `src/styles.css`; workspace interactions use the
  shared Button and Dialog controls.
- No decorative “LIVE”, “Production”, network, escrow, yield, or signature
  statuses without an actual source and implementation.

## 8. Testing and acceptance

### Domain and database tests

- A Tender cannot transition to `deployed` without a valid
  `AnchorSignOff` from its assigned Anchor against the active Blueprint.
- A successful deployment creates exactly one RollRecord in the same
  transaction; a failed deployment creates none, and a retry does not
  duplicate it.
- Reject a sign-off by a non-Anchor or unassigned user.
- Reject malformed BOM totals, currency mismatches, invalid status skips,
  duplicate active Anchor assignments, duplicate IDs, and mutation of a
  completed Roll snapshot.
- Validate that sample data cannot enter the real Roll.

### Product tests

- Market routes render the manifesto, open Tender list, Tender detail, and
  public Roll with direct links and accurate sample-data labels.
- Contact CTA does not create a funding allocation or alter funding progress.
- Teacher marking is deterministic for typed and CSV/JSON inputs and persists
  locally; malformed input and unavailable storage are surfaced.
- Principal Tender creation links the issuing school and Console source
  Tender, without sending student records.
- Unassigned identities cannot read or mutate Assembly through direct route
  requests.
- Responsive layout, keyboard navigation, and core flows are covered by
  focused UI tests.

### Delivery checks

- One root Next.js application and one package manager/lockfile.
- No legacy TanStack Start/Vite route tree, dependencies, scripts, generated
  files, or `legacy/` directory.
- Lint and TypeScript checks run non-interactively.
- Focused tests, full tests, and production build pass.
- Changes are committed and pushed additively; published history is never
  rewritten.

## 9. Migration notes

The checked-out working tree already contains an unfinished Next.js port and
untracked `legacy/` copy. Preserve and integrate intentional user changes;
do not assume the untracked files are disposable until reviewed. The new
implementation should retain the current Next.js App Router as the only
runtime, replace the workspace with the Tender Engine, and remove the
TanStack/Vite copy and remnants only after the corresponding school workflows
have been deliberately recovered from the reachable project history.

The previous school Console had nine modules and ten tools, an IndexedDB
store, deterministic rule-based marking, and print-oriented term reports.
Its local role selector was explicitly not authentication. Its scanned-file
answers were synthetic demo extraction. Reuse useful workflow behavior, but
replace silent storage failures, synthetic OCR behavior, and any unverified
claims with explicit states.

## 10. Open integration requirements

- A Supabase project and environment values are required for shared
  authentication, Postgres persistence, and crew-only Assembly.
- A real payment/escrow provider and an approved financial/compliance design
  are required before implementing actual funding. Until then, funding is
  contact-only.
- A real OCR provider or a separate on-device OCR design is required before
  scanned papers can be described as automatically marked.
- School Console SMS/WhatsApp delivery remains unavailable until a messaging
  provider and consent/opt-out workflow are specified.
