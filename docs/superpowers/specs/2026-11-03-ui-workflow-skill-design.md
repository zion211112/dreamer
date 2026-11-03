# UI Workflow Skill Design

## Goal

Create one workspace-scoped Copilot skill that guides UI design, implementation, review, and browser validation in this repository. The skill should be useful for the active Vite + Preact app without changing runtime behavior or adding dependencies.

## Location and Trigger

Create `.github/skills/ui-workflow/SKILL.md`. Its description should trigger for requests to build, redesign, implement, review, or test a web UI, including accessibility, responsive behavior, and provided design references.

## Workflow

The single skill will keep four concise, task-specific paths:

1. **Orient**: inspect the target UI, nearby components/styles, route, and project instructions before proposing changes. Preserve unrelated behavior and respect `AGENTS.md`.
2. **Design and implement**: use the app's Preact/Vite structure, shared components, and `src/styles.css`; match the product context and provided references; make accessible, responsive controls and meaningful states; avoid unnecessary dependencies and generic template styling.
3. **Review**: assess visual hierarchy, consistency, keyboard/focus behavior, semantics, contrast, responsive layout, and state completeness against the request and existing design conventions.
4. **Validate**: run the narrowest available check, then `npm run build` as the repository gate. Run `npm run test:unit -- --run` when the touched behavior warrants it. Use browser/screenshot tools when available; do not assume Playwright is installed or add it just for a skill.

For design handoffs, use supplied screenshots/specifications or an available Figma integration as input, but translate them into existing project conventions. Do not prescribe unavailable Figma MCP operations.

## Source Adaptation

Write original, repository-specific guidance informed by transferable ideas from:

- Anthropic skills: [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design), [webapp-testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing), and the visual-design portion of [web-artifacts-builder](https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder).
- OpenAI Codex plugins: [frontend-app-builder](https://github.com/openai/plugins/tree/main/plugins/build-web-apps/skills/frontend-app-builder), [product-design](https://github.com/openai/plugins/tree/main/plugins/product-design), and [figma-implement-design](https://github.com/openai/plugins/tree/main/plugins/figma/skills/figma-implement-design).

Include these as provenance links in the skill. Do not copy source text or platform-specific scripts, APIs, scaffold instructions, or brand styling. Exclude Claude artifact packaging, ChatGPT Apps SDK workflows, Figma canvas-editing operations, and unrelated slide/document themes.

## Constraints

- Keep `AGENTS.md` authoritative, especially the active Vite + Preact constraint, auth-demo disclosures, scope boundaries, and build requirement.
- Do not modify application source, routes, dependencies, environment files, or agent settings.
- Keep the skill concise and actionable; one skill file only.

## Validation

Review the skill frontmatter and trigger description, run `npm run build`, run `npm run test:unit -- --run`, and inspect the final diff for scope. No browser run is required because this change adds guidance only, not UI behavior.
