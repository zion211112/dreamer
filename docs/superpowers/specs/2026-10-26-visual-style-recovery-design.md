# Visual Style Recovery Design

## Goal

Restore a designed visual presentation for the public landing page and the
primary workspace shell, which currently render without their page-level styles.

## Diagnosis

The root layout imports `src/styles.css`, which retains design tokens and
shared utilities. The current stylesheet has no landing-page or workspace-shell
selectors. The latest stylesheet restoration removed the prior appended shell
styles along with duplicated global rules, leaving the page markup largely
unstyled.

## Design

Add scoped rules to `src/styles.css` for the landing page and shared workspace
shell. Use the existing semantic color, typography, spacing, and elevation
tokens; do not reintroduce the removed `:root`, reset, or `body` declarations.
Preserve the existing page/component markup and responsive behavior, and keep
interactive controls consistent with the shared control styles.

The recovery scope is limited to the public landing page and the primary
workspace shell. Other routes, application behavior, and unrelated refactoring
are out of scope. Existing untracked CSS scratch files are not inputs and must
remain untouched.

## Validation

Run the smallest relevant project checks, including typecheck/build as feasible.
Inspect the landing page and workspace at desktop and mobile widths to confirm
the stylesheet loads, colors and layout are restored, and responsive behavior
remains usable.
