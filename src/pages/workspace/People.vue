<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { useNetworkStore, groupOf } from '@/stores/network';

const network = useNetworkStore();
onMounted(() => network.load());

// People & crews: the individual and crew/collective actor types.
const rows = computed(() =>
  network.rows.filter((r) => groupOf(r.actor.type) === 'people' || groupOf(r.actor.type) === 'crews'),
);

const query = ref('');
const visible = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter(
    (r) =>
      r.actor.name.toLowerCase().includes(q) ||
      (r.actor.description ?? '').toLowerCase().includes(q) ||
      r.capabilities.some((c) => c.toLowerCase().includes(q)),
  );
});
</script>

<template>
  <div class="people-page" data-module="network">
    <header class="people-header">
      <h1 class="people-title">People &amp; crews</h1>
      <p class="people-subtitle">
        Individuals and crews registered in the network, with what they can do and what they have.
      </p>
    </header>

    <nav class="people-back">
      <RouterLink to="/workspace/network">← Network directory</RouterLink>
    </nav>

    <section class="people-directory">
      <div class="people-directory-inner">
        <div class="people-search">
          <input
            v-model="query"
            type="text"
            placeholder="Filter by name, role, or capability…"
            class="people-search-input"
            aria-label="Filter people and crews"
          />
        </div>

        <!-- First-use: nobody registered yet. -->
        <div v-if="!rows.length" class="people-empty">
          <h2 class="people-empty-title">No people or crews registered</h2>
          <p class="people-empty-body">
            Register an individual or a crew in the Coordination Workbench, and their profile
            will appear here.
          </p>
          <RouterLink to="/workspace/coordination" class="people-empty-cta">
            Open the Coordination Workbench
          </RouterLink>
        </div>

        <!-- Filtered-out: people exist, the filter emptied the view. -->
        <div v-else-if="!visible.length" class="people-empty">
          <h2 class="people-empty-title">No matches for “{{ query }}”</h2>
          <p class="people-empty-body">
            {{ rows.length }} person{{ rows.length === 1 ? '' : 's' }} and crew{{ rows.length === 1 ? '' : 's' }}
            are registered; none match this filter.
          </p>
          <button class="people-empty-cta people-empty-cta--button" @click="query = ''">
            Clear the filter
          </button>
        </div>

        <div v-else class="people-grid">
          <article v-for="row in visible" :key="row.actor.id" class="people-card">
            <div class="people-card-copy">
              <h3 class="people-card-name">{{ row.actor.name }}</h3>
              <p class="people-card-role">{{ row.typeLabel }}</p>
              <p v-if="row.actor.description" class="people-card-location">
                {{ row.actor.description }}
              </p>
            </div>
            <div v-if="row.capabilities.length" class="people-card-caps">
              <span v-for="cap in row.capabilities" :key="`c-${cap}`" class="people-card-cap">
                {{ cap }}
              </span>
            </div>
            <div v-if="row.assets.length" class="people-card-offers">
              <span
                v-for="asset in row.assets"
                :key="`a-${asset}`"
                class="people-card-offer"
              >
                {{ asset }}
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.people-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
  padding: var(--apt-spacing-s13);
}

.people-header {
  margin-bottom: var(--apt-spacing-s8);
}

.people-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.people-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.people-back {
  margin-bottom: var(--apt-spacing-s8);
}

.people-back a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  text-decoration: none;
}

.people-back a:hover {
  text-decoration: underline;
}

.people-directory-inner {
  max-width: 1000px;
}

.people-search {
  margin-bottom: var(--apt-spacing-s8);
}

.people-search-input {
  width: 100%;
  max-width: 400px;
  min-height: 44px;
  padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-body);
  font-size: var(--apt-font-size-body-md);
  font-family: inherit;
}

.people-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--apt-spacing-s6);
}

.people-card {
  padding: var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.people-card-copy {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s1);
}

.people-card-name {
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
}

.people-card-role {
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--apt-pillar-stewardship);
  margin: 0;
}

.people-card-location {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.people-card-caps {
  display: flex;
  flex-wrap: wrap;
  gap: var(--apt-spacing-s2);
}

.people-card-cap {
  font-size: var(--apt-font-size-micro);
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-default);
  color: var(--apt-text-body);
}

.people-card-offers {
  display: flex;
  flex-wrap: wrap;
  gap: var(--apt-spacing-s2);
}

.people-card-offer {
  font-size: var(--apt-font-size-micro);
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-color-ramp-stewardship-50);
  color: var(--apt-text-muted);
}

/* Empty states (first-use and filtered-out) */

.people-empty {
  padding: var(--apt-spacing-s13);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0);
  text-align: center;
}

.people-empty-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.people-empty-body {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 auto;
  max-width: 44ch;
  line-height: var(--apt-line-height-relaxed);
}

.people-empty-cta {
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
  border: none;
  font-family: inherit;
  cursor: pointer;
}

.people-empty-cta--button {
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-body);
  border: 1px solid var(--apt-border);
}
</style>
