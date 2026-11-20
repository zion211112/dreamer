<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue';
import { listRecords, type RecordEnvelope } from '@/lib/record-envelope';
import { getAuditEvents, type AuditEvent } from '@/lib/audit';
import { listEvidence } from '@/lib/evidence-store';
import { searchAuditEvents, searchRecords } from '@/lib/record-search';

type Lens = 'canon' | 'annals' | 'roll';

const route = useRoute();
// The view lives in the link: /workspace/records (canon), /annals, /roll.
const lens = computed<Lens>(() => {
  const last = String(route.path).split('/').pop() ?? '';
  return last === 'annals' || last === 'roll' ? last : 'canon';
});

const records = ref<RecordEnvelope[]>([]);
const events = ref<AuditEvent[]>([]);
const evidence = ref<RecordEnvelope[]>([]);

function load(): void {
  records.value = listRecords().slice(0, 60);
  events.value = getAuditEvents({ limit: 40 });
  evidence.value = listEvidence().slice(0, 40);
}

onMounted(load);
watch(lens, load);

const tabs = [
  { id: 'canon', label: 'Records', to: '/workspace/records' },
  { id: 'annals', label: 'Annals', to: '/workspace/records/annals' },
  { id: 'roll', label: 'Evidence', to: '/workspace/records/roll' },
] as const;

const POSITIVE = new Set(['active', 'fulfilled', 'verified', 'accepted']);
const MUTED = new Set(['superseded', 'retired']);

function badgeClass(status: string): string {
  if (POSITIVE.has(status)) return 'records-gate--accepted';
  if (MUTED.has(status) || status === 'rejected') return 'records-gate--superseded';
  return 'records-gate--draft';
}

/** The one-line content of a record, whatever family it is. */
function recordLine(rec: RecordEnvelope): string {
  const d = rec.data as Record<string, unknown>;
  return (
    (d.need as string | undefined) ??
    (d.summary as string | undefined) ??
    (d.outcome as string | undefined) ??
    (d.name as string | undefined) ??
    ''
  );
}

function evidenceLine(rec: RecordEnvelope): string {
  return ((rec.data as { summary?: string }).summary ?? rec.type) as string;
}

function dateTime(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ');
}

// --- Search (instant, client-side; drives searchRecords / searchAuditEvents) ---
const query = ref('');
const searching = computed(() => query.value.trim().length > 0);

const shownRecords = computed<RecordEnvelope[]>(() =>
  searching.value
    ? searchRecords(query.value, { limit: 60 }).map((h) => h.record)
    : records.value,
);
const shownEvents = computed<AuditEvent[]>(() =>
  searching.value ? searchAuditEvents(query.value, { limit: 40 }) : events.value,
);
const shownEvidence = computed<RecordEnvelope[]>(() =>
  searching.value
    ? searchRecords(query.value, { family: 'EVIDENCE', limit: 40 }).map((h) => h.record)
    : evidence.value,
);
const shownCount = computed(() =>
  lens.value === 'canon'
    ? shownRecords.value.length
    : lens.value === 'annals'
      ? shownEvents.value.length
      : shownEvidence.value.length,
);

const searchLabel = computed(() =>
  lens.value === 'canon'
    ? 'Search the record canon'
    : lens.value === 'annals'
      ? 'Search the audit ledger'
      : 'Search the evidence roll',
);
const searchPlaceholder = computed(() =>
  lens.value === 'canon'
    ? 'Search records, like fence…'
    : lens.value === 'annals'
      ? 'Search ledger events, like evidence…'
      : 'Search evidence, like certificate…',
);
const countNoun = computed(() => {
  if (lens.value === 'canon') return shownRecords.value.length === 1 ? 'record' : 'records';
  if (lens.value === 'annals') return 'events';
  return 'evidence';
});

const nothing = computed(
  () =>
    !(
      (lens.value === 'canon' && records.value.length) ||
      (lens.value === 'annals' && events.value.length) ||
      (lens.value === 'roll' && evidence.value.length)
    ),
);

const emptyCopy: Record<Lens, { title: string; body: string }> = {
  canon: {
    title: 'No records yet',
    body: 'Records are minted as coordination happens — needs, commitments, and outcomes each land here as a versioned envelope.',
  },
  annals: {
    title: 'No audit events yet',
    body: 'Every create, update, supersede, and verify is appended to this ledger the moment it happens.',
  },
  roll: {
    title: 'No evidence registered yet',
    body: 'Register a piece of evidence in the Coordination Workbench and it appears here with its verification status.',
  },
};
</script>

<template>
  <div class="records-page" data-module="records">
    <header class="records-header">
      <h1 class="records-title">Records</h1>
      <p class="records-subtitle">
        The versioned system of record — records, the audit ledger, and the evidence roll.
        Append-only: corrections supersede, nothing is rewritten.
      </p>
    </header>

    <nav class="records-lens-tabs" aria-label="Record lens">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.id"
        :to="tab.to"
        class="records-lens-tab"
        :class="{ 'records-lens-tab--active': lens === tab.id }"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>

    <div class="records-search">
      <div class="records-search-box">
        <input
          v-model="query"
          class="records-search-input"
          type="search"
          :aria-label="searchLabel"
          :placeholder="searchPlaceholder"
        />
        <button
          v-if="searching"
          class="records-search-clear"
          type="button"
          aria-label="Clear search"
          @click="query = ''"
        >
          ×
        </button>
      </div>
      <p v-if="searching" class="records-search-count" aria-live="polite">
        {{ shownCount }} {{ countNoun }}
      </p>
    </div>

    <section class="records-list">
      <h2 class="records-section-title">
        {{ lens === 'canon' ? 'Record canon' : lens === 'annals' ? 'Audit ledger' : 'Evidence roll' }}
      </h2>

      <div v-if="!searching && nothing" class="records-empty">
        <h3 class="records-empty-title">{{ emptyCopy[lens].title }}</h3>
        <p class="records-empty-body">{{ emptyCopy[lens].body }}</p>
        <RouterLink to="/workspace/coordination" class="records-empty-cta">
          Open the Coordination Workbench
        </RouterLink>
      </div>

      <div v-else-if="searching && shownCount === 0" class="records-nomatch">
        <p class="records-nomatch-line">
          No {{ countNoun }} match “{{ query.trim() }}”.
        </p>
        <button class="records-nomatch-clear" type="button" @click="query = ''">
          Clear search
        </button>
      </div>

      <!-- Canon: every record envelope, newest first -->
      <table v-else-if="lens === 'canon'" class="records-table">
        <thead>
          <tr>
            <th>Record</th>
            <th>Status</th>
            <th>Version</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rec in shownRecords" :key="rec.id" class="records-row">
            <td class="records-title-cell">
              <span class="records-record-kind">{{ rec.family }} / {{ rec.type }}</span>
              <span v-if="recordLine(rec)" class="records-record-line">{{ recordLine(rec) }}</span>
            </td>
            <td>
              <span class="records-gate-badge" :class="badgeClass(rec.status)">
                {{ rec.status }}
              </span>
            </td>
            <td class="records-version">v{{ rec.version }}</td>
            <td class="records-date">{{ rec.updatedAt.slice(0, 10) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Annals: the append-only audit ledger, newest first -->
      <table v-else-if="lens === 'annals'" class="records-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Resource</th>
            <th>Account</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in shownEvents" :key="event.id" class="records-row">
            <td class="records-title-cell">
              <span class="records-record-line">{{ event.action }}</span>
            </td>
            <td>
              <span class="records-record-kind">
                {{ event.resourceType ?? '—' }}
                <template v-if="event.resourceId">
                  · {{ event.resourceId.slice(-8) }}
                </template>
              </span>
            </td>
            <td class="records-date">{{ event.accountId ?? '—' }}</td>
            <td class="records-date">{{ dateTime(event.timestamp) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Roll: the evidence record and its trust state -->
      <table v-else class="records-table">
        <thead>
          <tr>
            <th>Evidence</th>
            <th>Type</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rec in shownEvidence" :key="rec.id" class="records-row">
            <td class="records-title-cell">
              <span class="records-record-line">{{ evidenceLine(rec) }}</span>
            </td>
            <td class="records-date">{{ rec.type }}</td>
            <td>
              <span
                class="records-gate-badge"
                :class="badgeClass(((rec.data as { status?: string }).status) ?? 'unverified')"
              >
                {{ (rec.data as { status?: string }).status ?? 'unverified' }}
              </span>
            </td>
            <td class="records-date">{{ rec.updatedAt.slice(0, 10) }}</td>
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
  flex-wrap: wrap;
}

.records-lens-tab {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
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

/* Search */
.records-search {
  margin-bottom: var(--apt-spacing-s8);
}

.records-search-box {
  position: relative;
  max-width: 480px;
}

.records-search-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-body);
  background: var(--apt-color-neutral-n0);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  padding: var(--apt-spacing-s3) var(--apt-spacing-s6);
}
.records-search-input::placeholder { color: var(--apt-text-dim); }
.records-search-input:focus {
  outline: none;
  border-color: var(--apt-module-accent, var(--apt-color-brand-primary));
  box-shadow: 0 0 0 3px var(--apt-color-ramp-stewardship-50);
}

.records-search-clear {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 44px;
  border: none;
  /* Opaque: text scrolled under the button is masked, not visible through it. */
  background: var(--apt-color-neutral-n0);
  border-radius: 0 var(--apt-radius-r2) var(--apt-radius-r2) 0;
  color: var(--apt-text-muted);
  font-size: var(--apt-font-size-body-md);
  cursor: pointer;
}
.records-search-clear:hover { color: var(--apt-text-body); }
.records-search-clear:focus-visible {
  outline: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  outline-offset: -2px;
}

.records-search-count {
  margin: var(--apt-spacing-s3) 0 0;
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-muted);
  font-variant-numeric: tabular-nums;
}

/* Zero-match state (distinct from first-use empty) */
.records-nomatch {
  padding: var(--apt-spacing-s10);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
}
.records-nomatch-line {
  margin: 0 0 var(--apt-spacing-s4);
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
}
.records-nomatch-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 var(--apt-spacing-s6);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-body);
  font-family: var(--apt-font-sans);
  font-size: var(--apt-font-size-body-sm);
  cursor: pointer;
}
.records-nomatch-clear:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }

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
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.records-record-kind {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
}

.records-record-line {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-body);
  overflow-wrap: break-word;
}

.records-version {
  font-variant-numeric: tabular-nums;
  color: var(--apt-text-muted);
}

.records-date {
  font-variant-numeric: tabular-nums;
  color: var(--apt-text-muted);
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
.records-gate--draft { background: var(--apt-color-neutral-n50); color: var(--apt-text-dim); }
.records-gate--superseded { background: var(--apt-color-neutral-n50); color: var(--apt-text-dim); }

/* Empty states, one per lens */

.records-empty {
  padding: var(--apt-spacing-s13);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
  text-align: center;
}

.records-empty-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.records-empty-body {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 auto;
  max-width: 48ch;
  line-height: var(--apt-line-height-relaxed);
}

.records-empty-cta {
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

.records-list {
  overflow-x: auto;
}
</style>
