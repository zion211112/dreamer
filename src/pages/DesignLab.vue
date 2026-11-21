<script setup lang="ts">
</script>

<template>
  <div class="designlab-page">
    <header class="designlab-header">
      <h1 class="designlab-title">Design Lab</h1>
      <p class="designlab-subtitle">
        Design system sandbox and token playground.
      </p>
    </header>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.designlab-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100%;
  padding: var(--apt-spacing-s13);
}

.designlab-header {
  margin-bottom: var(--apt-spacing-s13);
}

.designlab-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.designlab-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}
</style>

