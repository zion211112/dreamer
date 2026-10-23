# APT-LABS User Profile Menu Design

## Goal

Make the signed-in user profile the private, session-scoped place to review identity, capability and application context across the app. Keep it in a compact avatar-triggered menu: no profile route and no change to login or the public front door.

In Workspace, make the existing floor selector quieter and smaller without changing its nested selection behavior or other header elements.

## User experience

### Shared profile menu

Use one reusable profile-menu component in signed-in application headers: Workspace, Commons, Roll, Tender, and Assembly surfaces. It appears only when server-side authentication has established a signed-in user. Existing public and unauthenticated header behavior remains unchanged. The sign-in form remains unchanged; after sign-in, the authenticated identity supplies the profile data.

The avatar trigger opens a compact popover anchored to the current page. Its identity header shows the user’s name and derived Roll rank. Five in-menu controls replace the popover’s content without navigation:

- **Overview:** derived rank, verified build count, earned Roll badge count, and a concise profile summary.
- **Capability & interests:** editable self-described skills, work interests, and learning goals.
- **Activity:** only real verified Roll records and session actions that are actually available; never synthetic activity or placeholder counts.
- **Wallet & banks:** the signed-in user’s capital-intent records and their actual statuses. Label signaled, withdrawn, and settled-offline records accurately. Do not call intents bank balances, deposits, withdrawable funds, or connected banking.
- **Settings:** session-only profile display name, visibility preference for future application sharing, and clear sign-out access.

Dismissal, Escape, outside click, and focus behavior follow the existing shared dropdown conventions. On narrow screens, the popover fits the viewport and remains usable without covering or shrinking the floor selector.

### Profile data and privacy

Editable profile fields—display name override, capability tags, work interests, learning goals, and local preferences—are held in `sessionStorage` and reset when the browser session ends. They are not encrypted, synced, or multi-user. Do not include student or school-console records.

Use server-verified identity and a user-scoped server read for account-derived data. Read the signed-in user’s own Roll capability records and capital intents; do not rely on the consent-gated public profile view to render the owner’s private menu. Rank is derived using the existing Roll thresholds and verified deployments only. Badges are the existing Roll capability badges; do not represent them as on-chain SBTs unless an implemented system actually issues those tokens.

Surface read and parse errors explicitly using repository-standard error handling. Do not replace failed reads with success-shaped zero counts. A genuinely empty result is shown as empty; unavailable data is identified as unavailable.

### Applications

In Work Engines, selecting **Apply for a job** opens the shared profile menu at **Capability & interests**, with the selected asset shown as context. It does not create a session-only application or claim that a role was submitted. If no connected live role exists, state that clearly.

For a real Commons opportunity, retain its existing server-side application and authorization flow. The user reviews the application note and explicitly selects whether to share profile information and Roll proof with the authorized issuer. Session-only capability details may be offered as user-reviewed input to that note; they are not silently transmitted or treated as verified credentials. Roll sharing remains governed by its existing consent control.

### Workspace floor control

Reduce the Workspace floor-trigger footprint and visual opacity/weight while preserving its current-floor label, accessible name, nested menu, locked-floor behavior, and keyboard interaction. Do not change the user-menu trigger, Workspace layout, or any non-Workspace header.

## Architecture and scope

- Extract the profile popover UI into one reusable client component used by signed-in `SiteHeader` surfaces and the custom Workspace header.
- Add a server-side, authenticated loader for the current user’s Roll and capital-intent summary. Bind every query to the verified `auth.uid()` and retain row-level security; do not accept a caller-supplied user ID as authority.
- Keep editable values client-side in session storage, with validation and versioned serialization so malformed stored data is reported/cleared safely rather than silently misrepresented.
- Have the shared menu accept server-loaded user data and session-local editable values. Do not add a profile database table, migration, bank provider, wallet connection, SBT minting, or new public-profile behavior.
- Connect the Work Engines CTA to the menu’s capability section using an in-page callback/state, not a new route or existing Tender submission endpoint.
- Keep floor-selector CSS changes limited to the Workspace trigger’s size and translucency.

## Error and empty states

- Missing optional display name: use the authenticated email’s local part as a visual fallback, not as a persisted profile claim.
- No Roll records: show “New builder” / no verified builds / no earned badges, using the same rank thresholds as the Roll.
- No capital intents: show that no capital records are available; never imply that a connected wallet was checked.
- Capital query or Roll read failure: show an explicit unavailable state and preserve the rest of the menu.
- Local session data invalid or unsupported: explain that local profile data could not be read and offer to clear that session data.
- No live Work Engines role: preserve the asset context and capability editing, but do not show a successful application message.

## Acceptance criteria

1. Authenticated users can open the same profile menu from each signed-in application header; unauthenticated and public header behavior is unchanged.
2. Profile sections toggle inside the menu and do not navigate away.
3. Editable fields survive navigation and reload within the same browser session, then reset with that session; the UI states they are not encrypted, synced, or multi-user.
4. Capability claims remain visibly self-described and separate from Roll-verified rank and badges.
5. Roll and capital data are fetched only for the authenticated user, with explicit empty and error states.
6. Wallet labels do not suggest a bank connection, payment provider, withdrawable funds, or blockchain SBTs.
7. Work Engines **Apply for a job** opens the capability section with the chosen asset context and does not save or submit a fake application.
8. Existing Commons applications retain server-side checks and explicit profile/Roll-sharing consent.
9. The Workspace floor trigger is smaller and more translucent while nested selection, keyboard accessibility, lock behavior, and other headers remain unchanged.
10. Focused tests cover authenticated/unauthenticated menu visibility, section toggles, session-only storage, owner-scoped data and failure states, asset-context CTA behavior, and floor-trigger behavior.

## Out of scope

Login/sign-up redesign, public front-page redesign, new profile routes or public profile changes, profile persistence to Supabase, banking or payment integration, blockchain/SBT issuance, new application backend, student data, broader floor/navigation redesign, and unrelated page or style changes.
