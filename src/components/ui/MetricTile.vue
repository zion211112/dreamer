<script setup lang="ts">
/**
 * APT-LABS — MetricTile (shared kit).
 *
 * The readout cell used by the overview board, Value, and Benben-OS:
 * serif display value, mono unit, uppercase mono label, optional accent bar.
 * Consolidates the .ov-metric / .value-metric / .benben-metric variants so
 * every module reads numbers the same way.
 */
withDefaults(defineProps<{
  /** The displayed value (already formatted). */
  value: string;
  /** Small unit line under the value, e.g. 'KES disclosed'. */
  unit?: string;
  /** Uppercase mono label, e.g. 'In flight'. */
  label: string;
  /** Accent left bar (on by default for hero metrics). */
  accent?: boolean;
  /** data-state hook for tests/styles. */
  state?: string;
}>(), {
  unit: '',
  accent: true,
  state: '',
});
</script>

<template>
  <div class="apt-metric" :class="{ 'apt-metric--plain': !accent }" :data-state="state || undefined">
    <div class="apt-metric-value">{{ value }}</div>
    <div v-if="unit" class="apt-metric-unit">{{ unit }}</div>
    <div class="apt-metric-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.apt-metric {
  background: var(--apt-surface-page);
  padding: var(--apt-spacing-s6);
  border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  display: flex;
  flex-direction: column;
}

.apt-metric--plain {
  border-left: none;
  padding-left: 0;
}

.apt-metric-value {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-display, 2rem);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  line-height: 1;
  letter-spacing: -0.01em;
}

.apt-metric-unit {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-body-sm);
  letter-spacing: 0.04em;
  color: var(--apt-text-muted);
  margin-top: var(--apt-spacing-s1);
}

.apt-metric-label {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  margin-top: var(--apt-spacing-s3);
}
</style>
