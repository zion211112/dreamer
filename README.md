# APT-LABS (dreamer)

APT-LABS makes fragmented productive capacity visible, connectable, governable,
locally retained, and cumulative.

The application is a standalone, zoneless Angular workspace with six primary
contexts: Home, Commons, Network, Workbench, Records, and Intelligence. Value,
Ontology, and Sovereignty remain accessible as secondary pages.

## Stack

- Angular 22.3 + strict TypeScript
- Angular CLI build and unit-test runners
- Playwright route smoke tests
- Browser-local demo; Supabase fallback when configured

## Commands

```sh
npm ci
npm start
npm run build
npm test
npm run test:e2e:chromium
```

## Routes

| Route | Context |
|-------|---------|
| `/landing` | Public landing |
| `/sign-in`, `/sign-up` | Demo auth |
| `/workspace` | Home |
| `/workspace/commons` | Commons |
| `/workspace/network` | Network directory |
| `/workspace/network/people` | People |
| `/workspace/network/institutions` | Institutions |
| `/workspace/network/capabilities` | Capability claims |
| `/workspace/workbench`, `/workspace/workbench/:pilot` | Workbench |
| `/workspace/value` | Value (secondary) |
| `/workspace/records`, `/workspace/records/{canon,annals,roll}` | Records |
| `/workspace/intelligence` | Intelligence |
| `/workspace/ontology` | Ontology (secondary) |
| `/workspace/sovereignty` | Sovereignty (secondary) |
| `/benben-os` | Benben School Console |

Unknown routes render an explicit not-found page.

## Benben School Console

`/benben-os` is a standalone, multi-tenant CBC school console: learners, guardians,
enrolment, attendance, assessments with auto-marking, confirmed marks, term reports and
report cards, fee structures, invoices, payments, staff roles and teaching assignments.
Every record is scoped by `school_id`; a member only sees the school they belong to.

- UI: lazy Angular routes in `src/app/features/benben-os/`, one design layer in
  `benben-os.css`, responsive down to a 390px phone and print-ready report cards.
- API: Express router in `src/server/benbenos/`, mounted at `/api/benbenos` beside
  Better Auth. Marking, permissions, money, CBC levels and report rules are pure
  functions in `libs/benbenos/` shared by server and UI.
- Data: `src/server/db/migrations/0004_benbenos_school_management.sql`; all tables are
  prefixed `bb_` and can live in the main APT-LABS database or a separate one.
- Demo: seed with `BENBENOS_DATABASE_URL=... npx tsx scripts/seed-benbenos.ts`, then
  sign in as the invited principal (`principal@benben.demo`; the invite is claimed on
  first sign-in). The seed refuses to run when the demo school already exists.
- Tests: `npm test`, `npx vitest run libs/benbenos`, and
  `BENBENOS_TEST_DATABASE_URL=... npx vitest run tests/benbenos.api.spec.ts`. The API
  spec truncates `bb_%` tables, so point it at a dedicated test database.

## Documentation

- `AGENTS.md` — repository guardrails and current stack map
- `QUICKSTART.md` — development tools and setup
- `docs/architecture.md` — current technical architecture
- `docs/domain-model.md` — six-structure domain model
- `docs/decisions/` — accepted architectural decisions
- `docs/design/charter.md` — constitution and design principles
