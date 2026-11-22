<script setup lang="ts">
/**
 * Tooltip — Structural Emergence
 * Contextual information on hover/focus. No decorative arrows, no arbitrary positioning.
 * Uses CSS anchor positioning where available, fallback otherwise.
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
  class?: string;
}

const props = defineProps<TooltipProps>();
const emit = defineEmits<{ show: []; hide: [] }>();

const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
const showTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const hideTimer = ref<ReturnType<typeof setTimeout> | null>(null);

const tooltipClasses = computed(() => [
  'apt-tooltip',
  `apt-tooltip--${props.placement ?? 'top'}`,
  props.class,
].filter(Boolean));

function show() {
  if (props.disabled || isVisible.value) return;
  clearTimeout(hideTimer.value);
  showTimer.value = setTimeout(() => {
    isVisible.value = true;
    emit('show');
    nextTick(positionTooltip);
  }, props.delay ?? 150);
}

function hide() {
  if (!isVisible.value) return;
  clearTimeout(showTimer.value);
  hideTimer.value = setTimeout(() => {
    isVisible.value = false;
    emit('hide');
  }, 50);
}

function positionTooltip() {
  if (!triggerRef.value || !tooltipRef.value) return;

  const trigger = triggerRef.value.getBoundingClientRect();
  const tooltip = tooltipRef.value.getBoundingClientRect();
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const gap = 8;
  const arrowSize = 6;

  let top = 0;
  let left = 0;
  let transform = '';

  switch (props.placement ?? 'top') {
    case 'top':
      left = trigger.left + trigger.width / 2 - tooltip.width / 2;
      top = trigger.top - tooltip.height - gap;
      transform = 'translateX(-50%)';
      if (left < gap) left = gap;
      if (left + tooltip.width > viewport.width - gap) left = viewport.width - tooltip.width - gap;
      break;
    case 'bottom':
      left = trigger.left + trigger.width / 2 - tooltip.width / 2;
      top = trigger.bottom + gap;
      transform = 'translateX(-50%)';
      if (left < gap) left = gap;
      if (left + tooltip.width > viewport.width - gap) left = viewport.width - tooltip.width - gap;
      break;
    case 'left':
      left = trigger.left - tooltip.width - gap;
      top = trigger.top + trigger.height / 2 - tooltip.height / 2;
      transform = 'translateY(-50%)';
      if (top < gap) top = gap;
      if (top + tooltip.height > viewport.height - gap) top = viewport.height - tooltip.height - gap;
      break;
    case 'right':
      left = trigger.right + gap;
      top = trigger.top + trigger.height / 2 - tooltip.height / 2;
      transform = 'translateY(-50%)';
      if (top < gap) top = gap;
      if (top + tooltip.height > viewport.height - gap) top = viewport.height - tooltip.height - gap;
      break;
  }

  tooltipRef.value.style.left = `${left}px`;
  tooltipRef.value.style.top = `${top}px`;
  tooltipRef.value.style.transform = transform;
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    hide();
    triggerRef.value?.focus();
  }
}

onMounted(() => {
  window.addEventListener('scroll', positionTooltip, { passive: true });
  window.addEventListener('resize', positionTooltip);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', positionTooltip);
  window.removeEventListener('resize', positionTooltip);
  clearTimeout(showTimer.value);
  clearTimeout(hideTimer.value);
});
</script>

<template>
  <span
    ref="triggerRef"
    class="apt-tooltip-trigger"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
    @keydown="handleTriggerKeydown"
    aria-describedby="apt-tooltip-content"
  >
    <slot />
  </span>

  <Transition name="apt-tooltip">
    <div
      v-if="isVisible"
      ref="tooltipRef"
      :class="tooltipClasses"
      id="apt-tooltip-content"
      role="tooltip"
      aria-hidden="false"
    >
      <div class="apt-tooltip-content">{{ content }}</div>
      <div class="apt-tooltip-arrow" aria-hidden="true" />
    </div>
  </Transition>
</template>

<style scoped>
.apt-tooltip-trigger {
  display: inline-flex;
  cursor: help;
}

.apt-tooltip {
  position: fixed;
  z-index: var(--apt-tooltip-z-index);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--apt-animation-fast);
}

.apt-tooltip-content {
  padding: var(--apt-tooltip-padding);
  background: var(--apt-tooltip-bg);
  color: var(--apt-tooltip-text);
  border-radius: var(--apt-tooltip-radius);
  font-size: var(--apt-tooltip-font-size);
  font-family: var(--apt-font-sans);
  line-height: var(--apt-line-height-normal);
  white-space: nowrap;
  max-width: 280px;
  box-shadow: var(--apt-tooltip-shadow);
  word-wrap: break-word;
}

.apt-tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: var(--apt-tooltip-arrow-size) solid transparent;
}

.apt-tooltip--top .apt-tooltip-arrow {
  bottom: calc(var(--apt-tooltip-arrow-size) * -1);
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--apt-tooltip-bg);
  border-bottom: none;
}

.apt-tooltip--bottom .apt-tooltip-arrow {
  top: calc(var(--apt-tooltip-arrow-size) * -1);
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--apt-tooltip-bg);
  border-top: none;
}

.apt-tooltip--left .apt-tooltip-arrow {
  right: calc(var(--apt-tooltip-arrow-size) * -1);
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--apt-tooltip-bg);
  border-right: none;
}

.apt-tooltip--right .apt-tooltip-arrow {
  left: calc(var(--apt-tooltip-arrow-size) * -1);
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--apt-tooltip-bg);
  border-left: none;
}

/* Animation */
.apt-tooltip-enter-active,
.apt-tooltip-leave-active {
  transition: opacity var(--apt-animation-fast), transform var(--apt-animation-fast);
}

.apt-tooltip-enter-from,
.apt-tooltip-leave-to {
  opacity: 0;
}

.apt-tooltip--top.enter-from,
.apt-tooltip--top.leave-to { transform: translateX(-50%) translateY(4px); }
.apt-tooltip--bottom.enter-from,
.apt-tooltip--bottom.leave-to { transform: translateX(-50%) translateY(-4px); }
.apt-tooltip--left.enter-from,
.apt-tooltip--left.leave-to { transform: translateY(-50%) translateX(4px); }
.apt-tooltip--right.enter-from,
.apt-tooltip--right.leave-to { transform: translateY(-50%) translateX(-4px); }
</style>