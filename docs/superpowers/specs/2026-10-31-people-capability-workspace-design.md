# People Capability Workspace

**Date:** 2026-10-31
**Status:** Approved for implementation; scope frozen
**Scope:** Redesign the People workspace as a capability and service directory for people and crews, with work evidence and contextual links into the Studio. The relationship map remains available as a secondary view.
**Supersedes:** The primary-map layout in `2026-10-28-people-network-workspace-design.md`; its stable-ID and explicit-relationship principles remain in force.

## Product intent

People makes human productive capacity legible without reducing people to scores, resumes, or interchangeable labor. It helps someone discover an individual or crew by what they can contribute, where they work, what they offer, how they collaborate, and what evidence supports their experience.

People is one interface into the Studio network. A person or crew can connect to an institution, asset, opportunity, undertaking, or evidence record without copying those records into a standalone profile. People does not publish tenders, award work, reserve assets, or create commitments.

## Product principles

1. **Capability before graph.** Search and direct scanning are the default. The relationship map is a supporting way to understand explicit connections, not the primary way to find someone.
2. **People are not scores.** Do not rank, rate, or assign a completion percentage to people or crews. Do not use profile completeness, endorsements, activity volume, or inferred skill as a proxy for human value.
3. **Claims and evidence remain distinct.** A self-described capability, work sample, institutional attestation, and accepted contribution are different evidence bases. Show their source and context; do not silently upgrade one into another.
4. **Availability is explicit.** Only show service area, capacity, schedule, or availability when a person or crew has supplied it. Missing information is unknown, not unavailable or available.
5. **Offers are not commitments.** A service offer may state scope, deliverables, terms, and indicative price. It does not imply a proposal, contract, assignment, or payment.
6. **Context stays connected.** Profiles link to source work, evidence, assets, institutions, and undertakings by stable ID. A relation is shown only when explicitly recorded.
7. **Examples stay honest.** Sample identities and records may make the concept legible, but their illustrative basis is clear at the dataset boundary. Never imply that a sample person is contactable, available, credentialed, or attached to a live service.
8. **Contact is user-controlled.** A person or crew chooses whether and how to disclose a contact route. Private details stay hidden unless explicitly selected for display. People does not add internal messaging.
9. **Record origin controls editing.** User-authored records are editable by their author; imported records are preserved and edits create an explicitly managed revision or separate record; Studio examples are read-only. Similar names never trigger automatic merge.

## Experience

### People landing

Use the existing Studio shell and shared editorial paper/ink identity. The page header is compact: **People** and a short purpose line. Show an **Add profile** or **Edit profile** action only when the corresponding record can actually be saved. Do not expose a dead-end or decorative action.

The default workspace is a searchable directory with three views:

- **People** — individual capability profiles.
- **Crews** — collective capacity and collaboration profiles.
- **Network** — the existing explicit relationship map, retained as a secondary view.

The main search accepts names, roles, capabilities, services, and working areas. Keep the first filter set small: capability, location/service area, and stated availability. Only show the availability filter when explicit availability data makes it useful. Filters are optional refinements, not a multi-step search wizard. Do not put Assets in the People root tabs; asset records remain in their own Studio context and appear as contextual links where relevant.

Show results as a compact, editorial list rather than a uniform card grid. Each result contains:

- Name, working role, and person/crew identity.
- A few relevant capabilities or an explicit service offer.
- Location or service area, only when supplied.
- Availability/capacity, only when supplied.
- One relevant work item or evidence reference, where available.

Avoid decorative avatars, KPI tiles, profile-completion meters, rating stars, skill clouds, and graph-like embellishment in the default view. Use a portrait only when it is a genuine, permissioned profile image; otherwise use a restrained initials mark.

### Person detail

Selecting a result opens a contextual inspector on wide layouts and a labeled dialog/sheet on narrow layouts. Keep the current search and filter state intact when opening and closing it.

Organize the inspector in this order:

1. **Identity and practice:** name, working role, concise first-person or attributed summary, and location/service area if supplied.
2. **Capabilities and services:** specific capabilities with their evidence basis; separate service offers with scope, deliverables, work area, indicative terms, and explicit availability where provided.
3. **Selected work and evidence:** a small number of attributable work samples, contributions, references, or attestations. Each item links to its source and states what it supports.
4. **Collaborations and affiliations:** crews, institutions, assets, and undertakings connected by explicit relationships, with relationship and source context visible.
5. **Contact preferences:** user-selected contact method(s), preferred contact method, and an explicit display choice. A person may hide all contact details. A crew may provide a crew-owned contact route. No internal message composer is provided.

Offer a contextual **Propose for work** action only when a suitable undertaking exists. It creates a proposal for review, not a participant assignment or commitment. If no undertaking is available, omit the action rather than present a dead-end button.

### Crew detail

A crew is a collective actor, not a decorative group label. Its profile states:

- Why it formed and what kinds of outcomes it can deliver together.
- Members and their complementary responsibilities, where explicitly known.
- Combined capabilities and relevant services.
- Working area, capacity, and availability only when supplied by the crew.
- Selected work/evidence and linked institutions, resources, and undertakings.

Do not infer a crew's membership, coordination capacity, or availability from shared tags or proximity in the graph.

### Network view

Retain the current relationship map as a secondary **Network** view. Keep explicit directional edges and keyboard selection. Selecting an entity opens the same contextual inspector as the directory. Provide a clear return to People/Crews and preserve search context where practical. The map is for tracing relationships, not for encoding skill strength, status, or value by node size or color.

## Minimal domain concepts

The People interface needs a small set of typed concepts; it does not introduce a universal graph database or a complete marketplace model.

### Capability

A capability belongs to a person or crew and describes a specific kind of work they can perform. The minimal claim record contains:

- Stable capability ID and person/crew subject ID.
- Capability name, scope, and visibility.
- Linked evidence references.
- Claim source, such as self-declared or attributed to a named person/institution, kept separate from verification state.

Do not add universal proficiency levels. If an undertaking needs qualification, define its requirement locally and let a reviewer assess the relevant evidence in context.

### Service offer

A service offer belongs to a person or crew and describes work they are willing to provide. Minimal optional fields: title, scope, deliverables, service area, indicative terms/price, and availability statement. Unknown terms remain unset. An offer is not an application, a procurement bid, or an agreement.

### Availability

For v1, a person or crew may state one of four values: **Open to enquiries**, **Limited availability**, **Not currently taking work**, or **Not stated**. The person or crew may update this value and optionally record its last-updated date. Default to **Not stated**. Do not infer availability, capacity, or schedule from crew size, activity, past work, or response history. Do not add calendar, booking, or scheduling features.

### Evidence and relationships

An evidence record has a stable source ID, evidence type, supplier/issuer, the specific capability claim it supports, and verification state plus verifier when applicable. V1 evidence types are **work sample**, **reference**, **credential**, **institutional attestation**, and **accepted contribution**. Verification state is separate from evidence type and claim source; **self-declared** is a claim source, not a verification status. A credential verified by its issuer supports the credential's stated claim, not automatic proof that a particular job was performed successfully. Evidence remains linked with provenance rather than copied into profile prose.

Reuse typed relationships for membership, contribution, affiliation, service, work, stewardship, and evidence. Only authored edges are visible. Do not infer identity, qualification, employment, ownership, or endorsement from a relationship.

### Contact preferences

A person may select whether to display a contact method and which method they prefer. A crew may provide a crew-owned contact route. Contact methods are hidden by default unless the profile owner explicitly chooses display; do not expose private email, phone, or account details from authentication/session data. The concept can show an explicitly disclosed route without implementing internal messaging, delivery tracking, or contact logging.

### Record ownership and editing

Every profile record has an origin:

- **User-authored:** editable by its author and saved through a working persistence path.
- **Imported:** preserve the imported source unchanged. An edit creates an explicitly managed revision or separate record with a visible source link; never overwrite the imported record implicitly.
- **Studio example:** read-only.

For this slice, the only profile-editing entry point is an imported portable person or crew. The user may create a browser-local revision that changes stated availability and contact methods, including whether each method is displayed and which is preferred. Keep the imported source unchanged and identify the revision as local and unpublished. Use the existing browser-local demo identity only as an ownership key; it is not authentication, secure access control, or contact information. Do not edit imported identity, capability, work, or relationship data through this form.

Do not create new person or crew entities in this slice. Studio examples remain read-only, and no editor is shown for them. Never merge records based on matching or similar names. If the current slice cannot persist a new or edited profile, do not show Add Profile or Edit Profile actions. Sample records stay separate from imported records.

Keep the first implementation compatible with the existing `NetworkEntity`/`NetworkRelationship` catalog where practical. If the current generic entity shape cannot express evidence basis or offers cleanly, add only the focused types needed for this People slice; do not broaden the change into all Studio domain schemas.

## Five Studio anchors

Use the five user-selected anchors to make People relationships concrete without fabricating participants or operational facts:

1. **Kemetos1:** software asset. Link explicitly recorded Crew0 contributions and evidence. Distinguish project-reported claims from independently verifiable evidence.
2. **School Management Console:** software product reference. Treat principal and teacher as institutional roles and sources of demand, not invented named profiles. A need can reveal required capabilities; it does not imply that a matching person is available.
3. **Lake Basin Cold Store Chamber A:** physical asset. Show relevant capability requirements such as refrigeration, electrical controls, inspection, or cold-chain operations only as requirements unless supported People records exist.
4. **Open Design Library:** institution. Show explicit affiliations where recorded. Community Tool Library is a separate asset associated with it; do not conflate the institution and asset or infer ownership/operation.
5. **Kimunye Tea Factory:** asset reference. Do not invent personnel or relationships, or infer its operator, location, ownership, staff, condition, capacity, or current demand from the name.

Render contextual links to the five anchors only where an explicit, valid relationship exists. Absence of a relationship must not produce an inferred match, placeholder connection, or fabricated association. No additional sample assets are introduced by this People design. Asset catalog pruning and institution/asset classification are otherwise outside scope.

## Reference-led design contract

Borrow interaction patterns, not layouts, copy, logos, or trade dress:

- **GitHub profiles:** selected work, profile README/context, and attributable contribution evidence. Do not use contribution volume as a human ranking.
- **Upwork profiles:** explicit service scope, deliverables, and terms. Avoid opaque ranking, pressure to maximize profile completion, or marketplace-first framing.
- **LinkedIn profiles:** familiar identity, work history, skills, and visibility controls. Avoid vanity metrics and endorsement counts.

The APT-LABS expression remains its own: warm paper and ink, disciplined serif headings, restrained technical typography, precise record details, and low-ornament controls. The person and their work are the visual content. Avoid adding another dark graph surface, decorative gradients, excessive uppercase labels, or generic profile-card chrome.

Free resources may be used selectively:

- Google Fonts' open-source **Newsreader** and **IBM Plex Sans** are candidates for a Studio-wide type decision; do not introduce a one-off People font that fractures the shared system.
- **Lucide** icons are ISC-licensed and suitable for utility controls if an icon package is approved; existing inline SVGs remain acceptable for this focused slice.
- **Openverse** provides Creative Commons/public-domain media. Use it only for contextual asset imagery with license/source recorded; do not use stock photos to impersonate People profiles.

## Interaction and state

- Search results update as the user types and can be operated by keyboard.
- Filters compose predictably and have an explicit clear/reset action.
- Selecting a profile opens details without losing the list's query, scroll, or filter state.
- Selecting a linked entity in the inspector opens its local contextual record when a route exists; otherwise show a non-interactive reference, not a broken link.
- The Network view remains keyboard navigable and must have a non-graph way to inspect the same relationships.
- The Directory and Network views use the exact same entity inspector and record data. Do not create a graph-specific profile, relationship database, capability interpretation, or detail experience.
- User-authored edits use explicit save/cancel behavior. Imported records remain unchanged; edits create a visibly linked revision or separate record. Studio examples are read-only. Similar names never trigger merges.
- In this slice, only imported records can start an editable revision; the form edits availability and contact disclosure/preferences only. It never changes the imported entity or presents a demo identity as a live profile.
- Contact preferences and disclosed contact methods are controlled by the person or crew. No private contact detail is displayed by default; no messaging system is added.
- Availability uses only the four defined values and optional last-updated date. Capacity is never inferred.
- Do not show Add Profile or Edit Profile controls unless a working save path exists for that record origin.
- Empty, no-match, loading, import, and error states use concise actionable copy. Do not fill empty profiles with fabricated availability, endorsements, work, or credentials.

## Boundaries and non-goals

- Redesign only the People route and its focused components/styles.
- Preserve the shared Studio shell, top-level routes, existing storage keys, and imported portable People record behavior unless a focused compatibility fix is necessary.
- Do not redesign Commons, Institutions, School Console, Workbench, or the Roll in this slice.
- Do not implement procurement, bidding, negotiation, contracting, payment, resource reservation, assignment, or delivery workflows here.
- Do not add authentication, external services, backend persistence, messaging, AI recommendations, social feeds, ratings, leaderboards, or paid integrations.
- Do not copy a competitor's exact visual design or use unlicensed assets.
- Do not imply sample people, offers, availability, evidence, or relationships are live or verified.

## Acceptance criteria

1. The default People experience answers who can contribute what and provides direct search/filter access without requiring graph navigation.
2. People and Crews are distinct directory views with profiles appropriate to individual and collective capacity.
3. Capability, service offer, availability, and evidence basis are distinct concepts; absent data remains unknown.
4. Evidence is attributed to its source and states only the claim it supports.
5. No score, rank, profile-completion metric, availability inference, or skill inference is presented.
6. Render contextual links to the five anchors only where an explicit, valid relationship exists. Absence of a relationship must not produce an inferred match, placeholder connection, or fabricated association.
7. The existing network map remains available as a secondary view and uses the exact same entity inspector and underlying records as the directory.
8. Desktop details use a contextual inspector; mobile details use a dismissible dialog/sheet with focus management and preserved search state.
9. Contact preferences let a person choose whether a contact method is displayed and the preferred method; crews may provide a crew-owned route. Private details remain hidden by default and no messaging feature is introduced.
10. Profile origin is explicit: user-authored records are editable by their author, imported records are preserved and revisions are explicit, and Studio examples are read-only. In this slice, only imported records can start a local revision, and that form edits availability and contact preferences only. Add/Edit actions appear only when persistence works.
11. Capability claims have stable IDs, subject IDs, names, scopes, visibility, and evidence links. Evidence has source ID, type, supplier/issuer, supported claim, and a separate verification state/verifier. Self-declared is a claim source, not verification.
12. Availability uses **Open to enquiries**, **Limited availability**, **Not currently taking work**, or **Not stated**, with optional last-updated date. No capacity is inferred, and the availability filter appears only when explicit values make it useful.
13. Search, filters, list, inspector, and relationship view are keyboard accessible; status is not conveyed by color alone; reduced-motion preferences are respected.
14. Existing imported People records remain separate from shared examples, are not overwritten or silently merged, and continue to load with stable IDs.
15. The implementation adds no backend or dependency without a concrete approved need, creates no new person/crew entities, and leaves other Studio modules unchanged.
16. Validate the People route at 320, 768, 1024, and 1440 px; run `npm run build` and focused tests covering search/filter, profile selection, explicit relationships, record origins, contact privacy, availability, evidence semantics, and imported-record preservation.

## Validation

- Confirm all visible capability/evidence/relationship claims resolve to explicit records or are labeled as self-described or unknown.
- Verify no network edge is inferred from shared tags or skills.
- Verify profile selection and return preserve search/filter state at desktop and mobile breakpoints.
- Verify map navigation has a keyboard-accessible directory alternative.
- Run `npm run build` and focused People tests after implementation; review screenshots at 320, 768, 1024, and 1440 px.