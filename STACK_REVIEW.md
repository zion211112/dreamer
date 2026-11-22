# APT-LABS — Target Stack (God-Tier Re-baseline)

Status: TARGET / design-level. Supersedes the package list in `MIGRATION.md`.
Confirm the 3 unverified deps against install `bmf635vnq` before finalizing.
One-line thesis: **the framework is the least interesting part — the moat is the
typed core and the evidence spine.**

## Why this shape beats competitors
Competitors (Palantir-rent, n8n-wire, or any Vue/React-coupled app) ship
features. We ship a **platform** where the features are the boring part:

1. **Provable ontology** — every claim is *re-derived* by a deterministic core,
   not displayed. We prove; they render.
2. **Framework-free core** — we can swap the renderer without touching the
   genius. They can't move their domain.
3. **Agents as data** — a typed, schema-validated event *stream*, not a UI
   tree. It renders in the graph, the shell, a worker, and SSR.
4. **Design system as IP** — headless + tokens; ships fast, can't be skinned off.
5. **Ceiling, not floor** — zoneless + workers + dual graph backends; we don't
   cap at 10k nodes or 30fps.

## Layers (bottom-up, each a moat)

### L0 — Core (pure TS, the moat)
- `libs/ontology`: entities, relationships, workflow, and the 4 evidence states
  (`VERIFIED / PROTOTYPE / TARGET / PLANNED / UNKNOWN`) as **branded,
  discriminated types**. **Zero `@angular/*` imports.**
- `libs/domain`: coordination / records / value / proof rules as **pure
  functions**. No reactivity in the core on purpose — reactivity is the shell's
  job. (Evaluated `@preact/signals` as an isomorphic primitive; rejected: an
  inert core is trivially testable and the taste call is to keep it dumb.)
- **CI gate:** ESLint `no-restricted-imports` bans `@angular/*` inside
  `libs/ontology` + `libs/domain`. A gate that *proves* the domain is
  framework-free. A competitor can't ship that gate; they don't have the split.

### L1 — State & data (zoneless)
- **Zoneless** change detection (no zone.js, no NgZone) — the perf ceiling.
- **`resource()`** for all data: declarative, cacheable, `when`-driven, no
  loading-splash flicker.
- **Optimistic** coordination board via `linkedSignal` (drag-and-drop resolves
  locally, syncs after).
- **Drop `@tanstack/angular-query-experimental` from the foundation.**
  `resource()` + its cache covers us; add TanStack *only* if the Intelligence
  module needs cross-cutting invalidation. No "-experimental" in a foundation.

### L2 — Shell (Angular 22)
- Standalone-only, `@angular/build` (Vite + esbuild), `@angular/ssr` with
  **prehydration + `@defer` view transitions**.
- **Spartan/ui (`@spartan-ng/brain` + `@spartan-ng/helm`) + Tailwind v4**,
  themed by the **Structural Emergence** tokens. Headless = our look is *ours*
  and ships fast.

### L3 — Graph (the showpiece, interface-first)
- `cytoscape` core + one `CytoscapeView` component (signal inputs; selection
  drives the detail rail). **Drop the abandoned `cytoscape-angular`.**
- **`GraphRenderer` interface, two backends:** Cytoscape (rich interaction,
  <~10k nodes) and **Sigma.js/WebGL** (scale). One API, both.
- **Layout off the main thread** in a Web Worker → 60fps at scale.

### L4 — Agents (the differentiator: a stream, not a tree)
- `@ng-agentic/core` is unconfirmed → **self-build `AgentSession` /
  `SessionReference`**: a **typed, schema-validated event stream**
  (SSE/WS → `resource()` → signals), validated on the wire with **valibot**
  (or zod).
- The 130 `.tsx` BoardUI files are **deleted, not wrapped**: native Angular
  panels render the *same stream*.

### L5 — Identity & Proof
- `AuthService` behind an interface now; the real identity lib
  (`energywebfoundation/iam-client-lib`, unverified) plugs in later.
- **ProofSpine is self-built — StellaOps does not exist.** Every node carries
  the 4+1 evidence states. **God-tier move: `VERIFIED` means the L0 core
  re-derives the claim deterministically** — the spine is a re-runnable
  derivation, not a badge.

### L6 — Monorepo & boundaries
- **Hand-add Nx. Skip `create-nx-workspace`** — it pins vitest 5.1.1, but
  Angular 22 requires `^4.0.8`; that is why every create has failed. Pin
  **Vitest ^4**.
- `@nx/enforce-module-boundaries`: `ui` → `ui+util`; features →
  `domain+own scope`, never siblings; shell unconstrained. `nx affected` +
  `nx daemon` cache.
- **Fallback if Nx tax is too high:** Angular-native multi-project
  `angular.json` + `import/no-restricted-paths` — ~80% of the same, no Nx.

## Decision log (keep / drop / self-build)
| Doc said | Call | Why |
|---|---|---|
| `cytoscape-angular` | **Drop** → `cytoscape` core + wrapper | Abandoned (last commit 2022) |
| `@ngxpert/cmdk` | **Self-build** `CommandPalette` | ~100 lines on signals; unverified on Angular 22 |
| `@ng-agentic/core` | **Self-build** agent stream; adopt only if install proves it live | Unconfirmed to exist; load-bearing in the doc |
| `@tanstack/angular-query-experimental` | **Drop** from foundation; scoped only if Intelligence needs it | "-experimental" belongs in a lab, not a foundation |
| `create-nx-workspace` | **Skip**; hand-add Nx, pin vitest ^4 | Broken on Angular 22's vitest pin |
| 130 `.tsx` BoardUI | **Delete, don't wrap** | Rebuild as native panels over the agent stream |
| `shacl-form` v4 (ULB-Darmstadt) | **Keep** — ontology module only | The real, mature SHACL lib |
| `energywebfoundation/iam-client-lib` | **Defer** behind `AuthService` interface | Unverified; don't block the foundation |

## Open — confirm on install `bmf635vnq`
- Which of `@ng-agentic/core`, `@ngxpert/cmdk`, `@tanstack/…-experimental`
  actually resolve → finalize keep vs self-build.
- `esbuild` / `@angular/build` postinstall vs the env's `install-scripts`
  allowlist gate → `npm install-scripts approve <pkg>` if the build trips it.
