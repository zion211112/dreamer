# Asset Chains and Ecosystem Maturation

**Status:** Approved direction; awaiting spec review
**Date:** 2026-10-31
**Scope:** Unify the local example entity catalog, show three typed end-to-end illustrative asset journeys across existing Studio surfaces, and record future trust/capital gates without implying live services.

## Product intent

Make the APT-LABS ecosystem legible through a small number of connected asset cases rather than a larger collection of disconnected names. Each case should reveal how people, institutions, assets, work, evidence, and authority relate. The current Vite application remains a browser-local concept; example records are not operational activity, investor traction, deployed assets, verified funding, or issued credentials.

The design follows the repository's typed-relationship direction: a shared graph vocabulary may connect records, but domain records remain authoritative in their own systems. The graph is not a universal replacement database.

## Product principles

1. **One identity per entity.** People, crews, institutions, and assets use stable IDs and are referenced by Commons, Workbench, and Institutions rather than retyped as unrelated labels.
2. **Typed journeys.** Physical asset construction uses Tender → Assembly → Roll. Creative and software contributions use scoped opportunity → application → authorization → delivery evidence → acceptance, with credentials as a separate optional issuer decision. Not every asset is a Tender or Work Engine.
3. **Evidence precedes claims.** Observation, decision, authorization, settlement, deployment proof, credential issuance, ownership, and yield rights are distinct concepts and states.
4. **Examples are read-only scenarios.** Example cases never enter local user applications, governance decisions, work records, capital records, or credential records. They cannot trigger a privileged transition.
5. **No fabricated financial or operating facts.** Unknown owner, issuer, site, cost, terms, settlement, or deployment is shown as unknown/unconfigured, not inferred from a name or relationship.

## Current-system findings

- The active application supports browser-local Commons signals and proposals, Workbench briefs and applications, and local work-review transitions.
- The active application does not implement Tender publication, Capital Intent, verified settlement, Assembly, or Roll. Those systems exist in archived specifications and Supabase migrations, not as live active-app workflows.
- The documented Tender lifecycle is an accountable physical-build protocol; it is not a universal lifecycle for software, creative work, or service assets.
- Historical credential direction treats Roll evidence, a contribution credential, an Anchor's scoped attestation, and future yield rights as separate proof/economic rails.
- No IPO, security-offering, tokenized ownership, cap-table, investor-eligibility, custody, transfer, or distribution model is present in the repository. These are future architecture, not current UI actions.

## Shared example registry

Use the existing People relationship graph as the shared local example catalog. Preserve existing stable IDs where possible and add missing records rather than creating duplicate display-name objects in Institutions, Commons, and Workbench.

Keep the canonical example registry separate from a user's imported portable People record (`aptlabs:people-network:v1`). The sample graph is the default shared catalog used by the case fixtures and cross-route links. An imported portable graph remains intact and available as a separate user-selected dataset; do not merge it into, overwrite it with, or silently substitute it for the shared sample registry. Unknown imported IDs remain user-owned and do not become shared APT-LABS entities without an explicit future registration workflow.

### People and crews

Retain the eight existing profiles: Kemoly Murage, Nia Wanjiru, Jabari Otieno, Lucia Santos, Kwame Mensah, Yuki Tanaka, Horus the Young, and Tehuti. Add **Zuri Kamau** as an explicitly illustrative learning animator, not as a real or available contributor.

Retain the existing crews: Field Systems Crew, Mtaa Repair Circle, Open Knowledge Stewards, and Crew0. Add an illustrative **Learning Media Crew** for the school animation context. Crew membership and capability relationships are examples unless independently sourced; do not infer availability, credentials, or authorization from a graph edge.

### Assets

Keep exactly nine catalog assets for the first portfolio pass. Reuse existing identifiers and add sample-only register references `EX-AS-01` through `EX-AS-09`; these references are not production IDs, serial numbers, legal title, or proof of ownership.

1. Kemetos1
2. School Management Console
3. Mwea School Solar Classroom System
4. Fikra API
5. Community Solar Microgrid
6. Shared Repair Workshop
7. Community Tool Library
8. Mwea Water Cooperative Pump 02
9. Lake Basin Cold Store Chamber A

The School Management Console remains a local-first software product, not the school or its physical infrastructure. Fikra API remains a service asset associated with Lacesse Co; no browser-side integration is implied. Thiba Hydro remains a project context, not one of the nine numbered assets, until its site, responsible entity, and asset identity are sourced. Do not assign it an `EX-AS` reference. Institutions and legal entities remain distinct from assets; retain the organizations already present in the repository and link only supported relationships.

Each asset record may include: stable ID, sample reference, name, type, location/site certainty, associated institution, owner/operator/steward when known, operating state, data basis, and explicit unknowns. Keep `owns`, `operates`, `stewards`, `funds`, `contributes_to`, `attests`, and `issues` as distinct relationship types. Never infer ownership from stewardship, operation, location, a Tender issuer, or a work relationship.

## Five field-signal examples and three decisions

Commons presents five nuanced, read-only example observations linked to registry asset IDs. Each separates what was noticed from suspected cause, reporter-noted urgency from verified priority, evidence on hand from missing checks, and suggested next step from authorization. Include the existing pump-pressure, school-power, and cold-storage cases, plus examples for microgrid load behavior and tool-library condition. Use no invented sensor readings or exact financial figures.

Show three read-only decision examples with contrasting outcomes: one narrowly approved for a defined next investigative step, one returned for missing evidence, and one declined with its rationale. These are a separate `ExampleDecision` fixture type, never `CommonsProposal` records. Even the approved example cannot seed or authorize a real Workbench brief.

## Three typed asset journeys

### Physical asset: Community Solar Microgrid

Demonstrate the physical-build shape: observation → scoped human decision → Tender/Blueprint concept → community-support or Capital Intent concept → settlement gate → assigned crew and Assembly → accepted evidence → Roll concept. All stages in this Vite slice are a read-only illustrative case. Do not present a settled amount, real Anchor signature, deployed Roll, or public funding offer as fact. The current app must not create those records.

### School creative work: learning animation

Demonstrate the contribution path: teacher/local need → institution-owned Work Opportunity concept → application example → explicit scope/rights/compensation requirements → authorized-work boundary → delivery evidence concept → institution acceptance decision. The sample author is the default local profile, **Kemoly Murage**, only where the example fits his stated profile; Zuri and Learning Media Crew are explicitly illustrative. Do not send School Console or learner data into Commons/Workbench.

### Software contribution: Kemetos1

Demonstrate a bounded software contribution: scoped brief → example application by Kemoly Murage → separate authorization → technical evidence and review → acceptance → credential eligibility concept. Acceptance is not credential issuance. No SBT, signature, issuer, public deployment, or verified capability is fabricated.

These are different paths, not one universal lifecycle. Only the physical build path conceptually uses Tender/Assembly/Roll. A read-only case file can link records across existing routes; it must not masquerade as stored user workflow state.

## Workbench examples

Reframe work contexts around the registry and these typed journeys, not generic discipline cards. Each context needs a precise institution/asset reference, scope, deliverables, capabilities sought, unresolved facts, rights/attribution, safety/access constraints where relevant, and explicit compensation state. If terms are unknown, label the context as a scenario/not an open call and do not imply a real application can be submitted.

Add a small set of separate example applications and work records as read-only case content. Label their scenario provenance at the case boundary and exclude them from saved-application counts, user workflow transitions, and institution decisions. Provide one example brief attributed to **Kemoly Murage · local profile · example draft**, with no implication it was saved, submitted, commissioned, or accepted. The real local user record remains empty unless the user performs an action.

## Contextual Studio return links

Add a small, quiet back link only when a reliable origin is known:

- Workbench opened from a signal or proposal returns to Commons.
- Workbench opened from an asset returns to Institutions.
- Workbench opened from the Thiba Hydro project context returns to Institutions without implying that the project is a registered asset.
- Institution-scoped Commons opened from Institutions returns to Institutions.
- School Console keeps its existing return-to-Institutions link.
- Top-level People, Institutions, and unscoped Commons/Workbench rely on Studio navigation and do not gain redundant back controls.

The control is contextual navigation, not a replacement for browser history or the Studio rail. Preserve relevant query context when returning.

## Future credential and capital architecture

### Contribution credential / SBT

The future credential asserts a narrow, attributable claim (for example, a named role on an accepted work record), not general trust or ownership. Eligibility requires accepted evidence, the responsible institution's authorized issuer decision, any required independent qualified attestation, consent/privacy review, and a defined claim schema. A credential must identify its issuer and verification/status method and support expiry, suspension, revocation, dispute, and correction.

A verifiable credential may be the authoritative signed claim; a non-transferable on-chain token is a possible presentation/anchoring mechanism only after a separate protocol and privacy review. It is not a funding instrument, asset share, yield right, payment receipt, Roll record, or blanket governance permission. Governance may verify a narrowly scoped active claim server-side; token possession alone grants no authority. No signing key, wallet address, or personal evidence is placed in the active browser app or public chain by this design.

### Community support and investment

Keep these instrument types separate:

- **Grant/donation/community contribution:** support with no ownership or yield right unless an explicit different instrument says otherwise.
- **Capital Intent:** non-binding intent associated with an eligible Tender; not committed, transferred, held, or settled funds.
- **Verified settlement:** an attributable issuer-verified settlement event; it is a gate in the Tender contract, not evidence that work was performed.
- **Investment instrument:** a separately issued debt, equity, or revenue-participation claim with a named legal issuer, rights, risks, eligibility, terms, settlement, and transfer rules.

An asset or Tender does not itself become a security by receiving support. Investment rights attach to the legal issuer/instrument; the financed asset or Tender identifies use of proceeds. Community funding and investment can support the same project only as separately recorded instruments with their own rights and settlement states. Do not combine them into one ambiguous “funded” percentage.

“IPO” is reserved for a public offering of company equity. Asset/project financing may be a separate regulated offering, but is not an IPO merely because it is tokenized. Any public offering or transferable token requires a later jurisdiction-specific legal, compliance, custody, disclosure, eligibility, cap-table, settlement, and reporting design. This spec enables none of it.

## Future maturity gates

1. **Local portfolio:** canonical sample entities, provenance-aware scenarios, and contextual route links; no live operational claims.
2. **Authoritative registry:** authenticated legal entity, ownership/title, operator, steward, issuer, location, consent, and record provenance with auditable updates.
3. **Verified execution:** server-authorized Tender, Blueprint, assigned crew, capital settlement, Assembly, accepted evidence, and immutable Roll contracts with distinct state transitions.
4. **Credentials:** issuer governance, claims schema, evidence policy, cryptographic profile interoperability, holder delivery/privacy, status, revocation, and dispute processes proven end to end.
5. **Community capital:** explicit grant/donation/intent/settlement types with responsible issuer, source, consent, and evidence; no implied yield.
6. **Investment/public offering:** only after a legal issuer/instrument and regulatory/custody/disclosure model is established. Tokenization is optional representation, not the business model or proof of value.

## Non-goals

- Connecting a backend, chain, wallet, payment rail, Fikra API, or issuer.
- Publishing a live Tender, moving/settling funds, assigning a real crew, creating a verified Roll, or issuing/revoking a credential.
- Adding token balances, public SBT/IPO/funding actions, fabricated traction, valuation, yield, partner commitments, or investor returns.
- Replacing domain source-of-truth records with a monolithic graph or changing the approved School Console local-data boundary.
- Expanding beyond the shared registry, the three case journeys, the example records, and contextual Studio return links.

## Acceptance criteria

1. People, crews, institutions, and assets use shared stable IDs and supported typed relationships across People, Institutions, Commons, and Workbench.
2. The sample catalog has 9 people, 5 crews, and 9 assets; Zuri Kamau and Learning Media Crew are explicitly illustrative; all `EX-AS` references are identified as sample references.
3. The canonical sample graph and an imported portable People graph remain separate and unmodified; no silent merge or replacement occurs.
4. Five Commons example signals and three example decisions are read-only and distinguish observation, uncertainty, decision authority, and provenance.
5. Three asset cases show the distinct physical-build, creative-work, and software-contribution paths without collapsing them into one state machine.
6. Example applications, work, and the Kemoly example brief are clearly separate from user localStorage records, counts, and workflow transitions.
7. No example decision authorizes real work; no example settlement, Roll, credential, investor right, IPO, or asset ownership claim is represented as real.
8. Studio back links appear only when origin context is known and return to the correct parent route with relevant scope preserved.
9. Existing local storage formats remain readable; no fixture silently overwrites or merges with user-created records.
10. The UI distinguishes contribution evidence, Roll proof, cryptographic credentials, community support, capital intent, verified settlement, and investment rights.
11. The full chain is described as a local illustrative scenario, not proof of traction or a $1m valuation.
12. The active Vite + Preact app builds without a backend, dependency, wallet, issuer, or provider integration.

## Validation

- Run `npm run build` and inspect TypeScript diagnostics.
- Verify the registry has unique IDs and every example relationship resolves to an entity.
- Verify the three scenario chains never enter Commons governance, local applications, settlement, Assembly, Roll, or credential storage.
- Verify existing user localStorage records and School Console IndexedDB data remain unchanged by viewing scenario content.
- Verify contextual back routes and query preservation.
- Check the People/Institutions/Commons/Workbench flows at 320, 768, 1024, and 1440 px, keyboard navigation, visible provenance, and reduced motion.