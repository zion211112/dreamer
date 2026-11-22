<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

interface RoleCard {
  key: string;
  title: string;
  role: string;
  description: string;
  count: string;
  unit: string;
  to: string;
  accent: string;
}

const roles: RoleCard[] = [
  {
    key: 'teacher',
    title: 'Teacher console',
    role: 'Mark KCPE / KCSE scripts',
    description: 'Scan, score, and submit marking results for your classes. Every mark is a claim with evidence.',
    count: '0',
    unit: 'scripts marked',
    to: '/workspace/workbench',
    accent: 'var(--apt-pillar-production)',
  },
  {
    key: 'principal',
    title: 'Principal console',
    role: 'Verify & release results',
    description: 'Review marked scripts, approve releases, and sign off on institutional outcomes.',
    count: '0',
    unit': 'results released',
    to: '/workspace/records/roll',
    accent: 'var(--apt-pillar-stewardship)',
  },
  {
    key: 'developer',
    title: 'Developer console',
    role: 'Build marking tools',
    description: 'Author marking rubrics, integrate scanners, and maintain the automarking pipeline.',
    count: '0',
    unit: 'tools built',
    to: '/workspace/intelligence',
    accent: 'var(--apt-color-brand-secondary)',
  },
];

const metrics = computed(() => {
  return {
    schools: '5',
    scripts: '0',
    pending: '0',
    released: '0',
  };
});
</script>

<template>
  <div class="benben-page">
    <header class="benben-header">
      <div class="benben-heading">
        <h1 class="benben-title">Benben-OS</h1>
        <span class="benben-primitive">School console · KCPE/KCSE automarking</span>
      </div>
      <p class="benben-subtitle">
        Teacher, principal, and developer tools for Kenyan KCPE/KCSE automarking. Every mark is a
        claim with evidence; every release is a commitment on the roll.
      </p>
    </header>

    <section class="benben-metrics">
      <div class="benben-metric">
        <span class="benben-metric-num">{{ metrics.schools }}</span>
        <span class="benben-metric-unit">schools</span>
        <span class="benben-metric-label">Commissioning</span>
      </div>
      <div class="benben-metric">
        <span class="benben-metric-num">{{ metrics.scripts }}</span>
        <span class="benben-metric-unit">scripts</span>
        <span class="benben-metric-label">Marked this cycle</span>
      </div>
      <div class="benben-metric">
        <span class="benben-metric-num">{{ metrics.pending }}</span>
        <span class="benben-metric-unit">pending</span>
        <span class="benben-metric-label">Awaiting verification</span>
      </div>
      <div class="benben-metric">
        <span class="benben-metric-num">{{ metrics.released }}</span>
        <span class="benben-metric-unit">released</span>
        <span class="benben-metric-label">Results on the roll</span>
      </div>
    </section>

    <section class="benben-roles">
      <h2 class="benben-section-title">Role consoles</h2>
      <article
        v-for="role in roles"
        :key="role.key"
        class="benben-role-card"
        :style="{ '--role-accent': role.accent }"
      >
        <div class="benben-role-copy">
          <h3 class="benben-role-title">{{ role.title }}</h3>
          <span class="benben-role-badge">{{ role.role }}</span>
          <p class="benben-role-desc">{{ role.description }}</p>
        </div>
        <div class="benben-role-foot">
          <span class="benben-role-count">
            <span class="benben-role-num">{{ role.count }}</span>
            <span class="benben-role-unit">{{ role.unit }}</span>
          </span>
          <RouterLink :to="role.to" class="benben-role-link">Open →</RouterLink>
        </div>
      </article>
    </section>

    <section class="benben-about">
      <h2 class="benben-section-title">About Benben-OS</h2>
      <p class="benben-about-body">
        Benben-OS is the school console layer of APT-LABS. It sits under Workbench as an
        operational boundary — a workplace where people take jobs, not a static record under Assets.
        Marking results flow into the workbench as proof-carrying work units, and released results
        land on the roll as evidence.
      </p>
      <ul class="benben-about-list">
        <li>KCPE and KCSE automarking with evidence-backed scores</li>
        <li>Three roles: teacher, principal, developer</li>
        <li>Every mark is a claim; every release is a commitment</li>
        <li>Results flow to the roll as versioned evidence</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.benben-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100vh;
  padding: var(--apt-spacing-s13);
}

.benben-header {
  margin-bottom: var(--apt-spacing-s13);
}

.benben-heading {
  display: flex;
  align-items: baseline;
  gap: var(--apt-spacing-s5);
  flex-wrap: wrap;
}

.benben-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
  line-height: var(--apt-line-height-tight);
}

.benben-primitive {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.benben-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: var(--apt-spacing-s3) 0 0;
  line-height: var(--apt-line-height-relaxed);
  max-width: 60ch;
}

/* Metrics */

.benben-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s13);
}

.benben-metric {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.benben-metric-num {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-display);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  line-height: 1;
}

.benben-metric-unit {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.04em;
  color: var(--apt-text-dim);
}

.benben-metric-label {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-sm-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  margin-top: var(--apt-spacing-s1);
}

/* Role cards */

.benben-roles {
  margin-bottom: var(--apt-spacing-s13);
}

.benben-section-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-body);
}

.benben-role-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s8);
  padding: var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  border-left: 3px solid var(--role-accent);
  background: var(--apt-color-neutral-n0);
}

.benben-role-copy {
  flex: 1;
  min-width: 0;
}

.benben-role-title {
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s2) 0;
  color: var(--apt-text-body);
}

.benben-role-badge {
  display: inline-block;
  font-size: var(--apt-font-size-sm-3);
  font-weight: var(--apt-font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--role-accent);
  margin-bottom: var(--apt-spacing-s3);
}

.benben-role-desc {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.benben-role-foot {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s4);
  flex-shrink: 0;
}

.benben-role-count {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benben-role-num {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
}

.benben-role-unit {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-sm-3);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.benben-role-link {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--role-accent);
  text-decoration: none;
  white-space: nowrap;
  border: 1px solid var(--role-accent);
  border-radius: var(--apt-radius-r1);
  padding: var(--apt-spacing-s2) var(--apt-spacing-s4);
}

.benben-role-link:hover {
  background: var(--role-accent);
  color: var(--apt-color-neutral-n0);
}

/* About section */

.benben-about {
  padding: var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.benben-about-body {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s4) 0;
  line-height: var(--apt-line-height-relaxed);
  max-width: 72ch;
}

.benben-about-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
}

.benben-about-list li {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-body);
  padding-left: var(--apt-spacing-s4);
  position: relative;
}

.benben-about-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

/* Responsive */

@media (max-width: 900px) {
  .benben-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .benben-role-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .benben-role-foot {
    width: 100%;
    justify-content: space-between;
    margin-top: var(--apt-spacing-s4);
  }
}

@media (max-width: 640px) {
  .benben-metrics {
    grid-template-columns: 1fr;
  }
}
</style>

