<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useNetworkStore, GROUP_LABELS, type NetworkGroup } from '@/stores/network';

const network = useNetworkStore();

// Re-read on entry so the directory reflects what the Workbench has done.
onMounted(() => network.load());

const groups = computed(() =>
  (Object.keys(GROUP_LABELS) as NetworkGroup[]).map((id) => ({ id, label: GROUP_LABELS[id] })),
);

const activeGroupLabel = computed(() => GROUP_LABELS[network.filter]);
</script>

<template>
  <div class="network-page" data-module="network">
    <header class="network-header">
      <h1 class="network-title">Network</h1>
      <p class="network-subtitle">
        The directory of registered actors — who they are, what they have, and what they can do.
      </p>
    </header>

    <!-- First-use: no actors yet — hide the filter chrome, name the next step. -->
    <section v-if="!network.rows.length" class="network-empty">
      <h2 class="network-empty-title">No actors in the directory yet</h2>
      <p class="network-empty-body">
        Register an actor with its assets and capabilities in the Coordination Workbench,
        and it will appear here as a discoverable profile.
      </p>
      <RouterLink to="/workspace/coordination" class="network-empty-cta">
        Open the Coordination Workbench
      </RouterLink>
    </section>

    <template v-else>
      <section class="network-filters">
        <div class="network-filter-group">
          <span class="network-filter-label">Group</span>
          <div class="network-filter-pills">
            <button
              v-for="group in groups"
              :key="group.id"
              class="network-filter-pill"
              :class="{ 'network-filter-pill--active': network.filter === group.id }"
              :aria-pressed="network.filter === group.id"
              @click="network.filter = group.id"
            >
              {{ group.label }}
              <span class="network-filter-count">{{ network.counts[group.id] }}</span>
            </button>
          </div>
        </div>
      </section>

      <section class="network-entities">
        <!-- Filtered-out: data exists, the active group emptied the view. -->
        <div v-if="!network.visible.length" class="network-empty network-empty--filtered">
          <h2 class="network-empty-title">No {{ activeGroupLabel.toLowerCase() }} registered</h2>
          <p class="network-empty-body">
            {{ network.rows.length }} actor{{ network.rows.length === 1 ? '' : 's' }} are in the
            directory, none in this group.
          </p>
          <button class="network-empty-cta network-empty-cta--button" @click="network.filter = 'all'">
            Show all groups
          </button>
        </div>

        <template v-else>
          <h2 class="network-section-title">Directory</h2>
          <div class="network-entity-grid">
            <article
              v-for="row in network.visible"
              :key="row.actor.id"
              class="network-entity-card"
            >
              <div class="network-entity-copy">
                <h3 class="network-entity-name">{{ row.actor.name }}</h3>
                <p class="network-entity-type">{{ row.typeLabel }}</p>
                <p v-if="row.actor.description" class="network-entity-role">
                  {{ row.actor.description }}
                </p>
              </div>
              <div v-if="row.capabilities.length" class="network-cap-row">
                <span class="network-cap-label">Can do</span>
                <span v-for="cap in row.capabilities" :key="`c-${cap}`" class="network-entity-cap">
                  {{ cap }}
                </span>
              </div>
              <div v-if="row.assets.length" class="network-cap-row">
                <span class="network-cap-label">Has</span>
                <span
                  v-for="asset in row.assets"
                  :key="`a-${asset}`"
                  class="network-entity-cap network-entity-cap--asset"
                >
                  {{ asset }}
                </span>
              </div>
            </article>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.network-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100vh;
  padding: var(--apt-spacing-s13);
}

.network-header {
  margin-bottom: var(--apt-spacing-s13);
}

.network-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.network-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.network-filters {
  margin-bottom: var(--apt-spacing-s13);
}

.network-filter-group {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s4);
  flex-wrap: wrap;
}

.network-filter-label {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.network-filter-pills {
  display: flex;
  gap: var(--apt-spacing-s3);
  flex-wrap: wrap;
}

.network-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  min-height: 44px;
  padding: var(--apt-spacing-s2) var(--apt-spacing-s6);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r9);
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-body);
  font-family: inherit;
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-medium);
  cursor: pointer;
  transition: all var(--apt-animation-fast);
}

.network-filter-pill--active {
  border-color: var(--apt-module-accent, var(--apt-color-brand-primary));
  background: var(--apt-color-ramp-production-50);
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.network-filter-count {
  font-size: var(--apt-font-size-micro);
  color: var(--apt-text-dim);
  font-variant-numeric: tabular-nums;
}

.network-filter-pill--active .network-filter-count {
  color: inherit;
  opacity: 0.8;
}

.network-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-body);
}

.network-entity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--apt-spacing-s6);
}

.network-entity-card {
  padding: var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.network-entity-copy {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s1);
}

.network-entity-name {
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
}

.network-entity-type {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-pillar-stewardship);
  margin: 0;
}

.network-entity-role {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.network-cap-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--apt-spacing-s2);
}

.network-cap-label {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
}

.network-entity-cap {
  font-size: var(--apt-font-size-micro);
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-default);
  color: var(--apt-text-body);
}

.network-entity-cap--asset {
  background: var(--apt-color-ramp-stewardship-50);
  color: var(--apt-pillar-stewardship);
}

/* Empty states (first-use and filtered-out) */

.network-empty {
  padding: var(--apt-spacing-s13);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
  text-align: center;
}

.network-empty-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.network-empty-body {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 auto;
  max-width: 44ch;
  line-height: var(--apt-line-height-relaxed);
}

.network-empty-cta {
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
  border: none;
  font-family: inherit;
  cursor: pointer;
}

.network-empty-cta--button {
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-body);
  border: 1px solid var(--apt-border);
}

@media (max-width: 640px) {
  .network-filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
