# APT-LABS Tower Workspace

- **Status:** Approved architecture; visual Workspace shell implemented
- **Date:** 2026-10-22
- **Product:** APT-LABS
- **Scope:** Tower architecture and aesthetic-only Workspace implementation; no new backend workflows

## 1. Purpose

Make the Workspace legible as a tower of distinct working floors connected by one
underlying graph. A floor is a room with its own purpose, audience, and access
rules—not a column or dashboard panel showing every part of the organization.

The model should preserve the product's existing execution core:

**Friction → Asset / Work Engine → optional Tender → Assembly → verified Roll**

This is a relationship map, not a claim that every step or connection is live.
The graph can connect records across floors while each floor renders only the
records and relationships that the current user is allowed to see.

This document defines the target concept and its boundaries. It does not add a
graph database, floor request flow, on-chain wallet, community contribution
system, SBT issuer, AI provider, new authorization, or new Tender lifecycle.

## 2. Decisions captured

- The Workspace is a tower: a person occupies one floor at a time.
- A compact nested floor toggle stays in the existing top header.
- Basement contains one module, **Radar**.
- Ground contains two modules, **Asset Topology** and **Work Engines**.
- First contains **Governance**, initially limited to Commons friction priorities.
- Use a universal graph as the relationship model, with typed nodes and edges.
- Basement votes are lightweight relevance signals, not governance ballots.
- Governance eligibility is intended to depend on scoped, verified capability
  SBTs; this does not exist in the current product.
- A proposed contribution credential requires evidence and attestation by an
  asset owner and a qualified peer. Discussion, answers, and votes alone do not
  qualify.
- Hermes is a future agent slot, not a connected AI.
- Use the approved front-room editorial visual language across the Workspace.
- The visual shell may present these roles and boundaries before the related
  backend workflows exist; all unavailable actions and sample data must remain
  explicit.

## 3. Product invariants

1. **A graph edge is a claim, not proof.** Its relationship type, author,
   evidence, state, and visibility must be explicit.
2. **Floor navigation is not authorization.** The server authorizes access to
   floor records and actions; the header toggle cannot grant access.
3. **Floor connections do not leak room contents.** A user in Basement does
   not see Ground records merely because an edge connects them. A deliberately
   public, consented summary may be exposed only through an authorized
   projection.
4. **Tender remains the execution contract.** Reuse `src/lib/tender.ts` and its
   database lifecycle. A graph projection must not introduce a second Tender
   status or bypass Blueprint, assigned crew, Anchor sign-off, Assembly, or
   deployment-to-Roll rules.
5. **Evidence states remain distinct.** A question, idea, upvote, opportunity,
   signed Tender, and verified Roll record are different kinds of evidence.
6. **The School Console boundary remains intact.** A public School Console
   product/asset description may be represented in the graph; student records,
   lesson content, and local school notes remain on the device and are not
   synchronized or graphed.
7. **Illustrative data is visibly illustrative.** Sample posts, ranks, activity,
   links, and asset examples must not read as live community or job activity.
8. **No unsupported services are implied.** No connected AI, wallet, SBT
   issuance, access request, or live activity stream is claimed until actually
   implemented.

## 4. Floors and access

| Floor | Purpose | Modules | Entry model |
|---|---|---|---|
| Basement | Sense lived friction, ideate, and abstract social-to-systemic problems | Radar | Entry to the room does not imply access to Ground or Governance data. Posting and voting must follow the eventual moderation and safeguarding policy. |
| Ground | Inspect assets and their intersections; discover or operate work engines | Asset Topology; Work Engines | General entry is the current UI assumption. A Basement-only view still does not render Ground records. Asset-specific actions require their own authorization. |
| First | Make scoped Commons-priority decisions | Governance | Restricted to users whose qualifying capability is verified server-side for the decision scope. A verified Roll-derived badge is not automatically a governance credential. |

The floor switch is the only cross-floor navigation control and remains adjacent
to APT-LABS in the top header. It shows the current floor and compact entries
for the other floors. An inaccessible entry may show its name, lock state, and
eligibility requirement. It must not show protected room content, private
record names, membership, activity counts, or graph previews.

The user requested an access-request affordance. It remains conceptual until
there is a real request, review, authorization, and notification flow. A request
is never a grant. The browser cannot decide floor access based on a locally
displayed badge.

The Ground default above is an explicit assumption, not a resolved product
requirement. If Ground also requires membership or a capability, its server-side
entry policy must be named before implementation.

## 5. Universal graph: entities and relationships

“Universal graph” describes a common relationship model and topology view. It
does not require storing every domain object in one graph database or flattening
objects into interchangeable nodes. Existing systems remain authoritative for
their records; graph nodes reference those records.

### 5.1 Node families

| Node | Meaning | Examples |
|---|---|---|
| `Friction` | A situated problem signal with observation, affected parties, sources, uncertainty, and disagreement | Cultural authorship and distribution; education constraints; trusted proof of capability |
| `Room` | A moderated discussion context attached to a theme or friction; not an asset | Culture & stories; a nested Mwea animation discussion |
| `Post`, `Answer`, `Vote` | Contributions and lightweight community signals within a Room | A question, response, or relevance vote |
| `Asset` | A product, institution, place, service, tool, or system that people can use or build upon | School Console product, workshop, hotel, country context, health system, APT-LABS Tender Engine |
| `Work Engine` | A capability operated by an Asset that can organize work, contributors, and outputs | A possible Mwea Animation Box; an asset can exist without operating an engine |
| `Work Opportunity` | A scoped invitation to contribute through an engine | Community contribution, publication, school animation supply, client project |
| `Tender` | The existing APT-LABS accountable build/work contract | Asset need, active Blueprint, assigned crew, Tender status |
| `Assembly` | Authorized execution of an eligible real Tender | Materials, fabrication, Anchor sign-off, deployment |
| `Roll Record` | Immutable verified deployment evidence created through the current execution contract | Completed Tender and its accepted Blueprint/crew snapshot |
| `Contribution Evidence` | Scoped evidence of a person's contribution to an asset, engine, opportunity, or Tender | Artifact, attribution, reviewer, acceptance criteria, limitations |
| `Capability Credential` | A separately governed, potentially on-chain SBT that asserts a narrowly defined capability | A verified capability or governance scope; not a social score |
| `Governance Decision` | A scoped decision about Commons friction priority | Deliberation and eligible ballot result |

### 5.2 Typed relationships

Edges use named relationships such as:

- `surfaces` — a Room discusses a Friction.
- `responds_to` / `may_address` — an Asset, Work Engine, Opportunity, or Tender
  proposes work related to a Friction.
- `operates` — an Asset operates a Work Engine.
- `offers` — a Work Engine offers a Work Opportunity.
- `requires` — a scoped work item names prerequisite capability, access, or
  evidence.
- `executes` — an Assembly executes a Tender under the existing lifecycle.
- `produces` — an accepted execution produces a Roll Record.
- `contributed_to` / `attested_by` — Contribution Evidence is attributed and
  reviewed.
- `eligible_for` / `prioritizes` — a scoped credential permits a person to take
  part in a defined Governance Decision.

Every edge records its relation type, source and target type/ID, author or
authority, status (`proposed`, `accepted`, `verified`, `contested`, or
`withdrawn` as appropriate), evidence/provenance, visibility policy, and
timestamps. “Proposed response” must not be displayed as “solves”; “operates”
must not be inferred from a shared owner or location; “contributed to” must not
be displayed as “verified capability” without the required attestation.

Topology queries apply server-side authorization before returning nodes,
edges, labels, or aggregates. Hidden-node counts can themselves disclose
protected information and are not returned by default. A public-safe summary
requires explicit publication and consent; it is not a fallback for access
denial.

## 6. Basement — Radar

### 6.1 Purpose and panes

Radar senses hard problems that may require coordinated work. It should make
space for social, cultural, economic, institutional, and meta-level frictions,
not just predefined product needs. It starts with affected people's accounts
and uncertainty, not with a presumed solution.

The selected design is a restrained three-pane room:

1. **Left — Radar and community rooms.** The live module identity, signal
   overview, topic/friction rooms, and nested discussions. “Live” describes an
   open, current room; use a real-time/live indicator only when fresh activity
   is actually delivered. Rooms are
   conversations, not Ground assets or job engines. A name such as “Mwea
   Animation Box” must be qualified as a discussion room if the separate
   proposed Asset/Work Engine shares that name.
2. **Center — friction feed and room discussion.** Posts, answers, perspectives,
   signal-only votes, filters, and activity bars. A live activity indicator
   requires measured engagement data (for example, contributions in the last
   seven days), not a solution-progress meter, truth score, or consensus claim.
   Without that data, an activity shape must be clearly labeled illustrative
   and must not imply real participation.
3. **Right — personal standing and tools.** Profile, context-specific
   community standing, verified capability records, wallet connection state,
   badge/credential state, and a small Hermes dock at the bottom. Do not merge
   participation rank with verified work capability or Governance eligibility.

The header retains the compact tower floor selector. It is not repeated as a
sidebar or a floor overview.

### 6.2 Signal and discussion lifecycle

1. A person records a local or submitted friction with place/context, affected
   people, observation, source, what is uncertain, and any contrary views.
2. If submitted, moderation and safeguarding determine whether it becomes a
   visible Radar post or Room. Submission is not publication, endorsement, or
   verification.
3. Participants discuss, answer, add evidence, or mark local relevance.
   Signal votes help the community notice a topic; they do not directly change
   Governance priority or certify facts.
4. A friction may be referred to Commons for moderated review. Existing Commons
   access and poll rules remain authoritative until a deliberately designed
   workflow replaces them.
5. A scoped Commons-priority decision on First floor may increase shared
   attention to a friction. It does not compel an asset, authorize spending,
   create a Tender, or assign builders.
6. A Ground Work Engine may later respond to the friction. The Basement view
   can show a public, explicitly authorized outcome signal, but never silently
   reveal a protected Ground record.

The UI must preserve disagreement and multiple perspectives. A vote bar cannot
substitute for evidence, affected-party consent, or a record of dissent.

### 6.3 Contribution credentials

The intended direction is on-chain, non-transferable contribution SBTs, but no
chain, contract, issuer, wallet, metadata standard, recovery method, or
revocation policy has been selected or implemented. Therefore, the current
Workspace must not offer a functioning “mint” action or imply a token exists.

The proposed eligibility path is:

1. Define a bounded contribution and acceptance criteria for an Asset, Work
   Engine, Opportunity, or Tender.
2. Preserve the attributable artifact and context as Contribution Evidence.
3. Obtain acceptance from the responsible asset owner plus an independent,
   qualified peer.
4. Allow correction, dispute, privacy review, and explicit publication
   consent.
5. Only after a separate credential protocol is approved, issue a scoped SBT.

Votes, posts, answers, reputation points, and unreviewed claims never mint a
capability SBT. A Roll record and a future contribution SBT remain distinct:
the former is existing verified deployment evidence; the latter is a new,
wallet-bound credential with additional protocol and privacy risks.

## 7. Ground — Asset Topology and Work Engines

### 7.1 Asset Topology

The topology module is a creative, inspectable node graph with intersections
between distinct asset types. It supports user onboarding for a workshop,
school, hotel, venture, project, product, service, tool, or country/context.
A country or place is not automatically an operating organization, asset owner,
or verified partner.

Nodes and edges visibly distinguish registered, proposed, illustrative,
operational, and verified states. The Add an Asset action begins an explicit
onboarding path, not an instant verified listing or access grant. Onboarding
records the asset type, responsible party, location/scope, public identity
consent, provenance, and whether it operates a Work Engine.

The graph is an index over authoritative records. Existing Tender and Roll
records keep their current lifecycle and source of truth. It must not synthesize
connections from matching names, category, or geography. In the current visual
shell, asset onboarding is an unavailable action; the CTA must not imply that
a listing or access request was created.

### 7.2 Work Engines

A Work Engine is an Asset capability and community that routes or organizes
work. It can include scoped opportunities, collaboration, contribution
attribution, and outputs such as a publication. Not every Asset is a Work
Engine, and not every contribution is a Tender.

The target model permits community contribution, creative production, client
work, publication, and Tender-backed physical builds. When a task is a
capitalized, accountable build governed by the current APT-LABS contract, it
uses the existing Tender → Assembly → Roll path. Other opportunity types need
their own explicit scope, acceptance, compensation, rights, safety, and
authorization rules; they must not be disguised as Tenders.

Current Commons opportunities are Tender-linked. They do not yet provide a
general-purpose asset job engine, public job routing, creator marketplace, or
asset-owned community.

### 7.3 Illustrative ecosystem relationships

- **Mwea cultural friction → Mwea Animation Box:** a Basement Room may discuss
  authorship, cultural continuity, rights, distribution, and livelihood. A
  separately typed, initially proposed Ground Asset/Work Engine could grow
  from that signal. The shared name must not collapse the discussion Room into
  the operating Asset.
- **Animation for schools:** a future Work Opportunity could connect an
  animation engine to a school's need or publication. It requires clear
  commissioning, licensing, attribution, acceptance, and student-privacy
  boundaries. It does not imply that student data leaves the School Console.
- **Nyamindi Hydro:** represent a hydro project as a proposed Asset/project and
  its relationship to education friction as an unverified hypothesis until
  local evidence supports the causal link. Do not imply it is already solving
  education problems.
- **Health management system:** a proposed software/system Asset until
  ownership, operation, deployment, and evidence are established.
- **Tender Engine and Democracy System 1.0:** may be represented as platform or
  software Assets. The existing Tender Engine is a real product surface; a
  future decentralized Democracy System is not current governance functionality.

These are structural examples, not live listings or outcomes.

## 8. First — Governance

First-floor v1 is limited to **prioritizing Commons frictions**. It does not
govern asset operations, Tender lifecycle, fund allocation, payment, crew
selection, or all network policy.

Entry and ballot eligibility require server-side verification of a
capability credential scoped to that governance domain. Token possession is
not blanket authority. Eligibility, proposal/quorum rules, vote weighting,
privacy, conflicts of interest, Sybil resistance, appeals, compromised wallets,
credential expiry/revocation, and dispute handling must be designed before a
binding decision. Until then, current Commons polls remain advisory and cannot
authorize operational or financial actions.

First floor must show why the user is eligible and the exact decision scope;
otherwise show the locked destination and a genuine qualification/request path.
The request/qualification flow is future work, not a simulated action.

## 9. Personal standing, wallet, and Hermes

- Show **rank** with its source and scope. The current
  `public_roll_profiles.derived_rank` is based on verified Roll records and is
  publicly available only when the member has consented to a public name. It is
  not community popularity or Governance eligibility. Show room participation
  separately and only when that system exists.
- Show **verified capability** only from its authoritative evidence and state.
  Existing `roll_capability_badges` are derived from verified Roll/crew data;
  they are not on-chain SBTs and do not automatically grant Governance access.
- Show wallet state as not connected until a wallet provider and safe
  address/consent model exist. Do not expose a public address by default.
- Keep pending credential work distinct from minted tokens, and minted tokens
  distinct from Roll evidence.
- Hermes is a quiet, inactive future dock. If later connected, it may help
  locate sources or summarize attributed perspectives; it must cite inputs,
  label uncertainty and omissions, preserve disagreement, and require human
  review before publishing, voting, minting, or assigning work. No live AI
  provider is implemented today.

## 10. Visual system across the Workspace

Use the existing public front-room tokens and typography as the Workspace
foundation; do not introduce a second visual identity for the tower.

- **Display:** `--font-editorial` for floor titles, room titles, and key post
  headlines.
- **Interface:** `--font-ui` for reading, controls, navigation, and forms.
- **Technical labels:** `--font-code` only for IDs, compact provenance, dates,
  and small state markers—not for all navigation or body copy.
- **Palette:** mineral paper and raised paper surfaces; warm ink; kiln/clay for
  primary action; forest for verified capability; restrained brass for
  unresolved or caution states; blueprint blue only where technical evidence
  needs it.
- **Hierarchy:** generous editorial spacing, quiet rules, open lists, a few
  meaningful accents, and restrained geometry. Avoid nested-card dashboards,
  all-caps metadata overload, faint low-contrast text, dense mono labels,
  decorative graph lines, gradients that imply activity, and crypto tropes.
- **Legibility:** body copy must remain comfortably readable; metadata must not
  fall below accessible small-text contrast or become the primary reading path.
  Preserve keyboard focus, reduced motion, zoom, and responsive touch targets.

The Basement three-pane layout collapses deliberately: the left room navigator
becomes a compact room selector; central discussion stays primary; profile and
Hermes stack or open as a deliberate secondary surface. No content should
depend on hover. Ground topology and Governance use the same tokens and type
roles while retaining floor-specific information architecture.

## 11. Current product versus intended product

| Capability | Current product contract | Tower target |
|---|---|---|
| Tender | Real typed lifecycle and validation in `src/lib/tender.ts` and Supabase migrations | Remains authoritative and connected to its graph projection |
| Assembly and Roll | Authenticated assigned crew; Anchor sign-off; immutable deployment record | Remain the only verified execution path unless a new domain is separately designed |
| School Console | Local-device records; no student sync | Product/asset descriptor may be graphed; Console records remain local |
| Commons | Moderated contributions, published reads, advisory polls; youth contribution disabled | Future Radar-to-Commons review and scoped priority handoff |
| Opportunity board | Opportunities attached to Tenders | Future asset/engine opportunities require separate contracts and policy |
| Capability badges | Roll/crew-derived records; no wallet token issuance | Future scoped SBT protocol and explicit governance eligibility |
| Floors | Workspace has client-side floor selection; existing contexts and server authorization remain authoritative | Separate floor projections with real server-verified entry rules |
| AI / Hermes | No connected AI provider | Future source-grounded research companion |
| Cross-asset graph | No universal graph contract | Typed, provenance-bearing relationships across floor projections |

## 12. Visual shell implementation boundary

The approved visual shell presents Basement Radar, the two Ground modules,
Work Engine subsections, and a locked Governance destination. Radar voting and
new friction notes are local to the current session; neither submits to Commons
nor carries governance weight. Its bars and seeded friction cards are
illustrative, not live activity. The wallet, personal standing, credential
issuance, Hermes, and asset onboarding flows are not connected.

The First-floor lock is a navigation affordance only, not an authorization
mechanism. Any future Governance data or action requires server-side eligibility
checks in addition to row-level security. The public front page and sign-in
remain outside this visual change.
