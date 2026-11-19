<script setup lang="ts">
import { computed } from 'vue';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  modelValue?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  min?: number;
  step?: number;
  inputClass?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

const props = defineProps<InputProps>();

const emit = defineEmits(['update:modelValue', 'input', 'blur']);

const inputClasses = computed(() => ['apt-input', props.inputClass].filter(Boolean));

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
  emit('input', target.value);
}

function handleBlur() {
  emit('blur');
}
</script>

<template>
  <input
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    :disabled="disabled"
    :required="required"
    :id="id"
    :name="name"
    :autocomplete="autoComplete"
    :min="min"
    :step="step"
    :class="inputClasses"
    :aria-invalid="props['aria-invalid']"
    :aria-describedby="props['aria-describedby']"
    @input="handleInput"
    @blur="handleBlur"
  />
</template>

<style scoped>
.apt-input {
  width: 100%;
  padding: var(--apt-input-padding);
  border: var(--apt-input-border-width) var(--apt-input-border-style) var(--apt-input-border);
  border-radius: var(--apt-input-radius);
  background: var(--apt-input-bg);
  color: var(--apt-input-text);
  font-size: var(--apt-input-font-size);
  font-family: inherit;
  transition: border-color var(--apt-input-transition);
}

.apt-input:focus {
  outline: none;
  border-color: var(--apt-input-focus-border);
}

.apt-input::placeholder {
  color: var(--apt-input-placeholder);
}

.apt-input:disabled {
  background: var(--apt-input-disabled-bg);
  cursor: not-allowed;
}
</style>

