# Workbench Contributor Finder Design

**Status:** Approved
**Date:** 2026-11-01

## Goal

Make Workbench a focused contributor-facing place to find a work context and
express interest, without turning it into an IDE, workflow dashboard, or
multi-step application wizard. Keep the existing manual simulation available
without letting it dominate the default Workbench experience.

The current app is a browser-local demo. Its example listings and interest
records are not connected services, live opportunities, or messages sent to an
institution.

## Product direction

Use the existing Studio shell, with a contributor finder as the main content:

- **Workspace context:** retain Studio navigation and visual language.
- **Finder structure:** keep a compact opportunity list beside one focused
  detail pane. Selecting an item updates the detail pane without leaving the
  finder. On narrow screens, show either the list or detail, with a clear
  back-to-list action.
- **Detail density:** start with a short summary. Put the full example brief
  and open terms behind a “View details” disclosure.
- **Workbench destinations:** keep the in-page destinations *Find work*,
  *My interest*, and *Create / simulate*. The finder is the default.
- **Simulation:** preserve the existing isolated manual simulation and its
  records as a distinct secondary activity.

The selected direction is intentionally a hybrid of a workspace shell and a
focused finder—not an IDE. An IDE explorer/editor/inspector would keep setup
chrome permanently visible for a simple discovery task. A wizard would hide
the list and add steps before a contributor can inspect work. A workflow board
would introduce lifecycle statuses that the local demo cannot truthfully
advance. The list/detail split preserves comparison and context while leaving
the actual task as one selection and one optional interest action.

## Contributor flow

### Find work

1. Browse a small list of available local examples.
2. Select an example to inspect its concise summary and local-example status.
3. Optionally disclose the full details and terms.
4. Choose *Express interest* if desired. No pitch, profile sharing, or
   confirmation dialog is required.

The list may have a simple search over the example title, context, and
discipline. Do not add filter systems, sorting controls, or workflow columns
until real listing volume and user needs justify them.

Every listing must be explicitly identified as a **local example, not a live
opportunity**. Do not infer publication, availability, institutional review,
provider assignment, or a connected relationship from the static data. Show
unknown terms as unknown, not as defaults. Do not invent compensation,
timing, rights, authority, institution responses, or evidence.

### Interest in the current demo

Expressing interest creates a non-binding signal in this browser only. The
confirmation must say that it was saved here and no one was contacted. The
signal is not an application, a commitment to work, or an institution
notification.

*My interest* lists only the current browser’s locally stored interest
signals. It must not display or imply an institution response. A contributor
can remove a signal; this removes only the local record and does not imply an
external withdrawal.

One browser-local interest signal is allowed per opportunity. Repeated
activation must not create duplicates. The record must not contain a
contributor name, profile evidence, pitch, or other identifying information.
Do not silently migrate or reinterpret existing application records as
interest signals.

### Boundary before real work starts

This demo ends at local interest and cannot negotiate terms, contact an
institution, receive a response, or authorize work. Do not add simulated
acceptance or authorization steps to this flow.

For a future connected workflow, work must not start until:

1. Final scope and terms are defined.
2. Both contributor and institution explicitly accept those finalized terms.
3. The institution explicitly authorizes the start.

These are real-world product boundaries, not actions available in this
browser-local demo.

## Secondary simulation lane

Keep the current Console → manual simulation composer as a separate,
secondary *Create / simulate* destination. Preserve its simulation data and
semantics: it is isolated, manually run, and does not publish work, contact
providers, authorize delivery, or write production records.

Use `/workspace/workbench` for the contributor finder. Add
`/workspace/workbench/simulate` for the existing simulation composer and
preserve `/workspace/field-desk` as a compatibility alias to that composer.
Do not revive the unused, multi-step application/review workflow in
`WorkbenchOpportunityFlow`.

## Data and state

Reuse the current static work opportunity examples only as explicitly labeled
local examples. Keep their source content as the source of truth; do not
fabricate missing offer terms.

Add a small, versioned browser-local interest store under a new storage key,
separate from the existing local application and simulation stores. An
interest record contains only:

- a unique local record ID
- the opportunity ID
- creation time

Removal deletes the matching record. Store reads and writes must validate the
record shape and report errors visibly. Do not return an empty success state
after a storage error. Do not change, migrate, or write to existing
application, simulation, Console, Commons, People, or Institutions stores.

## Interface and accessibility

- Keep the Studio shell and shared navigation.
- Hide the shared profile/identity entry on Workbench routes so the finder
  does not present a fallback demo identity as a connected contributor
  account. Leave identity display on unrelated Studio routes unchanged.
- Use a concise in-page Workbench navigation for *Find work*, *My interest*,
  and *Create / simulate*.
- On desktop, keep the list and selected detail visible together.
- On mobile, use a single-column list/detail transition with a clear back
  action; do not squeeze the split view into unreadable columns.
- Use semantic buttons for selection and actions, visible keyboard focus,
  accessible names for the list and detail, and announce save/error feedback
  with appropriate status/alert semantics.
- Clearly distinguish local examples and browser-local interest from live
  opportunities or sent applications.

## Error behavior

- If interest storage cannot be read, show an actionable error and do not
  claim there are no saved interests.
- If an interest cannot be saved or removed, keep the prior visible state,
  show an error, and do not show a success confirmation.
- Invalid or unsupported stored data must be reported; do not silently reset
  or overwrite it.
- If a referenced opportunity is no longer available in the local example
  set, report the unresolved record safely rather than implying it was
  submitted or accepted.

## Validation and acceptance criteria

### Domain and storage tests

- Valid interest records are read and written in the new isolated store.
- Invalid, corrupt, or unsupported records fail explicitly.
- Storage read, write, and removal failures surface errors.
- Repeated interest for one opportunity is idempotent.
- Removing interest affects only that opportunity’s local signal.
- Existing application and simulation records remain unchanged and are not
  converted to interest records.
- No contributor identity or profile data is stored in interest records.

### UI and route checks

- `/workspace/workbench` opens the contributor finder by default.
- Selecting an opportunity updates the desktop detail pane.
- On a narrow viewport, detail has a clear return-to-list action.
- *My interest* reflects local saved/removal state and never shows an
  institution response.
- Save/remove success and error messages accurately describe browser-local
  behavior.
- Every listing is labeled as a local example, never a live opportunity.
- Workbench routes do not show the shared fallback profile identity; unrelated
  Studio routes retain their current identity behavior.
- `/workspace/workbench/simulate` and `/workspace/field-desk` both retain the
  manual simulation, while existing simulation data remains readable.
- `npm run build` succeeds; focused unit tests cover interest storage and
  existing simulation/application isolation.

## Out of scope

- Backend services, live opportunity feeds, notifications, or institution
  accounts.
- Applicant profiles, profile evidence sharing, or identity-linked interest.
- Application pitches, review queues, automated matching, or workflow boards.
- Simulated agreement, acceptance, authorization, delivery, or credential
  issuance in the contributor finder.
- Changes to unrelated Studio routes or existing local workflow records.
