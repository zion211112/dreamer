---
name: sorcar-kiss-usage-guide
description: Comprehensive guide on how to best use Sorcar (AI Assistant) and KISS (multi-agent framework)
metadata:
  type: reference
---

# Sorcar & KISS Usage Guide

**Sorcar** = The AI Assistant you're talking to now. **KISS** = The multi-model, multi-modal, multi-agent framework powering Sorcar.

## Core Capabilities
- Software development, computer control, research, papers, presentations
- Multi-agent orchestration (voice, internet, local)
- Shopping, banking, messaging, email, browsing, data science
- Git, CI/CD, deployments, scheduled automations

## KISS Framework Features
- **Multi-model**: Claude (Opus/Sonnet/Haiku/Fable), GPT, Gemini, local models
- **Multi-modal**: Text, voice, vision, code execution
- **Multi-agent**: Specialized subagents (Explore, Plan, general-purpose, code-reviewer)
- **Persistent memory**: File-based at `~/.claude/projects/{project}/memory/`
- **Cron/automations**: `run_agent("cron", ...)` for scheduled tasks
- **Messaging integrations**: Slack, Discord, Telegram, Email, Gmail, WhatsApp, SMS, Matrix, ntfy, Home Assistant
- **VS Code extension**: IDE integration
- **Worktree isolation**: Safe parallel development

## Best Practices

### 1. Context First
- Sorcar reads repo, git status, relevant files before acting
- Provide file access upfront; explore with glob/grep/read before editing

### 2. Right Tool for the Job
| Task | Tool |
|------|------|
| Broad exploration | `Agent` (Explore type) |
| Architecture planning | `Agent` (Plan type) |
| Complex research | `Agent` (general-purpose) |
| Parallel tasks | `run_parallel()` or Agent fleet |
| Shell commands | `Bash` / `run_commands_parallel()` |
| Web research (10+ sites) | `go_to_url()` + `WebFetch`/`WebSearch` |
| Multi-agent orchestration | `Workflow` tool |
| Scheduled tasks | `CronCreate` / `run_agent("cron", ...)` |
| External messaging | `run_agent("slack|discord|email|...", ...)` |

### 3. Multi-Agent Workflow Pattern
1. **Research**: Fan out Explore agents
2. **Design**: Plan agent + judge panel (multiple perspectives)
3. **Implement**: Coding agents with worktree isolation
4. **Review**: Pipeline dimensions → adversarial verification
5. **Quality**: `uv run check --full` once at end

### 4. Memory System
- Write to `~/.claude/projects/{project}/memory/`
- Types: `user`, `feedback`, `project`, `reference`
- Link with `[[memory-name]]`
- Update `MEMORY.md` index
- Check existing before creating duplicates

### 5. Web Research (MANDATORY)
- Default: Search unless 100% confident
- Minimum: 10 distinct websites per session
- Create `./tmp/information-{id}.md`, update counter per site
- Real-time data: Always fetch current data

### 6. Code Quality
- Simplest, clean, readable, minimal code
- Named functions over closures
- Fix root causes, not symptoms
- Public methods need full docstrings
- 100% branch coverage (e2e tests only, no mocks)

### 7. Testing
- End-to-end tests only — no unit tests, no mocks
- Test actual behavior, not structure
- Run impacted tests in parallel (split by test methods)
- Lint/typecheck once at end via `uv run check --full`

### 8. Context Management
- >80% context: `finish(success=False, is_continue=True, ...)`
- Periodic summaries every 10 steps (9, 19, 29...) via `summary()`
- Pre-finish verification: re-read task, run checks, be honest

## APT-LABS / dreamer Project Context

### Epistemic Framework (`lib/epistemic/`)
- `model.ts`: Claim, Inference, Assumption, Counterfactual, Source, Evidence, GuardEvent, Trace, Branch
- `guard.ts`: 9 detectors (causality, assumptions, decay, corroboration, contradiction, consensus, fact-collapse, amplification, fluency)
- `branches.ts`: Anti-median diversity tracking
- `trace.ts`: Reasoning chains (INTUIT/BOOTSTRAP/ATTACK/REPLACE)

### Design System
- Tokens: `lib/design-tokens.ts` → migrating to `tokens/epistemic.ts`
- CSS: `app/globals.css` (source of truth for scale/contrast)
- Checks: `check:scale`, `check:contrast`, `check:lexicon`, `check:epistemic`

### Recommended Next Steps (from RECOMMENDATION.md)
1. Token Unification → `tokens/epistemic.ts`
2. Plate Component → `Plate.tsx` as homepage
3. Epistemic Components → visible primitives
4. Guard Demos → interactive `/guard/{event}` pages

## Key Principles
1. **No AI Slop** — No filler, hedging, invented facts, generic imagery
2. **Honesty** — Report failures, don't weaken tests
3. **Simplicity** — Simplest code; fix root causes
4. **Verification** — Machine-checked, not asserted
5. **Evidence** — Every claim needs state (VERIFIED/PROTOTYPE/TARGET/PLANNED/DEMONSTRATION/UNKNOWN)
6. **Sovereignty** — Records held at source; identity earned through work

## Resources
- KISS AI Repo: https://github.com/ksenxx/kiss_ai
- Sorcar Website: https://kisssorcar.github.io/
- Models: `~/.kiss/MODEL_INFO.json`
- History: `~/.kiss/history.db`
- Memory: `~/.claude/projects/{project}/memory/`

---
Full guide saved to `tmp/SORCAR_KISS_USAGE_GUIDE.md`