# Radar Spatial Design

## Status

Approved by the user for specification on 2026-11-04. This document defines a
Radar-only design direction. It does not authorize implementation of a shared
backend or claim production readiness for 10,000 users.

## Goal

Make Radar a trustworthy way for people and responsible stewards to notice,
locate, examine, and respond to community signals without turning a report
into a fact, a map into a verdict, or a Commons decision into authority to
commission work.

The selected visual direction is **B — Spatial radar**: place and pattern lead
the first read, with a synchronized queue and a contextual record inspector.
The map is an instrument for orientation and discovery, not decoration or a
source of truth.

## Product boundary

Radar owns:

- Reports and observations, including source, scope, location precision,
  consent, evidence on hand, unknowns, and review state.
- Commons proposals and steward decisions, with their decision basis and
  attributable history.
- Links from sufficiently described signals to Undertakings.

Radar does not own work applications, terms, selection, authorization,
delivery, or acceptance. Those belong to Undertakings. Approval of a Commons
proposal does not by itself authorize expenditure or work. Reporting, review,
and mapping do not establish that a condition is true.

## Primary experience

### Desktop

1. A scope control and visible audience label establish which community or
   institution's records are in view.
2. An aggregated map occupies the primary workspace. It shows approximate
   areas and clusters, not reporter-level pins by default.
3. A synchronized signal queue supports search, filters, pagination, and
   keyboard operation. Selecting a cluster narrows the queue; selecting a
   signal opens its inspector.
4. The inspector identifies the signal's source and visibility, location
   precision, evidence and missing checks, review state, assigned reviewer,
   decision history, and the next accountable action.
5. Map and queue remain independently usable. A map selection never silently
   changes a record's status or audience.

The record inspector must not imply that one record is verified simply because
it is selected, clustered, reported repeatedly, or nearby to other reports.

### Mobile and constrained connectivity

- Default to a readable, paginated list; make the map optional.
- Provide a text equivalent for each map cluster and action, including
  accessible names and keyboard support where applicable.
- Avoid requiring tiles to read a signal, understand its status, or take an
  allowed next action.
- If map tiles or aggregate data fail, show an explicit error and preserve
  list/search use. Never silently broaden the audience or substitute all
  records.

## Record lifecycle and trust states

The visible signal states are:

**new → under review → awaiting information / linked to proposal → closed**

Every transition records who acted, when, the authority basis when relevant,
and a reason. Closing requires a recorded reason. Corrections and disputes
remain attributable and visible to permitted viewers; they do not erase the
original report or decision.

The interface must keep these distinctions visible:

- Reported is not verified.
- Triage is not investigation or authorization.
- A cluster or count is not corroboration or urgency.
- A Commons decision is not authority to commission or fund work.
- A link to an undertaking does not mean work has been accepted or completed.

Reporter urgency may be recorded as the reporter's own note. Radar must not
silently convert it, volume, popularity, or geographic density into a
credibility or priority score.

## Privacy and audience

- New signals are scoped to the relevant institution or community by default.
- Cross-scope sharing is deliberate and attributable; it is not inferred from
  a map viewport or from the fact that a record exists.
- Map aggregation must respect the viewer's record permissions. Counts,
  clusters, search results, and empty states must not leak restricted records.
- Reporter identity and exact location are not displayed on the map by
  default. More precise disclosure requires a documented need, appropriate
  authority, and consent where applicable.
- Aggregation thresholds and location generalization must be selected and
  tested against re-identification risk before real sensitive data is mapped.
- Duplicate reports may be linked as related observations. Their distinct
  sources and histories are preserved; merging must not imply independent
  corroboration.
- Support correction, dispute, evidence restriction, and a clear explanation
  of who can see each record.

## Information architecture and visual direction

Preserve the current APT-LABS forest-and-paper visual language and workspace
shell. Give Radar a precise cartographic treatment: restrained map marks,
legible scope and uncertainty, clear hierarchy, and no crypto-gold, faux
command-center effects, or decorative heatmaps.

On desktop, use a map, queue, and contextual inspector as coordinated views
within one module. On narrow screens, prioritize list and record content; do
not force a compressed three-column layout. Map/list state must be
understandable without relying on color alone.

Radar may retain Signals, Proposals/Decisions, and related Commons views, but
the map is a context for signals—not a replacement for decision records or a
second work marketplace. Any opportunity discovery action routes to
Undertakings.

## Data and service boundary

The current Radar implementation uses browser-local records and illustrative
examples. The first implementation of this design remains a clearly labeled
local demo; it must not suggest shared, authoritative, or multi-user state.
The approved visual direction does not authorize a backend migration,
provider integration, or changes to institutional authority.

The production shape required before a 10,000-active-user claim includes:

- A shared service that enforces identity, scoped permissions, and
  consequential transitions server-side.
- Permission-scoped aggregate queries and paginated signal queues; the client
  must not download the full dataset and filter it as an authorization
  boundary.
- Protected evidence storage, durable attributable event history, correction
  and dispute handling, backups, recovery, moderation, and participant
  support.
- Idempotent writes and explicit loading, empty, stale, denied, validation,
  and failure states.
- Load, privacy, and abuse testing against a defined workload. “10,000 active
  users” must be translated into concurrency, request rates, data volume,
  geographic distribution, and service-level expectations before it is a
  testable capacity target.

MapLibre GL with vector rendering is the design assumption for progressive
zoom and aggregation. No production tile or geocoding provider is selected.
The browser-local prototype may show a static mock-provider scene made from
fictional geometry and sample markers, solely to demonstrate visual hierarchy.
It must be labelled as a simulation, remain independent of signal records, and
make no requests to tile, geocoding, or location services. Such a scene is not
a map of Kenya or any other real place. Provider selection requires a separate
review of privacy, retention, availability, coverage, costs, and low-bandwidth
behavior. Until then, the interface must work in list mode and any map shown
with real service data must not be represented as operational.

Map and aggregate failures are surfaced explicitly. A failure must not fall
back to unscoped data, fabricate counts, or imply success.

## Rollout and validation

Validate the workflow with a bounded real pilot and accountable participants
before widening scope. Measure:

- Time from report to responsible review and disposition.
- Unassigned and aging queue items, by permitted scope.
- Clarification, correction, and dispute rates and their resolution.
- Whether participants understand audience, location precision, and what
  “under review” does and does not mean.
- Map usefulness compared with list-only use, including on low-end devices
  and constrained connections.
- Privacy incidents and false inferences caused by clustering or counts.

Do not treat registration count, map density, or report volume as evidence of
impact, truth, or service readiness.

## Acceptance criteria for a future implementation plan

- The selected initial surface is spatial-first on desktop and list-first on
  narrow or constrained devices.
- Map clusters and counts use the same permission scope as the queue and
  never expose individual reporter locations by default.
- Selecting a cluster filters the visible queue; selecting a record exposes
  source, uncertainty, evidence, status, and allowed next action.
- The list remains operable when map assets or map data fail, with an explicit
  error rather than a silent fallback.
- All current Commons signal, proposal, and decision behavior remains
  reachable and semantically distinct from Undertakings.
- Demo data is explicitly illustrative and browser-local; no shared-service
  or 10,000-user readiness claim is introduced.
- Tests cover state distinctions, scope handling, map/list synchronization,
  failure behavior, accessible alternatives, and route preservation.
- Production scale is not claimed until service controls and workload-based
  validation are implemented.

## Out of scope

- Building or choosing a production backend, map-tile provider, or geocoder.
- Public-by-default signal discovery, exact reporter pins, or a national
  firehose.
- Automated truth, credibility, urgency, or popularity scoring.
- Turning Commons decisions into institutional spending or work authority.
- Replacing the APT-LABS shell or redesigning other workspace modules.
- Claiming this frontend design alone supports 10,000 active users.
