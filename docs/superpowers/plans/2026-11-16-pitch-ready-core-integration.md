# Pitch-Ready APT-LABS Core Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the APT-LABS core a coherent, honest 5–7 minute demo from Commons through Workbench, Network, Records, and Intelligence.

**Architecture:** Keep the existing shared workspace shell and local-first state. Repair the actual Commons-to-Workbench and Workbench-to-Roll handoffs, then align navigation and illustrative fixtures without merging modules or prototypes.

**Tech Stack:** Preact, TypeScript, Wouter, Vitest; manual browser verification for the pitch path.

**Spec:** [2026-11-16-pitch-ready-core-integration-design.md](../specs/2026-11-16-pitch-ready-core-integration-design.md)

## Global Constraints

- Preserve browser-local demo behavior and the Supabase fallback.
- Do not add a backend, change persistence architecture, or introduce a schema migration.
- Kemetos1, Benben OS, and Design Lab remain separate from this product path.
- Do not invent handoffs, evidence, completion, acceptance, or other states to make the walkthrough appear complete.
- The pitch path can be rehearsed in 5–7 minutes.
- Hydro is excluded from the live story.

## Review Focus

- An unapproved Commons proposal must not create Workbench work; an approved proposal must retain its proposal and optional signal references. Test in Task 1.
- An unpriced proposal must not appear as `KES 0` or inflate capital totals. Test in Task 1.
- A named crew member without a Network entity ID must not receive a generated identity or be accepted. Test in Task 2.
- A new Roll entry with an acceptance timestamp must not display “Not recorded”; explicit known non-accepted outcomes must remain unchanged. Test in Task 2.
- Portfolio fixtures must remain visibly synthetic and match the three selected examples. Test in Task 3.

---

## File Structure

- Modify `src/modules/workbench/data.ts` — proposal conversion, nullable unpriced capital, and shared null-safe totals.
- Modify `src/pages/workspace/Commons.tsx` — send approved proposals to the generic Open pilot without inventing a budget.
- Modify `src/modules/workbench/pages/Home.tsx`, `src/modules/workbench/pages/Pilot.tsx`, `src/lib/intelligence.ts`, and `src/modules/kemetos1/lib/coordinator.ts` — render and aggregate unpriced values safely at existing call sites.
- Create `src/modules/workbench/data.test.ts` — proposal conversion and unpriced-total tests.
- Create `src/modules/workbench/roll-participants.ts` and `src/modules/workbench/roll-participants.test.ts` — map selected Network crew to Roll participants without synthetic IDs.
- Modify `src/modules/workbench/pages/Pilot.tsx` and create `src/lib/roll-sbt-bridge.test.ts` — preserve real participant and undertaking IDs through acceptance.
- Create `src/lib/records-view.ts` and `src/lib/records-view.test.ts`; modify `src/pages/workspace/Records.tsx` — resolve outcome from actual acceptance while retaining explicit legacy outcomes.
- Modify `src/lib/studio-navigation.ts`, `src/lib/studio-navigation.test.ts`, and `src/App.tsx` — align core module naming and route comment.
- Modify `src/lib/db/roll.ts` and `src/lib/db/roll.test.ts` — make the automatic local portfolio match workshop, repair/apprenticeship, and digital engineering.
- Modify `src/lib/demo-seed.ts` and `src/modules/workbench/data.ts` — describe built-in records and terms as local illustrative demo data.
- Update the relevant demo-seed summary in `docs/architecture.md`.

## Task 1: Connect Commons Proposals to an Honest Workbench Draft

**Files:**
- Modify: `src/modules/workbench/data.ts`
- Modify: `src/pages/workspace/Commons.tsx`
- Modify: `src/modules/workbench/pages/Home.tsx`
- Modify: `src/modules/workbench/pages/Pilot.tsx`
- Modify: `src/lib/intelligence.ts`
- Modify: `src/modules/kemetos1/lib/coordinator.ts`
- Test: `src/modules/workbench/data.test.ts`

**Interfaces:**
- Produces `createUndertakingFromProposal(proposal: CommonsProposal, actor: string, location: string): WorkItem | undefined`.
- Produces `totalCommittedCapital(items: readonly WorkItem[]): number`; null amounts contribute zero without being displayed as a commitment.
- `Capital.financial` becomes `number | null`; `null` means no amount has been set.
- The resulting WorkItem uses the existing `'open'` pilot key and retains `sourceProposalId` and optional `sourceSignalId`.

- [ ] **Step 1: Write failing tests** in `src/modules/workbench/data.test.ts` for an approved proposal producing an Open-pilot WorkItem with both trace references and `financial: null`, an unapproved proposal returning `undefined`, and `totalCommittedCapital` ignoring null values while summing numeric values. Stub `localStorage` before dynamically importing `data.ts`, whose module initialization persists WorkItems.
- [ ] **Step 2: Run** `npm run test:unit -- --run src/modules/workbench/data.test.ts`. Expected: FAIL because the helper still requires a pilot and amount and returns a priced item.
- [ ] **Step 3: Implement** the interfaces above; update the saved WorkItem guard to accept only a finite number or `null`; remove the caller’s hard-coded `benbenos` pilot and `6000` KES; navigate to `/workspace/workbench/open`.
- [ ] **Step 4: Use `totalCommittedCapital`** in Workbench home totals and Intelligence forecasts. Render null as “Not priced” in Workbench details and Kemetos1's existing coordinator context; preserve numeric amounts unchanged.
- [ ] **Step 5: Run** `npm run test:unit -- --run src/modules/workbench/data.test.ts`. Expected: PASS, including a null-capital total case.
- [ ] **Step 6: Commit** the tested Commons-to-Workbench handoff.

## Task 2: Preserve Network Identity and Correct Roll Outcomes

**Files:**
- Create: `src/modules/workbench/roll-participants.ts`
- Create: `src/modules/workbench/roll-participants.test.ts`
- Modify: `src/modules/workbench/pages/Pilot.tsx`
- Create: `src/lib/roll-sbt-bridge.test.ts`
- Create: `src/lib/records-view.ts`
- Create: `src/lib/records-view.test.ts`
- Modify: `src/pages/workspace/Records.tsx`

**Interfaces:**
- Produces `crewToRollParticipants(crew: Crew): RollParticipantInput[]`. Skip empty or `—` roles; throw an explicit error if a named role lacks its Network entity ID.
- Produces `getRollOutcome(entry: Pick<RollEntry, 'id' | 'acceptance'>): RollOutcome`. Existing explicit outcome overrides remain; otherwise a non-empty `accepted_at` resolves to accepted.

- [ ] **Step 1: Write failing tests** for selected Network IDs being preserved, missing IDs throwing instead of generating IDs, and empty roles being omitted.
- [ ] **Step 2: Run** `npm run test:unit -- --run src/modules/workbench/roll-participants.test.ts`. Expected: FAIL because no tested conversion helper exists.
- [ ] **Step 3: Implement** the helper and use it in `Pilot.tsx`; remove the `person-${itemId}-${role}` fallback. Keep the existing visible acceptance error path.
- [ ] **Step 4: Write failing Roll outcome tests** for an accepted entry with an unknown ID, an entry without an acceptance timestamp, and an explicit legacy outcome override.
- [ ] **Step 5: Implement** `getRollOutcome` and use it in `Records.tsx`, preserving existing explicit outcomes.
- [ ] **Step 6: Add a bridge test** showing `finalizeAcceptedLocalWork` preserves the undertaking ID and selected Network person IDs in the Roll entry and resulting attestations.
- [ ] **Step 7: Run** `npm run test:unit -- --run src/modules/workbench/roll-participants.test.ts src/lib/records-view.test.ts src/lib/roll-sbt-bridge.test.ts`. Expected: PASS; no generated identities and accepted new Roll entries render as accepted.
- [ ] **Step 8: Commit** the identity and Records integration.

## Task 3: Align the Pitch Vocabulary and Portfolio

**Files:**
- Modify: `src/lib/studio-navigation.ts`
- Modify: `src/lib/studio-navigation.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/modules/workbench/pages/Home.tsx`
- Modify: `src/modules/workbench/data.ts`
- Modify: `src/lib/demo-seed.ts`
- Modify: `src/lib/db/roll.ts`
- Modify: `src/lib/db/roll.test.ts`
- Modify: `docs/architecture.md`

- [ ] **Step 1: Update the navigation test** to expect the productive module name “Records,” not “The Roll”; run `npm run test:unit -- --run src/lib/studio-navigation.test.ts` and confirm it fails.
- [ ] **Step 2: Align navigation and route language** with Home, Commons, Network, Workbench, Records, and Intelligence; replace the stale “New 5-module routes” comment in `App.tsx`.
- [ ] **Step 3: Replace unsupported Workbench claims** (“real rates, real stewards, real work”) with concise local-demo wording. Label metrics “Illustrative metrics,” capital “Illustrative capital,” and undertakings “Example undertakings”; explicitly mark lane states as demo examples and terms as illustrative. Do not change unrelated Workbench behavior.
- [ ] **Step 4: Correct the seed description** so `demo-seed.ts` describes its scenarios and browser-console helper as synthetic local demo data, not real operational records.
- [ ] **Step 5: Update the automatic Roll demo fixtures** to show the three selected examples—workshop fabrication, repair/apprenticeship, and digital engineering—with explicit `DEMO`/`Example` language and synthetic participants/evidence. Keep hydro out of this pitch portfolio; do not remove its unrelated pilot data.
- [ ] **Step 6: Update `roll.test.ts`** to assert the three portfolio examples remain visibly synthetic and preserve their evidence-layer coverage.
- [ ] **Step 7: Update `docs/architecture.md`** to list the five current demo seed scenarios and identify them as synthetic local fixtures, without calling them operational records.
- [ ] **Step 8: Run** `npm run test:unit -- --run src/lib/studio-navigation.test.ts src/lib/db/roll.test.ts`. Expected: PASS.
- [ ] **Step 9: Commit** the pitch vocabulary and portfolio updates.

## Final Verification

- [ ] Run `npm run build`. Expected: TypeScript and Vite build both pass.
- [ ] Run `npm run test:unit -- --run`. Expected: the complete unit suite passes.
- [ ] In the browser, start at `/workspace`; verify the six core destinations and confirm the prototypes are not part of the pitch path.
- [ ] Walk the Commons proposal into `/workspace/workbench/open`; verify no assumed amount is shown.
- [ ] Assign crew from Network, advance the existing Workbench gates, and accept only after real Network identities are selected.
- [ ] In Records, verify the newly created Roll entry is accepted and retains the same undertaking and participant IDs.
- [ ] In Intelligence, verify learning is derived from the accepted Roll entry and recommendations remain advisory.
- [ ] Show the workshop path and the repair/apprenticeship and digital engineering examples; confirm each is labeled as demo/example data and rehearse within 5–7 minutes.
- [ ] Repeat the walkthrough with existing local persistence; if a reset/setup step is necessary, document the safe, specific step without clearing unrelated browser data.
