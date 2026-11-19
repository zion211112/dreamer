<script setup lang="ts">
</script>

<template>
  <div class="aptcoin-page" data-module="workbench">
    <header class="aptcoin-header">
      <h1 class="aptcoin-title">AptCoin Lab</h1>
      <p class="aptcoin-subtitle">
        Local currency simulation for the workbench. KES-denominated capital tracking.
      </p>
    </header>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.aptcoin-page {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100vh;
  padding: var(--apt-spacing-s13);
}

.aptcoin-header {
  margin-bottom: var(--apt-spacing-s13);
}

.aptcoin-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.aptcoin-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}
</style>

