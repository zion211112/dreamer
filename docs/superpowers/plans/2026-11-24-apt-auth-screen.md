# APT Identity Sign-In Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace role-based demo auth with a minimal, accessible APT sign-in and account-creation screen that does not misrepresent demo behavior.

**Architecture:** Keep the existing standalone `AuthComponent` and routes. Remove global role/workspace selection and unimplemented provider buttons; retain local-demo validation and navigate successful demo entry to `/workspace`. Better Auth, provider configuration, server sessions, guards, schema, invitations, and participation workflows are out of scope.

**Tech Stack:** Angular standalone component and signals, inline component template/styles, Angular TestBed with Vitest, existing APT CSS tokens.

**Spec:** `docs/decisions/B11-apt-identity-access-architecture.md`

## Global Constraints

- One sign-in and account-creation experience for all people; no student, employee, institution, developer, or coordinator portals.
- Sign-up creates a personal identity only. It does not create a verified institution or grant a role.
- Do not show a provider action in the UI until it is configured and functional.
- Until real authentication is wired, the page must clearly disclose demo behavior and must not imply that sign-in, OAuth, SSO, or recovery is live.
- The auth page is deliberately minimal and story-free, aligned to the APT design system.
- Change only the existing auth screen and its focused test; add no package or backend dependencies.

## Review Focus

- **Role-free sign-up:** no role, institution, or workspace choice appears before authentication; pin with template assertions.
- **Unconfigured providers:** GitHub/Google/SSO actions are absent, not dead buttons; pin with template assertions.
- **Demo honesty:** the local-only disclosure remains visible in both sign-in and sign-up; pin with a rendered-page assertion.
- **Invalid input:** empty/invalid email, short sign-up password, blank name, and mismatched confirmation still produce field errors; pin with component tests.
- **Responsive and keyboard use:** no horizontal overflow at 390px, visible focus on every interactive control, and no essential action hidden at desktop/mobile sizes; verify in the running browser.

---

### Task 1: Refine the role-free auth screen

**Files:**
- Modify: `apt-labs/src/app/features/auth/auth.component.ts`
- Create: `apt-labs/src/app/features/auth/auth.component.spec.ts`

**Interfaces:**
- Consumes: Existing `/sign-in` and `/sign-up` routes, `AuthComponent` email/password/name validation, and `/workspace` route.
- Produces: No new exported API, service, provider, or route.

- [ ] **Step 1: Write focused failing component tests**

Add tests named `rendersRoleFreeSignInWithoutProviderActions`, `signupCollectsPersonalFieldsOnly`, `keepsDemoDisclosureVisibleInBothModes`, `showsValidationErrorsForInvalidSignup`, and `validDemoEntryNavigatesToWorkspace`. Assert the sign-in form has email/password only; sign-up has display name/email/password/confirmation but no organization, role, or workspace field; neither mode renders provider buttons; invalid values set their existing ARIA-linked errors; and valid local submission navigates to `/workspace`.

- [ ] **Step 2: Run the auth spec and confirm the new behavior fails**

Run: `npm --prefix apt-labs test -- --watch=false`
Expected: The new auth spec fails on the existing role/workspace/provider controls and role-dependent destination; unrelated existing specs remain green.

- [ ] **Step 3: Refine `AuthComponent` in place**

Remove `WorkspaceId`, `SignUpRole`, workspace/role constants and signals, role-specific organization-name input, workspace/role handlers, and the inert provider/divider markup. Preserve email/password validation, name and confirmation validation for sign-up, loading feedback, `/sign-in` and `/sign-up` links, and the demo-only submit simulation. Route a valid demo submission to `/workspace`.

Keep the existing APT weave as a very low-opacity, pointer-events-none brand detail behind a centered form surface (maximum width 440px). Use existing `--apt-neutral-50`, `--apt-neutral-0`, `--apt-accent`, `--apt-text-body`, `--apt-border`, spacing, radius, and typography tokens. Keep the screen story-free; make the form first at mobile widths; retain a short, visible disclosure such as “Demo mode · Authentication is not connected.” Provide visible `:focus-visible` treatment and preserve semantic labels, alert roles, and error descriptions. Add no provider or recovery affordance that cannot work.

- [ ] **Step 4: Run the auth spec and Angular build**

Run: `npm --prefix apt-labs test -- --watch=false`
Expected: All tests pass, including the five auth behavior tests.

Run: `npm --prefix apt-labs run build`
Expected: Production build succeeds; no new auth-related template/type errors.

- [ ] **Step 5: Review the live screen**

Use the running dev server at `http://127.0.0.1:4200/sign-in` and `/sign-up`. Inspect desktop (1440px) and mobile (390px) widths, tab through every link/input/button, submit invalid values, confirm no horizontal overflow, no dead provider controls, and visible demo disclosure. Verify the registration screen does not ask users to select an identity category.

- [ ] **Step 6: Commit the screen refinement**

Commit only `auth.component.ts` and `auth.component.spec.ts` after the focused tests, build, and visual review pass.
