<script setup lang="ts">
/**
 * APT-LABS — SectionHead (shared kit).
 *
 * Serif section title + dim one-line sub + optional mono count badge.
 * The house pattern behind Commons / Network / Records / Value sections,
 * consolidated so every module announces a section the same way.
 *
 * Pass `id` to get an aria-labelledby-ready heading (the title takes `${id}-h`).
 */
withDefaults(defineProps<{
  title: string;
  sub?: string;
  /** Trailing count badge (number or string, e.g. '38'). */
  count?: number | string;
  /** Optional id: title renders as `<h2 id="${id}-h">`, wrapper aria-labelledby. */
  id?: string;
  /** Heading level. */
  level?: 2 | 3;
}>(), {
  sub: '',
  count: undefined,
  id: '',
  level: 2,
});
</script>

<template>
  <div class="apt-sechead" :aria-labelledby="id ? `${id}-h` : undefined">
    <div>
      <component :is="level === 2 ? 'h2' : 'h3'" :id="id ? `${id}-h` : undefined" class="apt-sechead-title">
        {{ title }}
      </component>
      <p v-if="sub" class="apt-sechead-sub">{{ sub }}</p>
    </div>
    <span v-if="count !== undefined && count !== ''" class="apt-sechead-count" aria-label="Count">
      {{ count }}
    </span>
  </div>
</template>

<style scoped>
.apt-sechead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--apt-spacing-s6);
  flex-wrap: wrap;
  margin-bottom: var(--apt-spacing-s6);
}

.apt-sechead-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
  letter-spacing: -0.005em;
}

.apt-sechead-sub {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: var(--apt-spacing-s1) 0 0;
  line-height: var(--apt-line-height-normal);
  max-width: 72ch;
}

.apt-sechead-count {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--apt-text-muted);
  border: 1px solid var(--apt-border);
  border-radius: 999px;
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  min-width: 28px;
  text-align: center;
}
</style>
