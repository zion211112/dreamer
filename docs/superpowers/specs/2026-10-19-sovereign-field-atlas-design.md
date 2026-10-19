# APT-LABS Sovereign Field Atlas

- **Status:** Draft for user review
- **Date:** 2026-10-19
- **Product:** APT-LABS

**Supersedes:** The visual presentation and information hierarchy of the current public-site and workspace surfaces. It does not supersede the Tender lifecycle, Workspace context, Commons, or School Console contracts.

## 1. Purpose

Give APT-LABS a distinctive, pitch-ready visual identity and make the end-to-end product legible as a real physical-work network rather than a generic SaaS dashboard.

The design should help a first-time visitor understand what the network does, inspect how a proposed local build compares with an imported alternative, follow a Tender through accountable execution, and distinguish verified evidence from examples or intent. It should make the public site, Workspace, Commons, and School Console feel like parts of one coherent system without collapsing their different data and permission boundaries.

This is a visual, information-architecture, and interaction redesign. It does not add backend capabilities.

## 2. Product core and non-negotiable contracts

The stable product loop remains:

**Demand → Tender → Assembly → verified Roll**

The Tender remains the primary domain entity. Existing server authorization, Tender lifecycle validation, active Blueprint requirements, assigned-Anchor sign-off, and atomic deployment-to-Roll behavior remain authoritative.

The redesign preserves these boundaries:

- Market, Commons, and Roll remain publicly readable.
- A chosen Workspace context is a view of a server-verified relationship; it never grants access.
- School Console records remain on the local device. The UI must not imply encryption, multi-user storage, backup, or synchronization.
- School Tender publication remains a separate, explicit server-authorized action. Only its intended Tender information, Blueprint, quotes, and crew assignment cross into the shared system; student and unrelated Console records do not.
- Illustrative records and figures are always visibly illustrative. They are not live needs, activity, funding, savings, crews, deployments, or Roll proof.
- Capital remains contact-only. No deposit, pledge, escrow, payment, yield, or treasury balance is implied.
- Commons remains moderated and provenance-oriented, not a general social network.
- No shared Demand inbox, chat, CAD/file upload, capability token, SBT, wallet, or contribution-weighted governance is implied.
- Errors and unavailable capabilities are visible as errors or boundaries, never replaced with success-shaped fallback content.

## 3. Art direction — Sovereign Field Atlas

### Design premise

Treat APT-LABS as a living field atlas of things people intend to build, are building, and have verifiably built. A Tender should feel like an inspectable build dossier. The Roll should feel like a ledger of evidence. The Workspace should feel like a deliberate workbench, not an analytics dashboard.

### Visual language

- Replace the default dark-green SaaS look with a warm mineral-paper canvas, deep charcoal/ink text, restrained kiln-orange for the primary action and active state, and blueprint blue for technical evidence and measured comparisons.
- Use an editorial display face for large narrative headlines and a highly legible sans-serif for reading and forms. Retain a monospaced face for IDs, lifecycle labels, units, dates, provenance, and other compact technical data.
- Build atmosphere from measured linework: grid coordinates, survey marks, contour-like rules, drafting registration corners, scale ticks, material labels, and restrained diagram geometry.
- Use a clear material hierarchy: uncoated-paper page, white/limestone working surfaces, ink typography, hairline rules, and occasional orange/blue evidence marks. Avoid stacking nested cards when a rule, table, or open layout communicates structure better.
- Use photographs only when the repository has authentic, approved images for the actual work. Do not rely on stock-factory hero photography or represent a depicted artifact as a verified build. The first implementation may use original CSS/SVG technical illustration and real published project information only.
- Avoid crypto clichés, glowing gradients, fake maps, fabricated metrics, ornamental dashboards, and decorative charts without a clear data source.

The visual system must satisfy accessible contrast, visible keyboard focus, reduced-motion preferences, scalable text, and comfortable touch targets. Design tokens and visual roles remain centralized in `src/styles.css`; shared interactive controls use existing shared controls where applicable.

## 4. Information architecture and surface design

### 4.1 Public front door

The public home page is the orientation and pitch surface. In the first viewport, a visitor should be able to answer:

1. What does APT-LABS help people do?
2. How does a need become a locally executed build?
3. What is real, illustrative, or not yet supported?
4. Where can I inspect the work?

The hero pairs one concise proposition with an original field-atlas illustration of the loop. It shows no anonymous transaction count, fake map pins, fabricated current activity, or financial performance claim. Calls to action distinguish reading the public Market/Roll from creating an account or entering the School Console.

The story below the hero explains Demand, Tender, Assembly, and Roll in sequence. It connects this protocol to the actual product surfaces and uses a real published record where available; otherwise it shows an explicit empty state. The School Console is introduced both as a useful local tool and as a separate product boundary, not as a hidden data-collection mechanism.

Authenticated landing behavior remains unchanged unless a separate approved product decision changes it.

### 4.2 Public Market and Tender dossier

The public Tender board is a filterable work register with a strong distinction between live published Tenders and local illustrative examples. Each entry leads with the physical outcome, need, location, lifecycle state, and provenance. Import/local comparisons use aligned amounts, currency, units, and an explicit label such as “planning difference”; they do not use “savings” as a realized result.

A Tender detail page is redesigned as a structured dossier:

1. **Identity:** asset, need, category, location, issuer, Tender ID, lifecycle state, and provenance.
2. **Economics:** imported alternative alongside proposed local BOM, with calculation method/currency and the limitation that quotes require local verification.
3. **Blueprint:** itemized lines, quantities, costs, version, and available integrity/provenance evidence.
4. **Execution:** assigned/proposed crew shown only to the extent permitted by current consent and access rules.
5. **Lifecycle:** the actual Tender state and its authorized milestones.
6. **Capital:** contact-only enquiry, clearly distinguished from pledged, committed, or held funds.

Do not use a progress bar or funded percentage in a way that suggests escrow, collected capital, or a payment balance. If an existing funding-intent signal is displayed, label what it actually represents and state that no money moves or is held. Illustrative funder records remain unmistakably examples.

### 4.3 Workspace field desk

The Workspace becomes a focused work surface for the active verified context. Its primary hierarchy is:

1. **Context masthead:** current role/work relationship and organization or assigned Tender, clearly separate from product navigation.
2. **Loop rail:** persistent Demand → Tender → Assembly → Roll navigation with the selected stage and accessible responsive behavior.
3. **Main work surface:** one prominent queue, record, or honest empty state for the selected stage.
4. **Next-action strip:** one context- and lifecycle-appropriate action, with its permission/evidence boundary.
5. **Provenance/details:** secondary information that supports the next action without competing as another dashboard column.

Remove the competing three-column-card dashboard composition. On larger screens the loop rail may remain beside the active work, while the selected record and next action dominate. On smaller screens, the loop becomes a compact, scroll-safe stage navigator and the main work remains first in reading order. Controls do not depend on hover.

Stage behavior:

- **Demand:** School contexts link to the existing local Console and its authorized Tender publication path. Other contexts explain that a shared Demand inbox does not exist and offer only real public work routes.
- **Tender:** show public records and the inspectable economics. Any actions are real, currently authorized flows; there is no invented “bid as crew” or “fund” workflow.
- **Assembly:** show only assignments returned for the signed-in user. The next action comes from the current server-provided Tender state and links to existing crew authorization.
- **Roll:** show actual deployed proof records or a designed empty state. Do not show personal SBTs or imply that a Roll record is a wallet credential.

Network members without extra entitlements see a real public-work starting point and the actual account/role limits. No open-role signup or self-serve invitation is invented.

### 4.4 Assembly and Roll

Assembly retains the existing assigned-crew workflow and server-side transition checks. The visual treatment should make state, responsible role, active Blueprint, required next transition, and evidence easy to inspect. No chat, arbitrary upload, or capital release control is added.

Roll is a public proof ledger: each record communicates what was deployed, when, which approved Blueprint/proof reference it relates to, and how verification occurred. The presentation distinguishes a verified deployed record from a Tender, an illustrative example, or a proposed blueprint. The Roll is not represented as an SBT, transferable credential, yield entitlement, or token governance record.

### 4.5 Commons

Restyle Commons as an editorial workshop journal and technical library:

- Activity is a readable sequence of moderated field notes and advisory polls, not a social-media feed.
- Library resources prioritize title, kind, provenance, attribution, license, revision, and source link.
- Pending, empty, disconnected, and moderation-unavailable states are designed intentionally and remain truthful.
- Contribution, identity-consent, reporting, voting, and moderation controls retain their current server authorization and explicit state feedback.
- No user-uploaded file hosting, private chat, minors' participation, or claims that rights have been independently certified are added.

### 4.6 School Console

Bring the Console into the Field Atlas design language without turning its operational screens into a public network dashboard. It remains a useful local-first school instrument with practical task navigation and clear teacher/principal local view labels.

Keep a persistent, unmistakable “Local device / IndexedDB” boundary and the existing demo-data warning. The local view switcher is not authentication or authorization. Local workflows remain local; the Issue Tender flow is a distinct publication step with existing server-side role checks and a narrow payload. Never send or display student records in the Workspace or shared network.

### 4.7 Shared shell, authentication, and mobile behavior

The global shell should distinguish:

- **Product navigation:** Market, Workspace, Commons, Roll, School Console.
- **Work context:** server-verified role/organization/crew selection inside the shared network product.
- **Local view:** teacher/principal presentation inside the local School Console.

These are separate concepts and must not be collapsed into one overloaded switcher. Preserve safe return paths, current authentication semantics, role entitlement checks, and public reading. Forms, dialogs, menus, filters, and feedback reuse shared controls.

Responsive behavior is designed per surface. The public site retains narrative pacing; the Market and resource library become single-column registers; the Tender dossier stacks its capital/provenance panel in meaningful order; the Workspace retains an accessible stage selector; the Console keeps a usable tool navigation. Verify at narrow phone, tablet, and desktop widths with no horizontal overflow.

## 5. Component and implementation boundaries

- Keep domain rules in `src/lib/tender.ts`, existing server actions, database functions, and Supabase migrations. This project changes the presentation layer and may make tightly coupled presentation corrections, but it must not fork lifecycle or authorization logic into browser-only state.
- Keep design tokens, type roles, layout primitives, and visual states in `src/styles.css`. Avoid a second parallel theme or scattered inline styling.
- Reuse shared controls in `src/components/ui/`. Introduce a shared presentation component only when at least two surfaces use the same semantic pattern (for example, provenance/state labels or a Tender economics comparison).
- Keep page-specific semantic structure near its route/component. Do not create a generic schema-driven renderer or a large configurable design system for this redesign.
- Keep database access and any API shape unchanged unless implementation exposes a necessary and separately reviewed correctness issue.
- Do not add dependency/tooling packages solely for visual effects.

## 6. Error, unavailable, and provenance states

Every surface distinguishes, in both language and visual treatment:

- live published data;
- illustrative local data;
- an empty but successfully loaded source;
- a disconnected or unconfigured source;
- an authorization-denied action;
- a loading state;
- an operational error.

Errors remain explicit and actionable. A failed source is not represented as an empty successful source. Empty states must not be decorated with example records unless each is visibly marked illustrative. User actions provide pending and success/failure feedback and never imply a transaction when they only create contact intent or a local draft.

## 7. Delivery sequence

Deliver as one coherent design implementation, in dependency order:

1. **Atlas foundation:** shared design tokens, type scale, page grid, surfaces, navigation, status/provenance marks, buttons, form controls, focus and motion behavior.
2. **Public story and Market:** home page, Tender board, Tender dossier, and Roll so a first-time visitor can understand and inspect the product.
3. **Workspace and Assembly:** context masthead, loop navigation, responsive work surface, next authorized action, assignment and lifecycle evidence.
4. **Commons and Console:** unify their visual language while preserving moderation and local-data boundaries.
5. **End-to-end verification:** desktop/tablet/mobile review and test the public-to-Workspace, Tender-to-Assembly, Assembly-to-Roll, Commons, sign-in return path, and Console-local-to-authorized-Tender flows as available in this deployment.

This is a presentation redesign; the step sequence does not authorize adding backend product scope.

## 8. Acceptance criteria

### Visual and comprehension

- The site has a coherent, distinctly Field Atlas visual language across home, Market, Tender details, Workspace, Assembly, Roll, Commons, auth, and Console.
- The first viewport has one clear proposition, one strong illustrative/real artifact with truthful provenance, and an understandable route into public work.
- Users can distinguish product, role/work context, and local Console view.
- A Tender is legible as an evidence-bearing build dossier, not a generic funding card.
- A user can identify the selected loop stage, current work state, and next authorized action without decoding a crowded dashboard.
- Layouts work at narrow phone (390px), tablet, desktop, and wide desktop widths without horizontal overflow, lost controls, or inaccessible navigation.
- Typography, contrast, focus visibility, touch targets, reduced motion, and semantic landmarks meet the existing accessibility conventions and are checked during browser review.

### Truth, behavior, and compatibility

- No illustrative number or record is presented as a live transaction, realized saving, contribution, crew assignment, completed build, or proof record.
- No interface suggests escrow, payment, yield, a live Funder account, shared Demand inbox, chat/upload, SBT, or tokenized voting that is not implemented.
- School Console records remain local; no student/local draft leakage enters shared Workspace requests.
- Workspace context selection never grants permission. Existing server authorization and database RLS remain in effect.
- Tender lifecycle and Roll generation remain consistent with the existing TypeScript domain and Supabase migration.
- Commons remains public-to-read with existing moderator/contributor authorization and moderation semantics.
- Existing tests, typecheck, lint, production build, and relevant database migration checks pass.
- Browser verification covers responsive layout and the end-to-end flows that can be exercised with available configuration; unavailable external services are documented rather than simulated.

## 9. Explicit non-goals

- New Demand persistence or cross-device Console sync.
- Funder identity, bidding, escrow, payments, deposit, yield, or financial performance claims.
- SBT issuance, wallets, token voting, reputation decay, or cooperative treasury controls.
- Crew messaging, real-time chat, file uploads, CAD hosting, or delivery receipts.
- New role assignment, self-service invites, school provisioning, or Commons moderator provisioning.
- Replacing the existing auth, Tender, Assembly, Commons, or local Console data architecture.
- Claiming certification, verified supplier availability, realized savings, or social/industrial impact absent supporting records.
