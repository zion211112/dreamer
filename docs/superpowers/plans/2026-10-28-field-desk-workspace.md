# Field Desk Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Field Desk workspace as a new workspace context with map-based "Field Atlas Command" interface featuring navigation tabs, floor switcher, asset map, sidebar with layer toggles and asset tree, and inspector panel.

**Architecture:** Add a new workspace page component following the existing People/Institutions/Commons pattern. The FieldDesk component will be a three-panel layout (Sidebar | Map | Panel) with reactive state for tabs, floors, layers, and selection. Data fetched from Supabase public views with mock fallback.

**Tech Stack:** Preact, wouter, @preact/signals, Supabase client, CSS custom properties from styles.css

**Spec:** docs/superpowers/specs/2026-10-28-field-desk-workspace-design.md

## Global Constraints

- No new dependencies — use existing stack only
- Follow existing workspace patterns (People.tsx, Institutions.tsx, Commons.tsx)
- Use only CSS custom properties from src/styles.css — no hardcoded colors
- Full dark mode support via .dark class
- Responsive: three-column grid stacks on < 1100px
- Accessibility: ARIA labels, keyboard navigation, focus visible, live regions
- TypeScript with Preact hooks (useState, useMemo, useEffect, useRef, useSignal)

## Review Focus

1. **Map interaction with many nodes** — 50+ asset nodes on map must remain responsive; test with 100+ nodes
2. **Layer toggle persistence** — layer visibility must persist across tab/floor switches and page reloads
3. **Selection sync** — clicking asset in tree, map, or panel must sync selection everywhere
4. **Data loading states** — empty/skeleton/error states for Supabase fetches
5. **Keyboard navigation** — Tab through all interactive elements, Escape clears selection, Enter activates

---

### Task 1: Add Field Desk to Workspace Context Switcher and Routing

**Files:**
- Modify: `src/components/WorkspaceContextSwitcher.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/workspace/WorkspaceLayout.tsx`

**Interfaces:**
- Produces: `contexts` array entry `{ id: 'field-desk', label: 'Field Desk', subtitle: 'Atlas command', path: '/workspace/field-desk' }`
- Produces: Route `<Route path="/workspace/field-desk"><FieldDesk /></Route>`
- Produces: WorkspaceLayout accepts `currentContext: 'people' | 'institutions' | 'commons' | 'field-desk'`

- [ ] **Step 1: Write failing test for WorkspaceContextSwitcher**

```typescript
// test/workspace-context-switcher.test.tsx
import { render, screen } from '@testing-library/preact';
import { WorkspaceContextSwitcher } from '../../src/components/WorkspaceContextSwitcher';

test('includes Field Desk context option', () => {
  render(<WorkspaceContextSwitcher />);
  const fieldDeskBtn = screen.getByRole('button', { name: /Field Desk/i });
  expect(fieldDeskBtn).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/workspace-context-switcher.test.tsx`
Expected: FAIL - Field Desk button not found

- [ ] **Step 3: Add Field Desk to contexts array in WorkspaceContextSwitcher.tsx**

Add entry: `{ id: 'field-desk', label: 'Field Desk', subtitle: 'Atlas command', path: '/workspace/field-desk' }`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test test/workspace-context-switcher.test.tsx`
Expected: PASS

- [ ] **Step 5: Add FieldDesk import and route to App.tsx**

Import: `import { FieldDesk } from './pages/workspace/FieldDesk';`
Route: `<Route path="/workspace/field-desk"><FieldDesk /></Route>`

- [ ] **Step 6: Update WorkspaceLayout Props type to include 'field-desk'**

Change: `currentContext: 'people' | 'institutions' | 'commons' | 'field-desk'`

- [ ] **Step 7: Commit**

```bash
git add src/components/WorkspaceContextSwitcher.tsx src/App.tsx src/pages/workspace/WorkspaceLayout.tsx test/workspace-context-switcher.test.tsx
git commit -m "feat: add Field Desk workspace context and routing"
```

---

### Task 2: Create FieldDesk Main Component with Layout Structure

**Files:**
- Create: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/field-desk.test.tsx`

**Interfaces:**
- Consumes: WorkspaceLayout from './WorkspaceLayout'
- Produces: FieldDesk component with three-panel layout structure

- [ ] **Step 1: Write failing test for FieldDesk component**

```typescript
// test/field-desk.test.tsx
import { render, screen } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('renders Field Desk workspace with three panels', () => {
  render(<FieldDesk />);
  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByLabelText(/asset tree/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/asset topology map/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/asset inspector/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/field-desk.test.tsx`
Expected: FAIL - FieldDesk not exported / component not found

- [ ] **Step 3: Create FieldDesk.tsx with basic three-panel structure**

Create component with:
- WorkspaceLayout wrapper with currentContext="field-desk"
- Header with navigation tabs (TOPOLOGY, RECRUITMENT, RADAR, LEDGER, COMMONS)
- Main with three-column grid: aside (sidebar), section (map), aside (panel)
- Footer with floor switcher (BASEMENT, GROUND, FIRST, SECOND)
- State signals for activeTab, activeFloor, activeLayers, selectedAsset

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test test/field-desk.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/field-desk.test.tsx
git commit -m "feat: create FieldDesk main component with three-panel layout"
```

---

### Task 3: Implement AtlasHeader with Navigation Tabs and Coordinates

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/atlas-header.test.tsx`

**Interfaces:**
- Consumes: activeTab signal, activeFloor signal from FieldDesk
- Produces: Header component with tabs, coords display, scale display, action buttons

- [ ] **Step 1: Write failing test for AtlasHeader**

```typescript
// test/atlas-header.test.tsx
import { render, screen, fireEvent } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('navigation tabs switch activeTab state', () => {
  render(<FieldDesk />);
  const recruitmentTab = screen.getByRole('tab', { name: /recruitment/i });
  fireEvent.click(recruitmentTab);
  expect(screen.getByRole('tab', { name: /recruitment/i })).toHaveAttribute('aria-selected', 'true');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/atlas-header.test.tsx`
Expected: FAIL - tabs not implemented or not interactive

- [ ] **Step 3: Implement AtlasHeader section in FieldDesk**

Add to header:
- Navigation tabs with role="tablist", buttons with role="tab"
- Coords display (lat/lng)
- Scale display ("1 cm = 5 km | Grid: 60px = 5km")
- Action buttons: Reset view, New signal
- Tab click updates activeTab signal

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test test/atlas-header.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/atlas-header.test.tsx
git commit -m "feat: implement AtlasHeader with navigation tabs and coordinates"
```

---

### Task 4: Implement AtlasSidebar with Layer Toggles and Asset Tree

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/atlas-sidebar.test.tsx`

**Interfaces:**
- Consumes: activeLayers signal, selectedAsset signal, assets data
- Produces: Sidebar with layer toggles, asset tree, legend

- [ ] **Step 1: Write failing test for AtlasSidebar**

```typescript
// test/atlas-sidebar.test.tsx
import { render, screen, fireEvent } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('layer toggles control layer visibility', () => {
  render(<FieldDesk />);
  const frictionToggle = screen.getByRole('button', { name: /friction signals/i });
  fireEvent.click(frictionToggle);
  expect(frictionToggle).toHaveAttribute('aria-pressed', 'false');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/atlas-sidebar.test.tsx`
Expected: FAIL - layer toggles not implemented

- [ ] **Step 3: Implement AtlasSidebar section in FieldDesk**

Add to sidebar:
- Map Layers section with toggle buttons for: Published, Illustrative, Friction, Contours, Grid
- Each toggle: role="button", aria-pressed, swatch indicator
- Assets & Signals tree with hierarchical items
- Tree items: twistie, label, badges (category, status)
- Tree item click sets selectedAsset
- Legend section with swatches

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test test/atlas-sidebar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/atlas-sidebar.test.tsx
git commit -m "feat: implement AtlasSidebar with layer toggles and asset tree"
```

---

### Task 5: Implement AtlasMap with Asset Nodes and Connections

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/atlas-map.test.tsx`

**Interfaces:**
- Consumes: assets data, activeLayers, selectedAsset, activeTab
- Produces: Map canvas with grid, contours, asset nodes, connection lines

- [ ] **Step 1: Write failing test for AtlasMap**

```typescript
// test/atlas-map.test.tsx
import { render, screen, fireEvent } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('asset nodes render on map and can be selected', () => {
  render(<FieldDesk />);
  const node = screen.getByRole('button', { name: /nyamindi hydro/i });
  expect(node).toBeInTheDocument();
  fireEvent.click(node);
  expect(node).toHaveAttribute('aria-pressed', 'true');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/atlas-map.test.tsx`
Expected: FAIL - map nodes not rendered

- [ ] **Step 3: Implement AtlasMap section in FieldDesk**

Add to map:
- Grid background (CSS repeating-linear-gradient)
- Contour gradients (radial-gradient layers)
- Asset nodes positioned absolutely (top/left %)
- Node markers: Published (◉ terrain), Illustrative (✦ contour dashed), Friction (⚠ water)
- Node labels on hover
- Click handler sets selectedAsset
- Connection lines between related assets (SVG lines)
- Layer visibility controlled by activeLayers
- Coords display in corner, scale bar

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test test/atlas-map.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/atlas-map.test.tsx
git commit -m "feat: implement AtlasMap with asset nodes and connections"
```

---

### Task 6: Implement AtlasPanel Inspector with Asset Details

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/atlas-panel.test.tsx`

**Interfaces:**
- Consumes: selectedAsset signal, assets data
- Produces: Panel with asset details, financials, status, crew, actions

- [ ] **Step 1: Write failing test for AtlasPanel**

```typescript
// test/atlas-panel.test.tsx
import { render, screen } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('panel shows selected asset details', () => {
  render(<FieldDesk />);
  // Simulate selection via test hook or data attribute
  expect(screen.getByText(/asset id/i)).toBeInTheDocument();
  expect(screen.getByText(/category/i)).toBeInTheDocument();
  expect(screen.getByText(/location/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/atlas-panel.test.tsx`
Expected: FAIL - panel not showing asset details

- [ ] **Step 3: Implement AtlasPanel section in FieldDesk**

Add to panel:
- Panel header with title and status badge (PUBLISHED/ILLUSTRATIVE/SIGNAL)
- Fact rows: Asset ID, Category, Location, Coordinates, Build Cost, Funding Target, Settled, Status, Blueprint, Crew
- Action row with buttons: OPEN ASSEMBLY, INSPECT BLUEPRINT, DRAFT BRIEF, RECRUIT, VIEW ROLL ENTRY
- Different panels for different asset types (published, illustrative, friction)
- Empty state when no asset selected

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test test/atlas-panel.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/atlas-panel.test.tsx
git commit -m "feat: implement AtlasPanel inspector with asset details and actions"
```

---

### Task 7: Implement Data Fetching from Supabase with Mock Fallback

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Create: `src/lib/fieldDeskApi.ts` (optional - for data fetching logic)
- Test: `test/field-desk-data.test.tsx`

**Interfaces:**
- Consumes: Supabase client, public views (public_market_tenders, public_roll_records, public_commons_opportunities, public_problem_briefs)
- Produces: assets data array with unified shape for all asset types

- [ ] **Step 1: Write failing test for data fetching**

```typescript
// test/field-desk-data.test.tsx
import { fetchFieldDeskAssets } from '../../src/lib/fieldDeskApi';

test('fetchFieldDeskAssets returns unified asset array', async () => {
  const assets = await fetchFieldDeskAssets();
  expect(Array.isArray(assets)).toBe(true);
  expect(assets.length).toBeGreaterThan(0);
  expect(assets[0]).toHaveProperty('id');
  expect(assets[0]).toHaveProperty('type'); // 'published' | 'illustrative' | 'friction'
  expect(assets[0]).toHaveProperty('name');
  expect(assets[0]).toHaveProperty('position'); // { top, left }
  expect(assets[0]).toHaveProperty('coordinates'); // [lat, lng]
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/field-desk-data.test.tsx`
Expected: FAIL - function not defined

- [ ] **Step 3: Create fieldDeskApi.ts with fetchFieldDeskAssets function**

Fetch from:
- public_market_tenders (published tenders)
- public_roll_records (deployed assets)
- public_commons_opportunities (recruitment)
- problem_briefs (friction signals - user's own)

Transform to unified shape:
```typescript
interface AtlasAsset {
  id: string;
  type: 'published' | 'illustrative' | 'friction';
  name: string;
  category: string;
  status: string;
  position: { top: string; left: string };
  coordinates: [number, number];
  buildCost?: number;
  fundingTarget?: number;
  settled?: number;
  statusColor: string;
  crew?: Array<{ role: string; name: string }>;
  blueprint?: { version: string; hash: string; lines: number };
}
```

- [ ] **Step 4: Add mock data fallback for development**

Static mock data matching design file assets:
- Nyamindi Hydro (published, energy)
- Tender System (published, software)
- Mwea Animation (illustrative, media)
- Culture/Education/Work friction signals

- [ ] **Step 5: Integrate into FieldDesk component**

Use useEffect to fetch on mount, set assets state

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test test/field-desk-data.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/fieldDeskApi.ts src/pages/workspace/FieldDesk.tsx test/field-desk-data.test.tsx
git commit -m "feat: add data fetching for Field Desk assets with mock fallback"
```

---

### Task 8: Implement Floor Switcher and Tab Content Switching

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/floor-switcher.test.tsx`

**Interfaces:**
- Consumes: activeFloor signal, activeTab signal
- Produces: Floor switcher in footer, tab-specific content/views

- [ ] **Step 1: Write failing test for floor switcher**

```typescript
// test/floor-switcher.test.tsx
import { render, screen, fireEvent } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('floor switcher changes active floor', () => {
  render(<FieldDesk />);
  const firstFloorBtn = screen.getByRole('button', { name: /first/i });
  fireEvent.click(firstFloorBtn);
  expect(firstFloorBtn).toHaveAttribute('aria-pressed', 'true');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/floor-switcher.test.tsx`
Expected: FAIL - floor switcher not implemented

- [ ] **Step 3: Implement floor switcher in footer**

Add to footer:
- Floor buttons: BASEMENT, GROUND, FIRST, SECOND
- role="group" with aria-label="Floor switcher"
- Active floor highlighted
- Click updates activeFloor signal
- Floor affects which assets shown (filter by floor metadata)

- [ ] **Step 4: Implement tab content switching**

Each tab shows different view:
- TOPOLOGY: Full map with all layers
- RECRUITMENT: Opportunities list + map filtered to recruitment
- RADAR: Friction signals prominent
- LEDGER: Roll records list + capital tracking
- COMMONS: Commons resources list

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test test/floor-switcher.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/floor-switcher.test.tsx
git commit -m "feat: implement floor switcher and tab content switching"
```

---

### Task 9: Add Layer Toggle Persistence and Selection Sync

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/layer-persistence.test.tsx`

**Interfaces:**
- Consumes: localStorage, activeLayers signal, selectedAsset signal
- Produces: Persisted layer state, bidirectional selection sync

- [ ] **Step 1: Write failing test for layer persistence**

```typescript
// test/layer-persistence.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('layer toggles persist in localStorage', () => {
  render(<FieldDesk />);
  const frictionToggle = screen.getByRole('button', { name: /friction signals/i });
  fireEvent.click(frictionToggle); // turn off
  // Re-render simulates page reload
  const { unmount } = render(<FieldDesk />);
  unmount();
  render(<FieldDesk />);
  expect(screen.getByRole('button', { name: /friction signals/i })).toHaveAttribute('aria-pressed', 'false');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/layer-persistence.test.tsx`
Expected: FAIL - persistence not implemented

- [ ] **Step 3: Add localStorage persistence for activeLayers**

On mount: read from localStorage
On change: write to localStorage
Key: 'field-desk-layers'

- [ ] **Step 4: Add selection sync between tree, map, panel**

Tree click → sets selectedAsset → map highlights, panel shows
Map click → sets selectedAsset → tree highlights, panel shows
Panel close → clears selectedAsset → tree/map clear highlight

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test test/layer-persistence.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/layer-persistence.test.tsx
git commit -m "feat: add layer toggle persistence and selection sync"
```

---

### Task 10: Add Keyboard Navigation and Accessibility

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/accessibility.test.tsx`

**Interfaces:**
- Consumes: keyboard events, focus management
- Produces: Full keyboard navigation, ARIA attributes, focus visible

- [ ] **Step 1: Write failing test for keyboard navigation**

```typescript
// test/accessibility.test.tsx
import { render, screen, fireEvent } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('Escape key clears selection', () => {
  render(<FieldDesk />);
  const node = screen.getByRole('button', { name: /nyamindi hydro/i });
  fireEvent.click(node);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(node).not.toHaveAttribute('aria-pressed', 'true');
});

test('Tab navigates through all interactive elements', () => {
  render(<FieldDesk />);
  const tabbable = screen.getAllByTabbable(); // hypothetical
  expect(tabbable.length).toBeGreaterThan(10);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/accessibility.test.tsx`
Expected: FAIL - keyboard handling not implemented

- [ ] **Step 3: Add keyboard event handlers**

Global keydown listener:
- Escape: clear selection
- Arrow keys: navigate tree items
- Enter/Space: activate buttons, select tree items
- Tab: natural focus order

ARIA attributes:
- role="tablist"/"tab" for navigation
- role="tree"/"treeitem" for asset tree
- role="button" for all clickable elements
- aria-pressed for toggles
- aria-selected for selected items
- aria-live for coords updates

- [ ] **Step 4: Add focus-visible styles**

Ensure all interactive elements have visible focus ring (already in styles.css)

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test test/accessibility.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/accessibility.test.tsx
git commit -m "feat: add keyboard navigation and accessibility"
```

---

### Task 11: Add Responsive Layout and Dark Mode Support

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/responsive.test.tsx`

**Interfaces:**
- Consumes: window resize, .dark class
- Produces: Stacked layout on mobile, correct dark mode colors

- [ ] **Step 1: Write failing test for responsive layout**

```typescript
// test/responsive.test.tsx
import { render, screen } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('layout stacks on narrow viewport', () => {
  // Mock window.innerWidth
  Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
  render(<FieldDesk />);
  const main = screen.getByRole('main');
  expect(main).toHaveStyle({ gridTemplateColumns: '1fr' });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/responsive.test.tsx`
Expected: FAIL - responsive not implemented

- [ ] **Step 3: Add responsive CSS/media queries**

In FieldDesk styles:
- @media (max-width: 1100px): grid-template-columns: 1fr; header stacks
- Sidebar and panel become collapsible drawers or stacked
- Floor switcher adapts

- [ ] **Step 4: Verify dark mode colors**

All colors use CSS variables from styles.css
Test with .dark class on html element

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test test/responsive.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/responsive.test.tsx
git commit -m "feat: add responsive layout and dark mode support"
```

---

### Task 12: Integration Test and Polish

**Files:**
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Test: `test/field-desk-integration.test.tsx`

**Interfaces:**
- Consumes: All previous tasks
- Produces: Fully working Field Desk workspace

- [ ] **Step 1: Write integration test**

```typescript
// test/field-desk-integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { FieldDesk } from '../../src/pages/workspace/FieldDesk';

test('full user flow: select asset on map, view in panel, switch tab, change floor', async () => {
  render(<FieldDesk />);
  // Wait for data load
  await waitFor(() => screen.getByRole('button', { name: /nyamindi hydro/i }));
  
  // Select asset on map
  const node = screen.getByRole('button', { name: /nyamindi hydro/i });
  fireEvent.click(node);
  
  // Verify panel shows details
  expect(screen.getByText(/nyamindi hydro/i)).toBeInTheDocument();
  expect(screen.getByText(/energy/i)).toBeInTheDocument();
  
  // Switch to RECRUITMENT tab
  fireEvent.click(screen.getByRole('tab', { name: /recruitment/i }));
  expect(screen.getByRole('tab', { name: /recruitment/i })).toHaveAttribute('aria-selected', 'true');
  
  // Change floor
  fireEvent.click(screen.getByRole('button', { name: /first/i }));
  expect(screen.getByRole('button', { name: /first/i })).toHaveAttribute('aria-pressed', 'true');
  
  // Toggle layer
  fireEvent.click(screen.getByRole('button', { name: /friction signals/i }));
  expect(screen.getByRole('button', { name: /friction signals/i })).toHaveAttribute('aria-pressed', 'false');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test test/field-desk-integration.test.tsx`
Expected: FAIL - integration issues

- [ ] **Step 3: Fix any integration issues**

Ensure all components work together:
- State signals properly shared
- Data flows correctly
- No console errors

- [ ] **Step 4: Run full test suite**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/pages/workspace/FieldDesk.tsx test/field-desk-integration.test.tsx
git commit -m "feat: complete Field Desk workspace integration and polish"
```

---

### Task 13: Update Documentation and Verify Deployment

**Files:**
- Modify: `README.md` (if needed)
- Test: N/A

**Interfaces:**
- Consumes: Completed implementation
- Produces: Updated documentation, verified deployment

- [ ] **Step 1: Update README with Field Desk workspace info**

Add section describing Field Desk workspace and its features

- [ ] **Step 2: Run build and verify no errors**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 3: Push to remote**

Run: `git push`
Expected: Push succeeds, triggers Vercel deploy

- [ ] **Step 4: Verify live deployment**

Check deployed URL for Field Desk workspace

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update README for Field Desk workspace"
git push
```

---

## Summary

This plan implements the Field Desk workspace as a complete, accessible, responsive map-based interface with:
- 5 navigation tabs (Topology, Recruitment, Radar, Ledger, Commons)
- 4 floor levels (Basement, Ground, First, Second)
- 5 map layers with persistence
- Asset tree with 6+ demo assets
- Inspector panel with full asset details
- Supabase data integration with mock fallback
- Full keyboard navigation and accessibility
- Dark mode support
- Responsive layout

Total estimated tasks: 13
Estimated commits: 13