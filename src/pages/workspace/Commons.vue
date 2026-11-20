<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useCoordinationStore } from '@/stores/coordination';

const store = useCoordinationStore();

// Re-read the system of record on entry, so the signals reflect what the
// Workbench has posted, committed, or delivered since this store was created.
onMounted(() => store.refresh());

const openNeeds = computed(() => store.openNeeds);
const inFlight = computed(() => store.inFlight);
const nothing = computed(() => !openNeeds.value.length && !inFlight.value.length);

function matchLine(need: (typeof openNeeds.value)[number]): string {
  if (need.isMissing) return 'No registered provider matches this need yet.';
  const names = need.matches
    .slice(0, 2)
    .map((m) => m.providerName)
    .join(', ');
  const extra = need.matches.length > 2 ? ` +${need.matches.length - 2} more` : '';
  return `${need.matches.length} provider${need.matches.length === 1 ? '' : 's'} can answer: ${names}${extra}.`;
}

function requiresLine(need: (typeof openNeeds.value)[number]): string {
  return need.requires.length
    ? `Asks for: ${need.requires.join(', ')}.`
    : 'No capability category declared, so providers cannot match it yet.';
}
</script>

<template>
  <div class="commons-page" data-module="commons">
    <header class="commons-header">
      <div class="commons-header-copy">
        <h1 class="commons-title">Commons</h1>
        <p class="commons-subtitle">
          Open needs matched against registered providers, and the commitments in flight.
          Everything here is a live record from the coordination loop.
        </p>
      </div>
    </header>

    <!-- First-use: the loop has not produced anything yet. -->
    <section v-if="nothing" class="commons-empty">
      <h2 class="commons-empty-title">No open needs yet</h2>
      <p class="commons-empty-body">
        Post a need, or onboard a provider with its capability, in the Coordination Workbench.
        What you record there appears here as a live signal.
      </p>
      <RouterLink to="/workspace/coordination" class="commons-empty-cta">
        Open the Coordination Workbench
      </RouterLink>
    </section>

    <template v-else>
      <section v-if="openNeeds.length" class="commons-signals">
        <h2 class="commons-section-title">Open needs</h2>
        <div class="commons-signal-list">
          <article
            v-for="need in openNeeds"
            :key="need.needId"
            class="commons-signal-card"
            :class="need.isMissing ? 'commons-signal--need' : 'commons-signal--offer'"
          >
            <div class="commons-signal-copy">
              <h3 class="commons-signal-title">{{ need.need }}</h3>
              <p class="commons-signal-context">{{ requiresLine(need) }}</p>
              <p class="commons-signal-context">{{ matchLine(need) }}</p>
              <div class="commons-signal-meta">
                <span class="commons-signal-type">
                  {{ need.isMissing ? 'Missing' : 'Matched' }}
                </span>
              </div>
            </div>
            <RouterLink :to="`/workspace/coordination`" class="commons-signal-action">
              Manage in Workbench
            </RouterLink>
          </article>
        </div>
      </section>

      <section v-if="inFlight.length" class="commons-signals">
        <h2 class="commons-section-title">In flight</h2>
        <div class="commons-signal-list">
          <article
            v-for="row in inFlight"
            :key="row.id"
            class="commons-signal-card commons-signal--offer"
          >
            <div class="commons-signal-copy">
              <h3 class="commons-signal-title">{{ row.need }}</h3>
              <p class="commons-signal-context">
                {{ row.providerName }} accepted this commitment and is delivering.
              </p>
              <div class="commons-signal-meta">
                <span class="commons-signal-institution">{{ row.providerName }}</span>
                <span class="commons-signal-type">In flight</span>
              </div>
            </div>
            <RouterLink :to="`/workspace/coordination`" class="commons-signal-action">
              Manage in Workbench
            </RouterLink>
          </article>
        </div>
      </section>
    </template>
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

.commons-signals + .commons-signals {
  margin-top: var(--apt-spacing-s13);
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
  gap: var(--apt-spacing-s6);
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

.commons-signal-context:last-of-type {
  margin-bottom: 0;
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
  display: inline-flex;
  align-items: center;
  min-height: 44px;
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

/* First-use empty state */

.commons-empty {
  padding: var(--apt-spacing-s13);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
  text-align: center;
}

.commons-empty-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.commons-empty-body {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 auto;
  max-width: 44ch;
  line-height: var(--apt-line-height-relaxed);
}

.commons-empty-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin-top: var(--apt-spacing-s6);
  padding: 0 var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
  color: var(--apt-color-neutral-n0);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  text-decoration: none;
}

@media (max-width: 640px) {
  .commons-signal-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .commons-signal-action {
    margin-top: var(--apt-spacing-s4);
  }
}
</style>
