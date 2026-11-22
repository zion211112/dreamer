<script setup lang="ts">
/**
 * APT-LABS — SettingsRow: one labelled preference row for SettingsPanel.
 *
 *   <SettingsRow label="Flow rail" hint="Show the chain on every module page">
 *     <ToggleSwitch :model-value="settings.showFlowRail" @update:model-value="..." />
 *   </SettingsRow>
 *
 * The control (toggle, select, buttons) is the default slot, right-aligned.
 */
withDefaults(defineProps<{
  label: string;
  hint?: string;
}>(), {
  hint: '',
});
</script>

<template>
  <div class="settings-row">
    <div class="settings-row-text">
      <span class="settings-row-label" :id="`row-${label.replace(/\W+/g, '-').toLowerCase()}`">{{ label }}</span>
      <p v-if="hint" class="settings-row-hint">{{ hint }}</p>
    </div>
    <div class="settings-row-control" role="group" :aria-label="label">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  padding: var(--apt-spacing-s4) 0;
  border-bottom: 1px solid color-mix(in srgb, var(--apt-text-strong) 8%, transparent);
}

.settings-row:last-child {
  border-bottom: 0;
}

.settings-row-text {
  min-width: 0;
}

.settings-row-label {
  display: block;
  font: 500 var(--apt-font-size-body-sm) / 1.3 var(--apt-font-sans);
  color: var(--apt-text-strong);
}

.settings-row-hint {
  margin: 2px 0 0;
  font: 400 var(--apt-font-size-sm-3) / 1.4 var(--apt-font-sans);
  color: var(--apt-text-dim);
}

.settings-row-control {
  flex: none;
  display: flex;
  align-items: center;
}
</style>
