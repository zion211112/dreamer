<script setup lang="ts">
/**
 * Button — Structural Emergence
 * Primary actions carry weight; ghost actions recede.
 * No decorative gradients, no arbitrary rounded corners.
 */
import { computed } from 'vue';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  class?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
}

const props = defineProps<ButtonProps>();
const emit = defineEmits<{ click: [MouseEvent] }>();

const buttonClasses = computed(() => [
  'apt-button',
  `apt-button--${props.variant ?? 'primary'}`,
  `apt-button--${props.size ?? 'md'}`,
  props.loading ? 'apt-button--loading' : '',
  props.class,
].filter(Boolean));

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :aria-label="ariaLabel"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="apt-button-spinner" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
        </path>
      </svg>
    </span>
    <slot />
  </button>
</template>

<style scoped>
.apt-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--apt-spacing-s2);
  border: var(--apt-button-border-width) var(--apt-button-border-style) var(--apt-button-primary-border);
  border-radius: var(--apt-button-radius);
  font-weight: var(--apt-button-font-weight);
  font-family: var(--apt-font-sans);
  cursor: pointer;
  transition:
    background-color var(--apt-button-transition),
    border-color var(--apt-button-transition),
    color var(--apt-button-transition),
    box-shadow var(--apt-button-transition),
    transform var(--apt-animation-instant);
  white-space: nowrap;
  text-decoration: none;
  line-height: 1;
}

.apt-button:disabled,
.apt-button--loading {
  opacity: var(--apt-button-disabled-opacity);
  cursor: not-allowed;
}

.apt-button:focus-visible {
  outline: 2px solid var(--apt-focus-ring);
  outline-offset: 2px;
}

.apt-button:active:not(:disabled) {
  transform: scale(0.98);
}

/* Variants */
.apt-button--primary {
  background: var(--apt-button-primary-bg);
  border-color: var(--apt-button-primary-border);
  color: var(--apt-button-primary-text);
}

.apt-button--primary:hover:not(:disabled) {
  background: var(--apt-button-primary-hover-bg);
  border-color: var(--apt-button-primary-hover-border);
}

.apt-button--secondary {
  background: var(--apt-button-secondary-bg);
  border-color: var(--apt-button-secondary-border);
  color: var(--apt-button-secondary-text);
}

.apt-button--secondary:hover:not(:disabled) {
  background: var(--apt-button-secondary-hover-bg);
  border-color: var(--apt-button-secondary-hover-bg);
}

.apt-button--ghost {
  background: var(--apt-button-ghost-bg);
  border-color: var(--apt-button-ghost-border);
  color: var(--apt-button-ghost-text);
}

.apt-button--ghost:hover:not(:disabled) {
  background: var(--apt-button-ghost-hover-bg);
  color: var(--apt-button-ghost-hover-text);
}

.apt-button--outline {
  background: var(--apt-button-outline-bg);
  border-color: var(--apt-button-outline-border);
  color: var(--apt-button-outline-text);
}

.apt-button--outline:hover:not(:disabled) {
  background: var(--apt-button-outline-hover-bg);
  border-color: var(--apt-button-outline-hover-border);
}

/* Sizes */
.apt-button--sm {
  padding: var(--apt-button-padding-sm);
  font-size: var(--apt-button-font-size-sm);
}

.apt-button--md {
  padding: var(--apt-button-padding-md);
  font-size: var(--apt-button-font-size-md);
}

.apt-button--lg {
  padding: var(--apt-button-padding-lg);
  font-size: var(--apt-button-font-size-lg);
}

/* Loading spinner */
.apt-button-spinner {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  animation: apt-spin 1s linear infinite;
}

.apt-button-spinner svg {
  width: 100%;
  height: 100%;
}

@keyframes apt-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>