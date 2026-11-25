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

Unknown routes render an explicit not-found page.

## Documentation

- `AGENTS.md` — repository guardrails and current stack map
- `QUICKSTART.md` — development tools and setup
- `docs/architecture.md` — current technical architecture
- `docs/domain-model.md` — six-structure domain model
- `docs/decisions/` — accepted architectural decisions
- `docs/design/charter.md` — constitution and design principles
