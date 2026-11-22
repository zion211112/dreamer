<script setup lang="ts">
/**
 * APT-LABS — EmptyState (shared kit).
 *
 * The honest first-use / zero-match box every module already hand-rolls:
 * dashed border, centered, one quiet explanation, one next step.
 * The `action` slot carries the CTA (usually a RouterLink) so the
 * component never invents where the user should go.
 */
withDefaults(defineProps<{
  /** Optional mono kicker, e.g. 'First use'. */
  kicker?: string;
  /** The state name, in the module's own words. */
  title: string;
  /** One sentence of quiet explanation. */
  body?: string;
  /** Dashed (first-use) or solid (zero-match) border. */
  variant?: 'quiet' | 'nomatch';
}>(), {
  kicker: '',
  body: '',
  variant: 'quiet',
});
</script>

<template>
  <div
    class="apt-empty"
    :class="`apt-empty--${variant}`"
    role="region"
    :aria-label="title"
  >
    <p v-if="kicker" class="apt-empty-kicker">{{ kicker }}</p>
    <h2 class="apt-empty-title">{{ title }}</h2>
    <p v-if="body" class="apt-empty-body">{{ body }}</p>
    <div v-if="$slots.action" class="apt-empty-action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.apt-empty {
  padding: var(--apt-spacing-s10);
  border: 1px dashed var(--apt-border);
  border-radius: var(--apt-radius-r3);
  background: var(--apt-color-neutral-n0, var(--apt-surface-default));
  text-align: center;
}

.apt-empty--nomatch {
  border-style: solid;
}

.apt-empty-kicker {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--apt-text-dim);
  margin: 0 0 var(--apt-spacing-s4);
}

.apt-empty-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3);
  color: var(--apt-text-body);
}

.apt-empty-body {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0 auto;
  max-width: 48ch;
  line-height: var(--apt-line-height-relaxed);
}

.apt-empty-action {
  margin-top: var(--apt-spacing-s6);
}

.apt-empty-action :deep(a),
.apt-empty-action :deep(button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 var(--apt-spacing-s8);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
  color: var(--apt-color-neutral-n0, #fff);
  font-size: var(--apt-font-size-body-sm);
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.apt-empty-action :deep(a):focus-visible,
.apt-empty-action :deep(button):focus-visible {
  outline: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  outline-offset: 2px;
}
</style>
