<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="kemetos1-page" data-module="intelligence">
    <header class="kemetos1-header">
      <h1 class="kemetos1-title">Kemetos1</h1>
      <p class="kemetos1-subtitle">
        Coordinator layer — contribution tracking and credential eligibility.
      </p>
    </header>

    <section class="kemetos1-content">
      <div class="kemetos1-grid">
        <article class="kemetos1-card">
          <h3 class="kemetos1-card-title">Contributions</h3>
          <p class="kemetos1-card-body">
            Track contributions across the Kemetos1 collective. Each contribution is
            recorded with capability claims and demonstrated outcomes.
          </p>
          <RouterLink to="/workspace/workbench" class="kemetos1-card-link">
            Open Workbench →
          </RouterLink>
        </article>
        <article class="kemetos1-card">
          <h3 class="kemetos1-card-title">Credential eligibility</h3>
          <p class="kemetos1-card-body">
            SBT-gated credential pathways based on accepted undertakings and verified
            roll entries. No universal score — the authorized party decides.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.kemetos1-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
  padding: var(--apt-spacing-s13);
}

.kemetos1-header {
  margin-bottom: var(--apt-spacing-s13);
}

.kemetos1-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.kemetos1-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}

.kemetos1-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--apt-spacing-s8);
}

.kemetos1-card {
  padding: var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r3);
  border: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.kemetos1-card-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
}

.kemetos1-card-body {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
  flex: 1;
}

.kemetos1-card-link {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-module-accent, var(--apt-pillar-stewardship));
  text-decoration: none;
  align-self: flex-start;
  transition: text-decoration-color var(--apt-animation-fast);
}

.kemetos1-card-link:hover {
  text-decoration: underline;
}
</style>

