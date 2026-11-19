/**
 * APT-LABS — Workbench pilot page (Vue 3 edition).
 *
 * Placeholder for the individual pilot lane page. Renders pilot context and a
 * link back to the workbench home. Full pilot detail is deferred to a later
 * incremental migration step.
 */

import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import { PILOTS, workItemsForPilotVue, totalCommittedCapitalVue } from '../data-vue';

export default defineComponent({
  name: 'PilotPage',
  setup() {
    const route = useRoute();
    const pilotKey = route.params.pilot as string;

    const pilot = computed(() =>
      PILOTS.find((p) => p.key === pilotKey),
    );

    const items = computed(() => workItemsForPilotVue(pilotKey));
    const totalCap = computed(() => totalCommittedCapitalVue(items.value));

    return { pilot, items, totalCap, pilotKey };
  },
  template: `
    <div class="wb-root">
      <div class="wb-page">
        <div class="wrap">
          <header class="page-head">
          <div class="page-head-eyebrow">APT-LABS / Workbench</div>
          <div class="page-head-title-row">
            <h1 class="page-head-title">{{ pilot.value?.label || 'Pilot' }}</h1>
            <p class="page-head-subtitle">{{ pilot.value?.character || '' }} · {{ pilot.value?.location || '' }}</p>
          </div>
          <router-link to="/workbench" class="page-head-primary-action-link">← Back to workbench</router-link>
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
  `,
});
