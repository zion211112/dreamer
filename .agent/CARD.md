# .agent/CARD.md — Intelligence Module (APT-LABS)

## Scope
Intelligence module only: relocate engine + page + test from src/lib/ and src/pages/workspace/ into src/modules/intelligence/ factory-ready layout, mirroring src/modules/workbench/ and src/modules/kemetos1/. Update src/App.tsx route import. Route path /workspace/intelligence unchanged.

## Files created (src/modules/intelligence/)
- App.tsx — IntelligenceApp wrapping Intelligence under WorkspaceLayout currentContext="intelligence"
- index.ts — barrel exports
- lib/intelligence.ts — engine (moved, clean content restored from HEAD)
- lib/intelligence.test.ts — tests (moved)
- pages/Intelligence.tsx — page (moved, imports fixed)

## Files deleted
- src/lib/intelligence.ts
- src/lib/intelligence.test.ts
- src/pages/workspace/Intelligence.tsx

## Files edited
- src/App.tsx — import IntelligenceApp from ./modules/intelligence; route /workspace/intelligence -> IntelligenceApp

## Baseline oracle (verified this session)
- tsc --noEmit via node ./node_modules/typescript/bin/tsc --noEmit: PASSES (exit code 0)
- vitest run: BLOCKED (sandbox esbuild limitation)
- vite build: not attempted

## Git status
- Modified (other agents, do NOT touch): .mcp.json, .vscode/settings.json, package.json, package-lock.json
- Intelligence changes staged: src/App.tsx, src/modules/intelligence/, src/lib/intelligence.ts, src/lib/intelligence.test.ts, src/pages/workspace/Intelligence.tsx

## Status: complete
