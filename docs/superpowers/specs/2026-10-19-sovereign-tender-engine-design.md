# APT-LABS Sovereign Asset Generation Engine

**Status:** Product direction approved; implementation in progress
**Date:** 2026-10-19
**Product:** APT-LABS

## Product thesis

APT-LABS turns local infrastructure demand into sovereign assets, verified
labor, and community-owned yield. It is an execution protocol, not a vendor
directory or a generic dashboard.

The durable loop is **Demand → Tender → Assembly → Roll**:

1. A School Console or authorized issuer identifies and describes an
   infrastructure need.
2. A Tender turns the need into an asset dossier with a costed Blueprint,
   capital target, yield assumptions, local capital retention, and proposed
   crew compensation.
3. An assigned Anchor, Builder, and Apprentice coordinate the physical work
   through an authenticated Assembly.
4. The Anchor attests to the completed work and exact Blueprint version;
   deployment creates an immutable Roll record.

The public Market and Roll are the theater. The Workspace is the factory
floor. Public pages explain the system and expose verified records; the
Workspace is where an authenticated member acts within an assigned context.

## Product surfaces

### Public Market and asset dossier

- `/` introduces the asset-generation thesis and points to the Market.
- `/tenders` lists public Tenders and clearly marks illustrative scenarios.
- `/tenders/[id]` presents the asset brief, itemized build cost, capital
  allocation state, projected annual yield, capital efficiency, local
  retention, proposed crew compensation, Blueprint, crew, and milestones.
- Any displayed financial projection is labeled as a model, not realized
  revenue or a guaranteed return.
- A Capital Intent is an authenticated, non-binding signal. It records
  interest but does not transfer funds, create escrow, promise yield, or
  constitute a financial offer. Payment integration remains pending.

### Workspace cockpit

- `/workspace` is a context-aware execution cockpit, not a generic welcome
  page.
- The durable loop is navigable as Demand, Tenders, Assembly, and Roll.
- Context comes from server-verified memberships and crew assignments.
  Switching context changes available information and actions; a local
  selector is never an entitlement.
- The right rail reflects the active assignment: funders see intent and
  settlement state; crew see their next permitted milestone; school issuers
  see local demand-publication actions.
- School Console records remain on-device. Only a reviewed Tender payload is
  explicitly published to the shared network.
- The system does not claim a shared Demand inbox, yield distribution, or
  governance rights until each has an implemented and authorized workflow.

### School Console

- `/console` remains a useful, local-first school tool with Teacher and
  Principal contexts.
- It retains lesson/content work, deterministic marking, schedules, roster,
  reports, fees, inspection, and communication-draft utilities.
- A Principal or authorized Tender issuer can compute an infrastructure
  deficit, prepare the asset economics and Blueprint, and deliberately publish
  a Tender to the shared network.
- Student and assessment records remain in the browser's IndexedDB and are
  never included in a Tender payload. IndexedDB is local storage, not an
  encrypted, multi-user school database.
- Missing shared-service configuration, storage failures, and publication
  failures are explicit. No synthetic success is shown.
- Marking is rule-based. Scanned-paper extraction, AI grading, payment
  processing, and message delivery are not claimed without real providers.

### Private Assembly and public Roll

- `/assembly/[tenderId]` is available only to assigned crew. Server-side
  authentication and crew authorization remain in force alongside database
  row-level security for every protected read and mutation.
- The Assembly supports the crew's execution milestones and evidence. Its
  communication and file-sharing functions must disclose the actual provider
  and storage boundary; no feature is implied by a static mockup.
- `/roll` records deployed assets, the exact Blueprint hash, responsible
  crew, Anchor attestation, build cost, and deployment time.
- A Roll record is immutable and cannot be created from illustrative data.

## Economic and proof model

### Tender economics

The Tender is the primary domain entity. Its economic profile uses:

- **Asset build cost:** the validated total of its Blueprint lines.
- **Capital target and allocation state:** signaled intent is distinct from
  verified offline settlement.
- **Projected annual yield:** an assumption-backed model, not realized cash.
- **Capital efficiency:** projected annual yield divided by asset build cost.
- **Local capital retention:** a documented percentage of build cost.
- **Crew compensation:** proposed allocations to Anchor, Builder, and
  Apprentice, constrained not to exceed build cost.

The database stores monetary values as integer minor units with an explicit
currency. Blueprint totals must equal the asset build cost. Historical
comparison fields are migrated forward and removed from the active Tender
and Roll schema; published history is not rewritten.

### Three proof rails

1. **Labor capability:** a Capability Badge represents a non-transferable
   record of verified physical contribution. The current Roll is the
   attributable proof record; it is not a tradable asset.
2. **Trust attestation:** the assigned Anchor signs off against the active
   Blueprint version and hash. This is an attributable application event,
   not a claim of an external hardware key or cryptographic identity provider.
3. **Yield rights:** the product may eventually record governed rights to
   asset cash flows. No yield entitlement, treasury distribution, voting
   weight, or investment claim is active until a separate legal, compliance,
   and settlement design is approved and implemented.

### Lifecycle invariants

The current lifecycle is `draft`, `open`,
`capitalized_pending_settlement`, `materials`, `fabrication`,
`anchor_signed`, `deployed`, or `cancelled`.

- Publishing requires an authorized school Principal or Tender issuer, three
  distinct active school members for the crew, a valid economic model, and a
  Blueprint whose exact total matches build cost.
- Capital signals may reach the target without authorizing fabrication.
  Only authorized offline-settlement verification updates settled capital;
  Assembly cannot begin until the target is verified.
- Only assigned crew may advance work. Only the assigned Anchor may sign
  off and deploy.
- Deployment and immutable Roll insertion occur in one database transaction.
  Retries cannot create duplicate Roll records.
- Illustrative Tenders cannot accept live signals or enter Assembly/Roll.

## Visual system

Use the Sovereign Field Atlas language: warm mineral paper, charcoal ink,
kiln-orange action, and blueprint-blue evidence. Drafting registration marks,
grid coordinates, and technical typography should make the interface feel
like a workshop ledger, not a generic SaaS dashboard.

Keep design tokens and visual roles in `src/styles.css`, and use shared
interactive controls. The layout must remain responsive, keyboard accessible,
and readable without horizontal scrolling. Visual language may be evocative;
financial and verification states must remain exact and evidence-based.

## Security, privacy, and trust

- Supabase Auth identifies users. Server actions validate identity and role;
  RLS remains enabled as a second authorization boundary.
- Public views expose only approved Tender and Roll fields. Private capital
  intent details are visible only to their owner and authorized issuers.
- School Console records never sync to Supabase. Only explicit Tender fields
  are published; never include roster, assessment, or student data.
- Never describe intent as funds received, offline verification as automatic,
  a projection as actual yield, or an application sign-off as an external
  cryptographic signature.
- Funding remains contact/intent-only until a payment, compliance, and
  custody design is approved.

## Acceptance and verification

- Typecheck and focused tests cover Tender validation, Workspace context, and
  school Blueprint compilation.
- Database migrations define the exact RPCs used by server actions, replace
  legacy view contracts, preserve Roll immutability, and remove obsolete
  Tender/Roll economic columns after safe backfill.
- Verify non-binding intent cannot start Assembly before authorized
  settlement, and illustrative scenarios cannot signal or deploy.
- Verify school publishing requires authenticated server-side membership,
  assigned school crew, and exact Blueprint-cost agreement.
- Build and test public Market, Tender dossier, Workspace, local School
  Console, and Roll against their truthful data boundaries.
