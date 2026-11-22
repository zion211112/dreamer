<script setup lang="ts">
/**
 * Stack — Structural Emergence
 * Consistent vertical/horizontal spacing between elements.
 * No arbitrary margins, no decorative dividers.
 */
import { computed } from 'vue';

type StackDirection = 'vertical' | 'horizontal';
type StackGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface StackProps {
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  class?: string;
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'nav' | 'ul' | 'ol';
}

const props = defineProps<StackProps>();

const Tag = computed(() => props.as ?? 'div');

const stackClasses = computed(() => [
  'apt-stack',
  `apt-stack--${props.direction ?? 'vertical'}`,
  `apt-stack--gap-${props.gap ?? 'md'}`,
  props.align ? `apt-stack--align-${props.align}` : '',
  props.justify ? `apt-stack--justify-${props.justify}` : '',
  props.wrap ? 'apt-stack--wrap' : '',
  props.class,
].filter(Boolean));

const gapValues: Record<StackGap, string> = {
  none: '0',
  sm: 'var(--apt-stack-gap-sm)',
  md: 'var(--apt-stack-gap)',
  lg: 'var(--apt-stack-gap-lg)',
  xl: 'var(--apt-spacing-s16)',
};
</script>

<template>
  <component
    :is="Tag"
    :class="stackClasses"
    :style="{ gap: gapValues[props.gap ?? 'md'] }"
  >
    <slot />
  </component>
</template>

<style scoped>
.apt-stack {
  display: flex;
  box-sizing: border-box;
}

.apt-stack--vertical {
  flex-direction: column;
}

.apt-stack--horizontal {
  flex-direction: row;
}

.apt-stack--align-start { align-items: flex-start; }
.apt-stack--align-center { align-items: center; }
.apt-stack--align-end { align-items: flex-end; }
.apt-stack--align-stretch { align-items: stretch; }
.apt-stack--align-baseline { align-items: baseline; }

.apt-stack--justify-start { justify-content: flex-start; }
.apt-stack--justify-center { justify-content: center; }
.apt-stack--justify-end { justify-content: flex-end; }
.apt-stack--justify-between { justify-content: space-between; }
.apt-stack--justify-around { justify-content: space-around; }
.apt-stack--justify-evenly { justify-content: space-evenly; }

.apt-stack--wrap { flex-wrap: wrap; }

/* Gap fallbacks for non-supporting browsers */
.apt-stack--gap-none { gap: 0; }
.apt-stack--gap-sm { gap: var(--apt-stack-gap-sm); }
.apt-stack--gap-md { gap: var(--apt-stack-gap); }
.apt-stack--gap-lg { gap: var(--apt-stack-gap-lg); }
.apt-stack--gap-xl { gap: var(--apt-spacing-s16); }

/* Ensure children don't overflow */
.apt-stack > * {
  min-width: 0;
  min-height: 0;
}
</style>