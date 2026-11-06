# APT-LABS Engine-First Workspace Shell

**Status:** Approved design; awaiting spec review
**Date:** 2026-11-07
**Scope:** Workspace shell and the coordinator's capacity-matching-to-work-plan flow

## Decision

Use the **Field Instrument** visual direction and the **command dock + review tray** as the everyday operating model. A dedicated agent panel is an escalation surface for complex investigations, not a second primary shell.

The workspace should feel like an instrument for doing and inspecting work. Every persistent pane has one job:

1. **Module rail:** switch among Commons, Network, Workbench, Records, and Intelligence.
2. **Module sidebar:** navigate tasks and saved views within the active module only.
3. **Work surface:** inspect, compare, and change domain records.
4. **Context inspector:** inspect the selected record, relationships, and evidence.
5. **Engine activity strip:** understand active work and open a run or proposed change for review.
6. **Command dock:** issue a scoped request to the engine and inspect its typed proposals.

The rail icon, selected-module treatment, sidebar heading, and module accent must reinforce the same module. The sidebar must not repeat links to other rail modules.

## User and First Workflow

The first user is a coordinator assessing a reported need. The primary workflow is:

**Open need → compare relevant capacity → inspect a candidate and its evidence → add or remove a candidate from a shortlist → draft the work plan → record remaining checks.**

The demonstration uses clearly marked illustrative Kirinyaga records. Its purpose is to validate the product interaction, not assert that a real provider, need, location, capacity, or availability exists.

### Matching surface

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

## Navigation and Shell

### Module rail and sidebar

- Exactly five primary modules, in charter order: Commons, Network, Workbench, Records, Intelligence.
- Use coherent, semantically drawn line icons—not arbitrary glyphs. The selected icon uses the module's semantic accent, a visible selected indicator, and an accessible name. Provide a tooltip on hover and keyboard focus; do not make tooltips the only way to discover module names.
- The adjacent sidebar names the active module and exposes only its task navigation, scopes, filters, and saved views.
- In the Workbench matching view, the sidebar groups are task-based: work pipeline (Find capacity, Build a work plan, Review & authorize, Track delivery) and relevant saved views. These entries must route to real implemented views before they are presented as functional.

### Topbar

Show product identity, current workspace/module context, global search, and the current user affordance. Do not duplicate module navigation or add an environment switcher. Environment and storage state belong in the bottom status strip.

### Context inspector

The selected-record inspector is available on wide screens without displacing the list's main comparison task. On narrow screens, it opens as a dismissible bottom sheet after an explicit record selection. Closing it returns focus to the selected record control.

### Persistent engine activity strip

The bottom strip spans the workspace on all five modules and shows:

- The truthful workspace/storage context (for example, **Local demo**).
- Engine/run state when present.
- Active run or proposal count.
- A concise **Ask engine** command affordance.
- A review affordance when a proposal is waiting.

With no active work, the strip remains quiet and reports the engine's actual available state; it must not show simulated “online,” synced, or running states. Selecting an activity opens its run/review tray without navigating away from the work surface. A tray can be dismissed and reopened from the strip.

## Agent and Engine Contract

The agent is an operator of scoped engine capabilities, not a source of authority. A coordinator issues a request in the command dock. The run is represented in the strip and review tray with these explicit states:

`queued → running → completed | blocked | failed | cancelled`

A run view exposes meaningful steps and outcomes: records read, sources considered, assumptions, checks, unresolved gaps, errors, and proposed actions. Do not render a successful result if the underlying operation failed or returned incomplete evidence.

An agent proposal is a structured, inspectable change set containing:

- Target record identifiers and the requested action.
- The exact proposed change or before/after values.
- Evidence/source references and provenance.
- Assumptions and unresolved checks.
- Whether the change is reversible and what permission/actor is required.
- A review state, distinct from applied or authorized state.

The user may inspect, edit, apply a permitted reversible draft change, or dismiss it. The review tray is not a chat transcript. The first demonstration may show deterministic illustrative engine output, but it must label it as such and must not claim a real model run.

The agent cannot contact a provider, represent consent, commit capacity, authorize or execute work, accept delivery, or settle payment. Those transitions require their own explicit, permission-checked action by an authorized actor. A proposal, human review, authorization, execution, acceptance, and settlement remain distinct states.

Every completed run, proposal decision, and applied local change is attributable and inspectable in the relevant activity/history surface. If local demo storage is unavailable or a write fails, report the error and keep the draft available for recovery; do not show a success state.

This UI contract does not define an LLM vendor, MCP set, backend API, authorization implementation, or production run scheduler. Those require separate designs and permission/security review.

## Visual System

- Preserve the approved dark green-black base with bone primary text and moss secondary text.
- Use teal for evidence/canonical information, lime for proposals and active draft work, amber for checks/gaps, and coral for risk/blocked states. Pair color with text/icons and sufficient contrast.
- Use the existing serif/sans/mono role hierarchy. Reserve mono for compact operational metadata rather than body copy.
- Prefer aligned text, rules, compact rows, and functional inspectors over repeated rounded cards, decorative maps, metric walls, gradients, or company-explainer content.
- Every displayed measure must affect a real decision and identify its unit and provenance. Do not use a match score as a substitute for evidence.
- The visual signature belongs in spacing, typography, linework, state grammar, and meaningful domain glyphs; do not add decorative Africa imagery or surveillance/defense styling.

## Responsive and Accessible Behavior

- At 1440px, preserve simultaneous visibility of the five-icon rail, module sidebar, main work surface, selected-record inspector, and persistent engine strip.
- At tablet widths, prioritize the work surface and selected record. The inspector may become an overlay; it must be reachable and dismissible by keyboard.
- At 390px and 320px, collapse the module sidebar, retain five keyboard-reachable module links, reflow candidate capacity under the candidate identity, and reduce the activity strip to truthful status plus one clear action. The inspector becomes a bottom sheet.
- No horizontal page overflow at 320px. Long names, evidence titles, and agent requests wrap or truncate with a way to inspect their full value.
- Use semantic headings, buttons, inputs, selected/pressed states, visible focus, and status announcements. Ensure keyboard selection, shortlist updates, tray opening/closing, and focus restoration.
- Honor `prefers-reduced-motion`. Motion may communicate a user-triggered state change; it must not be required to perceive status.

## Data and System Boundaries

- Reuse existing Preact/Wouter routes, shared shell, domain entities, evidence, and local-workflow patterns. Do not introduce React-only APIs, a new UI framework, a backend, or a new dependency for this design.
- Keep Person, Crew, Asset, Work, Institution, and Evidence distinct. Capabilities and capacity are claims with scope and provenance, not verification badges.
- Use one shared scenario dataset for successive local demos. Keep the synthetic scenario isolated and visibly labeled; do not mix it into real profiles or silently mutate the existing people-network seed data.
- The matching view may project existing records into candidate rows, but a match reason must be traceable to real attributes/evidence in the scenario. Do not fabricate distances, availability, or source records as if observed.
- Keep UI-only filters in local component state unless shareable/bookmarkable filter behavior is deliberately added. Persistence must use the repository's existing explicit browser-local conventions and surface storage errors.
- Do not build an agent integration in this design phase. Expose a UI contract that future engine adapters can fulfill without letting the presentation layer bypass authorization.

## Non-Goals

- Rebuild all five modules or implement the Kirinyaga workflow in production code as part of this design approval.
- Add a freeform canvas, all-data graph, map-first layout, generic analytics dashboard, or assistant chat as a primary module.
- Add autonomous external actions, invisible background runs, unreviewable bulk writes, new authorization semantics, production credentials, or live integrations.
- Claim that every Workbench sidebar item, activity count, or run status works before its behavior and data source exist.

## Acceptance Criteria for a Later Implementation

1. Exactly five primary module destinations are present; the active sidebar contains only active-module views.
2. Rail icons have discoverable names, active-state semantics, keyboard focus, and module-consistent meaning.
3. The bottom activity strip appears in every module, reports only truthful storage/run state, opens a dismissible review tray, and has defined empty, queued, running, completed, blocked, failed, and cancelled states.
4. The matching workflow supports search, evidence/proximity filters, explicit sort, selection, evidence inspection, shortlist add/remove, and an empty result state.
5. Shortlisted records flow into an editable work draft; invalid input blocks saving with visible, recoverable errors.
6. A local demo draft is labeled local and never presented as authorized, executed, or externally persisted.
7. Agent changes are inspectable proposals. Consequential actions stay behind distinct authorized transitions and cannot be triggered by merely selecting or reviewing a proposal.
8. Desktop layout is verified at 1440px; tablet behavior at 768px; mobile behavior at 390px and 320px. No horizontal overflow; inspector and review tray remain operable and dismissible.
9. Keyboard-only operation, focus restoration, screen-reader status updates, reduced-motion behavior, and text contrast are verified.
10. Run the existing `npm run build` and `npm run test:unit -- --run` gates after each implementation slice. Add targeted tests for filter/state transitions, local draft validation/storage failure, and proposal gating as those behaviors are implemented.

## Implementation Boundary

The first implementation slice after approval is the **Workbench matching → shortlist → local draft** flow using the shared illustrative scenario and the approved shell behavior. The shell's module-specific navigation and persistent activity strip should be implemented only to the extent needed for this slice, with explicit component boundaries so the remaining modules can adopt the same contract later. Agent runs remain deterministic, local, and clearly illustrative until an engine/permissions design is separately approved.
