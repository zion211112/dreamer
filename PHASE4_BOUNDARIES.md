# Phase 4 — Module Boundary Enforcement (PLANNED)

APT-LABS Angular Nx monorepo reference. `apt-labs/` is not scaffolded yet, so nothing here exists — every rule below is PLANNED, not VERIFIED.

## 1. nx.json project tags (PLANNED)

Tag taxonomy: `scope:shared | scope:domain | scope:feature` and `type:ui | type:util`.

Example tags block (one per project in `nx.json`):

```json
{
  "projects": {
    "shared-ui": {
      "tags": ["scope:shared", "type:ui"]
    }
  }
}
```

## 2. ESLint `@nx/enforce-module-boundaries` depConstraints (PLANNED)

Config style: `.eslintrc` (Nx-generated `eslintrc.base.json` + per-project `.eslintrc.json`), not flat `eslint.config.js` — Nx 21 / Angular 21 scaffolding still targets `.eslintrc`.

```json
{
  "rules": {
    "@nx/enforce-module-boundaries": ["error", {
      "depConstraints": [
        { "sourceTag": "type:ui", "onlyDependOnLibsWithTags": ["type:ui", "type:util"] },
        { "sourceTag": "scope:feature", "onlyDependOnLibsWithTags": ["scope:shared", "scope:domain", "scope:feature"], "notDependOnLibsWithTags": ["type:application"] },
        { "sourceTag": "scope:feature-work", "notDependOnLibsWithTags": ["scope:feature-commons", "scope:feature-network", "scope:feature-work", "scope:feature-records", "scope:feature-intelligence"] }
      ]
    }]
  }
}
```

Rules expressed precisely:
- `type:ui` libraries may depend only on `type:ui` + `type:util`.
- Each `libs/features/*` may depend on `libs/shared/ui`, `libs/ontology`, and its own scope only; never on sibling feature libraries or on the shell app (`type:application`). Tag each feature lib with its own `scope:feature-<lib>` tag and list all feature tags in `notDependOnLibsWithTags` to enforce sibling isolation.
- The Angular shell app (`type:application`) may depend on all.

## 3. libs/ tree with tags (PLANNED)

| Library | Tags |
|---|---|
| `libs/ontology` | `scope:domain`, `type:util` |
| `libs/shared/ui` | `scope:shared`, `type:ui` |
| `libs/features/commons` | `scope:feature`, `type:util` |
| `libs/features/network` | `scope:feature`, `type:util` |
| `libs/features/work` | `scope:feature`, `type:util` |
| `libs/features/records` | `scope:feature`, `type:util` |
| `libs/features/intelligence` | `scope:feature`, `type:util` |
| `libs/identity` | `type:util` |
| `libs/proof` | `type:util` |
| `libs/graph` | `type:util` |

## 4. Enforcement commands (PLANNED)

```bash
npx nx show projects
npx nx run-many --target=lint --all
```

`nx show projects` confirms every library carries its tags. `nx run-many --target=lint --all` runs ESLint with `@nx/enforce-module-boundaries`; any boundary violation exits non-zero and fails lint.

CI (PLANNED): run `npx nx run-many --target=lint --all` on every PR and merge; a boundary violation fails the build because lint fails. Gate merges on green lint.
