<script setup lang="ts">
import {
  buildRecommendations,
  detectPatterns,
  forecastPilot,
  generateLearningOutputs,
  matchParticipants,
} from '../lib/intelligence';
import { workItemsForPilot, PILOTS } from '@/modules/workbench/data';
import { ref, onMounted } from 'vue';
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
          v-for="pilot in PILOTS"
          :key="pilot.key"
          class="intelligence-forecast-card"
        >
          <h3 class="intelligence-forecast-title">{{ pilot.label }}</h3>
          <div class="intelligence-forecast-metrics">
            <div class="intelligence-forecast-metric">
              <span class="intelligence-forecast-value">—</span>
              <span class="intelligence-forecast-label">Open</span>
            </div>
            <div class="intelligence-forecast-metric">
              <span class="intelligence-forecast-value">—</span>
              <span class="intelligence-forecast-label">Accepted</span>
            </div>
            <div class="intelligence-forecast-metric">
              <span class="intelligence-forecast-value">Not priced</span>
              <span class="intelligence-forecast-label">Capital</span>
            </div>
          </div>
          <p class="intelligence-forecast-note">
            Forecast computed from workbench data.
          </p>
        </article>
      </div>
    </section>

    <section class="intelligence-panels">
      <article class="intelligence-panel">
        <header class="intelligence-card-head">
          <span class="intelligence-card-index">01</span>
          <h2 class="intelligence-card-title">Matching</h2>
        </header>
        <p class="intelligence-card-body">
          Matches productive participants to undertakings based on bounded claims,
          scoped credentials, and demonstrated capability. A match is a suggestion,
          not an assignment.
        </p>
        <p class="intelligence-empty">No open undertakings awaiting crew at this time.</p>
      </article>

      <article class="intelligence-panel">
        <header class="intelligence-card-head">
          <span class="intelligence-card-index">02</span>
          <h2 class="intelligence-card-title">Patterns</h2>
        </header>
        <p class="intelligence-card-body">
          Evidence-backed observations from recorded outcomes.
        </p>
        <p class="intelligence-empty">No significant patterns detected yet.</p>
      </article>

      <article class="intelligence-panel">
        <header class="intelligence-card-head">
          <span class="intelligence-card-index">03</span>
          <h2 class="intelligence-card-title">Learning</h2>
        </header>
        <p class="intelligence-card-body">
          Accepted outcomes converted into reusable knowledge.
        </p>
        <p class="intelligence-empty">No learning captured yet.</p>
      </article>
    </section>

    <section class="intelligence-recommendations">
      <h2 class="intelligence-section-title">Decision support</h2>
      <p class="intelligence-empty">No active recommendations at this time.</p>
    </section>

    <section class="intelligence-boundaries">
      <header class="intelligence-card-head">
        <span class="intelligence-card-index">04</span>
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

.intelligence-card-index {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-body-md);
  color: var(--apt-text-dim);
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
  flex: 1;
}

.intelligence-empty {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-dim);
  margin: 0;
  font-style: italic;
}

.intelligence-recommendations {
  margin-bottom: var(--apt-spacing-s13);
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

