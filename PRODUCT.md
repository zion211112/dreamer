# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Angular 22.3, zoneless, standalone components, TypeScript strict, signal-based state. Existing codebase under `apt-labs/`.

## Users

Productive-capacity coordinators in African communities and institutions: makerspace coordinators, graduates, institutional stewards, developers auditing government software, sociologists, high-school students, university researchers. Primary job: discover demand, compose cooperation, execute work, capture evidence, create recognition, and improve future coordination — all on one shared record.

## Product Purpose

APT-LABS is infrastructure for making fragmented productive capacity visible, connectable, governable, locally retained, and cumulative. It structures relationships between people, crews, institutions, assets, skills, needs, opportunities, work, and evidence so they become legible and actionable. Success means a completed activity updates six structures and three dimensions simultaneously, compounding trust and coordination.

## Positioning

Not a generic SaaS dashboard, job board, marketplace, blockchain product, or AI chatbot. The moat is a framework-free typed core (ontology + commitment journey + evidence standing) plus an ontology-native interface where relationships, standing, and authority gates are the primary material — not chrome.

## Operating Context

Browser-local demo (localStorage) first; Supabase fallback when env vars set. Six modules: Home, Commons, Network, Workbench, Records, Intelligence. Zoneless Angular 22 signal-based state shared through CoordinationService spine. Cytoscape and @ngxpert/cmdk already installed but unused.

## Capabilities and Constraints

- Fifteen typed ontology families; first-class versioned relationships; evidence standing ladder (never averaged into a score); authority-gated commitment lifecycle; productive-reality cycle.
- Charter constraints: Person ≠ Asset; Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement; no universal reputation score; no blockchain prerequisite.
- No framework change. No new npm dependencies without justification. Do not rewrite the application.
- Design language: Structural Emergence (charter B4) — warm ivory base, earthy neutrals, restrained sage/deep forest/ink, selective lilac/peach accents; editorial serif for record names; sans/mono for interface.
- Six shell panes (charter B3): topbar, rail, sidebar, main, inspector, dock; statusbar separate. Page-head hierarchy (charter B6): eyebrow → h1 → subtitle → primary action → quiet actions → L3 metrics.

## Brand Commitments

"Structural Emergence" design language per charter B4. Warm ivory, earthy neutrals, sage, forest, lilac/peach. Serif record names; sans/mono interface. No generic SaaS dashboards, no endless card grids, no decorative gradients/glassmorphism, no arbitrary rounded corners, no fake spatial depth.

## Evidence on Hand

Real code: Angular 22 app at `apt-labs/src/`, domain lib at `apt-labs/libs/`, ontology at `apt-labs/libs/ontology/`. Design docs: `docs/design/charter.md`, `docs/ontology.md`, `docs/design/superior-fusion-design-system.md`, `docs/design/token-audit.json`, `docs/design/contrast-results.json`. Benchmark extractions: `design-extract-output/` (Linear, Palantir, Airtable, Retool, Vercel). No client photographs; no real data.

## Product Principles

1. One action updates six structures and three dimensions simultaneously.
2. Evidence is a named state, never a score; authority gates are explicit, never silent.
3. Canonical distinctions never collapse in UI; relationships are first-class versioned records.
4. No decoration without structural or experiential reason; every interaction has a clear consequence.
5. Framework-free core; UI is a thin, replaceable shell over deterministic domain logic.

## Accessibility & Inclusion

WCAG AA contrast on all text tokens. Keyboard-first navigation. Reduced motion support. Screen-reader labels on interactive elements. No sensitive personal information on public blockchain; no blockchain prerequisite for participation.