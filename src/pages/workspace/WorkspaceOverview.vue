<script setup lang="ts">
/**
 * APT-LABS — Operational Overview (workspace home).
 *
 * This is the workspace's instrument panel, not a type catalogue. It reads in
 * the order a person works: STATE (what the model can and cannot do right now),
 * ACTION (the verbs that move work forward, each with its consequence), then the
 * SUBSTRATE — the families, relations and standings that make the instrument
 * work, demoted to a quiet reference strip at the foot of the page.
 *
 * Every label, group, state and distinction is sourced from src/lib/ontology —
 * nothing on this page is invented for display. Where the workspace holds no
 * institutional data yet, the readout says so plainly instead of fabricating
 * numbers: an empty record is a correct state, not a gap to paper over.
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

/**
 * The operational verbs this page leads with — not the types. Each move names
 * the destination module and the consequence of taking it, so the console reads
 * as "here is what you can do" rather than "here is what we think."
 */
const MOVES = [
  {
    to: '/workspace/workbench',
    verb: 'Open the workbench',
    consequence: 'Pick up the next work unit and see exactly what is blocked on it.',
    icon: 'M4 5h16M4 12h16M4 19h10',
  },
  {
    to: '/workspace/records',
    verb: 'File a record',
    consequence: 'Put a claim into the graph, provenance intact, standing ungraded.',
    icon: 'M7 4h7l4 4v12H7zM14 4v4h4M10 12h5M10 16h4',
  },
  {
    to: '/workspace/proof',
    verb: 'Verify evidence',
    consequence: 'Move a claim up a standing, or dispute one that has drifted.',
    icon: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z M9 12l2 2 4-4',
  },
  {
    to: '/workspace/commons',
    verb: 'Start an inquiry',
    consequence: 'Open a Commons thread and bind it to the proposition you are testing.',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  },
] as const;

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
  <div class="ov" data-module="overview">
    <div class="ov-body">
      <main class="ov-main">
        <!-- Identity -->
        <div class="ov-pagehead">
          <p class="ov-eyebrow">WORKSPACE · OPERATIONAL OVERVIEW</p>
          <h1 class="ov-h1">The chain from reality to value</h1>
          <p class="ov-sub">
            Apt-LABS is a machine for making claims you can defend. Every claim carries standing,
            and none counts as evidence until it does.
          </p>
        </div>

        <!-- STATE — what the instrument can do, and what the record holds -->
        <div class="ov-now">
          <div class="ov-now-block ov-now-block--model">
            <div class="ov-now-kicker">The model</div>
            <div class="ov-now-cal">
              <span class="ov-now-num">{{ Object.keys(FAMILY).length }}</span>
              <span class="ov-now-unit">families</span>
            </div>
            <dl class="ov-now-sub">
              <div><dt>Relation kinds</dt><dd>{{ relationKindCount }}</dd></div>
              <div><dt>Standings</dt><dd>{{ standingStates.length }}</dd></div>
              <div><dt>Distinctions</dt><dd>{{ CANONICAL_DISTINCTIONS.length }}</dd></div>
            </dl>
            <p class="ov-now-note">
              Calibrated and enforced in schema. A record stays a record — it is never collapsed
              into a score.
            </p>
          </div>
          <div class="ov-now-block ov-now-block--record">
            <div class="ov-now-kicker">The record</div>
            <div class="ov-now-cal">
              <span class="ov-now-num ov-now-num--empty">0</span>
              <span class="ov-now-unit">ingested</span>
            </div>
            <p class="ov-now-note">
              No institutional data yet. The instrument is calibrated and the record is open — that
              is the honest state, not a gap. File the first record or take a workbench unit to begin.
            </p>
          </div>
        </div>

        <!-- ACTION — the four verbs, each with its consequence -->
        <div class="ov-moves">
          <RouterLink v-for="m in MOVES" :key="m.to" :to="m.to" class="ov-move">
            <span class="ov-move-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="m.icon" /></svg>
            </span>
            <span class="ov-move-text">
              <span class="ov-move-verb">{{ m.verb }}</span>
              <span class="ov-move-consequence">{{ m.consequence }}</span>
            </span>
            <span class="ov-move-go" aria-hidden="true">→</span>
          </RouterLink>
        </div>

        <!-- SUBSTRATE — demoted reference. The ontology that makes the instrument work. -->
        <div class="ov-substrate">
          <div class="ov-substrate-head">
            <div class="ov-substrate-lead">
              <h2 class="ov-substrate-title">The substrate</h2>
              <p class="ov-substrate-note">
                The families, relations and standings the model enforces. Read it when you need to —
                not as the opening act.
              </p>
            </div>
            <div class="ov-substrate-tools">
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
                  placeholder="Filter the substrate — families, relations, distinctions…"
                  aria-label="Filter the substrate"
                />
              </div>
              <RouterLink to="/workspace/intelligence" class="ov-quiet">Intelligence →</RouterLink>
            </div>
          </div>

          <p v-if="noMatches" class="ov-empty">
            Nothing in the substrate matches “{{ query }}”. Clear the field to see the full structure.
          </p>

          <section
            v-for="g in visibleGroups"
            :id="`group-${g.key}`"
            :key="g.key"
            class="ov-group"
            :style="{ '--group-accent': g.accent }"
            :aria-labelledby="`group-${g.key}-title`"
          >
            <div class="ov-group-head">
              <h3 :id="`group-${g.key}-title`" class="ov-group-title">{{ g.label }}</h3>
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
                  <h4 class="ov-card-name">{{ FAMILY_LABELS[f] }}</h4>
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
                <h3 id="context-title" class="ov-context-title">Context — {{ FAMILY_LABELS[CONTEXT[0]] }}</h3>
                <p class="ov-context-note">
                  Not a fourth column. Every actor, resource and commitment above is situated
                  somewhere, and that situation is recorded rather than assumed.
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
              <h3 id="distinctions-title" class="ov-panel-title">What we refuse to collapse</h3>
              <span class="ov-panel-count">{{ visibleDistinctions.length }}</span>
            </div>
            <p class="ov-panel-note">
              Named distinctions are enforced in schema and surfaced in the interface. An interface
              that merges any two of these has stopped representing the domain.
            </p>
            <ul class="ov-distinctions">
              <li v-for="d in visibleDistinctions" :key="d" class="ov-distinction">{{ d }}</li>
            </ul>
          </section>

          <!-- Standing legend -->
          <section id="standing" class="ov-panel" aria-labelledby="standing-title">
            <div class="ov-panel-head">
              <h3 id="standing-title" class="ov-panel-title">Standing, not a score</h3>
              <span class="ov-panel-count">{{ standingStates.length }}</span>
            </div>
            <p class="ov-panel-note">
              Seven states, held apart on purpose. They are shown side by side and never averaged
              into a single number, because a number gets quoted and the disagreement is the signal.
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
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.ov {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
  display: flex;
  flex-direction: column;
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
  border-color: var(--apt-module-accent, var(--apt-color-brand-primary));
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

/* ── Shell body ─────────────────────────────────────────────── */
.ov-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ── Main ───────────────────────────────────────────────────── */
.ov-main {
  flex: 1;
  min-width: 0;
  padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22);
  max-width: 1180px;
}

/* Page head — identity, compact so the instrument hits immediately */
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

/* ── STATE readout: the instrument is calibrated, the record is open ── */
.ov-now {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1px;
  background: var(--apt-border);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  overflow: hidden;
  margin-bottom: var(--apt-spacing-s10);
}

.ov-now-block {
  background: var(--apt-surface-page);
  padding: var(--apt-spacing-s7) var(--apt-spacing-s8);
}

.ov-now-block--model {
  border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary));
}

.ov-now-block--record {
  border-left: 3px dashed var(--apt-border);
}

.ov-now-kicker {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  margin-bottom: var(--apt-spacing-s4);
}

.ov-now-cal {
  display: flex;
  align-items: baseline;
  gap: var(--apt-spacing-s3);
}

.ov-now-num {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-display);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  line-height: 1;
}

.ov-now-num--empty {
  color: var(--apt-text-dim);
}

.ov-now-unit {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-body-sm);
  letter-spacing: 0.04em;
  color: var(--apt-text-muted);
}

.ov-now-sub {
  display: flex;
  gap: var(--apt-spacing-s8);
  margin: var(--apt-spacing-s5) 0 0;
  padding: 0;
}

.ov-now-sub div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ov-now-sub dt {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.ov-now-sub dd {
  margin: 0;
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h2);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-body);
}

.ov-now-note {
  font-size: var(--apt-font-size-body-sm);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: var(--apt-spacing-s5) 0 0;
  max-width: 46ch;
}

/* ── ACTION: the four operational verbs ── */
.ov-moves {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--apt-spacing-s4);
  margin-bottom: var(--apt-spacing-s4);
}

.ov-move {
  display: flex;
  align-items: flex-start;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-spacing-s6);
  background: var(--apt-surface-page);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  text-decoration: none;
  color: var(--apt-text-body);
  transition:
    border-color var(--apt-animation-fast),
    box-shadow var(--apt-animation-fast),
    transform var(--apt-animation-fast);
}

.ov-move:hover {
  border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 40%, var(--apt-border));
  box-shadow: var(--apt-shadow-sh2);
  transform: translateY(-1px);
}

.ov-move:focus-visible {
  outline: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  outline-offset: 2px;
}

.ov-move-icon {
  width: 24px;
  height: 24px;
  flex: none;
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.ov-move-icon svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ov-move-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ov-move-verb {
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
}

.ov-move-consequence {
  font-size: var(--apt-font-size-body-sm);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
}

.ov-move-go {
  margin-left: auto;
  align-self: center;
  flex: none;
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
  font-size: var(--apt-font-size-title-2);
}

.ov-empty {
  font-size: var(--apt-font-size-body-md);
  color: var(--apt-text-muted);
  border: 1px dashed var(--apt-border);
  padding: var(--apt-spacing-s6);
  margin: 0 0 var(--apt-spacing-s8);
}

/* ── SUBSTRATE — demoted reference, recessed below the fold ── */
.ov-substrate {
  margin-top: var(--apt-spacing-s10);
  padding-top: var(--apt-spacing-s8);
  border-top: 1px solid var(--apt-border);
  content-visibility: auto;
  contain-intrinsic-size: auto 640px;
}

.ov-substrate-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--apt-spacing-s8);
  margin-bottom: var(--apt-spacing-s8);
}

.ov-substrate-lead {
  min-width: 0;
}

.ov-substrate-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  margin: 0 0 var(--apt-spacing-s1);
}

.ov-substrate-note {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  max-width: 70ch;
}

.ov-substrate-tools {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--apt-spacing-s4);
  flex: 0 0 auto;
  width: 320px;
}

.ov-substrate-tools .ov-search {
  flex: none;
  width: 100%;
  max-width: none;
}

.ov-substrate-tools .ov-search-input {
  font-size: var(--apt-font-size-body-sm);
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
  font-size: var(--apt-font-size-title-2);
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

/* The relation field is the lead fact, not an object count */
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

/* Quiet link (kept for the substrate Intelligence jump) */
.ov-quiet {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  text-decoration: none;
  border-bottom: 1px solid var(--apt-border);
  padding-bottom: 1px;
}

.ov-quiet:hover {
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
  border-bottom-color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 1000px) {
  .ov-main {
    padding: var(--apt-spacing-s8);
  }

  .ov-distinctions {
    columns: 1;
  }
}

@media (max-width: 760px) {
  .ov-now {
    grid-template-columns: 1fr;
  }

  .ov-moves {
    grid-template-columns: 1fr;
  }

  .ov-cards {
    grid-template-columns: 1fr;
  }

  .ov-card:last-child:nth-child(3n + 1) {
    grid-column: auto;
  }

  .ov-substrate-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .ov-substrate-tools {
    width: 100%;
    align-items: stretch;
  }
}
</style>
