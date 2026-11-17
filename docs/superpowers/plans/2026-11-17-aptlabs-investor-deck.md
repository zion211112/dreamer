# APT-LABS Investor Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public investor memo with an evidence-bounded, thesis-first APT-LABS pitch deck served at `/investor-memo/` on the existing Vercel site.

**Architecture:** Author the deck in a separate Open Slide workspace so its React 19/Vite 8 toolchain does not enter the Preact 10/Vite 6 app bundle. The root build runs both builds, then copies the deck's static output into `dist/investor-memo/`; Vercel continues to deploy one `dist` directory.

**Tech Stack:** Preact 10, Vite 6, TypeScript 5.6, Wouter, Vercel, Open Slide 2.x, React 19, Vite 8, an isolated nested npm workspace, Playwright.

**Spec:** [../specs/2026-11-17-aptlabs-investor-deck-design.md](../specs/2026-11-17-aptlabs-investor-deck-design.md)

## Global Constraints

- Keep the public deck at `/investor-memo/` in the existing Vercel deployment; do not create a second deployment.
- Keep Open Slide and its React/Vite dependencies isolated from the Preact 10/Vite 6 application bundle.
- Open Slide 2.x requires Node `^20.19.0 || >=22.12.0`; set the root engine range to `^20.19.0 || >=22.12.0` and verify the Vercel build runtime.
- Preserve the Structural Emergence system: parchment `#F4F1E9`, foreground `#292B25`, olive `#344438`, umber `#514337`, brass `#AD8B55`, clay `#A66F55`, Georgia/system/JetBrains Mono typography, and 8px spacing increments.
- Do not publish the supplied images, fundraising terms, forecasts, or project outcomes without the confirmations described in the spec. Use original diagrams or CSS geometry until image rights and permissions are confirmed.
- Label project facts, targets, hypotheses, and current product capabilities distinctly; do not present demo data as real transactions.

## Review Focus

- **Unconfirmed fundraising figures or contact destination:** no draft term, forecast, or placeholder contact may appear as verified; test the rendered deck for known draft figures and require an approved CTA URL before release.
- **Unverified project images or identifiable minors:** no supplied image may ship without provenance and permissions; assert the built deck contains no copied attachment assets unless the release gate is documented as cleared.
- **Hydro feasibility and learning outcomes:** MTO Works remains a proposed/illustrative river-hydro context and Kemetos flooring remains a testable hypothesis; assert those boundaries in visible slide copy.
- **Small screens and reduced motion:** mobile content remains readable without horizontal overflow, and keyboard navigation remains usable with reduced motion enabled; verify in Playwright at a 375px viewport.
- **Direct URL, refresh, and existing routes:** `/investor-memo/` must load as the deck on direct navigation and refresh while the root and a representative workspace route still load; verify against the production build output.

---

## File Structure

- `investor-deck/` — isolated npm workspace parent, with its own lockfile and no Vite dependency.
- `investor-deck/open-slide/` — Open Slide project, isolated one level below the Vite-free parent.
- `investor-deck/open-slide/slides/aptlabs-investor-deck/index.tsx` — the nine ordered slide components and deck metadata.
- `investor-deck/open-slide/slides/aptlabs-investor-deck/styles.css` — the deck's minimal Structural Emergence tokens, layout, mobile sizing, and reduced-motion rules.
- Root and nested `package.json` / lockfiles — separate app and deck dependency graphs, Node engine range, and orchestrated build/install scripts.
- `scripts/copy-investor-deck.mjs` — copies the Open Slide static build into `dist/investor-memo/`, failing explicitly if the source build is missing.
- `src/App.tsx` and `src/pages/Landing.tsx` — remove the old memo route and point the existing investor link at the static deck.
- `src/pages/InvestorMemo.tsx` — remove the old page and its unverified figures.
- `docs/architecture.md` and `docs/design/repo-facts.md` — replace stale route/component descriptions.
- `playwright.config.ts` and `tests/investor-deck.spec.ts` — production-preview browser checks for content, navigation, responsive behavior, and route integration.

## Task 1: Create the isolated Open Slide workspace

**Files:**
- Create: `investor-deck/package.json` and `investor-deck/package-lock.json`
- Create: `investor-deck/open-slide/` from the Open Slide CLI scaffold.
- Modify: `package.json`
- Modify: `package-lock.json`
- Create or modify: `investor-deck/open-slide/open-slide.config.ts`

**Interfaces:**
- Produces: nested npm workspace `investor-deck/` containing workspace `aptlabs-investor-deck`.
- Produces: `npm run build --prefix investor-deck`, which writes a static deck build to `investor-deck/open-slide/dist/`.
- The deck build uses `/investor-memo/` as its public base path.

- [ ] **Step 1: Scaffold the Open Slide workspace without initializing a nested Git repository or installing dependencies.**

Run: `npx --yes @open-slide/cli init investor-deck/open-slide --name aptlabs-investor-deck --no-install --no-git`

Expected: the scaffold creates an Open Slide project under `investor-deck/`.

- [ ] **Step 2: Remove scaffolded deployment and instruction files that conflict with the repository's single Vercel deployment and root instructions.**

Keep the generated Open Slide configuration and slide runtime files. Remove any nested `vercel.json`, `netlify.toml`, `AGENTS.md`, `CLAUDE.md`, `.agents/`, or `.claude/` output; the root repo remains the source of deployment and agent instructions.

- [ ] **Step 3: Add the deck as a root npm workspace and declare the supported Node range.**

Keep root `workspaces` unset so Vite 6 remains isolated. Set root `engines.node` to `^20.19.0 || >=22.12.0` and add a root `postinstall` that runs `npm install --prefix investor-deck --no-audit --no-fund`. Create `investor-deck/package.json` with `workspaces: ["open-slide"]` and a `build` script invoking `npm run build --workspace=aptlabs-investor-deck`. Retain the Preact app's existing dependency versions; keep Open Slide/React/Vite dependencies in the nested lockfile.

- [ ] **Step 4: Configure the Open Slide static build for `/investor-memo/`.**

In `investor-deck/open-slide/open-slide.config.ts`, set `base` to `/investor-memo/`, hide the slide browser and export menu in the static build, and retain the generated `build` and `preview` scripts.

- [ ] **Step 5: Install and verify the isolated workspace build.**

Run: `npm install`

Run: `npm run build --prefix investor-deck`

Expected: the Open Slide workspace builds successfully under the supported Node range; no Open Slide dependency is imported by `src/`.

- [ ] **Step 6: Commit the isolated workspace setup.**

```bash
git add package.json package-lock.json investor-deck
git commit -m "build: add isolated investor deck workspace"
```

## Task 2: Author the nine-slide, evidence-bounded deck

**Files:**
- Create: `investor-deck/open-slide/slides/aptlabs-investor-deck/index.tsx`
- Create: `investor-deck/open-slide/slides/aptlabs-investor-deck/styles.css`

**Interfaces:**
- Consumes: the isolated nested workspace and `/investor-memo/` base path from Task 1.
- Produces: Open Slide `Page[]` in this order, with `SlideMeta` title `APT-LABS Investor Deck`:
  1. Thesis: “Make productive capacity visible. Make work cumulative.”
  2. Coordination problem: fragmented needs, capacities, evidence, and local systems; no invented market research.
  3. Product loop: Commons, Network, Workbench, Records, and Intelligence; human authority remains explicit.
  4. MTO Works: a proposed river/hydro work context, not completed or technically validated infrastructure.
  5. Kemetos: a patterned-floor learning-environment hypothesis with local co-design and observable evaluation needs.
  6. What the cases do not prove: no product-market fit, revenue, repeat use, learning effect, or hydro feasibility claim.
  7. Business model: show 3–5% procurement routing only as an unproven model assumption; no insurance or financing product claims.
  8. Proof gates: buyer authority/willingness, delivery/acceptance, payment/working capital, governance/maintenance, permissions/privacy, and project-specific technical evaluation.
  9. Ask: `Discuss the investment`; show no specific raise or terms until confirmed.

- [ ] **Step 1: Implement the deck entry with nine named slide components and the specified page order.**

Export the slide array as `Page[]` and set `meta` to the exact title `APT-LABS Investor Deck`. Use short, legible copy; show one main statement per slide and label proposed, illustrative, target, and hypothesis content in the slide itself.

- [ ] **Step 2: Add only the minimal Structural Emergence design tokens and presentation styles.**

Use the exact colors and type stacks listed in Global Constraints. Use original CSS/SVG diagrams for the coordination loop and case contexts; do not copy the supplied photographs or create a synthetic result that appears to document a real site.

- [ ] **Step 3: Make every slide semantically navigable and legible at phone scale.**

Use ordered headings and meaningful labels for diagrams; keep body text to short phrases and at least 72px on the 1920×1080 canvas. Provide visible focus, keyboard navigation, and `prefers-reduced-motion: reduce` styles. Preserve Open Slide's browser navigation and avoid motion-dependent content.

- [ ] **Step 4: Verify the standalone deck build and inspect the slide sequence.**

Run: `npm run build --prefix investor-deck`

Expected: the static deck builds successfully and contains all nine pages in the specified order. Open the workspace preview and inspect desktop and 375px-wide rendering, keyboard advance/back, focus visibility, and reduced-motion behavior.

- [ ] **Step 5: Commit the authored deck.**

```bash
git add investor-deck/open-slide/slides/aptlabs-investor-deck
git commit -m "feat: author evidence-led investor deck"
```

## Task 3: Integrate the static route and verify the production build

**Files:**
- Create: `scripts/copy-investor-deck.mjs`
- Create: `tests/investor-deck.spec.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `playwright.config.ts`
- Modify: `src/App.tsx`
- Modify: `src/pages/Landing.tsx`
- Delete: `src/pages/InvestorMemo.tsx`
- Modify: `docs/architecture.md`
- Modify: `docs/design/repo-facts.md`

**Interfaces:**
- Consumes: `investor-deck/open-slide/dist/` from Task 2.
- Produces: `dist/investor-memo/index.html` and its assets from the root `npm run build`.
- Root `npm run build` order: `tsc`, root `vite build`, `npm run build --prefix investor-deck`, then `node scripts/copy-investor-deck.mjs`.
- Produces: `npm run test:investor-deck`, which builds the site and runs the Chromium Playwright integration tests against `vite preview`.

- [ ] **Step 1: Add Playwright integration tests for the finished production route.**

Create `tests/investor-deck.spec.ts` with tests named:

  - `loads the deck directly and after refresh`
  - `opens the deck from the landing-page investor link`
  - `navigates forward and backward by keyboard`
  - `keeps the deck readable at a 375px viewport with reduced motion`
  - `labels project hypotheses and omits unconfirmed memo terms`
  - `keeps the root and workspace routes available`

Assert the title and first-slide thesis, the two distinct MTO/Kemetos contexts, the visible hypothesis/evidence limits, and absence of `CONFIDENTIAL`, `$250,000`, `$250K`, `SAFE`, `$100,000`, `$4,000`, `$4K`, and the old 10% fee claim. Also assert no horizontal overflow at 375px and working keyboard navigation. Assert the investment CTA uses the destination confirmed for release; a placeholder or empty `href` must fail the test.

- [ ] **Step 2: Configure Playwright to run against the production preview.**

In `playwright.config.ts`, set `baseURL` to `http://127.0.0.1:4173` and enable `webServer` with `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`; reuse the server outside CI. Add the root script `test:investor-deck` to run the production build followed by `playwright test tests/investor-deck.spec.ts --project=chromium`.

- [ ] **Step 3: Implement the static-output copy script and root build orchestration.**

In `scripts/copy-investor-deck.mjs`, copy `investor-deck/open-slide/dist/` recursively to `dist/investor-memo/`. Throw a clear error if the source build or its `index.html` is missing. Update `build` so the root app is built before the deck is copied; update `deploy` to call `npm run build` so it cannot omit the deck. Keep Vercel's existing `dist` output and catch-all behavior unless the route test demonstrates a conflict.

- [ ] **Step 4: Remove the old memo implementation and point the app navigation to the static deck.**

Remove the `/investor-memo` Wouter route and `InvestorMemo` import from `src/App.tsx`; change the landing link label to `Investor deck` and its target to `/investor-memo/`; delete `src/pages/InvestorMemo.tsx` so its draft terms cannot remain in the application bundle.

- [ ] **Step 5: Update the two architecture references to describe the static deck route.**

In `docs/architecture.md` and `docs/design/repo-facts.md`, replace the `InvestorMemo` component description with the Open Slide static output served at `/investor-memo/`.

- [ ] **Step 6: Confirm content release gates before enabling the investment CTA.**

Use the existing WhatsApp contact only if the destination is confirmed by the owner. Otherwise, do not invent a URL or publish a broken placeholder; keep release blocked until an approved destination is supplied. Continue to omit all unconfirmed raise terms, image assets, project status, and outcome claims.

- [ ] **Step 7: Run build and browser verification.**

Run: `npm run build`

Run: `npm run test:unit -- --run`

Run: `npm run test:investor-deck`

Expected: all commands pass; `dist/investor-memo/index.html` exists; direct load, refresh, root-link navigation, keyboard controls, responsive reading, and a representative workspace route pass. Inspect the built output to ensure no supplied photo or unconfirmed contact/financial terms are included. Verify the Vercel preview route before release.

- [ ] **Step 8: Commit the integrated route.**

```bash
git add package.json package-lock.json scripts/copy-investor-deck.mjs tests/investor-deck.spec.ts playwright.config.ts src/App.tsx src/pages/Landing.tsx src/pages/InvestorMemo.tsx docs/architecture.md docs/design/repo-facts.md
git commit -m "feat: serve investor deck from existing site"
```

## Self-review

- **Spec coverage:** The narrative, two separate case stories, evidence labels, content release gates, Structural Emergence styling, isolated Open Slide workspace, `/investor-memo/` static route, Vercel output, root navigation, and responsive/keyboard requirements are all assigned to Tasks 1–3.
- **Step scan:** Each task step has a specific file/output and a measurable build, browser, or release check; no step authorizes invented project, financial, or contact content.
- **Type consistency:** The deck entry exports Open Slide `Page[]` and `SlideMeta`; the workspace name used by the root scripts is consistently `aptlabs-investor-deck`.
- **Review focus:** All five failure modes map to explicit Playwright assertions or a release gate in Task 3.
- **Proportion:** The plan adds only one isolated deck workspace, one copy script, and one focused browser test file; the old memo is removed rather than refactored.
