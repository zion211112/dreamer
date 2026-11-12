# Studio Shell and Identity Cabinet

## Status

Design sections approved on 2026-10-30. This specification is awaiting user review before implementation planning.

## Purpose

Apply the left-pane Studio navigation from the Workbench visual direction to every workspace destination: People, Institutions, Commons, and Workbench. Remove the global top route switcher so Studio remains one coherent workspace rather than four pages joined by a header.

Replace the current compact account popover with a responsive identity cabinet. The cabinet should make the future APT-LABS identity model legible—personhood, capabilities, institutional roles, work and value records, credentials, and portability—without asserting that unconnected identity, authority, payment, or credential services exist.

## Scope and routes

- Keep the active Vite + Preact + TypeScript + Wouter application.
- Apply the shared shell to `/workspace/people`, `/workspace/institutions`, `/workspace/commons`, and `/workspace/workbench`.
- Preserve `/workspace/field-desk` as the existing alias for Workbench.
- Do not add a fifth account route or move route navigation into page-specific headers.
- Keep each page's own title, tabs, search controls, and task actions in its content area; remove only the shared top route/navigation header.
- Leave landing, sign-in, and sign-up outside the Studio shell and preserve their current behavior.

## Studio shell

Use the common `WorkspaceLayout` as the single shell for all four destinations.

### Desktop

- Full-height, persistent left sidebar, approximately 235–250 px wide, using the deep forest surface from the approved Workbench direction.
- Top: APT-LABS brand mark and the Studio label.
- Primary navigation: exactly four labeled destinations in this order—People, Institutions, Commons, Workbench—with the active route visibly marked and exposed using `aria-current="page"`.
- Bottom: profile entry that opens the identity cabinet, followed by a quiet session/environment indicator.
- Main content occupies the remaining width, retains its page-specific heading and controls, and can scroll independently. Do not add another global route bar above it.
- Do not add a separate collapsible desktop icon rail in this pass; all destinations remain labeled and visible.

### Mobile and narrow layouts

- The sidebar becomes an accessible slide-in drawer, as selected by the user.
- A compact Studio bar provides a menu trigger and current destination. Activating it opens the same four-item navigation; selecting a destination closes the drawer.
- The drawer has a backdrop, close control, Escape handling, focus management, and appropriate dialog/navigation semantics. It must not trap focus after being closed.
- The drawer must not turn into a horizontally scrolling top route switcher.

### Shared behavior

- Route navigation uses real links or the repository's existing Wouter navigation pattern, not fake controls.
- Direct entry to any workspace URL, browser back/forward navigation, and the Workbench alias keep the correct destination active.
- Preserve visible keyboard focus, reduced-motion behavior, adequate contrast, and a useful narrow-screen hit target.
- The current Workbench local-only status remains visible. Do not imply external services are connected from a global Studio shell.

## Identity cabinet

### Form and interaction

- Desktop: a right-side overlay cabinet beside the persistent sidebar, with a subdued backdrop and a width sufficient for dense but readable identity context.
- Mobile: a full-height sheet that does not obscure its close control or session information.
- Opens from the profile entry at the bottom of the Studio sidebar. It is not a fifth Studio destination.
- Closes using an explicit close button, Escape, and an outside click where appropriate. Focus returns to the profile trigger. Use dialog semantics and avoid background keyboard interaction while modal.
- Organize information into sections rather than one dense profile card.

### Information hierarchy

1. **Profile and session:** show the person/profile record separately from the browser-local sign-in session. The current app's sign-in is a local demo, not an authenticated APT-LABS identity. Show a stored email only as local session data. Use Kemoly Murage as the requested default profile when there is no named profile, clearly marked as a local profile; keep any local session email separate.
2. **Capabilities:** show profile capability text from the People record as self-described. Do not render capabilities as credentials or verified skill claims.
3. **Credentials and claims:** distinguish issuer-verified credentials from reported claims. The current People fixture reports three APT-LABS design SBTs without linked issuer/status references. If displayed, show them only as “3 reported,” mark issuer/status unavailable, and state that they are not cryptographically verified. Do not fabricate a credential object, wallet, signature, rank, badge, or issuer.
4. **Institutions and authority:** display memberships separately from permissions. With no connected authorization source, show that no verified membership or reviewer/issuer authority is connected. Never infer authority from a profile affiliation or route.
5. **Work and value:** distinguish accepted contributions, payment obligations, and settlements. Show only attributed records; currently show that no accepted contribution or settlement is connected. Do not display token balances or claim that a payment occurred.
6. **Portability and session controls:** retain the existing People-profile navigation, portable People-record export, and sign-out behavior. State that sign-out ends the browser-local session. Do not add nonfunctional “manage wallet,” OAuth, security-key, or institution-switch controls.

### Data and provenance

- Reuse existing People profile and portable export sources where available. Do not introduce a second profile store solely for the cabinet.
- The local `authUser` record is browser state, not proof of identity, institutional membership, role, or authorization.
- Credential status requires authoritative issuer and status information. A self-reported SBT or locally seeded record is never enough to display “verified.”
- Future sections can receive Supabase, issuer, work, or settlement data later through typed interfaces, but this design does not add or simulate those integrations.
- If local storage cannot be read, present an actionable error in the cabinet instead of silently substituting verified-looking data.

## Visual direction

- Follow the supplied Workbench left-pane reference: dark forest navigation, warm paper content, restrained brass active marker, serif page hierarchy, and compact mono labels.
- Keep navigation quiet; the active route receives the strongest treatment, not all four destinations.
- The identity cabinet uses a lighter paper surface and layered information cards. Use provenance labels as part of the content hierarchy rather than generic “demo” badges on every item.
- Use shared visual tokens and all shell/account styles in `src/styles.css`.
- Reuse the existing brand and portable-record helper. Avoid introducing a UI dependency or a new icon package.

## Implementation boundaries

Expected integration surfaces:

- `src/pages/workspace/WorkspaceLayout.tsx`: full-height shared rail/content shell and current-context treatment.
- `src/components/WorkspaceHeader.tsx`: replace the horizontal global route header with the sidebar and responsive navigation drawer, while preserving profile actions.
- `src/styles.css`: shell, active navigation, mobile drawer, overlay, account cabinet, responsive and accessibility states.
- `src/App.tsx`: no route changes expected; verify all four routes already use `WorkspaceLayout`.

Do not redesign page-specific content in People, Institutions, Commons, or Workbench beyond changes required to fit the shared shell. Do not change sign-in behavior, authentication architecture, credentials, payments, Commons authority, or external service configuration.

## Verification

- Production build and type-check pass.
- Each of the four Studio routes and the Workbench alias render the same sidebar with the correct active item; none render the old top route switcher.
- Page-specific headings and task controls remain present and usable.
- Direct route entry and back/forward navigation keep the sidebar state correct.
- Mobile drawer opens, navigates, closes on route selection, Escape, and explicit close; keyboard focus returns to its trigger.
- Identity cabinet opens from every Studio route, preserves current context, and closes with Escape/backdrop/control while returning focus.
- Keyboard-only navigation and reduced-motion behavior remain usable.
- Test local-profile, email-present, empty-record, unavailable-storage, and export-error states. No state labels a reported or unconfigured credential as verified.
- Existing export and sign-out actions still behave as before; no password is stored or exposed.
