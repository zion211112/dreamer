# APT-LABS Workspace and Commons — Design

**Status:** Approved in design dialogue; pending user review of this spec

**Date:** 2026-10-19

**Product:** APT-LABS
**Depends on:** [Sovereign Tender Engine design](./2026-10-19-sovereign-tender-engine-design.md)

## 1. Purpose and product essence

APT-LABS is a shared work network connecting local demand, capital intent,
physical execution, and inspectable proof. Its stable product path is:

**Demand → Tender → Assembly → verified Roll**

The Tender remains the primary domain entity. Its lifecycle, Blueprint
validation, Anchor sign-off, atomic deployment-to-Roll transaction, and
Roll immutability remain governed by the Sovereign Tender Engine design,
`src/lib/tender.ts`, and the Supabase migration.

This design adds a unified product shell and a Commons. It does not turn the
network into a token economy or a generic social network. APT-LABS today
records authenticated workflow and proof; it does not mint cryptographic
identity, hold escrow, move payments, distribute yield, or grant legal or
financial sovereignty.

### Stable core

- A public need becomes a Tender only through the existing authorized
  publication flow.
- A Tender moves through its defined lifecycle with assigned crew and an
  active Blueprint.
- Only the assigned Anchor can perform the sign-off transition.
- A deployed Tender and its immutable Roll record are written atomically.
- School Console records remain local to the browser and separate from the
  shared network.
- Public and illustrative records remain distinguishable; demonstration
  figures are never represented as live transactions.

### Extensible products and modules

- The **APT-LABS Workspace** is the shared network context for work, Tenders,
  crews, Commons, and the Roll.
- The **School Console** is a separate local-first product. It remains usable
  as a free school utility and is not redesigned internally in this release.
- Additional profession-specific consoles may be considered later. No
  health, legal, or other regulated console is built or advertised as
  available by this design.
- **Commons** is the public-to-read maker activity surface plus a durable
  resource library. It does not replace Tender records or the Roll.

## 2. Goals and non-goals

### Goals

- Make the authenticated workspace the primary experience while preserving
  public access to the Market, Roll, and Commons.
- Distinguish account identity from every permission or organizational role.
- Use a role-aware post-authentication landing and a persistent, global
  product switcher.
- Make the context and storage boundary between School Console and the
  shared APT-LABS network explicit in the interface.
- Add a real, persistent Commons activity feed, resource index, posts, and
  advisory polls with server-enforced permissions and moderation.
- Keep product routing, design tokens, and interactive controls consistent
  across the application.
- Preserve current Tender, Assembly, Roll, and local Console safety
  invariants.

### Non-goals

- A blockchain wallet, generated cryptographic keypair, Soulbound Token
  (SBT) issuance, token mining, or transferable credential.
- Rank-weighted or binding governance, cooperative treasury control, yield,
  escrow, pledge collection, payment processing, or claims of savings as
  realized funds.
- Real-time direct messages, crew chat, arbitrary file uploads, first-party
  file hosting, proprietary file delivery, or design fork/version tooling.
- Commons participation by minors in the first release.
- Health, legal, or other profession-specific consoles or handling of their
  regulated records.
- Sending student data from the School Console to Supabase, or describing
  browser storage as encrypted, multi-user, backed up, or guaranteed
  offline.
- Connected AI, OCR, messaging, or external certification without an
  implemented provider.

## 3. Identity, entitlements, and product contexts

### Identity and access rules

- Supabase email-link authentication is the identity mechanism. Signup
  creates an account identity only; it does not generate a keypair or grant
  a product role.
- A verified email address proves control of that address, not a person's
  identity, age, school membership, crew assignment, or professional
  qualification.
- Organization and crew entitlements are derived from trusted server-side
  records. A UI selection, route, query parameter, or user-editable profile
  cannot create or elevate an entitlement.
- The existing school publishing and crew Assembly checks remain in server
  actions/routes and Supabase RLS/database functions. This design adds no
  client-only authorization.
- Commons contribution is a separate, approved entitlement. It is not a
  Tender issuer, Builder, or Anchor role.

### First-release access matrix

| Actor | Public Market, Roll, Commons read | Commons post/poll | School Console | Tender publication | Assembly/sign-off |
|---|---|---|---|---|---|
| Guest | Yes | No | Local product access | No | No |
| Basic authenticated account | Yes | No, until approved as a Commons contributor | Local product access | No | No |
| Approved adult Commons contributor | Yes | Yes, subject to moderation and rate limits | Local product access | No by this entitlement | No by this entitlement |
| School member | Yes | Only with separate Commons entitlement | Local product access; teacher membership informs landing | Only if the server-verified role permits it | Only if separately assigned to the Tender |
| Assigned crew member | Yes | Only with separate Commons entitlement | Local product access | No by crew role alone | Yes, for the assigned Tender and allowed transition |
| Assigned Anchor | Yes | Only with separate Commons entitlement | Local product access | No by Anchor role alone | May sign the active Blueprint for the assigned Tender |

Commons moderator privileges are separately provisioned and checked on the
server. Moderation actions are attributable and auditable.

The initial contributor process is invitation/approval by a trusted
moderator under an adult-only contribution policy. Email verification alone
is not treated as age verification. Do not collect date of birth or identity
documents as a shortcut. The first release uses a closed, moderator-approved
adult contributor cohort; approval is a human operational decision, not
automated age verification. The public launch must have a documented adult
approval and moderation procedure; if that operational procedure is not
ready, Commons remains read-only. This Commons rule does not change the
existing Tender crew roles or imply a new age policy for Assembly.

### Role-aware landing behavior

- Anonymous visitors reach a public APT-LABS entry surface with clear
  Create account and Sign in actions, plus direct access to the public
  Market, Roll, and Commons.
- After authentication, a user with a server-verified school membership
  defaults to School Console (including teachers). Other basic network
  members and permitted makers/funders default to the APT-LABS Workspace.
- Where a user has multiple permitted products, the user may choose and
  persist a preferred default. The preference chooses among existing
  entitlements; it is not an entitlement.
- School Console remains a local-first utility. A user may open it without
  shared school authorization; server-persisted school actions still require
  the existing authorized membership.
- The existing email-link flow must preserve safe return-path validation and
  avoid account-enumeration disclosures.

## 4. Product shell and navigation

### Global product switcher

Use one shared application shell, not separate portals or duplicated
authentication. In signed-in views, the header places a persistent switcher
beside the APT-LABS brand, for example:

`APT-LABS / School Console ▾`

The menu:

- Names the active product and lists only products the account may enter,
  alongside freely accessible local tools where appropriate.
- Labels each product's data context: **School Console · stored in this
  browser** and **APT-LABS · shared network**.
- Never presents switching as role impersonation or permission elevation.
- Provides a product launcher/default-preference view for discovery, without
  forcing a launcher visit on every sign-in.
- Is keyboard accessible and usable on narrow screens; it does not depend on
  hover, icon-only labels, or horizontal scrolling.

Future products appear only after they exist and the current account is
authorized. Health/legal names may not be used as active products, sample
records, or implied capabilities before their own privacy/security design.

### Routes

| Route | Access and purpose |
|---|---|
| `/` | Public entry with signup/sign-in and public product routes; after authentication, route to the role-aware default unless a safe explicit destination was requested. |
| `/sign-up` | Email-link account creation; identity only. |
| `/sign-in` | Universal email-link authentication for all products. |
| `/workspace` | Authenticated APT-LABS Workspace overview. |
| `/tenders`, `/tenders/[id]` | Existing public Market and Tender details. |
| `/assembly/[tenderId]` | Existing assigned-crew-only execution workflow. |
| `/roll` | Existing public immutable proof ledger. |
| `/commons` | Public-read, activity-first Commons. |
| `/commons/library` | Public searchable index of approved resource metadata and links. |
| `/commons/resources/[id]` | Public detail for a resource, its provenance/license/version, and related discussion. |
| `/commons/activity` | Explicit activity view; may share the `/commons` landing implementation. |
| `/console` | Existing local-first School Console. |

The signed-in APT-LABS navigation is **Overview · Work/Tenders · Assembly ·
Commons · Roll**. Public pages remain directly reachable without requiring
an account. Private actions remain server-checked.

## 5. Commons product design

### Information architecture

Commons is **activity-first**:

- `/commons` opens a chronological, moderated public stream of posts,
  resource-linked discussions, and advisory polls.
- `/commons/library` is the durable, searchable resource index, with filters
  for Blueprint, BOM, CAD, media, source, license, and version.
- Resource detail pages keep provenance and license visible and provide
  related discussions. Activity records refer to resources; they do not
  replace, overwrite, or become the canonical resource record.
- Posts may also reference a Tender where relevant. A Commons post is not a
  Tender, and a resource catalog entry is not a completed Roll record.

### Resource records

Each published resource has:

- A stable identifier, title, summary, and resource type.
- Source URL, attribution/provenance, declared license and a link to its
  terms, version or revision label, and moderation/publication state.
- Optional tags and an optional related Tender identifier.
- A clear indication when source or license information has not been
  independently verified. An absent/unclear license must never be
  represented as open or reusable.

The initial implementation stores metadata and links to approved public
sources only. It does not proxy or host external content, guarantee
availability, accept arbitrary binaries, virus-scan uploads, distribute
proprietary files, or implement forks. File delivery and version/fork
lineage require a later storage, licensing, access-control, and security
design.

### Posts and advisory polls

- Public users may read published posts, replies, polls, and resource
  metadata.
- Posting and voting require a server-verified, approved adult Commons
  contributor entitlement. Approval is independent from basic signup.
- Posts support resource references and moderation states. Contributors can
  report content; moderators can hide, restore, or remove it under a
  documented policy. Actions are auditable.
- Polls have a bounded set of options, an open/closed state, and an optional
  closing time. A unique database constraint permits at most one vote per
  account per poll; server logic rejects votes outside the active interval.
- Polls are labelled **Advisory · non-binding**. Votes are unweighted and
  cannot change Tender state, crew assignment, funds, Roll records, or
  treasury decisions. One account is not represented as one verified person.
- Apply server-side rate limits and moderation controls. Do not implement
  direct messages or real-time chat in this release.

## 6. Data flow, persistence, and security

### Shared network flow

1. A user requests an email sign-in link; the server validates the input and
   safe return path and reports configuration/send failures explicitly.
2. Supabase Auth establishes the identity. The server loads memberships and
   product entitlements from trusted records.
3. The route resolver chooses the user's permitted default; the switcher
   offers only products the user may enter.
4. Public Market, Roll, Commons Activity, and Library read published public
   projections only.
5. Commons submissions and votes go through server actions/repositories
   with typed validation, contributor-entitlement checks, moderation
   policy, and matching RLS. Client-visible controls are not the security
   boundary.
6. Tender, Assembly, Anchor, and Roll actions continue through the existing
   server-side and database invariants.

### Commons persistence boundary

Add a versioned Supabase migration for resource metadata, posts/replies,
polls/options/votes, contributor entitlement, and moderation/report records.
Use foreign keys, check constraints, unique vote-per-account constraints,
and indexes appropriate to public list queries. Public read policies expose
published records only. Writes are restricted to the corresponding
authenticated contributor/moderator entitlements. No service-role key is
exposed to clients.

Every write validates input length, URL scheme, ownership, status, and
entitlement on the server. Error results are explicit; invalid input,
missing configuration, authorization failure, and database failure never
return success-shaped data. No universal fallback to illustrative data is
added for Commons or authenticated workspace operations.

### School Console boundary

School Console records remain in browser IndexedDB and are not added to
Commons or Supabase. Its status must say **stored in this browser/device**.
Do not promise encryption, shared access, backup, or full offline
availability. Demo data must be fictional; staff must not enter real student
records into a public pitch/demo environment.

### Existing Tender and Roll invariants

No schema, status, or presentation change may weaken:

- Tender status validation and exact Blueprint/BOM total validation.
- Assigned Anchor identity and active Blueprint sign-off checks.
- Atomic deployed-Tender plus immutable-Roll creation.
- Separation of illustrative market data from real shared records.
- Contact-only funding and the absence of payment/escrow/yield.

## 7. Visual and interaction design

- Use the approved workspace prototype as the visual direction: warm paper
  and stone surfaces, deep ink, restrained jade signal, precise technical
  typography, generous readable spacing, and clear provenance/status
  treatments.
- Apply the shared shell to public and authenticated network surfaces.
  Keep School Console internals stable in this release.
- Keep design tokens and visual roles in `src/styles.css`; reuse shared UI
  controls for buttons, dialogs, forms, and other interactive elements.
- Visually distinguish **Local browser data**, **Shared network**,
  **Illustrative**, **Published**, **Needs moderation**, **Advisory**, and
  **License/source status**.
- Do not use decorative “live”, “verified”, “secure”, “offline”, “escrow”,
  “SBT”, or “yield” labels unless the stated condition is implemented and
  has a trustworthy source.
- Support keyboard navigation, visible focus, semantic headings/labels,
  screen-reader status updates, reduced motion, and mobile layouts.

## 8. Error handling, moderation, and abuse response

- Missing Supabase configuration leaves public read surfaces and the
  local-first Console usable, but prevents account-backed actions with a
  clear setup state.
- Invalid or expired email callbacks show explicit recovery guidance.
- Unentitled users receive a clear access-denied or sign-in state without
  private records, membership details, or role information leaking.
- Invalid source URLs or incomplete license/provenance fields prevent a
  resource from being published; drafts remain clearly private/unpublished.
- Reports and moderation actions preserve an attributable audit record.
  Hidden or rejected records are excluded from public queries.
- Rate limiting, content length limits, and moderation are required before
  enabling public contribution. A soft-launch must have named moderators and
  an operational response process.
- If adult-only contributor approval cannot be operated reliably, the safe
  launch mode is public-read-only Commons; do not silently accept open
  registration as proof of adulthood.

## 9. Testing and acceptance

### Authentication and routing

- A new email identity has no school, crew, Anchor, moderator, or other
  privileged entitlement unless a trusted grant exists.
- A user cannot grant an entitlement by changing client state, URL, form
  data, or product-switcher selection.
- Teacher landing requires the corresponding server-verified school
  membership; an assigned crew member reaches only the relevant Assembly.
- Multi-product default preference selects only among existing entitlements.
- Safe return paths, expired links, missing configuration, and unknown
  memberships produce explicit states.

### Commons rules

- Guests can read only published resources/posts/polls.
- Basic authenticated accounts cannot post or vote until contributor
  entitlement is granted.
- A contributor can submit valid post/resource references; invalid
  provenance, unsafe URL schemes, unlicensed/open claims, and oversized
  content are rejected explicitly.
- A poll accepts only one vote per account while open; duplicate, closed,
  or unauthorized votes fail without changing tally.
- Polls remain non-binding and cannot mutate Tender, crew, funding, Roll, or
  governance records.
- Moderation/report actions are authorized, attributable, and reflected in
  public projections.
- No Commons route writes student records or hosts a file.

### Regression and delivery checks

- Existing Tender lifecycle, quote/BOM, crew/Anchor, and Roll tests continue
  to pass.
- School Console persistence remains local to IndexedDB; no student payload
  reaches Supabase.
- Responsive browser review covers switcher, role landing, Commons Activity,
  Library, and public Market/Roll.
- TypeScript, lint, focused and full tests, and production build pass.

## 10. Delivery phases and dependencies

### First release

1. Add universal account entry and server-derived role-aware routing while
   preserving public Market/Roll and local Console access.
2. Add the shared global product switcher and authenticated APT-LABS
   Workspace shell.
3. Add the Commons migration, public Activity/Library/resource detail,
   approved-contributor moderation flow, resource-linked posts, and
   advisory polls.
4. Validate existing Tender/Assembly/Roll and School Console boundaries
   end-to-end.

These are one coherent first-release scope; the switcher must not ship with
fake product entitlements or dead community controls.

### Deferred pending a separate design

- Youth participation requires safeguarding, consent, moderation, and
  privacy requirements.
- First-party files, proprietary access, and design forks require licensing,
  storage, malware scanning, access control, retention, and provenance
  design.
- Real-time crew chat requires private channel membership, retention,
  reporting, moderation, and notification design.
- Capability credentials, ranks, decay, or SBTs require a verification
  mechanism, revocation/appeal policy, anti-capture rules, and explicit
  governance design. No credential is minted in this release.
- Payments, escrow, treasury voting, or yield require approved financial,
  compliance, and provider designs.
- Additional profession consoles require their own data classification,
  privacy, access, and safety design before implementation.

## 11. Relationship to existing design

This document adds the Workspace and Commons to the existing Sovereign
Tender Engine. Where the two documents overlap, the Tender Engine's
domain/lifecycle/authorization/Roll constraints remain authoritative. This
design changes the product shell and adds Commons; it does not redefine the
Tender aggregate or weaken its server/database invariants.
