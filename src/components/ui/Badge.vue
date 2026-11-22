<script setup lang="ts">
/**
 * Badge — Structural Emergence
 * Small status indicator. Pill shape, semantic colors only.
 * No decorative gradients, no arbitrary colors.
 */
import { computed } from 'vue';

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  class?: string;
  dot?: boolean;
  removable?: boolean;
}

const props = defineProps<BadgeProps>();
const emit = defineEmits<{ remove: [] }>();

const badgeClasses = computed(() => [
  'apt-badge',
  `apt-badge--${props.variant ?? 'neutral'}`,
  `apt-badge--${props.size ?? 'md'}`,
  props.dot ? 'apt-badge--dot' : '',
  props.removable ? 'apt-badge--removable' : '',
  props.class,
].filter(Boolean));

function handleRemove(event: MouseEvent) {
  event.stopPropagation();
  emit('remove');
}
</script>

<template>
  <span :class="badgeClasses" role="status" :aria-label="dot ? undefined : $slots.default?.()?.[0]?.children">
  <span v-if="dot" class="apt-badge-dot" aria-hidden="true" />
  <slot />
  <button
    v-if="removable"
    type="button"
    class="apt-badge-remove"
    @click="handleRemove"
    aria-label="Remove"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>
</span>
</template>

<style scoped>
.apt-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--apt-badge-gap);
  border-radius: var(--apt-badge-radius);
  font-size: var(--apt-badge-font-size);
  font-weight: var(--apt-badge-font-weight);
  font-family: var(--apt-font-sans);
  line-height: 1;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.apt-badge--sm {
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  height: 20px;
}

.apt-badge--md {
  padding: var(--apt-badge-padding);
  height: 24px;
}

/* Variants - semantic colors only */
.apt-badge--neutral {
  background: var(--apt-color-ivory-200);
  color: var(--apt-color-earth-700);
  border: 1px solid var(--apt-border);
}

[data-theme="dark"] .apt-badge--neutral {
  background: var(--apt-color-earth-800);
  color: var(--apt-color-ivory-300);
  border-color: var(--apt-border);
}

.apt-badge--primary {
  background: var(--apt-accent-interdependence-wash);
  color: var(--apt-accent-interdependence);
  border: 1px solid color-mix(in srgb, var(--apt-accent-interdependence) 30%, transparent);
}

.apt-badge--success {
  background: var(--apt-color-state-canon-wash);
  color: var(--apt-color-state-canon);
  border: 1px solid color-mix(in srgb, var(--apt-color-state-canon) 30%, transparent);
}

.apt-badge--warning {
  background: var(--apt-color-state-caution-wash);
  color: var(--apt-color-state-caution);
  border: 1px solid color-mix(in srgb, var(--apt-color-state-caution) 30%, transparent);
}

.apt-badge--danger {
  background: var(--apt-color-state-alert-wash);
  color: var(--apt-color-state-alert);
  border: 1px solid color-mix(in srgb, var(--apt-color-state-alert) 30%, transparent);
}

.apt-badge--info {
  background: var(--apt-accent-witness-wash);
  color: var(--apt-accent-witness);
  border: 1px solid color-mix(in srgb, var(--apt-accent-witness) 30%, transparent);
}

/* Dot indicator */
.apt-badge--dot {
  padding-left: var(--apt-spacing-s4);
}

.apt-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentColor;
}

/* Removable */
.apt-badge--removable {
  padding-right: var(--apt-spacing-s2);
}

.apt-badge-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: var(--apt-spacing-s1);
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.6;
  border-radius: var(--apt-radius-r0);
  cursor: pointer;
  transition: opacity var(--apt-animation-fast), background-color var(--apt-animation-fast);
}

.apt-badge-remove:hover {
  opacity: 1;
  background: color-mix(in srgb, currentColor 15%, transparent);
}

.apt-badge-remove:focus-visible {
  outline: 2px solid var(--apt-focus-ring);
  outline-offset: 1px;
}

.apt-badge-remove svg {
  width: 12px;
  height: 12px;
}
</style>