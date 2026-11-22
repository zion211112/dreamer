<script setup lang="ts">
/**
 * APT-LABS — User Dashboard (personal entry point).
 *
 * Shows what *this* actor needs to do right now: active commitments,
 * pending evidence, recent outcomes, and quick actions. Personal,
 * not system-wide — unlike WorkspaceOverview which shows the whole board.
 *
 * All data is real from the coordination store — no mock arrays.
 */
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useCoordinationStore, type CommitmentRow, type KnowledgeOutcome } from '@/stores/coordination';
import { useAuth } from '@/lib/auth/hooks';
import type { RecordEnvelope } from '@/lib/record-envelope';

const store = useCoordinationStore();
const { user, profile, loading: authLoading } = useAuth();

const activeTab = ref<'commitments' | 'evidence' | 'outcomes' | 'quick'>('commitments');

onMounted(() => {
  store.refresh();
});

// ---------------------------------------------------------------------------
// Personal commitments — what this actor has accepted and is delivering
// ---------------------------------------------------------------------------
const myCommitments = computed<CommitmentRow[]>(() =>
  store.inFlight.filter((c) => c.status === 'accepted')
);

// ---------------------------------------------------------------------------
// Evidence awaiting action — unverified items this actor can verify
// ---------------------------------------------------------------------------
const pendingEvidence = computed<RecordEnvelope[]>(() => {
  const evidence = store.evidenceList();
  return evidence.filter((e) => {
    const d = e.data as Record<string, unknown>;
    return d.status !== 'verified' && d.status !== 'confirmed';
  });
});

// ---------------------------------------------------------------------------
// Recent outcomes — what has been accepted and delivered
// ---------------------------------------------------------------------------
const recentOutcomes = computed<KnowledgeOutcome[]>(() =>
  store.outcomes.slice(0, 5)
);

// ---------------------------------------------------------------------------
// Personal metrics
// ---------------------------------------------------------------------------
const metrics = computed(() => ({
  activeCommitments: myCommitments.value.length,
  pendingEvidence: pendingEvidence.value.length,
  recentOutcomes: recentOutcomes.value.length,
  totalValueKes: recentOutcomes.value.reduce((s, _o) => s, 0), // placeholder; value lives in Value module
}));

onMounted(() => {
  store.refresh();
});
</script>

<template>
  <div class="dashboard" data-module="dashboard">
    <div class="dashboard-body">
      <main class="dashboard-main">
        <!-- Page head -->
        <div class="dashboard-head">
          <div class="dashboard-heading">
            <p class="dashboard-eyebrow">WORKSPACE · PERSONAL</p>
            <h1 class="dashboard-h1">Your dashboard</h1>
            <p class="dashboard-sub">
              What you need to do now — active commitments, pending evidence,
              and recent outcomes. Everything else is in WorkspaceOverview.
            </p>
          </div>
          <div class="dashboard-metrics">
            <div class="dashboard-metric">
              <div class="dashboard-metric-value">{{ metrics.activeCommitments }}</div>
              <div class="dashboard-metric-label">Active commitments</div>
            </div>
            <div class="dashboard-metric">
              <div class="dashboard-metric-value">{{ metrics.pendingEvidence }}</div>
              <div class="dashboard-metric-label">Evidence awaiting action</div>
            </div>
            <div class="dashboard-metric">
              <div class="dashboard-metric-value">{{ metrics.recentOutcomes }}</div>
              <div class="dashboard-metric-label">Recent outcomes</div>
            </div>
          </div>
        </div>

        <!-- Tabbed views -->
        <div class="dashboard-tabs">
          <button
            v-for="t in [['commitments','Commitments'], ['evidence','Evidence'], ['outcomes','Outcomes'], ['quick','Quick']] as [id, label]"
            :key="id"
            :class="{ 'dashboard-tab--on': activeTab === id }"
            class="dashboard-tab"
            @click="activeTab = id"
          >
            {{ label }}
          </button>
        </div>

        <!-- Commitments tab -->
        <section v-if="activeTab === 'commitments'" class="dashboard-section">
          <h2 class="dashboard-section-title">Active commitments</h2>
          <p class="dashboard-section-sub">Intentions you've accepted — deliveries in progress.</p>

          <div v-if="myCommitments.length === 0" class="dashboard-quiet">
            <p class="dashboard-quiet-line">
              No active commitments right now. Accept an open inquiry in
              <RouterLink to="/workspace/commons" class="dashboard-quiet-link">Commons</RouterLink>,
              and it appears here.
            </p>
          </div>

          <div v-else class="dashboard-list">
            <article v-for="c in myCommitments" :key="c.id" class="dashboard-card">
              <div class="dashboard-card-copy">
                <h3 class="dashboard-card-title">{{ c.need }}</h3>
                <p class="dashboard-card-context">
                  Accepted by <span class="dashboard-card-actor">{{ c.providerName }}</span>
                  · status: <span class="dashboard-card-status">{{ c.status }}</span>
                </p>
              </div>
              <RouterLink :to="`/workspace/workbench`" class="dashboard-card-action">
                Open in Workbench
                <span class="dashboard-card-arrow" aria-hidden="true">→</span>
              </RouterLink>
            </article>
          </div>
        </section>

        <!-- Evidence tab -->
        <section v-else-if="activeTab === 'evidence'" class="dashboard-section">
          <h2 class="dashboard-section-title">Evidence awaiting action</h2>
          <p class="dashboard-section-sub">Items that need verification before they stand on the roll.</p>

          <div v-if="pendingEvidence.length === 0" class="dashboard-quiet">
            <p class="dashboard-quiet-line">
              No evidence awaiting action. Everything submitted is either
              verified or confirmed.
            </p>
          </div>

          <div v-else class="dashboard-list">
            <article v-for="e in pendingEvidence" :key="e.id" class="dashboard-card">
              <div class="dashboard-card-copy">
                <h3 class="dashboard-card-title">{{ ((e.data as { title?: string }).title ?? e.type) as string }}</h3>
                <p class="dashboard-card-context">
                  Registered v{{ e.version }} · {{ e.updatedAt.slice(0, 10) }}
                </p>
              </div>
              <RouterLink to="/workspace/records/roll" class="dashboard-card-action">
                View on Roll
                <span class="dashboard-card-arrow" aria-hidden="true">→</span>
              </RouterLink>
            </article>
          </div>
        </section>

        <!-- Outcomes tab -->
        <section v-else-if="activeTab === 'outcomes'" class="dashboard-section">
          <h2 class="dashboard-section-title">Recent outcomes</h2>
          <p class="dashboard-section-sub">Accepted and delivered — distributed through the roll.</p>

          <div v-if="recentOutcomes.length === 0" class="dashboard-quiet">
            <p class="dashboard-quiet-line">
              No accepted outcomes yet. When an undertaking is accepted and delivered,
              its outcome lands here as a brief.
            </p>
          </div>

          <div v-else class="dashboard-list">
            <article v-for="o in recentOutcomes" :key="o.id" class="dashboard-card">
              <div class="dashboard-card-copy">
                <h3 class="dashboard-card-title">{{ o.title }}</h3>
                <p class="dashboard-card-context">
                  Accepted by <span class="dashboard-card-actor">{{ o.acceptedBy }}</span>
                  <span v-if="o.distilled" class="dashboard-card-status">· Distilled</span>
                </p>
              </div>
              <RouterLink to="/workspace/records/roll" class="dashboard-card-action">
                View on Roll
                <span class="dashboard-card-arrow" aria-hidden="true">→</span>
              </RouterLink>
            </article>
          </div>
        </section>

        <!-- Quick actions tab -->
        <section v-else class="dashboard-section">
          <h2 class="dashboard-section-title">Quick actions</h2>
          <p class="dashboard-section-sub">Verbs that move work forward — governed, not chat.</p>

          <div class="dashboard-grid">
            <RouterLink to="/workspace/commons" class="dashboard-quick-card">
              <div class="dashboard-quick-icon">←</div>
              <div class="dashboard-quick-copy">
                <h3 class="dashboard-quick-title">Start an inquiry</h3>
                <p class="dashboard-quick-lede">Post a need or offer — it becomes discoverable immediately.</p>
              </div>
            </RouterLink>

            <RouterLink to="/workspace/workbench" class="dashboard-quick-card">
              <div class="dashboard-quick-icon">▸</div>
              <div class="dashboard-quick-copy">
                <h3 class="dashboard-quick-title">Open Workbench</h3>
                <p class="dashboard-quick-lede">Scope, assemble, and coordinate productive work across pilot lanes.</p>
              </div>
            </RouterLink>

            <RouterLink to="/workspace/records" class="dashboard-quick-card">
              <div class="dashboard-quick-icon">∿</div>
              <div class="dashboard-quick-copy">
                <h3 class="dashboard-quick-title">Review the Roll</h3>
                <p class="dashboard-quick-lede">Inspect canon, annals, and the immutable roll of evidence.</p>
              </div>
            </RouterLink>

            <RouterLink to="/workspace/intelligence" class="dashboard-quick-card">
              <div class="dashboard-quick-icon">⋄</div>
              <div class="dashboard-quick-copy">
                <h3 class="dashboard-quick-title">Run Intelligence</h3>
                <p class="dashboard-quick-lede">Matching, forecasting, and agent dispatch for your open needs.</p>
              </div>
            </RouterLink>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json */

.dashboard {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.dashboard-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.dashboard-main {
  flex: 1;
  min-width: 0;
  padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22);
  max-width: 1180px;
}

/* Page head */
.dashboard-head {
  margin-bottom: var(--apt-spacing-s8);
}

.dashboard-eyebrow {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.12em;
  color: var(--apt-text-dim);
  margin: 0 0 var(--apt-spacing-s2);
}

.dashboard-h1 {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-display);
  font-weight: var(--apt-font-weight-semibold);
  letter-spacing: -0.022em;
  line-height: 1.05;
  color: var(--apt-text-strong);
  margin: 0 0 var(--apt-spacing-s3);
}

.dashboard-sub {
  font-size: var(--apt-font-size-body-md);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0;
  max-width: 64ch;
}

/* Metrics */
.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--apt-border);
  margin-bottom: var(--apt-spacing-s10);
}

.dashboard-metric {
  background: var(--apt-surface-page);
  padding: var(--apt-spacing-s6);
  border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary));
}

.dashboard-metric:first-child {
  border-left: none;
  padding-left: 0;
}

.dashboard-metric-value {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-display);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  line-height: 1;
  letter-spacing: -0.01em;
}

.dashboard-metric-label {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  margin-top: var(--apt-spacing-s3);
}

/* Tabs */
.dashboard-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--apt-border);
  margin-bottom: var(--apt-spacing-s10);
}

.dashboard-tab {
  display: inline-flex;
  align-items: center;
  padding: var(--apt-spacing-s6) var(--apt-spacing-s12);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color var(--apt-animation-fast), border-color var(--apt-animation-fast);
}

.dashboard-tab:hover { color: var(--apt-text-strong); }

.dashboard-tab--on {
  color: var(--apt-color-brand-primary);
  border-bottom-color: var(--apt-color-brand-primary);
}

/* Sections */
.dashboard-section { margin-bottom: var(--apt-spacing-s14); }

.dashboard-section:first-child { margin-top: 0; }

.dashboard-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
}

.dashboard-section-sub {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s8) 0;
  line-height: var(--apt-line-height-relaxed);
  max-width: 60ch;
}

/* Quiet states */
.dashboard-quiet {
  padding: var(--apt-spacing-s6);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
}

.dashboard-quiet-line {
  margin: 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-relaxed);
  max-width: 72ch;
}

.dashboard-quiet-link {
  color: var(--apt-color-brand-primary);
  font-weight: var(--apt-font-weight-medium);
  text-decoration: none;
}

.dashboard-quiet-link:hover { text-decoration: underline; }

/* Lists */
.dashboard-list { display: flex; flex-direction: column; gap: var(--apt-spacing-s4); }

.dashboard-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
  transition: border-color var(--apt-animation-fast), box-shadow var(--apt-animation-fast);
}

.dashboard-card:hover {
  border-color: var(--apt-color-brand-primary);
  box-shadow: var(--apt-shadow-sh2);
}

.dashboard-card-copy { flex: 1; min-width: 0; }

.dashboard-card-title {
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s2);
  color: var(--apt-text-body);
  overflow-wrap: break-word;
}

.dashboard-card-context {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.dashboard-card-actor {
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
  font-weight: var(--apt-font-weight-medium);
}

.dashboard-card-status {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--apt-text-dim);
}

.dashboard-card-action {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-strong);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  padding: var(--apt-spacing-s2) var(--apt-spacing-s4);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-raised);
  white-space: nowrap;
  transition: border-color var(--apt-animation-fast);
}

.dashboard-card-action:hover {
  border-color: var(--apt-color-brand-primary);
  box-shadow: var(--apt-shadow-sh1);
}

/* Quick actions grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--apt-spacing-s4);
}

.dashboard-quick-card {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
  padding: var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-surface-page);
  text-decoration: none;
  color: var(--apt-text-body);
  transition: border-color var(--apt-animation-fast), transform var(--apt-animation-fast);
}

.dashboard-quick-card:hover {
  border-color: var(--apt-color-brand-primary);
  transform: translateY(-1px);
  box-shadow: var(--apt-shadow-sh2);
}

.dashboard-quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--apt-module-accent) 14%, var(--apt-surface-default));
  border: 1px solid color-mix(in srgb, var(--apt-module-accent) 30%, transparent);
  color: var(--apt-module-accent);
  display: grid;
  place-items: center;
  font-size: 20px;
  flex: none;
}

.dashboard-quick-copy { flex: 1; min-width: 0; }

.dashboard-quick-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s2);
  color: var(--apt-text-strong);
}

.dashboard-quick-lede {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 900px) {
  .dashboard-main { padding: var(--apt-spacing-s8); }
  .dashboard-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .dashboard-head { margin-bottom: var(--apt-spacing-s6); }
  .dashboard-tabs { overflow-x: auto; padding-bottom: var(--apt-spacing-s2); }
  .dashboard-section { margin-bottom: var(--apt-spacing-s10); }
  .dashboard-metrics { grid-template-columns: 1fr; }
}
</style>
