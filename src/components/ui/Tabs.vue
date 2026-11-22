<script setup lang="ts">
/**
 * Tabs — Structural Emergence
 * Content switching with clear affordance. Indicator follows selection.
 * No decorative animations, no arbitrary underlines.
 */
import { computed, ref, watch, nextTick, onMounted } from 'vue';

interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
  count?: number;
  icon?: any;
}

interface TabsProps {
  modelValue: string;
  tabs: TabItem[];
  variant?: 'line' | 'enclosed' | 'soft';
  orientation?: 'horizontal' | 'vertical';
  class?: string;
}

const props = defineProps<TabsProps>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const tabsRef = ref<HTMLDivElement | null>(null);
const indicatorRef = ref<HTMLElement | null>(null);
const activeTabRef = ref<HTMLElement | null>(null);

const tabsClasses = computed(() => [
  'apt-tabs',
  `apt-tabs--${props.variant ?? 'line'}`,
  `apt-tabs--${props.orientation ?? 'horizontal'}`,
  props.class,
].filter(Boolean));

function handleTabClick(tab: TabItem) {
  if (!tab.disabled) {
    emit('update:modelValue', tab.key);
    emit('change', tab.key);
  }
}

function handleKeydown(event: KeyboardEvent, tab: TabItem, index: number) {
  if (tab.disabled) return;

  let newIndex = index;
  const isHorizontal = props.orientation !== 'vertical';

  if ((isHorizontal && event.key === 'ArrowRight') || (!isHorizontal && event.key === 'ArrowDown')) {
    event.preventDefault();
    newIndex = findNextEnabled(index);
  } else if ((isHorizontal && event.key === 'ArrowLeft') || (!isHorizontal && event.key === 'ArrowUp')) {
    event.preventDefault();
    newIndex = findPrevEnabled(index);
  } else if (event.key === 'Home') {
    event.preventDefault();
    newIndex = findFirstEnabled();
  } else if (event.key === 'End') {
    event.preventDefault();
    newIndex = findLastEnabled();
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleTabClick(tab);
    return;
  } else {
    return;
  }

  if (newIndex !== index && props.tabs[newIndex]) {
    const nextTab = props.tabs[newIndex];
    if (!nextTab.disabled) {
      handleTabClick(nextTab);
      nextTick(() => {
        const el = tabsRef.value?.querySelector(`[data-tab-key="${nextTab.key}"]`) as HTMLElement;
        el?.focus();
      });
    }
  }
}

function findNextEnabled(index: number): number {
  for (let i = index + 1; i < props.tabs.length; i++) {
    if (!props.tabs[i].disabled) return i;
  }
  return index;
}

function findPrevEnabled(index: number): number {
  for (let i = index - 1; i >= 0; i--) {
    if (!props.tabs[i].disabled) return i;
  }
  return index;
}

function findFirstEnabled(): number {
  return props.tabs.findIndex(t => !t.disabled);
}

function findLastEnabled(): number {
  for (let i = props.tabs.length - 1; i >= 0; i--) {
    if (!props.tabs[i].disabled) return i;
  }
  return 0;
}

function updateIndicator() {
  nextTick(() => {
    if (!indicatorRef.value || !activeTabRef.value || !tabsRef.value) return;

    const container = tabsRef.value;
    const active = activeTabRef.value;
    const indicator = indicatorRef.value;

    if (props.orientation === 'vertical') {
      indicator.style.height = `${active.offsetHeight}px`;
      indicator.style.transform = `translateY(${active.offsetTop}px)`;
      indicator.style.width = '';
      indicator.style.left = '';
      indicator.style.bottom = '';
    } else {
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.transform = `translateX(${active.offsetLeft}px)`;
      indicator.style.height = '';
      indicator.style.top = '';
      indicator.style.right = '';
    }
  });
}

watch(() => props.modelValue, updateIndicator);
watch(() => props.tabs, updateIndicator);
onMounted(updateIndicator);

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const orientation = computed(() => props.orientation ?? 'horizontal');
const variant = computed(() => props.variant ?? 'line');
</script>

<template>
  <div
    ref="tabsRef"
    :class="tabsClasses"
    :role="orientation === 'vertical' ? 'tablist' : 'tablist'"
    :aria-orientation="orientation"
  >
    <div
      v-if="variant === 'line' || variant === 'soft'"
      class="apt-tabs-indicator"
      ref="indicatorRef"
      aria-hidden="true"
    />
    <button
      v-for="(tab, index) in tabs"
      :key="tab.key"
      :data-tab-key="tab.key"
      :class="[
        'apt-tab',
        tab.key === modelValue ? 'apt-tab--active' : '',
        tab.disabled ? 'apt-tab--disabled' : '',
      ]"
      :aria-selected="tab.key === modelValue"
      :aria-disabled="tab.disabled"
      :tabindex="tab.key === modelValue ? 0 : -1"
      :role="'tab'"
      :id="`apt-tab-${tab.key}`"
      :aria-controls="`apt-tabpanel-${tab.key}`"
      @click="handleTabClick(tab)"
      @keydown="e => handleKeydown(e, tab, index)"
      ref="activeTabRef"
    >
      <span v-if="tab.icon" class="apt-tab-icon" aria-hidden="true">
        <component :is="tab.icon" />
      </span>
      <span class="apt-tab-label">{{ tab.label }}</span>
      <span v-if="tab.count !== undefined && tab.count > 0" class="apt-tab-count" :aria-label="`${tab.count} items`">
        {{ tab.count }}
      </span>
    </button>
  </div>

  <div
    v-for="tab in tabs"
    :key="tab.key"
    :role="'tabpanel'"
    :id="`apt-tabpanel-${tab.key}`"
    :aria-labelledby="`apt-tab-${tab.key}`"
    :hidden="tab.key !== modelValue"
    class="apt-tabpanel"
  >
    <slot :name="tab.key" />
  </div>
</template>

<style scoped>
.apt-tabs {
  display: flex;
  font-family: var(--apt-font-sans);
  position: relative;
}

.apt-tabs--horizontal {
  flex-direction: row;
  align-items: flex-end;
}

.apt-tabs--vertical {
  flex-direction: column;
  align-items: flex-start;
}

/* Indicator */
.apt-tabs-indicator {
  position: absolute;
  background: var(--apt-tabs-indicator-bg);
  border-radius: var(--apt-radius-r0);
  transition: all var(--apt-animation-fast);
  pointer-events: none;
  z-index: 1;
}

.apt-tabs--horizontal .apt-tabs-indicator {
  bottom: 0;
  height: var(--apt-tabs-indicator-height);
  left: 0;
}

.apt-tabs--vertical .apt-tabs-indicator {
  right: 0;
  width: var(--apt-tabs-indicator-height);
  top: 0;
}

/* Variants */
.apt-tabs--enclosed {
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-raised);
}

.apt-tabs--enclosed .apt-tab {
  border-radius: var(--apt-radius-r1);
  margin: var(--apt-spacing-s1);
}

.apt-tabs--enclosed .apt-tabs-indicator {
  background: var(--apt-module-accent, var(--apt-action-primary));
}

.apt-tabs--soft {
  background: var(--apt-surface-raised);
  border-radius: var(--apt-radius-r2);
  padding: var(--apt-spacing-s1);
}

.apt-tabs--soft .apt-tab {
  border-radius: var(--apt-radius-r1);
}

.apt-tabs--soft .apt-tabs-indicator {
  background: var(--apt-surface-page);
  box-shadow: var(--apt-shadow-sh1);
}

.apt-tabs--soft .apt-tab--active {
  background: var(--apt-surface-page);
}

/* Tab button */
.apt-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--apt-tabs-gap);
  padding: var(--apt-tabs-padding);
  min-height: var(--apt-tabs-height);
  border: none;
  background: transparent;
  color: var(--apt-tabs-text);
  font-size: var(--apt-tabs-font-size);
  font-weight: var(--apt-tabs-font-weight);
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--apt-animation-fast);
  position: relative;
  z-index: 2;
}

.apt-tab:hover:not(.apt-tab--disabled) {
  color: var(--apt-tabs-hover-text);
}

.apt-tab:focus-visible {
  outline: 2px solid var(--apt-focus-ring);
  outline-offset: 2px;
  border-radius: var(--apt-radius-r1);
}

.apt-tab--active {
  color: var(--apt-tabs-active-text);
}

.apt-tab--disabled {
  color: var(--apt-text-dim);
  cursor: not-allowed;
  opacity: 0.5;
}

.apt-tab-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: inherit;
}

.apt-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 var(--apt-spacing-s2);
  font-size: var(--apt-font-size-micro);
  font-weight: var(--apt-font-weight-semibold);
  font-family: var(--apt-font-mono);
  color: var(--apt-text-dim);
  background: var(--apt-surface-default);
  border-radius: var(--apt-radius-r10);
}

.apt-tab--active .apt-tab-count {
  color: var(--apt-text-strong);
  background: var(--apt-surface-raised);
}

/* Tab panel */
.apt-tabpanel {
  padding: var(--apt-spacing-s6) 0;
  animation: apt-fade-in var(--apt-animation-fast) ease;
}

@keyframes apt-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Vertical variant adjustments */
.apt-tabs--vertical .apt-tab {
  width: 100%;
  justify-content: flex-start;
  text-align: left;
  padding: var(--apt-spacing-s3) var(--apt-spacing-s5);
}

.apt-tabs--vertical.apt-tabs--enclosed .apt-tab {
  margin: var(--apt-spacing-s1) var(--apt-spacing-s1) var(--apt-spacing-s1) 0;
  border-radius: 0 var(--apt-radius-r1) var(--apt-radius-r1) 0;
}

.apt-tabs--vertical.apt-tabs--soft .apt-tab {
  margin: var(--apt-spacing-s1);
}
</style>