<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useNetworkStore, groupOf } from '@/stores/network';

const network = useNetworkStore();
onMounted(() => network.load());

// The register: institutional and organizational actor types.
const rows = computed(() =>
  network.rows.filter(
    (r) => groupOf(r.actor.type) === 'institutions' || groupOf(r.actor.type) === 'organizations',
  ),
);
</script>

<template>
  <div class="institutions-page" data-module="network">
    <header class="institutions-header">
      <h1 class="institutions-title">Institutions &amp; organizations</h1>
      <p class="institutions-subtitle">
        The register of institutional and organizational actors in the network —
        every row a real, registered profile.
      </p>
    </header>

    <nav class="institutions-back">
      <RouterLink to="/workspace/network">← Network directory</RouterLink>
    </nav>

    <section class="institutions-register">
      <div v-if="!rows.length" class="institutions-empty">
        <h2 class="institutions-empty-title">No institutions or organizations registered</h2>
        <p class="institutions-empty-body">
          Register an institution, company, cooperative, or crew in the Coordination Workbench,
          and it will be listed here.
        </p>
        <RouterLink to="/workspace/coordination" class="institutions-empty-cta">
          Open the Coordination Workbench
        </RouterLink>
      </div>

      <template v-else>
        <h2 class="institutions-section-title">Register</h2>
        <div class="institutions-table-wrap">
          <table class="institutions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Focus</th>
                <th>Can do</th>
                <th>Has</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.actor.id" class="institutions-row">
                <td class="institutions-name">{{ row.actor.name }}</td>
                <td>{{ row.typeLabel }}</td>
                <td>{{ row.actor.description || '—' }}</td>
                <td>{{ row.capabilities.join(', ') || '—' }}</td>
                <td>{{ row.assets.join(', ') || '—' }}</td>
                <td class="institutions-date">{{ row.actor.createdAt.slice(0, 10) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.institutions-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
  padding: var(--apt-spacing-s13);
}

.institutions-header {
  margin-bottom: var(--apt-spacing-s8);
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

.institutions-back {
  margin-bottom: var(--apt-spacing-s8);
}

.institutions-back a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  text-decoration: none;
}

.institutions-back a:hover {
  text-decoration: underline;
}

.institutions-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-body);
}

.institutions-table-wrap {
  overflow-x: auto;
}

.institutions-table {
  width: 100%;
  min-width: 640px;
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

.institutions-date {
  font-variant-numeric: tabular-nums;
  color: var(--apt-text-muted);
}

/* First-use empty state */

.institutions-empty {
  padding: var(--apt-spacing-s13);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
  text-align: center;
}

.institutions-empty-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.institutions-empty-body {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 auto;
  max-width: 44ch;
  line-height: var(--apt-line-height-relaxed);
}

.institutions-empty-cta {
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
</style>
