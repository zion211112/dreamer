# APT-LABS — Verified Repo Fact Base (2026-11-05)

Every claim below was checked against the working tree on 2026-11-05 (direct reads + verified
agent inventory). Trust this over memory; open the cited file to confirm details.

## Routes (src/App.tsx — VERIFIED by direct read)

```
/                      Landing
/investor-memo         InvestorMemo
/sign-in /sign-up      Auth (browser-local demo, localStorage `authUser`)
/workspace/people                    People
/workspace/annals                    Annals (static chronology prototype)
/workspace/institutions              Institutions
/workspace/institutions/network      Network (CapabilityDirectory)
/workspace/institutions/school-console  SchoolConsole (nested local-first boundary)
/workspace/commons                   Commons (Radar)
/workspace/workbench                 WorkbenchFinder
/workspace/workbench/simulate        Workbench (FieldDesk simulation)
/workspace/field-desk                alias of workbench/simulate
/workspace/roll                      Roll
/workspace/apt-coin-lab              AptCoinLab (static research page)
```

## Module naming today (src/lib/studio-navigation.ts — VERIFIED)

Primary rail: **Radar** → /workspace/commons · **Network** → /workspace/people (contexts:
people, institutions, capabilities) · **Undertakings** → /workspace/workbench (workbench,
field-desk) · **Roll** → /workspace/roll.
Secondary: **Annals** → /workspace/annals · **APT Coin Lab** → /workspace/apt-coin-lab.
Context labels in the shell: commons="Radar", people/capabilities/institutions="Network",
workbench/field-desk="Undertakings", plus "School Console", "Roll", "Annals", "APT Coin Lab".

## Shell (src/components/WorkspaceShell.tsx, untracked, ~280 lines — VERIFIED by direct read)

- Structure: StudioNavigation (topbar + rail + sidebar) → main content → optional
  "module inspector" → dock → static statusbar.
- Inspector: static module-context text (summary/distinction/source/history + links), shown
  only where `moduleOwnsInspector` is false (i.e. only for `roll` and `apt-coin-lab`).
- Dock: three static per-module text tabs — "Source / Related modules / History" — plus a
  "↗" link tray (a navigation duplicate of the rail).
- Statusbar: static "APT-LABS / {module} · BROWSER-LOCAL WORKSPACE DEMO · No shared
  workspace service connected".
- Sidebar-collapse and dock-collapse persist to localStorage.
- NOT present: splitters/resizable panes, record-level inspector, change-set/ledger dock,
  environment switcher, surveyor grid, fork glyph.

## Design tokens (src/styles.css — VERIFIED)

- Current system is light-first "field atlas": `--paper #f5f3ee`, `--ink #1a1d18`,
  `--terrain #5d7a5c`, `--brand-main #295d70` (teal), `--brand-branch #c6d68e` (pale lime),
  `--brass #b8955a`, `--water #3a6b8c`, `--danger #a84632`, `--phosphor #8fd98f`,
  `--bg-term #0d110e`; a `.dark` class overrides to terminal look.
- Type stacks: Georgia (serif) / Inter (sans) / JetBrains Mono (mono); clamp() step scale;
  8px + Fibonacci spacing; radii, shadows, transitions, z-index tokens.
- **No `[data-env]` blocks and no dark signature palette exist in src yet** (grep-verified).
- Known defect: `--info-bg` referenced but undefined. Auth-page styles (~lines 239–595) sit in
  styles.css, which AGENTS.md says should be handled carefully (shared tokens + auth-page styles
  belong there, but keep changes small).

## Domain data (VERIFIED)

- `src/lib/people-network.ts`: 31 entities (person/crew/asset/work/institution/evidence) +
  34 typed relationships (17 kinds incl. evidence links); `recordBasis`:
  'illustrative' | 'local-profile' | 'project-reported'; localStorage `aptlabs:people-network:v1`.
- `src/lib/ecosystem-examples.ts`: 2 `EXAMPLE_FIELD_SIGNALS` (scenario: true, illustrative).
- `src/lib/local-workflows.ts` / `local-workbench.ts`: 3 `WORK_OPPORTUNITIES`; application
  state machine submitted → under_review → selected/declined; `WorkEvent[]` history.
- `src/lib/workbench-simulation.ts`: 6-stage simulation pipeline
  (tender-review → assembly → delivery → acceptance → deployment → pause/resume/cancel);
  `RollPreview` with hash anchor; `unresolvedFacts[]`; persistence throws in demo mode.
- `src/lib/db/roll.ts`: `RollEntry` (participants with `capability_claims[]` +
  `evidence_ids[]`; evidence layers public/participant/restricted; acceptance block;
  `hash_anchor` via canonical JSON + `computeHashAnchor`; `RollRevision` previous/new hash);
  3 `DEMO_ROLL_ENTRIES`; localStorage `demo_roll_entries`; `getRollAccess()`.
- `src/lib/db/network.ts`: profiles/capabilities/service offers/evidence — Supabase-backed,
  demo mode returns empty.

## Absences (VERIFIED by negative search)

- No Main/Branch switcher component, no `data-env` in src, no 6-pane spec shell in src.
- No Intelligence module; AptCoinLab is a static research page.
- No unified cross-module event stream (Annals page says so in its own context text).
- No general graph explorer (NetworkMap is a People-specific force-directed graph).
- `src/pages/Prototype.tsx` is an empty stub; repo root holds scratch files
  (test.txt, demo.txt, prototype-*.txt, write_*.js/py, .jfif doc files, bin archive).

## Tests (VERIFIED)

11 vitest files in src/lib: people-discovery (search/filter/directory projection),
people-profiles (revisions + storage round-trips), studio-navigation (exact label/route map),
institutions-register, local-workflows, workbench-simulation (+store, +interest),
radar-view, mock-radar-map-provider, roll entry validation.
