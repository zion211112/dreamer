<script setup lang="ts">
/**
 * Card — Structural Emergence
 * A contained surface for related content. Elevation through border + shadow, not arbitrary depth.
 * Variants: default (border), elevated (shadow), outlined (stronger border)
 */
import { computed } from 'vue';

type CardVariant = 'default' | 'elevated' | 'outlined';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  class?: string;
  hoverable?: boolean;
  clickable?: boolean;
  as?: 'div' | 'article' | 'section';
}

const props = defineProps<CardProps>();
const emit = defineEmits<{ click: [MouseEvent] }>();

const cardClasses = computed(() => [
  'apt-card',
  `apt-card--${props.variant ?? 'default'}`,
  `apt-card--p-${props.padding ?? 'md'}`,
  props.hoverable ? 'apt-card--hoverable' : '',
  props.clickable ? 'apt-card--clickable' : '',
  props.class,
].filter(Boolean));

const Tag = computed(() => props.as ?? 'div');

function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event);
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (props.clickable && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    emit('click', event as unknown as MouseEvent);
  }
}
</script>

<template>
  <component
    :is="Tag"
    :class="cardClasses"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot />
  </component>
</template>

<style scoped>
.apt-card {
  border-radius: var(--apt-card-radius);
  border: var(--apt-card-border-width) var(--apt-card-border-style) var(--apt-card-border);
  background: var(--apt-card-bg);
  transition:
    background-color var(--apt-card-transition),
    border-color var(--apt-card-transition),
    box-shadow var(--apt-card-transition);
}

.apt-card--default {
  border-color: var(--apt-card-border);
  box-shadow: none;
}

.apt-card--elevated {
  border-color: transparent;
  box-shadow: var(--apt-card-shadow);
}

.apt-card--outlined {
  border-width: 2px;
  border-color: var(--apt-border-strong);
  box-shadow: none;
}

/* Padding variants */
.apt-card--p-none { padding: 0; }
.apt-card--p-sm { padding: var(--apt-spacing-s4); }
.apt-card--p-md { padding: var(--apt-spacing-s6); }
.apt-card--p-lg { padding: var(--apt-spacing-s8); }

/* Hoverable */
.apt-card--hoverable:hover {
  background: var(--apt-card-hover-bg);
  border-color: var(--apt-card-hover-border);
  box-shadow: var(--apt-card-hover-shadow);
}

.apt-card--elevated.apt-card--hoverable:hover {
  box-shadow: var(--apt-shadow-sh2);
  border-color: transparent;
}

/* Clickable */
.apt-card--clickable {
  cursor: pointer;
  user-select: none;
}

.apt-card--clickable:focus-visible {
  outline: 2px solid var(--apt-focus-ring);
  outline-offset: 2px;
}

.apt-card--clickable:active {
  transform: scale(0.99);
}

/* Ensure slotted content works well */
.apt-card > *:first-child {
  margin-top: 0;
}

.apt-card > *:last-child {
  margin-bottom: 0;
}
</style>