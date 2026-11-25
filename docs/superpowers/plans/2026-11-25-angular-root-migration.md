# Angular-Only Root Application Implementation Plan

> **For agentic workers:** Use this plan task-by-task. Keep steps small and verify each deliverable.

**Goal:** Promote the existing Angular app to the repository root, remove Vite/Vue and the investor deck, and preserve the implemented routes with charter-aligned navigation.

**Architecture:** The repository root becomes the only Angular CLI application. Existing Angular pages and libraries move intact; obsolete root tooling and deck wiring are removed; routing is corrected and covered with browser smoke tests.

**Tech Stack:** Angular 22.3, strict TypeScript, Angular CLI, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-25-angular-root-migration-design.md`

## Global Constraints

- Keep the six primary contexts: Home, Commons, Network, Workbench, Records, and Intelligence.
- Preserve existing implemented routes other than `/investor-memo/*`.
- Do not add screens for planned-but-unwired modules.
- Preserve unrelated files, dirty changes, and user-owned assets.
- Do not edit the landing component while another agent is working on it; include its latest version when promoting `src/`.
- No active Vite/Vue or investor-deck dependency, script, route, or deployment wiring remains.

## Review Focus

- Root/Angular file collisions — resolve explicitly; do not overwrite existing root files.
- Referenced static assets — retain only necessary assets in Angular's build inputs and preserve unrelated files.
- Direct deep links and browser refresh — every retained URL must render under the root Angular SPA.
- Route-specific views — Records and Network subpaths must reflect their URL, not a generic default.
- Unknown URLs — render an intentional not-found view; do not silently show an empty shell.

---

### Task 1: Promote Angular to the repository root

**Files:**
- Move: `apt-labs/src/` and `apt-labs/libs/` to root `src/` and `libs/`
- Move: `apt-labs/angular.json`, `apt-labs/tsconfig*.json` to the root
- Merge: Angular `apt-labs/public/` into root `public/` after collision and reference checks
- Modify: root `package.json`, `package-lock.json`, `.gitignore`, `vercel.json`
- Preserve: unrelated root files and `apt-labs/.tc-check.js`

**Interfaces:**
- Produces root Angular CLI targets for `start`, `build`, and `test`.
- Angular build output remains `dist/apt-labs/browser` for Vercel.

- [ ] Check tracked and untracked paths for collisions before moving anything.
- [ ] Promote Angular source, libraries, and configuration without editing the landing component.
- [ ] Consolidate package manifests and lockfile so a root install supplies Angular and required tests.
- [ ] Update Vercel's build/output paths to the root Angular app.
- [ ] Run the root Angular production build and unit tests.

### Task 2: Remove retired Vite/Vue and investor-deck plumbing

**Files:**
- Delete: `investor-deck/`, `scripts/copy-investor-deck.mjs`, `tests/investor-deck.spec.ts`
- Delete: `vite.config.ts`, `vitest.config.ts`, `index-vue.html`, retired root `index.html`, and `tsconfig.node.json`
- Modify: root `package.json`, `package-lock.json`, `vercel.json`, `playwright.config.ts`
- Update: current architecture/setup docs that describe Vue, Preact, Vite, or the deck as active

**Interfaces:**
- Root `npm run dev`, `npm run build`, and `npm test` operate only on Angular.
- Playwright starts the Angular app, not Vite preview.

- [ ] Remove deck build/copy/test scripts and `/investor-memo/*` rewrite.
- [ ] Remove obsolete framework dependencies and regenerate the lockfile through npm.
- [ ] Remove stale root HTML/config entry points while preserving Angular `src/index.html`.
- [ ] Search active manifests, scripts, tests, and deployment config for stale Vite/Vue/deck wiring.

### Task 3: Reconcile routes and workspace navigation

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/features/workspace/shell-layout.component.ts`
- Modify: `src/app/features/workspace/sidebar.component.ts`
- Modify: Records and Network route-specific components as needed
- Create: `src/app/features/not-found/not-found.component.ts`

**Interfaces:**
- `routes` retains each implemented URL and adds a final not-found route.
- The rail exposes six charter contexts; sidebar links are contextual and not a duplicate module list.
- Existing Value, Ontology, and Sovereignty pages remain secondary destinations.

- [ ] Make Network and Records subroutes select their intended view/filter from the URL.
- [ ] Remove the duplicate all-modules sidebar list and align the primary rail with the charter.
- [ ] Add and verify a meaningful not-found page for unknown URLs.
- [ ] Correct the route-table count comment to match the final table.

### Task 4: Add route smoke coverage and finish migration

**Files:**
- Create or modify: `tests/routes.spec.ts`
- Modify: `playwright.config.ts`, root `package.json` if command wiring requires it
- Update: `AGENTS.md`, `docs/architecture.md`, `QUICKSTART.md` only where current facts are stale

- [ ] Add Playwright checks for all retained URLs, route-specific Records/Network states, and unknown paths.
- [ ] Run root production build, Angular unit tests, and Chromium route smoke tests.
- [ ] Confirm Vercel output and SPA fallback target the root Angular build.
- [ ] Start the root Angular dev server on port 4200 and verify `/workspace` renders.
- [ ] Confirm the landing agent's latest changes are preserved and no unrelated dirty files were altered.
