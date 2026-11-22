<script setup lang="ts">
/**
 * Section — Structural Emergence
 * Semantic page section with consistent vertical rhythm.
 * No arbitrary padding, no decorative backgrounds.
 */
import { computed } from 'vue';

type SectionSize = 'sm' | 'md' | 'lg' | 'xl';

interface SectionProps {
  size?: SectionSize;
  class?: string;
  as?: 'section' | 'div' | 'article' | 'header' | 'footer' | 'main';
  bordered?: boolean;
  background?: 'default' | 'page' | 'raised' | 'dark';
}

const props = defineProps<SectionProps>();

const Tag = computed(() => props.as ?? 'section');

const sectionClasses = computed(() => [
  'apt-section',
  `apt-section--${props.size ?? 'md'}`,
  props.bordered ? 'apt-section--bordered' : '',
  `apt-section--bg-${props.background ?? 'default'}`,
  props.class,
].filter(Boolean));
</script>

<template>
  <component
    :is="Tag"
    :class="sectionClasses"
  >
    <slot />
  </component>
</template>

<style scoped>
.apt-section {
  width: 100%;
  box-sizing: border-box;
}

.apt-section--sm {
  padding: var(--apt-section-padding-sm);
}

.apt-section--md {
  padding: var(--apt-section-padding);
}

.apt-section--lg {
  padding: var(--apt-spacing-s20) var(--apt-spacing-s16);
}

.apt-section--xl {
  padding: var(--apt-spacing-s24) var(--apt-spacing-s16);
}

.apt-section--bordered {
  border-top: 1px solid var(--apt-border);
}

.apt-section--bg-default { background: var(--apt-surface-default); }
.apt-section--bg-page { background: var(--apt-surface-page); }
.apt-section--bg-raised { background: var(--apt-surface-raised); }
.apt-section--bg-dark { background: var(--apt-surface-dark); color: var(--apt-surface-on-dark); }

/* First/last child margin collapse */
.apt-section > *:first-child { margin-top: 0; }
.apt-section > *:last-child { margin-bottom: 0; }

@media (max-width: 768px) {
  .apt-section--sm { padding: var(--apt-spacing-s8) var(--apt-spacing-s8); }
  .apt-section--md { padding: var(--apt-spacing-s12) var(--apt-spacing-s8); }
  .apt-section--lg { padding: var(--apt-spacing-s16) var(--apt-spacing-s8); }
  .apt-section--xl { padding: var(--apt-spacing-s20) var(--apt-spacing-s8); }
}
</style>