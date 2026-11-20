<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PILOTS, workItemsForPilot, GATE_LABELS, type Pilot, type PilotKey } from '@/modules/workbench/data';
import {
  detectPatterns,
  forecastPilot,
  generateLearningOutputs,
  buildRecommendations,
  type Forecast,
  type Pattern,
  type LearningOutput,
  type Recommendation,
} from '../lib/intelligence';

interface LaneForecast {
  pilot: Pilot;
  forecast: Forecast;
}

const lanes = ref<LaneForecast[]>([]);
const patterns = ref<Pattern[]>([]);
const learning = ref<LearningOutput[]>([]);
const recommendations = ref<Recommendation[]>([]);
const openItems = ref<{ title: string; gate: string; lane: string }[]>([]);
const loaded = ref(false);

onMounted(async () => {
  const forecasts = await Promise.all(
    PILOTS.map(async (p) => ({ pilot: p, forecast: await forecastPilot(p.key) })),
  );
  lanes.value = forecasts;
  patterns.value = await detectPatterns();
  learning.value = await generateLearningOutputs();
  recommendations.value = await buildRecommendations();
  openItems.value = PILOTS.flatMap((p) =>
    workItemsForPilot(p.key)
      .filter((i) => i.gate !== 'accepted')
      .map((i) => ({ title: i.title, gate: GATE_LABELS[i.gate], lane: p.label })),
  ).slice(0, 5);
  loaded.value = true;
});

function capitalLabel(f: Forecast): string {
  return f.totalCapital === null
    ? 'Not priced'
    : `${f.totalCapital.toLocaleString('en-KE')} KES`;
}

function laneIsLive(key: PilotKey): boolean {
  const p = PILOTS.find((x) => x.key === key);
  return p?.status === 'published';
}
</script>

<template>
  <div class="intelligence-page" data-module="intelligence">
    <header class="intelligence-header">
      <h1 class="intelligence-title">Intelligence</h1>
      <p class="intelligence-subtitle">
        Agents, matching, forecasting, analytics. The engine assesses and recommends;
        the authorized party decides. No universal reputation score.
      </p>
    </header>

    <section class="intelligence-forecast">
      <h2 class="intelligence-section-title">Capacity by pilot lane</h2>
      <div class="intelligence-forecast-grid">
        <article
          v-for="lane in lanes"
          :key="lane.pilot.key"
          class="intelligence-forecast-card"
        >
          <h3 class="intelligence-forecast-title">{{ lane.pilot.label }}</h3>
          <template v-if="laneIsLive(lane.pilot.key)">
            <div class="intelligence-forecast-metrics">
              <div class="intelligence-forecast-metric">
                <span class="intelligence-forecast-value">{{ lane.forecast.openCount }}</span>
                <span class="intelligence-forecast-label">Open</span>
              </div>
              <div class="intelligence-forecast-metric">
                <span class="intelligence-forecast-value">{{ lane.forecast.acceptedCount }}</span>
                <span class="intelligence-forecast-label">Accepted</span>
              </div>
              <div class="intelligence-forecast-metric">
                <span class="intelligence-forecast-value">{{ capitalLabel(lane.forecast) }}</span>
                <span class="intelligence-forecast-label">Capital</span>
              </div>
            </div>
            <p class="intelligence-forecast-note">
              Uncertainty: {{ lane.forecast.uncertainty }}. {{ lane.forecast.assumption }}
            </p>
          </template>
          <template v-else>
            <p class="intelligence-forecast-note">
              Illustrative lane — a browser-local demo example, not live work. No numbers are
              shown as if they were real.
            </p>
          </template>
        </article>
      </div>
    </section>

    <section class="intelligence-panels">
      <article class="intelligence-panel">
        <header class="intelligence-card-head">
          <h2 class="intelligence-card-title">Matching</h2>
        </header>
        <p class="intelligence-card-body">
          Matches productive participants to undertakings based on bounded claims,
          scoped credentials, and demonstrated capability. A match is a suggestion,
          not an assignment.
        </p>
        <template v-if="loaded">
          <ul v-if="openItems.length" class="intelligence-open-list">
            <li v-for="item in openItems" :key="`${item.lane}-${item.title}`" class="intelligence-open-item">
              <span class="intelligence-open-title">{{ item.title }}</span>
              <span class="intelligence-open-meta">{{ item.lane }}, {{ item.gate }}</span>
            </li>
          </ul>
          <p v-else class="intelligence-empty">
            No open undertakings awaiting crew at this time.
          </p>
        </template>
      </article>

      <article class="intelligence-panel">
        <header class="intelligence-card-head">
          <h2 class="intelligence-card-title">Patterns</h2>
        </header>
        <p class="intelligence-card-body">
          Evidence-backed observations from recorded outcomes.
        </p>
        <template v-if="loaded">
          <ul v-if="patterns.length" class="intelligence-open-list">
            <li v-for="pattern in patterns" :key="pattern.id" class="intelligence-open-item">
              <span class="intelligence-open-title">
                {{ pattern.title }}
                <span class="intelligence-open-meta">severity: {{ pattern.severity }}</span>
              </span>
              <span class="intelligence-open-meta">{{ pattern.description }}</span>
            </li>
          </ul>
          <p v-else class="intelligence-empty">No significant patterns detected yet.</p>
        </template>
      </article>

      <article class="intelligence-panel">
        <header class="intelligence-card-head">
          <h2 class="intelligence-card-title">Learning</h2>
        </header>
        <p class="intelligence-card-body">
          Accepted outcomes converted into reusable knowledge.
        </p>
        <template v-if="loaded">
          <ul v-if="learning.length" class="intelligence-open-list">
            <li v-for="item in learning" :key="item.id" class="intelligence-open-item">
              <span class="intelligence-open-title">{{ item.title }}</span>
              <span class="intelligence-open-meta">{{ item.lesson }}</span>
            </li>
          </ul>
          <p v-else class="intelligence-empty">No learning captured yet.</p>
        </template>
      </article>
    </section>

    <section class="intelligence-recommendations">
      <h2 class="intelligence-section-title">Decision support</h2>
      <template v-if="loaded">
        <ul v-if="recommendations.length" class="intelligence-rec-list">
          <li v-for="rec in recommendations" :key="rec.id" class="intelligence-rec-item">
            <div class="intelligence-rec-head">
              <span class="intelligence-open-title">{{ rec.title }}</span>
              <span class="intelligence-open-meta">
                certainty: {{ rec.certainty }}, decided by {{ rec.whoDecides }}
              </span>
            </div>
            <p class="intelligence-rec-what">{{ rec.what }}</p>
            <p class="intelligence-rec-why">{{ rec.why }}</p>
          </li>
        </ul>
        <p v-else class="intelligence-empty">No active recommendations at this time.</p>
      </template>
    </section>

    <section class="intelligence-boundaries">
      <header class="intelligence-card-head">
        <h2 class="intelligence-card-title">Boundaries</h2>
      </header>
      <ul class="intelligence-boundary-list">
        <li class="intelligence-boundary-item">
          <span class="intelligence-boundary-term">No universal score</span>
          <span class="intelligence-boundary-desc">A credential is not authority, credit, or ownership.</span>
        </li>
        <li class="intelligence-boundary-item">
          <span class="intelligence-boundary-term">No coin behavior</span>
          <span class="intelligence-boundary-desc">No balances, transfers, rewards, wages, or coin-gated access.</span>
        </li>
        <li class="intelligence-boundary-item">
          <span class="intelligence-boundary-term">No custody</span>
          <span class="intelligence-boundary-desc">Participants retain and present their credentials.</span>
        </li>
        <li class="intelligence-boundary-item">
          <span class="intelligence-boundary-term">No unilateral decision</span>
          <span class="intelligence-boundary-desc">The engine recommends; the authorized financing party decides.</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.intelligence-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100vh;
  padding: var(--apt-spacing-s13);
}

.intelligence-header {
  margin-bottom: var(--apt-spacing-s13);
}

.intelligence-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.intelligence-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.intelligence-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-body);
}

.intelligence-forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s13);
}

.intelligence-forecast-card {
  padding: var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.intelligence-forecast-title {
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s4) 0;
  color: var(--apt-text-body);
}

.intelligence-forecast-metrics {
  display: flex;
  gap: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s4);
  flex-wrap: wrap;
}

.intelligence-forecast-metric {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s1);
}

.intelligence-forecast-value {
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-pillar-stewardship);
  font-variant-numeric: tabular-nums;
}

.intelligence-forecast-label {
  font-size: var(--apt-font-size-micro);
  color: var(--apt-text-dim);
}

.intelligence-forecast-note {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.intelligence-panels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--apt-spacing-s8);
  margin-bottom: var(--apt-spacing-s13);
}

.intelligence-panel {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.intelligence-card-head {
  display: flex;
  align-items: baseline;
  gap: var(--apt-spacing-s2);
}

.intelligence-card-title {
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
}

.intelligence-card-body {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-relaxed);
  margin: 0;
  /* Uniform floor at the tallest intro (4 lines at desktop widths) so all
     three panel intros end on the same row line. */
  min-height: 72px;
}

/* Keep all three panel lists starting on the same row line. Height
   differences between cards are absorbed by the grid row stretch below
   each card's last child, so sibling gaps stay a uniform 8px. */

.intelligence-empty {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-dim);
  margin: 0;
}

.intelligence-open-list,
.intelligence-rec-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.intelligence-open-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.intelligence-open-title {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-body);
}

.intelligence-open-meta {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
}

.intelligence-recommendations {
  margin-bottom: var(--apt-spacing-s13);
}

.intelligence-rec-item {
  padding: var(--apt-spacing-s6);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-color-neutral-n0);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
}

.intelligence-rec-head {
  display: flex;
  justify-content: space-between;
  gap: var(--apt-spacing-s4);
  flex-wrap: wrap;
}

.intelligence-rec-what,
.intelligence-rec-why {
  margin: 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-relaxed);
}

.intelligence-boundary-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.intelligence-boundary-item {
  display: flex;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
  border-radius: var(--apt-radius-r2);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.intelligence-boundary-term {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-pillar-stewardship);
  min-width: 120px;
}

.intelligence-boundary-desc {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-relaxed);
}
</style>
