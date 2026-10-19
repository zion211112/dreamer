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
- `/workspace` — the context-aware Demand → Tender → Assembly → Roll cockpit.
- `/commons` — public activity with a separate searchable `/commons/library`,
  contribution flow and moderator desk.
- `/sign-up` and `/sign-in` — basic account creation and email-link sign-in.

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
3. Apply `supabase/migrations/20261019000000_tender_engine.sql`,
   `supabase/migrations/20261019010000_workspace_commons.sql`, then
   `supabase/migrations/20261019020000_workspace_contexts.sql` to the
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
private Assembly. Basic account creation does not grant a school role,
contributor entitlement, or wallet/keypair.

### Workspace contexts

The Workspace switcher lists the signed-in member's active organization and
crew contexts from `get_workspace_contexts()`. The server validates each
selected context against this account's current assignments; changing the URL
or switcher cannot grant access. The School Console remains a separate
`Local Device` product entry.

Demand is an explicit local-Console boundary, not a shared inbox in this
release. School Tender publication uses the existing quote, itemized
Blueprint and crew-assignment workflow. There is no Funder account binding,
Tender bidding, escrow, deposit, payment, yield, or SBT issuance. The cockpit
shows these limits instead of simulated account balances or actions.

### Commons moderation

Commons public reads use published-only database views. Access requests,
posts, resource links, comments, polls and reports are handled through
server-checked database functions and row-level security. To staff moderation,
an administrator must provision at least one trusted moderator directly in
Supabase; never expose moderator provisioning through public account metadata
or client-side controls. Until an active moderator exists, Commons is
read-only and contribution RPCs reject new submissions.

Moderators review access requests outside the assumption that email proves
age or qualifications. Youth participation is not enabled. Resource entries
are approved public links with contributor-supplied source, attribution,
declared license and revision; the app does not host files or independently
certify rights. Commons polls are advisory and cannot authorize funding,
payments, crew assignments or treasury decisions. Keep access and moderation
provisioning within an operational adult-safeguarding process before opening
contributor requests.

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
