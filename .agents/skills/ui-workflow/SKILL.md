---
name: ui-workflow
description: "Use when designing, building, redesigning, extending, reviewing, or testing web UI in this repository, including responsive behavior, accessibility, and design handoffs."
---

# UI Workflow

Use this skill for user-facing interface work in the active application. Follow the repository's `AGENTS.md` first; this skill does not widen the requested route or feature scope.

## Orient

- Identify whether the task is new UI, a change to an existing surface, a design review, or behavior testing.
- Read the target route/component, nearby styles and tests, and the applicable repository instructions before editing.
- State one local hypothesis about the requested behavior and the cheapest check that could disconfirm it. Make the smallest change that tests that hypothesis.
- Preserve existing visual language and interaction patterns unless the user asks for a redesign. For unclear requirements that would materially change the result, ask one focused question.

## Design and Implement

- Build for the actual audience and task. Operational workspace screens should favor clear hierarchy, scanability, comparison, and efficient repeated actions over marketing layouts or decorative cards.
- Make the usable experience the first screen. Avoid generic template styling, filler content, feature-explanation copy, nested cards, decorative blobs, and visual effects without a product purpose.
- Use expressive, context-appropriate typography and a balanced palette. Keep text readable and fitted to its container; do not size type with viewport width or use negative letter spacing.
- Use familiar controls for their jobs: labeled inputs, checkboxes or toggles for binary settings, selects or menus for option sets, tabs for views, and icon buttons for clear commands. Use the existing icon library when available and provide accessible names or tooltips for unfamiliar icons.
- Implement complete states that the requested workflow needs, including focus, hover, active, selected, disabled, loading, empty, success, and error states. Preserve keyboard operation, semantic markup, visible focus, and sufficient contrast.
- Keep layouts responsive without overlap or unstable control sizing. Use meaningful motion sparingly and never let animation hide focus or state.
- Prefer real product-relevant imagery and assets when the task calls for them; do not replace inspectable subject matter with generic decoration.

### Repository Conventions

- The active application is Vite + Preact + TypeScript with Wouter. Do not introduce Next.js, React-only patterns, or a backend as part of a UI iteration.
- Reuse controls and patterns from `src/components/`; keep shared visual tokens and auth-page styles in `src/styles.css` where applicable.
- Follow current route, state, data, and CSS conventions. Do not add a dependency when existing project or browser capabilities are enough.
- Keep authentication explicit as a browser-local demo. Do not store passwords or imply that demo identities, OAuth, workspace records, or actions are connected to live services or transactions.
- Leave unrelated routes and behavior unchanged. Historical code and design experiments in `bin/` are reference-only unless the user asks otherwise.

### Design Handoffs

- When the user supplies a Figma design, screenshot, or specification, inspect the available source context and visual reference before implementation. Use provided assets rather than placeholders when they are accessible.
- Translate the reference into the project's components, tokens, routing, and state patterns. Treat design output as a specification, not code to paste unchanged.
- Compare the result with the supplied reference at relevant viewport sizes and record meaningful deviations caused by accessibility or technical constraints.
- Use Figma integrations only when they are actually available. Do not invent tool calls, MCP servers, assets, or design details.

## Review

When asked to review a UI, lead with concrete usability, accessibility, responsive, or behavioral findings, ordered by impact and tied to the relevant files. Check:

- Whether the screen supports the user's stated task and preserves surrounding flows.
- Whether hierarchy, spacing, typography, color, and component geometry are coherent with the existing product.
- Whether controls have correct semantics and labels, keyboard/focus behavior, and clear state feedback.
- Whether text, controls, and media remain legible and non-overlapping across narrow and wide layouts.
- Whether browser-visible data is treated as public and no secrets or security enforcement rely on client code.

Separate observed issues from assumptions. If no issues are found, say so and note any validation gaps.

## Validate

- After a substantive UI edit, run the cheapest behavior-scoped or component check available before doing more work.
- Run `npm run build` before shipping. Run `npm run test:unit -- --run` when the changed behavior is covered by or relevant to the unit suite.
- If browser or screenshot tools are available, verify the changed flow and relevant responsive states in the rendered app. Inspect console errors when appropriate.
- Do not assume Playwright is installed. Do not add browser-test tooling just to follow this skill; use available project/browser tools and state what could not be verified.
- Report checks actually run and any remaining visual or interaction gaps.

## Source Inspiration

This repository-specific workflow is original guidance informed by transferable ideas from:

- Anthropic skills: [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design), [webapp-testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing), and the visual-design guidance in [web-artifacts-builder](https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder).
- OpenAI Codex plugins: [frontend-app-builder](https://github.com/openai/plugins/tree/main/plugins/build-web-apps/skills/frontend-app-builder), [product-design](https://github.com/openai/plugins/tree/main/plugins/product-design), and [figma-implement-design](https://github.com/openai/plugins/tree/main/plugins/figma/skills/figma-implement-design).

Do not import platform-specific artifact bundling, ChatGPT Apps SDK workflows, Figma canvas-editing APIs, or source scripts into this project.
