<script setup lang="ts">
import { RouterLink } from 'vue-router';

const entityTypes = [
  { id: 'person', label: 'People' },
  { id: 'crew', label: 'Crews' },
  { id: 'asset', label: 'Assets' },
  { id: 'institution', label: 'Institutions' },
];

const entities = [
  { id: 'e-01', name: 'Wanjiku Muthoni', type: 'person', role: 'Mason', location: 'Thiba', capabilities: ['Masonry', 'Canal lining'] },
  { id: 'e-02', name: 'Kimetu Crew', type: 'crew', role: 'Construction crew', location: 'Mwea', capabilities: ['Solar installation', 'Electrical'] },
  { id: 'e-03', name: 'Thiba Pump House', type: 'asset', role: 'Irrigation infrastructure', location: 'Thiba', capabilities: ['Water pumping'] },
  { id: 'e-04', name: 'Kirinyaga Youth Centre', type: 'institution', role: 'Community centre', location: 'Kirinyaga', capabilities: ['Training', 'Events'] },
];
</script>

<template>
  <div class="network-page" data-module="network">
    <header class="network-header">
      <h1 class="network-title">Network</h1>
      <p class="network-subtitle">
        Connect people, crews, institutions, assets, and capabilities across the APT-LABS network.
      </p>
    </header>

    <section class="network-filters">
      <div class="network-filter-group">
        <span class="network-filter-label">Entity type</span>
        <div class="network-filter-pills">
          <button
            v-for="type in entityTypes"
            :key="type.id"
            class="network-filter-pill"
            :class="{ 'network-filter-pill--active': true }"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="network-entities">
      <h2 class="network-section-title">Directory</h2>
      <div class="network-entity-grid">
        <article
          v-for="entity in entities"
          :key="entity.id"
          class="network-entity-card"
        >
          <div class="network-entity-copy">
            <h3 class="network-entity-name">{{ entity.name }}</h3>
            <p class="network-entity-type">{{ entity.type }}</p>
            <p class="network-entity-role">{{ entity.role }}</p>
            <p class="network-entity-location">{{ entity.location }}</p>
          </div>
          <div class="network-entity-caps">
            <span
              v-for="cap in entity.capabilities"
              :key="cap"
              class="network-entity-cap"
            >
              {{ cap }}
            </span>
          </div>
        </article>
      </div>
    </section>
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
}

.network-filter-pill {
  padding: var(--apt-spacing-s2) var(--apt-spacing-s6);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r9);
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-body);
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
}

.network-entity-location {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
  margin: 0;
}

.network-entity-caps {
  display: flex;
  flex-wrap: wrap;
  gap: var(--apt-spacing-s2);
  margin-top: var(--apt-spacing-s4);
}

.network-entity-cap {
  font-size: var(--apt-font-size-micro);
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-default);
  color: var(--apt-text-body);
}
</style>

