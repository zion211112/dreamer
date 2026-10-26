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
- `/sign-up` and `/sign-in` — basic account creation and email/password sign-in.

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

## Local development identity (sign-in without Supabase)

The prototype is still in development and has no connected backend, so sign-in
runs on a **local development identity**:

- `/sign-in` accepts any email and password. Nothing is sent to a server and no
  account is created.
- The session is a signed, `httpOnly` cookie held by the browser only. It
  expires after seven days and is cleared by **Sign out**.
- `/workspace` (the Network Studio) opens for that identity and shows the
  checked-in demo Market and Roll records.
- The identity is **not** a verified account. It grants no school, crew,
  funder or publishing permission, and the Studio shows only the base network
  context.
- Every action that would write a shared record stays disabled: school Tender
  publication, Capital Intent, Assembly transitions, Commons contributions and
  workspace preferences all report that a connected Supabase project is
  required.
- While the local identity is enabled the app does not read from Supabase at
  all, so the Studio never depends on a remote project being reachable or
  migrated.

Configuration:

| Variable | Meaning |
| --- | --- |
| `DEV_AUTH_ENABLED` | `true` (default) runs the local identity. `false` hands sign-in back to Supabase Auth and re-enables the shared backend. |
| `DEV_AUTH_SECRET` | Optional. Signs the local session cookie. Set a long random value on shared deployments. When it is unset a development fallback secret is used, so the local session is not a secret. |

Set `DEV_AUTH_ENABLED=false` to switch the whole app back to Supabase: sign-in
then uses `signInWithPassword`, workspace contexts are resolved from
`get_workspace_contexts()`, and the database row-level security rules apply as
they do now.

> The local identity lets any visitor open the Studio. It is acceptable while
> the deployment only shows demo records. Enable `DEV_AUTH_ENABLED=false`
> before the app holds anything private.

## Supabase setup

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL.
   It looks like `https://<20-character-project-ref>.supabase.co`. The project
   ref is exactly 20 characters; a longer string is not a valid ref and its
   hostname will not resolve.
3. Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API → the `anon`
   "public" key. Never use the `service_role` key here; it must never reach
   the browser bundle or the app.
4. Set `NEXT_PUBLIC_SITE_URL` to the exact HTTPS origin used for deployment.
   In production this must be `https://` or the app refuses to build OAuth
   redirect URLs.

   A placeholder value (anything containing `placeholder`, `replace-with`,
   etc.) is detected at runtime and reported on `/sign-in` instead of being
   silently treated as configured.
5. Apply the migrations in order in the Supabase SQL Editor:
   `20261019000000_tender_engine.sql`,
   `20261019010000_workspace_commons.sql`,
   `20261019020000_workspace_contexts.sql`,
   `20261019030000_capitalized_tender_state.sql`,
   `20261019040000_sovereign_asset_capital.sql`, then
   `20261019050000_commons_opportunities_and_roll_badges.sql`.
   Without these, `get_workspace_contexts()` does not exist and an
   authenticated user sees an error instead of the workspace.
6. In Authentication → URL Configuration, set the Site URL to the deployed
   origin and allow the deployed `/auth/callback` URL, plus
   `http://localhost:3000/auth/callback` for local development.
7. In Authentication → Providers, enable Email. Decide whether to require
   email confirmation:

   - **Confirm email off** — the fastest path for a prototype. Accounts are
     usable immediately after sign-up, and `auth/callback` can complete a
     session without an inbox round-trip.
   - **Confirm email on** — sign-up returns "check your email" and the user
     must click the link before `signInWithPassword` will succeed.

   The Google and GitHub buttons additionally require those providers to be
   configured with OAuth client credentials pointing back at `/auth/callback`.
8. Verify sign-in: sign in at `/sign-in`, confirm the redirect to
   `/workspace` shows the account email and a **Sign out** control, then use
   **Sign out** and sign in again to confirm the round trip.
9. Provision each school's `organizations` row and its
   `organization_memberships` using a trusted administrative workflow. Set
   member display names and `public_name_consent` only with the member's
   explicit consent. The app does not offer public school-account
   registration or privileged membership creation.
10. For a school Tender to open, an authorized Principal/Tender issuer selects
   three distinct active school members as Anchor, Builder and Apprentice.
   The local draft must include itemized Blueprint lines whose same-currency
   total exactly matches the proposed local quote. The server transaction
   creates the Tender and Blueprint, records only opt-in crew names publicly,
   verifies the totals and then opens it. Opt-out changes mask names in public
   Market and Roll views.
11. Ensure each selected school member has an Auth identity. Crew assignments
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

The workspace floor switcher changes the visible floor without changing the
IDE frame. All four floors are navigable; floor navigation does not grant
permission to protected data or actions. Server checks and row-level security
remain authoritative. School Console records stay local to the device.

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
