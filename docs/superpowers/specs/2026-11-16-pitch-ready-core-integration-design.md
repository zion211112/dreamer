# Pitch-Ready APT-LABS Core Integration

**Status:** Approved design
**Date:** 2026-11-16

## Context

APT-LABS is preparing for a mixed-audience pitch with a 5–7 minute product demo. The workspace already has Home and five productive modules—Commons, Network, Workbench, Records, and Intelligence—plus separate Kemetos1 and Benben OS prototypes. Core pages use the shared workspace layout and shell, but a pitch-ready walkthrough depends on coherent navigation and credible handoffs between the modules.

The demo should show one productive operating pattern across several sectors, not present a disconnected feature tour.

## Goals

- Make the APT-LABS core feel like one product from its Home entry through its five productive modules.
- Demonstrate a real operational arc: discover capacity or demand, connect actors and capabilities, coordinate work, inspect evidence, and surface reusable learning.
- Use workshop fabrication as the detailed example, with repair/apprenticeship and digital engineering as shorter portfolio examples.
- Keep records, actors, pilots, statuses, and evidence consistent and honestly represented.
- Remove only pitch-path friction and directly related duplication or stale product language.

## Product boundary

The pitch-facing product includes:

- Home at `/workspace`
- Commons
- Network
- Workbench
- Records
- Intelligence

Kemetos1, Benben OS, and Design Lab remain separate from this product path. Preserve their current code and routes; this work does not merge or delete those prototypes.

## Proposed experience

The live walkthrough starts at Home and follows the shared workspace navigation:

1. **Commons:** establish a real need, offer, or opportunity.
2. **Network:** show the relevant institution, people or crew, and capabilities.
3. **Workbench:** show the bounded undertaking, participants, deliverables, and work state.
4. **Records:** inspect the outcome and its supporting evidence.
5. **Intelligence:** close by showing how accumulated records can support future coordination.

The workshop example receives the full path. Repair/apprenticeship and digital engineering demonstrate that the same operating grammar applies to different work. The three examples must use existing records and relationships when those are genuinely linked. Do not invent handoffs, evidence, completion, acceptance, or other states to make the walkthrough appear complete. Hydro is excluded from the live story.

## Technical approach

- Retain the existing shared `WorkspaceLayout` and `WorkspaceShell`; do not combine all modules into one page or introduce another app shell.
- Keep canonical `/workspace` routes and module navigation aligned. Fix only route, label, and navigation inconsistencies that affect the core product path.
- Connect existing entities, pilots, and records through explicit, real links. Reuse existing identifiers and data sources where valid; make any missing relationship visible instead of simulating it.
- Preserve browser-local demo behavior and the Supabase fallback. Do not add a backend, change persistence architecture, or introduce a schema migration.
- Use the smallest changes that make the agreed walkthrough reliable. Avoid unrelated redesign and repo-wide dead-code removal.

## Cleanup boundary

In scope:

- Home entry and navigation among the core modules.
- The cross-module handoffs used by the demo.
- Demo data and behavior directly needed to make the three examples coherent.
- Focused tests and directly related product or architecture documentation.
- Stale route labels or comments that misstate the active core module structure.

Out of scope:

- Merging Kemetos1 or Benben OS into APT-LABS.
- Deleting or reorganizing archives and unrelated historical material.
- A repo-wide refactor, dead-code sweep, or visual redesign.
- Replacing the current persistence model or rebuilding the data layer.
- Presenting simulated or unverified behavior as live product functionality.

## Acceptance criteria

- A presenter can start at `/workspace` and reach each core module through working, consistent navigation.
- The main demo path has no dead ends and the selected people, capabilities, pilots, records, statuses, and evidence agree across module boundaries.
- The workshop path is demonstrable end to end; repair/apprenticeship and digital engineering are available as credible shorter examples.
- No invented evidence, false completion states, or misleading claims are introduced.
- The pitch path can be rehearsed in 5–7 minutes.
- Existing build and unit tests pass, with focused coverage for any new or corrected route/data handoff behavior.

## Validation

1. Run `npm run build`.
2. Run `npm run test:unit -- --run`.
3. Add or update focused tests for any changed cross-module behavior.
4. Use the existing browser workflow to smoke-test the walkthrough from `/workspace`, including module navigation, linked records, and the three selected examples.
5. Rehearse the walkthrough against the 5–7 minute target and verify that all claims shown are supported by the displayed product state.
6. Update `PRODUCT.md` or `docs/architecture.md` only where the implemented behavior or boundaries require it.

## Risks and mitigations

- **Scope expands into a general cleanup:** keep changes limited to the agreed core routes and demo handoffs; leave unrelated cleanup for a separate task.
- **Demo state diverges between modules:** use existing identifiers and inspect the complete path in the browser, not just isolated page tests.
- **Local persistence makes repeated demos inconsistent:** verify the walkthrough from the actual browser state and document any necessary reset/setup step rather than silently masking persisted state.
- **A sector example has incomplete data:** show only what the product can substantiate and keep the example brief; do not fabricate missing connections.

## Decisions recorded

- Audience: mixed.
- Demo duration: 5–7 minutes.
- Product scope: APT-LABS core only; keep Kemetos1 and Benben OS separate.
- Portfolio examples: workshop fabrication, repair/apprenticeship, digital engineering.
- Narrative depth: workshop end to end; the other two as shorter examples.
- Hydro: excluded from the pitch walkthrough.
