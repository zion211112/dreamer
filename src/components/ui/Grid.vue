<script setup lang="ts">
/**
 * Grid — Structural Emergence
 * Responsive grid layout. Columns defined by content, not arbitrary breakpoints.
 * No decorative gutters, no arbitrary column counts.
 */
import { computed } from 'vue';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto';
type GridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface GridProps {
  cols?: GridCols | Record<'sm' | 'md' | 'lg' | 'xl', GridCols>;
  gap?: GridGap;
  class?: string;
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol';
}

const props = defineProps<GridProps>();

const Tag = computed(() => props.as ?? 'div');

const gridClasses = computed(() => [
  'apt-grid',
  props.class,
].filter(Boolean));

const gridStyles = computed(() => {
  const gaps: Record<GridGap, string> = {
    none: '0',
    sm: 'var(--apt-grid-gap-sm)',
    md: 'var(--apt-grid-gap)',
    lg: 'var(--apt-grid-gap-lg)',
    xl: 'var(--apt-spacing-s16)',
  };

  const styles: Record<string, string> = {
    gap: gaps[props.gap ?? 'md'],
  };

  if (props.cols) {
    if (typeof props.cols === 'object') {
      // Responsive cols object
      const baseCols = props.cols.sm ?? 1;
      styles.gridTemplateColumns = `repeat(${baseCols}, minmax(0, 1fr))`;

      // We'll handle responsive via CSS media queries in the style block
      // Store breakpoints for CSS
      (styles as any)._responsiveCols = props.cols;
    } else {
      styles.gridTemplateColumns = `repeat(${props.cols}, minmax(0, 1fr))`;
    }
  }

  return styles;
});
</script>

<template>
  <component
    :is="Tag"
    :class="gridClasses"
    :style="gridStyles"
  >
    <slot />
  </component>
</template>

<style scoped>
.apt-grid {
  display: grid;
  width: 100%;
  box-sizing: border-box;
}

.apt-grid > * {
  min-width: 0;
}

/* Responsive grid columns via CSS custom properties */
.apt-grid[style*="--grid-cols"] {
  grid-template-columns: repeat(var(--grid-cols, 1), minmax(0, 1fr));
}

@media (min-width: 640px) {
  .apt-grid[style*="--grid-cols-sm"] {
    grid-template-columns: repeat(var(--grid-cols-sm, 1), minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .apt-grid[style*="--grid-cols-md"] {
    grid-template-columns: repeat(var(--grid-cols-md, 1), minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .apt-grid[style*="--grid-cols-lg"] {
    grid-template-columns: repeat(var(--grid-cols-lg, 1), minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .apt-grid[style*="--grid-cols-xl"] {
    grid-template-columns: repeat(var(--grid-cols-xl, 1), minmax(0, 1fr));
  }
}

/* Gap utilities */
.apt-grid--gap-none { gap: 0; }
.apt-grid--gap-sm { gap: var(--apt-grid-gap-sm); }
.apt-grid--gap-md { gap: var(--apt-grid-gap); }
.apt-grid--gap-lg { gap: var(--apt-grid-gap-lg); }
.apt-grid--gap-xl { gap: var(--apt-spacing-s16); }
</style>