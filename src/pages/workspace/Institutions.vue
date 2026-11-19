<script setup lang="ts">
import { RouterLink } from 'vue-router';

const institutions = [
  { id: 'i-01', name: 'Thiba Community Cooperative', type: 'Cooperative', location: 'Thiba', members: 42, focus: 'Irrigation & hydro' },
  { id: 'i-02', name: 'Mwea Farmers Group', type: 'Farmers group', location: 'Mwea', members: 38, focus: 'Maize & animation' },
  { id: 'i-03', name: 'Kirinyaga Youth Centre', type: 'Community centre', location: 'Kirinyaga', members: 24, focus: 'Training & carpentry' },
  { id: 'i-04', name: 'Benben-OS School', type: 'School', location: 'Nairobi', members: 120, focus: 'Learning operations' },
  { id: 'i-05', name: 'Kemetos Collective', type: 'Collective', location: 'Nairobi', members: 8, focus: 'AGI1 wiring & solar' },
];
</script>

<template>
  <div class="institutions-page" data-module="records">
    <header class="institutions-header">
      <h1 class="institutions-title">Institutions & assets</h1>
      <p class="institutions-subtitle">
        Five confirmed entities only. Unknowns are explicit — no capital tab.
      </p>
    </header>

    <section class="institutions-register">
      <h2 class="institutions-section-title">Register</h2>
      <table class="institutions-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Members</th>
            <th>Focus</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inst in institutions" :key="inst.id" class="institutions-row">
            <td class="institutions-name">{{ inst.name }}</td>
            <td>{{ inst.type }}</td>
            <td>{{ inst.location }}</td>
            <td>{{ inst.members }}</td>
            <td>{{ inst.focus }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.institutions-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100vh;
  padding: var(--apt-spacing-s13);
}

.institutions-header {
  margin-bottom: var(--apt-spacing-s13);
}

.institutions-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.institutions-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.institutions-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-body);
}

.institutions-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--apt-color-neutral-n0);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r3);
  overflow: hidden;
}

.institutions-table th {
  text-align: left;
  padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
  background: var(--apt-surface-default);
  border-bottom: 1px solid var(--apt-border);
}

.institutions-table td {
  padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-body);
  border-bottom: 1px solid var(--apt-border);
}

.institutions-table tr:last-child td {
  border-bottom: none;
}

.institutions-row:hover {
  background: var(--apt-color-ramp-exchange-50);
}

.institutions-name {
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-pillar-stewardship);
}
</style>

