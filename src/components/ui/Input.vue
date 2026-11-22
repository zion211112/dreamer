<script setup lang="ts">
/**
 * Input — Structural Emergence
 * Precise, accessible, no decorative flourishes.
 * Structure: label → input → helper/error
 */
import { computed, ref } from 'vue';

type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel';

interface InputProps {
  modelValue?: string;
  type?: InputType;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  id?: string;
  name?: string;
  autocomplete?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  error?: string;
  helper?: string;
}

const props = defineProps<InputProps>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
  input: [value: string];
  blur: [];
  focus: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const inputId = computed(() => props.id ?? `apt-input-${Math.random().toString(36).slice(2, 9)}`);
const describedBy = computed(() => {
  const ids: string[] = [];
  if (props.error) ids.push(`${inputId.value}-error`);
  if (props.helper && !props.error) ids.push(`${inputId.value}-helper`);
  if (props.ariaDescribedBy) ids.push(props.ariaDescribedBy);
  return ids.join(' ') || undefined;
});

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
  emit('input', target.value);
}

function handleBlur() {
  emit('blur');
}

function handleFocus(event: FocusEvent) {
  emit('focus', event);
}
</script>

<template>
  <div class="apt-input-wrapper">
    <label v-if="$slots.label" :for="inputId" class="apt-input-label">
      <slot name="label" />
    </label>

    <div class="apt-input-field" :class="{ 'apt-input-field--error': error, 'apt-input-field--disabled': disabled }">
      <slot name="prefix" />
      <input
        ref="inputRef"
        :id="inputId"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :name="name"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        :aria-label="ariaLabel"
        :aria-describedby="describedBy"
        :aria-invalid="ariaInvalid || Boolean(error)"
        :aria-readonly="readonly"
        class="apt-input"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <slot name="suffix" />
    </div>

    <p v-if="error" :id="`${inputId}-error`" class="apt-input-error" role="alert" aria-live="polite">
      {{ error }}
    </p>
    <p v-else-if="helper" :id="`${inputId}-helper`" class="apt-input-helper">
      {{ helper }}
    </p>
  </div>
</template>

<style scoped>
.apt-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
  width: 100%;
  font-family: var(--apt-font-sans);
}

.apt-input-label {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-body);
  line-height: var(--apt-line-height-normal);
}

.apt-input-field {
  display: flex;
  align-items: center;
  position: relative;
  background: var(--apt-input-bg);
  border: var(--apt-input-border-width) var(--apt-input-border-style) var(--apt-input-border);
  border-radius: var(--apt-input-radius);
  transition:
    border-color var(--apt-input-transition),
    box-shadow var(--apt-input-transition),
    background-color var(--apt-input-transition);
}

.apt-input-field:focus-within {
  border-color: var(--apt-input-focus-border);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--apt-input-focus-ring) 20%, transparent);
}

.apt-input-field--error {
  border-color: var(--apt-input-error-border);
  background: var(--apt-input-error-bg);
}

.apt-input-field--error:focus-within {
  border-color: var(--apt-input-error-border);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--apt-input-error-border) 20%, transparent);
}

.apt-input-field--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.apt-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: var(--apt-input-padding);
  border: none;
  background: transparent;
  color: var(--apt-input-text);
  font-size: var(--apt-input-font-size);
  font-family: inherit;
  line-height: var(--apt-line-height-normal);
  outline: none;
}

.apt-input::placeholder {
  color: var(--apt-input-placeholder);
}

.apt-input:disabled {
  cursor: not-allowed;
}

.apt-input-field :global(.apt-input-prefix),
.apt-input-field :global(.apt-input-suffix) {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--apt-spacing-s4);
  color: var(--apt-text-dim);
  font-size: var(--apt-font-size-body-sm);
}

.apt-input-error {
  margin: 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-color-state-alert);
  line-height: var(--apt-line-height-normal);
}

.apt-input-helper {
  margin: 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-normal);
}
</style>