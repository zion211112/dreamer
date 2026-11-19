<script setup lang="ts">
import { RouterLink } from 'vue-router';

const people = [
  { id: 'p-01', name: 'Wanjiku Muthoni', role: 'Mason', location: 'Thiba', capabilities: ['Masonry', 'Canal lining', 'Stone work'], offers: ['Canal repair', 'Foundation work'] },
  { id: 'p-02', name: 'Kimetu Waweru', role: 'Electrician', location: 'Mwea', capabilities: ['Solar installation', 'Electrical wiring', 'Inverter setup'], offers: ['Solar basic installation', 'Electrical inspection'] },
  { id: 'p-03', name: 'Atieno Ochieng', role: 'Irrigation technician', location: 'Mwea', capabilities: ['Irrigation box operation', 'Pump maintenance'], offers: ['Irrigation box operation', 'Pump servicing'] },
  { id: 'p-04', name: 'Njeri Kamau', role: 'Community steward', location: 'Kirinyaga', capabilities: ['Community coordination', 'Record keeping'], offers: ['Community sign-off', 'Steward coordination'] },
  { id: 'p-05', name: 'Otieno Mwangi', role: 'Learner', location: 'Thiba', capabilities: ['Masonry (apprentice)', 'Carpentry (apprentice)'], offers: ['General labour', 'Tool maintenance'] },
];
</script>

<template>
  <div class="people-page" data-module="network">
    <header class="people-header">
      <h1 class="people-title">People & crews</h1>
      <p class="people-subtitle">
        Understand who is in the network, what they offer, and how they connect.
      </p>
    </header>

    <section class="people-directory">
      <div class="people-directory-inner">
        <div class="people-search">
          <input type="text" placeholder="Search people, roles, capabilities…" class="people-search-input" />
        </div>

        <div class="people-grid">
          <article
            v-for="person in people"
            :key="person.id"
            class="people-card"
          >
            <div class="people-card-copy">
              <h3 class="people-card-name">{{ person.name }}</h3>
              <p class="people-card-role">{{ person.role }}</p>
              <p class="people-card-location">{{ person.location }}</p>
            </div>
            <div class="people-card-caps">
              <span
                v-for="cap in person.capabilities"
                :key="cap"
                class="people-card-cap"
              >
                {{ cap }}
              </span>
            </div>
            <div class="people-card-offers">
              <span
                v-for="offer in person.offers"
                :key="offer"
                class="people-card-offer"
              >
                {{ offer }}
              </span>
            </div>
            <RouterLink :to="`/workspace/network/people/${person.id}`" class="people-card-inspect">
              Inspect →
            </RouterLink>
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
  min-height: 100vh;
  padding: var(--apt-spacing-s13);
}

.people-header {
  margin-bottom: var(--apt-spacing-s13);
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

.people-directory-inner {
  max-width: 1000px;
}

.people-search {
  margin-bottom: var(--apt-spacing-s8);
}

.people-search-input {
  width: 100%;
  max-width: 400px;
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
  margin-top: var(--apt-spacing-s1);
}

.people-card-offer {
  font-size: var(--apt-font-size-micro);
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-muted);
}

.people-card-inspect {
  align-self: flex-start;
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-pillar-stewardship);
  text-decoration: none;
  margin-top: var(--apt-spacing-s3);
  transition: text-decoration-color var(--apt-animation-fast);
}

.people-card-inspect:hover {
  text-decoration: underline;
}
</style>

