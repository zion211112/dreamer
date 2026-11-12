# APT-LABS Engine-First Workspace Shell

**Status:** Approved design; awaiting spec review
**Date:** 2026-11-07
**Scope:** Premium shared workspace shell and five locally functional operational demos

## Decision

Use one integrated **Field Instrument** workspace for five local demo workflows. The **command dock + review tray** is the shared operating model; a dedicated agent panel is an escalation surface for complex investigations, not a second primary shell. Keep existing domain stores and routes where they work, and connect them through explicit, inspectable transitions rather than rebuilding the app as five separate demos.

The workspace should feel like an instrument for doing and inspecting work. Every persistent pane has one job:

1. **Module rail:** switch among Commons, Network, Workbench, Records, and Intelligence.
2. **Module sidebar:** navigate tasks and saved views within the active module only.
3. **Work surface:** inspect, compare, and change domain records.
4. **Context inspector:** inspect the selected record, relationships, and evidence.
5. **Engine activity strip:** understand active work and open a run or proposed change for review.
6. **Command dock:** provide a scoped request surface and inspect typed proposals when an engine adapter is connected; it remains unavailable in this implementation.

The rail icon, selected-module treatment, sidebar heading, and module accent must reinforce the same module. The sidebar must not repeat links to other rail modules. School Console remains reachable as a task surface, not a sixth primary rail destination.

## User and Demo Workflows

The primary user is a coordinator moving evidence and work through local operational flows. The five demos are:

1. **Commons signal → proposal → work brief:** record or inspect a signal, submit and decide a steward proposal, then open an approved proposal as a Workbench brief with its source identifiers intact.
2. **Capacity match → shortlist → work-plan draft:** open an illustrative need, compare and inspect candidate capacity and evidence, add or remove candidates from a shortlist, then edit and save a local draft with unresolved checks.
3. **School Console need → Workbench simulation:** select a local Console need and its linked signal, shape a plan, advance the simulation, and save/resume the clearly labeled simulation.
4. **Opportunity → application → delivery review:** inspect opportunity scope and terms, save a local application, progress through review and work states, submit delivery evidence, and review acceptance or requested changes. Keep application, authorization, execution, delivery, acceptance, and settlement distinct.
5. **Records evidence → acceptance/history review:** inspect a Roll entry's provenance, evidence layers, acceptance, and revision history, with links back to related records where available.

These are local demos, not external transactions. Reuse existing demo-mode fixtures and each domain's existing storage/API boundary. Mark illustrative data and simulated outcomes explicitly; never make local state look like verified external work.

### Capacity matching surface

- Keep the active need visible while candidates are compared: requesting institution, requested capacity, date window, and location.
- Present candidates as a compact, keyboard-operable list rather than a card grid.
- Each row shows entity type, name, relevant location, claimed capacity, and the most useful source or gap. A claim and its source must be distinguishable.
- Support search, evidence-presence filtering, proximity filtering, and an explicit sort control. Show result counts and a meaningful no-results state.
- Selecting a row updates the contextual inspector. A separate control adds or removes the candidate from the shortlist; selecting a record must not implicitly commit it.
- The inspector shows fit reasons, evidence with issuer/source and date where known, missing checks, and actions scoped to that record.
- “Add to shortlist” is reversible and must not imply provider consent, availability, authorization, execution, or settlement.
- “Continue to work plan” remains disabled until at least one candidate is shortlisted.

### Draft work plan

The next step is an editable draft with title, target volume, date range, and shortlisted capacity. It exposes outstanding availability and evidence checks. Saving creates a clearly labeled local draft in the demo; it does not request or imply authorization. Validation errors appear beside or within the form and preserve user input.

### Cross-flow transitions

- Commons may open a work brief only from an approved proposal; preserve the proposal and source-signal identifiers.
- School Console may open Workbench simulation with the selected need/signal identifiers. Keep the simulation isolated from the source Console draft.
- Capacity matching writes only its dedicated local draft store. It does not silently create an application or authorization.
- Opportunity and Records links preserve existing entity, work, and evidence identifiers. Missing or stale references are shown as unresolved, not silently replaced.
- Cross-flow transitions are links/actions that the user invokes. Do not synthesize records or advance another module's workflow as a side effect.

## Navigation and Shell

### Module rail and sidebar

- Exactly five primary modules, in charter order: Commons, Network, Workbench, Records, Intelligence.
- Use coherent, semantically drawn line icons—not arbitrary glyphs. The selected icon uses the module's semantic accent, a visible selected indicator, and an accessible name. Provide a tooltip on hover and keyboard focus; do not make tooltips the only way to discover module names.
- The adjacent sidebar names the active module and exposes only its task navigation, scopes, filters, and saved views.
- In the Workbench matching view, the sidebar groups are task-based: work pipeline (Find capacity, Build a work plan, Review & authorize, Track delivery) and relevant saved views. These entries must route to real implemented views before they are presented as functional.
- Existing Workbench opportunity, capacity, and field-desk tasks remain within Workbench; School Console remains a task destination outside the five-link rail. Do not add a demo gallery or a sixth primary module.

### Topbar

Show product identity, current workspace/module context, global search, and the current user affordance. Do not duplicate module navigation or add an environment switcher. Environment and storage state belong in the bottom status strip.

### Context inspector

The selected-record inspector is available on wide screens without displacing the list's main comparison task. On narrow screens, it opens as a dismissible bottom sheet after an explicit record selection. Closing it returns focus to the selected record control.

### Persistent engine activity strip

The bottom strip spans the workspace on all five modules and shows:

- The truthful runtime context (for example, **Local demo** in demo mode); do not imply every module has the same storage backend.
- Engine/run state when present.
- Active-run and pending-proposal counts.
- A concise **Ask engine** command affordance.
- A review affordance when a proposal is waiting.

With no active work, the strip remains quiet and reports the engine's actual available state; it must not show simulated “online,” synced, or running states. Selecting an activity opens its run/review tray without navigating away from the work surface. A tray can be dismissed and reopened from the strip.

When no agent adapter is connected, **Ask engine** opens a disconnected command dock with request input/submission unavailable and a clear “Agent not connected” state. It creates no request or run.

## Agent and Engine Contract

The agent is an operator of scoped engine capabilities, not a source of authority. If a future adapter is approved and connected, a coordinator may issue a request in the command dock. The run is represented in the strip and review tray with these explicit states:

`queued → running → completed | blocked | failed | cancelled`

A run view exposes meaningful steps and outcomes: records read, sources considered, assumptions, checks, unresolved gaps, errors, and proposed actions. Do not render a successful result if the underlying operation failed or returned incomplete evidence.

An agent proposal is a structured, inspectable change set containing:

- Target record identifiers and the requested action.
- The exact proposed change or before/after values.
- Evidence/source references and provenance.
- Assumptions and unresolved checks.
- Whether the change is reversible and what permission/actor is required.
- A review state, distinct from applied or authorized state.

When an adapter is later approved, the user may inspect, edit, apply a permitted reversible draft change, or dismiss it. The review tray is not a chat transcript. This implementation renders no synthetic run or proposal.

The agent cannot contact a provider, represent consent, commit capacity, authorize or execute work, accept delivery, or settle payment. Those transitions require their own explicit, permission-checked action by an authorized actor. A proposal, human review, authorization, execution, acceptance, and settlement remain distinct states.

If a future adapter is connected, every completed run, proposal decision, and applied local change is attributable and inspectable in the relevant activity/history surface. If local demo storage is unavailable or a write fails, report the error and keep the draft available for recovery; do not show a success state.

This UI contract does not define an LLM vendor, MCP set, backend API, authorization implementation, or production run scheduler. Those require separate designs and permission/security review. The five local demos ship without an autonomous agent.

## Visual System

- Preserve the approved dark green-black base with bone primary text and moss secondary text.
- Use teal for evidence/canonical information, lime for proposals and active draft work, amber for checks/gaps, and coral for risk/blocked states. Pair color with text/icons and sufficient contrast.
- Use the existing serif/sans/mono role hierarchy. Reserve mono for compact operational metadata rather than body copy.
- Treat “premium” as a finish gate: precise type hierarchy, aligned grids, compact evidence-rich rows, crisp rules, bespoke semantic module icons, deliberate active/focus states, and a consistent bottom strip/inspector grammar across routes.
- Prefer aligned text, rules, compact rows, and functional inspectors over repeated rounded cards, generic hero sections, decorative maps, metric walls, gradients, or company-explainer content.
- Every displayed measure must affect a real decision and identify its unit and provenance. Do not use a match score as a substitute for evidence.
- The visual signature belongs in spacing, typography, linework, state grammar, and meaningful domain glyphs; do not add decorative Africa imagery or surveillance/defense styling.

## Responsive and Accessible Behavior

- At 1440px, preserve simultaneous visibility of the five-icon rail, module sidebar, main work surface, selected-record inspector where relevant, and persistent engine strip.
- At tablet widths, prioritize the work surface and selected record. The inspector may become an overlay; it must be reachable and dismissible by keyboard.
- At 390px and 320px, collapse the module sidebar, retain five keyboard-reachable module links, reflow candidate capacity under the candidate identity, and reduce the activity strip to truthful status plus one clear action. The inspector becomes a bottom sheet.
- No horizontal page overflow at 320px. Long names, evidence titles, and agent requests wrap or truncate with a way to inspect their full value.
- Use semantic headings, buttons, inputs, selected/pressed states, visible focus, and status announcements. Ensure keyboard selection, shortlist updates, tray opening/closing, and focus restoration.
- Honor `prefers-reduced-motion`. Motion may communicate a user-triggered state change; it must not be required to perceive status.

## Data and System Boundaries

- Reuse existing Preact/Wouter routes, shared shell, domain entities, evidence, and local-workflow patterns. Do not introduce React-only APIs, a new UI framework, a backend, or a new dependency for this design.
- Keep Person, Crew, Asset, Work, Institution, and Evidence distinct. Capabilities and capacity are claims with scope and provenance, not verification badges.
- Keep each demo's data source and store separate: Commons governance/signals, School Console drafts, Workbench applications/simulations, capacity drafts, and Records. Reuse existing fixtures and APIs; do not merge them into a synthetic shared dataset.
- Keep the illustrative capacity scenario isolated and visibly labeled; do not mix it into real profiles or silently mutate the existing people-network seed data.
- The matching view may project scenario records into candidate rows, but a fit reason must be traceable to an attribute/evidence source. Do not fabricate distances, availability, or source records as if observed.
- Keep UI-only filters in local component state unless shareable/bookmarkable filter behavior is deliberately added. Persistence must use the repository's existing explicit browser-local conventions and surface storage errors.
- In demo mode, keep Records on its existing demo fixtures/local Roll store; do not fabricate an accepted entry to make the view look populated. In configured mode, preserve the existing Records API behavior.
- Do not build an agent integration in this design phase. Expose a UI contract that future engine adapters can fulfill without letting the presentation layer bypass authorization.

## Non-Goals

- Rebuild existing modules from scratch, create a sixth primary module, or add a demo gallery.
- Add new workflows to Network or Intelligence; preserve their existing destinations and behavior.
- Add a freeform canvas, all-data graph, map-first layout, generic analytics dashboard, or assistant chat as a primary module.
- Add autonomous external actions, invisible background runs, unreviewable bulk writes, new authorization semantics, production credentials, or live integrations.
- Claim that every Workbench sidebar item, activity count, or run status works before its behavior and data source exist.

## Acceptance Criteria for the Implementation

1. Exactly five primary module destinations are present; the active sidebar contains only active-module views.
2. Rail icons have discoverable names, active-state semantics, keyboard focus, and module-consistent meaning.
3. The persistent strip appears in every module, reports the actual runtime/agent state and counts, opens a dismissible tray, and never fabricates activity.
4. Each workflow has a meaningful empty state; editable inputs have visible, recoverable validation; completed local actions have truthful success feedback; and data-source/storage errors are explicit.
5. Commons-to-Workbench and School-Console-to-Workbench transitions preserve source identifiers and do not mutate the source records.
6. Capacity matching supports search, evidence/proximity filters, explicit sort, selection, evidence inspection, reversible shortlist changes, and an empty state; shortlisted capacity flows into an editable, validated local draft.
7. Workbench opportunity/application/delivery states remain distinct. Any local authorization or acceptance state requires an explicit human action and is labeled demo-only; it never implies external contact, payment, or legally effective authorization.
8. Records evidence, acceptance, and revision details come from existing demo fixtures/local Roll entries or the configured Records API; no fabricated history is shown.
9. No provider, AI model, MCP, or autonomous engine action is wired in this slice. The disconnected command dock cannot submit or create a run.
10. Desktop layout is verified at 1440px; tablet at 768px; mobile at 390px and 320px. No horizontal overflow; inspectors, trays, and command dock states remain operable and dismissible.
11. Keyboard-only operation, focus restoration, screen-reader status updates, reduced-motion behavior, and text contrast are verified.
12. Run the existing `npm run build` and `npm run test:unit -- --run` gates after each implementation slice. Add targeted tests for each changed flow, route transitions, filtering, local storage failure, and state separation.

## Implementation Boundary

The first implementation slice is the **shared shell and route/state audit** across the five workflows; the next slices refine the existing local flows and add the capacity-match-to-draft path. Preserve working domain logic, use separate bounded commits, and verify each workflow visually and functionally before declaring the suite complete. Agent runs remain unavailable until an engine/permissions design is separately approved.
