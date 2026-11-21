<script setup lang="ts">
/**
 * APT-LABS — Proof (EVIDENCE · VERIFICATION).
 *
 * The home of what can be shown, attested, and stood up to contest. Every row
 * is an evidence item behind an undertaking; its standing is derived, not
 * asserted: an inspection report makes it Verified, an acceptance makes it
 * Supported. Live SBT attestations are merged in so the register tracks what
 * the user has actually minted. Content-column body: fills the shell's main.
 */
import { computed, ref } from 'vue'
import { OPERATIONAL_PILOTS } from '@/lib/demo-seed'
import { listSbtAttestations } from '@/lib/sbt-attestations'
import { EVIDENCE_STANDING_LABELS } from '@/lib/ontology'
import { listEngineAgentTraces } from '@/lib/engine-agent'

type Standing = 'verified' | 'supported'

interface Row {
  key: string
  title: string
  detail: string
  layer: 'public' | 'participant' | 'restricted'
  standing: Standing
  recordedBy: string
}

interface LiveAttestation {
  key: string
  title: string
  detail: string
  standing: Standing
  recordedBy: string
}

function standingFor(pilotId: string): Standing {
  const p = OPERATIONAL_PILOTS.find((x) => x.id === pilotId)
  if (p?.acceptance.inspectionReportId) return 'verified'
  return p?.acceptance.acceptedAt ? 'supported' : 'supported'
}

const evidenceRows = computed<Row[]>(() =>
  OPERATIONAL_PILOTS.flatMap((p) =>
    p.evidence.map((e) => ({
      key: e.id,
      title: e.title,
      detail: `${p.label} · ${p.institution.name}`,
      layer: e.layer,
      standing: standingFor(p.id),
      recordedBy: p.acceptance.acceptedBy.replace(/^coord-/, '').replace(/-\d+$/, ''),
    })),
  ),
)

const attestations = computed<LiveAttestation[]>(() =>
  listSbtAttestations().map((a) => ({
    key: a.id,
    title: `${a.personName} · ${a.role}`,
    detail: `${a.undertakingTitle} — issued by ${a.issuedBy}`,
    standing: a.status === 'active' ? 'verified' : 'supported',
    recordedBy: a.issuedBy,
  })),
)

/** Governed receipts filed by the dock's local engine — the durable, openable tail. */
const engineReceipts = listEngineAgentTraces()

const standingFilter = ref<'all' | Standing>('all')
const rows = computed(() => {
  const all: Row[] = [...evidenceRows.value, ...attestations.value.map((a) => ({ ...a, layer: 'public' as const }))]
  return standingFilter.value === 'all' ? all : all.filter((r) => r.standing === standingFilter.value)
})

const metrics = computed(() => ({
  receipts: OPERATIONAL_PILOTS.length,
  evidence: evidenceRows.value.length,
  attestations: attestations.value.length,
  needs: OPERATIONAL_PILOTS.filter((p) => !p.acceptance.inspectionReportId).length,
}))

const LAYER_LABEL: Record<Row['layer'], string> = { public: 'Public', participant: 'Participant', restricted: 'Restricted' }

function chipClass(standing: Standing): string {
  return standing === 'verified' ? 'proof-chip proof-chip--verified' : 'proof-chip proof-chip--supported'
}
</script>

<template>
  <div class="proof">
    <div class="proof-head">
      <div class="proof-title-row">
        <h1 class="proof-h1">Proof</h1>
        <span class="proof-k">Evidence · Verification</span>
      </div>
      <div class="proof-metrics">
        <div class="proof-metric"><div class="proof-mv">{{ metrics.receipts }}</div><div class="proof-ml">Pilot receipts</div></div>
        <div class="proof-metric"><div class="proof-mv">{{ metrics.evidence }}</div><div class="proof-ml">Evidence items</div></div>
        <div class="proof-metric"><div class="proof-mv">{{ metrics.attestations }}</div><div class="proof-ml">Attestations</div></div>
        <div class="proof-metric"><div class="proof-mv">{{ metrics.needs }}</div><div class="proof-ml">Awaiting inspection</div></div>
      </div>
    </div>

    <div class="proof-tabs" role="group" aria-label="Filter by evidence standing">
      <button v-for="t in (['all', 'verified', 'supported'] as const)" :key="t" :class="{ 'proof-tab--on': standingFilter === t }" class="proof-tab" :aria-pressed="standingFilter === t" @click="standingFilter = t">
        {{ t === 'all' ? 'All' : EVIDENCE_STANDING_LABELS[t] }}
      </button>
    </div>

    <div class="proof-rows">
      <div v-for="r in rows" :key="r.key" class="proof-row">
        <div class="proof-row-main">
          <div class="proof-row-title">{{ r.title }}</div>
          <div class="proof-row-meta">
            <span>{{ r.detail }}</span><span class="proof-dot" aria-hidden="true" />
            <span>{{ LAYER_LABEL[r.layer] }}</span><span class="proof-dot" aria-hidden="true" />
            <span>recorded · {{ r.recordedBy }}</span>
          </div>
        </div>
        <div class="proof-row-side">
          <span :class="chipClass(r.standing)">{{ r.standing }}</span>
          <span class="proof-arrow" aria-hidden="true">→</span>
        </div>
      </div>
      <div v-if="!rows.length" class="proof-empty">
        No evidence at this standing yet. Seed a pilot and its records appear here — provenance preserved.
      </div>
    </div>

    <!-- Engine receipts: governed actions the dock's local engine filed. -->
    <section class="proof-engine">
      <div class="proof-engine-head">
        <span class="proof-engine-k">Engine receipts</span>
        <span v-if="engineReceipts.length" class="proof-engine-count">{{ engineReceipts.length }} {{ engineReceipts.length === 1 ? 'governed action' : 'governed actions' }}</span>
        <span v-else class="proof-engine-count">awaiting a dock verb</span>
      </div>
      <div class="proof-engine-rows">
        <div v-for="t in engineReceipts" :key="t.id" class="proof-engine-row">
          <div class="proof-engine-main">
            <div class="proof-engine-action">{{ t.action }}</div>
            <div class="proof-engine-meta">
              <span>{{ t.actor }}</span><span class="proof-dot" aria-hidden="true" />
              <span class="proof-engine-note">{{ t.note }}</span>
            </div>
          </div>
          <div class="proof-engine-side">
            <span class="proof-engine-result" :class="`proof-engine-result--${t.result}`">{{ t.result }}</span>
            <span class="proof-engine-id" :title="t.id">…{{ t.id.slice(-6) }}</span>
          </div>
        </div>
        <div v-if="!engineReceipts.length" class="proof-engine-empty">
          No governed receipts yet. Run a “Next move” in the Agent dock and its receipt lands here — propose-never-executes, provenance preserved.
        </div>
      </div>
    </section>

    <p class="proof-fine">Illustrative seed data · SBT attestations live · engine receipts live · provenance preserved</p>
  </div>
</template>

<style scoped>
.proof { min-height: 100%; padding: var(--apt-spacing-s11) var(--apt-spacing-s13); color: var(--apt-text-body); }
.proof-head { border-bottom: 1px solid var(--apt-border); padding-bottom: var(--apt-spacing-s7); }
.proof-title-row { display: flex; align-items: baseline; justify-content: space-between; gap: var(--apt-spacing-s7); }
.proof-h1 { margin: 0; font: 500 var(--apt-font-size-h1) / 1.1 var(--apt-font-serif); color: var(--apt-text-strong); letter-spacing: -0.01em; }
.proof-k { font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--apt-module-accent, var(--apt-color-brand-primary)); }

.proof-metrics { display: flex; margin-top: var(--apt-spacing-s9); }
.proof-metric { flex: 1; padding: 0 var(--apt-spacing-s9); border-left: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary)); }
.proof-metric:first-child { border-left: none; padding-left: 0; }
.proof-mv { font: 600 20px / 1 var(--apt-font-serif); color: var(--apt-text-strong); }
.proof-ml { font: 500 9.5px / 1.4 var(--apt-font-mono); letter-spacing: 0.06em; text-transform: uppercase; color: var(--apt-text-dim); margin-top: 4px; }

.proof-tabs { display: flex; gap: 4px; padding: var(--apt-spacing-s5) 0 0; border-bottom: 1px solid var(--apt-border); }
.proof-tab { font: 600 var(--apt-font-size-body-sm) / 1 var(--apt-font-sans); color: var(--apt-text-muted); padding: 9px 14px; border-radius: 8px 8px 0 0; background: none; border: none; cursor: pointer; position: relative; }
.proof-tab--on { color: var(--apt-text-strong); background: var(--apt-surface-page); }
.proof-tab--on::after { content: ""; position: absolute; left: 14px; right: 14px; bottom: -1px; height: 2px; background: var(--apt-module-accent, var(--apt-color-brand-primary)); }

.proof-rows { padding-top: var(--apt-spacing-s4); }
.proof-row { display: grid; grid-template-columns: 1fr auto; gap: var(--apt-spacing-s8); align-items: center; padding: 14px 0; border-bottom: 1px solid color-mix(in srgb, var(--apt-text-strong) 8%, transparent); }
.proof-row:hover { background: var(--apt-surface-default); }
.proof-row-title { font: 600 15px / 1.3 var(--apt-font-serif); color: var(--apt-text-strong); }
.proof-row-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 5px; }
.proof-row-meta span { font: 500 10px / 1 var(--apt-font-mono); letter-spacing: 0.03em; color: var(--apt-text-muted); }
.proof-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--apt-text-dim); align-self: center; }
.proof-row-side { display: flex; align-items: center; gap: 10px; }
.proof-arrow { font: 600 14px / 1 var(--apt-font-sans); color: var(--apt-text-dim); }

.proof-chip { font: 600 9.5px / 1 var(--apt-font-mono); letter-spacing: 0.05em; text-transform: uppercase; padding: 5px 9px; border-radius: 4px; border: 1px solid; }
.proof-chip--verified { color: var(--apt-standing-verified, #2b5945); background: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 12%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 30%, transparent); }
.proof-chip--supported { color: var(--apt-standing-supported, #3860be); background: color-mix(in srgb, var(--apt-standing-supported, #3860be) 12%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-standing-supported, #3860be) 30%, transparent); }

.proof-empty { padding: 40px 0; text-align: center; font: 400 var(--apt-font-size-body-sm) / 1.6 var(--apt-font-sans); color: var(--apt-text-muted); }
.proof-fine { margin-top: var(--apt-spacing-s9); font: 500 9px / 1.4 var(--apt-font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--apt-text-dim); text-align: center; }

/* Engine receipts — a recessed substrate strip: the durable tail of what the
   dock's local engine governed, not the primary evidence register above. */
.proof-engine { margin-top: var(--apt-spacing-s11); border-top: 1px solid var(--apt-border); padding-top: var(--apt-spacing-s9); }
.proof-engine-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: var(--apt-spacing-s5); }
.proof-engine-k { font: 600 var(--apt-font-size-micro) / 1 var(--apt-font-mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--apt-text-dim); }
.proof-engine-count { font: 500 9.5px / 1 var(--apt-font-mono); letter-spacing: 0.05em; text-transform: uppercase; color: var(--apt-text-muted); }
.proof-engine-rows { display: flex; flex-direction: column; }
.proof-engine-row { display: grid; grid-template-columns: 1fr auto; gap: var(--apt-spacing-s8); align-items: center; padding: 10px 0; border-bottom: 1px solid color-mix(in srgb, var(--apt-text-strong) 8%, transparent); }
.proof-engine-action { font: 500 13px / 1.3 var(--apt-font-serif); color: var(--apt-text-strong); }
.proof-engine-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 4px; }
.proof-engine-meta span { font: 500 10px / 1 var(--apt-font-mono); letter-spacing: 0.03em; color: var(--apt-text-muted); }
.proof-engine-note { color: var(--apt-text-dim); }
.proof-engine-side { display: flex; align-items: center; gap: 10px; }
.proof-engine-result { font: 600 9px / 1 var(--apt-font-mono); letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; border: 1px solid; }
.proof-engine-result--executed { color: var(--apt-standing-verified, #2b5945); background: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 12%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 30%, transparent); }
.proof-engine-result--approved { color: var(--apt-standing-supported, #3860be); background: color-mix(in srgb, var(--apt-standing-supported, #3860be) 12%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-standing-supported, #3860be) 30%, transparent); }
.proof-engine-result--rejected,
.proof-engine-result--failed { color: var(--apt-standing-reported, #AD8B55); background: color-mix(in srgb, var(--apt-standing-reported, #AD8B55) 14%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-standing-reported, #AD8B55) 34%, transparent); }
.proof-engine-id { font: 500 9px / 1 var(--apt-font-mono); letter-spacing: 0.04em; text-transform: uppercase; color: var(--apt-text-dim); }
.proof-engine-empty { padding: 28px 0; text-align: center; font: 400 var(--apt-font-size-body-sm) / 1.6 var(--apt-font-sans); color: var(--apt-text-muted); }
</style>
