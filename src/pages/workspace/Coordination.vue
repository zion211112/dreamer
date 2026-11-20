<script setup lang="ts">
/**
 * APT-LABS — Coordination Workbench (the transcendent view)
 *
 * One surface that composes the whole living system and lets a real person
 * drive it: who can do what (capacity), what's open, who answers it and what
 * is missing (matching), the commitments in flight, the evidence that keeps
 * it trustworthy, and the audit trail. Every control drives the real
 * coordination store — no mock data.
 */
import { onMounted, ref } from 'vue';
import { useCoordinationStore } from '@/stores/coordination';
import type { RecordEnvelope } from '@/lib/record-envelope';

const store = useCoordinationStore();

// Canonical type options come from the APTO ontology (src/lib/ontology/types.ts).
const ACTOR_TYPES = ['individual', 'company', 'startup', 'institution', 'cooperative', 'ngo', 'school', 'crew', 'other'];
const CAPABILITY_TYPES = ['Skill', 'Competence', 'Qualification', 'Experience', 'TechnicalCapability', 'OperationalCapacity', 'Availability'];
const ASSET_TYPES = ['Asset', 'Facility', 'Equipment', 'Material', 'Inventory', 'Land', 'Energy', 'Capital', 'Dataset', 'IP'];
const EVIDENCE_TYPES = ['Document', 'Observation', 'Measurement', 'TestResult', 'Attestation', 'Verification'];

// --- Onboard a provider ---
const onName = ref('');
const onType = ref('individual');
const onCapName = ref('');
const onCapType = ref('Skill');
const onAssetName = ref('');
const onAssetType = ref('Equipment');

function submitOnboard(): void {
  if (!onName.value.trim()) return;
  store.onboardProvider({
    type: onType.value as (typeof ACTOR_TYPES)[number],
    name: onName.value.trim(),
    capability: onCapName.value.trim() ? { name: onCapName.value.trim(), type: onCapType.value } : undefined,
    asset: onAssetName.value.trim() ? { name: onAssetName.value.trim(), type: onAssetType.value } : undefined,
  });
  onName.value = '';
  onCapName.value = '';
  onAssetName.value = '';
}

// --- Post a need ---
const needText = ref('');
const needRequires = ref<string[]>([]);
function toggleRequires(cat: string): void {
  needRequires.value = needRequires.value.includes(cat)
    ? needRequires.value.filter((c) => c !== cat)
    : [...needRequires.value, cat];
}
function submitNeed(): void {
  if (!needText.value.trim() || needRequires.value.length === 0) return;
  store.postNeed({ need: needText.value.trim(), requires: needRequires.value });
  needText.value = '';
  needRequires.value = [];
}

// --- Evidence ---
const evSummary = ref('');
const evType = ref('Document');
const evUri = ref('');
function submitEvidence(): void {
  if (!evSummary.value.trim()) return;
  store.addEvidence({ summary: evSummary.value.trim(), type: evType.value, sourceUri: evUri.value.trim() || undefined });
  evSummary.value = '';
  evUri.value = '';
}

// --- Fulfil commitments (inline) ---
const outcomes = ref<Record<string, string>>({});
const attachEv = ref<Record<string, string>>({});
function doFulfil(id: string): void {
  const text = (outcomes.value[id] ?? '').trim();
  if (!text) return;
  store.fulfilCommitment(id, text, attachEv.value[id] || undefined);
  outcomes.value[id] = '';
  attachEv.value[id] = '';
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function actionLabel(action: string): string {
  return action.replace(/\.([^.]+)$/, ' · $1');
}

// --- Knowledge (distilled from accepted outcomes) ---
const knowReady = ref(false);
function knowledgeTitle(rec: RecordEnvelope): string {
  return (rec.data.title as string | undefined) ?? rec.type;
}
function knowledgeStatus(rec: RecordEnvelope): string {
  return (rec.data.status as string | undefined) ?? 'proposed';
}
onMounted(async () => {
  await store.loadKnowledge();
  knowReady.value = true;
});
</script>

<template>
  <div class="coord" data-module="coordination">
    <header class="coord-head">
      <div class="coord-head-text">
        <h1 class="coord-title">Coordination</h1>
        <p class="coord-lede">
          One living loop: who can do what, what is open, what is missing,
          and what we have kept. Drive it from here.
        </p>
      </div>
      <span class="coord-account" :title="'Acting as ' + store.accountId">
        {{ store.accountId }}
      </span>
    </header>

    <!-- The state of the loop at a glance (visualization, not a record dump) -->
    <section class="coord-metrics" aria-label="System state">
      <div class="coord-metric">
        <span class="coord-metric-value">{{ store.openNeeds.length }}</span>
        <span class="coord-metric-label">Open needs</span>
      </div>
      <div class="coord-metric">
        <span class="coord-metric-value">{{ store.providers.length }}</span>
        <span class="coord-metric-label">Providers</span>
      </div>
      <div class="coord-metric" :class="{ 'coord-metric--gap': store.gaps.length > 0 }">
        <span class="coord-metric-value">{{ store.gaps.length }}</span>
        <span class="coord-metric-label">Gaps to fill</span>
      </div>
      <div class="coord-metric">
        <span class="coord-metric-value">{{ store.inFlight.length }}</span>
        <span class="coord-metric-label">In flight</span>
      </div>
      <div class="coord-metric">
        <span class="coord-metric-value">{{ store.evidenceVerified }}/{{ store.evidence.length }}</span>
        <span class="coord-metric-label">Evidence verified</span>
      </div>
    </section>

    <div class="coord-grid">
      <!-- THE LOOP: open needs (with matching) → in flight → capacity -->
      <div class="coord-loop">
        <section class="coord-sec" aria-labelledby="open-needs-h">
          <h2 id="open-needs-h" class="coord-sec-title">Open needs</h2>

          <p v-if="store.openNeeds.length === 0" class="coord-empty">
            No open needs. The board is clear — post one on the right.
          </p>

          <article
            v-for="n in store.openNeeds"
            :key="n.needId"
            class="need-card"
            :class="{ 'need-card--gap': n.isMissing }"
          >
            <div class="need-card-top">
              <h3 class="need-title">{{ n.need }}</h3>
              <div class="chips">
                <span v-for="cat in n.requires" :key="cat" class="chip">{{ cat }}</span>
              </div>
            </div>

            <div v-if="n.matches.length" class="need-matches">
              <p class="need-matches-label">
                {{ n.matches.length }} provider{{ n.matches.length === 1 ? '' : 's' }} can answer
              </p>
              <div v-for="m in n.matches" :key="m.providerActorId" class="need-match-row">
                <div class="need-match-id">
                  <strong>{{ m.providerName }}</strong>
                  <span class="chip chip--soft">via {{ m.matchedOn.join(', ') }}</span>
                </div>
                <button
                  class="coord-btn coord-btn--sm"
                  type="button"
                  @click="store.assignNeed(n.needId, m.providerActorId)"
                >
                  Assign
                </button>
              </div>
            </div>

            <p v-else class="gap-line">
              No provider offers <strong>{{ n.requires.join(' or ') }}</strong> yet.
              Post the capacity to close this gap.
            </p>
          </article>
        </section>

        <section class="coord-sec" aria-labelledby="inflight-h">
          <h2 id="inflight-h" class="coord-sec-title">In flight</h2>

          <p v-if="store.inFlight.length === 0" class="coord-empty">Nothing in flight.</p>

          <div v-for="c in store.inFlight" :key="c.id" class="commit-row">
            <div class="commit-id">
              <strong>{{ c.need }}</strong>
              <span class="chip chip--soft">→ {{ c.providerName }}</span>
            </div>
            <div class="commit-actions">
              <input
                :id="'out-' + c.id"
                v-model="outcomes[c.id]"
                class="coord-input coord-input--sm"
                type="text"
                placeholder="Record the outcome"
                aria-label="Outcome for " + c.need
              />
              <select
                v-model="attachEv[c.id]"
                class="coord-input coord-input--sm coord-select"
                aria-label="Attach evidence to outcome"
              >
                <option value="">No evidence</option>
                <option v-for="e in store.evidence" :key="e.id" :value="e.id">
                  {{ e.data.summary as string }}
                </option>
              </select>
              <button
                class="coord-btn coord-btn--sm"
                type="button"
                :disabled="!(outcomes[c.id] ?? '').trim()"
                @click="doFulfil(c.id)"
              >
                Fulfil
              </button>
            </div>
          </div>
        </section>

        <section class="coord-sec" aria-labelledby="capacity-h">
          <h2 id="capacity-h" class="coord-sec-title">Capacity</h2>

          <p v-if="store.profiles.length === 0" class="coord-empty">
            No providers registered. Onboard one on the right to start matching.
          </p>

          <div v-for="p in store.profiles" :key="p.actor.id" class="cap-row">
            <div class="cap-id">
              <strong>{{ p.actor.name }}</strong>
              <span class="chip chip--soft">{{ p.actor.type }}</span>
            </div>
            <div class="chips">
              <span v-for="cap in p.capabilities" :key="cap.id" class="chip chip--cap">
                {{ (cap.data.name as string) ?? cap.type }}
              </span>
            </div>
          </div>
        </section>
      </div>

      <!-- ACTIONS + TRAIL -->
      <div class="coord-actions">
        <section class="coord-sec coord-card" aria-labelledby="onboard-h">
          <h2 id="onboard-h" class="coord-sec-title">Onboard a provider</h2>
          <form class="coord-form" @submit.prevent="submitOnboard">
            <label class="coord-field">
              <span class="coord-field-label">Name</span>
              <input v-model="onName" class="coord-input" type="text" placeholder="Kibera Welding Co-op" />
            </label>
            <label class="coord-field">
              <span class="coord-field-label">Type</span>
              <select v-model="onType" class="coord-input coord-select">
                <option v-for="t in ACTOR_TYPES" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>
            <div class="coord-field-pair">
              <label class="coord-field">
                <span class="coord-field-label">Can do</span>
                <input v-model="onCapName" class="coord-input" type="text" placeholder="Welding" />
              </label>
              <label class="coord-field">
                <span class="coord-field-label">Capability</span>
                <select v-model="onCapType" class="coord-input coord-select">
                  <option v-for="t in CAPABILITY_TYPES" :key="t" :value="t">{{ t }}</option>
                </select>
              </label>
            </div>
            <div class="coord-field-pair">
              <label class="coord-field">
                <span class="coord-field-label">Holds</span>
                <input v-model="onAssetName" class="coord-input" type="text" placeholder="Welding bay" />
              </label>
              <label class="coord-field">
                <span class="coord-field-label">Asset</span>
                <select v-model="onAssetType" class="coord-input coord-select">
                  <option v-for="t in ASSET_TYPES" :key="t" :value="t">{{ t }}</option>
                </select>
              </label>
            </div>
            <button class="coord-btn" type="submit" :disabled="!onName.trim()">
              Register provider
            </button>
          </form>
        </section>

        <section class="coord-sec coord-card" aria-labelledby="postneed-h">
          <h2 id="postneed-h" class="coord-sec-title">Post a need</h2>
          <form class="coord-form" @submit.prevent="submitNeed">
            <label class="coord-field">
              <span class="coord-field-label">Need</span>
              <input v-model="needText" class="coord-input" type="text" placeholder="Fence repair around the school" />
            </label>
            <div class="coord-field">
              <span class="coord-field-label">Needs capability</span>
              <div class="chip-toggle">
                <button
                  v-for="cat in CAPABILITY_TYPES"
                  :key="cat"
                  class="chip chip--toggle"
                  :class="{ 'chip--on': needRequires.includes(cat) }"
                  type="button"
                  @click="toggleRequires(cat)"
                >
                  {{ cat }}
                </button>
              </div>
            </div>
            <button
              class="coord-btn"
              type="submit"
              :disabled="!needText.trim() || needRequires.length === 0"
            >
              Post need
            </button>
          </form>
        </section>

        <section class="coord-sec coord-card" aria-labelledby="evidence-h">
          <h2 id="evidence-h" class="coord-sec-title">Evidence</h2>
          <form class="coord-form" @submit.prevent="submitEvidence">
            <label class="coord-field">
              <span class="coord-field-label">Summary</span>
              <input v-model="evSummary" class="coord-input" type="text" placeholder="Signed completion certificate" />
            </label>
            <div class="coord-field-pair">
              <label class="coord-field">
                <span class="coord-field-label">Kind</span>
                <select v-model="evType" class="coord-input coord-select">
                  <option v-for="t in EVIDENCE_TYPES" :key="t" :value="t">{{ t }}</option>
                </select>
              </label>
              <label class="coord-field">
                <span class="coord-field-label">Source (optional)</span>
                <input v-model="evUri" class="coord-input" type="text" placeholder="oss://apt-labs/…" />
              </label>
            </div>
            <button class="coord-btn" type="submit" :disabled="!evSummary.trim()">
              Add evidence
            </button>
          </form>

          <ul class="ev-list">
            <li v-if="store.evidence.length === 0" class="coord-empty coord-empty--plain">
              No evidence recorded yet.
            </li>
            <li v-for="e in store.evidence" :key="e.id" class="ev-row">
              <div class="ev-id">
                <strong>{{ e.data.summary as string }}</strong>
                <span class="chip chip--soft">{{ e.type }}</span>
              </div>
              <span
                class="ev-status"
                :class="e.data.status === 'verified' ? 'ev-status--verified' : 'ev-status--open'"
              >
                {{ (e.data.status as string) ?? 'unverified' }}
              </span>
              <button
                v-if="(e.data.status as string) !== 'verified'"
                class="coord-btn coord-btn--sm coord-btn--ghost"
                type="button"
                @click="store.verifyEvidence(e.id)"
              >
                Verify
              </button>
            </li>
          </ul>
        </section>

        <section class="coord-sec coord-card" aria-labelledby="knowledge-h">
          <h2 id="knowledge-h" class="coord-sec-title">Knowledge</h2>
          <p class="coord-lede coord-lede--sec">
            Distilled from accepted outcomes. Confirm a record to make it trusted knowledge.
          </p>

          <div v-if="knowReady">
            <h3 class="coord-sub">Accepted outcomes</h3>
            <ul class="ev-list">
              <li v-if="store.outcomes.length === 0" class="coord-empty coord-empty--plain">
                No accepted outcomes yet.
              </li>
              <li v-for="o in store.outcomes" :key="o.id" class="ev-row">
                <div class="ev-id">
                  <strong>{{ o.title }}</strong>
                  <span class="chip chip--soft">accepted by {{ o.acceptedBy }}</span>
                </div>
                <span v-if="o.distilled" class="ev-status ev-status--verified">Distilled</span>
                <button
                  v-else
                  class="coord-btn coord-btn--sm coord-btn--ghost"
                  type="button"
                  @click="store.distillOutcome(o.id)"
                >
                  Distill
                </button>
              </li>
            </ul>

            <h3 class="coord-sub">Distilled knowledge</h3>
            <ul class="ev-list">
              <li v-if="store.knowledge.length === 0" class="coord-empty coord-empty--plain">
                Nothing distilled yet.
              </li>
              <li v-for="k in store.knowledge" :key="k.id" class="ev-row">
                <div class="ev-id">
                  <strong>{{ knowledgeTitle(k) }}</strong>
                  <span class="chip chip--soft">{{ k.type }}</span>
                </div>
                <span
                  class="ev-status"
                  :class="knowledgeStatus(k) === 'confirmed' ? 'ev-status--verified' : 'ev-status--open'"
                >
                  {{ knowledgeStatus(k) }}
                </span>
                <button
                  v-if="knowledgeStatus(k) !== 'confirmed'"
                  class="coord-btn coord-btn--sm coord-btn--ghost"
                  type="button"
                  @click="store.confirmKnowledge(k.id)"
                >
                  Confirm
                </button>
              </li>
            </ul>
          </div>
        </section>

        <section class="coord-sec" aria-labelledby="audit-h">
          <h2 id="audit-h" class="coord-sec-title">Audit trail</h2>
          <ul class="audit-list">
            <li v-if="store.audit.length === 0" class="coord-empty coord-empty--plain">
              No activity yet.
            </li>
            <li v-for="ev in store.audit" :key="ev.id" class="audit-row">
              <span class="audit-time">{{ timeLabel(ev.timestamp) }}</span>
              <span class="audit-action">{{ actionLabel(ev.action) }}</span>
              <span class="audit-detail">{{ ev.details.name ?? ev.details.type ?? ev.details.reason ?? '' }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coord {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  min-height: 100%;
  padding: var(--apt-spacing-s12);
}

/* Header */
.coord-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--apt-spacing-s8);
  margin-bottom: var(--apt-spacing-s10);
}

.coord-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
}

.coord-lede {
  margin: var(--apt-spacing-s3) 0 0;
  font-size: var(--apt-font-size-body-md);
  color: var(--apt-text-muted);
  max-width: 48ch;
  line-height: var(--apt-line-height-relaxed);
}

.coord-account {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  padding: var(--apt-spacing-s2) var(--apt-spacing-s4);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

/* Metrics band */
.coord-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s12);
}

.coord-metric {
  background: var(--apt-surface-page);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r3);
  box-shadow: var(--apt-shadow-sh1);
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
}

.coord-metric-value {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-body);
  line-height: 1;
}

.coord-metric-label {
  font-size: var(--apt-font-size-sm-3);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
}

.coord-metric--gap {
  border-color: var(--apt-state-caution-wash);
  background: var(--apt-state-caution-wash);
}
.coord-metric--gap .coord-metric-value { color: var(--apt-state-caution); }

/* Two-column layout */
.coord-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
  gap: var(--apt-spacing-s12);
  align-items: start;
}

.coord-loop,
.coord-actions {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s12);
}

/* Sections */
.coord-sec { }

.coord-sec-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6);
  color: var(--apt-text-body);
}

.coord-card {
  background: var(--apt-surface-page);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r3);
  box-shadow: var(--apt-shadow-sh1);
  padding: var(--apt-spacing-s10);
}

.coord-empty {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}
.coord-empty--plain { list-style: none; }

.coord-lede--sec { margin: 0; max-width: 56ch; }

.coord-sub {
  font-size: var(--apt-font-size-sm-3);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
  margin: var(--apt-spacing-s8) 0 var(--apt-spacing-s3);
}

/* Chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--apt-spacing-s2);
}

.chip {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  letter-spacing: 0.04em;
  color: var(--apt-text-muted);
  background: var(--apt-color-neutral-n50);
  border-radius: var(--apt-radius-r10);
  padding: 2px var(--apt-spacing-s3);
}
.chip--soft { background: transparent; color: var(--apt-text-dim); }
.chip--cap { background: var(--apt-color-ramp-stewardship-50); color: var(--apt-pillar-stewardship); }

.chip-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: var(--apt-spacing-s2);
}
.chip--toggle {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  letter-spacing: 0.04em;
  color: var(--apt-text-muted);
  background: var(--apt-color-neutral-n0);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r10);
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--apt-spacing-s4);
  cursor: pointer;
  transition: all var(--apt-animation-fast);
}
.chip--on {
  background: var(--apt-color-ramp-stewardship-50);
  border-color: var(--apt-module-accent, var(--apt-color-brand-primary));
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

/* Open needs / matching */
.need-card {
  border: 1px solid var(--apt-border);
  border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-page);
  padding: var(--apt-spacing-s8);
  margin-bottom: var(--apt-spacing-s6);
}
.need-card--gap {
  border-left-color: var(--apt-state-caution);
  background: var(--apt-state-caution-wash);
}

.need-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s4);
  margin-bottom: var(--apt-spacing-s4);
}
.need-title {
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
}

.need-matches { margin-top: var(--apt-spacing-s4); }
.need-matches-label {
  font-size: var(--apt-font-size-sm-3);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
  margin: 0 0 var(--apt-spacing-s3);
}
.need-match-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-spacing-s3) 0;
  border-top: 1px solid var(--apt-border-faint);
}
.need-match-id { display: flex; align-items: center; gap: var(--apt-spacing-s3); }
.need-match-id strong { font-weight: var(--apt-font-weight-medium); }

.gap-line {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-state-caution);
  margin: 0;
}

/* Commitments */
.commit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  padding: var(--apt-spacing-s6) 0;
  border-top: 1px solid var(--apt-border-faint);
}
.commit-id { display: flex; flex-direction: column; gap: var(--apt-spacing-s2); min-width: 0; }
.commit-actions {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  flex-shrink: 0;
}

/* Capacity */
.cap-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  padding: var(--apt-spacing-s5) 0;
  border-top: 1px solid var(--apt-border-faint);
}
.cap-row:first-of-type { border-top: none; }
.cap-id { display: flex; align-items: center; gap: var(--apt-spacing-s3); }

/* Forms */
.coord-form { display: flex; flex-direction: column; gap: var(--apt-spacing-s6); }
.coord-field { display: flex; flex-direction: column; gap: var(--apt-spacing-s2); flex: 1; }
.coord-field-pair { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--apt-spacing-s6); }
.coord-field-label {
  font-size: var(--apt-font-size-sm-3);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
}

.coord-input {
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-body-md);
  color: var(--apt-text-body);
  background: var(--apt-color-neutral-n0);
  border: 1px solid var(--apt-input-border);
  border-radius: var(--apt-radius-r1);
  padding: var(--apt-spacing-s5) var(--apt-spacing-s6);
  width: 100%;
  transition: border-color var(--apt-animation-fast);
}
.coord-input:focus {
  outline: none;
  border-color: var(--apt-input-focus-border);
  box-shadow: 0 0 0 3px var(--apt-color-ramp-stewardship-50);
}
.coord-input::placeholder { color: var(--apt-input-placeholder); }
.coord-input--sm { padding: var(--apt-spacing-s3) var(--apt-spacing-s4); font-size: var(--apt-font-size-body-sm); }
.coord-select { appearance: none; background-image: linear-gradient(45deg, transparent 50%, currentColor 50%); background-repeat: no-repeat; background-position: right 12px center; background-size: 8px 8px; padding-right: 28px; }

/* Buttons */
.coord-btn {
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-button-primary-text);
  background: var(--apt-button-primary-bg);
  border: 1px solid var(--apt-button-primary-border);
  border-radius: var(--apt-button-radius);
  padding: var(--apt-button-padding-md);
  cursor: pointer;
  transition: all var(--apt-animation-fast);
  align-self: flex-start;
}
.coord-btn:hover:not(:disabled) { background: var(--apt-button-primary-hover-bg); }
.coord-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.coord-btn:focus-visible { outline: 2px solid var(--apt-input-focus-border); outline-offset: 2px; }

.coord-btn--sm {
  font-size: var(--apt-font-size-sm-3);
  padding: var(--apt-spacing-s3) var(--apt-spacing-s5);
  align-self: center;
}

.coord-btn--ghost {
  background: transparent;
  color: var(--apt-text-muted);
  border-color: var(--apt-border);
}
.coord-btn--ghost:hover:not(:disabled) {
  background: var(--apt-color-neutral-n50);
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

/* Evidence list */
.ev-list { list-style: none; margin: var(--apt-spacing-s8) 0 0; padding: 0; }
.ev-row {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-spacing-s4) 0;
  border-top: 1px solid var(--apt-border-faint);
}
.ev-id { display: flex; align-items: center; gap: var(--apt-spacing-s3); flex: 1; min-width: 0; flex-wrap: wrap; }
.ev-status {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: var(--apt-radius-r1);
  padding: 2px var(--apt-spacing-s3);
}
.ev-status--verified { background: var(--apt-color-ramp-stewardship-50); color: var(--apt-pillar-stewardship); }
.ev-status--open { background: var(--apt-color-neutral-n50); color: var(--apt-text-dim); }

/* Audit trail */
.audit-list { list-style: none; margin: 0; padding: 0; }
.audit-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--apt-spacing-s4);
  align-items: center;
  padding: var(--apt-spacing-s3) 0;
  border-top: 1px solid var(--apt-border-faint);
  font-size: var(--apt-font-size-body-sm);
}
.audit-time {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
}
.audit-action { color: var(--apt-text-body); font-weight: var(--apt-font-weight-medium); }
.audit-detail {
  color: var(--apt-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 14ch;
}

/* Responsive */
@media (max-width: 1100px) {
  .coord-grid { grid-template-columns: minmax(0, 1fr); }
  .coord-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .coord-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .coord-head { flex-direction: column; align-items: flex-start; }
  .commit-row, .need-card-top, .cap-row { flex-direction: column; align-items: flex-start; }
  .coord-field-pair { grid-template-columns: minmax(0, 1fr); }
  .commit-actions { flex-wrap: wrap; }

  /* Touch targets: keep every control in this surface at 44px on phones */
  .coord-input, .coord-input--sm { min-height: 44px; }
  .coord-btn, .coord-btn--sm { min-height: 44px; }
  .chip--toggle { min-height: 44px; padding: var(--apt-spacing-s4) var(--apt-spacing-s5); }
}
</style>
