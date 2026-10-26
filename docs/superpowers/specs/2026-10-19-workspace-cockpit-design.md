# APT-LABS Workspace Cockpit

## Purpose

Make the authenticated Workspace the factory floor for the durable loop:
**Demand → Tender → Assembly → Roll**. A user's current context is the
server-verified relationship they have to that work, not a product name or a
client-selected role.

## Invariants

- Public Market, Commons and Roll remain readable without an account.
- Identity, organization membership, crew assignment and moderator status
  are independently verified. Selecting a context only selects a view.
- The durable Tender lifecycle and Anchor/Blueprint/Roll rules remain owned
  by `src/lib/tender.ts` and the existing Tender migration.
- The School Console's lesson, assessment and other school records stay in
  browser IndexedDB. Moving between Console and Workspace never syncs those
  records or describes local storage as encrypted or multi-user.
- Authenticated members can record non-binding Capital Intent Signals.
  Signals are not funds, escrow, payment, yield rights or deposits; authorized
  school issuers verify offline settlement before Assembly.
- The Roll and Capability Badge present attributable proof of completed
  physical work. They are not transferable assets or claims to yield. A
  capability without a real persistence and authorization path remains an
  explicit boundary, not a demo record.

## Context model

The server returns a small catalog of contexts for the signed-in account:

- **Network Member** is the base context for every authenticated user.
- **School context** is available for each active organization membership.
  The organization and membership role come from trusted database rows.
- **Crew context** is available per active, assigned Anchor, Builder or
  Apprentice Tender role. The assignment and Tender state come from trusted
  database rows.
- **School Console · Local Device** is a product entry, not a shared role. It
  is always shown as a separate local tool and is never presented as a
  synchronized organization workspace.
- **Funder** remains an action context only where an authenticated identity
  and recorded Capital Intent are available. It does not imply a payment
  integration, escrow balance, or yield entitlement.

The active context can be selected in a URL parameter for navigation. The
server resolves that value only against the current account's eligible
context catalog; an unknown or stale value falls back to the role-appropriate
default. The context value never participates in authorization.

## Cockpit layout

The authenticated `/workspace` route becomes a responsive three-pane shell:

1. **Left — Loop navigation:** Demand, Tenders, Assembly and Roll, with the
   active context's Console link where relevant. Selected lane and context
   are retained in navigation.
2. **Center — Work surface:** Each lane shows records only from its
   implemented source. Tenders use the public Market repository; Assembly
   uses the user's assigned Tender; Roll uses published proof records.
   Demand explains the local Console boundary and exposes no fabricated
   shared queue.
3. **Right — Action rail:** `Current state → Next authorized action →
   Evidence and limits`. Content changes with the active verified context.
   Anchor sign-off routes to the existing crew-only Assembly transaction;
   Builder/Apprentice actions route to their assigned Assembly. School roles
   get the existing Console/Tender publishing path. Basic members see public
   work and the current absence of a self-serve invitation workflow.

On narrow screens the loop navigation becomes a compact horizontal control;
the work surface stays primary and the action rail follows it in document
order. No pane depends on hover or hidden controls.

This cockpit extends the earlier Workspace/Commons architecture: the
APT-LABS/Console product switcher remains recognizable, while APT-LABS itself
gains verified role-and-work contexts. Product selection and work-context
selection are distinct operations.

## Console-to-network bridge

The Console remains local. The cockpit may link into its existing school
Tender drafting/publishing path, which requires the asset economics, an
itemized Blueprint and assigned crew. It must not imply that an arbitrary
local deficit is already a shared Demand or that student data is sent. A
future shared Demand inbox needs its own persistence, membership, privacy,
moderation and escalation contract.

## Explicitly deferred

This release does not add new roles/invites, shared Demand persistence,
Tender bidding, escrow, payment processing, yield-right issuance,
contribution-weighted governance, or Assembly chat/uploads. Where a requested
stage has no current implementation, show a clear empty or read-only state
and link only to an existing safe workflow.

## Validation

- Unit-test context catalog parsing, default selection and invalid-context
  fallback; selection must not grant an entitlement.
- Preserve existing Tender lifecycle, Assembly, auth, Commons and local
  Console tests.
- Run typecheck, lint, test suite and production build.
- Verify responsive layout and that context switching changes the server
  rendered context without exposing another account's membership/assignment.
- Review migration syntax, RLS, function grants and permissions.
