<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { PILOTS, homeMetricsVue, workItemsForPilotVue, totalCommittedCapitalVue } from '../data-vue';
import { RouterLink } from 'vue-router';

const route = useRoute();
const m = homeMetricsVue();

const lanes = computed(() =>
  PILOTS.map((pilot) => {
    const items = workItemsForPilotVue(pilot.key as never);
    const open = items.filter((w) => w.gate !== 'accepted');
    const totalCap = totalCommittedCapitalVue(open);
    const hasOpen = open.length > 0;
    const isIllustrative = pilot.status === 'illustrative';

    return {
      pilot,
      open,
      totalCap,
      hasOpen,
      isIllustrative,
    };
  }),
);
</script>

<template>
  <div class="wb-root" data-module="workbench">
    <div class="wb-page">
      <div class="wrap">
        <header class="page-head">
          <div class="page-head-eyebrow">APT-LABS / Workbench</div>
          <div class="page-head-title-row">
            <h1 class="page-head-title">Workbench</h1>
            <p class="page-head-subtitle">
              Demo lanes with example rates, stewards, and work. The bench coordinates — never extracts.
            </p>
          </div>
          <div class="page-head-metrics">
            <div class="page-head-metric" data-state="canon">
              <span class="page-head-metric-value">{{ m.publishedLanes }}</span>
              <span class="page-head-metric-label">Illustrative metrics</span>
            </div>
            <div class="page-head-metric page-head-metric--hero" data-state="proposed">
              <span class="page-head-metric-value">KES {{ m.totalCapital.toLocaleString('en-KE') }}</span>
              <span class="page-head-metric-label">Illustrative capital</span>
            </div>
            <div class="page-head-metric" data-state="caution">
              <span class="page-head-metric-value">{{ m.activeCount }}</span>
              <span class="page-head-metric-label">Example undertakings</span>
            </div>
          </div>
        </header>

        <section>
          <h2 class="wb-section-title">Lanes</h2>
          <div class="wb-paths">
            <RouterLink
              v-for="lane in lanes"
              :key="lane.pilot.key"
              :to="lane.pilot.href"
              class="wb-path-row"
              :class="{ 'wb-path-row--open': lane.isIllustrative }"
              :aria-label="lane.pilot.label"
            >
              <div class="wb-path-main">
                <h3 class="wb-path-label">{{ lane.pilot.label }}</h3>
                <p class="wb-path-character">
                  {{ lane.pilot.character }} · {{ lane.pilot.location }}
                  <span v-if="lane.hasOpen" class="wb-path-live">
                    · {{ lane.open.length }} open
                    <span v-if="lane.totalCap > 0"> · KES {{ lane.totalCap.toLocaleString('en-KE') }}</span>
                  </span>
                </p>
              </div>
              <span
                class="wb-path-status"
                :class="{ 'wb-path-status--illustrative': lane.isIllustrative, 'wb-path-status--published': !lane.isIllustrative }"
              >
                {{ lane.isIllustrative ? 'Illustrative example' : 'Published-state example' }}
              </span>
              <span class="wb-path-action">
                {{ lane.isIllustrative ? 'View example →' : 'Enter example →' }}
              </span>
            </RouterLink>
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

.page-head-metrics {
  display: flex;
  gap: var(--apt-spacing-s8);
  margin-top: var(--apt-spacing-s8);
  flex-wrap: wrap;
}

.page-head-metric {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s1);
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
  border: 1px solid var(--apt-border);
  min-width: 160px;
  transition: border-color var(--apt-animation-fast), background-color var(--apt-animation-fast);
}

.page-head-metric--hero {
  border-color: var(--apt-module-accent, var(--apt-pillar-production));
  background: var(--apt-color-ramp-production-50);
}

.page-head-metric-value {
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-body);
}

.page-head-metric--hero .page-head-metric-value {
  color: var(--apt-module-accent, var(--apt-pillar-production));
}

.page-head-metric-label {
  font-size: var(--apt-font-size-micro);
  color: var(--apt-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  text-decoration: none;
  transition: border-color var(--apt-animation-fast), background-color var(--apt-animation-fast), transform var(--apt-animation-fast);
}

.wb-path-row:hover {
  border-color: var(--apt-module-accent, var(--apt-pillar-production));
  transform: translateY(-2px);
}

.wb-path-row--open {
  border-color: var(--apt-color-brand-secondary);
}

.wb-path-row--open:hover {
  border-color: var(--apt-color-brand-secondary);
  background: var(--apt-color-ramp-exchange-50);
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

.wb-path-live {
  color: var(--apt-pillar-stewardship);
  font-weight: var(--apt-font-weight-semibold);
}

.wb-path-status {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.wb-path-status--illustrative {
  color: var(--apt-color-brand-secondary);
}

.wb-path-status--published {
  color: var(--apt-pillar-stewardship);
}

.wb-path-action {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-pillar-stewardship);
  white-space: nowrap;
}

.wb-terms-line {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
  margin-top: var(--apt-spacing-s13);
  line-height: var(--apt-line-height-relaxed);
}
</style>

