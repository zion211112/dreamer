# APT-LABS Site Maintenance Contract

## Current truth boundary

This repository ships a local-first prototype and an explicit evidence record. It does **not** ship verified deployments, beneficiary counts, procurement records, unit economics, open-source licensing, funding, partnerships, or institutional outcomes.

The two public registers start empty. Records entered in a browser remain device-local until exported. A hash proves record integrity only; it does not prove truth.

## Non-negotiable rules

- Do not add seeded people, builds, projects, costs, votes, or impact figures to public routes.
- Do not add a credential gate that implies authentication. The console is not a server-backed product.
- Do not publish a partnership, grant, beneficiary, deployment, registration, award, licence, or cost-saving claim without a cited evidence-pack record.
- Keep `lib/company.ts` as the runtime source of truth for published identity claims.
- Keep `docs/EVIDENCE-PACK.md` as the human evidence record; update both together.
- Internal doctrine belongs under `docs/internal/` and must not enter `app/`, `components/`, or `lib/company.ts` public copy.
- Every public architecture route needs metadata, robots treatment, and sitemap treatment unless it is explicitly local-only.

## Validation

Run before every commit:

```sh
npm test
npm run lint
npx tsc --noEmit
npm run audit
npm run build
```

The audits are not cosmetic. They reject stale public framing, fake gate credentials, re-seeded public records, dead demo constants, and grant-lens drift.
