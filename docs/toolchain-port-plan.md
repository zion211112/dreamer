# Toolchain Port Plan — APT-LABS Angular workspace

Port target: **APT-LABS**, Angular 22 zoneless standalone-component monorepo at
`apt-labs/` (repo root `C:/Users/zION/Documents/dreamer`). Design direction:
**charter B4 "Structural Emergence"** — warm-ivory base, earthy neutrals, sage,
deep forest/ink, lilac/peach; editorial serif + operational sans/mono; anti-slop.

A tool counts as **port-now** only if it concretely helps build or verify THIS
Angular workspace (design system, tokens, UI review, component refs, codebase
nav, doc lookup). React-only or harness-only tooling = adapt / drop / not-relevant.

---

## 1. The dsh / DeepSeek question, answered

`dsh` = the **DeepSeek agent harness** (`@deepseek-ai/dsh@0.2.2-rc.1`, global npm).
It is not a set of small design plugins — it is one monorepo CLI (the
`deepseek-harness` repo) that pulls in **~300 `@deepseek-ai/dsh-*` packages**:
`dsh-client-ui-*`, `dsh-api-*`, `dsh-subagent*`, `dsh-terminal*`, `dsh-session-*`,
`dsh-sandbox*`, `dsh-web-*`, `dsh-tool-*`, plus `cordis` (its plugin host).

Facts that settle the verdict:
- **`dsh` is not on PATH** (`command -v dsh` → empty). The harness is installed as
  an npm package but is **not runnable in this environment**.
- The only dsh thing we actually *installed as a plugin* is **`superdesign@0.6.0`**,
  and its `dsh/` folder is **glue only** — `index.js` registers the packaged
  `superdesign` skill onto dsh's `ctx.skills` provider (via `cordis`), and
  `cordis.patch.yml` declares that one skill row. No MCP, no tools, no config.
- `dsh-skill`, `dsh-skill-filesystem`, `dsh-skill-badge`, `dsh-skill-office` are the
  harness's **skill-provider contract** — architecturally the same as Claude's
  native skill system, which we already have.

**Verdict: DROP as a build tool.** The `dsh-*` family is a competing agent
runtime's internals, not design capability we can bolt onto an Angular app.
The one genuinely useful thing in the family is the **`superdesign` skill body**
(`skills/superdesign/SKILL.md`), which ships in the Claude plugin and works under
Claude — that is a **port-now** design skill. The `dsh/` glue and the `dsh-*`
npm packages are **drop-dsh-specific**.

> Bottom line for the "we had many dsh plugins we can port" assumption: most of
> them are the DeepSeek harness's own machinery, not portable design tools. What
> is actually portable is the **design MCP servers + design skills** below.

---

## 2. Master catalog

| Tool | Kind | Source | dsh? | Status | Verdict | Port move |
|---|---|---|---|---|---|---|
| codebase-memory-mcp | mcp (stdio) | repo `.mcp.json` + global npm | no | connected | **PORT-NOW** | already mandated; graph nav for the Angular codebase |
| systembridge-mcp | mcp (stdio) | repo `.mcp.json` + global npm | no | connected | **PORT-NOW** | framework-agnostic tokens/themes/contrast/palette/scale; `generate_system`, `audit_design`, `check_contrast`, `resolve_theme` → build + validate Structural Emergence tokens |
| designlang | mcp (stdio) | repo `.mcp.json` + global npm | no | connected | **PORT-NOW** | `extract-design`, `get_tokens`, `verify_ui`, `list_failing_contrast_pairs`, `compute_drift` → verify the warm-ivory theme, catch contrast regressions |
| framesmith | mcp (npm/git) | marketplace git-clone | no | connected | **PORT-NOW** | `generate_design_system` (seed + personality → full design language: color, fonts, radius, density, elevation, motion; dark-aware); canvas `evaluate`/`stress`/`autofix` → generate + self-critique UI |
| stitch | mcp (npm/git) | marketplace git-clone | no | connected | **PORT-NOW** | generate design systems / screens from text + the 38 reference images; `edit_screens` |
| better-design | mcp (http) | repo `.mcp.json` | no | **removed by user** | N/A — **rotate token** | user removed it; its live Bearer token still sits in the repo `.mcp.json` → rotate + keep that file out of commits |
| context7 | plugin | claude-plugins-official | no | installed | **PORT-NOW** | fetch current Angular 22 / `@angular/*` docs while building |
| typescript-lsp | plugin | claude-plugins-official | no | installed | **PORT-NOW** | TS LSP nav for the Angular TS monorepo |
| superdesign | skill (plugin) | claude-plugins-official `0.6.0` | glue only | installed | **PORT-NOW** (skill) / **DROP** (`dsh/` glue) | use the `superdesign` design skill under Claude; ignore its `dsh/` registration files |
| frontend-design | plugin/skill | anthropic-plugin-directory | no | installed | **PORT-NOW** | UI build guidance |
| design-taste-frontend | skill | user skills | no | installed | **PORT-NOW** | taste bar for the retheme |
| ui-workflow | skill | user skills | no | installed | **PORT-NOW** | UI flow guidance |
| ui-ux-pro-max | skill (+stack MCP) | user skills | no | installed | **PORT-NOW** | design-system / ui-styling / brand; stack bundles playwright + chrome-devtools MCPs |
| dataviz | skill | (skill) | no | available | **PORT-NOW** | rules for any chart/KPI/meter in the workspace |
| diagram-design | skill | user skills | no | installed | **PORT-NOW** | structural diagrams (fits "structural emergence") |
| impeccable | skill | user skills | no | installed | **PORT-NOW** | polish pass |
| hallmark | skill + global npm `hallmark@2.0.0` | user skills + global | no | installed | **PORT-NOW** | signature/detail pass |
| find-skills | skill | user skills | no | installed | **PORT-NOW** | discover more skills |
| codebase-memory | skill | user skills | no | installed | **PORT-NOW** | graph-tool usage (pairs with the MCP) |
| max-throughput | skill | user skills | no | installed | **PORT-NOW** | batch/throughput workflows |
| playwright | plugin + MCP (stack) | claude-plugins-official + ui-ux stack | no | installed | **ADAPT** | browser-verify the retheme in Chrome; already present via plugin |
| chrome-devtools | MCP (ui-ux stack) | ui-ux-pro-max-skill/stack/.mcp.json | no | not-wired | **ADAPT** | only needed if we want raw devtools; playwright covers most |
| shadcn | MCP (ui-ux stack) | ui-ux-pro-max-skill/stack/.mcp.json | no | not-wired | **DROP** | React/shadcn — wrong framework for Angular |
| sakaniui | mcp (stdio) | global npm `@sakaniui/mcp@0.19.1` | no | connected | **ADAPT** | React component lib; reuse only its `get_tokens` CSS-variable output as a token reference, not the components |
| superpowers | plugin | claude-plugins-official `7.0.0` | no | installed | **ADAPT** | process skills (plan/debug/review) — use as-is, no porting |
| feature-dev | plugin | claude-plugins-official `1.0.1` | no | installed | **ADAPT** | code-architect / explorer / reviewer subagents — use as-is |
| code-simplifier | plugin | claude-plugins-official `1.0.0` | no | installed | **ADAPT** | simplify/refine — use as-is |
| ralph-loop | plugin | claude-plugins-official `1.0.1` | no | installed | **ADAPT** | loop driver — use as-is |
| claude-code-setup | plugin | claude-plugins-official `1.0.0` | no | installed | **ADAPT** | automation recommendations — use as-is |
| firecrawl | plugin | claude-plugins-official `2.0.0` | no | **needs OAuth** | **NOT-RELEVANT** | research only; not for building Angular |
| @deepseek-ai/dsh + ~300 dsh-* | npm pkg family | global npm | **yes** | not on PATH | **DROP** | competing agent-harness runtime; not runnable here, not design tooling |
| superdesign `dsh/` glue | files | plugin `0.6.0` | **yes** | installed | **DROP** | `index.js` + `cordis.patch.yml` only register the skill on dsh; no standalone value |
| dsh-skill / -filesystem / -badge / -office | npm pkg family | global npm | **yes** | n/a | **DROP** | harness skill-provider contract; we have native skills |
| vercel, @maximhq/bifrost, semgrep, @anthropic-ai/claude-code, `skills` (ecosystem CLI) | global npm | global npm | no | installed | **NOT-RELEVANT** | deploy / security / the agent CLI itself / skill manager — not design build tools |

---

## 3. Prioritized port plan (next moves)

1. **Generate the Structural Emergence design system with `framesmith`** —
   `generate_design_system` (warm-ivory seed + "editorial/technical" personality)
   → concrete color, font-pairing, radius, density, elevation, motion tokens.
   This directly replaces the stale dark `--apt-*` layer.
2. **Validate tokens with `systembridge-mcp`** — `generate_system`,
   `check_contrast`, `audit_scale_compliance` to prove WCAG + scale discipline.
3. **Verify the rendered theme with `designlang`** — `verify_ui`,
   `list_failing_contrast_pairs`, `compute_drift` against the ivory palette;
   use this to confirm the 7 broken-landing images + clipped Overview KPI fixes.
4. **Use the design skills as the build bar** — `frontend-design` +
   `design-taste-frontend` + `ui-workflow` + `dataviz` + `impeccable` +
   `hallmark` while retheming; `superpowers` process skills for planning/review.
5. **Nav + docs** — `codebase-memory-mcp` (graph) + `typescript-lsp` (nav) +
   `context7` (Angular 22 docs) throughout.
6. **In-browser verify** — `playwright` plugin to confirm the retheme renders.
7. **Security** — rotate the leaked `better-design` Bearer token and keep
   `.mcp.json` (repo root) out of commits.

**Do NOT invest in**: the `@deepseek-ai/dsh` family and its `dsh-*` subpackages —
it is a separate agent harness, not portable design tooling.
