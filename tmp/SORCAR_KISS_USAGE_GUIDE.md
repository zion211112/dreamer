# How to Best Use Sorcar and KISS

## Overview

**Sorcar** is the AI Assistant (you're talking to it now). **KISS** (KISS AI) is the multi-model, multi-modal, multi-agent framework that powers Sorcar and enables you to build your own agents, workflows, and automations.

- **Repo**: https://github.com/ksenxx/kiss_ai
- **Website**: https://kisssorcar.github.io/
- **Version**: 2026.10.6
- **Creator**: Koushik Sen (ksen@berkeley.edu)

---

## Core Capabilities

### Sorcar (The Assistant)
- Software development, computer control, research, paper writing, presentations
- Multi-agent orchestration via voice or internet
- Shopping, banking, messaging, email, browsing, data science
- Git operations, CI/CD, deployments

### KISS Framework (The Platform)
- **Multi-model**: Access to Claude (Opus/Sonnet/Haiku/Fable), GPT, Gemini, local models
- **Multi-modal**: Text, voice, vision, code execution
- **Multi-agent**: Spawn specialized subagents (research, planning, coding, review)
- **Persistent memory**: File-based memory at `~/.claude/projects/{project}/memory/`
- **Scheduled automations**: Cron jobs via the `cron` agent
- **Messaging integrations**: Slack, Discord, Telegram, Email, Gmail, WhatsApp, SMS, Matrix, ntfy, Home Assistant, etc.
- **VS Code extension**: IDE integration
- **Worktree isolation**: Safe parallel development

---

## Best Practices for Using Sorcar/KISS

### 1. **Start with Context, Not Assumptions**
- Sorcar reads your repository, git status, and relevant files before acting
- Provide access to relevant files/directories upfront
- Use `glob`, `grep`, `read` to explore before editing

### 2. **Use the Right Tool for the Job**

| Task | Tool |
|------|------|
| Broad codebase exploration | `Agent` (Explore type) |
| Architecture planning | `Agent` (Plan type) |
| Complex multi-step research | `Agent` (general-purpose) |
| Parallel independent tasks | `run_parallel()` or `Agent` fleet |
| Shell commands / builds | `Bash` or `run_commands_parallel()` |
| Web research (10+ sites required) | `go_to_url()` + `WebFetch`/`WebSearch` |
| Multi-agent orchestration | `Workflow` tool |
| Scheduled/recurring tasks | `CronCreate` or `run_agent("cron", ...)` |
| External messaging | `run_agent("slack|discord|email|...", ...)` |

### 3. **Leverage Multi-Agent Workflows**
- **Research phase**: Fan out Explore agents to gather info
- **Design phase**: Use Plan agent + judge panel of multiple perspectives
- **Implementation**: Spawn coding agents with worktree isolation
- **Review**: Pipeline review dimensions → adversarial verification
- **Quality**: Run `uv run check --full` once at end (lint, typecheck, tests)

### 4. **Memory System**
- Write persistent facts to `~/.claude/projects/{project}/memory/`
- Types: `user`, `feedback`, `project`, `reference`
- Link memories with `[[memory-name]]`
- Update `MEMORY.md` index after each write
- Check existing memories before creating duplicates

### 5. **Web Research Protocol (MANDATORY)**
- **Default**: Search the web unless you're 100% confident
- **Minimum**: 10 distinct websites per research session
- **Process**: Create `./tmp/information-{id}.md`, update counter after each site
- **Real-time data**: Always fetch current data (weather, stocks, news)

### 6. **Code Quality Standards**
- Simplest, clean, readable, minimal code
- Named functions over closures
- Eliminate unnecessary abstractions
- Fix root causes, not symptoms
- Public methods need full docstrings
- 100% branch coverage on new/modified code (e2e tests only)

### 7. **Testing Philosophy**
- End-to-end tests only — no unit tests, no mocks
- Test actual behavior, not structure
- Run impacted tests in parallel (split by test methods)
- Lint/typecheck once at end via `uv run check --full`

### 8. **Context Management**
- If >80% context used: `finish(success=False, is_continue=True, ...)`
- Periodic summaries every 10 steps (9, 19, 29...) via `summary()` tool
- Pre-finish verification: re-read task, run checks, be honest

---

## KISS-Specific Workflows

### Running External Agents
```bash
# Dispatch to a channel agent (Slack, Discord, etc.)
run_agent("slack", "Post summary to #general")

# Schedule a cron job
run_agent("cron", "Every weekday 9am: run smoke tests")

# Run an agent script file
run_agent("/path/to/agent-script.py", "Analyze PR #42")
```

### Multi-Agent Orchestration (Workflows)
```javascript
// Use Workflow tool for deterministic orchestration
export const meta = { name: "audit", description: "Full codebase audit", phases: [...] }
const results = await pipeline(items, reviewer, verifier)
```

### Desktop Automation
- `screenshot()` — capture screen
- `click()`, `press_key()`, `type_text()` — interact with apps
- `show_browser()` — make browser visible for human interaction

---

## Project-Specific Guidance (APT-LABS / dreamer)

Based on your repository structure:

### Epistemic Framework (`lib/epistemic/`)
- **Core types**: `model.ts` — Claim, Inference, Assumption, Counterfactual, Source, Evidence, GuardEvent, Trace, Branch
- **Guards**: `guard.ts` — 9 detectors (causality, assumptions, decay, corroboration, contradiction, consensus, fact-collapse, amplification, fluency)
- **Branches**: `branches.ts` — Anti-median diversity tracking
- **Trace**: `trace.ts` — Reasoning chain with INTUIT/BOOTSTRAP/ATTACK/REPLACE stages

### Design System
- Tokens: `lib/design-tokens.ts` → migrating to `tokens/epistemic.ts` (per RECOMMENDATION.md)
- CSS: `app/globals.css` — source of truth for scale/contrast checks
- Checks: `check:scale`, `check:contrast`, `check:lexicon`, `check:epistemic`

### Site Architecture (`app/(site)/`, `components/site/`)
- Routes: `/`, `/stack`, `/lattice`, `/register`, `/intelligence`, `/control`, `/evidence`, `/product`, `/console`
- Components: Navigation, HomeHero, Graph, registers, evidence tags

### Recommended Next Steps (from RECOMMENDATION.md)
1. **Token Unification** — Replace `design-tokens.ts` with `tokens/epistemic.ts`
2. **Plate Component** — Build `Plate.tsx` as homepage (single viewport, no scroll)
3. **Epistemic Components** — Port primitives to visible components
4. **Guard Demos** — Interactive `/guard/{event}` pages running real detectors

---

## Common Patterns

### Research → Implement → Verify
```bash
# 1. Research (web + codebase)
Agent(Explore) → WebFetch(10+ sites) → tmp/ideas.md

# 2. Judge ideas pairwise → pick winner
# 3. Implement → e2e test → log metrics
# 4. If better: compose with prior winners
# 5. Search fresh ideas (exclude explored)
```

### Adversarial Testing
```bash
# Subtask 1: Break the system (adversarial tests)
# Subtask 2: Fix the issues
# Repeat until robust
```

### Quality Gates
```bash
npm run check  # typecheck + lint + scale + contrast + lexicon + epistemic + build
```

---

## Key Principles

1. **No AI Slop** — No filler, hedging, invented facts, generic imagery, emoji overuse, content-free repetition
2. **Honesty** — Report failures, don't weaken tests to pass
3. **Simplicity** — Simplest code that works; fix root causes
4. **Verification** — Machine-checked, not asserted
5. **Evidence** — Every claim needs evidence state (VERIFIED, PROTOTYPE, TARGET, PLANNED, DEMONSTRATION, UNKNOWN)
6. **Sovereignty** — Records held at source; identity earned through work

---

## Quick Reference: Essential Commands

```bash
# Development
npm run dev          # http://localhost:3000
npm run build        # Production build
npm run check        # Full gate (run before commit/deploy)

# Checks
npm run check:scale       # Type ladder, tracking, space grid
npm run check:contrast    # WCAG ratios + state temperature order
npm run check:lexicon     # Vocabulary boundaries
npm run check:epistemic   # Evidence/guard behavior

# Git
git status
git add -A && git commit -m "message" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Resources

- **KISS AI Repo**: https://github.com/ksenxx/kiss_ai
- **Sorcar Website**: https://kisssorcar.github.io/
- **MODEL_INFO.json**: `~/.kiss/MODEL_INFO.json` (available models)
- **History DB**: `~/.kiss/history.db` (all tasks/events)
- **Memory**: `~/.claude/projects/{project}/memory/`

---

*This guide saved to `tmp/SORCAR_KISS_USAGE_GUIDE.md` for future reference.*