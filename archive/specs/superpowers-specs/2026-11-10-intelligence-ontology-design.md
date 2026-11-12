# APT-LABS Intelligence — Lean Ontology & Design Directions

**Date:** 2026-11-10
**Status:** Proposed for review — approve or tweak
**Scope:** Intelligence module only — not the workspace shell, not Records, not the Workbench pilot lanes.

## Why

APT-LABS makes fragmented productive capacity visible. Intelligence is the module that interprets relationships across identity, credentials, productive activity, institutional records, and economic interactions — without collapsing them into one score, one ledger, or one token.

The three pillars (APT Passport / APT Coin / Intelligence Engine) must be independently governed even though they share one environment. This document distills a lean abstract ontology every other module — especially the five pilot lanes — can build upon.

## The ontology

Three pillars, one relationship:

**Identity → Contribution → Attestation → Economic interaction**

Each transition has its own rules; none is automatic.

### Pillar 1 — APT Passport (attestation / SBT-style)

**Primary object:** the attestation — a bounded, scoped claim about a participant's productive reality.

Fields: `id`, `subject`, `issuer`, `claim`, `scope`, `evidence`, `issuedAt`, `status`, `consent`, `expiresAt?`, `revocationReason?`, `portable`.

- A contribution credential is **not** a universal reputation score.
- Possessing a credential does **not** automatically grant authority, employment, credit, or ownership.
- Credentials are **portable** — participants retain and present them; they are not captive to APT-LABS.
- Issuers retain responsibility for their attestations.

### Pillar 2 — APT Coin (economic instrument / scenario)

**Primary object:** the economic instrument — a defined arrangement for economic interaction between verified productive nodes.

Fields: `id`, `purpose`, `issuer`, `terms`, `lifecycle`, `participants`, `settlementRules`.

- Conditional: purpose is **undecided** until a real coordination problem is evidenced that existing money, contracts, credit, or accounting cannot address.
- **Not** balances, transfers, token rewards, wages, or coin-gated access.
- **Not** a measure of human worth, a participation badge, or a speculative retail token.
- Instrument type (unit of account / medium of exchange / credit / claim representation / no token) remains an open decision.

### Pillar 3 — Intelligence Engine (finding / assessment)

**Primary object:** the finding — a structured, evidence-backed assessment of productive capacity and execution risk.

Fields: `id`, `subject`, `scope`, `evidenceBase`, `assessment`, `limitations`, `authorizedDecisionMaker`, `status`, `issuedAt`.

- The engine interprets relationships; **the authorized financing party makes the capital deployment decision.**
- Limitations are explicit — what a finding does not establish is stated.
- Evidence base references attestations, roll entries, obligations — never flattens them into one status.

### Boundaries (what Intelligence does not do)

- Does **not** custody credentials — participants present them.
- Does **not** issue coin or hold balances.
- Does **not** make capital decisions.
- Does **not** create universal reputation scores.
- Does **not** require coin ownership to discover work, participate, or receive an optional attestation.

## How the five pilots build on it

Each pilot lane (Benbenos, Kemetos, Mini Hydro, Mwea Animation Box, Open) carries work items at gates, with evidence layers (`public` / `participant` / `restricted`), capital conditions, and crew roles (`anchor` / `builder` / `apprentice`).

Intelligence provides, per undertaking (the shared reference across modules):

1. **Attestations about crew roles** — an Anchor's sign-off authority, a Builder's execution record, an Apprentice's learning contribution — scoped, portable, consent-based.
2. **Economic scenarios** — capital release conditions per pilot (e.g. "KES 48,000 for Thiba canal lining, released on community sign-off + water flow check") modeled as instruments, not balances.
3. **Findings per undertaking** — readiness assessment at each gate: what evidence is missing, who holds the key, what blocks crossing.

The three independent flows (delivery, financial settlement, contribution/recognition) keep their own lifecycles; Intelligence links them through the undertaking ID without collapsing them.

## Design directions

### Option A — Cross-module lens (registries + verification)

Intelligence exists as a type library and read-only registries that other modules reference. No dedicated Intelligence UI beyond the coin-lab research page. Pilots surface attestation chips and economic-scenario chips within their own lanes.

- **Visual:** lean ledger style — mono readouts, ringed evidence markers, semantic state colors (teal canon / lime proposed / coral risk / amber caution).
- **Interaction:** read-only reference; pilots read attestation/instrument data inline in their own lanes.
- **Best for:** smallest change that ships; keeps Intelligence strictly scoped.

### Option B — Dedicated hub (three-pillar page)

A dedicated Intelligence page with three pillar panels: Passport (attestation registry), Coin (economic scenarios), Engine (findings/assessments). Pilots link to Intelligence for per-undertaking findings.

- **Visual:** Signature Dark Instrument — deep green-black `#0A0F0C`, surveyor 24px grid, serif record names (Georgia), instrument readouts (JetBrains Mono), fork glyph as identity mark.
- **Interaction:** three pillars as navigable sections; finding issuance with limitations visible; honest research-only labeling.
- **Best for:** gives Intelligence a real, coherent home; factory-ready types pilots can import.

### Option C — Pilot-scoped findings surface

The Intelligence page reads pilot work items and produces per-undertaking findings (gate readiness, evidence gaps, key-holder) displayed on the Intelligence page. Pilots remain unchanged; Intelligence observes and assesses.

- **Visual:** gate-threshold cards per pilot undertaking; blocking evidence listed; key-holder named.
- **Interaction:** select a pilot / undertaking → see its finding, limitations, and what is needed to cross the gate.
- **Best for:** most immediately useful to stewards; still Intelligence-module only (does not touch Workbench).

## Recommendation

**Option B**, built on Option A's type foundation, with Option C's per-pilot findings as the Engine's first content. This gives Intelligence a coherent home (B), keeps the ontology lean and importable by pilots (A), and delivers pilot-relevant findings (C) without touching Workbench or the shell.

## Integration requirements & known conflicts

- Intelligence imports nothing from Workbench, Records, or the shell at runtime — types only, no coupling.
- Does not modify `WorkspaceShell.tsx`, `StudioNavigation.tsx`, or `App.tsx` routes — shell untouched per scope.
- `sbt-attestations.ts` is currently deleted on this branch; the intelligence types are self-contained and do not import it.
- Preconditions for operational Intelligence UI (unified cross-module event stream, authority model for matching/forecasting, matching engine with evidence trails, forecasting baseline, graph analysis) remain unmet; the page stays research-only and honest — no fake functionality.
