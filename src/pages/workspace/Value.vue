<script setup lang="ts">
/**
 * APT-LABS — Value (OUTCOME · VALUE).
 *
 * The home of what circulates: that value moved between parties, in the open,
 * and was allocated by transparent rule. Absorbs the old coin-lab. Every row is
 * a disclosed cost behind an undertaking — the value legibility the doctrine
 * demands. Live economic records are merged in when present.
 */
import { computed, ref } from 'vue'
import { OPERATIONAL_PILOTS } from '@/lib/demo-seed'
import { listEconomicRecords } from '@/lib/economic-records'

interface Row {
  key: string
  label: string
  detail: string
  amount: number | null
  currency: string
  settled: boolean
}

const rows = computed<Row[]>(() =>
  OPERATIONAL_PILOTS.flatMap((p) => {
    const c = p.acceptance.costDisclosed
    return [
      {
        key: p.id,
        label: p.label,
        detail: `${p.institution.name} · ${p.location}`,
        amount: c?.amount ?? null,
        currency: c?.currency ?? 'KES',
        settled: !!p.acceptance.acceptedAt,
      },
    ]
  }),
)

const liveRecords = computed(() => listEconomicRecords())
const liveCount = computed(() => liveRecords.value.length)

const metrics = computed(() => {
  const disclosed = rows.value.filter((r) => r.amount != null)
  const total = disclosed.reduce((s, r) => s + (r.amount ?? 0), 0)
  return {
    outcomes: disclosed.length,
    totalKes: total,
    funding: liveCount.value,
    settled: disclosed.length,
  }
})

const filter = ref<'all' | 'disclosed' | 'open'>('all')
const visible = computed(() => {
  if (filter.value === 'disclosed') return rows.value.filter((r) => r.amount != null)
  if (filter.value === 'open') return rows.value.filter((r) => r.amount == null)
  return rows.value
})

function fmtKes(n: number): string {
  return n.toLocaleString('en-KE')
}
</script>

<template>
  <div class="value">
    <div class="value-head">
      <div class="value-title-row">
        <h1 class="value-h1">Value</h1>
        <span class="value-k">Outcome · Value</span>
      </div>
      <div class="value-metrics">
        <div class="value-metric"><div class="value-mv">{{ metrics.outcomes }}</div><div class="value-ml">Outcomes</div></div>
        <div class="value-metric"><div class="value-mv">{{ fmtKes(metrics.totalKes) }}</div><div class="value-ml">KES disclosed</div></div>
        <div class="value-metric"><div class="value-mv">{{ metrics.funding }}</div><div class="value-ml">Live records</div></div>
        <div class="value-metric"><div class="value-mv">{{ metrics.settled }}</div><div class="value-ml">Settled</div></div>
      </div>
    </div>

    <div class="value-tabs" role="group" aria-label="Filter by cost disclosure">
      <button v-for="t in (['all', 'disclosed', 'open'] as const)" :key="t" :class="{ 'value-tab--on': filter === t }" class="value-tab" :aria-pressed="filter === t" @click="filter = t">
        {{ t === 'all' ? 'All' : t === 'disclosed' ? 'Cost disclosed' : 'Cost pending' }}
      </button>
    </div>

    <div class="value-rows">
      <div v-for="r in visible" :key="r.key" class="value-row">
        <div class="value-row-main">
          <div class="value-row-title">{{ r.label }}</div>
          <div class="value-row-meta">
            <span>{{ r.detail }}</span><span class="value-dot" aria-hidden="true" />
            <span>{{ r.amount != null ? `${fmtKes(r.amount)} ${r.currency}` : 'no cost disclosed' }}</span>
          </div>
        </div>
        <div class="value-row-side">
          <span :class="`value-chip ${r.settled ? 'value-chip--settled' : 'value-chip--open'}`">{{ r.settled ? 'Settled' : 'Open' }}</span>
          <span class="value-arrow" aria-hidden="true">→</span>
        </div>
      </div>
      <div v-if="!visible.length" class="value-empty">No value records at this filter. Disclosed costs from pilots appear here.</div>
    </div>

    <p class="value-fine">Cost legibility · allocation in the open · live records {{ liveCount }} (0 until an undertaking is settled)</p>
  </div>
</template>

<style scoped>
.value { min-height: 100%; padding: var(--apt-spacing-s11) var(--apt-spacing-s13); color: var(--apt-text-body); }
.value-head { border-bottom: 1px solid var(--apt-border); padding-bottom: var(--apt-spacing-s7); }
.value-title-row { display: flex; align-items: baseline; justify-content: space-between; gap: var(--apt-spacing-s7); }
.value-h1 { margin: 0; font: 500 var(--apt-font-size-h1) / 1.1 var(--apt-font-serif); color: var(--apt-text-strong); letter-spacing: -0.01em; }
.value-k { font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--apt-module-accent, var(--apt-color-brand-primary)); }

.value-metrics { display: flex; margin-top: var(--apt-spacing-s9); }
.value-metric { flex: 1; padding: 0 var(--apt-spacing-s9); border-left: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary)); }
.value-metric:first-child { border-left: none; padding-left: 0; }
.value-mv { font: 600 20px / 1 var(--apt-font-serif); color: var(--apt-text-strong); }
.value-ml { font: 500 9.5px / 1.4 var(--apt-font-mono); letter-spacing: 0.06em; text-transform: uppercase; color: var(--apt-text-dim); margin-top: 4px; }

.value-tabs { display: flex; gap: 4px; padding: var(--apt-spacing-s5) 0 0; border-bottom: 1px solid var(--apt-border); }
.value-tab { font: 600 var(--apt-font-size-body-sm) / 1 var(--apt-font-sans); color: var(--apt-text-muted); padding: 9px 14px; border-radius: 8px 8px 0 0; background: none; border: none; cursor: pointer; position: relative; }
.value-tab--on { color: var(--apt-text-strong); background: var(--apt-surface-page); }
.value-tab--on::after { content: ""; position: absolute; left: 14px; right: 14px; bottom: -1px; height: 2px; background: var(--apt-module-accent, var(--apt-color-brand-primary)); }

.value-rows { padding-top: var(--apt-spacing-s4); }
.value-row { display: grid; grid-template-columns: 1fr auto; gap: var(--apt-spacing-s8); align-items: center; padding: 14px 0; border-bottom: 1px solid color-mix(in srgb, var(--apt-text-strong) 8%, transparent); }
.value-row:hover { background: var(--apt-surface-default); }
.value-row-title { font: 600 15px / 1.3 var(--apt-font-serif); color: var(--apt-text-strong); }
.value-row-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 5px; }
.value-row-meta span { font: 500 10px / 1 var(--apt-font-mono); letter-spacing: 0.03em; color: var(--apt-text-muted); }
.value-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--apt-text-dim); align-self: center; }
.value-row-side { display: flex; align-items: center; gap: 10px; }
.value-arrow { font: 600 14px / 1 var(--apt-font-sans); color: var(--apt-text-dim); }

.value-chip { font: 600 9.5px / 1 var(--apt-font-mono); letter-spacing: 0.05em; text-transform: uppercase; padding: 5px 9px; border-radius: 4px; border: 1px solid; }
.value-chip--settled { color: var(--apt-standing-verified, #2b5945); background: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 12%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 30%, transparent); }
.value-chip--open { color: var(--apt-standing-reported, #AD8B55); background: color-mix(in srgb, var(--apt-standing-reported, #AD8B55) 14%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-standing-reported, #AD8B55) 34%, transparent); }

.value-empty { padding: 40px 0; text-align: center; font: 400 var(--apt-font-size-body-sm) / 1.6 var(--apt-font-sans); color: var(--apt-text-muted); }
.value-fine { margin-top: var(--apt-spacing-s9); font: 500 9px / 1.4 var(--apt-font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--apt-text-dim); text-align: center; }
</style>
