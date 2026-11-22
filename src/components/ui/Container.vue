<script setup lang="ts">
/**
 * Container — Structural Emergence
 * Max-width wrapper with responsive padding. The page's structural boundary.
 */
import { computed } from 'vue';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ContainerProps {
  size?: ContainerSize;
  class?: string;
  as?: 'div' | 'main' | 'section' | 'article';
}

const props = defineProps<ContainerProps>();

const Tag = computed(() => props.as ?? 'div');

const containerClasses = computed(() => [
  'apt-container',
  `apt-container--${props.size ?? 'lg'}`,
  props.class,
].filter(Boolean));

const containerStyles = computed(() => {
  const maxWidths: Record<ContainerSize, string> = {
    sm: '640px',
    md: '960px',
    lg: '1280px',
    xl: '1440px',
    full: '100%',
  };
  return {
    maxWidth: maxWidths[props.size ?? 'lg'],
  };
});
</script>

<template>
  <component
    :is="Tag"
    :class="containerClasses"
    :style="containerStyles"
  >
    <slot />
  </component>
</template>

<style scoped>
.apt-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--apt-container-padding);
  padding-right: var(--apt-container-padding);
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .apt-container {
    padding-left: var(--apt-container-padding-sm);
    padding-right: var(--apt-container-padding-sm);
  }
}

.apt-container--sm { max-width: 640px; }
.apt-container--md { max-width: 960px; }
.apt-container--lg { max-width: 1280px; }
.apt-container--xl { max-width: 1440px; }
.apt-container--full { max-width: 100%; }
</style>