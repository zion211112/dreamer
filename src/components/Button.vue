<script setup lang="ts">
interface ButtonProps {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

import { computed } from 'vue';

const props = defineProps<ButtonProps>();

const emit = defineEmits(['click']);

const buttonClasses = computed(() => [
  `apt-button--${props.variant ?? 'primary'}`,
  `apt-button--${props.size ?? 'md'}`,
  props.class,
]);

function handleClick(event: MouseEvent) {
  emit('click', event);
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="apt-button"
    :class="buttonClasses"
    @click="handleClick"
  >
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
  cursor: pointer;
  transition: all var(--apt-button-transition);
  font-family: inherit;
}

.apt-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apt-button--primary {
  background: var(--apt-button-primary-bg);
  border-color: var(--apt-button-primary-border);
  color: var(--apt-button-primary-text);
}

.apt-button--primary:hover:not(:disabled) {
  background: var(--apt-button-primary-hover-bg);
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
</style>

