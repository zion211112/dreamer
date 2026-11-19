<script setup lang="ts">
import { RouterLink } from 'vue-router';

const records = [
  { id: 'r-01', title: 'Benbenos console upkeep', status: 'accepted', gate: 'accepted', date: '2026-10-17', capital: 6000 },
  { id: 'r-02', title: 'Learner record audit', status: 'in_execution', gate: 'in_execution', date: '2026-10-17', capital: 4000 },
  { id: 'r-03', title: 'Kemetos AGI1 wiring', status: 'draft', gate: 'draft', date: '2026-10-16', capital: 12000 },
  { id: 'r-04', title: 'Solar basic installation', status: 'pending_authorization', gate: 'pending_authorization', date: '2026-10-15', capital: 18000 },
  { id: 'r-05', title: 'Thiba canal lining', status: 'in_execution', gate: 'in_execution', date: '2026-10-14', capital: 48000 },
];
</script>

<template>
  <div class="records-page" data-module="records">
    <header class="records-header">
      <h1 class="records-title">Records</h1>
      <p class="records-subtitle">
        Canon, Annals, Roll lenses — immutable evidence of delivery.
      </p>
    </header>

    <section class="records-lenses">
      <div class="records-lens-tabs">
        <RouterLink to="/workspace/records/canon" class="records-lens-tab records-lens-tab--active">Canon</RouterLink>
        <RouterLink to="/workspace/records/annals" class="records-lens-tab">Annals</RouterLink>
        <RouterLink to="/workspace/records/roll" class="records-lens-tab">Roll</RouterLink>
      </div>
    </section>

    <section class="records-list">
      <h2 class="records-section-title">Undertaking record</h2>
      <table class="records-table">
        <thead>
          <tr>
            <th>Undertaking</th>
            <th>Gate</th>
            <th>Date</th>
            <th>Capital (KES)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id" class="records-row">
            <td class="records-title-cell">{{ record.title }}</td>
            <td>
              <span class="records-gate-badge" :class="`records-gate--${record.gate}`">
                {{ record.gate }}
              </span>
            </td>
            <td>{{ record.date }}</td>
            <td class="records-capital">{{ record.capital.toLocaleString('en-KE') }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.records-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100vh;
  padding: var(--apt-spacing-s13);
}

.records-header {
  margin-bottom: var(--apt-spacing-s13);
}

.records-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.records-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.records-lens-tabs {
  display: flex;
  gap: var(--apt-spacing-s3);
  margin-bottom: var(--apt-spacing-s13);
}

.records-lens-tab {
  padding: var(--apt-spacing-s3) var(--apt-spacing-s6);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-muted);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  text-decoration: none;
  transition: all var(--apt-animation-fast);
}

.records-lens-tab--active {
  border-color: var(--apt-module-accent, var(--apt-color-brand-primary));
  background: var(--apt-color-ramp-stewardship-50);
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.records-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-body);
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--apt-color-neutral-n0);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r3);
  overflow: hidden;
}

.records-table th {
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

.records-table td {
  padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-body);
  border-bottom: 1px solid var(--apt-border);
}

.records-table tr:last-child td {
  border-bottom: none;
}

.records-row:hover {
  background: var(--apt-color-ramp-exchange-50);
}

.records-title-cell {
  font-weight: var(--apt-font-weight-medium);
}

.records-gate-badge {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  border-radius: var(--apt-radius-r1);
}

.records-gate--accepted { background: var(--apt-color-ramp-stewardship-50); color: var(--apt-pillar-stewardship); }
.records-gate--in_execution { background: var(--apt-color-ramp-exchange-50); color: var(--apt-color-brand-exchange); }
.records-gate--draft { background: var(--apt-color-neutral-n50); color: var(--apt-text-dim); }
.records-gate--pending_authorization { background: var(--apt-color-state-caution-wash); color: var(--apt-color-state-caution); }

.records-capital {
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>

