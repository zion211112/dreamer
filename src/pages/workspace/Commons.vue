<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { useCoordinationStore, type CommitmentRow, type KnowledgeOutcome } from '@/stores/coordination';
import type { RecordEnvelope } from '@/lib/record-envelope';
import type { NeedMatching } from '@/lib/matching';

const store = useCoordinationStore();
const route = useRoute();

// Re-read the system of record on entry, so every section reflects what the
// Workbench has posted, committed, accepted, or distilled since this store
// was created. The Roll read is async, so knowledge and briefs load beside
// the synchronous refresh.
onMounted(() => {
  store.refresh();
  void store.loadKnowledge();
  // First-use: the loop is quiet, so open the contribute form on arrival —
  // posting an inquiry is the page's first job. Arriving with
  // `?contribute=1` (the topbar's “New inquiry”) opens it regardless.
  if (route.query.contribute) contributeOpen.value = true;
  else if (!store.openNeeds.length && !store.inFlight.length) contributeOpen.value = true;
});

// --- Contribute (posting a real inquiry record) ---
const contributeOpen = ref(false);
const draftNeed = ref('');
const draftRequires = ref('');
const justPosted = ref(false);

function postInquiry(event: SubmitEvent): void {
  event.preventDefault();
  const need = draftNeed.value.trim();
  if (!need) return;
  const requires = draftRequires.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  store.postNeed({ need, requires });
  draftNeed.value = '';
  draftRequires.value = '';
  justPosted.value = true;
}

// --- Distillation (brief → knowledge) ---
const distillingId = ref<string | null>(null);

async function distill(row: KnowledgeOutcome): Promise<void> {
  if (distillingId.value) return;
  distillingId.value = row.id;
  await store.distillOutcome(row.id);
  distillingId.value = null;
}

// --- Open inquiries ---
function matchLine(need: NeedMatching): string {
  if (need.isMissing) return 'No registered provider matches this need yet.';
  const names = need.matches
    .slice(0, 2)
    .map((m) => m.providerName)
    .join(', ');
  const extra = need.matches.length > 2 ? ` +${need.matches.length - 2} more` : '';
  return `${need.matches.length} provider${need.matches.length === 1 ? '' : 's'} can answer: ${names}${extra}.`;
}

function requiresLine(need: NeedMatching): string {
  return need.requires.length
    ? `Asks for: ${need.requires.join(', ')}.`
    : 'No capability category declared, so providers cannot match it yet.';
}

// --- In flight ---
function inFlightLine(row: CommitmentRow): string {
  return `${row.providerName} accepted this commitment and is delivering.`;
}

// --- Knowledge house ---
function knowledgeTitle(rec: RecordEnvelope): string {
  return ((rec.data as { title?: string }).title ?? rec.type) as string;
}

function knowledgeSummary(rec: RecordEnvelope): string {
  return ((rec.data as { summary?: string }).summary ?? '') as string;
}

function knowledgeStatus(rec: RecordEnvelope): 'confirmed' | 'proposed' {
  return (rec.data as { status?: string }).status === 'confirmed' ? 'confirmed' : 'proposed';
}

function knowledgeProvenance(rec: RecordEnvelope): string {
  const derivedFrom = (rec.data as { derivedFrom?: string }).derivedFrom;
  if (derivedFrom) return `Distilled from roll entry ${derivedFrom.slice(-8)}`;
  return `Registered v${rec.version} · ${rec.updatedAt.slice(0, 10)}`;
}

// --- Briefs (accepted roll outcomes awaiting distillation) ---
function briefLine(row: KnowledgeOutcome): string {
  return row.distilled
    ? 'Accepted and delivered — distilled into the Knowledge house.'
    : `Accepted by ${row.acceptedBy} — awaiting distillation.`;
}
</script>

<template>
  <div class="commons-page" data-module="commons">
    <header class="commons-header">
      <div class="commons-heading">
        <h1 class="commons-title">Commons</h1>
        <span class="commons-primitive">Intention</span>
      </div>
      <p class="commons-subtitle">
        What is wanted, asked, and examined before it becomes work.
        Each section is a live read of the coordination loop — nothing here is a forecast.
      </p>
    </header>

    <!-- Open inquiries: wants and asks, matched live against registered providers. -->
    <section class="commons-section" aria-labelledby="commons-open-h">
      <div class="commons-section-head">
        <div>
          <h2 id="commons-open-h" class="commons-section-title">Open inquiries</h2>
          <p class="commons-section-sub">Wants and asks, matched live against registered providers.</p>
        </div>
        <span v-if="store.openNeeds.length" class="commons-section-count">{{ store.openNeeds.length }}</span>
      </div>

      <div v-if="store.openNeeds.length === 0" class="commons-quiet">
        <p class="commons-quiet-line">
          Nothing is open right now. Record a need in the
          <RouterLink to="/workspace/workbench" class="commons-quiet-link">Workbench</RouterLink>,
          or post one below — it appears here the moment it is registered.
        </p>
      </div>

      <div v-else class="commons-signal-list">
        <article
          v-for="need in store.openNeeds"
          :key="need.needId"
          class="commons-signal-card"
          :class="need.isMissing ? 'commons-signal--need' : 'commons-signal--offer'"
        >
          <div class="commons-signal-copy">
            <h3 class="commons-signal-title">{{ need.need }}</h3>
            <p class="commons-signal-context">{{ requiresLine(need) }}</p>
            <p class="commons-signal-context">{{ matchLine(need) }}</p>
            <div class="commons-signal-meta">
              <span class="commons-badge" :class="need.isMissing ? 'commons-badge--missing' : 'commons-badge--matched'">
                {{ need.isMissing ? 'Missing' : 'Matched' }}
              </span>
            </div>
          </div>
          <RouterLink :to="`/workspace/workbench`" class="commons-signal-action">
            Manage in Workbench
          </RouterLink>
        </article>
      </div>
    </section>

    <!-- In flight: intentions already accepted — commitments in delivery. -->
    <section class="commons-section" aria-labelledby="commons-flight-h">
      <div class="commons-section-head">
        <div>
          <h2 id="commons-flight-h" class="commons-section-title">In flight</h2>
          <p class="commons-section-sub">Intentions already accepted — commitments in delivery.</p>
        </div>
        <span v-if="store.inFlight.length" class="commons-section-count">{{ store.inFlight.length }}</span>
      </div>

      <div v-if="store.inFlight.length === 0" class="commons-quiet">
        <p class="commons-quiet-line">
          No commitment is accepted and delivering right now. When a provider accepts an open
          inquiry, it moves here.
        </p>
      </div>

      <div v-else class="commons-signal-list">
        <article
          v-for="row in store.inFlight"
          :key="row.id"
          class="commons-signal-card commons-signal--offer"
        >
          <div class="commons-signal-copy">
            <h3 class="commons-signal-title">{{ row.need }}</h3>
            <p class="commons-signal-context">{{ inFlightLine(row) }}</p>
            <div class="commons-signal-meta">
              <span class="commons-signal-institution">{{ row.providerName }}</span>
              <span class="commons-badge commons-badge--matched">In flight</span>
            </div>
          </div>
          <RouterLink :to="`/workspace/workbench`" class="commons-signal-action">
            Manage in Workbench
          </RouterLink>
        </article>
      </div>
    </section>

    <!-- Briefs: accepted outcomes from the Roll, each distillable into knowledge. -->
    <section class="commons-section" aria-labelledby="commons-briefs-h">
      <div class="commons-section-head">
        <div>
          <h2 id="commons-briefs-h" class="commons-section-title">Briefs</h2>
          <p class="commons-section-sub">Accepted outcomes from the Roll — each can be distilled into knowledge.</p>
        </div>
        <span v-if="store.outcomes.length" class="commons-section-count">{{ store.outcomes.length }}</span>
      </div>

      <div v-if="store.outcomes.length === 0" class="commons-quiet">
        <p class="commons-quiet-line">
          No accepted outcomes yet. When an undertaking is accepted and delivered, its outcome
          lands here as a brief.
        </p>
      </div>

      <div v-else class="commons-row-list">
        <article v-for="row in store.outcomes" :key="row.id" class="commons-row">
          <div class="commons-row-main">
            <h3 class="commons-row-title">{{ row.title }}</h3>
            <p class="commons-row-sub">{{ briefLine(row) }}</p>
          </div>
          <div class="commons-row-side">
            <button
              v-if="!row.distilled"
              class="commons-btn commons-btn--ghost"
              type="button"
              :disabled="distillingId !== null"
              @click="void distill(row)"
            >
              {{ distillingId === row.id ? 'Distilling…' : 'Distill' }}
            </button>
            <span v-else class="commons-badge commons-badge--confirmed">Distilled</span>
          </div>
        </article>
      </div>
    </section>

    <!-- Knowledge house: what has been distilled — versioned, attributed, confirmed by transition. -->
    <section class="commons-section" aria-labelledby="commons-knowledge-h">
      <div class="commons-section-head">
        <div>
          <h2 id="commons-knowledge-h" class="commons-section-title">Knowledge house</h2>
          <p class="commons-section-sub">What has been distilled — versioned, attributed, confirmed by transition.</p>
        </div>
        <span v-if="store.knowledge.length" class="commons-section-count">{{ store.knowledge.length }}</span>
      </div>

      <div v-if="store.knowledge.length === 0" class="commons-quiet">
        <p class="commons-quiet-line">
          Nothing distilled yet. Distill a brief above and it is registered here as versioned
          knowledge.
        </p>
      </div>

      <div v-else class="commons-row-list">
        <article v-for="rec in store.knowledge" :key="rec.id" class="commons-row">
          <div class="commons-row-main">
            <span class="commons-row-kind">{{ rec.type }}</span>
            <h3 class="commons-row-title">{{ knowledgeTitle(rec) }}</h3>
            <p v-if="knowledgeSummary(rec)" class="commons-row-sub">{{ knowledgeSummary(rec) }}</p>
            <p class="commons-row-provenance">{{ knowledgeProvenance(rec) }}</p>
          </div>
          <div class="commons-row-side">
            <span class="commons-badge" :class="knowledgeStatus(rec) === 'confirmed' ? 'commons-badge--confirmed' : 'commons-badge--proposed'">
              {{ knowledgeStatus(rec) }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- Contribute: add intention. A posted inquiry is a real record. -->
    <section class="commons-section commons-contribute" aria-labelledby="commons-contribute-h">
      <div class="commons-section-head">
        <div>
          <h2 id="commons-contribute-h" class="commons-section-title">Contribute</h2>
          <p class="commons-section-sub">
            A posted inquiry is a real record — matching runs against every provider on board.
          </p>
        </div>
      </div>

      <button
        v-if="!contributeOpen"
        class="commons-btn commons-btn--primary"
        type="button"
        @click="contributeOpen = true"
      >
        Post an inquiry
      </button>

      <form v-else class="commons-form" @submit="postInquiry">
        <div class="commons-field">
          <label class="commons-field-label" for="commons-inquiry">Inquiry</label>
          <input
            id="commons-inquiry"
            v-model="draftNeed"
            class="commons-input"
            type="text"
            required
            autocomplete="off"
            placeholder="What is wanted, asked, or examined — one statement."
          />
        </div>
        <div class="commons-field">
          <label class="commons-field-label" for="commons-requires">Capability it asks for · optional</label>
          <input
            id="commons-requires"
            v-model="draftRequires"
            class="commons-input"
            type="text"
            autocomplete="off"
            placeholder="e.g. repair, teaching, fabrication"
          />
        </div>
        <div class="commons-form-foot">
          <button class="commons-btn commons-btn--primary" type="submit">Post the inquiry</button>
          <p v-if="justPosted" class="commons-form-status" role="status">
            Posted — it now appears under Open inquiries.
          </p>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied.
   Local ink/soft tones: the knowledge pillar ramp at 50 (soft surface) and 700 (ink),
   chosen so accent-tinted text and badges clear 4.5:1 on the paper and card surfaces. */

.commons-page {
  --cs-accent: var(--apt-module-accent, var(--apt-pillar-knowledge));
  --cs-accent-soft: var(--apt-color-ramp-knowledge-50);
  --cs-accent-ink: var(--apt-color-ramp-knowledge-700);
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
  padding: var(--apt-spacing-s13);
}

/* --- Header: the module's own page statement, not a breadcrumb duplicate. --- */

.commons-header {
  margin-bottom: var(--apt-spacing-s13);
}

.commons-heading {
  display: flex;
  align-items: baseline;
  gap: var(--apt-spacing-s5);
  flex-wrap: wrap;
}

.commons-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
  line-height: var(--apt-line-height-tight);
}

.commons-primitive {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--cs-accent-ink);
}

.commons-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: var(--apt-spacing-s3) 0 0;
  line-height: var(--apt-line-height-relaxed);
  max-width: 60ch;
}

/* --- Sections --- */

.commons-section {
  margin-top: var(--apt-spacing-s13);
}

.commons-section:first-of-type {
  margin-top: 0;
}

.commons-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s6);
}

.commons-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
}

.commons-section-sub {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: var(--apt-spacing-s1) 0 0;
  line-height: var(--apt-line-height-normal);
}

.commons-section-count {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  font-variant-numeric: tabular-nums;
  color: var(--apt-text-muted);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r9);
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  min-width: 28px;
  text-align: center;
}

/* --- Quiet first-use rows (honest: the loop has simply not produced this yet). --- */

.commons-quiet {
  padding: var(--apt-spacing-s6);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
}

.commons-quiet-line {
  margin: 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-relaxed);
  max-width: 72ch;
}

.commons-quiet-link {
  color: var(--cs-accent-ink);
  font-weight: var(--apt-font-weight-medium);
  text-decoration: none;
}

@media (hover: hover) and (pointer: fine) {
  .commons-quiet-link:hover {
    text-decoration: underline;
  }
}

.commons-quiet-link:focus-visible {
  outline: 2px solid var(--cs-accent);
  outline-offset: 2px;
}

/* --- Signal cards (open inquiries, in flight) --- */

.commons-signal-list,
.commons-row-list {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.commons-signal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  border-left: 3px solid var(--cs-accent);
  background: var(--apt-color-neutral-n0);
}

.commons-signal--need {
  border-left-color: var(--apt-color-brand-geist-alert);
}

.commons-signal-copy {
  flex: 1;
  min-width: 0;
}

.commons-signal-title {
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s2) 0;
  color: var(--apt-text-body);
  overflow-wrap: break-word;
}

.commons-signal-context {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s3) 0;
  line-height: var(--apt-line-height-relaxed);
}

.commons-signal-context:last-of-type {
  margin-bottom: 0;
}

.commons-signal-meta {
  display: flex;
  gap: var(--apt-spacing-s4);
  flex-wrap: wrap;
  align-items: center;
}

.commons-signal-institution {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-medium);
  color: var(--cs-accent-ink);
}

.commons-signal-action {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: var(--apt-spacing-s2) var(--apt-spacing-s4);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--cs-accent-ink);
  text-decoration: none;
  white-space: nowrap;
}

@media (hover: hover) and (pointer: fine) {
  .commons-signal-action:hover {
    text-decoration: underline;
  }
}

.commons-signal-action:focus-visible {
  outline: 2px solid var(--cs-accent);
  outline-offset: 2px;
}

/* --- Badges (tinted surfaces with ink that clears 4.5:1) --- */

.commons-badge {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  border-radius: var(--apt-radius-r9);
  white-space: nowrap;
}

.commons-badge--missing {
  background: var(--apt-color-ramp-geist-alert-50);
  color: var(--apt-color-ramp-geist-alert-800);
}

.commons-badge--matched {
  background: var(--cs-accent-soft);
  color: var(--cs-accent-ink);
}

.commons-badge--proposed {
  background: var(--apt-color-neutral-n50);
  color: var(--apt-text-muted);
}

.commons-badge--confirmed {
  background: var(--cs-accent-soft);
  color: var(--cs-accent-ink);
}

/* --- Register rows (briefs, knowledge house) --- */

.commons-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.commons-row-main {
  flex: 1;
  min-width: 0;
}

.commons-row-kind {
  display: block;
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-muted);
  margin-bottom: var(--apt-spacing-s1);
}

.commons-row-title {
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s2) 0;
  color: var(--apt-text-body);
  overflow-wrap: break-word;
}

.commons-row-kind + .commons-row-title {
  margin-top: 0;
}

.commons-row-sub {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s2) 0;
  line-height: var(--apt-line-height-relaxed);
  overflow-wrap: break-word;
}

.commons-row-provenance {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  color: var(--apt-text-muted);
  margin: 0;
  letter-spacing: 0.02em;
}

.commons-row-side {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* --- Buttons --- */

.commons-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: var(--apt-spacing-s3) var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r2);
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  cursor: pointer;
  transition: border-color var(--apt-animation-fast), background-color var(--apt-animation-fast);
}

/* Ink tone, not the raw accent fill: white on the 500 accent is 3.9:1,
   the 700 ink clears 4.5:1. */
.commons-btn--primary {
  border: 1px solid var(--cs-accent-ink);
  background: var(--cs-accent-ink);
  color: var(--apt-color-neutral-n0);
}

@media (hover: hover) and (pointer: fine) {
  .commons-btn--primary:hover {
    background: var(--apt-color-ramp-knowledge-800);
    border-color: var(--apt-color-ramp-knowledge-800);
  }
}

.commons-btn--ghost {
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
  color: var(--cs-accent-ink);
}

@media (hover: hover) and (pointer: fine) {
  .commons-btn--ghost:hover {
    border-color: var(--cs-accent);
  }
}

.commons-btn:disabled {
  cursor: default;
  opacity: 0.6;
}

.commons-btn:focus-visible {
  outline: 2px solid var(--cs-accent);
  outline-offset: 2px;
}

/* --- Contribute form --- */

.commons-form {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s5);
  max-width: 560px;
  padding: var(--apt-spacing-s8);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
}

.commons-field {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
}

.commons-field-label {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-muted);
}

.commons-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  padding: var(--apt-spacing-s3) var(--apt-spacing-s4);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-body);
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-body-md);
}

.commons-input::placeholder {
  color: var(--apt-text-dim);
}

.commons-input:focus {
  outline: none;
  border-color: var(--cs-accent);
  box-shadow: 0 0 0 3px var(--cs-accent-soft);
}

.commons-form-foot {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
  flex-wrap: wrap;
}

.commons-form-status {
  margin: 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--cs-accent-ink);
  font-weight: var(--apt-font-weight-medium);
}

/* --- Small screens --- */

@media (max-width: 640px) {
  .commons-signal-card,
  .commons-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .commons-row-side {
    margin-top: var(--apt-spacing-s2);
  }

  .commons-section-head {
    flex-direction: column;
    gap: var(--apt-spacing-s2);
  }
}
</style>
