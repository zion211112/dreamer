# APT-LABS Institutions & Assets Register

**Status:** Design approved; implementation delivered and automated validation passed

**Date:** 2026-11-01

## Purpose

Redesign the existing Institutions / Assets register as a concise, trustworthy
index of selected institutions and resources in the bundled starter network.
Make documented identity, source basis, supported relationships, and unknowns
legible, with contextual entry points only to flows that exist today. This
iteration does not establish operational capacity, availability, authority, or
financial position.

## Distilled product model

- **Institution:** an organised actor that may govern, operate, steward, or use
  resources.
- **Asset:** a resource with a potential function; a record alone does not prove
  operation, availability, ownership, condition, or value.
- **Capacity:** what institutions and assets may make possible together. It is
  a lens across records, not another record type or a financial valuation.
- **Workbench:** composes a need and optional context into an isolated
  simulation.
- **The Roll:** in the current app, only a simulated preview after a gated
  Workbench flow. There is no live ledger, verified savings, or real
  deployment/settlement.

The source note's fundamental loop is:

`local need → crew/build → maker-owned evidence → verified savings → reinvestment`

APT-LABS currently supports only parts of this loop. UI copy must not imply
that a prototype, report, simulation, or project-reported claim is a verified
transaction or operating result.

## Confirmed scope

The bundled starter network and its default Institutions / Assets register
retain exactly these five approved starter-seed records:

| Type | Existing ID | Name |
|---|---|---|
| Institution | `institution-kibera-makerspace` | Kibera Makerspace |
| Institution | `mwea-water` | Mwea Water Cooperative |
| Asset | `asset-tool-library` | Community Tool Library |
| Asset | `asset-school-management-console` | School Management Console |
| Asset | `asset-kemetos1` | Kemetos1 |

Preserve these IDs. Remove other Institution and Asset entities from the
checked-in starter seed, but leave people, crews, work, and evidence entities
unchanged unless a tightly coupled relationship must be retired for integrity.
Imported portable People-network data in browser storage is user-owned and
must not be rewritten or deleted. Do not add a Capital tab, capital-record
model, financial amounts, or new financial claims.

### Starter-seed retirement manifest

Remove these entities from the bundled starter seed:

- Institutions: `institution-solar-commons`, `institution-open-design`,
  `mwea-school`, `lake-basin-cold-store`, `institution-lacesse-co`.
- Assets: `asset-microgrid`, `asset-repair-bench`, `asset-fikra-api`,
  `asset-mwea-water-pump-02`, `asset-lake-basin-cold-store-chamber-a`.

Remove relationships that reference those entities:
`nia-institution`, `jabari-institution`, `yuki-institution`, `jabari-asset`,
`nia-bench`, `asset-solar-holder`, `asset-bench-holder`, `asset-tools-holder`,
`asset-fikra-lacesse`, `asset-console-school`, `asset-pump-water-coop`,
`asset-cold-store-institution`, `work-uses-grid`, `work-uses-bench`, and
`audit-grid`. Preserve all other relationships whose endpoints remain.

Retire the dependent illustrative Commons signals
`scenario-pump-pressure`, `scenario-school-power`, `scenario-cold-room`,
`scenario-microgrid-load`, and `scenario-tool-condition`; decisions
`example-decision-pump-check`, `example-decision-school-returned`, and
`example-decision-cold-declined`; applications
`example-application-kemetos` and `example-application-animation`; work
records `example-work-microgrid` and `example-work-kemetos`; brief
`example-brief-kemoly-local`; and asset journeys `journey-microgrid`,
`journey-school-animation`, and `journey-kemetos`. Their replacement Commons
prompts are `scenario-kibera-making-space` and `scenario-mwea-water-context`;
each is illustrative, institution-only, and not a live report.

## Current cross-module flow and boundaries

1. **School Console** stores need drafts in browser-local storage. Only the
   reviewed, allowlisted need fields are handed to Commons or Workbench; learner
   data does not flow downstream.
2. **Commons** stores user-reviewed observations and requires a registered
   institution. An asset link is optional. Its governance and signals are
   browser-local.
3. **Institutions / Assets** provides stable-ID context; a relationship does
   not by itself establish ownership, authority, operation, or verification.
4. **Workbench** may reference a Console draft, Commons signal, institution,
   and asset independently. Its simulation store is isolated from source
   records.
5. **Roll** is represented only by a clearly simulated preview in the current
   Workbench flow.

There is no current Capital register or live financial/ledger integration.
Capital may be discussed as future network capacity, but this iteration only
shows existing provenance and explicit unknowns.

## Data integrity and fixture policy

- Keep all existing IDs for the five retained records.
- Remove relationships whose source or target entity is removed. Preserve
  relationships between remaining entities, including existing Kemetos1 and
  Community Tool Library links when both endpoints remain.
- Do not infer replacement links. In particular, do not associate the Console,
  Kemetos1, or Community Tool Library with an institution without a source
  relationship.
- Revise the Community Tool Library context so it no longer claims an
  institution association after its Open Design Library edge is removed.
- Retire bundled illustrative fixtures and dependent decisions, applications,
  briefs, work records, or asset journeys that reference removed entities.
- Replace the invalid Commons seed cases with two explicitly illustrative,
  institution-only prompts scoped to Kibera Makerspace and Mwea Water
  Cooperative. They must not claim an asset, condition, authority, approval,
  or real report. Do not create an asset-only Commons case or a new asset /
  institution relationship in this iteration.
- Preserve all browser-local user signals, governance records, Console drafts,
  and Workbench simulations. Do not migrate, rewrite, or delete saved data.
  Existing references to removed IDs remain readable as unresolved context;
  active selectors offer only retained records.
- Do not rewrite or delete an imported portable People-network record from
  browser storage. The existing Institutions / Assets page continues to use
  its bundled starter seed; it does not start loading imported People records
  as part of this redesign.

## Screen design

Keep the existing Studio navigation and warm editorial design language, refined
with restrained forest green, ink, paper, and brass. Reuse shared controls and
tokens in `src/styles.css`.

The page contains:

1. A clear title and short purpose statement.
2. Three filters: **All**, **Institutions**, and **Assets**, with counts.
3. Search across retained record name, type, place, and supported metadata.
4. Compact rows showing identity, type, role, location when known, and record
   basis.
5. A reusable selected-record inspector with record-specific details and
   relationships only when explicitly supported by the source.
6. Explicit unknown states such as “Not established” or “Not recorded” rather
   than blank fields or guessed values.

Do not repeat a generic “Network role / Asset profile” column. Remove generic
“Plan work” actions. Keep the existing School Console route for the
School Management Console and contextual Commons links for institutions.
Other assets open their profile; do not route them to a Workbench action that
does not actually select that asset.

Preserve the `/workspace/institutions` route and supported `record` and `q`
query behavior, including deep links from Workbench. Keep selection keyboard
accessible and responsive; the inspector stacks below the list on narrow
screens.

## Compatibility and failure behavior

- Commons and Workbench selectors continue deriving choices from the shared
  bundled starter network, so they expose only the retained institutions and
  assets.
- People, crews, work, and evidence remain in the shared network. The People
  Assets lens consequently contains only retained assets.
- Existing local records remain intact. Missing references are rendered as
  unresolved context, not replaced by a same-named record.
- Corrupt or unreadable local data continues to use existing error reporting;
  this change adds no broad catch or success-shaped fallback.
- No storage key, persistence format, route family, or authentication behavior
  changes.

## Acceptance criteria

- Exactly the five confirmed Institution / Asset entities remain in the
  bundled starter network with their current IDs.
- Every relationship in the cleaned bundled starter network resolves to an
  existing entity. Historical browser-local references may remain unresolved.
- Bundled examples and their dependent fixtures do not point to removed
  entities; the two replacement examples are illustrative and institution-only.
- Existing browser-local signals, governance, Console/Workbench data, and
  imported portable People-network records are not modified or deleted.
- The redesigned page distinguishes Institutions and Assets and preserves
  supported deep links and the School Console action.
- Unknown provenance, operation, relationships, and values are not presented as
  established facts.
- No Capital view, financial amount, or live Roll behavior is introduced.
- Focused tests pass and `npm run build` succeeds.

## Validation

- Add or update focused tests for the five retained records, relationship
  integrity, and fixture references/provenance.
- Run `npm run test:unit -- --run` and `npm run build`.
- Manually verify desktop and narrow layouts, filters, inspector selection,
  record/query deep links, and the Console / Commons links.
