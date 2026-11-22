# APT-LABS — Build Handoff (for the incoming agent client, e.g. dsh)

You are taking over the build. The foundation is committed and green. Build
**clean, expert, zoneless Angular 22** — and build toward the real center:
the **agent-orchestration / coordination workbench**, not the "engine" narrative.

## State you are inheriting
- Branch: `fix/vite-vue-router-peer-conflict` (top commit = the Angular foundation).
- `apt-labs/` = standalone Angular 22 app, `ng build` **verified green** (~59.8 kB initial).
- Confirmed installable deps (in `apt-labs/package.json`, node_modules installed):
  `@spartan-ng/brain`, `cytoscape`, `@ngxpert/cmdk`, `@tanstack/angular-query-experimental`.
- **Do NOT add back:** `@spartan-ng/helm` (404 — not a real package) and
  `@ng-agentic/core` (peer-conflict vs Angular 22 → self-build the agent stream instead).
- Native pkgs `esbuild`, `@parcel/watcher`, `lmdb`, `msgpackr-extract` are already
  approved in this env's install-scripts gate.

## Read first (source of truth)
- `STACK_REVIEW.md` — confirmed target stack + decision log. **Correction baked in:**
  the prior author over-framed the ontology as "the moat." It is a **data model, not
  the engine**. De-emphasize it; build the workbench.
- `MIGRATION-mapping.md` — Vue→Angular lib mapping + Phase-3 depth order (D0→D4).
- `PHASE4_BOUNDARIES.md` — the `@nx/enforce-module-boundaries` depConstraints to wire.
- The Vue app at repo root (`src/lib/ontology/...`, `src/pages/workspace/...`, etc.)
  is the domain source to port. It is **untracked** — move it, don't assume it's committed.

## Center of gravity (build here, not in the ontology)
The product is the **agent-orchestrated coordination workbench**: streaming agent
sessions, the job/coordination controller, and the records / value / commons / network
views. The ontology + 4 evidence states are *supporting data*. Ship the workbench;
treat the ontology as the typed domain it operates on.

## Remaining build (suggested order, green build at each step)
1. **Nx workspace — hand-add it.** Skip `create-nx-workspace` (pins vitest 5.1.1;
   Angular 22 needs `^4.0.8` — that is why every create has failed). Pin `vitest ^4`.
   Wire `@nx/enforce-module-boundaries` from `PHASE4_BOUNDARIES.md`.
   *Fallback if Nx tooling tax is too high:* Angular-native multi-project `angular.json`
   + `import/no-restricted-paths` (~80% of the same, no Nx).
2. **`libs/` skeleton:** `ontology`, `domain` (coordination/value/records/proof),
   `shared/ui` (Spartan `brain` + Tailwind v4 + Structural-Emergence tokens),
   `shared/state` (signals), `shell`, then the feature libs. Keep the domain core
   **framework-free** — no `@angular/*` in `libs/ontology` + `libs/domain`; enforce it
   with an ESLint `no-restricted-imports` gate.
3. **Move the Vue app → `apps/legacy-vue`** (it's still at repo root, untracked —
   `git mv` it). This is the strangler island; delete it last.
4. **Port the 8 pillars** per `MIGRATION-mapping.md` depth order. `@ngxpert/cmdk`
   works — use it for the palette. **Self-build** the agent stream
   (SSE/WS → `resource()` → signals), the `GraphRenderer`
   (`cytoscape` core + thin wrapper; **Sigma.js/WebGL** at >~10k nodes; layout off-thread
   in a worker), and the proof spine (4 evidence states).
5. Keep it **zoneless, standalone, signal-based, `resource()` for data**, strict TS,
   no `any`, stable primitive APIs, no abandoned deps.

## Operating rules (from the user)
- **No-stall:** timebox everything; background the flaky npm/network work; keep
  critical jobs monitored. Never let a subagent hang.
- **"Beat the competition"** = optionality + provability + speed: framework-free typed
  core, agent-as-data-stream, dual graph backend, design-system-as-IP.
- **Clean, expert end-state:** boundary gates that actually run in CI; a green build is
  the bar at every step.
