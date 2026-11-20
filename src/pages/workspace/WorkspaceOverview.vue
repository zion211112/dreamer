<script setup lang="ts">
/**
 * APT-LABS — Operational Overview (workspace home)
 *
 * The unit of this page is the CHAIN, not the type. Palantir's Discover answers
 * "what types exist in my model"; this answers "what does the model refuse to
 * confuse, and where does reality enter it".
 *
 * Every label, group, state and distinction below is imported from
 * src/lib/ontology — nothing on this page is invented for display.
 */
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import FamilyGlyph from '@/components/ontology/FamilyGlyph.vue';
import {
  CANONICAL_DISTINCTIONS,
  CONTEXT,
  CONTINUITY_LEARNING,
  EVIDENCE_STANDING,
  EVIDENCE_STANDING_LABELS,
  FAMILY,
  FAMILY_LABELS,
  OPERATIONAL_CORE,
  RELATIONSHIP_KIND,
  VALUE_LEGITIMACY,
  type Family,
} from '@/lib/ontology';

const query = ref('');

/** Relation vocabulary per family, mirroring the groupings declared in
 *  src/lib/ontology/relationships.ts. Editorial selection: the 2–3 kinds that
 *  most define the family, not every kind that touches it. */
const RELATIONS: Record<string, string[]> = {
  [FAMILY.ACTOR]: ['AFFILIATED_WITH', 'ACTS_ON_BEHALF_OF'],
  [FAMILY.CAPABILITY]: ['HOLDS_CAPABILITY', 'OFFERS_CAPACITY', 'OPERATES'],
  [FAMILY.RESOURCE]: ['CONTROLS_RESOURCE', 'CUSTODIES', 'REQUIRES'],
  [FAMILY.PLACE]: ['LOCATED_AT'],
  [FAMILY.INTENTION]: ['RESPONDS_TO', 'DERIVED_FROM'],
  [FAMILY.COMMITMENT]: ['COMMITTED_TO', 'AUTHORIZED_BY', 'FULFILLS'],
  [FAMILY.WORK]: ['ASSIGNED_TO', 'USES', 'PRODUCES'],
  [FAMILY.ACTIVITY]: ['DEPENDS_ON', 'USES'],
  [FAMILY.OUTPUT_OUTCOME]: ['PRODUCES', 'DERIVED_FROM'],
  [FAMILY.EXCHANGE]: ['SETTLES', 'FUNDS'],
  [FAMILY.EVIDENCE]: ['SUPPORTED_BY', 'VERIFIED_BY', 'ATTESTS'],
  [FAMILY.KNOWLEDGE]: ['DERIVED_FROM', 'CONTRIBUTES_TO'],
  [FAMILY.GOVERNANCE]: ['GOVERNED_BY', 'AUTHORIZED_BY'],
};

const STANDING_MEANING: Record<string, string> = {
  [EVIDENCE_STANDING.UNASSESSED]: 'Recorded, nobody has looked yet.',
  [EVIDENCE_STANDING.REPORTED]: 'Someone said so. No artefact behind it.',
  [EVIDENCE_STANDING.SUPPORTED]: 'Artefacts exist and were checked.',
  [EVIDENCE_STANDING.VERIFIED]: 'An authorised party confirmed it.',
  [EVIDENCE_STANDING.DISPUTED]: 'Challenged, and not yet resolved.',
  [EVIDENCE_STANDING.REJECTED]: 'Challenged, and found wanting.',
  [EVIDENCE_STANDING.EXPIRED]: 'Was true. The conditions moved.',
};

const GROUPS = [
  {
    key: 'core',
    label: 'Operational core',
    accent: 'var(--apt-group-core)',
    families: OPERATIONAL_CORE,
    note: 'Who acts, what they can do, what they hold, what they want, what they promise, what is done.',
  },
  {
    key: 'continuity',
    label: 'Continuity & learning',
    accent: 'var(--apt-group-continuity)',
    families: CONTINUITY_LEARNING,
    note: 'How work is actually carried out, what results, what can be shown, what is retained.',
  },
  {
    key: 'value',
    label: 'Value & legitimacy',
    accent: 'var(--apt-group-value)',
    families: VALUE_LEGITIMACY,
    note: 'What circulates between parties, and who had the standing to authorise it.',
  },
] as const;

const relationKindCount = Object.keys(RELATIONSHIP_KIND).length;
const standingStates = Object.values(EVIDENCE_STANDING);

const q = computed(() => query.value.trim().toLowerCase());

function familyMatches(family: Family): boolean {
  if (!q.value) return true;
  const hay = [FAMILY_LABELS[family], family, ...(RELATIONS[family] ?? [])].join(' ').toLowerCase();
  return hay.includes(q.value);
}

const visibleGroups = computed(() =>
  GROUPS.map((g) => ({ ...g, families: g.families.filter(familyMatches) })).filter(
    (g) => g.families.length > 0,
  ),
);

const visibleDistinctions = computed(() =>
  CANONICAL_DISTINCTIONS.filter((d) => !q.value || d.toLowerCase().includes(q.value)),
);

const noMatches = computed(
  () => q.value.length > 0 && visibleGroups.value.length === 0 && visibleDistinctions.value.length === 0,
);
</script>

<template>
  <div class="ov">
    <div class="ov-body">
      <!-- ── Rail ─────────────────────────────────────────────── -->
      <aside class="ov-rail">
        <nav class="ov-rail-block" aria-label="Structural groups">
          <h2 class="ov-rail-heading">Structure</h2>
          <ul class="ov-rail-list">
            <li v-for="g in visibleGroups" :key="g.key">
              <a class="ov-rail-item" :href="`#group-${g.key}`">
                <span class="ov-rail-swatch" :style="{ background: g.accent }" aria-hidden="true" />
                <span class="ov-rail-label">{{ g.label }}</span>
                <span class="ov-rail-count">{{ g.families.length }}</span>
              </a>
            </li>
            <li>
              <a class="ov-rail-item" href="#context">
                <span
                  class="ov-rail-swatch"
                  :style="{ background: 'var(--apt-family-place)' }"
                  aria-hidden="true"
                />
                <span class="ov-rail-label">Context</span>
                <span class="ov-rail-count">{{ CONTEXT.length }}</span>
              </a>
            </li>
          </ul>
        </nav>

        <nav class="ov-rail-block" aria-label="Evidence standing">
          <h2 class="ov-rail-heading">Standing</h2>
          <ul class="ov-rail-list">
            <li v-for="s in standingStates" :key="s">
              <a class="ov-rail-item ov-rail-item--quiet" href="#standing">
                <span
                  class="ov-rail-dot"
                  :style="{ background: `var(--apt-standing-${s})` }"
                  aria-hidden="true"
                />
                <span class="ov-rail-label">{{ EVIDENCE_STANDING_LABELS[s] }}</span>
              </a>
            </li>
          </ul>
        </nav>

        <div class="ov-rail-foot">
          <a class="ov-rail-config" href="#distinctions">
            <span aria-hidden="true">±</span>
            What we refuse to collapse
          </a>
        </div>
      </aside>

      <!-- ── Main ─────────────────────────────────────────────── -->
      <main class="ov-main">
        <!-- Within-module toolbar: filter + working state + primary act -->
        <div class="ov-toolbar">
          <div class="ov-search">
            <svg class="ov-search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M10.5 3a7.5 7.5 0 1 1-4.8 13.3L3 19.1 4.4 20.5l2.8-2.8A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"
              />
            </svg>
            <input
              v-model="query"
              type="search"
              class="ov-search-input"
              placeholder="Search families, relation kinds, distinctions…"
              aria-label="Search the ontology"
            />
          </div>
          <span class="ov-branch" title="No branch is proposed. The working state is the recorded state.">
            <span class="ov-branch-dot" aria-hidden="true" />
            Recorded
          </span>
          <RouterLink to="/workspace/workbench" class="ov-action-primary">Open Workbench</RouterLink>
        </div>

        <div class="ov-pagehead">
          <p class="ov-eyebrow">ONTOLOGY · OPERATIONAL OVERVIEW</p>
          <h1 class="ov-h1">The chain from reality to value</h1>
          <p class="ov-sub">
            Thirteen families in one graph. No record is collapsed into a score, and no claim counts
            as evidence until it carries standing.
          </p>
          <div class="ov-pagehead-actions">
            <RouterLink to="/workspace/records" class="ov-quiet">Records →</RouterLink>
            <RouterLink to="/workspace/intelligence" class="ov-quiet">Intelligence →</RouterLink>
          </div>
        </div>

        <!-- L3 metrics — max three, 2px left border, first in teal (charter B6) -->
        <dl class="ov-metrics">
          <div class="ov-metric ov-metric--first">
            <dt>Families</dt>
            <dd>{{ Object.keys(FAMILY).length }}</dd>
          </div>
          <div class="ov-metric">
            <dt>Relation kinds</dt>
            <dd>{{ relationKindCount }}</dd>
          </div>
          <div class="ov-metric">
            <dt>Standing states</dt>
            <dd>{{ standingStates.length }}</dd>
          </div>
        </dl>

        <p v-if="noMatches" class="ov-empty">
          Nothing in the ontology matches “{{ query }}”. Clear the field to see the full structure.
        </p>

        <!-- Group panels -->
        <section
          v-for="g in visibleGroups"
          :id="`group-${g.key}`"
          :key="g.key"
          class="ov-group"
          :style="{ '--group-accent': g.accent }"
          :aria-labelledby="`group-${g.key}-title`"
        >
          <div class="ov-group-head">
            <h2 :id="`group-${g.key}-title`" class="ov-group-title">{{ g.label }}</h2>
            <span class="ov-group-count">{{ g.families.length }} families</span>
          </div>
          <p class="ov-group-note">{{ g.note }}</p>

          <ul class="ov-cards">
            <li
              v-for="f in g.families"
              :key="f"
              class="ov-card"
              :style="{ '--family-accent': `var(--apt-family-${f.toLowerCase().replace('_outcome', '')})` }"
            >
              <div class="ov-card-head">
                <span class="ov-card-icon"><FamilyGlyph :family="f" /></span>
                <h3 class="ov-card-name">{{ FAMILY_LABELS[f] }}</h3>
              </div>
              <p class="ov-card-rellead" aria-hidden="true">
                {{ (RELATIONS[f] ?? []).length }} defined relations
              </p>
              <ul class="ov-chips">
                <li v-for="r in RELATIONS[f] ?? []" :key="r" class="ov-chip">{{ r.replace(/_/g, ' ') }}</li>
              </ul>
            </li>
          </ul>
        </section>

        <!-- Context sits under the chain, not beside it: everything is situated -->
        <section id="context" class="ov-context" aria-labelledby="context-title">
          <div class="ov-context-lead">
            <span class="ov-context-icon" aria-hidden="true"><FamilyGlyph :family="CONTEXT[0]" /></span>
            <div>
              <h2 id="context-title" class="ov-context-title">Context — {{ FAMILY_LABELS[CONTEXT[0]] }}</h2>
              <p class="ov-context-note">
                Not a fourth column. Every actor, resource and commitment above is situated somewhere,
                and that situation is recorded rather than assumed.
              </p>
            </div>
          </div>
          <ul class="ov-chips">
            <li v-for="r in RELATIONS[CONTEXT[0]] ?? []" :key="r" class="ov-chip">
              {{ r.replace(/_/g, ' ') }}
            </li>
          </ul>
        </section>

        <!-- The distinctions this ontology refuses to collapse -->
        <section id="distinctions" class="ov-panel" aria-labelledby="distinctions-title">
          <div class="ov-panel-head">
            <h2 id="distinctions-title" class="ov-panel-title">What we refuse to collapse</h2>
            <span class="ov-panel-count">{{ visibleDistinctions.length }}</span>
          </div>
          <p class="ov-panel-note">
            Named distinctions are enforced in schema and surfaced in the interface. An interface that
            merges any two of these has stopped representing the domain.
          </p>
          <ul class="ov-distinctions">
            <li v-for="d in visibleDistinctions" :key="d" class="ov-distinction">{{ d }}</li>
          </ul>
        </section>

        <!-- Standing legend -->
        <section id="standing" class="ov-panel" aria-labelledby="standing-title">
          <div class="ov-panel-head">
            <h2 id="standing-title" class="ov-panel-title">Standing, not a score</h2>
            <span class="ov-panel-count">{{ standingStates.length }}</span>
          </div>
          <p class="ov-panel-note">
            Seven states, held apart on purpose. They are shown side by side and never averaged into a
            single number, because a number gets quoted and the disagreement is the signal.
          </p>
          <ul class="ov-standing">
            <li
              v-for="s in standingStates"
              :key="s"
              class="ov-standing-item"
              :style="{ '--standing-accent': `var(--apt-standing-${s})` }"
            >
              <span class="ov-standing-swatch" aria-hidden="true" />
              <span class="ov-standing-label">{{ EVIDENCE_STANDING_LABELS[s] }}</span>
              <span class="ov-standing-meaning">{{ STANDING_MEANING[s] }}</span>
            </li>
          </ul>
          <p class="ov-standing-empty">
            No records are ingested in this workspace yet, so no standing counts are shown. A zero
            here would be a claim about the world, and there is nothing behind it.
          </p>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.ov {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Toolbar (within-module; shell owns rail + topbar per charter B3) ── */
.ov-toolbar {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s10);
  padding-bottom: var(--apt-spacing-s4);
  border-bottom: 1px solid var(--apt-border);
}

.ov-search {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  flex: 1;
  max-width: 460px;
  padding: 0 var(--apt-spacing-s4);
  height: 30px;
  background: var(--apt-surface-page);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
}

.ov-search:focus-within {
  border-color: var(--apt-color-brand-primary);
  box-shadow: var(--apt-shadow-sh1);
}

.ov-search-icon {
  width: 14px;
  height: 14px;
  color: var(--apt-text-dim);
  flex: none;
}

.ov-search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: var(--apt-font-size-body-md);
  color: var(--apt-text-body);
  outline: none;
}

.ov-search-input::placeholder {
  color: var(--apt-text-dim);
}

.ov-branch {
  display: inline-flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  margin-left: auto;
  flex: none;
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-sm-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--apt-text-muted);
}

.ov-branch-dot {
  width: 6px;
  height: 6px;
  background: var(--apt-color-brand-primary);
  border-radius: 50%;
}

.ov-action-primary {
  flex: none;
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-action-on-primary);
  background: var(--apt-action-primary);
  border: 1px solid var(--apt-action-primary);
  border-radius: var(--apt-radius-r1);
  padding: var(--apt-spacing-s2) var(--apt-spacing-s6);
  text-decoration: none;
  transition: background-color var(--apt-animation-fast);
}

.ov-action-primary:hover {
  background: var(--apt-color-neutral-n950);
}

/* ── Shell body ─────────────────────────────────────────────── */
.ov-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ── Rail ───────────────────────────────────────────────────── */
.ov-rail {
  width: 236px;
  flex: none;
  padding: var(--apt-spacing-s6) 0 var(--apt-spacing-s8);
  border-right: 1px solid var(--apt-border);
  background: var(--apt-surface-page);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s8);
}

.ov-rail-heading {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--apt-text-dim);
  padding: 0 var(--apt-spacing-s8) var(--apt-spacing-s2);
  margin: 0;
}

.ov-rail-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ov-rail-item {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  padding: var(--apt-spacing-s2) var(--apt-spacing-s8);
  font-size: var(--apt-font-size-body-md);
  color: var(--apt-text-muted);
  text-decoration: none;
  border-left: 2px solid transparent;
}

.ov-rail-item:hover {
  background: var(--apt-surface-raised);
  color: var(--apt-text-body);
  border-left-color: var(--apt-color-brand-primary);
}

.ov-rail-item--quiet {
  font-size: var(--apt-font-size-body-sm);
}

.ov-rail-swatch {
  width: 8px;
  height: 8px;
  flex: none;
}

.ov-rail-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex: none;
}

.ov-rail-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ov-rail-count {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  color: var(--apt-text-dim);
  background: var(--apt-surface-raised);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r0);
  padding: 0 4px;
}

.ov-rail-foot {
  margin-top: auto;
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8) 0;
  border-top: 1px solid var(--apt-border);
}

.ov-rail-config {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  text-decoration: none;
}

.ov-rail-config:hover {
  color: var(--apt-color-brand-primary);
}

/* ── Main ───────────────────────────────────────────────────── */
.ov-main {
  flex: 1;
  min-width: 0;
  padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22);
  max-width: 1180px;
}

/* Page head — charter B6 pattern */
.ov-pagehead {
  margin-bottom: var(--apt-spacing-s8);
}

.ov-eyebrow {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.12em;
  color: var(--apt-text-dim);
  margin: 0 0 var(--apt-spacing-s2);
}

.ov-h1 {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-display);
  font-weight: var(--apt-font-weight-semibold);
  letter-spacing: -0.022em;
  line-height: 1.05;
  color: var(--apt-text-strong);
  margin: 0 0 var(--apt-spacing-s3);
}

.ov-sub {
  font-size: var(--apt-font-size-body-md);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0;
  max-width: 62ch;
}

.ov-pagehead-actions {
  display: flex;
  gap: var(--apt-spacing-s6);
  margin-top: var(--apt-spacing-s4);
}

.ov-quiet {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  text-decoration: none;
  border-bottom: 1px solid var(--apt-border);
  padding-bottom: 1px;
}

.ov-quiet:hover {
  color: var(--apt-color-brand-primary);
  border-bottom-color: var(--apt-color-brand-primary);
}

/* L3 metrics — max three, 2px left border, first in teal (B6) */
.ov-metrics {
  display: flex;
  gap: var(--apt-spacing-s8);
  margin: 0 0 var(--apt-spacing-s12);
  padding: 0;
}

.ov-metric {
  padding-left: var(--apt-spacing-s3);
  border-left: 2px solid var(--apt-border);
}

.ov-metric--first {
  border-left-color: var(--apt-color-brand-secondary);
}

.ov-metric dt {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
}

.ov-metric dd {
  margin: var(--apt-spacing-s1) 0 0;
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  line-height: 1;
}

.ov-empty {
  font-size: var(--apt-font-size-body-md);
  color: var(--apt-text-muted);
  border: 1px dashed var(--apt-border);
  padding: var(--apt-spacing-s6);
  margin: 0 0 var(--apt-spacing-s8);
}

/* ── Groups ─────────────────────────────────────────────────── */
.ov-group {
  margin-bottom: var(--apt-spacing-s12);
}

.ov-group-head {
  display: flex;
  align-items: baseline;
  gap: var(--apt-spacing-s3);
  border-bottom: 1px solid var(--apt-border);
  padding-bottom: var(--apt-spacing-s2);
  margin-bottom: var(--apt-spacing-s3);
}

.ov-group-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  margin: 0;
  position: relative;
  padding-left: var(--apt-spacing-s4);
}

.ov-group-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.32em;
  width: 3px;
  height: 0.78em;
  background: var(--group-accent);
}

.ov-group-count {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
}

.ov-group-note {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s6);
  max-width: 78ch;
}

.ov-cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--apt-spacing-s4);
}

.ov-card {
  border: 1px solid var(--apt-border);
  border-top: 2px solid var(--family-accent);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-page);
  padding: var(--apt-spacing-s5) var(--apt-spacing-s6) var(--apt-spacing-s6);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s3);
  transition: border-color var(--apt-animation-fast), box-shadow var(--apt-animation-fast);
}

.ov-card:hover {
  box-shadow: var(--apt-shadow-sh2);
}

/* A lone trailing card takes the rest of its row instead of leaving a ragged gap */
.ov-card:last-child:nth-child(3n + 1) {
  grid-column: span 2;
}

.ov-card-head {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
}

.ov-card-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  flex: none;
  color: var(--family-accent);
  background: color-mix(in srgb, var(--family-accent) 12%, transparent);
  border-radius: var(--apt-radius-r0);
}

.ov-card-name {
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  letter-spacing: -0.01em;
  color: var(--apt-text-strong);
  margin: 0;
}

/* Ubuntu inversion: the relation field is the lead fact, not an object count */
.ov-card-rellead {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--apt-text-muted);
  margin: 0;
  padding-top: var(--apt-spacing-s3);
  border-top: 1px solid var(--apt-border-faint);
}

.ov-chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--apt-spacing-s2);
}

.ov-chip {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-sm-3);
  text-transform: lowercase;
  letter-spacing: 0.01em;
  color: var(--apt-text-body);
  background: var(--apt-surface-raised);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r0);
  padding: 2px 6px;
  white-space: nowrap;
}

/* ── Context strip ──────────────────────────────────────────── */
.ov-context {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s8);
  flex-wrap: wrap;
  padding: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s12);
  background: var(--apt-surface-page);
  border: 1px solid var(--apt-border);
  border-left: 3px solid var(--apt-family-place);
  border-radius: var(--apt-radius-r2);
}

.ov-context-lead {
  display: flex;
  align-items: flex-start;
  gap: var(--apt-spacing-s4);
  max-width: 70ch;
}

.ov-context-icon {
  color: var(--apt-family-place);
  margin-top: 2px;
}

.ov-context-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  margin: 0 0 var(--apt-spacing-s1);
}

.ov-context-note {
  font-size: var(--apt-font-size-body-sm);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0;
}

/* ── Panels ─────────────────────────────────────────────────── */
.ov-panel {
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-page);
  padding: var(--apt-spacing-s8);
  margin-bottom: var(--apt-spacing-s8);
}

.ov-panel-head {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  margin-bottom: var(--apt-spacing-s2);
}

.ov-panel-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  margin: 0;
}

.ov-panel-count {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  color: var(--apt-text-dim);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r0);
  padding: 0 5px;
}

.ov-panel-note {
  font-size: var(--apt-font-size-body-sm);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s6);
  max-width: 82ch;
}

/* Distinctions ledger */
.ov-distinctions {
  list-style: none;
  margin: 0;
  padding: 0;
  columns: 2;
  column-gap: var(--apt-spacing-s12);
}

.ov-distinction {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-body);
  padding: var(--apt-spacing-s1) 0;
  border-bottom: 1px solid var(--apt-border-faint);
  break-inside: avoid;
}

/* Standing legend */
.ov-standing {
  list-style: none;
  margin: 0 0 var(--apt-spacing-s6);
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(272px, 1fr));
  gap: var(--apt-spacing-s2) var(--apt-spacing-s8);
}

.ov-standing-item {
  display: grid;
  grid-template-columns: 10px auto;
  grid-template-rows: auto auto;
  column-gap: var(--apt-spacing-s3);
  padding: var(--apt-spacing-s2) 0;
  border-bottom: 1px solid var(--apt-border-faint);
}

.ov-standing-swatch {
  grid-row: 1 / span 2;
  width: 3px;
  height: 100%;
  background: var(--standing-accent);
  align-self: stretch;
}

.ov-standing-label {
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-strong);
}

.ov-standing-meaning {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-normal);
}

.ov-standing-empty {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-dim);
  border-top: 1px solid var(--apt-border);
  padding-top: var(--apt-spacing-s4);
  margin: 0;
}

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 1000px) {
  .ov-rail {
    display: none;
  }

  .ov-main {
    padding: var(--apt-spacing-s8);
  }

  .ov-distinctions {
    columns: 1;
  }
}

@media (max-width: 760px) {
  .ov-cards {
    grid-template-columns: 1fr;
  }

  .ov-card:last-child:nth-child(3n + 1) {
    grid-column: auto;
  }

  .ov-toolbar {
    flex-wrap: wrap;
  }

  .ov-search {
    max-width: none;
    flex: 1 0 100%;
  }
}
</style>