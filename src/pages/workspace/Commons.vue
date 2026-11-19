<script setup lang="ts">
import { RouterLink } from 'vue-router';

const signals = [
  { id: 's-01', title: 'Irrigation pump repair needed', institution: 'Thiba cooperative', context: 'Pump failed during dry season', type: 'need', created: '2026-10-15' },
  { id: 's-02', title: 'Excess maize harvest', institution: 'Mwea farmers group', context: '150 bags surplus, seeking buyers', type: 'offer', created: '2026-10-14' },
  { id: 's-03', title: 'Carpentry tools donation', institution: 'Kirinyaga youth centre', context: 'Saw, plane, chisels available', type: 'offer', created: '2026-10-12' },
  { id: 's-04', title: 'Solar lantern maintenance', institution: 'Thiba community', context: '20 lanterns need battery replacement', type: 'need', created: '2026-10-10' },
];
</script>

<template>
  <div class="commons-page" data-module="commons">
    <header class="commons-header">
      <div class="commons-header-copy">
        <h1 class="commons-title">Commons</h1>
        <p class="commons-subtitle">
          Record needs, offers, and opportunities. Stewards review and hand approved items to the Workbench.
        </p>
      </div>
    </header>

    <section class="commons-signals">
      <h2 class="commons-section-title">Field signals</h2>
      <div class="commons-signal-list">
        <article
          v-for="signal in signals"
          :key="signal.id"
          class="commons-signal-card"
          :class="`commons-signal--${signal.type}`"
        >
          <div class="commons-signal-copy">
            <h3 class="commons-signal-title">{{ signal.title }}</h3>
            <p class="commons-signal-context">{{ signal.context }}</p>
            <div class="commons-signal-meta">
              <span class="commons-signal-institution">{{ signal.institution }}</span>
              <span class="commons-signal-date">{{ signal.created }}</span>
              <span class="commons-signal-type">{{ signal.type }}</span>
            </div>
          </div>
          <RouterLink :to="`/workspace/workbench`" class="commons-signal-action">
            Route to Workbench
          </RouterLink>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.commons-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100vh;
  padding: var(--apt-spacing-s13);
}

.commons-header {
  margin-bottom: var(--apt-spacing-s13);
}

.commons-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.commons-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.commons-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-body);
}

.commons-signal-list {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.commons-signal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.commons-signal--need {
  border-left: 4px solid var(--apt-color-brand-geist-alert);
}

.commons-signal--offer {
  border-left: 4px solid var(--apt-pillar-stewardship);
}

.commons-signal-copy {
  flex: 1;
  min-width: 0;
}

.commons-signal-title {
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s2) 0;
  color: var(--apt-text-body);
}

.commons-signal-context {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s3) 0;
  line-height: var(--apt-line-height-relaxed);
}

.commons-signal-meta {
  display: flex;
  gap: var(--apt-spacing-s4);
  flex-wrap: wrap;
}

.commons-signal-institution {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-pillar-stewardship);
}

.commons-signal-date {
  font-size: var(--apt-font-size-micro);
  color: var(--apt-text-dim);
}

.commons-signal-type {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: var(--apt-spacing-s1) var(--apt-spacing-s4);
  border-radius: var(--apt-radius-r9);
  background: var(--apt-color-ramp-exchange-50);
  color: var(--apt-color-brand-exchange);
}

.commons-signal--need .commons-signal-type {
  background: var(--apt-color-ramp-geist-alert-50);
  color: var(--apt-color-brand-geist-alert);
}

.commons-signal--offer .commons-signal-type {
  background: var(--apt-color-ramp-stewardship-50);
  color: var(--apt-pillar-stewardship);
}

.commons-signal-action {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-pillar-stewardship);
  text-decoration: none;
  white-space: nowrap;
  transition: text-decoration-color var(--apt-animation-fast);
}

.commons-signal-action:hover {
  text-decoration: underline;
}
</style>

