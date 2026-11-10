# Agent Skills Arsenal Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Caveman, Ponytail, Diagram Design, and Impeccable as project-local Agent Skills, then remove the temporary `.arsenal` checkout.

**Architecture:** Use the upstream `skills` CLI targeted at GitHub Copilot, whose project skill directory is `.agents/skills/`. Install only skill content, without companion CLIs, hooks, plugins, or MCP servers. Verify all four skill entrypoints and their local support files before deleting `.arsenal`.

**Tech Stack:** Agent Skills CLI (`npx skills@latest add`), PowerShell, npm/Vite project checks.

**Spec:** [2026-11-10-agent-skills-arsenal-migration-design.md](../specs/2026-11-10-agent-skills-arsenal-migration-design.md)

## Global Constraints

- Install the four requested skills under project-local `.agents/skills/`.
- Do not install unrelated CLIs, plugins, MCP servers, or application dependencies.
- Remove `.arsenal` only after confirming all four skills are present and readable.
- Do not modify application source, dependency manifests, or unrelated agent configuration.
- Run `npm run build` and `npm run test:unit -- --run`.

## Review Focus

- **Accidental global installation:** confirm all four entrypoints are below the repository's `.agents/skills/`, not the user profile.
- **Wrong upstream skill selected:** require exact entry names `caveman`, `ponytail`, `diagram-design`, and `impeccable`.
- **Missing bundled content:** check relative file references in each `SKILL.md` resolve within the installed skill directory.
- **Premature source deletion:** remove `.arsenal` only after all skill checks pass.
- **Unrelated worktree changes:** inspect the final diff and limit changes to the new skill content and the explicitly requested source removal.

---

### Task 1: Install the four project-local skills and remove the source checkout

**Files:**
- Create: `.agents/skills/caveman/**`
- Create: `.agents/skills/ponytail/**`
- Create: `.agents/skills/diagram-design/**`
- Create: `.agents/skills/impeccable/**`
- Delete: `.arsenal/**`

**Interfaces:**
- Consumes: the four upstream repositories and their named Agent Skill entries.
- Produces: four independently discoverable skills under `.agents/skills/`.

- [ ] **Step 1: Install Caveman**

Run: `npx skills@latest add JuliusBrussee/caveman -a github-copilot -y`

Expected: project-local `.agents/skills/caveman/SKILL.md` exists.

- [ ] **Step 2: Install Ponytail**

Run: `npx skills@latest add DietrichGebert/ponytail --skill ponytail -a github-copilot -y`

Expected: project-local `.agents/skills/ponytail/SKILL.md` exists.

- [ ] **Step 3: Install Diagram Design**

Run: `npx skills@latest add cathrynlavery/diagram-design --skill diagram-design -a github-copilot -y`

Expected: project-local `.agents/skills/diagram-design/SKILL.md` exists.

- [ ] **Step 4: Install Impeccable**

Run: `npx skills@latest add pbakaus/impeccable --skill impeccable -a github-copilot -y`

Expected: project-local `.agents/skills/impeccable/SKILL.md` exists.

- [ ] **Step 5: Verify the skill tree and bundled references**

Check that all four exact entrypoints exist under the project `.agents/skills/`, enumerate their bundled files, and verify any relative paths referenced by each `SKILL.md` resolve within that skill directory. Confirm the installer did not create user-global skill copies or change application dependency manifests.

- [ ] **Step 6: Remove `.arsenal`**

Only after Step 5 passes, remove the explicitly requested project-local `.arsenal` directory.

- [ ] **Step 7: Verify cleanup and project checks**

Run: `Test-Path .arsenal; Test-Path .agents\skills\caveman\SKILL.md; Test-Path .agents\skills\ponytail\SKILL.md; Test-Path .agents\skills\diagram-design\SKILL.md; Test-Path .agents\skills\impeccable\SKILL.md`

Expected: `False`, then four `True` values.

Run: `npm run build`

Expected: exit code 0.

Run: `npm run test:unit -- --run`

Expected: all unit tests pass.

Review `git status --short` and confirm only the four skill trees and `.arsenal` removal are part of the migration; preserve unrelated pre-existing changes.
