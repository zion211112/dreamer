# APT-LABS Workspace: Preact Port and Product Design

**Status:** Preact migration is explicitly approved. An additive Preact workspace slice is implemented and verified against the current local API; full parity, independent review, and cutover remain `PLANNED`.
**Scope:** Replace the Angular browser application incrementally. Preserve the existing Express, Better Auth, PostgreSQL/Drizzle, domain, authorization, and API contracts unless a later approved decision changes them.

## Decision summary

APT-LABS is one shared productive network, not an assortment of role dashboards. Keep the current primary destinations from charter B1—Home, Commons, Workbench, Network, Records. Make the Workbench task- and undertaking-centred; expose the typed object explorer as supporting Reference, not a sixth primary module. Preserve the six ontology structures and B13 shared-kernel/domain-protocol/focused-experience model.

**Target browser stack:** Preact + TypeScript + Vite. Use Preact's native hooks for view-local state; add `preact-iso` only if route-level behavior is required and keep route state in the URL. Keep rendering framework out of `libs/ontology` and `libs/domain`. Prefer semantic HTML and the existing Structural Emergence CSS tokens to a new component or styling system. Do not add React-compat, global client state, Nx, SSR, graph-renderer alternatives, or an agent runtime without a separately demonstrated need.

**Keep unchanged:** Node/Express API, Better Auth and session cookies, same-origin `/api` boundary, PostgreSQL + Drizzle (B12), server-side authorization, Zod studio query contract, existing evidence distinctions, and route/API behavior that already has regression coverage. Do not import or run databases, migrations, credentials, schemas, or servers from any attachment.

## Experience design

### Global shell

- Compact left rail: Home, Commons, Workbench, Network, Records. Each item is a real route and marks the current page; at small widths, use an accessible disclosure/bottom navigation rather than a shrinking icon rail.
- Topbar: APT-LABS identity, current authorized working context, global search/command entry, and session controls. Do not imply an institution or role is active until server-backed membership context establishes it.
- Supporting Reference/object explorer remains secondary, reached through the shell footer or command/search—not promoted to global primary navigation.
- Page head follows charter B6: context, record/page name, one operational sentence, one primary action, optional quiet actions; show at most three decision-relevant metrics.
- Use existing warm ivory/forest/earth palette, editorial record headings, readable sans UI, and restrained mono readouts from `src/styles.css`. No generic card wall, fabricated counts, fake graph, decorative gradients, or fake online/offline status.
- Every route has loading, empty, error/retry, and forbidden states. Every action has visible keyboard focus, disabled/pending feedback, and a consequence; mobile is a first-class layout.

### Home / My Desk

Home is a personal queue, not a KPI dashboard: decisions needing the viewer, offers to answer, work they accepted, reports needing an eligible separate reviewer, and recent authorized changes. Only show categories the current server/API actually supplies. Avoid turning the current prototype's narrow records into invented commitments, deadlines, exceptions, or assignments. Provide a calm empty state that names the actual next step.

### Workbench and undertaking

Workbench prioritizes the existing end-to-end flow and the viewer's role in it. Keep the current server-owned journey: publish scoped undertaking → submit interest → organization issues offer → participant accepts/declines → participant reports → a different authorized person reviews. Keep organization management/publishing contextual, not interleaved with every task queue row.

An undertaking is a connected operational record, not a giant table or an implied universal pipeline. Its header identifies the work and commissioning organization, scope, actual status, author/time, and current viewer position. Contextual sections should map only to available records: **Brief** (purpose/scope), **People** (interests, offers, participants), **Delivery & review** (reports and separate reviews), and **History** (attributable events). A right-side “Your position”/actions panel is useful on wide screens; on narrow screens it becomes an explicit drawer or inline region. An action is shown only when both the server-provided action projection and server authorization permit it; the server remains authoritative.

Do not present work-report acceptance as physical truth or formal verification; separate claims, evidence, assessments, and review decisions. Do not infer settlement, contribution value, credentials, mandate, or protocol status from a report or offer. Preserve event history; make service errors and conflicts recoverable.

### Other destinations

Commons discovers open work using currently authorized server data. Network shows only visible people/institutions and their scoped relationship; never turn a person into inventory or infer capacity from membership. Records presents authorized objects/history through distinct Canon, Annals, and Roll lenses without implying a universal truth. Reference remains a supporting typed object/query surface. Intelligence, a generic Studio builder, Connect portal, offline sync, and a universal Field app are not asserted as implemented or primary destinations.

## Architecture and migration boundaries

1. **Kernel:** Keep `libs/ontology` and `libs/domain` provider-independent; remove framework dependencies from shared data/query contracts as each consuming surface is migrated. Preserve current zod query types and APIs.
2. **Data boundary:** Preact uses small typed fetch/session modules over existing same-origin API endpoints. Browser receives no DB credentials and cannot grant permissions. Keep deny-by-default server authorization and preserve existing errors, idempotent/unique constraints, and audit behavior.
3. **UI boundary:** Preact route/screen components own rendering and local transient state. Reuse tokens and domain contracts, not Angular DI/signals/components. Make navigation accessible and deep-linkable.
4. **Migration:** Migrate one complete, reversible route slice at a time. Keep Angular and its route available until the corresponding Preact route passes unit/browser/API regression criteria. Cut over the default entry only after all supported routes and auth/session behavior have parity. Remove Angular packages/config only in that final cutover, as a separately reviewable change.
5. **Infrastructure:** Keep `npm start`/API semantics and Docker Compose PostgreSQL local-only setup. Vite serves the browser app in development and proxies `/api` to the current API; production serving/deployment topology is `UNKNOWN` until the actual deployment contract is inspected and verified. Do not use attachment SQLite or Supabase as an alternative runtime.

## Distillation of supplied material

- **`agon-agent_2-50311869.zip`:** The single `src/App.tsx` is about 87 KB and couples navigation, forms, commands, offline queue, graph, studio, intelligence, and view state; its API uses Supabase, wildcard CORS, and hard-coded persona authority. Retain only the useful operational-desk, contextual undertaking, relationship, field-usability, and clear action-feedback ideas. Reject its client-selected personas as authority, fabricated authority registry, broad CORS, parallel Supabase data model, unverified offline queue, and monolithic UI. The attachment's React/Vite project is not Preact-ready evidence.
- **`drafting-apt-labs-workspace-directive.zip`:** The Next.js prototype has valuable undertaking sections (brief, mandate, participants, work, resources, evidence, outcomes, history), consequence-oriented actions, and role-aware inspection concepts. Its Next server actions, DB seed/schema, authorization assumptions, and layout are a separate implementation, not portable contracts. Adapt the sections only where real current API records support them; do not introduce its 9-stage workflow, fictional institutions, value records, or builder/federation systems as shipped functionality.
- **`workspace-01a2197b-c765-7583-b159-1c4ef000a1f0.zip`:** A Vite React app couples a very large undertaking view to a standalone Express/SQLite engine and includes `data/aptlabs.db` plus WAL/shared-memory files. Its tests demonstrate assertions against its own synthetic engine/fixtures, not current API behavior, production authorization, or factual verification. Borrow separation-of-duties as a testable workflow property only where the existing API implements it. Do not copy the database, seed content, role system, cryptographic/credential claims, offline sync, or alleged security guarantees.
- **`pasted-text.txt`:** Strong strategic synthesis: productive cooperation, an undertaking as an organizing record (not one mega-row), role-aware desk, evidence/provenance, integration with—not replacement of—ERP/accounting, institutional maintenance as a possible first commercial wedge, and one complete vertical workflow before broadening. The proposed OPERATE/STUDIO/CONNECT environments and broad capability lists are future hypotheses. Keep B1's current five-destination rail and Reference secondary; do not implement a universal workflow engine, Studio authoring platform, federation, VC signing, AI runtime, or mobile offline layer without an approved real use case and evidence.

## Acceptance criteria for the port (full migration; not yet met)

1. Preact is the active browser UI after final cutover; no Angular application runtime, Angular UI packages, or Angular CLI build remains in the final dependency graph.
2. All supported routes/deep links, Better Auth sign-in/up/session/guard behavior, same-origin API cookies, and scoped organization/workbench actions work end-to-end.
3. Existing workbench and studio API isolation tests, unit tests, browser route coverage, strict typecheck, and production build pass on the cutover tree; current DB schema and existing data are not destroyed or rewritten by a renderer migration.
4. Shared ontology/domain contracts have no Angular/Preact imports; all original server-side authorization remains the effective authority.
5. UI truthfully labels report/review/evidence/settlement states, exposes server-computed actions only, provides all required loading/empty/error/forbidden states, and meets the existing WCAG AA/a11y conventions at desktop and mobile widths.
6. Independent review confirms migration scope, route parity, regression evidence, no attachment-sourced secrets/data, and no claims of offline/production/cryptographic verification not supported by runtime evidence.

## Not in this decision

No database change, schema replatform, auth provider switch, Preact-to-Angular bridge as permanent architecture, React-compat layer, microfrontend, Nx adoption, new protocol runtime, generic builder, graph database/Sigma backend, service integration, offline synchronization, financial flow, cryptographic credential or production deployment is authorized by this frontend decision.
