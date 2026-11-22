<script setup lang="ts">
/**
 * APT-LABS — ToggleSwitch: an accessible on/off control for SettingsRow.
 *
 *   <ToggleSwitch v-model="settings.showFlowRail" :aria-label="'Show flow rail'" />
 *
 * Renders a button with role="switch"; keyboard: Enter/Space toggles.
 */
const props = withDefaults(defineProps<{
  modelValue: boolean;
  /** Accessible name when not inside a labelled SettingsRow group. */
  'aria-label'?: string;
  disabled?: boolean;
}>(), {
  'aria-label': '',
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

function toggle(): void {
  if (props.disabled) return;
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    class="toggle-switch"
    :class="{ 'toggle-switch--on': modelValue, 'toggle-switch--disabled': disabled }"
    :aria-checked="modelValue"
    :aria-label="ariaLabel || undefined"
    :disabled="disabled"
    @click="toggle"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
  >
    <span class="toggle-switch-track" aria-hidden="true">
      <span class="toggle-switch-thumb" />
    </span>
  </button>
</template>

<style scoped>
.toggle-switch {
  display: inline-flex;
  align-items: center;
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
}

.toggle-switch:disabled {
  cursor: not-allowed;
}

.toggle-switch:focus-visible {
  outline: none;
}

.toggle-switch:focus-visible .toggle-switch-track {
  outline: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  outline-offset: 2px;
}

.toggle-switch-track {
  position: relative;
  display: block;
  width: 38px;
  height: 22px;
  border-radius: 11px;
  background: var(--apt-color-neutral-n3, color-mix(in srgb, var(--apt-text-strong) 22%, transparent));
  border: 1px solid color-mix(in srgb, var(--apt-text-strong) 14%, transparent);
  transition: background-color var(--apt-animation-fast), border-color var(--apt-animation-fast);
}

.toggle-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--apt-surface-page);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform var(--apt-animation-fast);
}

.toggle-switch--on .toggle-switch-track {
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
  border-color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.toggle-switch--on .toggle-switch-thumb {
  transform: translateX(16px);
}

.toggle-switch--disabled {
  opacity: 0.5;
}
</style>
