# APT-LABS / zeptepi — Toolkit Map

Inventory of everything installed and wired in this environment, captured
**2026-11-23** for the build handoff (incoming agent client **dsh**).

Read order for the builder: `HANDOFF.md` → `STACK_REVIEW.md` →
`MIGRATION-mapping.md` → `PHASE4_BOUNDARIES.md` → **this file** (what's available).
This file answers "what can I call?" not "what do I build?".

---

## 1. Runtimes & CLIs on PATH

| Tool | Version | Note |
|---|---|---|
| node | v24.22.0 | Node 24 |
| npm / npx | 11.19.1 | |
| git | 2.56.0.windows.2 | |
| python / python3 | 3.15.2 | pip 26.2.2 |
| docker | present | |
| claude | 2.1.296 | global pkg is 2.1.311 (`@anthropic-ai/claude-code`); the running CLI reports 2.1.296 |
| codex | present | OpenAI Codex CLI |
| pwsh / powershell | present | Windows 10 Ent 19045 (build 10.0.19045) |

**Not on global PATH:** `ng`, `nx`, `yarn`, `pnpm`, `bun`, `deno`, `go`, `gemini`.
`ng`/`ngc`/`esbuild` live under `apt-labs/node_modules/.bin` — run them from that dir
or via `npm run`.

---

## 2. Model routers & agent clients (the "fcc / bitfrost / dsh" layer)

| Name | What it is | Source |
|---|---|---|
| **dsh** | DeepSeek agent client — the target handoff runtime | global `@deepseek-ai/dsh@0.2.2-rc.1` (bin `dsh`) |
| **bifrost** | multi-model router | global `@maximhq/bifrost@1.6.3` |
| **fcc** | gateway this session's model is served under (`claude-fcc/…`); no global `fcc` bin found — a config/env router, not an npm pkg | model-id prefix |
| **Vercel `ai` SDK** | in-app multi-provider routing (anthropic / google / openai) | root dep `ai@^7.0.87` + `@ai-sdk/*` |

`~/.claude/settings.json` references **deepseek** (dsh). Cheap/flagship routing across
subagents is the "fcc + bifrost" posture — cheap for mechanical work, flagship for
reasoning.

---

## 3. Global npm packages (`npm ls -g --depth=0`)

`@anthropic-ai/claude-code@2.1.311` · `@deepseek-ai/dsh@0.2.2-rc.1` ·
`@maximhq/bifrost@1.6.3` · `@sakaniui/mcp@0.19.1` · `codebase-memory-mcp@0.12.1` ·
`designlang@13.4.1` · `framesmith@2.4.0` · `hallmark@2.0.0` · `semgrep@0.0.1` ·
`skills@1.9.0` · `systembridge-mcp@1.3.0` · `vercel@65.12.1`

---

## 4. Local toolchains

### `root` — `zeptepi` (the Vue 3 app, untracked, `v0.0.1`, `type:module`)
- **Vue:** `vue ^3.5.45`, `vue-router ^4.6.5`, `pinia ^4.1.0`
- **AI (in-app):** `ai ^7.0.87` + `@ai-sdk/{anthropic,google,openai,react}`
- **MCP (in-app):** `@mcp-ui/client` + `@mcp-ui/server`
- **Backend / identity:** `@supabase/supabase-js`, `@trust0/identus-react`,
  `waltid-vue-components`, `@zanii/core` + `@zanii/sdk`
- **Graph:** `cytoscore→cytoscape ^3.35.0` + `react-cytoscapejs` + `react-sigma`
- **Data / viz:** `@tanstack/vue-query`, `recharts`, `motion`, `react-cmdk-base`
- **Wire validation:** `zod ^4.6.7` · **UI:** `tailwindcss ^4.3.5` + `@tailwindcss/vite`
- **dev:** `@playwright/test`, `typescript ^5.6.0`, `vite ^6.4.5`, `vitest ^5.0.5`
- `.bin` highlights: `vite`, `vitest`, `tsc`, `tsserver`, `rollup`, `playwright`, `patch-package`, `jiti`, `semver`, `uuid`

### `apt-labs/` — Angular 22 app (committed in `4296869`, build **green** ~59.84 kB)
- `@angular/* ^22.3.0` (standalone, zoneless), `@angular/build ^22.3.0` (esbuild + rolldown)
- Installed target deps: `@spartan-ng/brain ^1.10.0`, `cytoscore ^3.35.0`,
  `@ngxpert/cmdk ^3.0.0`, `@tanstack/angular-query-experimental ^5.107.2`, `rxjs ~7.8.0`
- dev: `typescript ~6.0.2`, `vitest ^5.0.0`, `jsdom ^31.0.0`, `prettier ^3.8.1`
- **Dropped (do NOT re-add):** `@spartan-ng/helm` (404), `@ng-agentic/core` (peer-conflict)
- `allowScripts` pinned: `esbuild`, `@parcel/watcher`, `lmdb`, `msgpackr-extract`
- `.bin` highlights: `ng`, `ngc`, `ng-xi18n`, `esbuild`, `rolldown`, `sass`, `vite`, `vitest`, `prettier`, `browserslist`

---

## 5. Claude Code plugins (`claude plugin list`)

**claude-plugins-official:** `claude-code-setup`, `code-simplifier`, `context7`,
`feature-dev`, `figma`, `firecrawl`, `playwright`, `ralph-loop`,
`shopify-ai-toolkit`, `superdesign`, `superpowers`, `typescript-lsp`
**anthropic-plugin-directory:** `frontend-design`
**skills-dir:** `ui-ux-pro-max` (`~/.claude/skills/ui-ux-pro-max-skill`)

---

## 6. MCP servers (`.mcp.json` + plugins + desktop app)

| Server | Type | Status this session |
|---|---|---|
| `plugin:context7` | HTTP | ✔ connected (live tools) |
| `plugin:firecrawl` | HTTP | ✔ connected (live tools) |
| `plugin:figma` (cloud) | HTTP | ✔ connected (live tools) |
| `better-design` | HTTP | ✔ connected — **Bearer token lives in `.mcp.json`** (see §10) |
| `stitch` | HTTP | ✔ connected |
| `plugin:playwright` | npx | health ✔ but CONNECT_TIMEOUT on invoke this session |
| `framesmith` | npx | health ✔ but CONNECT_TIMEOUT on invoke this session |
| `sakaniui` | stdio | ⏸ pending approval (tools registered) |
| `systembridge-mcp` | stdio | ⏸ pending approval / CONNECT_TIMEOUT |
| `designlang` | stdio | ⏸ pending approval / CONNECT_TIMEOUT |
| `figma-desktop` | local `:3845` | ✘ ECONNREFUSED (desktop app not running) |
| `codebase-memory` | global mcp | installed, **removed/unavailable this session** |
| `ccd_*` (session, turn, pr, settings, view, window, directory, host, terminal, scheduled-tasks) | desktop app | built into the Claude desktop app |

To activate the pending ones: `claude` → approve `sakaniui`, `systembridge-mcp`, `designlang`.
Only spin them up if the build actually needs them.

---

## 7. Skills (families)

- **Harness built-ins:** `find-skills`, `init`, `security-review`, `code-review`,
  `simplify`, `loop`, `run`, `update-config`, `keybindings-help`, `claude-api`,
  `workflow-authoring`, `fewer-permission-prompts`, `plugin-authoring`
- **Plugin families:** `superpowers:*`, `feature-dev:*`, `figma:*`, `firecrawl:*`,
  `superdesign:*`, `ui-ux-pro-max:*`, `anthropic-skills:*` (incl. `dsh-port-map`),
  `ralph-loop:*`, `frontend-design:*`, `dataviz`
- **Standalone / skills-dir:** `angular-migration`, `ui-ux-pro-max`, `hallmark`,
  `caveman`, `diagram-design`, `impeccable`, `ponytail`, `max-throughput`,
  `design-taste-frontend`, `agent-md-refactor`, `ui-workflow`, `webapp-testing`

---

## 8. Subagent types (Agent tool)

`claude` (default) · `Explore` · `Plan` · `general-purpose` ·
`feature-dev:{code-architect, code-explorer, code-reviewer}` ·
`code-simplifier:code-simplifier` · `claude-code-guide` · `statusline-setup`.
Back any of them with the cheap/flagship routers (fcc / bifrost).

---

## 9. Two toolchains coexist — don't cross-import blind

- **Vue app = TypeScript 5.6 / Vite 6 / vitest ^5.0.5**
- **Angular app = TypeScript ~6.0 / `@angular/build` / vitest ^5.0.0**
- A `git mv` of the Vue app into `apps/legacy-vue` (HANDOFF step 3) means two TS majors
  under one Nx roof — align before the boundary gates compile them together.

---

## 10. ⚠️ Security findings (act on these)

- **`.mcp.json` is git-tracked** (committed in `88e7900`) and holds a **live
  `better-design` Bearer token** (`bd_live_zGdv…` — full value in the file). It is **not**
  in `.gitignore`.
  - → **Rotate the token.** Move it to `.claude/settings.local.json` (gitignored) or an
    env var, `git rm --cached .mcp.json`, and scrub history if the repo is remote.
- `~/.claude/.credentials.json` holds app auth — it is **outside** the repo, so it is safe;
  keep it that way (never commit it).

## 11. Stack corrections the Vue app already proves

- **Wire validation → `zod`** (already a root dep at `^4.6.7`), not valibot.
- **Graph → `cytoscape` core + `sigma`/WebGL** — both already in the Vue app
  (`react-cytoscapejs`, `react-sigma`); the Angular `GraphRenderer` is a known shape.
- **Identity → WaltID / Zanii / Trust0-Identus** (in-app libs), *not* the guessed
  `energywebfoundation/iam-client-lib` in the earlier draft.
- **Tailwind v4** is already the root UI stack — standardize the Angular side on v4 too.
- **Gap:** `tailwindcss` / `@tailwindcss/*` are **not yet in `apt-labs/package.json`** —
  add them before `shared/ui`.
- **Risk:** `apt-labs` pins `vitest ^5.0.0`, but Angular 22's `@angular/build` test runner
  peer-expects `^4`. `ng build` is green but **`ng test` was never run** — verify/align the
  vitest major before wiring Nx + tests.

## 12. For the incoming (dsh) session

Build toward the **agent-orchestration / coordination workbench** (not the "engine"),
keep the domain core framework-free, use `zod` / `cytoscape+sigma` / Tailwind v4,
and honor the **no-stall** rule: timebox subagents, background the flaky npm/network work,
monitor critical jobs, reap stalls with `TaskStop`. Activate pending MCP servers only when
the build needs them. Fix the `.mcp.json` secret (§10) early — it's the one real exposure.
