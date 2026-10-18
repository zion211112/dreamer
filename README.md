# APT-LABS Sovereign Tender Engine

APT-LABS connects local demand, capital and execution through open Tenders.
The market compares an imported alternative with a proposed local bill of
materials; completed builds enter the public Roll only after an assigned
Anchor signs the active Blueprint.

## Product surfaces

- `/` — the market manifesto and a cross-category Tender preview.
- `/tenders` — searchable, filterable public Tender board.
- `/tenders/[slug]` — quote comparison, Blueprint, proposed crew and funding
  conversation (contact intent only; no pledge or payment is recorded).
- `/roll` — immutable proof records; illustrative examples cannot appear here.
- `/console` — a local-first school utility with teacher and principal views.
- `/assembly/[tenderId]` — authenticated, assigned-crew execution workflow.
- `/sign-in` — Supabase email-link sign-in for shared school and crew actions.

The checked-in market examples are explicitly illustrative. Without Supabase
configuration, the public market uses those local examples and the Roll is
empty. No sample funding or completion figure represents money received or
work delivered.

## Local development

```sh
npm ci
npm run dev
```

Validation:

```sh
npm run typecheck
npm test -- --runInBand
npm run lint
npm run build
```

## Supabase setup

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   Set `NEXT_PUBLIC_SITE_URL` to the exact HTTPS origin used for deployment.
   Never expose a service-role key to the application.
3. Apply `supabase/migrations/20261019000000_tender_engine.sql` to the
   project's Postgres database.
4. Enable email-link authentication and allow the deployed
   `/auth/callback` URL in Supabase Auth redirect settings.
5. Provision each school's `organizations` row and its
   `organization_memberships` using a trusted administrative workflow. Set
   member display names and `public_name_consent` only with the member's
   explicit consent. The app does not offer public school-account
   registration or privileged membership creation.
6. For a school Tender to open, an authorized Principal/Tender issuer selects
   three distinct active school members as Anchor, Builder and Apprentice.
   The local draft must include itemized Blueprint lines whose same-currency
   total exactly matches the proposed local quote. The server transaction
   creates the Tender and Blueprint, records only opt-in crew names publicly,
   verifies the totals and then opens it. Opt-out changes mask names in public
   Market and Roll views.
7. Ensure each selected school member has an Auth identity. Crew assignments
   are created atomically when the Principal publishes; an assigned person
   must sign in with that identity to open Assembly. The deployment-to-Roll
   transaction is enforced by a database function and row-level security.

Email sign-in is not school authorization by itself. A user without the
required organization or crew membership cannot issue Tenders or access a
private Assembly. Missing configuration and authorization failures are shown
as explicit errors; they do not fall back to fake success.

## School Console data boundary

The Console stores lesson drafts, typed practice papers, local checklists, fee
notes and school Tender drafts in browser IndexedDB. Those records are not
synced to Postgres. The public demonstration is not encrypted multi-user
school storage or a safe place for real student records. Use fictional sample
labels in a pitch/demo environment.

Auto-Marking is deterministic and displays its exact answer/keyword scheme.
It reads teacher-supplied typed CSV/JSON; it does not extract answers from
images or PDFs and does not use a connected AI service. Fee tools are local
bookkeeping only. Communication links require an explicit user click and do
not claim delivery. Inspection is a local preparation checklist, not an
external certification.
