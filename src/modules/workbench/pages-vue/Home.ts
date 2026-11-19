/**
 * APT-LABS — Workbench home page (Vue 3 edition).
 *
 * Vue port of the Preact `Workbench` page (`src/modules/workbench/pages/Home.tsx`).
 * Renders the pilot lanes, metrics, and illustrative terms. Uses Vue Router links
 * instead of wouter links. Mounted at /workbench in the isolated Vue runtime.
 */

import { defineComponent, computed } from 'vue';
import { PILOTS, homeMetricsVue, workItemsForPilotVue, totalCommittedCapitalVue } from '../data-vue';

export default defineComponent({
  name: 'WorkbenchHome',
  setup() {
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

    return { m, lanes };
  },
  template: `
    <div class="wb-root">
      <div class="wb-page">
        <div class="wrap">
          <header class="page-head">
          <div class="page-head-eyebrow">APT-LABS / Workbench</div>
          <div class="page-head-title-row">
            <h1 class="page-head-title">Workbench</h1>
            <p class="page-head-subtitle">Demo lanes with example rates, stewards, and work. The bench coordinates — never extracts.</p>
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
            <router-link
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
            </router-link>
          </div>
        </section>

        <p class="wb-terms-line">
          Illustrative terms and rates need steward confirmation before work is claimed. The bench keeps the record, never the surplus.
        </p>
        </div>
      </div>
    </div>
  `,
});
