<script setup lang="ts">
/**
 * APT-LABS — Job controller (dsh `ui-jobs` / `job-controller` pattern).
 *
 * Work item management surface for the Workbench module. Renders a dense,
 * action-oriented list of job cards: each card shows title, pilot, gate
 * state, evidence standing, capital amount, and crew assignment, with a
 * gate-advance button when the item can cross to its next gate and an
 * approval chip when a gated action awaits sign-off.
 *
 * Emits `gate-advance` with the work item id when a gate is advanced.
 */
import { computed } from 'vue'
import type { WorkItem, GateState } from '@/modules/workbench/data'
import {
  GATE_LABELS,
  NEXT_GATE,
  CALL_SHEET_STEP,
  pilotByKey,
} from '@/modules/workbench/data'

const props = defineProps<{
  jobs: WorkItem[]
}>()

const emit = defineEmits<{
  'gate-advance': [workItemId: string]
}>()

const jobs = props.jobs

/** Count of jobs by gate state. */
const gateCounts = computed(() => {
  const counts: Record<GateState, number> = {
    draft: 0, proposed: 0, in_review: 0, pending_authorization: 0,
    authorized: 0, in_execution: 0, pending_acceptance: 0, accepted: 0,
  }
  for (const job of jobs) {
    counts[job.gate] = (counts[job.gate] ?? 0) + 1
  }
  return counts
})

/** Total jobs. */
const totalJobs = computed(() => jobs.length)

/** Active (non-accepted) jobs. */
const activeCount = computed(() => jobs.filter((j) => j.gate !== 'accepted').length)

/** Total committed capital across jobs. */
const totalCapital = computed(() =>
  jobs.reduce((t, j) => t + (j.capital.financial ?? 0), 0),
)

/** Whether a job can advance to its next gate (not at terminal 'accepted'). */
function canAdvance(job: WorkItem): boolean {
  return NEXT_GATE[job.gate] !== null
}

/** Next gate label for a job, or null when terminal. */
function nextGateLabel(job: WorkItem): string | null {
  const next = NEXT_GATE[job.gate]
  return next ? GATE_LABELS[next] : null
}

/** Whether a job is gated — awaiting sign-off before it can advance. */
function isGated(job: WorkItem): boolean {
  return job.gate === 'pending_authorization'
}

/** Authority name for a gated job — crew anchor, falling back to first capital condition. */
function gatingAuthority(job: WorkItem): string {
  return job.crew.anchor && job.crew.anchor !== '—'
    ? job.crew.anchor
    : (job.capital.conditions[0] ?? 'authority')
}

/** Evidence standing: verified when attestation exists, reported when evidence present, else unassessed. */
function evidenceStanding(job: WorkItem): 'verified' | 'reported' | 'unassessed' {
  if (job.verification?.attestationId) return 'verified'
  if (job.evidence.length > 0) return 'reported'
  return 'unassessed'
}

/** Human label for evidence standing. */
function evidenceLabel(job: WorkItem): string {
  switch (evidenceStanding(job)) {
    case 'verified': return 'Verified'
    case 'reported': return 'Reported'
    default: return 'Unassessed'
  }
}

/** Format capital amount as KES. */
function formatCapital(amount: number | null): string {
  if (amount === null) return '—'
  return `KES ${amount.toLocaleString()}`
}

/** Crew line — anchor and builder, fallback em dash. */
function crewLine(job: WorkItem): string {
  const parts: string[] = []
  if (job.crew.anchor && job.crew.anchor !== '—') parts.push(job.crew.anchor)
  if (job.crew.builder && job.crew.builder !== '—') parts.push(job.crew.builder)
  return parts.length ? parts.join(' · ') : '—'
}

/** Pilot label by key. */
function pilotLabel(key: string): string {
  const p = pilotByKey(key)
  return p ? p.label : key
}

/** Gate state → colour/wash token pair. */
const GATE_STATE_TOKENS: Record<GateState, { color: string; wash: string }> = {
  draft: { color: 'var(--apt-state-caution)', wash: 'var(--apt-state-caution-wash)' },
  proposed: { color: 'var(--apt-state-proposed)', wash: 'var(--apt-state-proposed-wash)' },
  in_review: { color: 'var(--apt-state-caution)', wash: 'var(--apt-state-caution-wash)' },
  pending_authorization: { color: 'var(--apt-state-risk)', wash: 'var(--apt-state-risk-wash)' },
  authorized: { color: 'var(--apt-state-canon)', wash: 'var(--apt-state-canon-wash)' },
  in_execution: { color: 'var(--apt-state-canon)', wash: 'var(--apt-state-canon-wash)' },
  pending_acceptance: { color: 'var(--apt-state-caution)', wash: 'var(--apt-state-caution-wash)' },
  accepted: { color: 'var(--apt-state-canon)', wash: 'var(--apt-state-canon-wash)' },
}

/** Evidence standing → colour/wash token pair. */
const STANDING_TOKENS: Record<'verified' | 'reported' | 'unassessed', { color: string; wash: string }> = {
  verified: { color: 'var(--apt-standing-verified)', wash: 'var(--apt-color-forest-50)' },
  reported: { color: 'var(--apt-standing-reported)', wash: 'var(--apt-color-peach-50)' },
  unassessed: { color: 'var(--apt-standing-unassessed)', wash: 'var(--apt-color-neutral-n50)' },
}
</script>

<template>
  <section class="job-controller">
    <!-- Header: title + counts badges -->
    <div class="job-controller-head">
      <div class="job-controller-title">
        <div class="job-controller-eyebrow">Job controller</div>
        <div class="job-controller-main">Work items · {{ totalJobs }} total</div>
      </div>
      <div class="job-controller-counts">
        <span
          v-for="(count, gate) in gateCounts"
          :key="gate"
          class="job-controller-count"
          :class="[`job-controller-count--${gate}`, count > 0 ? 'job-controller-count--has' : 'job-controller-count--zero']"
        >
          <span class="job-controller-count-num">{{ count }}</span>
          <span class="job-controller-count-lab">{{ GATE_LABELS[gate] }}</span>
        </span>
        <span class="job-controller-count job-controller-count--active">
          <span class="job-controller-count-num">{{ activeCount }}</span>
          <span class="job-controller-count-lab">active</span>
        </span>
        <span class="job-controller-count job-controller-count--capital">
          <span class="job-controller-count-num">{{ totalCapital }}</span>
          <span class="job-controller-count-lab">KES committed</span>
        </span>
      </div>
    </div>

    <!-- Job cards grid -->
    <div class="job-controller-grid">
      <article
        v-for="job in jobs"
        :key="job.id"
        class="job-card"
        :class="{
          'job-card--gated': isGated(job),
          'job-card--accepted': job.gate === 'accepted',
        }"
      >
        <!-- Card head: id, title, gate badge -->
        <div class="job-card-head">
          <span class="job-card-id">{{ job.id }}</span>
          <h3 class="job-card-title">{{ job.title }}</h3>
          <span
            class="job-card-gate"
            :style="{
              color: GATE_STATE_TOKENS[job.gate].color,
              backgroundColor: GATE_STATE_TOKENS[job.gate].wash,
            }"
          >
            {{ GATE_LABELS[job.gate] }}
          </span>
        </div>

        <!-- Meta row: pilot, discipline, location -->
        <div class="job-card-meta">
          <span class="job-card-pilot">{{ pilotLabel(job.pilot) }}</span>
          <span class="job-card-divider">·</span>
          <span class="job-card-discipline">{{ job.discipline }}</span>
          <span class="job-card-divider">·</span>
          <span class="job-card-location">{{ job.location }}</span>
        </div>

        <!-- Evidence standing -->
        <div class="job-card-evidence">
          <span class="job-card-evidence-label">Evidence</span>
          <span
            class="job-card-evidence-chip"
            :class="`job-card-evidence--${evidenceStanding(job)}`"
            :style="{
              color: STANDING_TOKENS[evidenceStanding(job)].color,
              backgroundColor: STANDING_TOKENS[evidenceStanding(job)].wash,
            }"
          >
            {{ evidenceLabel(job) }}
          </span>
          <span
            v-for="layer in job.evidence"
            :key="layer"
            class="job-card-evidence-layer"
          >
            {{ layer }}
          </span>
        </div>

        <!-- Details: capital, crew, step -->
        <div class="job-card-details">
          <div class="job-card-detail">
            <span class="job-card-detail-label">Capital</span>
            <span class="job-card-detail-value">{{ formatCapital(job.capital.financial) }}</span>
          </div>
          <div class="job-card-detail">
            <span class="job-card-detail-label">Crew</span>
            <span class="job-card-detail-value">{{ crewLine(job) }}</span>
          </div>
          <div class="job-card-detail">
            <span class="job-card-detail-label">Step</span>
            <span class="job-card-detail-value">{{ CALL_SHEET_STEP[job.gate].label }}</span>
          </div>
        </div>

        <!-- Actions: advance button or terminal + approval chip -->
        <div class="job-card-actions">
          <button
            v-if="canAdvance(job) && !isGated(job)"
            type="button"
            class="job-card-advance"
            @click="emit('gate-advance', job.id)"
            :title="`Advance to ${nextGateLabel(job)}`"
          >
            <span class="job-card-advance-text">Advance → {{ nextGateLabel(job) }}</span>
          </button>
          <button
            v-else-if="canAdvance(job) && isGated(job)"
            type="button"
            class="job-card-advance job-card-advance--gated"
            disabled
          >
            <span class="job-card-advance-text">Advance → {{ nextGateLabel(job) }}</span>
          </button>
          <div v-else class="job-card-terminal">Settled</div>

          <!-- Approval chip when gated -->
          <div v-if="isGated(job)" class="approval-chip">
            <span class="approval-chip-label">Awaiting sign-off</span>
            <span class="approval-chip-authority">{{ gatingAuthority(job) }}</span>
          </div>
        </div>

        <!-- Message-quote transcript: lifecycle events (newest first) -->
        <div v-if="job.events?.length" class="job-card-transcript">
          <div class="job-card-transcript-head">Trace</div>
          <div class="job-card-transcript-list">
            <div
              v-for="event in job.events.slice().sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )"
              :key="event.id"
              class="message-quote message-quote--receipt"
            >
              <span class="message-quote-role">{{ event.actor }}</span>
              <p class="message-quote-body">{{ event.note }}</p>
              <span class="message-quote-meta">{{ event.type }} · {{ new Date(event.createdAt).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Empty state -->
    <div v-if="jobs.length === 0" class="job-controller-empty">
      <span class="job-controller-empty-label">No work items</span>
    </div>
  </section>
</template>

<style scoped>
.job-controller {
  --line: color-mix(in srgb, var(--apt-text-strong) 12%, transparent);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s7);
  background: var(--apt-surface-page);
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r2);
  padding: var(--apt-spacing-s8);
}

/* Header */
.job-controller-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s8);
  margin-bottom: var(--apt-spacing-s2);
}

.job-controller-eyebrow {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.job-controller-main {
  font: 600 var(--apt-font-size-body-md) / 1.2 var(--apt-font-serif);
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
}

.job-controller-counts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--apt-spacing-s4);
  align-items: baseline;
}

.job-controller-count {
  display: inline-flex;
  align-items: baseline;
  gap: var(--apt-spacing-s2);
  padding: var(--apt-spacing-s2) var(--apt-spacing-s4);
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-default);
}

.job-controller-count--has {
  border-color: color-mix(in srgb, var(--apt-module-accent) 20%, transparent);
}

.job-controller-count--zero {
  opacity: 0.45;
}

.job-controller-count-num {
  font: 600 var(--apt-font-size-body-sm) / 1 var(--apt-font-serif);
  color: var(--apt-text-strong);
}

.job-controller-count-lab {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

/* Grid */
.job-controller-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--apt-spacing-s6);
}

@media (max-width: 900px) {
  .job-controller-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .job-controller-grid { grid-template-columns: 1fr; }
}

/* Job card */
.job-card {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-spacing-s6);
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-page);
  transition: border-color var(--apt-animation-fast), background var(--apt-animation-fast);
}

.job-card:hover {
  border-color: var(--line-strong);
  background: var(--apt-surface-raised);
}

.job-card--gated {
  border-color: color-mix(in srgb, var(--apt-state-risk) 30%, transparent);
}

.job-card--accepted {
  opacity: 0.55;
}

/* Card head */
.job-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--apt-spacing-s4);
}

.job-card-id {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.05em;
  color: var(--apt-text-dim);
}

.job-card-title {
  font: 600 var(--apt-font-size-body-md) / 1.15 var(--apt-font-serif);
  color: var(--apt-text-strong);
  margin: 0;
  min-width: 0;
}

.job-card-gate {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--apt-radius-r1);
  border: 1px solid;
  flex-shrink: 0;
  white-space: nowrap;
}

/* Meta */
.job-card-meta {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  flex-wrap: wrap;
}

.job-card-pilot {
  font: 500 var(--apt-font-size-body-sm) / 1 var(--apt-font-sans);
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.job-card-divider {
  color: var(--apt-text-dim);
}

.job-card-discipline,
.job-card-location {
  font: 500 var(--apt-font-size-sm-3) / 1 var(--apt-font-mono);
  color: var(--apt-text-muted);
}

/* Evidence */
.job-card-evidence {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  flex-wrap: wrap;
}

.job-card-evidence-label {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.job-card-evidence-chip {
  font: 500 var(--apt-font-size-sm-3) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--apt-radius-r1);
  border: 1px solid;
  white-space: nowrap;
}

.job-card-evidence-layer {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  padding: 1px 6px;
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r0);
  background: var(--apt-surface-default);
}

/* Details */
.job-card-details {
  display: flex;
  gap: var(--apt-spacing-s6);
  flex-wrap: wrap;
}

.job-card-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.job-card-detail-label {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.job-card-detail-value {
  font: 500 var(--apt-font-size-body-sm) / 1.2 var(--apt-font-sans);
  color: var(--apt-text-body);
}

/* Actions */
.job-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s4);
  margin-top: var(--apt-spacing-s2);
}

.job-card-advance {
  display: inline-flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  padding: var(--apt-spacing-s3) var(--apt-spacing-s6);
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-default);
  color: var(--apt-text-body);
  font: 500 var(--apt-font-size-sm-3) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--apt-animation-fast);
}

.job-card-advance:hover:not(:disabled) {
  border-color: var(--line-strong);
  background: var(--apt-surface-raised);
  color: var(--apt-text-strong);
}

.job-card-advance:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.job-card-advance--gated {
  border-style: dashed;
  border-color: var(--apt-state-risk);
  color: var(--apt-state-risk);
}

.job-card-advance-text {
  font: inherit;
  color: inherit;
}

.job-card-terminal {
  font: 500 var(--apt-font-size-sm-3) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--apt-text-muted);
}

/* Approval chip — dsh ui-approval pattern */
.approval-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  padding: 3px 8px;
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-default);
  margin-left: auto;
}

.approval-chip-label {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.approval-chip-authority {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

/* Message-quote transcript — dsh ui-conversation / message-quotes pattern */
.job-card-transcript {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s3);
  margin-top: var(--apt-spacing-s4);
  padding-top: var(--apt-spacing-s4);
  border-top: 1px solid var(--line);
}

.job-card-transcript-head {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.job-card-transcript-list {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s3);
  margin: 0;
  padding: 0;
}

.message-quote {
  padding: 8px 10px;
  border-radius: var(--apt-radius-r2);
  border: 1px solid var(--line);
  position: relative;
}

.message-quote--receipt::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: var(--apt-radius-r2) 0 0 var(--apt-radius-r2);
  background: var(--apt-standing-verified, var(--apt-color-forest-500));
}

.message-quote-role {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  display: block;
  margin-bottom: 3px;
}

.message-quote-body {
  margin: 0;
  font: var(--apt-font-size-body-sm) / 1.45 var(--apt-font-sans);
  color: var(--apt-text-body);
}

.message-quote-meta {
  display: block;
  margin-top: 3px;
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  color: var(--apt-text-dim);
}

/* Empty state */
.job-controller-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--apt-spacing-s16);
  color: var(--apt-text-muted);
  font: 500 var(--apt-font-size-body-sm) / 1.4 var(--apt-font-sans);
  text-align: center;
}

.job-controller-empty-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>