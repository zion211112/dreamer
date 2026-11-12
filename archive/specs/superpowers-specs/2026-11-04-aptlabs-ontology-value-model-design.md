# APT-LABS Ontology & Value Model

**Status:** Design direction approved in conversation; awaiting written-spec review
**Date:** 2026-11-04
**Scope:** Establish a source-grounded ontology for APT-LABS needs, cooperation, delivery, contribution, outcomes, money, and a possible future APT Coin. This is a conceptual model, not an implementation schema or financial instrument design.

## Purpose

Before designing or implementing APT Coin, make explicit what APT-LABS treats as an actor, a need, a decision, work, evidence, contribution, outcome, value, and financial claim. The ontology must explain how a situation may lead to cooperative work and what can be learned from it without pretending that one record, score, or token proves the entire causal story.

The design is guided by the following user principle:

> APT-LABS should become an architecture of distinctions that permits cooperation. It must distinguish without fragmenting, connect without conflating, preserve without imprisoning, and recognise without reducing everything to money.

This design treats APT Coin as a possible future live mechanism, but its purpose and instrument type remain undecided. The typed ontology and separate economic rails are foundational whether or not a token is ever justified.

## Decisions

1. **Three independently timed flows are foundational:** delivery, financial settlement, and contribution/recognition. They can refer to the same undertaking but do not share one lifecycle or imply one another's states.
2. **Contribution is not acceptance.** A person's or crew's contribution can be recorded even when work is rejected, incomplete, cancelled, unsuccessful, or disputed. Recognition or attribution does not depend on overall project success.
3. **The Roll records outcomes, not only victories.** Partial delivery, defects, disputes, cancellation, failure, acceptance, and unresolved matters are institutional knowledge, with provenance and correction paths.
4. **Use typed, authoritative records connected by stable references.** A shared undertaking identifier links records without collapsing them into a universal graph or record.
5. **Keep status dimensions separate.** Lifecycle, evidence basis, decision authority, and disclosure/consent answer different questions and must not be encoded as one trust status.
6. **Value is plural and situated.** Do not create a universal value, reputation, or contribution score. Keep use/outcomes, contribution, exchange price, costs, settlement, capital claims, and APT-LABS coordination economics distinct.
7. **APT Coin is conditional.** Explore it only after evidence shows a specific coordination problem that existing money, contracts, credit, or accounting cannot address adequately.
8. **A token is not the right.** Technical transfer of a token does not by itself transfer legal ownership, an enforceable claim, redemption rights, or governance authority.
9. **The current application remains a browser-local demo/research surface.** This design does not add balances, transfers, token rewards, payments, authority, votes, or live Coin behavior.

## Source-grounded current state

### Current application and domain concepts

- The active application is Vite + Preact. Its APT Coin Lab is a research-only page that states no purpose has been selected and excludes balances, transfers, rewards, access, voting, and work authorization.
- People records describe people, crews, capabilities, evidence context, and explicit typed relationships. A capability claim, record basis, availability, and credential are not interchangeable.
- Institutions and Assets describe organizations, resources, provenance, and supported relationships. A record does not establish ownership, authority, operating condition, availability, or value by itself.
- Commons records observations, reported needs, proposals, and steward decisions. An observation or proposal is not diagnosis, commissioning authority, or permission to spend.
- Workbench records or simulates scope, packages, terms, roles, delivery, and acceptance. Selection is not authorization; a simulation is not an operational undertaking.
- Roll domain code describes accepted undertakings, participants, evidence layers, disclosed costs, and hash anchors. A hash match demonstrates integrity of covered bytes, not truth, identity, performance, or acceptance.
- The Workbench simulation has a separate simulation record and can include explicit cost assumptions. Its Roll output is a preview, not a production Roll entry or settlement.
- Database helpers expose an optional Supabase mode, while current demo data and several workflows are browser-local. The checked-in `supabase/` tree contains local CLI temporary state, not an active migration set; helper code is not proof that deployed tables, authorization, or protected shared evidence storage are configured.
- No Coin-specific balance, supply, transfer, reserve, redemption, issuer, or settlement model exists in the active application.

### Design history and evidence status

The 2026-11-04 Workspace Economy and Flow Rethink is the newest approved product direction reviewed for this work. It keeps APT Coin Lab non-operational and explicitly leaves Coin's purpose, accounting model, and economic role undecided. It also distinguishes evidence, authority, compensation, contribution, credentials, capital, and hypothetical token units.

The 2026-10-31 Asset Chains and Ecosystem Maturation document proposes future capital intents, settlement gates, investment instruments, and contribution credentials. These are future architecture, not current services or settled Coin semantics.

The 2026-11-02 synthesis and investor memorandum contain stronger commercial, financing, fee, data-moat, and scaling hypotheses. Their stated figures and outcomes are not evidence of live performance and do not override the newer distinction-oriented direction. They must be labeled as hypotheses if retained in future product or investor materials.

This ontology adopts the user's approved refinements in this conversation where they expand the earlier scope: independent delivery, financial, and recognition flows; contributions preserved independently of project acceptance; and Roll outcomes beyond success.

## Ontology overview

The model has typed domain records and shared references. The following are conceptual record families; this document does not prescribe a final database schema.

| Family | What it describes | Does not establish by itself |
|---|---|---|
| **Actor and resource** | Person, crew, institution, asset, role, capability claim, or delegation | Availability, ownership, authority, qualification, or value beyond the record's basis |
| **Situation** | Condition, observation, reported need, location, and context | Root cause, priority, diagnosis, or authorization |
| **Claim and evidence** | A bounded assertion, its source, supporting evidence, uncertainty, and challenge history | Truth beyond its scope or general trustworthiness of a person |
| **Governance decision** | A proposal, rule, deciding actor, authority basis, rationale, and status | Commissioning authority, spending power, or work authorization unless separately delegated |
| **Undertaking** | Agreed scope, parties, packages, terms, responsibilities, safety, and acceptance criteria | Execution, payment, outcome, or rights not specified in the terms |
| **Event** | An attributable action or state change within one domain flow | That other flows changed at the same time |
| **Contribution** | A person's or crew's reported or evidenced activity, role, scope, and attribution basis | Acceptance, quality, compensation, credential, or universal rank |
| **Delivery and outcome** | What was delivered, assessed, accepted, disputed, changed, cancelled, or left unresolved | Settlement or recognition unless separately recorded |
| **Financial obligation and settlement** | A priced or otherwise specified obligation, payer/payee, due basis, and settlement evidence | Delivery, acceptance, social impact, or rights outside the instrument |
| **Attestation** | An issuer's narrow, scoped, status-bearing statement based on specified evidence | General reputation, payment, ownership, or automatic authority |
| **Economic instrument** | A defined monetary, credit, support, investment, or token arrangement | Any right not stated by its issuer and governing terms |
| **Roll record/revision** | A correctable, attributable memory of an undertaking's outcomes and linked evidence | An infallible ledger, universal success certification, or proof beyond its evidence |

### Actors, roles, and authority

People, crews, institutions, and assets remain distinct entities with stable identifiers where available. Roles are contextual: being a coordinator, steward, participant, issuer, or asset operator in one record does not automatically grant the same authority elsewhere.

Authority is a scoped delegation linked to an actor, institution, action, subject, and validity basis. It is not inferred from a title, profile, relationship edge, coin balance, credential, or participation history. Commons stewardship, institutional commissioning, financial approval, delivery acceptance, and credential issuance are separate powers unless an explicit governance design delegates them together.

### Situation, need, and causality

The causal model is an inquiry path, not a deterministic state machine:

**condition or change → observation → possible explanations → decision → undertaking → inputs and work → delivery → use → near- and longer-term effects**

- A **condition** exists in the world; APT-LABS may not know or record it directly.
- An **observation** says what someone or a source noticed, when and where, with its source and evidence basis.
- A **hypothesis** proposes a possible cause. Multiple, competing, or unknown causes must remain possible.
- A **need** describes a sought condition or outcome. It is not itself a diagnosis or work order.
- A **decision** records what an authorized actor decided, under which rule or delegation, and why.
- An **undertaking** is a separately scoped and authorized response, if one is chosen.
- **Output**, **use**, **outcome**, and **effect** are different claims. A completed output does not prove that intended benefits occurred.

Temporal order alone does not establish causality. A machine scan, self-report, or correlation cannot silently become a verified diagnosis or causal finding. Causal claims must state their source, scope, uncertainty, and evidence; where causal attribution is not established, retain the weaker description.

### Typed relations

Records may be connected through explicit, directed, typed relations, including:

- observed at / concerns / associated with;
- proposes / decides / authorized by;
- undertakes / includes package / performed by;
- contributes to / supported by evidence;
- delivered under / assessed against / accepted or disputed by;
- obligation owed by / payable to / settled by;
- outcome recorded in / attested by / disclosed to.

Relationship vocabularies should be constrained per domain. An edge is a claim with provenance and scope, not a universal proof. Do not infer ownership from operation, stewardship, location, funding, or work; do not infer payment from acceptance; and do not infer acceptance from a credential or contribution attestation.

## Three independent flows

The undertaking identifier is a shared reference, not a shared status. Each flow has its own source records, authoritative actors, evidence, transitions, and clocks.

Not every observation or need becomes an undertaking. Before one exists, records reference the relevant signal, proposal, institution, or asset directly; do not invent an undertaking ID to make an early-stage record look operational.

### 1. Delivery flow

The delivery flow records agreed work and what happened to it:

**scope and terms → authorization → work events → delivery state → assessment/outcome**

At minimum, keep separate:

- agreed scope, packages, roles, safety requirements, rights, compensation terms, and acceptance criteria;
- authorization and its actor/authority basis;
- execution events such as start, pause, change, resume, or stop;
- delivery quantity/completeness, evidence, and known defects;
- assessment outcomes, including acceptance, conditional/partial acceptance, changes requested, rejection, dispute, cancellation, and unresolved status.

The precise state machine is a later domain-design decision. In particular, delivery completeness and acceptance must be modeled as distinct dimensions: a complete submission can be rejected or disputed, and a partial delivery can be accepted as partial.

Cancellation does not erase work already performed. If there are multiple packages, each package may have its own progress and assessment while the undertaking has a separate overall outcome.

### 2. Financial flow

The financial flow records terms, obligations, and attributable settlement events:

**budget or estimate → agreed obligation → due/conditional state → settlement event(s) → reconciliation**

Keep distinct:

- estimated cost, disclosed price, agreed compensation, and actual costs;
- payer, payee, currency, amount or calculation basis, trigger, expenses, and any conditions;
- donation/grant/community support, non-binding capital intent, verified settlement, and investment claim;
- an obligation being due, waived, changed by agreement, disputed, partially paid, settled, reversed, refunded, or unresolved.

An accepted deliverable does not prove that payment occurred. A project cancellation does not automatically extinguish or create an obligation; the recorded agreement and authorized decision determine the claim. A settlement event requires its own attributable source/receipt and must not be fabricated from a work status.

Ordinary money, including KES where relevant, remains distinct from contribution, social outcomes, capital rights, and hypothetical token units. No ambiguous aggregate “funded” state should combine grants, intent, settlement, and investment rights.

### 3. Contribution and recognition flow

This flow preserves what people and crews contributed independently from the delivery and financial results:

**reported contribution event → provenance and attribution → optional acknowledgement/attestation → scoped disclosure and status**

A contribution record may include actor, role, agreed or actual scope, time/context, source, evidence references, attribution basis, affected undertaking/package, consent, and challenges or corrections. The initial record can be reported or disputed; it does not have to be a positive performance judgment.

Formal recognition is optional and separately governed. A future attestation, if designed, must identify issuer, subject, claim, scope, supporting evidence, date, verification/status method, consent, and expiry/suspension/revocation/correction semantics. A contribution event is not itself an attestation, credential, acceptance, payment receipt, reputation score, or financial entitlement.

Contribution should not disappear because an undertaking was cancelled, failed, rejected, or disputed. Equally, preservation does not mean public disclosure: access, retention, correction, and applicable withdrawal/restriction obligations require separate policy and implementation.

## Roll as accountable outcome memory

Roll is not limited to completed victories. It should preserve the outcome and learning of an undertaking, including:

- successful and accepted delivery;
- partial delivery and partial acceptance;
- changes requested and subsequent resolutions;
- defects, rejection, or dispute;
- cancellation, abandonment, or failure and recorded reasons;
- unknown or unresolved outcomes;
- linked contributions, evidence, cost/settlement references, authority, and decisions where disclosure permits.

Roll should link to the authoritative records of the three flows instead of replacing them. A Roll snapshot may summarize an outcome at a point in time, but the summary must not flatten independent payment, contribution, and delivery states into a single “success” flag. A non-success record can be useful institutional knowledge without being a judgment of a participant's worth.

Hashing can detect changes to covered fields; it does not prove truth, identity, authority, acceptance, delivery quality, or settlement. Corrections should be attributable and inspectable. Tamper evidence and append-only correction history do not justify permanent public disclosure or retention beyond applicable policy.

## Value ontology

Value is a set of situated questions and claims, not one conserved scalar. The following concepts may be related, but must not be substituted for one another.

| Value lens | Question it answers | Appropriate basis | Do not infer |
|---|---|---|---|
| **Use / functional value** | What capability or benefit did an output enable for a particular user or institution? | Use context, criteria, testimony, or observed results | Market price or universal usefulness |
| **Social / ecological effects** | Who experienced what benefit or harm, in which place and time horizon? | Named stakeholders, indicators, evidence, uncertainty, and distribution of effects | One aggregate “impact value” or causal attribution from correlation |
| **Contribution** | What did a person or crew contribute, in what role and scope, on what basis? | Contribution events, source, attribution, evidence, and challenge path | Acceptance, personal worth, equal share, or payment |
| **Exchange price** | What did parties agree to exchange for a defined scope or item? | Explicit terms, unit/currency, payer/payee, trigger, and agreement | Actual settlement or social/use value |
| **Cost and settlement** | What costs or obligations arose and what was settled? | Disclosed and actual cost records; attributable settlement evidence | Delivery quality, acceptance, ownership, or impact |
| **Capital / legal claim** | What enforceable repayment, ownership, or return is claimed, by whom, under what terms? | Named issuer, instrument, rights, liabilities, eligibility, settlement, transfer, and remedy terms | A right from a token name, asset relationship, project association, or market price |
| **Coordination economics** | Does APT-LABS reduce friction or create sustainable service revenue? | Measured operating cost, buyer/provider behavior, service fees, and repeat use | Proven moat, investor return, social value, or user contribution value |

These are analytical lenses. The ontology should not require every undertaking to quantify every lens. Where a measure is absent, uncertain, contested, or not appropriate, preserve that as unknown rather than inventing a value. APT-LABS' own revenue model is also distinct from the economic value created by participants or the communities they serve.

## Future APT Coin boundary

APT Coin's name does not select its ontology. The following are different instrument possibilities and should be evaluated separately:

- unit of account;
- medium of exchange or payment token;
- stored-value or redeemable claim;
- mutual-credit or other credit mechanism;
- contribution incentive;
- governance right;
- a tokenized representation of a separately defined legal instrument;
- no token, because an existing alternative is better.

None is selected by this design. A token may be transferable at the technical layer without transferring a related legal right. Ownership, redemption, repayment, yield, governance, and other rights must be explicit in the governing instrument and applicable arrangements; code-level transfer alone is insufficient.

### Necessity and readiness gates

Do not design live supply, balances, or transfers until the following are separately addressed:

1. **Demonstrated problem:** a specific coordination, accounting, settlement, or other need is evidenced in a bounded real context.
2. **Alternatives:** compare ordinary currency, invoices, contracts, mutual credit, existing payment/accounting systems, and a no-token option.
3. **Single purpose:** identify the exact function and users; do not combine contribution, payment, governance, access, and capital claims into one instrument by default.
4. **Issuer and obligations:** name who issues and owes what, to whom, under which terms and authority.
5. **Lifecycle rules:** define creation/issuance, limits, transfer, redemption or non-redemption, fees, settlement, cancellation, reconciliation, error handling, loss/recovery, and recourse as applicable.
6. **Distribution and harms:** assess who can participate, who bears volatility or liability, concentration/capture, privacy, exclusion, incentives to misreport, and effects on workers and communities.
7. **Legal and operating readiness:** obtain jurisdiction-specific review of instrument classification and establish appropriate custody, security, disclosure, support, and oversight before any live mechanism.
8. **Pilot and exit:** define a limited, observable pilot, independent review, stop conditions, and how participants can exit or resolve failed operations.

Passing these gates would authorize a separate instrument design—not automatic implementation or issuance. Token ownership must not be required for discovery, participation, fair compensation, or optional contribution recognition unless a later, separately approved design demonstrates and justifies a narrow exception.

## Proposed architecture and boundaries

- Keep domain records authoritative in People, Institutions, Radar/Commons, Undertakings, the three economic/work flows, and Roll; connect them through stable IDs and typed references.
- Treat evidence provenance, authority, disclosure, and correction as cross-cutting metadata/policies, not as a universal trust score.
- Keep each flow's state machine and event authority independent. Cross-flow projections must identify their sources and must not imply missing transitions.
- If an eventual Coin model is justified, define a dedicated instrument domain with its own issuer, terms, lifecycle, reconciliation, and recourse. It must not be a field added to every profile, contribution, or Roll entry.
- Keep the active Coin Lab research-only until a separate reviewed design authorizes a more specific scope.
- No backend, wallet, chain, payment provider, balance UI, issuer integration, or live transaction is part of this design.

## Non-goals

- Selecting a token standard, blockchain, wallet, monetary policy, reserve model, peg, supply, price, exchange, or launch date.
- Offering legal, investment, tax, or financial advice or asserting a regulatory classification.
- Treating Coin as a universal measure of value, contribution, reputation, or impact.
- Claiming that existing investor projections, sample records, credentials, or simulations are verified operating evidence.
- Changing current application routes, local storage formats, or domain state machines in this specification phase.

## Acceptance criteria for this ontology design

1. Delivery, financial settlement, and contribution/recognition can have independent histories and timing under a shared undertaking reference.
2. A contribution can be preserved with provenance when work is rejected, cancelled, incomplete, unsuccessful, or disputed; it does not imply acceptance or payment.
3. Roll can record non-success outcomes and their learning without turning them into a universal participant ranking or a single project-success flag.
4. Lifecycle, evidence basis, authority, and disclosure/consent remain separately identifiable.
5. Causal descriptions separate observation, hypothesis, decision, action, output, use, and effect; uncertainty and competing causes remain representable.
6. Use, social/ecological effects, contribution, price, cost, settlement, capital rights, and coordination economics are distinct value lenses with explicit non-inferences.
7. A token's technical transfer is not treated as transfer of any underlying legal right without a separately defined instrument.
8. Coin remains conditional on demonstrated need, alternatives analysis, explicit purpose and issuer, defined lifecycle/recourse, distributional review, and legal/operational review.
9. Current implementation, approved product direction, archived proposal, and unproven commercial hypothesis are labeled distinctly.
10. This design does not create Coin balances, transfers, entitlements, or live transactions.

## Open decisions

- Whether any observed APT-LABS pilot problem requires a token rather than existing money, contractual, credit, or accounting mechanisms.
- The precise contribution event and attribution semantics, including what can be recorded by the contributor, counterparty, institution, or independent reviewer.
- Which non-success outcome vocabulary and package-level state machine best serve different undertaking types.
- Roll retention, participant control, correction, restriction, disclosure, and legally required deletion policy.
- Who may issue, contest, suspend, revoke, or correct each future attestation type.
- The legal entity/issuer, jurisdictions, custody, settlement, privacy, and operating responsibilities for any eventual instrument.
- Whether a future Coin would be an accounting unit, payment medium, credit mechanism, claim representation, incentive, governance mechanism, or no token.

## Source references

- [Workspace Economy and Flow Rethink](./2026-11-04-workspace-economy-and-flow-rethink-design.md)
- [Asset Chains and Ecosystem Maturation](./2026-10-31-asset-chains-and-ecosystem-maturation-design.md)
- [People Capability Workspace](./2026-10-31-people-capability-workspace-design.md)
- [Workbench Opportunity and Credential Flow](./2026-10-30-workbench-opportunity-and-credential-flow-design.md)
- [Roll Demo Trust Boundary](./2026-11-02-roll-demo-trust-design.md)
- `src/pages/workspace/AptCoinLab.tsx`
- `src/lib/local-workflows.ts`, `src/lib/local-workbench.ts`, `src/lib/workbench-simulation.ts`
- `src/lib/people-network.ts`, `src/lib/db/work.ts`, `src/lib/db/roll.ts`, `src/lib/db/roll-hash.ts`

## Validation

This is a documentation/specification deliverable; no application code or data model is changed in this phase. Before a later implementation, turn the approved ontology into typed schemas and transition tests, including non-success paths, independent settlement timing, contribution preservation, provenance/authority/disclosure boundaries, and Coin isolation from operational records.
