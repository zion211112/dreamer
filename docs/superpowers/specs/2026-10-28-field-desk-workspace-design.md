# Field Desk Workspace Design Specification

## Overview

The Field Desk workspace is a new workspace context implementing the "Field Atlas Command" interface as designed in `design-2-field-atlas-command.html`. It provides a map-based spatial interface for managing tenders, assets, friction signals, and crew assemblies.

## Design Reference

The design is captured in `/home/zion/projects/dreamer/design-2-field-atlas-command.html` - a standalone HTML prototype demonstrating:
- Three-panel layout: Sidebar (left), Map (center), Inspector (right)
- Navigation tabs: TOPOLOGY, RECRUITMENT, RADAR, LEDGER, COMMONS
- Floor switcher: BASEMENT, GROUND, FIRST, SECOND
- Map layers: Published Tenders, Illustrative, Friction Signals, Contours, Grid
- Asset tree with hierarchical navigation
- Inspector panel with asset details and actions

## Architecture

### Workspace Context
- New workspace context: `field-desk` (or `atlas`)
- Route: `/workspace/field-desk`
- Added to WorkspaceContextSwitcher alongside People, Institutions, Commons

### Component Structure
```
FieldDesk (main page component)
├── AtlasHeader (navigation tabs, coords, actions)
├── AtlasSidebar (asset tree, layer toggles, legend)
├── AtlasMap (map canvas, asset nodes, connections)
└── AtlasPanel (inspector panel with asset details)
```

### Data Model Integration
The component will consume data from Supabase tables:
- `tenders` (published, illustrative)
- `crew_members` (anchor, builder, apprentice)
- `roll_records` (deployed assets)
- `problem_briefs` (friction signals)
- `capital_intents` (funding signals)

All data fetching through existing public views:
- `public_market_tenders`
- `public_roll_records`
- `public_commons_resources`
- `public_commons_opportunities`

### State Management
- Local component state for UI (selected asset, active layer, active floor, active tab)
- Data fetching via Supabase client
- Layer visibility toggles persisted in localStorage

## Visual Design

### Colors (from styles.css)
- Published: `--terrain` / `--terrain-pale`
- Illustrative: `--contour` / `--contour-pale` (new token needed)
- Friction: `--water` / `--water-pale`
- Grid/Contours: `--line` / `--contour`

### Typography
- Serif headers: `var(--serif)`
- Mono labels: `var(--mono)`
- Sans body: `var(--sans)`

### Layout
- Header: 64px fixed
- Footer: 48px fixed with floor switcher
- Main: Three-column grid (280px | 1fr | 340px)
- Responsive: Stacks on < 1100px

## Features

### 1. Navigation Tabs
- TOPOLOGY - Asset topology map (default)
- RECRUITMENT - Crew recruitment opportunities
- RADAR - Friction signals radar
- LEDGER - Roll records and capital tracking
- COMMONS - Shared resources and discussions

### 2. Floor Switcher (Footer)
- BASEMENT - Deep infrastructure
- GROUND - Current operations (default)
- FIRST - Active projects
- SECOND - Strategic planning

### 3. Map Layers (Sidebar)
- Published Tenders (toggle)
- Illustrative Scenarios (toggle)
- Friction Signals (toggle)
- Contours (toggle)
- Grid (toggle)

### 4. Asset Tree (Sidebar)
- Hierarchical list of assets by type
- Badges: ENERGY/SOFTWARE/MEDIA, DEPLOYED/DRAFT/SIGNAL
- Selection syncs with map

### 5. Map Canvas
- Grid background (60px = 5km)
- Contour gradients
- Asset nodes with markers:
  - Published: ◉ (terrain)
  - Illustrative: ✦ (contour, dashed)
  - Friction: ⚠ (water)
- Hover labels, click selection
- Connection lines between related assets

### 6. Inspector Panel
- Asset details: ID, category, location, coordinates
- Financial: Build cost, funding target, settled amount
- Status with color coding
- Blueprint info
- Crew assignments
- Actions: OPEN ASSEMBLY, INSPECT BLUEPRINT, DRAFT BRIEF, RECRUIT, VIEW ROLL ENTRY

### 7. Coordinates Display
- Real-time lat/lng in header and map corner
- Scale indicator: "1 cm = 5 km | Grid: 60px = 5km"

## Technical Requirements

### Framework
- Preact with hooks
- wouter for routing (already in project)
- @preact/signals for reactive state (used in WorkspaceContextSwitcher)

### Data Fetching
- Supabase client from existing setup
- Use existing public views for read access
- Mock data fallback for development

### Styling
- CSS custom properties from `src/styles.css`
- Inline styles following existing patterns
- Dark mode support via `.dark` class

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Enter, Space, Escape)
- Focus visible outlines
- Live regions for dynamic content

## Implementation Constraints

1. **No new dependencies** - Use existing stack (Preact, wouter, @preact/signals, Supabase)
2. **Follow existing patterns** - Match People/Institutions/Commons structure
3. **Design tokens only** - No hardcoded colors, use CSS variables
4. **Responsive** - Works on mobile (stacked layout)
5. **Dark mode** - Full support via existing `.dark` class
6. **Performance** - Lazy load data, virtualize large lists if needed

## Acceptance Criteria

1. Route `/workspace/field-desk` loads the Field Desk workspace
2. WorkspaceContextSwitcher includes "Field Desk" option
3. Navigation tabs switch views
4. Floor switcher changes floor context
5. Layer toggles show/hide map layers
6. Asset tree selection syncs with map
7. Clicking asset node opens inspector panel
8. Inspector shows correct data for selected asset
9. Coordinates display updates on selection
10. Dark mode works correctly
11. Responsive layout stacks on narrow screens