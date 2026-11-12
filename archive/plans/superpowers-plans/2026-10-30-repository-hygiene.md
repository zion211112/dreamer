# Repository Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the README and ignore rules in line with the active APT-LABS app while preserving all files and runtime behavior.

**Architecture:** Documentation-only and narrowly scoped `.gitignore` updates; no source moves, deletions, or app changes. Keep local planning/session and generated tool output ignored by exact paths.

**Tech Stack:** Markdown, Git ignore rules, Vite, Preact, npm.

**Spec:** `docs/superpowers/specs/2026-10-30-repository-hygiene-and-app-layout-design.md`

## Global Constraints

- Preserve the current `src/` layout and behavior.
- Do not remove scratch/session files or change `bin/`.
- Do not inspect, expose, or commit environment-file contents.
- Add no dependencies or tooling.

## Review Focus

- Auth copy could imply live authentication; state that identity is browser-local and passwords are not stored.
- A route could be omitted or misrepresented; document all routes in the approved spec, including the Field Desk alias.
- Local tool ignores could hide active source; ignore only `.kilo/`, `.superpowers/`, `scripts/.build/`, `scripts/.verify/`, and `supabase/.temp/`.
- Existing ignored scratch artifacts must remain untouched; verify ignore changes do not stage or delete them.
- Documentation/config changes must not affect the application; run the production build.

---

### Task 1: Update repository guidance

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: Current routes and boundaries from the approved design spec.
- Produces: A current app overview and precise ignore rules; no runtime interface changes.

- [x] **Step 1: Rewrite the stale README overview**

Document the active Vite + Preact app, local development and production build commands, routes `/`, `/sign-in`, `/sign-up`, `/workspace/people`, `/workspace/institutions`, `/workspace/commons`, `/workspace/workbench`, and `/workspace/field-desk` (Workbench alias). Explain that auth and workspace records are browser-local demo data, no passwords are stored, and no external services or live transactions are implied. Describe `src/`, `docs/superpowers/specs/`, and `bin/` as active app, design specs, and historical archive respectively.

- [x] **Step 2: Add only the approved narrow ignore entries**

Add exact directory rules for `.kilo/`, `.superpowers/`, `scripts/.build/`, `scripts/.verify/`, and `supabase/.temp/`. Preserve all existing rules; do not ignore the entire `scripts/` or `supabase/` directories.

- [x] **Step 3: Review the exact diff and ignore behavior**

Run `git diff --check` and inspect `git diff -- README.md .gitignore`. Confirm `git check-ignore` identifies the five approved paths and that active paths such as `scripts/` and `supabase/` themselves are not ignored. Confirm no scratch files, environment files, or archive contents are staged or deleted.

- [x] **Step 4: Verify the app remains buildable**

Run `npm run build`.

Expected: build succeeds without changes to application source or runtime behavior.
