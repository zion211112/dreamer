# Workbench School Opportunity Simulation

**Status:** Approved and implemented; automated checks pass, manual browser review pending
**Date:** 2026-10-31
**Scope:** Connect one browser-local School Console need to its optional Commons observation, actual Institutions/Assets context, and an isolated Workbench simulation. Remove the misclassified Mwea solar sample asset and recast its case as an asset-unresolved school need.

## Product intent

Workbench demonstrates how a selected institutional need can be composed into accountable productive work. The Console draft remains the canonical need source; Commons may add linked observation/review context, and Institutions/Assets may add context only when a distinct asset record is identified. The connected case follows:

**Console need → optional Commons observation/review → optional asset context → Tender → Assembly → Acceptance → Roll preview**

The user can prepare a plan manually and run the scenario through simulation-only operations. Page Agent is an optional future assistant mode, unavailable until authenticated model infrastructure is configured; when enabled, it requires explicit user confirmation. This is an end-to-end product simulation, not evidence that a school published a Tender, appointed a crew, accepted a delivery, moved funds, or deployed an asset.

## Decisions

1. Keep the existing `/workspace/workbench` route and `/workspace/field-desk` alias. Redesign the Workbench experience rather than add another workspace route.
2. Use the existing School Management Console software asset as the entry point to the school tool; it is not the school, a school asset, or school authority.
3. This slice uses one user-selected Console need draft and no model request. A future Page Agent may receive only the same allowlisted draft fields after explicit preview and confirmation; no learner names, answers, grades, classroom records, credentials, or unrelated Console data may enter a model prompt.
4. The user can run the full simulation from a manually reviewed plan. When a protected model endpoint is configured, Page Agent may also preview a plan and coordinate the run after explicit confirmation using narrow simulation-only tools. The app validates every transition against a typed state machine.
5. Simulation output is isolated from School Console, Commons, People, Institutions, local Workbench applications, and any real Tender, Assembly, acceptance, payment, credential, or Roll store.
6. A Roll is applicable only to a physical asset that reaches simulated acceptance and deployment. The result is a **Roll preview**, never a real or immutable Roll record. Creative and software cases terminate at accepted-work evidence instead.
7. Page Agent never publishes, assigns real participants, authorizes work, accepts real delivery, settles funds, or issues credentials.
8. The cross-module source chain is explicit: Console draft → optional linked Commons observation → optional existing asset context → Workbench simulation. Console remains canonical for the need, Commons for the observation/review record, and Institutions for registered entities; simulation stores references, not duplicate authoritative records.
9. A need may have no asset. A proposed physical output may be named by the user for simulation, but it does not create an Institutions asset record.

## Product boundary and first case

The School Console currently stores its snapshot in IndexedDB under `apt-labs-school-console` / `local-work` / `school-console-v1`. Its Teacher/Principal control is a presentation mode, not authenticated school authority. Its need drafts are private local drafts and do not create Workbench opportunities or Commons signals by themselves.


The user may optionally link one existing Commons field signal and one existing Institutions/Assets registry record by stable ID. These are contextual references, not copied records or additional authoritative sources. A Commons signal marked as an example stays an example and cannot become an operational observation through linking. Asset ownership, stewardship, operation, provider availability, and authority are never inferred from a link. If no suitable asset exists, leave the asset link empty and carry the need forward without inventing one.

Add one explicit handoff from a Console need draft to the Commons report composer. It opens a prefilled, editable observation form; the user selects an existing institution record, reviews, and submits it. If no registered institution matches, keep the draft in the Console and do not create an unlinked Commons signal. The resulting local `FieldSignal` stores an optional `sourceConsoleDraftId` reference and the observation the user actually entered. It does not duplicate the full Console draft, copy learner data, publish to a network, or grant authority. Commons shows the source link and can return to the Console draft. Workbench can select that linked observation as optional context; it does not require Commons approval to run a simulation, because simulation grants no operational authority.

Commons must allow a field observation with no identified asset: make `FieldSignal.assetName` optional while retaining the optional `assetId`. Update validation and presentation compatibly: existing saved signals with asset names continue to load; asset-free signals display “Asset not identified” and create no asset relationship. The report form must permit omitting an asset. Do not invent a school entity when no registered institution is selected; an unlinked school need may remain in the Console draft without a Commons handoff.

Current snapshot fields are treated as follows:

- **Eligible from the Console draft:** `assetName` (presented as source/need title), `need`, and optional `assetBuildCost`.
- **Excluded:** `markedPapers`, answer content, learner/student names or identifiers, fee notes, lesson draft content, and unselected task/checklist data.
- **Not assumed to exist:** itemized materials, verified institution identity, legal authority, provider availability, safety approvals, accepted evidence, or current asset condition. Missing facts remain unresolved and must be supplied by the user or left as gates.

Simulation provenance stores `consoleDraftId`, optional `commonsSignalId`, optional `institutionId` selected during Commons handoff, and optional `assetRecordId`. These remain separate references; the Console projection never treats `assetName` as an asset ID. Context IDs must resolve to existing records; missing or example-only records retain their provenance and cannot be upgraded by linking. A proposed new physical output, if needed, is a separate `proposedOutputAssetName` in the simulation plan and never creates an Institutions asset record.

Commons observations allow an empty affected-asset reference. The Mwea school-power observation is recast as a school need with no assumed asset. In `PEOPLE_NETWORK`, remove `asset-school-solar-classroom-system` and its `asset-school-solar-school` edge; keep the `mwea-school` institution. In `EXAMPLE_FIELD_SIGNALS`, make `scenario-school-power.assetId` absent, render “Asset not identified,” and retain its observation/review uncertainty. Remove the solar asset from Institutions-derived sample results. Preserve every other stable ID and do not recycle the removed sample reference.

Supported school-need families in this slice are teaching/learning deliverables (for example, an animation or assessment-paper design), school services/operations (for example, Wi-Fi installation or maintenance), and learning-environment design (for example, a classroom-floor pattern proposal subject to teacher, safety, and accessibility review). These are work needs, not registered assets. A need may link to zero or more real Institutions/Assets records; an absent asset identity remains explicitly unresolved.

The first full Tender → Assembly → Roll simulation requires a physical-asset need. If the selected need is creative, software, professional, or otherwise non-deployment work, the manual planner must model its packages and acceptance evidence but omit Roll as not applicable. A future Page Agent may propose candidate work packages, but it cannot invent prices, measurements, provider identities, credentials, or evidence.

Asset context is optional and selected from the Institutions register by ID. If the work proposes a new/improved physical output rather than affecting an existing registered asset, the user may enter a proposed output name in the simulation plan. Keep it separate from `assetRecordId`, label it proposed, and do not persist it to People/Institutions. Example needs may include a teacher-requested animation or assessment paper, Wi-Fi installation/maintenance, or classroom learning-environment design; these are possible work types, not claims that a school has requested them.

## Workbench experience

### Overall frame

Keep the Studio shell and use a five-stage progress path:

1. **Need** — select and inspect a source record.
2. **Tender** — shape the opportunity and its work packages.
3. **Assembly** — plan role/package relationships and simulated execution.
4. **Acceptance** — compare simulated delivery evidence to criteria.
5. **Roll** — inspect a physical-deployment Roll preview, when applicable.

Show one stage as the active work surface. Future stages communicate their gates without showing success-shaped placeholder activity. The canvas is a focused dossier, not an IDE, analytics dashboard, or chat-first interface. The graph is an optional composition view inside Assembly, not the default editor.

### Need

- Let the user choose one eligible Console need draft and review the exact fields available to the manual planner and future agent.
- Show source attribution and unresolved context, such as unknown site, authority, asset identity, or cost basis. Allow explicit links to an existing Commons signal and/or Institutions/Assets record; keep both optional.
- Display a linked Commons observation and asset as compact references with “Open record” links. If either is unlinked, keep that context visibly unresolved instead of inserting a placeholder record.
- Keep the source record unchanged. Creating a simulation starts from a separate snapshot.
- Never infer that the user is an authorized school principal from the Console's local role switch.
- Provide quiet links back to selected Commons and asset records without duplicating their details or changing their source records.

### Tender

Build an editable Tender candidate dossier with:

- institution and asset context, with identity and authority provenance;
- desired change, scope, and constraints;
- work packages, deliverables, capabilities, dependencies, and responsible role types;
- itemized materials or cost model only when supplied, with assumptions visible;
- compensation, payment trigger, expenses, rights, attribution, safety, and access terms;
- acceptance criteria and evidence requirements;
- unresolved facts and decisions required before real publication.

The candidate is not a published Tender, procurement notice, contract, budget commitment, or work authorization. The simulated run may demonstrate each gate but may not represent actual legal or financial effect.

### Assembly

Represent a plan as packages connected to participant/resource *types* (for example, designer, carpenter, supplier, installer, reviewer), not fabricated real providers. Use a readable package list by default and a secondary graph projection for dependencies and proposed relationships. Distinguish `proposed` from `simulated`; neither means verified or assigned in the real network.

Simulated capital and materials gates may be shown only when the user explicitly enters hypothetical values. They must be labeled as scenario assumptions; no funds are requested, reserved, transferred, or settled.

### Acceptance and Roll preview

- Simulated delivery evidence must be visibly scenario evidence and trace to package acceptance criteria.
- The simulation may produce a preview of the fields a future Roll would contain, such as asset, scope, package roles, evidence references, and simulated completion time.
- Never write a preview into the actual Roll, capability, credential, deployment, or institution registry.
- Never show a simulated acceptance or Roll preview as real proof, verified activity, immutability, or qualification.

## Future Page Agent interaction

When a protected model endpoint is added in a later slice, Page Agent is a contextual assistant attached to the active stage, not a persistent general chatbot. In this slice, its panel is visibly unavailable and makes no model request.

1. The user selects one eligible Console Tender draft.
2. The app constructs an allowlisted, sanitized extract and displays it for inspection.
3. The user may manually prepare the Tender and package plan. If a protected model endpoint is configured, Page Agent can instead propose a Tender structure, package breakdown, assumptions, and missing information, with each proposal linked to its selected source or marked as an inference.
4. The user reviews and confirms the plan, then confirms **Run simulation**. The simulation records whether its plan source was `manual` or `page-agent`.
5. A user-confirmed manual plan can run without an LLM. A configured Page Agent can coordinate the remaining simulated stages using constrained simulation operations. The user can pause, inspect the trace, or cancel.
6. The app state machine validates every requested transition and rejects out-of-order or real-work operations.

The agent must not scrape the full page or inspect unselected Console data. It receives only the sanitized selected-record payload. Agent output is structured and runtime-validated before it can populate the candidate or simulation. Failed, malformed, or unavailable model responses leave the source and simulation unchanged and offer a retry or manual-edit path.

For a future Page Agent integration (not implemented in this slice):

- Use Page Agent as the embedded page agent; do not introduce a browser extension or MCP service for this first Workbench slice.
- Route model requests through an authenticated same-origin proxy/serverless function. Provider credentials remain server-side; never embed an API key in the Vite bundle.
- The proxy accepts only the Workbench agent request contract, applies size limits and rate limits, and forwards only the selected sanitized payload.
- Do not use Page Agent's public free evaluation endpoint for school records. If no protected endpoint is configured, show the agent as unavailable; do not silently substitute canned output as a live model result.
- Keep the simulation fully usable with a manually prepared, user-reviewed plan when Page Agent is unavailable. Do not generate success-shaped placeholder agent output.
- The simulation runner owns transitions. Page Agent cannot directly mutate normal application records or call privileged institution workflows.

Live model requests and the protected proxy are explicitly out of scope for this implementation. The Page Agent panel may explain that it is unavailable pending authenticated model infrastructure, but it must not make a model request.

## Simulation data and state

Create a separate, versioned simulation record, for example `aptlabs:workbench-simulations:v1`, or an equivalent isolated store. A simulation record includes:

- run ID and schema version;
- plan source (`manual` or `page-agent`);
- source record references and the exact allowlisted source snapshot;
- user-reviewed Tender candidate and work packages;
- explicit assumptions and missing facts;
- simulated actor roles, not real provider identities;
- ordered simulation events with timestamps and the operation that produced each event;
- simulated evidence descriptions and acceptance results;
- optional Roll preview, never a production Roll object.

Use a simulation-only state machine such as:

`need_selected → candidate_drafted → tender_review_simulated → assembly_simulated → delivery_simulated → acceptance_simulated → roll_preview`

For non-physical work, end at `acceptance_simulated` and mark Roll not applicable. A rejected or incomplete gate remains visible; the agent cannot skip it to produce a completed-looking result.

Simulation storage must not write to or overwrite:

- School Console IndexedDB snapshot `school-console-v1`;
- Commons signals/governance or Workbench draft/application localStorage keys;
- People/Institutions registries;
- any future production Tender, Assembly, settlement, Roll, credential, or audit store.

Provide a clear way to inspect, discard, and restart a simulation. Discarding a simulation deletes only its simulation record and never changes the source Console draft.

## Visual direction

Preserve the current APT-LABS editorial paper and field-console identity. Use compact stage navigation, a strong dossier hierarchy, quiet separators, and precise provenance and gate states. The simulation boundary must be unmistakable but not repeated as warning copy in every field: a persistent **SIMULATION** mode mark, simulated actor labels, and scenario-colored event trace are sufficient. Real source facts and scenario assumptions remain visually distinct.

Benchmark the information architecture against established school-operations products, including Zeraki, without copying their brand or claiming feature parity. Use familiar enterprise conventions: role-aware work, prioritized exceptions, direct links from a task to its source record and responsible role, and a concise audit/history trail. Avoid a full-SIS feature checklist, uniform KPI cards, or one dashboard for every school role. The distinctive APT-LABS value is composing people and work packages around a need.

Use a narrow Page Agent side panel on wide screens and a drawer on mobile. In this slice the panel is unavailable and makes no request; do not show an agent plan or confirmation action. During manual simulation, show stage, next operation, and trace in the same dossier context. No nested cards, dashboard KPI tiles, decorative graphs, fabricated counts, or celebratory “deployed” animation.

## Failure behavior

- **No eligible source:** explain that a principal must create or select a non-learner need record in School Console.
- **Selected record contains excluded fields:** exclude them before preview and show the exact sanitized extract; do not send the original object.
- **Missing physical-work information:** list missing facts and pause the physical Tender path; do not invent values.
- **Non-physical opportunity:** simulate package planning and acceptance; Roll is explicitly not applicable.
- **Page Agent unavailable:** retain the source and candidate, make no model request, and let the user finish a manual plan and run the simulation.
- **Invalid agent output or transition:** reject it, retain the last valid simulation event, and show an actionable error.
- **Storage unavailable:** do not report the simulation as saved; preserve source data and allow a non-persistent preview only if the UI clearly states that it will not be retained.
- **User cancels:** stop further operations and keep the partial trace labeled incomplete simulation.

## Non-goals

- Publishing a live Tender, bidding, contracting, assigning real providers, or authorizing real work.
- Connecting the School Console to a school account or treating its local role switch as authority.
- Sending learner/student data, lesson answers, marks, fees, or classroom records to Page Agent or a model provider.
- Moving or simulating actual money, funding commitments, settlement, payroll, escrow, or yield.
- Creating a real Assembly, acceptance record, Roll, credential, SBT, or verified capability.
- Using the graph as the default Workbench interface or introducing an autonomous multi-page agent.
- Replacing People, Institutions, Commons, School Console, or the shared Studio shell.
- Adding a general-purpose opportunity marketplace in this slice.
- Implementing authentication, a model proxy, or live Page Agent requests.

## Acceptance criteria

1. The Workbench route presents Need → Tender → Assembly → Acceptance → Roll preview as one coherent case flow.
2. The Console source projection contains only `draftId`, `assetName`, `need`, and optional `assetBuildCost`; the need label is never treated as an asset ID.
3. A user can explicitly hand a Console draft to Commons for review; the created `FieldSignal` stores an optional `sourceConsoleDraftId`, while opening the form alone creates no signal.
4. Existing `FieldSignal` records remain readable after making the asset name optional. An asset-free signal displays “Asset not identified,” has no asset relationship, and can link back to its Console source.
5. Workbench can optionally link one existing Commons signal and one existing Institutions/Assets record by stable ID; neither record is copied, modified, or treated as authority.
6. Asset-free needs remain valid through Tender planning. Missing asset identity is shown as unresolved; proposed output names do not create registry assets.
7. Remove `asset-school-solar-classroom-system` and `asset-school-solar-school` from shared fixtures, remove the asset from Institutions results, and preserve `mwea-school` as an institution. `scenario-school-power` remains a need with no asset ID.
8. The listed need families are represented as needs/work packages, not assets or claims of real school demand.
9. Learner/student data and unselected Console data cannot enter Commons handoff, simulation source, candidate, or stored simulation.
10. A manually authored, user-reviewed plan can start the end-to-end simulation and records `manual` as its plan source. The future Page Agent mode is unavailable in this slice.
11. The simulation state machine rejects illegal, skipped, replayed, or real-work actions.
12. A physical example can simulate Tender review, Assembly, delivery, acceptance, and a Roll preview without mutating production stores; non-physical work ends at accepted-work simulation and never fabricates a Roll.
13. No simulated actor, approval, capital, evidence, acceptance, deployment, or Roll is shown as real, verified, or institution-authorized.
14. Simulation data is stored separately and can be inspected, discarded, and restarted without modifying source Console drafts, Commons records, asset records, or existing Workbench data.
15. No Page Agent model request occurs in this slice; no API key ships to the browser. Manual simulation remains available when the agent panel is unavailable.
16. The graph is optional within Assembly; the package list remains the primary view and supports keyboard and mobile use.
17. The existing Workbench route and Field Desk alias remain valid; existing local drafts and applications are not silently deleted or rewritten.
18. The linked flow works with empty/malformed Console data, missing Commons/asset context, legacy signals, storage failures, cancellation, and non-physical work.
19. The Console-to-Commons handoff carries only `sourceConsoleDraftId` plus user-reviewed observation fields; it requires selecting an existing institution and never copies learner data.
20. `FieldSignal.assetName` is optional and legacy signals with asset names remain valid; an asset-free signal has no inferred `assetId` or asset relationship.
21. Workbench stores optional `commonsSignalId`, `institutionId`, and `assetRecordId` references separately; it never duplicates linked records or infers ownership, provider availability, stewardship, or authority.
22. The Mwea school-solar asset and edge are absent from shared fixtures and Institutions results; the school-power case remains asset-unresolved, and no removed ID is reused.
23. The design uses role-aware work, prioritized exceptions, direct source/owner drill-down, and concise history; it does not add school-role modules or claim feature parity with Zeraki.

## Validation

- Add unit tests for source allowlisting/redaction, optional asset association, backward-compatible FieldSignal validation, Console-to-Commons reference preservation, simulation transitions, Roll applicability, and separate-store writes.
- Add Commons tests for the source-Console-draft handoff and institution-selection gate; verify current sample cases remain distinct from user-entered signals.
- Manually verify Console handoff preview/submit, source selection, optional Commons/asset links, manual plan confirmation, simulation completion/cancellation, legacy record preservation, mobile drawer behavior, keyboard operation, and visible simulation provenance. Confirm the Page Agent unavailable panel sends no request.
- Test that simulated completion does not write to School Console, Commons source records, Institutions assets, existing Workbench drafts/applications, or any production record service.
- Verify Mwea asset removal leaves no dangling fixture references and that school-power remains asset-unresolved.
- Verify the unavailable Page Agent state makes no model request and that no API key or selected source payload is sent to an external model.
- Run `npm run build` and the focused new tests. Review the case flow at phone, tablet, desktop, and wide-desktop widths.