# APT-LABS Investor Deck Redesign

**Status:** Draft for user review
**Date:** 2026-11-17
**Approved direction:** Thesis-first, company-level investor story
**Composition assumption:** Field Record (the assigned lead); the visual chooser received no selection

## Context

`/investor-memo` is currently a public, long-form memo with economic scenarios, risks, milestones, a raise, and contact details. Its data is hard-coded in `src/pages/InvestorMemo.tsx`. The page says “CONFIDENTIAL,” but it is not access-controlled. The project is a Preact 10 / Vite 6 site deployed through Vercel, and its visual system is governed by Structural Emergence in `docs/design/charter.md`.

The current memo's `investor-memo-*` class names have no matching rules in `src/tailwind.css`; the redesign must use the defined tokens rather than assume the memo has an existing page-specific visual system.

The existing memo's `$250K SAFE`, `10%` fee, `$100K` package value, `$4K` net contribution, forecasts, milestones, and risk gates are unverified draft assumptions. They are not operating results and must not be presented as confirmed terms or traction. The current commercial direction in `PRODUCT.md` describes a 3–5% procurement-routing fee, which also remains a model, not demonstrated revenue.

The supplied MTO Works image depicts a bridge, hydro equipment, a learning centre, and students. The Kemetos image depicts schoolchildren in a patterned-floor corridor. Neither image's provenance, permissions, or status as a real site is verified. The codebase contains no evidence that either project has completed these works or measured learning outcomes. Kemetos1 in the product is a coordinator tool, not evidence of the school-environment project.

## Goals

- Replace the memo's linear financial pitch with a concise, thesis-first company narrative suitable for investor review on the public site.
- Make the product understandable in the opening view: APT-LABS helps institutions and local producers discover needs, organize work, and preserve evidence.
- Show the coordination loop once, then apply it to two clearly separate case stories: MTO Works' river/hydro path and Kemetos' learning-environment proposal.
- Make the boundary between current product, project concept, evidence, target, and hypothesis visible.
- Keep detailed financial assumptions and terms out of the public story until the founder confirms them.
- Preserve the current Structural Emergence identity and the existing Vercel site rather than rebranding APT-LABS.

## Audience and intended action

The primary audience is prospective investors evaluating APT-LABS as a company, not buyers funding either project independently. The intended next action is to start an investment conversation.

The specific investor segment, the buyer's current alternatives, a validated differentiator, and a “why now” claim are not yet established by the available evidence. The page must not invent these answers. Use the existing product direction to explain the intended users and coordination problem; keep stronger positioning claims out until founder-confirmed or externally evidenced.

Use the existing WhatsApp contact only after confirming the number and destination. The public page must not say “Confidential” or imply access restrictions.

## Proposed story

The public deck is a web presentation, not a standalone fundraising offer. Each slide has one job, one main statement, and a clear reading order. An appendix may preserve detailed assumptions only after they are reviewed and explicitly marked as planning cases.

1. **Thesis — make productive capacity visible and work cumulative.** State what APT-LABS is for and whom it serves. The Field Record composition links a real need, capacity, work, and evidence without claiming successful outcomes.
2. **The coordination problem — fragmentation, not absence.** Ground this in PRODUCT/ontology language: relevant capacity and knowledge exist across people, conversations, organizations, documents, and local systems, but are difficult to connect and reuse. Do not invent market-size figures or customer research.
3. **The product loop — one system, human decisions.** Explain Commons, Network, Workbench, Records, and Intelligence as connected jobs in the operating cycle. Clearly distinguish product functions from proposed future capabilities; AI suggestions never imply institutional authorization.
4. **MTO Works — river and hydro as a bounded work context.** Use the supplied visual only as concept art until provenance and permissions are confirmed. Distinguish the river/hydro pathway from completed infrastructure, generated power, or verified community outcomes. State the project stage only after confirmation.
5. **Kemetos — learning environment as a testable design hypothesis.** Explain how a patterned floor and spatial cues might support arrival, focus, collaboration, or transitions, without claiming improved cognition or learning. Identify what would be measured and what local school and learner input is needed.
6. **What the cases do and do not establish.** Show the shared coordination grammar across two different contexts. Do not imply that either case validates product-market fit, revenue, repeat use, learning effects, or hydro feasibility.
7. **Business model and initial wedge.** Use PRODUCT.md's institutional workflow/procurement direction and initial lower-regulation work contexts. Present 3–5% routing fees only as a model assumption unless pricing and transactions are confirmed. Do not imply a proven data moat, insurance product, financing product, or fee expansion.
8. **Proof gates and risks.** Pair each major hypothesis with an observable next test: buyer authority and willingness, delivery and acceptance, payment/working capital, governance and maintenance, permissions and privacy, and project-specific technical feasibility.
9. **The ask — invite a conversation.** State the raise amount, instrument, terms, use of funds, runway, and milestones only after founder confirmation. Until then, omit specific terms and use a neutral investment-conversation CTA.

### Appendix

The former memo's unit economics, scenarios, forecasts, valuations, milestone counts, and SAFE terms do not move into the public appendix automatically. Include only founder-confirmed figures with a visible source/date and a clear label such as `current result`, `target`, or `planning assumption`. Unconfirmed figures remain excluded, not disguised by a general disclaimer.

## Evidence and claim rules

Every substantive statement belongs to one of these classes:

- **Current product:** demonstrable in the existing product; distinguish a browser-local prototype from a live customer deployment.
- **Verified project fact:** supported by an attributable source, with date and scope.
- **Target:** an intended threshold or milestone, explicitly future-facing.
- **Hypothesis:** an open question with a proposed test.

No testimonials, customer logos, buyer commitments, revenue, deployment status, measured outcomes, or technical feasibility claims may be invented. Do not imply that a demo record represents a real transaction. State what a case illustrates and what it does not prove.

### MTO Works feasibility boundary

Before describing the hydro path as an active or feasible project, confirm project ownership/authority, stage, site permissions, seasonal flow and hydrology evidence, engineering and safety review, permits, capital and operating costs, maintenance responsibility, governance, and intended buyer/community outcomes. Until then, describe only a proposed or illustrative river/hydro context; do not claim generation capacity, reliability, cost savings, bridge completion, or delivered benefit.

### Kemetos learning-environment boundary

Treat patterned flooring as a design intervention to investigate, not an established learning treatment. Before making a cognitive or educational claim:

- Find and cite relevant evidence, including its population, setting, and limits.
- Co-design with educators, learners, school leadership, and accessibility stakeholders.
- Make the intervention accessible, slip-resistant, maintainable, culturally appropriate, and reversible where practical; assess sensory overload and mobility impacts.
- Define a local baseline and a limited set of observable outcomes before implementation. Separate observations (for example, movement or transition patterns) from causal claims about learning or cognition.
- Obtain appropriate school and guardian permissions before publishing identifiable images of minors.

If evidence, consent, or permissions are unavailable, use a clearly labelled concept diagram or omit the image and outcomes claim.

### Image handling

The supplied images are read-only source attachments and must not be edited. Do not copy them into the deployed app or commit them until source, rights, and use permissions are confirmed. If approved, label concept art as illustrative; label a real project photo only with confirmed project status and necessary subject permissions. The Kemetos photo includes children and therefore requires particular care.

## Visual and interaction direction

- Keep the Structural Emergence palette, typography, and spacing system from `src/tailwind.css`; do not introduce a new visual identity.
- Default composition: **Field Record**. Use one large, annotated work record as the opening demonstration, not a generic dashboard, equal-card grid, or oversized metric hero. This is an assumption because the user approved the thesis-first direction but did not select a card in the visual chooser.
- Pace the rest as distinct full-canvas slides with varied density and purposeful diagrams; keep the two case stories separate. Do not let the river/hydro visual or school-floor pattern become the company's identity.
- Present at a comfortable desktop scale and adapt the fixed slide canvas for phones without forcing tiny text. Provide keyboard navigation, visible focus, accessible slide names and order, reduced-motion behavior, and a usable browser-scroll fallback.
- One primary action: `Discuss the investment`. Any secondary action (such as viewing the product) remains a quiet link.
- The route is public. Do not rely on labels such as “Confidential” for privacy or access control.

The accepted trade-off is company clarity over project-led drama: investors see the coordination mechanism before the two projects, while each project gives the mechanism a concrete context. A project-led opening could make the work vivid sooner, but risks positioning APT-LABS as a hydro contractor or school-design venture rather than coordination software.

## Technical approach

- Use Open Slide (`@open-slide/core`) as the editable source for the presentation, as the deliverable is explicitly a pitch deck.
- Isolate the deck in its own Open Slide workspace rather than upgrading or replacing the existing Preact 10 / Vite 6 application. Current Open Slide 2.x is React 19 / Vite 8 based and requires Node `^20.19.0 || >=22.12.0`; those dependencies must not leak into or destabilize the primary app build.
- Build the deck as a static site nested under the existing Vercel deployment at `/investor-memo/`. The existing site and routes remain intact. The root build must orchestrate both builds and place the deck output under the root `dist` so one Vercel deployment serves both.
- Keep the deck at the existing investor URL; ensure direct navigation, refresh, nested slide navigation, and the root site's navigation work in production.
- Do not add a backend, investor login, analytics, or a separately deployed Vercel project for this redesign.
- PDF/PPTX export is not a launch requirement. Open Slide's static web build is primary; exports may be considered later without changing the source of truth.

### Deployment acceptance

- `npm run build` builds the existing app and the isolated deck from a clean install.
- Vercel serves `/investor-memo/` directly and on refresh, while all existing site routes continue to work.
- The static deck has correct base paths for fonts, images, navigation, and export assets.
- CI/runtime Node version satisfies Open Slide's engine requirement without forcing an unrelated app-stack upgrade.

## Scope

In scope:

- Replace the current `/investor-memo` presentation with the approved narrative and slide sequence.
- Add the isolated Open Slide workspace and root build/deployment wiring needed to serve it from the existing Vercel site.
- Replace or remove the current public, unverified memo figures and “Confidential” label.
- Add focused validation for the build and route, and verify accessibility, responsive behavior, and deck navigation.
- Update directly related investor-page documentation if it describes the old memo.

Out of scope:

- Reworking the APT-LABS brand, product modules, or workspace routes.
- Treating MTO or Kemetos as confirmed customers, completed projects, or separately funded ventures.
- Producing new learning science claims or unverified technical/economic claims.
- Publishing the supplied images before rights, provenance, project status, and permissions are confirmed.
- Investor login/access control, a backend, investor CRM, analytics, or user tracking.
- Generating PDF/PPTX as a required release artifact.
- Broad cleanup, dead-code removal, or changes to other worktrees.

## Acceptance criteria

- A first-time investor can identify what APT-LABS does, who it serves, and the next action within the first slide.
- The story explains the product loop without overstating AI authority or current deployment.
- MTO Works and Kemetos appear as separate contexts; both their confirmed stage and their evidence limits are clear.
- The Kemetos floor is framed as an evidence-informed hypothesis unless cited evidence and local evaluation support a stronger statement.
- No unverified terms, forecasts, transactions, performance figures, or outcomes appear as facts.
- The primary CTA works and has a confirmed destination.
- The deck is keyboard-navigable, readable at mobile and desktop sizes, respects reduced motion, and remains usable without motion.
- Existing site build, routes, and tests still pass; the new isolated deck build passes.
- Vercel's deployed static route works on direct load and refresh.

## Open release gates

These are content confirmations, not reasons to fabricate a fallback:

1. Confirm the raise amount, instrument, terms, use of funds, milestones, and whether they are cleared for publication.
2. Confirm MTO Works' project identity, stage, image origin/rights, and evidence available for any claims.
3. Confirm Kemetos project identity and stage, image origin/rights and guardian/school permissions, and any cited learning-environment evidence or evaluation.
4. Confirm the investor CTA destination and the intended public audience.

Until confirmed, omit the corresponding specific claim, number, or image. A missing fact must not be replaced with a polished placeholder that looks verified.

## Source of truth

- Product purpose, audience, model, and design direction: `PRODUCT.md`.
- Visual constitution and active Structural Emergence decision: `docs/design/charter.md` (B4).
- Domain distinctions and evidence principles: `docs/ontology.md`.
- Current investor memo and unverified assumptions: `src/pages/InvestorMemo.tsx`.
- Existing public route: `src/App.tsx`.
- Existing design tokens and styles: `src/tailwind.css`.

## Self-review

- No unfinished placeholders are used as facts; unconfirmed content is a release gate.
- The proposal keeps the public web route and Vercel deployment while isolating Open Slide's React/Vite toolchain from the Preact app.
- The deck remains company-level; MTO and Kemetos are case contexts, not product proof.
- The chosen Field Record composition is explicitly marked as an assumption, so the user can change it during spec review.
