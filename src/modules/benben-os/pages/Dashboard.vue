<script setup lang="ts">
</script>

<template>
  <div class="benben-page">
    <header class="benben-header">
      <h1 class="benben-title">Benben-OS</h1>
      <p class="benben-subtitle">
        School console — teacher, principal, and developer tools for Kenyan KCPE/KCSE automarking.
      </p>
    </header>
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

.benben-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.benben-subtitle {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}
</style>

