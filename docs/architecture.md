# APT-LABS — Current Architecture

This document describes the active application. Product principles and durable
design decisions live in `docs/design/charter.md` and `docs/decisions/`.

## Stack

| Layer | Technology |
|---|---|
| Application | Angular 22.3 standalone components |
| Change detection | Zoneless (`provideZonelessChangeDetection`) |
| Language | Strict TypeScript |
| Build and unit tests | Angular CLI |
| Browser route tests | Playwright |

The repository root is the Angular CLI project. The retired Vite/Vue site and
investor deck are no longer active applications.

## Commands

Run from the repository root:

- `npm start` — start the Angular development server
- `npm run build` — create the production build
- `npm test` — run Angular unit tests
- `npm run test:e2e:chromium` — run Playwright route smoke tests

Vercel serves `dist/apt-labs/browser` with an SPA fallback for Angular routes.

## Repository layout

```text
src/
  main.ts
  app.ts
  app/
    app.routes.ts       — route table
    app.config.ts       — browser and zoneless configuration
    features/           — standalone screens
libs/
  ontology/             — domain types, cycles, commitments, evidence standing
  domain/               — domain library
  shared/state/         — shared reactive state and CoordinationService
  shared/ui/            — shared UI primitives
  shell/                — shared shell components
public/                 — retained static assets; only configured assets are built
```

Feature screens read the shared state spine from `@apt-labs/shared/state` so
records remain consistent across the workspace.

## Routes and contexts

`src/app/app.routes.ts` is the route source of truth. The workspace shell exposes
six primary contexts: Home, Commons, Network, Workbench, Records, and Intelligence.
Value, Ontology, and Sovereignty are secondary destinations.

- Public: `/landing`, `/sign-in`, `/sign-up`
- Home: `/workspace`
- Commons: `/workspace/commons`
- Network: `/workspace/network`, `/workspace/network/people`,
  `/workspace/network/institutions`, `/workspace/network/capabilities`
- Workbench: `/workspace/workbench`, `/workspace/workbench/:pilot`
- Value: `/workspace/value`
- Records: `/workspace/records`, `/workspace/records/canon`,
  `/workspace/records/annals`, `/workspace/records/roll`
- Intelligence: `/workspace/intelligence`
- Ontology: `/workspace/ontology`
- Sovereignty: `/workspace/sovereignty`

Network and Records subroutes select their view from the URL. Unrecognized paths
render the explicit not-found page.

## Auth and persistence

The app supports browser-local demo auth and a Supabase fallback when its
environment variables are configured. Platform roles include `public`,
`authenticated`, `admin`, `moderator`, `trustAdmin`, and
`credentialIssuerAdmin`; actor roles and types are defined in the auth domain.

No universal reputation score or blockchain prerequisite is required for
participation (charter A8).
