# B11 — APT Identity and Access Architecture

| Field | Value |
|-------|-------|
| Decision ID | B11 |
| Date | 2026-11-24 |
| Status | Proposed |
| Scope | Personal identity, authentication methods, participation, organization membership, and scoped authority |
| Decision | Prefer Better Auth for production authentication, subject to a Supabase Postgres/RLS integration proof-of-concept. Keep APT identity and authorization provider-independent. |
| Supersedes | None |

## Context

APT-LABS must let people enter without selecting a social or professional category, then participate across personal, crew, project, and institutional contexts. Authentication proves control of an account; it does not prove capability, organizational legitimacy, or authority.

The active Angular auth page currently simulates sign-in, asks new users to select a global role and starting workspace, and renders unimplemented Google/GitHub controls. The Angular app has no auth provider, session service, or route guards. The domain already defines `IdentityRecord`, `OrganizationIdentityRecord`, `ActorMembership`, `OrganizationMembership`, `WorkspaceContext`, `Mandate`, and `RecoveryToken`, but these are contracts rather than an integrated identity service. The Supabase migration is from the removed Vue application and uses a single global profile role; it is not the active Angular auth implementation.

## Decision

### Identity and participation

1. A person owns one persistent APT identity, independent of the authentication provider and organization memberships.
2. A person may link multiple verified authentication methods to that identity. Linking requires proof of control of both identities; equal email strings alone are not sufficient.
3. Anyone may create a personal account and receive a personal workspace without an institutional invitation or government ID.
4. Participation pathways (for example work, learning, organizing, or software development) are optional, changeable preferences—not account types or permissions.
5. People may form provisional crews or projects. Organizational standing progresses from provisional to community-validated to formally verified; verification gates only actions that require that standing.
6. Organization membership is a relationship to an actor. A person retains their APT identity and personal records when membership ends.
7. Permissions derive from authoritative memberships and scoped, time-bound, revocable mandates. A coordinator is a person acting under a mandate, not a global login role.
8. The selected organization in the browser is context only; it never grants access by itself. Authorization must be enforced server-side and in database policies.
9. Keep identity assurance, capability evidence, organizational legitimacy, and authority distinct. Do not introduce a universal reputation score or make formal education a prerequisite for participation.

Reuse and evolve the existing domain contracts before creating parallel `people`, membership, or mandate models. A canonical person identifier must not be a provider-specific subject ID.

### Provider choice

Prefer **Better Auth** when institutional SAML/OIDC federation and linking personal and organization sign-in methods are required. Its organization/invitation and SSO plugins cover the needed integration shapes. Supabase Auth is simpler with Supabase sessions and RLS, but currently documents that SAML SSO identities cannot be linked to other identities; that conflicts with the one-person/multiple-method goal.

This is a capability-fit decision, not a claim that Better Auth is operationally simpler. Better Auth introduces a server-side auth runtime and session/JWT integration with Supabase. Before production integration, prove:

- Better Auth can use the chosen Supabase Postgres deployment and the required account-linking behavior.
- A trusted server-side identity can be mapped to the canonical APT person ID for every request.
- RLS or an equivalent server authorization boundary correctly enforces organization membership and mandates; client-selected context cannot bypass it.
- Invite acceptance, identity recovery, session revocation, and cross-organization isolation work end-to-end.

If that proof fails, or if first deployments do not require federation/linking, reconsider Supabase Auth as the lower-operations alternative. Do not deeply couple APT domain records or permissions to either provider.

### Authentication methods and entry UX

- One sign-in and account-creation experience for all people; no student, employee, institution, developer, or coordinator portals.
- Email one-time code and email/password are initial methods. OAuth providers may be enabled when configured and safely linkable. Phone authentication is an expansion path with verified recovery; a phone number is not permanent identity proof. Passkeys remain optional until the selected provider and target browsers support the required lifecycle.
- Institutional SAML/OIDC is configured per organization when a partner requires it. SSO authenticates a person; it does not automatically grant membership or institutional authority.
- Do not show a provider action in the UI until it is configured and functional.
- Sign-up creates a personal identity only. It does not create a verified institution or grant a role. After entry, a person can create/join provisional actors, request access, and choose participation pathways.
- The auth page is deliberately minimal and story-free: a focused, polished form aligned to the APT design system, with accessible labels, focus, errors, loading, and responsive states. No role/workspace selector or decorative provider buttons.
- Until real authentication is wired, the page must clearly disclose demo behavior and must not imply that sign-in, OAuth, SSO, or recovery is live.

## Consequences

- The authentication screen no longer asks users to select a global role or organization before identity is established.
- Organization context and authority are resolved after authentication from memberships and mandates.
- The existing domain model is a starting point, not evidence that these flows or security controls are implemented.
- Better Auth cannot be treated as a front-end-only dependency; a production rollout includes a server, session validation, email delivery, database migrations, authorization policies, and operational ownership.
- The current Supabase SQL policies and legacy profile-role model must not be treated as production-ready authorization for this design.
- Auth-provider buttons, SSO, phone, and passkeys are enabled incrementally, only after their service, recovery, identity-linking, and authorization paths are tested.

## Delivery boundaries

1. **Auth-screen refinement:** change only the existing auth screen; preserve the explicit local-demo disclosure and do not install or pretend to configure an auth provider. Remove misleading role/workspace selection and unimplemented provider actions. No backend, route-guard, or schema changes in this screen-only increment.
2. **Identity foundation:** implement Better Auth integration, stable person mapping, verified contact methods, sessions, recovery, and a personal workspace.
3. **Participation:** add provisional actors, invitations/requests, memberships, and optional participation pathways.
4. **Institutional authority:** add organization verification, scoped mandates, SAML/OIDC pilots, privileged-account MFA, audit events, and tested RLS/server enforcement.
5. **Interoperability:** add directory provisioning and machine identities only when a real integration requires them.

## References

- [APT ontology](../ontology.md) and [design charter](../design/charter.md)
- [Identity domain contracts](../../apt-labs/libs/domain/src/identity.ts)
- [Actor, membership, workspace, and mandate contracts](../../apt-labs/libs/domain/src/actors.ts)
- [Current auth screen](../../apt-labs/src/app/features/auth/auth.component.ts)
- [Better Auth organization plugin](https://www.better-auth.com/docs/plugins/organization)
- [Better Auth SSO plugin](https://www.better-auth.com/docs/plugins/sso)
- [Supabase enterprise SSO](https://supabase.com/docs/guides/auth/enterprise-sso)
- [Supabase identity linking limitations](https://supabase.com/docs/guides/auth/auth-identity-linking)
