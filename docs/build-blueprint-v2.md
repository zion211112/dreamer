# APT-LABS — Build Blueprint v2

File-level build plan for adding 5 new modules to the APT-LABS workspace: **Tenders, Failed Projects, Investment, University, High School.**

**Status:** PLANNED (not implemented). No build commands have been run. No files have been committed. No branch has been created.

**Read this before touching code:** hour 1 ships a localStorage demo mode. A Supabase-backed production backend is hour 2+. Everything here is scoped to the demo prototype unless explicitly marked production.

Evidence label: **PLANNED**.

---

## Scope — five new modules

| Module | Role | Evidence label |
|--------|------|----------------|
| **Tenders** | Transparent government/institutional tender listings | PLANNED |
| **Failed Projects** | Audit and reclaim abandoned public works | PLANNED |
| **Investment** | Users fund projects posted by founders/innovators | PLANNED |
| **University** | Universities post research needs, host students, issue credentials | PLANNED |
| **High School** | Students learn productive skills on community projects | PLANNED |

These sit alongside the existing 9 workspace modules → 14 total.

---

## Phase model

**Hour 1 — Demo prototype (localStorage, browser-local):**
- All 5 new lib files implemented and type-checked
- All 6 new page files compile under Vite
- Matching engine works for all 5 modules
- Authz gates enforce correctly
- No backend, no persistence beyond localStorage, no multi-user concurrency
- Demo or synthetic data only — never presented as real

**Hour 2+ — Production backend (Supabase):**
- Deferred to hour 2+. Not in scope for this version.

**Never in this version:**
- Recognition tokens as tradable currency (charter A9)
- Public investment marketplace (regulated financial infrastructure required)
- Blockchain anchoring for all records (charter A8)
- Cross-border federation
- AI-generated work products (AI suggests; humans decide)

---

## New lib files (5)

| File | Exports | Purpose | Charter reference |
|------|---------|---------|-------------------|
| `src/lib/tenders.ts` | `postTender()`, `listTenders()`, `getTender()`, `matchTenderProviders()`, `findMissingTenders()` | Tender lifecycle: post, match, award | Commons + Work + Government audit |
| `src/lib/failed-projects.ts` | `registerFailedProject()`, `listFailedProjects()`, `claimProject()`, `postReclamationCommitment()`, `listClaims()` | Register abandoned works; graduates claim and fix | FailedProjects + Commitment Journey |
| `src/lib/investment.ts` | `pledgeInvestment()`, `releaseInvestment()`, `listPledges()`, `investmentLedger()` | Pledge funds on verified outcomes | Value + Commitment Journey |
| `src/lib/university-participation.ts` | `registerUniversity()`, `postResearchNeed()`, `hostStudentProject()`, `listUniversities()`, `getUniversity()`, `listResearchNeeds()` | Institutional actor layer | Commons + Intelligence |
| `src/lib/highschool-program.ts` | `registerStudent()`, `joinBuildProgramme()`, `logContribution()`, `studentLedger()`, `listStudents()` | Student build programme | Commons + Workbench |

Existing (already written, not re-scoped here):
- `src/lib/government-audit.ts` — Government system audit intentions
- `src/lib/aptcoin-sbt.ts` — SBT-style attestation mint/revoke/verify
- `src/lib/record-envelope.ts`, `src/lib/commitment-journey.ts`, `src/lib/matching.ts`, `src/lib/asset-registry.ts`, `src/lib/authz.ts`, `src/lib/engine-agent.ts`

---

## New page files (6)

| File | Route | Module | Purpose |
|------|-------|--------|---------|
| `src/pages/workspace/Tenders.vue` | `/workspace/tenders` | Tenders | Browse tenders, post tender, match providers |
| `src/pages/workspace/FailedProjects.vue` | `/workspace/failed-projects` | Failed Projects | Browse abandoned works, claim reclamation |
| `src/pages/workspace/Investment.vue` | `/workspace/investment` | Investment | Browse ventures, pledge funds, track releases |
| `src/pages/workspace/UniversityPortal.vue` | `/workspace/university` | University | Post research needs, host student projects |
| `src/pages/workspace/HighSchoolHub.vue` | `/workspace/highschool` | High School | Register students, log contributions, view ledger |
| `src/pages/workspace/GovernmentAudit.vue` | `/workspace/government-audit` | Government Audit | Browse government systems, post audit intentions |

---

## Registry modifications (`src/shell/registry.ts`)

- Add `ModuleId` union entries: `tenders`, `failed-projects`, `investment`, `university`, `highschool`
- Add `IconId` union entries for each new module
- Add 5 `WorkspaceModule` entries with `pillar`, `primitive`, `subtitle`, `ctxNav`
- Update `moduleForPath` known map with the 5 new paths

---

## Agent intents modifications (`src/shell/agent-intents.ts`)

- Commons: `project:audit`, `community:vote`
- Network: `actor:register-university`, `actor:register-student`
- Value: `investment:pledge`, `investment:release`
- Proof: `attestation:mint`
- Intelligence: `intel:audit-match`
- New `AGENT_SPECS` for tenders, failed-projects, investment, university, highschool modules

---

## Verification gates

| Gate | Criterion | Status |
|------|-----------|--------|
| G1 | `tsc --noEmit` clean | Not run |
| G2 | Vitest suite green (existing 318/34 plus new tests) | Not run |
| G3 | New lib files pass strict type-check | Not run |
| G4 | New page files compile under Vite | Not run |
| G5 | Matching engine `matchNeeds` works for all 5 modules | Not run |
| G6 | Authz gates (`credential:issue`, `intention:write`, `investment:pledge`, etc.) enforce correctly | Not run |
| G7 | Evidence labels accurate: no PLANNED described as delivered | Not run |

---

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Demo data mistaken for real | Medium | High | Evidence labels on every page; demo banner visible |
| Unverified vendor claims | Low | High | Provider attribution marked UNKNOWN unless publicly reported |
| Investment pledges misread as securities | Low | High | Explicit "not a currency, not a security, not a marketplace" |
| Blockchain implied as core | Low | Medium | Attestations optional; blockchain never a prerequisite |
| Universal reputation score implied | Low | High | Explicitly prohibited (charter A8); no score computed |
| AI replacing human judgment | Medium | High | EngineAgent proposes; humans execute |

---

## Rollback criteria

Abort and revert if any of the following occur:

- G1–G7 all fail simultaneously
- Demo data is presented as real without evidence labels
- A specific vendor name is asserted as fact without public source
- Investment pledges are described as tradable or external
- Blockchain is described as required for participation

---

## Deferred items (not in this version)

| Item | Reason | Trigger for revisiting |
|------|--------|----------------------|
| Live Supabase backend | Demo mode (localStorage) ships first; production backend is hour 2+ | Hour 2 scope decision |
| Recognition tokens as tradable currency | Charter A9 — no assumed universal-value function | Charter amendment |
| Public investment marketplace | Would require regulated financial infrastructure | Regulatory compliance review |
| Blockchain anchoring for all records | Charter A8 — no sensitive personal data on public blockchain | Charter amendment |
| Cross-border federation | Single workspace first; country-specific rules come after | Multi-jurisdiction analysis |
| AI-generated work products | AI suggests, humans decide | Policy gate approval |
| Provider contact details / contract values / award dates | Not verifiable from public sources | Public source availability |
| Vendor verification program | Would require independent audit capacity | Audit capacity established |

---

## Role assignments

| Role | Responsibility | Charter constraint |
|------|---------------|-------------------|
| Founder | Posts ventures, raises investment pledges | Investment ≠ Donation ≠ Payment |
| Graduate | Claims failed projects, gains verified standing | Work via commitments, not opaque matching |
| Developer | Forks repo, deploys node, reviews evidence | No sensitive personal data on blockchain (A8) |
| Sociologist | Studies productive reality graph; exports audit trails | No universal reputation score (A8) |
| Institutional steward | Sees voted needs, verified outcomes by jurisdiction | Humans decide (A6); AI suggests only |
| Student (high school) | Learns skills via community projects | AI proposes; humans approve |
| University | Posts research needs, hosts students, issues credentials | AI suggests; humans decide |
| Admin | Platform governance; approves consequential verbs | Consequential verbs require explicit human approval |

---

## Engine agent scope

The `EngineAgent` (Context → Plan → Policy-gate → Execute → Trace) governs all new module verbs. It **proposes, never executes**. A human actor must approve every consequential action before the commit→execute→receipt flow runs.

---

## Documentation updates

| File | Change |
|------|--------|
| `AGENTS.md` | Add 5 new modules to module table; expand auth roles to include graduate/developer/sociologist/politician/student/university; add no-universal-reputation-score and no-blockchain-prerequisite notes |
| `docs/ontology.md` | Single source of truth — cross-reference here for all domain concepts |
| `docs/government-software-kenya.md` | Government system audit catalogue |
| `docs/ROLE_CARDS.md` | Add role cards for Community Steward, Student Participant, University Partner |

---

## What is NOT in this version

- No Supabase backend (demo mode only)
- No tradable recognition tokens
- No public investment marketplace
- No blockchain anchoring
- No cross-border federation
- No AI-generated work products
- No verified provider rankings or contract data
- No specific vendor names asserted as fact

---

*Last updated: 2026-11-21. Evidence label: PLANNED. Aligned with charter A1–A10 and decisions B1–B8.*