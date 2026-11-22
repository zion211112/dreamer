<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { RouterLink } from 'vue-router';
import { PILOTS, workItemsForPilotVue, totalCommittedCapitalVue } from '../data-vue';

const route = useRoute();
const pilotKey = route.params.pilot as string;

const pilot = computed(() => PILOTS.find((p) => p.key === pilotKey));

const items = computed(() => workItemsForPilotVue(pilotKey));
const totalCap = computed(() => totalCommittedCapitalVue(items.value));
</script>

<template>
  <div class="wb-root" data-module="workbench">
    <div class="wb-page">
      <div class="wrap">
        <header class="page-head">
          <div class="page-head-eyebrow">APT-LABS / Workbench</div>
          <div class="page-head-title-row">
            <h1 class="page-head-title">{{ pilot.value?.label || 'Pilot' }}</h1>
            <p class="page-head-subtitle">
              {{ pilot.value?.character || '' }} · {{ pilot.value?.location || '' }}
            </p>
          </div>
          <RouterLink to="/workspace/workbench" class="page-head-back-link">← Back to workbench</RouterLink>
        </header>

        <section v-if="pilot.value">
          <h2 class="wb-section-title">Undertakings</h2>
          <div class="wb-paths">
            <div v-for="item in items" :key="item.id" class="wb-path-row">
              <div class="wb-path-main">
                <h3 class="wb-path-label">{{ item.title }}</h3>
                <p class="wb-path-character">
                  {{ item.discipline }} · {{ item.location }}
                </p>
              </div>
              <span class="wb-path-status">{{ item.gate }}</span>
              <span class="wb-path-action">
                KES {{ item.capital.financial?.toLocaleString('en-KE') ?? '—' }}
              </span>
            </div>
            <div v-if="items.length === 0" class="wb-empty">
              No undertakings recorded for this pilot yet.
            </div>
          </div>
        </section>

        <p class="wb-terms-line">
          Illustrative terms and rates need steward confirmation before work is claimed. The bench keeps the record, never the surplus.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.wb-root {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
}

.wb-page {
  padding: var(--apt-spacing-s13);
  max-width: 100vw;
  box-sizing: border-box;
}

.wrap {
  max-width: var(--apt-block-landing-max-width);
  margin: 0 auto;
}

.page-head {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s3);
  margin-bottom: var(--apt-spacing-s13);
}

.page-head-eyebrow {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--apt-module-accent, var(--apt-pillar-production));
}

.page-head-title-row {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
  flex-wrap: wrap;
}

.page-head-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
}

.page-head-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.page-head-back-link {
  margin-top: var(--apt-spacing-s6);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-pillar-stewardship);
  text-decoration: none;
  transition: text-decoration-color var(--apt-animation-fast);
}

.page-head-back-link:hover {
  text-decoration: underline;
}

.wb-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-body);
}

.wb-paths {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.wb-path-row {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.wb-path-main {
  flex: 1;
  min-width: 0;
}

.wb-path-label {
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s1) 0;
  color: var(--apt-text-body);
}

.wb-path-character {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.wb-path-status {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  color: var(--apt-text-dim);
}

.wb-path-action {
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-pillar-stewardship);
  white-space: nowrap;
}

.wb-empty {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  padding: var(--apt-spacing-s8);
  text-align: center;
}

.wb-terms-line {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
  margin-top: var(--apt-spacing-s13);
  line-height: var(--apt-line-height-relaxed);
}
</style>

