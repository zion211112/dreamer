<script setup lang="ts">
/**
 * PageHead — Structural Emergence (Charter B6)
 * The identity of a page: eyebrow → title → subtitle → actions.
 * Editorial serif for the record, precise sans for the interface.
 */
import { computed } from 'vue';

interface PageHeadProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: any; // slot
  class?: string;
}

const props = defineProps<PageHeadProps>();

const pageHeadClasses = computed(() => [
  'apt-pagehead',
  props.class,
].filter(Boolean));
</script>

<template>
  <header :class="pageHeadClasses">
    <div class="apt-pagehead-content">
      <p v-if="eyebrow" class="apt-pagehead-eyebrow">{{ eyebrow }}</p>
      <h1 class="apt-pagehead-title">{{ title }}</h1>
      <p v-if="subtitle" class="apt-pagehead-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="apt-pagehead-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.apt-pagehead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  flex-wrap: wrap;
  margin-bottom: var(--apt-pagehead-margin-bottom);
}

.apt-pagehead-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--apt-pagehead-gap);
}

.apt-pagehead-eyebrow {
  margin: 0;
  font-family: var(--apt-font-mono);
  font-size: var(--apt-pagehead-eyebrow-size);
  font-weight: var(--apt-pagehead-eyebrow-weight);
  letter-spacing: var(--apt-pagehead-eyebrow-tracking);
  text-transform: uppercase;
  color: var(--apt-text-dim);
  line-height: var(--apt-line-height-normal);
}

.apt-pagehead-title {
  margin: 0;
  font-family: var(--apt-font-serif);
  font-size: var(--apt-pagehead-title-size);
  font-weight: var(--apt-pagehead-title-weight);
  letter-spacing: var(--apt-pagehead-title-tracking);
  line-height: var(--apt-pagehead-title-line-height);
  color: var(--apt-text-strong);
}

.apt-pagehead-subtitle {
  margin: 0;
  font-size: var(--apt-pagehead-subtitle-size);
  line-height: var(--apt-pagehead-subtitle-line-height);
  color: var(--apt-text-muted);
  max-width: 72ch;
}

.apt-pagehead-actions {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--apt-spacing-s4);
  margin-top: auto;
}

/* Responsive */
@media (max-width: 640px) {
  .apt-pagehead {
    flex-direction: column;
    align-items: stretch;
    gap: var(--apt-spacing-s4);
  }

  .apt-pagehead-title {
    font-size: var(--apt-font-size-h2);
  }

  .apt-pagehead-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>