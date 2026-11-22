<script setup lang="ts">
/**
 * Design Lab — Structural Emergence component playground
 * Living documentation of the design system.
 */
import { ref, h } from 'vue';
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  Avatar,
  Table,
  Tabs,
  Modal,
  Tooltip,
  Dropdown,
  Container,
  Grid,
  Stack,
  Section,
  PageHead,
} from '@/components/ui';

const modalOpen = ref(false);
const tooltipContent = 'This is contextual help text. Keep it brief and actionable.';
const dropdownItems = [
  { label: 'Edit', value: 'edit', icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' }, [h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }), h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })]) },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Archive', value: 'archive' },
  { divider: true },
  { label: 'Delete', value: 'delete', danger: true },
];

const tableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true, render: (row: any) => h(Badge, { variant: row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'neutral' }, { default: () => row.status }) },
  { key: 'lastActive', label: 'Last Active', sortable: true },
];

const tableRows = [
  { id: 1, name: 'Amina Otieno', role: 'Lead Architect', status: 'active', lastActive: '2 hours ago' },
  { id: 2, name: 'Kwame Nkrumah', role: 'Systems Engineer', status: 'active', lastActive: '5 hours ago' },
  { id: 3, name: 'Fatima Al-Fihri', role: 'Knowledge Steward', status: 'pending', lastActive: '1 day ago' },
  { id: 4, name: 'Cheikh Anta Diop', role: 'Research Lead', status: 'offline', lastActive: '3 days ago' },
];

const tabItems = [
  { key: 'overview', label: 'Overview', count: 12 },
  { key: 'details', label: 'Details', count: 3 },
  { key: 'history', label: 'History', count: 47 },
  { key: 'settings', label: 'Settings', disabled: true },
];

const activeTab = ref('overview');
const selectValue = ref('');
const inputValue = ref('');
const badgeRemovable = ref(true);

const colorGroups = [
  {
    name: 'Warm Ivory (Light Base)',
    cols: 6,
    colors: [
      { name: 'Ivory 50', value: 'var(--apt-color-ivory-50)' },
      { name: 'Ivory 100', value: 'var(--apt-color-ivory-100)' },
      { name: 'Ivory 200', value: 'var(--apt-color-ivory-200)' },
      { name: 'Ivory 300', value: 'var(--apt-color-ivory-300)' },
      { name: 'Ivory 400', value: 'var(--apt-color-ivory-400)' },
      { name: 'Ivory 500', value: 'var(--apt-color-ivory-500)' },
    ],
  },
  {
    name: 'Deep Earth (Dark Base)',
    cols: 6,
    colors: [
      { name: 'Earth 950', value: 'var(--apt-color-earth-950)' },
      { name: 'Earth 900', value: 'var(--apt-color-earth-900)' },
      { name: 'Earth 800', value: 'var(--apt-color-earth-800)' },
      { name: 'Earth 700', value: 'var(--apt-color-earth-700)' },
      { name: 'Earth 600', value: 'var(--apt-color-earth-600)' },
      { name: 'Earth 500', value: 'var(--apt-color-earth-500)' },
    ],
  },
  {
    name: 'Deep Forest / Ink',
    cols: 4,
    colors: [
      { name: 'Forest 500 (Primary)', value: 'var(--apt-color-forest-500)' },
      { name: 'Forest 600', value: 'var(--apt-color-forest-600)' },
      { name: 'Forest 700', value: 'var(--apt-color-forest-700)' },
    ],
  },
  {
    name: 'Selective Accents',
    cols: 4,
    colors: [
      { name: 'Lilac 500 (Witness/Lineage)', value: 'var(--apt-color-lilac-500)' },
      { name: 'Peach 500 (Collective Agency)', value: 'var(--apt-color-peach-500)' },
      { name: 'Peach 600', value: 'var(--apt-color-peach-600)' },
    ],
  },
  {
    name: 'State Colors',
    cols: 4,
    colors: [
      { name: 'Canon (Verified)', value: 'var(--apt-color-state-canon)' },
      { name: 'Proposed', value: 'var(--apt-color-state-proposed)' },
      { name: 'Risk', value: 'var(--apt-color-state-risk)' },
      { name: 'Caution', value: 'var(--apt-color-state-caution)' },
      { name: 'Alert', value: 'var(--apt-color-state-alert)' },
    ],
  },
  {
    name: 'Generative Concept Accents',
    cols: 4,
    colors: [
      { name: 'Interdependence', value: 'var(--apt-accent-interdependence)' },
      { name: 'Weaving', value: 'var(--apt-accent-weaving)' },
      { name: 'Continuity', value: 'var(--apt-accent-continuity)' },
      { name: 'Witness', value: 'var(--apt-accent-witness)' },
      { name: 'Lineage', value: 'var(--apt-accent-lineage)' },
      { name: 'Collective Agency', value: 'var(--apt-accent-collective)' },
    ],
  },
];

const typeStyles = [
  { name: 'display', label: 'Display', classes: 'apt-text-serif apt-fs-display apt-lh-tight', text: 'The common ground for African productive capacity.' },
  { name: 'display-xl', label: 'Display XL', classes: 'apt-text-serif apt-fs-display-xl apt-lh-tight', text: 'Structural Emergence' },
  { name: 'h1', label: 'H1', classes: 'apt-text-serif apt-fs-h1 apt-lh-tight', text: 'Operational Overview' },
  { name: 'h2', label: 'H2', classes: 'apt-text-serif apt-fs-h2 apt-lh-tight', text: 'How Work Moves' },
  { name: 'title-1', label: 'Title 1', classes: 'apt-text-serif apt-fs-title-1 apt-lh-normal', text: 'Page Section Heading' },
  { name: 'title-2', label: 'Title 2', classes: 'apt-text-serif apt-fs-title-2 apt-lh-normal', text: 'Card or Component Title' },
  { name: 'body-md', label: 'Body Medium (Sans)', classes: 'apt-text-sans apt-fs-body-md apt-lh-relaxed', text: 'This is the standard interface text size for body copy, forms, and interactive elements.' },
  { name: 'body-sm', label: 'Body Small (Sans)', classes: 'apt-text-sans apt-fs-body-sm apt-lh-normal', text: 'Secondary information, helper text, metadata, timestamps.' },
  { name: 'mono', label: 'Mono (Data/Codes)', classes: 'apt-text-mono apt-fs-body-sm apt-lh-normal', text: 'REC-2024-001-ACT-042 | KES 1,250,000 | 2024-11-15T14:30:00Z' },
  { name: 'micro', label: 'Micro (Labels/Badges)', classes: 'apt-text-mono apt-fs-micro apt-lh-normal', text: 'EVIDENCE STANDING · VERIFIED · 2024-11-15' },
];

const antiPatterns = [
  { name: 'Generic SaaS Dashboards', description: 'Endless card grids with arbitrary metrics. We show live operational readouts tied to the Roll.' },
  { name: 'Decorative Gradients/Glows', description: 'No CSS gradients, box-shadow glows, or background images that carry no structural meaning.' },
  { name: 'Unnecessary Glassmorphism', description: 'Translucency without purpose. Surfaces are opaque; layering is through elevation and border.' },
  { name: 'Arbitrary Rounded Corners', description: 'Radii come from a 6-step scale (2px–36px). No random border-radius values.' },
  { name: 'Fake Spatial Depth', description: 'No paralax, no fake 3D, no perspective transforms. Depth = shadow + border + surface hierarchy.' },
  { name: 'Unexplained Visual Metaphors', description: 'Every color, shape, and icon maps to an ontology family or generative concept.' },
  { name: 'Excessive Animation', description: 'Transitions ≤ 300ms, easing = ease. No stagger, no bounce, no decorative motion.' },
  { name: 'Decorative Graphs Without Operational Meaning', description: 'Every chart answers a question from the Roll. No charts for decoration.' },
];

function handleRowClick(row: any) {
  console.log('Row clicked:', row);
}

function handleDropdownSelect(value: string, item: any) {
  console.log('Dropdown select:', value, item);
}
</script>

<template>
  <div class="designlab-page" data-module="overview">
    <PageHead
      eyebrow="DESIGN SYSTEM"
      title="Structural Emergence"
      subtitle="African design DNA as generative language — Interdependence, Weaving, Continuity, Witness, Lineage, Collective agency"
    >
      <template #actions>
        <Button variant="ghost" size="sm">View Tokens</Button>
        <Button variant="primary" size="sm">Export</Button>
      </template>
    </PageHead>

    <Container>
      <!-- Colors -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="FOUNDATIONS" title="Color System" subtitle="Warm ivory base, earthy neutrals, deep forest/ink, selective lilac/peach accents" />
        <Grid cols="12" gap="md">
          <div v-for="group in colorGroups" :key="group.name" class="designlab-color-group" :style="{ gridColumn: `span ${group.cols}` }">
            <h4 class="designlab-color-group-title">{{ group.name }}</h4>
            <Stack gap="sm">
              <div
                v-for="color in group.colors"
                :key="color.name"
                class="designlab-color-swatch"
                :style="{ background: color.value }"
              >
                <span class="designlab-color-name">{{ color.name }}</span>
                <span class="designlab-color-value">{{ color.value }}</span>
              </div>
            </Stack>
          </div>
        </Grid>
      </Section>

      <!-- Typography -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="FOUNDATIONS" title="Typography" subtitle="Editorial serif for record names; precise sans/mono for interface" />
        <Grid cols="12" gap="md">
          <div class="designlab-typography-demo" style="grid-column: span 12">
            <Stack gap="md">
              <div v-for="style in typeStyles" :key="style.name" class="designlab-type-sample">
                <span class="designlab-type-label">{{ style.label }}</span>
                <p :class="style.classes" class="designlab-type-text">{{ style.text }}</p>
              </div>
            </Stack>
          </div>
        </Grid>
      </Section>

      <!-- Buttons -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Button" subtitle="Primary, secondary, ghost, outline variants — structural weight, not decoration" />
        <Card variant="outlined" padding="lg">
          <Stack direction="horizontal" gap="md" wrap align="center">
            <Button variant="primary" size="sm">Primary Small</Button>
            <Button variant="primary" size="md">Primary Medium</Button>
            <Button variant="primary" size="lg">Primary Large</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="ghost" size="md">Ghost</Button>
            <Button variant="outline" size="md">Outline</Button>
            <Button variant="primary" size="md" disabled>Disabled</Button>
            <Button variant="primary" size="md" loading>Loading</Button>
          </Stack>
        </Card>
      </Section>

      <!-- Inputs -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Input & Select" subtitle="Precise, accessible, error-aware — structure over style" />
        <Grid cols="12" gap="md">
          <div style="grid-column: span 6">
            <Card variant="outlined" padding="lg">
              <Stack gap="md">
                <Input
                  v-model="inputValue"
                  label="Email address"
                  placeholder="you@example.org"
                  helper="We'll never share your email"
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error="Password must be at least 8 characters"
                />
                <Input
                  label="Disabled input"
                  placeholder="Not editable"
                  disabled
                />
              </Stack>
            </Card>
          </div>
          <div style="grid-column: span 6">
            <Card variant="outlined" padding="lg">
              <Stack gap="md">
                <Select
                  v-model="selectValue"
                  :options="[
                    { value: 'kenya', label: 'Kenya' },
                    { value: 'nigeria', label: 'Nigeria' },
                    { value: 'ghana', label: 'Ghana' },
                    { value: 'south-africa', label: 'South Africa' },
                  ]"
                  placeholder="Select country"
                  label="Country"
                />
                <Select
                  :options="[
                    { value: 'individual', label: 'Individual' },
                    { value: 'crew', label: 'Crew' },
                    { value: 'institution', label: 'Institution' },
                  ]"
                  placeholder="Actor type"
                  label="Actor type"
                  helper="Determines available capabilities"
                />
              </Stack>
            </Card>
          </div>
        </Grid>
      </Section>

      <!-- Cards -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Card" subtitle="Contained surfaces — default, elevated, outlined" />
        <Grid cols="12" gap="md">
          <div v-for="variant in ['default', 'elevated', 'outlined']" :key="variant" style="grid-column: span 4">
            <Card :variant="variant" padding="lg" hoverable>
              <Stack gap="sm">
                <Badge variant="primary">{{ variant }}</Badge>
                <p class="apt-text-body">This card uses the <code>variant="${variant}"</code> prop. Hover to see the interaction.</p>
                <Button variant="ghost" size="sm">Action</Button>
              </Stack>
            </Card>
          </div>
        </Grid>
      </Section>

      <!-- Badges -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Badge" subtitle="Semantic status indicators — no arbitrary colors" />
        <Card variant="outlined" padding="lg">
          <Stack direction="horizontal" gap="md" wrap>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="primary">Interdependence</Badge>
            <Badge variant="success">Canon</Badge>
            <Badge variant="warning">Caution</Badge>
            <Badge variant="danger">Alert</Badge>
            <Badge variant="info">Witness</Badge>
            <Badge variant="primary" dot>With dot</Badge>
            <Badge variant="success" :removable="badgeRemovable" @remove="badgeRemovable = false">Removable</Badge>
          </Stack>
        </Card>
      </Section>

      <!-- Avatars -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Avatar" subtitle="Actor representation — deterministic color from name" />
        <Card variant="outlined" padding="lg">
          <Stack direction="horizontal" gap="md" wrap align="center">
            <Avatar name="Amina Otieno" size="xl" status="online" />
            <Avatar name="Kwame Nkrumah" size="lg" status="away" />
            <Avatar name="Fatima Al-Fihri" size="md" status="busy" />
            <Avatar name="Cheikh Anta Diop" size="sm" status="offline" />
            <Avatar name="W" size="xs" />
            <Avatar src="/placeholder-avatar.jpg" alt="Placeholder" size="md" />
          </Stack>
        </Card>
      </Section>

      <!-- Table -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Table" subtitle="Sortable, striped, responsive data display" />
        <Card variant="outlined" padding="none">
          <Table
            :columns="tableColumns"
            :rows="tableRows"
            keyField="id"
            striped
            hoverable
            clickable
            @row-click="handleRowClick"
          />
        </Card>
      </Section>

      <!-- Tabs -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Tabs" subtitle="Content switching with clear affordance" />
        <Card variant="outlined" padding="none">
          <Tabs v-model="activeTab" :tabs="tabItems" variant="line" />
          <Section size="sm" class="apt-p-6">
            <div v-if="activeTab === 'overview'">
              <p class="apt-text-body">Overview content — the structural summary of this record.</p>
            </div>
            <div v-if="activeTab === 'details'">
              <p class="apt-text-body">Detailed view — every field, every relation, every evidence item.</p>
            </div>
            <div v-if="activeTab === 'history'">
              <p class="apt-text-body">Annals — the immutable sequence of what happened and when.</p>
            </div>
          </Section>
        </Card>
      </Section>

      <!-- Modal -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Modal" subtitle="Focus-trapped, accessible dialog" />
        <Card variant="outlined" padding="lg">
          <Stack direction="horizontal" gap="md" wrap>
            <Button variant="primary" @click="modalOpen = true">Open Modal</Button>
            <Button variant="ghost" @click="modalOpen = true">Open Large Modal</Button>
          </Stack>
        </Card>

        <Modal
          v-model="modalOpen"
          title="Confirm Action"
          description="This action will update the record across all linked modules. The change is recorded in the Roll."
          size="md"
          @close="modalOpen = false"
        >
          <Stack gap="md">
            <p class="apt-text-body">Are you sure you want to proceed? This action creates an immutable entry in the Roll and notifies all participants.</p>
            <Stack direction="horizontal" gap="md" justify="end">
              <Button variant="ghost" @click="modalOpen = false">Cancel</Button>
              <Button variant="primary" @click="modalOpen = false">Confirm</Button>
            </Stack>
          </Stack>
        </Modal>
      </Section>

      <!-- Tooltip -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Tooltip" subtitle="Contextual information on hover/focus" />
        <Card variant="outlined" padding="lg">
          <Stack direction="horizontal" gap="md" wrap align="center">
            <Tooltip :content="tooltipContent" placement="top">
              <Button variant="ghost">Hover me (top)</Button>
            </Tooltip>
            <Tooltip :content="tooltipContent" placement="bottom">
              <Button variant="ghost">Hover me (bottom)</Button>
            </Tooltip>
            <Tooltip :content="tooltipContent" placement="left">
              <Button variant="ghost">Hover me (left)</Button>
            </Tooltip>
            <Tooltip :content="tooltipContent" placement="right">
              <Button variant="ghost">Hover me (right)</Button>
            </Tooltip>
          </Stack>
        </Card>
      </Section>

      <!-- Dropdown -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="COMPONENTS" title="Dropdown" subtitle="Keyboard-navigable menu with semantic actions" />
        <Card variant="outlined" padding="lg">
          <Stack direction="horizontal" gap="md" wrap>
            <Dropdown trigger="Actions" :items="dropdownItems" @select="handleDropdownSelect" />
            <Dropdown trigger="User Menu" :items="dropdownItems" placement="bottom" align="end" />
          </Stack>
        </Card>
      </Section>

      <!-- Layout Primitives -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="LAYOUT PRIMITIVES" title="Container, Grid, Stack, Section, PageHead" subtitle="Composable structural building blocks" />

        <Card variant="outlined" padding="lg">
          <PageHead eyebrow="DEMO" title="Container" subtitle="Max-width wrapper with responsive padding" size="sm" />
          <Container size="md" class="designlab-container-demo">
            <p class="apt-text-body">This content is constrained to the container max-width (1280px). Resize the viewport to see responsive padding.</p>
          </Container>
        </Card>

        <Card variant="outlined" padding="lg" class="designlab-mt-lg">
          <PageHead eyebrow="DEMO" title="Grid" subtitle="Responsive columns defined by content" size="sm" />
          <Grid :cols="{ sm: 1, md: 2, lg: 3, xl: 4 }" gap="md">
            <div v-for="i in 4" :key="i" class="designlab-grid-cell">
              <span class="apt-text-mono apt-fs-micro">Grid item {{ i }}</span>
            </div>
          </Grid>
        </Card>

        <Card variant="outlined" padding="lg" class="designlab-mt-lg">
          <PageHead eyebrow="DEMO" title="Stack" subtitle="Consistent spacing between elements" size="sm" />
          <Stack gap="md">
            <div class="designlab-stack-item">First item</div>
            <div class="designlab-stack-item">Second item</div>
            <div class="designlab-stack-item">Third item</div>
          </Stack>
          <Stack direction="horizontal" gap="md" wrap class="designlab-mt-md">
            <div class="designlab-stack-item">Horizontal</div>
            <div class="designlab-stack-item">Items</div>
            <div class="designlab-stack-item">Wrap naturally</div>
          </Stack>
        </Card>

        <Card variant="outlined" padding="lg" class="designlab-mt-lg">
          <PageHead eyebrow="DEMO" title="Section" subtitle="Semantic page sections with vertical rhythm" size="sm" />
          <Section size="md" background="page" bordered>
            <p class="apt-text-body">This section uses <code>background="page"</code> and <code>bordered</code>. It maintains consistent vertical rhythm with other sections.</p>
          </Section>
        </Card>
      </Section>

      <!-- Dark Mode Demo -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="THEMING" title="Dark Mode" subtitle="Deep earth base — all tokens adapt automatically" />
        <Card variant="outlined" padding="lg">
          <Stack direction="horizontal" gap="md" wrap align="center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Badge variant="primary">Interdependence</Badge>
            <Badge variant="success">Canon</Badge>
            <Badge variant="warning">Caution</Badge>
            <Badge variant="danger">Alert</Badge>
            <Input placeholder="Dark mode input" />
            <Select :options="[{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }]" placeholder="Select" />
          </Stack>
        </Card>
      </Section>

      <!-- Anti-patterns -->
      <Section size="lg" class="designlab-section">
        <PageHead eyebrow="PRINCIPLES" title="Anti-Patterns We Avoid" subtitle="Per Master Architecture Section 8" />
        <Grid cols="12" gap="md">
          <div v-for="anti in antiPatterns" :key="anti.name" style="grid-column: span 6">
            <Card variant="outlined" padding="md">
              <Stack gap="sm">
                <Stack direction="horizontal" gap="sm" align="center">
                  <span class="designlab-anti-icon" aria-hidden="true">✕</span>
                  <h4 class="designlab-anti-title">{{ anti.name }}</h4>
                </Stack>
                <p class="apt-text-muted apt-fs-body-sm">{{ anti.description }}</p>
              </Stack>
            </Card>
          </div>
        </Grid>
      </Section>
    </Container>
  </div>
</template>

<style scoped>
.designlab-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
}

.designlab-section {
  margin-bottom: var(--apt-spacing-s16);
}

.designlab-section:last-child {
  margin-bottom: 0;
}

.designlab-mt-lg { margin-top: var(--apt-spacing-s12); }
.designlab-mt-md { margin-top: var(--apt-spacing-s8); }

/* Color swatches */
.designlab-color-group-title {
  margin: 0 0 var(--apt-spacing-s4);
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
}

.designlab-color-swatch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 var(--apt-spacing-s4);
  border-radius: var(--apt-radius-r1);
  border: 1px solid var(--apt-border);
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-body);
  transition: border-color var(--apt-animation-fast);
}

.designlab-color-swatch:hover {
  border-color: var(--apt-border-strong);
}

.designlab-color-name { font-weight: var(--apt-font-weight-medium); }
.designlab-color-value { color: var(--apt-text-muted); }

/* Typography samples */
.designlab-type-sample {
  padding: var(--apt-spacing-s4);
  background: var(--apt-surface-page);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
}

.designlab-type-label {
  display: block;
  margin-bottom: var(--apt-spacing-s2);
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
}

.designlab-type-text {
  margin: 0;
}

/* Container demo */
.designlab-container-demo {
  background: var(--apt-surface-raised);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  padding: var(--apt-spacing-s6);
}

/* Grid demo */
.designlab-grid-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  background: var(--apt-surface-raised);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  font-family: var(--apt-font-sans);
  color: var(--apt-text-muted);
}

/* Stack demo */
.designlab-stack-item {
  padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
  background: var(--apt-surface-raised);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-body-sm);
}

/* Anti-pattern cards */
.designlab-anti-icon {
  color: var(--apt-color-state-alert);
  font-weight: var(--apt-font-weight-bold);
}

.designlab-anti-title {
  margin: 0;
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
}

/* Responsive */
@media (max-width: 768px) {
  .designlab-page {
    padding: var(--apt-spacing-s8);
  }

  .designlab-section {
    margin-bottom: var(--apt-spacing-s12);
  }
}
</style>