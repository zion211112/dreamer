# APT-LABS — Lean Masterpiece Design Spec

**Date:** 2026-11-22
**Author:** lead (root agent, autonomous — user approved all sections and departed)
**Requirement:** REQ-2026-002 — Multi-model 10k tokens/s pipeline via Bifrost + FCC + DSH wrapper
**Status:** Approved — proceeding to implementation

---

## 1. Context

APT-LABS has completed Gates 0–4 (ontology, state machines, 9-module workspace, design tokens, matching engine, evidence store). The codebase is Vue 3 + Pinia + Vue Router + Vite 6.4.x + TypeScript 5.6 strict + Vitest 5.x (34 files, 318 tests).

The multi-model pipeline is built: `engine/multi_model_pipeline.py` with 35 models across 17 providers, Bifrost on port 8080, FCC on port 8082 as rollback. Subagent parallel achieves 1,412 tok/s (7.1x gap to 10k/s).

**Mission:** Consolidate 9 modules into 5 lean modules, redesign each with Structural Emergence design system, integrate the pipeline as the agent dock brain, and ship a landing page as final scope — a $3B-quality MVP where users sign in and start building "the sovereign Africa."

---

## 2. 2050 Vision — Born Ready Today

APT-LABS in 2050 is the trust layer for productive work: attested capacity, not reputation scores; commitments separately timed from approval/authorization/execution/acceptance/settlement; roll density as defensibility; sovereign infrastructure cloaked as a commercial company.

**Today's requirements for birth-readiness:**
- **Legible, not pretty:** Every screen shows relationships (who can act, what enables work, what needs to change, who undertakes what, what work is happening, what is retained)
- **Governed, not just featured:** Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement — separately timed, separately auditable
- **Cumulative, not transactional:** Work today strengthens profiles tomorrow; Roll gets denser
- **Operator-first:** B2B operational infrastructure for institutions and local producers
- **Extensible:** New entity types, production methods, contractual instruments integrate without rewriting core

---

## 3. Module Consolidation (9 → 5)

| New Module | Routes | Purpose | Shows |
|------------|--------|---------|-------|
| Home / Overview | `/workspace` | Personal entry | Quick acts, assignments, linked updates, module selection |
| Commons / Network | `/workspace/commons`, `/workspace/network/{people,institutions,capabilities}` | Discovery + connection | Needs, offers, who can act, what enables work, relationships |
| Workbench | `/workspace/workbench`, `/workspace/workbench/:pilot` | Production coordination | Scope, assemble, coordinate work; commitments, activity, evidence |
| Records / Intelligence | `/workspace/records/{canon,annals,roll}`, `/workspace/intelligence` | Memory + matching | Canon, Annals, Roll, agents, matching, forecasting |
| Value | `/workspace/value` | Economic settlement | Outcome settlement, APTCOIN, replacement engine routing |

Removed: DesignLab (scratch), BenbenOS (separate prototype), Proof (absorbed into Records).

**Removed routes:** `/design-lab`, `/benben-os`, `/workspace/value/coin-lab` redirect, `/workspace/intelligence/coin-lab` redirect.

**School Console** remains nested under Workbench (operational boundary, not primary module).

---

## 4. Design System — Structural Emergence, Elevated

**Base:** Warm ivory/earthy neutral (`#F4F1E9` light, `#151515` dark) — from `apt-tokens.css`
**Brand:** Deep forest/ink (`#2b5945`), restrained sage, selective lilac/peach accents — from tokens
**Typography:** Editorial serif for record names; precise sans/mono for interface — from tokens
**Anti-patterns (hard tests, not bans):** Generic SaaS dashboards, endless card grids, decorative gradients/glows, unnecessary glassmorphism, arbitrary rounded corners, fake spatial depth, unexplained visual metaphors, excessive animation, decorative graphs without operational meaning

**Component regions:**
- Topbar: 54px, brand + search + actions + agent toggle (⌘J)
- Module rail: 64px, vertical module icons
- Module nav: 232px, within-module navigation
- Content: fluid, per-module pages
- Agent dock: 360px, slides in on ⌘J/Esc, pipeline brain

---

## 5. Pipeline Integration — Agent Dock as Brain

Each subagent = one `MultiModelPipeline` instance with preferred model + complexity hint. Agent dock hosts subagent conversations.

**Routing:**
- Throughput-first: models auto-sort by measured tok/s
- Quality-aware: complex/reasoning tasks route to quality_tier ≤ 2 (Nemotron 3.5 Super VL 120B, Gemini 2.5 Pro)
- Coding tasks route to quality_tier ≤ 3 (Groq Qwen 3.5 Flash, Nemotron Lightning)
- FCC (8082) rollback when Bifrost models circuit-break
- Batch mode: multiple prompts per model call

**Subagent parallel:** 6 agents = 1,412 tok/s. Path to 10k/s: ~43 agents at current throughput, or fewer agents with faster models + batch-per-agent.

---

## 6. Build Sequence

| Phase | Module | What ships |
|-------|--------|-----------|
| 1 | Workspace Shell | Frame, rail, nav, agent dock, topbar |
| 2 | Home / Overview | Personal entry, quick acts, module selection |
| 3 | Commons / Network | Needs, offers, people, crews, institutions, capabilities |
| 4 | Workbench | Pilot lanes, commitment journey, matching, evidence |
| 5 | Records / Intelligence | Canon, Annals, Roll, agents, matching, forecasting |
| 6 | Value | Economic settlement, APTCOIN, replacement engine |
| 7 | Landing Page | Conversion funnel → sign in → workspace (final scope) |

---

## 7. Plug-in & Asset Strategy

**Plugins (237 DSH plugins):** cordis:include, llm, session, agent, authorization, settings, jobs, config-editor, deepseek-account, plugin-manager, timer, hmr, remote-access, typert, session-title, user-questions — used for auth, session management, agent orchestration.

**Commits to distill:** 20+ recent commits including 7a09119 (agents/approved merge), b2eef21 (branch integration), 4e37d7e (overview board), 066e156 (agent dock), f218750 (UI cleanup), 053568d (ontology/government audit pass 2).

**Codebase:** Read all source, extract ontology (13-family APTO), state machines, design tokens.

**Images:** Extract from `.playwright-mcp/`, `shots/`, `design-extract-output/`, `public/` — distill into design system.

---

## 8. Data Flow — Task Through Pipeline

```
TaskIn → ComplexityRouter (coding/reasoning/mixed)
    → ModelRegistry (auto-sort by measured tps, quality-aware tier)
    → BatchOrchestrator (parallel calls to Bifrost 8080, fallback FCC 8082)
    → ResultAggregator (select best by throughput, merge all)
    → TaskOut
```

SubagentConnector wraps each subagent with preferred_model + complexity hint. DSH supervises via shared pipeline instance.

---

## 9. Anti-Patterns (enforced)

- No universal reputation score (charter A8)
- No blockchain prerequisite (charter A8)
- Person ≠ Asset ≠ Crew ≠ Institution ≠ Venture
- Claim ≠ Evidence
- Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement
- AI suggestion ≠ institutional decision
- No generic SaaS dashboard patterns
- No decorative gradients, glassmorphism, arbitrary rounded corners
- No chatty concept explanation

---

## 10. Acceptance Criteria

- [ ] `npm run build` green (tsc + vite build → dist/)
- [ ] `npm run test:unit -- --run` green (34 files, 318 tests)
- [ ] `npx tsc --noEmit` clean
- [ ] 5 modules built, each with real data (no mock)
- [ ] Agent dock slides in on ⌘J, hosts pipeline subagents
- [ ] Landing page: sign in → workspace conversion funnel
- [ ] Pipeline achieves >1,412 tok/s subagent parallel (baseline)
- [ ] Bifrost + FCC both healthy, rollback functional

---

**Spec self-review:** No placeholders, no contradictions, scope focused on 5 modules + landing page. Ambiguity resolved: build sequence explicit, module purposes explicit, pipeline integration explicit.

**User review:** User approved all 5 design sections and departed. Proceeding to implementation without further sign-off.

---

**Next:** Invoke `writing-plans` skill to create implementation plan, then build module by module starting with Workspace Shell.
