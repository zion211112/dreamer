<script setup lang="ts">
/**
 * Select — Structural Emergence
 * Native select with consistent styling. No custom dropdown reinvention.
 */
import { computed, ref } from 'vue';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  modelValue?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  error?: string;
  helper?: string;
  multiple?: boolean;
}

const props = defineProps<SelectProps>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
  blur: [];
  focus: [];
}>();

const selectRef = ref<HTMLSelectElement | null>(null);
const selectId = computed(() => props.id ?? `apt-select-${Math.random().toString(36).slice(2, 9)}`);
const describedBy = computed(() => {
  const ids: string[] = [];
  if (props.error) ids.push(`${selectId.value}-error`);
  if (props.helper && !props.error) ids.push(`${selectId.value}-helper`);
  if (props.ariaDescribedBy) ids.push(props.ariaDescribedBy);
  return ids.join(' ') || undefined;
});

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
  emit('change', target.value);
}

function handleBlur() {
  emit('blur');
}

function handleFocus(event: FocusEvent) {
  emit('focus', event);
}
</script>

<template>
  <div class="apt-select-wrapper">
    <label v-if="$slots.label" :for="selectId" class="apt-select-label">
      <slot name="label" />
    </label>

    <div class="apt-select-field" :class="{ 'apt-select-field--error': error, 'apt-select-field--disabled': disabled }">
      <select
        ref="selectRef"
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :name="name"
        :multiple="multiple"
        :aria-label="ariaLabel"
        :aria-describedby="describedBy"
        :aria-invalid="ariaInvalid || Boolean(error)"
        class="apt-select"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <option v-if="placeholder" value="" disabled selected hidden>
          {{ placeholder }}
        </option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </select>
      <span class="apt-select-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>

    <p v-if="error" :id="`${selectId}-error`" class="apt-select-error" role="alert" aria-live="polite">
      {{ error }}
    </p>
    <p v-else-if="helper" :id="`${selectId}-helper`" class="apt-select-helper">
      {{ helper }}
    </p>
  </div>
</template>

<style scoped>
.apt-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
  width: 100%;
  font-family: var(--apt-font-sans);
}

.apt-select-label {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-body);
  line-height: var(--apt-line-height-normal);
}

.apt-select-field {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--apt-select-bg);
  border: var(--apt-input-border-width) var(--apt-input-border-style) var(--apt-select-border);
  border-radius: var(--apt-select-radius);
  transition:
    border-color var(--apt-select-transition),
    box-shadow var(--apt-select-transition),
    background-color var(--apt-select-transition);
}

.apt-select-field:focus-within {
  border-color: var(--apt-select-focus-border);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--apt-select-focus-border) 20%, transparent);
}

.apt-select-field--error {
  border-color: var(--apt-input-error-border);
  background: var(--apt-input-error-bg);
}

.apt-select-field--error:focus-within {
  border-color: var(--apt-input-error-border);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--apt-input-error-border) 20%, transparent);
}

.apt-select-field--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.apt-select {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: var(--apt-select-padding);
  padding-right: 40px;
  border: none;
  background: transparent;
  color: var(--apt-select-text);
  font-size: var(--apt-select-font-size);
  font-family: inherit;
  line-height: var(--apt-line-height-normal);
  outline: none;
  cursor: pointer;
  appearance: none;
}

.apt-select:disabled {
  cursor: not-allowed;
}

.apt-select option {
  background: var(--apt-surface-page);
  color: var(--apt-text-body);
  padding: var(--apt-spacing-s3) var(--apt-spacing-s4);
}

.apt-select-arrow {
  position: absolute;
  right: var(--apt-spacing-s4);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--apt-select-arrow-color);
  pointer-events: none;
}

.apt-select-arrow svg {
  width: 16px;
  height: 16px;
}

.apt-select-error {
  margin: 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-color-state-alert);
  line-height: var(--apt-line-height-normal);
}

.apt-select-helper {
  margin: 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-normal);
}
</style>