# APT-LABS Workspace Shell Design

**Status:** Approved design handoff
**Date:** 2026-11-10  
**Scope:** Shared APT-LABS workspace shell and personal Home. Module interiors are out of scope.

## 1. Design intent

The workspace should feel like a carefully composed professional instrument for collective
production: legible, calm, personal, and quick to navigate. It should house modules without
competing with their work surfaces.

Use the approved **Quiet Brutal** direction in the **light** variant: precise geometry, crisp
dividers, considered whitespace, restrained mineral-lime emphasis, and a softly translucent
topbar. Glass is a small material detail, not the page language. Avoid dark surfaces, dashboard
clutter, decorative charts, generic card grids, and false activity.

### Visual composition

The beauty comes from proportion, typography, and material contrast rather than decoration:

- Treat the warm paper canvas as uninterrupted space. Use raised white surfaces only where they
  clarify a real boundary, such as a menu, dialog, or contextual overlay.
- Use an editorial rhythm: a clear page title, generous breathing room around section starts, and
  compact, aligned working content. Follow the existing 8px spacing baseline; reserve 32px desktop
  and 16px narrow-screen page insets for the Home surface.
- Use Georgia for the Home greeting, page titles, and selected record identity; use the existing
  sans stack for controls and working content. Keep mono to genuine environment, time, or evidence
  readouts. Never use mono labels as ornamental texture.
- Keep geometry crisp: 3px/6px corner radii for controls and small surfaces; no pill-shaped
  navigation, nested cards, or broad soft shadows. Reserve the lightest existing shadow for
  transient overlays.
- Give the labeled module rail one precise active treatment: a mineral-lime wash behind the active
  icon and label, plus a non-color cue such as a slim edge marker and `aria-current`. Keep inactive
  destinations unboxed. Use the same restrained accent for one primary Home action, not every link.
- Let the topbar read as a fine, softly translucent layer over the warm canvas, separated by one
  hairline divider. Disable blur under reduced-transparency preferences and use an opaque surface
  when backdrop blur is unavailable.
- Keep the shell's visual signature in its alignment, paper/ink contrast, and a single mineral-lime
  selection. Do not add a background grid, ornamental chart, decorative glow, or fabricated
  illustration to make the frame feel finished.

The approved shell-level module set is **Commons, Network, Workbench, and The Roll**. Workbench
is a primary module; implementing its work surface is explicitly outside this design scope.
Intelligence is not a primary shell destination in this direction.

## 2. Shell information architecture

The workspace has at most three navigation levels:

1. **Workspace topbar:** APT-LABS identity, current workspace/organisation context where available,
   global search, truthful local/shared environment state, and the authenticated user's identity.
2. **Primary module rail:** Home, Commons, Network, Workbench, The Roll. Each destination has a
   lightweight icon and a visible name directly below it. Labels are never hover-only.
3. **Context navigation:** Current module's real subviews. It is collapsible and must not compete
   with the main work surface.

Other shell regions are conditional:

- **Main work surface:** Always receives priority and available width.
- **Record inspector:** Appears only for a selected record and useful contextual detail.
- **Activity/evidence dock:** Appears only when relevant data and actions exist.
- **Environment/synchronisation status:** Shown only when its state is known and useful. It is not
  an always-on engine or activity strip.

Home is a primary workspace destination, not a sixth domain module. The Roll is the user-facing
module name; Canon, Annals, and evidence/history lenses, where implemented, remain subordinate
views rather than competing primary destinations.

## 3. Personal Home

Home is the user's desk, not a product tour or an organisation-wide KPI dashboard.

### Information hierarchy

1. A personal greeting from the real profile name, with the current organisation and role only when
   those values are present and authoritative.
2. **Your work:** items that the signed-in user is actually assigned to, responsible for, or
   explicitly asked to review. Each item must identify its source record and real lifecycle state.
3. A short set of available starting actions, such as expressing a need or finding capability,
   shown only when the corresponding destination and permission are real.
4. A first-use/empty state that helps a new participant enter the network without inventing tasks,
   activity, collaborators, or counts.

### Home composition

On desktop, place the greeting and verified organisation/role context together at the start of the
work surface. Follow with an open, editorial **Your work** list that receives the largest share of
the content width. A narrower **Start in the network** area may sit alongside it only when it offers
real, permitted entry actions; present those as plainly labeled links, not a row of cards. On tablet
and mobile, stack these regions in the same reading order. If there is no personal work source, let
the empty state breathe and make one real next step obvious; do not fill the space with a greeting
hero, decorative art, or organization-wide metrics.

The current application has profile fields but no verified cross-module personal work feed. Until a
reliable, permission-aware source exists, show an honest empty state and useful real module links.
Do not fabricate assignments, “recently viewed” items, due dates, review counts, or success states.
Avoid a permanent duplicate grid of all modules when the primary rail already provides that route.

Home has no record inspector or activity dock by default. It should not inherit the technical
surveyor grid intended for spatial or technical work surfaces.

## 4. Responsive layout rules

Use CSS Grid/Flex with `minmax(0, 1fr)` for the work surface and `min-width: 0` on shrinkable
children. Preserve navigation and context through structural changes instead of hiding them.

| Viewport | Layout |
|---|---|
| **1280–1920 CSS px** | Desktop shell: topbar, vertical labeled module rail (target 72–76px), collapsible context pane (target 200–240px), and flexible main surface. A contextual inspector may share the row only while content retains a useful minimum width; otherwise open it as an overlay/drawer. |
| **1024–1279 CSS px** | Keep the labeled module rail; collapse context navigation to a drawer or a user-controlled narrow pane. Inspector is an overlay/drawer, never another fixed column. |
| **768–1023 CSS px** | Transform the primary rail into a compact horizontal, icon-over-label module strip. Context navigation opens from an explicit control. Give the main surface the remaining width. |
| **430–767 CSS px** | Single-column shell below the topbar. Use a labeled, touch-sized horizontal module strip, followed by the work surface. Context navigation and inspectors use native dialogs/drawers or dedicated views with managed focus. |
| **320–429 CSS px** | Retain all five visible Home/module labels in the horizontal strip. Use compact icon-over-label items with at least 44 CSS-pixel interaction height, sensible horizontal insets, wrapping only where needed, and no clipped controls. Main content is one column. |

The context pane needs user-controlled collapse/restore and a reset-to-default action. Do not persist a
preference that makes primary navigation unreachable. At narrower widths, context navigation changes
to a drawer; it is not merely squeezed.

Validate the requested widths exactly: 320, 360, 390, 430, 768, 1024, 1280, 1440, and 1920 CSS px.
Also test browser zoom and long labels, organisation names, and record titles.

## 5. Component inventory

| Component | Responsibility and behavior |
|---|---|
| **WorkspaceTopbar** | Workspace identity/context, destination search, known environment/sync state, and current profile. Translucency is limited to this raised surface; provide an opaque/reduced-transparency fallback. |
| **PrimaryModuleRail** | Persistent links for Home, Commons, Network, Workbench, and The Roll. Visible icon labels, `aria-current`, strong keyboard focus, and responsive horizontal transformation. |
| **ContextNavigation** | Current module's actual subviews; collapse/restore on desktop and open from an explicit mobile control. |
| **WorkspaceHome** | Personal greeting, truthful personal work state, permitted starting actions, and a helpful first-use state. No fabricated aggregate feed. |
| **WorkspaceMain** | Route-owned module surface with no shell-imposed global grid or unnecessary fixed columns. |
| **RecordInspector** | Optional selected-record identity/type, relationships, provenance, applicable evidence, permitted actions, and full-page link. Distinguishes unknown from absent. |
| **ContextualActivityDock** | Optional contextual decisions/evidence/history; collapsible on desktop, drawer/dedicated view on mobile. Hidden when there is no relevant content. |
| **EnvironmentStatus** | Accurate local/demo or configured environment and known sync/offline state. Unknown is not rendered as “synced”. |

Do not add a separate APT Fab or APT Studio primary navigation entry. They are productive
capabilities/service operations inside the existing module structure. School Console remains outside
APT-LABS.

## 6. Semantic token map

Use the existing design tokens in `src/tokens.css`; introduce shell aliases only where they express
a stable semantic role. The active shell direction uses the light token values:

| Role | Token(s) | Light palette/value |
|---|---|---|
| Work canvas | `--bg` | `#f5f3ee` |
| Raised surfaces | `--bg-elev`, `--bg-subtle` | `#ffffff`, `#ebe7df` |
| Primary/strong text | `--fg`, `--fg-strong` | `#1a1d18`, `#0f110d` |
| Supporting text | `--muted`, `--dim` | `#6b7066`, `#969b90` |
| Dividers | `--line`, `--line-strong`, `--hairline` | Existing rgba ink dividers |
| Primary interactive accent | `--brand-main`, `--brand-main-wash` | `#295d70`, `#e3edf1` |
| Terrain/positive semantic | `--terrain`, `--terrain-pale`, `--terrain-ink` | `#5d7a5c`, `#e4ebe3`, `#2e3d2d` |
| Caution | `--state-caution`, `--state-caution-wash` | Brass `#b8955a` and its pale wash |
| Risk | `--state-risk`, `--state-risk-wash` | `#a84632` and its pale wash |
| Proposed state | `--state-proposed`, `--state-proposed-wash` | Existing branch/lime values; pair with dark text and a label |
| Focus | Add a dedicated `--shell-focus` semantic alias | Use a contrast-tested dark teal/blue distinct from decorative brass |
| Disabled/unavailable | Add semantic aliases derived from `--muted` and `--line` | Remain legible; do not encode state by opacity alone |
| Typography | `--serif`, `--sans`, `--mono` | Existing Georgia, system sans, and JetBrains Mono stacks |
| Spacing | `--baseline`, `--space-2`, `--space-3`, `--space-4` | 8px rhythm; 16px compact inset; 24px section gap; 32px desktop Home inset |
| Shape | `--radius-1`, `--radius-2` | 3px for controls; 6px for small raised surfaces |
| Elevation | `--shadow-1` | Transient overlays only; default work surfaces stay flat |
| Labeled rail | `--shell-rail` | Raise current 54px token to 72–76px so icon-over-label navigation has usable width |

The brighter mineral-lime used for Quiet Brutal is a restrained selection/hover surface, not a new
meaning for lifecycle, evidence, risk, or synchronisation. Status always has a readable label and,
where useful, a distinct icon. No colour-only meaning.

## 7. Navigation and deep-link model

Keep `/workspace` as the Home URL. Retain the current module deep links where possible:

- Commons: `/workspace/commons`
- Network: `/workspace/network/people`, `/workspace/network/institutions`,
  `/workspace/network/capabilities`
- The Roll: `/workspace/records/roll` (existing route)
- Workbench: `/workspace/workbench` is the proposed shell destination, but the current application
  does not mount this route. The Workbench owner must provide the real destination before the shell
  makes this a clickable link. Do not ship a dead nav entry or a shell-owned stub module.

The active module and subview derive from the URL, not a disconnected local-storage context
switcher. Browser back/forward and refresh must restore the same view. Search remains an available,
labeled topbar control and must eventually search only records visible to the user. The current
static destination list is not a substitute for authorised record search; record-search integration
is an explicit dependency, not a claim of this shell design.

Show current organisation, role, and permissions only from authoritative membership/profile context.
If there is no organisation context, state that it is unavailable rather than displaying a fake
workspace switcher. Environment (`local/demo` versus configured/shared) and synchronisation state
are separate fields; sync is `unknown` until a real sync source is wired.

## 8. Inspector and contextual activity/evidence surface

### Inspector

Keep the existing inspector concept, but make it dismissible, restorable, and contextual. It must
identify the selected record and type, show its provenance and relevant relationships, distinguish
unknown data from an empty collection, and list only actions the current authority and implementation
permit. If there is not enough desktop width, use an overlay/drawer rather than shrinking the work
surface below its tested minimum. On mobile, use a focus-managed native dialog or a dedicated record
view with a predictable back path.

### Activity/evidence

Do not reserve a permanent decorative strip or dock. Show an activity/evidence panel only for a
relevant record or undertaking and only when its underlying data exists. The desktop dock is
collapsible with a keyboard-accessible restore control. Mobile uses a contextual action or dedicated
view, not an always-visible bottom strip.

Replace source-control vocabulary (for example “commit” or “branch”) with domain language unless
the operation actually has those semantics. Keep local draft saving, submission, approval,
authorization, execution, acceptance, and settlement distinct.

## 9. Accessibility and performance criteria

### Accessibility

- Target WCAG 2.2 AA; validate manually as well as with automated tools.
- Use semantic header, navigation, main, complementary, and status landmarks with unique accessible
  names where there are multiple navigation regions.
- Give each module link a visible name and accessible name; `aria-current` identifies the active
  destination.
- Ensure all actions work by keyboard, focus is visible/unobscured, and dialogs restore focus to the
  invoking control.
- Maintain readable contrast for text, icons, dividers that communicate boundaries, and focus
  indicators. Test the lime selected surface with its foreground and state label.
- Provide at least 44px touch targets where feasible; avoid clipped controls and preserve zoom/text
  resizing.
- Respect reduced motion and reduced transparency preferences.
- Announce async status changes appropriately and expose recoverable empty, loading, error,
  offline, pending-sync, conflict, success, partial-success, and permission-denied states when the
  underlying workflow can enter them.
- Verify inspector behavior, keyboard-only navigation, touch navigation, and screen-reader labels.

### Performance and reliability

- Keep the first usable shell fast; avoid adding dependencies for shell composition.
- Avoid heavy chart/map/graph bundles on Home. Load module-specific visualizations with their
  modules.
- Keep layout stable while profile/status loads; avoid shifting identity content.
- Persist only small, non-sensitive UI preferences. Do not put permissions, authority, or security
  decisions in client-side layout state.
- Measure Core Web Vitals against LCP ≤2.5s, INP <200ms, CLS <0.1 at p75; do not claim targets met
  without measurement.
- Treat 10,000 monthly active users as a planning scenario, not concurrent load. Do not add
  architecture for hypothetical bottlenecks.

## 10. Comparison against current shell

| Area | Current state | Design decision |
|---|---|---|
| Primary modules | `studio-navigation.ts` exposes Commons, Network, Records, Intelligence; Workbench is absent. | Replace shell-level set with Home, Commons, Network, Workbench, The Roll; leave module interiors to their owners. |
| Module labeling | `StudioNavigation.tsx` renders an icon-only vertical rail with `aria-label`/title. | Keep module names visible directly under icons; on tablet/mobile, use the same labeled controls in a horizontal strip. |
| Home | `WorkspaceOverview.tsx` is a mission statement and module directory. | Make Home personal-first with genuine identity, real assigned work when available, and honest onboarding/empty states. |
| Topbar | Brand, Field Studio context, static destination search, pane toggle, profile. | Add truthful workspace/organisation and local/shared context; retain search; refine hierarchy and restrained translucency. |
| Context pane | Route-derived context links; mobile drawer can be empty on Home. | Keep it optional/collapsible and provide meaningful Home context and mobile access to primary destinations. |
| Work surface | Fixed shell columns; surveyor grid applied across routes. | Let the work surface dominate; reserve grid texture for technical/spatial content. |
| Inspector | Optional when selection data exists; no universal dismissal/restore contract. | Keep contextual, responsive, and dismissible with a minimum work width. |
| Dock/status strip | `EngineActivityStrip` is permanently mounted with empty runs and an unavailable agent. | Remove permanent engine/activity chrome; show only contextual, real status or evidence. |
| Environment/sync | Runtime label exists, but no genuine workspace-wide sync indicator is wired. | Show known local/demo/configured state; leave sync unknown/hidden until a source exists. |
| Search | Static module/task destination filtering, not record-level permission-aware search. | Preserve as a shell control; treat authorised record search as an integration dependency. |
| Responsive navigation | Rail/sidebar are hidden at narrow widths; context drawer does not replace primary module access. | Keep every primary destination directly reachable at every required width. |

## 11. Signature elements: keep, adapt, remove

- **Keep:** light warm canvas, careful editorial heading, sans-serif working content, technical mono
  only for genuine readouts, fine dividers, and clear record provenance.
- **Adapt:** Quiet Brutal's decisive geometry and lime selection into restrained token-based chrome;
  the module rail is icon-over-visible-label. Use only a slight topbar glass treatment, with reduced
  transparency and opaque fallbacks.
- **Use contextually:** surveyor grid on spatial/technical work; map/network graphics in the
  corresponding modules; evidence markers only when they encode real evidence conditions;
  Annals-style temporal navigation only for actual historical comparison.
- **Remove from shell:** dark rail/theme, all-route grid, permanent activity strip, fake terminal
  motifs, fabricated chart/metric content, and fixed extra panels.
- **Do not add for effect:** branch glyphs without a real alternative/revision relationship, wax
  seals without a defined signature property, glass across whole pages, or splitters without a
  demonstrated resizing task.

## 12. Explicit unresolved questions and implementation dependencies

1. **Workbench route integration:** The current router does not mount `/workspace/workbench`. The
   Workbench owner must confirm/mount its route before a clickable shell destination can ship. This
   design does not specify or implement Workbench's interior.
2. **Personal work source:** Which authoritative, permission-aware source supplies assignments,
   review requests, due dates, and contribution status across modules? Until confirmed, Home remains
   useful without claiming a unified personal queue.
3. **Workspace membership context:** Is profile `organization_name` adequate for display, or is a
   membership/active-organisation source available? Never infer permissions or authority from the
   profile role alone.
4. **Sync/offline source:** Which client/service reports pending sync, offline, retry, and conflict
   state? Until integrated, report environment only and do not claim synchronisation.
5. **The Roll subviews:** Current routes include Records/Canon, Annals, and Roll, but module ownership
   is outside scope. The shell's primary label is The Roll; its owner must confirm which subviews
   remain and their stable URLs.
6. **Inspector/dock wiring:** Which modules provide selection, provenance, actionable evidence gaps,
   and activity data to the existing shell contracts? Hide these regions unless the data/actions are
   real.
7. **Organisation switching:** Do users have multiple authorised workspaces and a server-backed
   switch operation? Show a switcher only if both are confirmed; otherwise show a non-interactive
   current context.

## 13. Design acceptance criteria

- The light Quiet Brutal shell has a restrained graphic identity, clear hierarchy, and no clutter.
- Its visual character comes from paper/ink contrast, editorial type, measured spacing, crisp
  dividers, and one mineral-lime selection—not generic cards or decorative effects.
- Home feels personal while displaying only authoritative user/workspace information.
- Home's empty state helps a new participant begin without fabricated activity.
- All four domain modules are housed in the primary navigation, with Workbench's working route
  supplied by its owner.
- Every module label is visible under its icon on desktop and stays visible in compact navigation.
- Main content retains priority at all widths; context, inspector, and dock are conditional/adaptive.
- Back/forward, refresh, keyboard, touch, reduced motion/transparency, and direct URL entry behave
  predictably.
- Local/demo/shared environment is explicit; sync and permission state are never inferred.
- The exact viewport, accessibility, and performance validation in this document is completed
  before implementation is considered finished.
