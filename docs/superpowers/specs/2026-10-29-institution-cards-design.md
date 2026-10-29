# Public Institution Cards

**Status:** Draft for review  
**Date:** 2026-10-29  
**Scope:** First release of the institution portfolio

## Product intent

Make institutions the public portfolio objects people can discover and act on.
An institution is one card and one public identity; do not make users browse a
separate institution catalog and asset catalog. The product should feel like a
considered field portfolio, not a generic SaaS dashboard or social feed.

The public card is the entry point. Work, capital, and execution remain
accountable workflows behind it.

## Approved product decisions

- Use the existing `/tenders` collection as the single institution-card
  directory and label it **Institutions** in visible navigation and page copy.
  Do not add a competing `/institutions` or `/assets` catalog in this slice.
- Map one card to one existing Organization identity. Do not introduce a
  second institution-as-asset record or a general Asset graph here.
- Preserve Tender as the primary work and capital lifecycle entity. Tenders
  remain linked workflows behind institution cards; keep lifecycle validation,
  Assembly authorization, and Roll generation consistent with
  `src/lib/tender.ts` and the Supabase migrations.
- Use the **editorial rows** treatment selected in the visual companion:
  restrained typography, compact factual metadata, and direct actions. Remove
  promotional filler and unnecessary card prose.
- Public browsing is allowed only for explicitly published institutions.
  Actions require sign-in and the existing server-side authorization plus RLS.
- Show institution-level valuation only when there is source-backed evidence
  for it. Otherwise omit the value. Do not relabel a Tender's build cost,
  capital target, or projected yield as the institution's valuation.
- Funding remains an enquiry/contact action. This directory does not collect
  investment commitments or payments.
- Defer a general “Join this institution” request flow. Do not show Join unless
  a real, authorized destination is added in a later design.

## Card content and interaction

Each published card may show:

1. Institution name.
2. Typed institution category and location.
3. A short, institution-approved public description.
4. A compact, truthful signal for relevant open work or funding discussion.
5. Only actions that have a working, authorized destination.

Action rules:

- **Find work** links to published opportunities related to the institution.
  Applying requires authentication; the institution issuer reviews it through
  the existing application flow.
- **Discuss funding** is available only when an eligible, published Tender
  exists. It leads to the existing enquiry-only flow and must not imply a
  pledge, payment, escrow, or return.
- **Build** never bypasses Tender eligibility or crew assignment. Assembly
  remains available only to an authenticated, assigned crew member.
- **Join** is out of scope until a membership request and approval workflow
  exists.
- Hide actions with no eligible record or working destination. Do not render
  dead buttons or success-shaped placeholders.

Schools and hospitals do not need a valuation to appear. A valuation, when
available, must be distinguishable from project economics and accompanied by
its basis, source, and date. Illustrative records remain visibly illustrative
and cannot be presented as live institutions, funding, work, or outcomes.

## Data and authorization

The current `organizations` table contains identity, kind, and location. Public
organization reads are currently tied to a published Tender, so the directory
needs explicit institution-profile publication independent of Tender state.

Add the smallest compatible profile fields to `organizations`:

- `public_summary`, bounded in length.
- `directory_published_at`, nullable; null means not listed.
- `directory_published_by`, nullable; records the authorized publisher.

Keep institution kinds typed; add the hospital kind in a migration to support
the stated institution examples. Do not add a free-form category field or a
second Asset table.

An active institutional principal publishes or unpublishes a profile through
a server-checked action. The database policy/function must enforce the same
authorization. A public directory read surface returns only allowlisted fields
and only published rows. Memberships, emails, student records, School Console
snapshots, private applications, and unpublished content remain private.

The card may summarize linked public Tender/opportunity state, but it does not
become a new source of truth for those workflows. All protected reads and
mutations keep their server-side checks alongside row-level security.

## Scope boundaries

Included:

- Reframe the existing public collection as institution cards.
- Publish/unpublish institution profile fields with explicit authorization.
- Search/filter the public collection using its typed, approved metadata.
- Show eligible links into existing Tender, opportunity, funding-enquiry, and
  assigned-crew workflows.
- Responsive layout, loading/error/empty states, and accessibility behavior.

Not included:

- Replacing or flattening Tender, Assembly, or Roll.
- A new institution-wide valuation model or investment/payment system.
- Student-media uploads, skill verification, or badge issuance. These need a
  separate evidence, review, privacy, and consent design; School Console data
  stays local to the device.
- A remote AI-training task marketplace, connected AI, OCR, messaging, or
  payment provider.
- A broad Commons redesign, IDE-style Workbench, or dashboard overhaul.
- A general Asset graph or membership-join workflow.

These are follow-on projects, not implied features of this directory.

## Acceptance criteria

1. An anonymous visitor can browse, search, and filter published institutions.
2. An unpublished institution is absent from both the page and public query
   results, including when it has no published Tender.
3. A card contains one institution identity, not a nested institution/asset
   catalog.
4. Schools and hospitals can appear without a valuation.
5. No Tender-level cost, target, or yield is labeled as an institution
   valuation.
6. Each displayed action has a valid destination and the destination repeats
   server authorization and RLS checks.
7. Funding language remains enquiry-only; no payment or investment execution
   is implied.
8. Student and School Console data never enters the public profile or shared
   Supabase records.
9. Illustrative records and unavailable/error states are explicit rather than
   presented as live data or empty success.
10. The editorial card layout remains usable at narrow mobile and desktop
    widths, with keyboard-accessible controls and visible focus.
11. If the public directory source is unavailable or unconfigured, show an
    explicit unavailable state; never substitute sample institutions as live.

## Validation

- Test publication authorization, public visibility, and unpublished-row
  isolation at the database/RLS and server-action layers.
- Test that each card action is shown only when its destination is eligible.
- Test that institution-level values are omitted without evidence and that
  Tender economics keep their project-level labels.
- Run focused UI tests, type-check, and the migration validation applicable to
  the changed database policy.
- Manually review the page at 320, 768, 1024, and 1440 pixels.
