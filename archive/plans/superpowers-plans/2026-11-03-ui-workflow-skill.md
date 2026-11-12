# UI Workflow Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one Copilot skill for UI design, implementation, review, and validation in this Vite + Preact repository.

**Architecture:** Add one discoverable skill under `.github/skills/ui-workflow/`. Keep its task paths in one concise `SKILL.md`, write original repo-specific guidance, and link the public sources that informed it.

**Tech Stack:** Markdown skill metadata; existing Vite, Preact, TypeScript, and Vitest project checks.

**Spec:** `docs/superpowers/specs/2026-11-03-ui-workflow-skill-design.md`

## Global Constraints

- Keep `AGENTS.md` authoritative, especially the active Vite + Preact constraint, auth-demo disclosures, scope boundaries, and build requirement.
- Do not modify application source, routes, dependencies, environment files, or agent settings.
- Keep the skill concise and actionable; one skill file only.

## Review Focus

- Skill description must discover UI build, redesign, review, and testing requests.
- Preact/Vite and shared-component/style conventions must be explicit, not React/Tailwind boilerplate.
- Browser validation must not assume Playwright or add dependencies.
- Accessibility, responsive layout, and interactive states must appear in both implementation and review guidance.
- Project guardrails and local-demo authentication wording must remain authoritative.

---

### Task 1: Create the UI Workflow Skill

**Files:**
- Create: `.github/skills/ui-workflow/SKILL.md`

**Interfaces:**
- Consumes: `AGENTS.md`, the approved UI workflow spec, and repository scripts in `package.json`.
- Produces: a skill with `name: ui-workflow`, a descriptive trigger covering UI design/build/review/testing, and separate concise paths for orienting, implementation, review, and validation.

- [x] **Step 1: Create the skill file** with valid YAML frontmatter, project-specific UI guidance, conditional design-handoff guidance, validation commands, and provenance links. Follow the source-adaptation and exclusion rules in the spec.
- [x] **Step 2: Review the skill content** against each Review Focus item above; confirm no source text or platform-only instructions were copied into the skill.
- [x] **Step 3: Run repository checks** with `npm run build` and `npm run test:unit -- --run`; both should exit successfully.
- [x] **Step 4: Check the diff** to confirm only the planned skill file was added and no app/runtime/dependency files changed.
