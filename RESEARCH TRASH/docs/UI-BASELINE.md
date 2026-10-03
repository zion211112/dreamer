# APT-LABS UI baseline

Captured: 2026-09-25
Scope: public APT-LABS site and shared visual shell.

## Validation baseline

| Check | Result |
|---|---|
| `npm test` | PASS — 44 tests |
| `npm run audit` | PASS — class, company and funder audits |
| `npm run lint` | PASS — no ESLint warnings or errors |
| `npx tsc --noEmit` | No diagnostic output captured; rerun during refinement |
| `npm run build` | Worker exited on Windows with code `3221225794` during baseline; no source diagnostic captured |
| Public route files | 16 page routes, including console and local-first utility routes |
| Browser automation | Not installed in the repository |
| Media assets | No `public/` image or video assets are currently present |

## Current visual structure

- Shared shell: sticky dark navigation, mobile menu, ruled footer.
- Homepage: four sections, four text-list faces, one intake row and one operating-loop list.
- Identity pages: shared serif/mono/sans treatment with evidence rows and status tags.
- Product proof: existing console and registers are real code surfaces, but the homepage does not visually expose them.
- Responsive source rules: desktop grid, tablet collapse and mobile navigation exist; visual browser QA is not yet automated.

## Refinement risks

- Do not introduce visual evidence that does not exist.
- Do not turn the homepage into generic SaaS cards or a portfolio.
- Keep internal doctrine out of runtime source and public metadata.
- Treat the Windows build worker failure as an environment/runtime issue until a source diagnostic exists.
- Do not infer deployment, adoption, revenue, partnership or hardware completion from prototype code.

## Target for this pass

1. Make the product surface visible on the homepage.
2. Make the one-system architecture understandable without reading every page.
3. Establish navigation hierarchy.
4. Increase composition and depth without adding decorative noise.
5. Keep all public claims state-labelled and evidence-safe.
