<script setup lang="ts">
/**
 * APT-LABS — Value (OUTCOME · VALUE).
 *
 * The home of what circulates: value moved between parties, in the open,
 * allocated by transparent rule. Every row is a disclosed cost behind an
 * undertaking — the value legibility the doctrine demands.
 *
 * Commercial model (cloak-compatible): Replacement Engine routes institutional
 * procurement through verified local producers, 3–5% transaction fee. Roll
 * density is the defensibility layer.
 */
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { OPERATIONAL_PILOTS } from '@/lib/demo-seed';
import { listEconomicRecords } from '@/lib/economic-records';
import FlowRail from '@/components/ui/FlowRail.vue';

interface Row {
  key: string;
  label: string;
  institution: string;
  location: string;
  amount: number | null;
  currency: string;
  settled: boolean;
  acceptedAt: string | null;
}

const allRows: Row[] = OPERATIONAL_PILOTS.flatMap((p) => {
  const c = p.acceptance.costDisclosed;
  return [
    {
      key: p.id,
      label: p.label,
      institution: p.institution.name,
      location: p.location,
      amount: c?.amount ?? null,
      currency: c?.currency ?? 'KES',
      settled: !!p.acceptance.acceptedAt,
      acceptedAt: p.acceptance.acceptedAt ?? null,
    },
  ];
});

const rows = computed(() => allRows);

const liveRecords = computed(() => listEconomicRecords());
const liveCount = computed(() => liveRecords.value.length);

const metrics = computed(() => {
  const disclosed = allRows.filter((r) => r.amount != null);
  const total = disclosed.reduce((s, r) => s + (r.amount ?? 0), 0);
  const settledCount = disclosed.filter((r) => r.settled).length;
  return {
    outcomes: disclosed.length,
    totalKes: total,
    funding: liveCount.value,
    settled: settledCount,
    open: disclosed.length - settledCount,
  };
});

const filter = ref<'all' | 'disclosed' | 'settled' | 'open'>('all');

const visible = computed(() => {
  if (filter.value === 'disclosed')
    return allRows.filter((r) => r.amount != null);
  if (filter.value === 'settled')
    return allRows.filter((r) => r.amount != null && r.settled);
  if (filter.value === 'open')
    return allRows.filter((r) => r.amount != null && !r.settled);
  return allRows;
});

function fmtKes(n: number): string {
  return n.toLocaleString('en-KE');
}
</script>

<template>
  <div class="value" data-module="value">
    <div class="value-body">
      <main class="value-main">
        <div class="value-head">
          <div class="value-title-row">
            <div class="value-brand">
              <span class="value-k">OUTCOME · VALUE</span>
              <h1 class="value-h1">Value circulated</h1>
            </div>
            <p class="value-sub">
              Every row is a disclosed cost behind an undertaking — allocated
              by transparent rule, settled in the open.
            </p>
          </div>
          <div class="value-metrics">
            <div class="value-metric">
              <div class="value-metric-value">{{ metrics.outcomes }}</div>
              <div class="value-metric-label">Outcomes disclosed</div>
            </div>
            <div class="value-metric">
              <div class="value-metric-value">{{ fmtKes(metrics.totalKes) }}</div>
              <div class="value-metric-label">KES disclosed</div>
            </div>
            <div class="value-metric">
              <div class="value-metric-value">{{ metrics.settled }}</div>
              <div class="value-metric-label">Settled</div>
            </div>
            <div class="value-metric">
              <div class="value-metric-value">{{ metrics.open }}</div>
              <div class="value-metric-label">Open allocation</div>
            </div>
          </div>
        </div>

        <!-- Where Value stands in the productive chain: settlement completes execution into knowledge -->
        <FlowRail active="value" title="Where the chain stands" />

        <section class="value-flow">
          <h2 class="value-section-title">Circulation</h2>
          <p class="value-section-lede">
            Cost moves from undertaking to allocation, in the open. No balance,
            no transfer, no coin-gated access — disclosure only.
          </p>
          <div class="value-flow-grid">
            <div class="value-flow-node">
              <span class="value-flow-step">01</span>
              <span class="value-flow-label">Undertaking accepted</span>
            </div>
            <div class="value-flow-connector">→</div>
            <div class="value-flow-node">
              <span class="value-flow-step">02</span>
              <span class="value-flow-label">Cost disclosed</span>
            </div>
            <div class="value-flow-connector">→</div>
            <div class="value-flow-node">
              <span class="value-flow-step">03</span>
              <span class="value-flow-label">Allocation rule applied</span>
            </div>
            <div class="value-flow-connector">→</div>
            <div class="value-flow-node">
              <span class="value-flow-step">04</span>
              <span class="value-flow-label">Settlement recorded</span>
            </div>
          </div>
        </section>

        <section class="value-rows-section">
          <div class="value-section-head">
            <div>
              <h2 class="value-section-title">Disclosed costs</h2>
              <p class="value-section-lede">
                Undertakings with disclosed cost — the value legibility layer.
              </p>
            </div>
            <div class="value-tabs" role="group" aria-label="Filter by settlement state">
              <button
                v-for="t in [['all','All'], ['disclosed','Cost disclosed'], ['settled','Settled'], ['open','Open allocation']] as [id, label]"
                :key="id"
                :class="{ 'value-tab--on': filter === id }"
                class="value-tab"
                :aria-pressed="filter === id"
                @click="filter = id"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <div v-if="visible.length === 0" class="value-empty">
            <p class="value-empty-line">
              No value records at this filter. Disclosed costs from pilots
              appear here as undertakings are accepted.
            </p>
          </div>

          <div v-else class="value-rows">
            <div v-for="r in visible" :key="r.key" class="value-row">
              <div class="value-row-main">
                <div class="value-row-title">{{ r.label }}</div>
                <div class="value-row-meta">
                  <span>{{ r.institution }}</span>
                  <span class="value-dot" aria-hidden="true" />
                  <span>{{ r.location }}</span>
                  <span class="value-dot" aria-hidden="true" />
                  <span>
                    {{ r.amount != null ? fmtKes(r.amount) + ' ' + r.currency : 'Cost pending' }}
                  </span>
                </div>
              </div>
              <div class="value-row-side">
                <span
                  :class="[
                    'value-chip',
                    r.settled ? 'value-chip--settled' : 'value-chip--open',
                  ]"
                >
                  {{ r.settled ? 'Settled' : 'Open' }}
                </span>
                <RouterLink
                  v-if="r.acceptedAt"
                  to="/workspace/workbench"
                  class="value-row-action"
                >
                  Open in Workbench
                  <span class="value-arrow" aria-hidden="true">→</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </section>

        <section class="value-engine">
          <h2 class="value-section-title">Replacement Engine</h2>
          <p class="value-section-lede">
            Institutional procurement routed through verified local producers.
            3–5% transaction fee. Roll density is the defensibility layer.
          </p>
          <div class="value-engine-grid">
            <div class="value-engine-card">
              <h3 class="value-engine-title">Wedge — first 90 days</h3>
              <p class="value-engine-lede">
                Schools, cooperatives, community orgs, small enterprises.
                Equipment repair, fabrication, installation, maintenance,
                minor infrastructure. Not major bridges or hydro — Year 3+.
              </p>
            </div>
            <div class="value-engine-card">
              <h3 class="value-engine-title">Revenue streams</h3>
              <ul class="value-engine-list">
                <li>Replacement Engine — 3–5% fee on routed procurement</li>
                <li>Project Coordination — per-project fee / subscription</li>
                <li>Technical Integration — APT Fab / Studio services</li>
                <li>Evidence Certification — Roll query access (Year 4+)</li>
              </ul>
            </div>
            <div class="value-engine-card">
              <h3 class="value-engine-title">Capital constraint</h3>
              <p class="value-engine-lede">
                Must survive Year 3 without $1B traction. Replacement Engine
                fees + coordination fees fund the compounding period.
              </p>
            </div>
          </div>
        </section>

        <p class="value-fine">
          Cost legibility · allocation in the open · live records
          {{ liveCount }} · Browser-local. No live institutional, payment,
          tracking, or account connections.
        </p>
      </main>
    </div>
  </div>
</template>

<style scoped>
.value {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.value-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.value-main {
  flex: 1;
  min-width: 0;
  padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22);
  max-width: 1180px;
}

.value-head {
  margin-bottom: var(--apt-spacing-s10);
}

.value-brand {
  display: flex;
  align-items: baseline;
  gap: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s4);
}

.value-k {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--apt-module-accent, var(--apt-pillar-exchange));
}

.value-h1 {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-display);
  font-weight: var(--apt-font-weight-semibold);
  letter-spacing: -0.022em;
  line-height: 1.05;
  color: var(--apt-text-strong);
  margin: 0 0 var(--apt-spacing-s3);
}

.value-sub {
  font-size: var(--apt-font-size-body-md);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0;
  max-width: 64ch;
}

.value-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--apt-border);
  margin-bottom: var(--apt-spacing-s10);
}

.value-metric {
  background: var(--apt-surface-page);
  padding: var(--apt-spacing-s6);
  border-left: 3px solid var(--apt-module-accent, var(--apt-pillar-exchange));
}

.value-metric:first-child {
  border-left: none;
  padding-left: 0;
}

.value-metric-value {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-display);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  line-height: 1;
  letter-spacing: -0.01em;
}

.value-metric-label {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  margin-top: var(--apt-spacing-s3);
}

.value-flow {
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-page);
  margin-bottom: var(--apt-spacing-s10);
  padding: var(--apt-spacing-s10) var(--apt-spacing-s12);
}

.value-flow > h2,
.value-rows-section > h2,
.value-engine > h2 {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s4) 0;
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
}

.value-section-lede {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s8);
  line-height: var(--apt-line-height-relaxed);
  max-width: 72ch;
}

.value-flow-grid {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s4);
  overflow-x: auto;
  padding-bottom: var(--apt-spacing-s4);
}

.value-flow-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--apt-spacing-s3);
  flex: none;
}

.value-flow-step {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-module-accent, var(--apt-pillar-exchange));
}

.value-flow-label {
  font-size: var(--apt-font-size-micro);
  text-align: center;
  color: var(--apt-text-muted);
  line-height: 1.4;
  max-width: 80px;
}

.value-flow-connector {
  color: var(--apt-text-dim);
  font-family: var(--apt-font-mono);
  font-weight: var(--apt-font-weight-bold);
  font-size: var(--apt-font-size-body-md);
}

.value-rows-section {
  margin-bottom: var(--apt-spacing-s10);
}

.value-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  flex-wrap: wrap;
  margin-bottom: var(--apt-spacing-s8);
}

.value-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--apt-border);
}

.value-tab {
  display: inline-flex;
  align-items: center;
  padding: var(--apt-spacing-s5) var(--apt-spacing-s10);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color var(--apt-animation-fast), border-color var(--apt-animation-fast);
}

.value-tab:hover {
  color: var(--apt-text-strong);
}

.value-tab--on {
  color: var(--apt-text-strong);
  border-bottom-color: var(--apt-color-brand-primary);
}

.value-empty {
  padding: var(--apt-spacing-s10);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
}

.value-empty-line {
  margin: 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-relaxed);
  max-width: 72ch;
}

.value-rows {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s3);
}

.value-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--apt-spacing-s8);
  align-items: center;
  padding: var(--apt-spacing-s6) 0;
  border-bottom: 1px solid color-mix(in srgb, var(--apt-text-strong) 8%, transparent);
}

.value-row:hover {
  background: var(--apt-surface-default);
}

.value-row-main {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
  min-width: 0;
}

.value-row-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
  margin: 0;
}

.value-row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.value-row-meta span {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.03em;
  color: var(--apt-text-muted);
}

.value-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--apt-text-dim);
  flex: none;
}

.value-row-side {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s4);
}

.value-chip {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: var(--apt-spacing-s1) var(--apt-spacing-s4);
  border-radius: var(--apt-radius-r0);
  border: 1px solid;
  white-space: nowrap;
}

.value-chip--settled {
  color: var(--apt-standing-verified, #2b5945);
  background: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 12%, var(--apt-surface-default));
  border-color: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 30%, transparent);
}

.value-chip--open {
  color: var(--apt-standing-reported, #AD8B55);
  background: color-mix(in srgb, var(--apt-standing-reported, #AD8B55) 14%, var(--apt-surface-default));
  border-color: color-mix(in srgb, var(--apt-standing-reported, #AD8B55) 34%, transparent);
}

.value-row-action {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-strong);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-raised);
  white-space: nowrap;
  transition: border-color var(--apt-animation-fast);
}

.value-row-action:hover {
  border-color: var(--apt-color-brand-primary);
  box-shadow: var(--apt-shadow-sh1);
}

.value-arrow {
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-module-accent, var(--apt-pillar-exchange));
}

.value-engine {
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-page);
  padding: var(--apt-spacing-s10) var(--apt-spacing-s12);
}

.value-engine-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--apt-spacing-s8);
}

.value-engine-card {
  padding: var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r2);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.value-engine-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s4);
  color: var(--apt-text-strong);
}

.value-engine-lede {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.value-engine-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
}

.value-engine-list li {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-relaxed);
}

.value-fine {
  margin-top: var(--apt-spacing-s9);
  font: 500 var(--apt-font-size-micro) / 1.4 var(--apt-font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  text-align: center;
}

@media (max-width: 900px) {
  .value-main { padding: var(--apt-spacing-s8); }
  .value-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .value-engine-grid { grid-template-columns: 1fr; }
  .value-flow-grid { gap: var(--apt-spacing-s2); }
  .value-flow-label { max-width: 60px; font-size: var(--apt-font-size-sm-3); }
}

@media (max-width: 600px) {
  .value-metrics { grid-template-columns: 1fr; }
  .value-section-head { flex-direction: column; gap: var(--apt-spacing-s4); align-items: flex-start; }
  .value-tabs { width: 100%; overflow-x: auto; padding-bottom: var(--apt-spacing-s2); -webkit-overflow-scrolling: touch; }
}
</style>
