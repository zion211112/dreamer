<script setup lang="ts">
/**
 * Dropdown — Structural Emergence
 * Menu triggered by button. Keyboard navigable, focus trapped.
 * No decorative animations, no arbitrary positioning.
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';

interface DropdownItem {
  label: string;
  value?: string;
  disabled?: boolean;
  divider?: boolean;
  icon?: any;
  danger?: boolean;
  shortcut?: string;
}

interface DropdownProps {
  trigger: string;
  items: DropdownItem[];
  placement?: 'bottom' | 'top' | 'left' | 'right';
  align?: 'start' | 'end' | 'center';
  disabled?: boolean;
  class?: string;
}

interface DropdownEmits {
  select: [value: string, item: DropdownItem];
  open: [];
  close: [];
}

const props = defineProps<DropdownProps>();
const emit = defineEmits<DropdownEmits>();

const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLDivElement | null>(null);
const isOpen = ref(false);
const focusedIndex = ref(-1);
const itemsRef = ref<HTMLElement[]>([]);

const dropdownClasses = computed(() => [
  'apt-dropdown',
  `apt-dropdown--${props.placement ?? 'bottom'}`,
  `apt-dropdown--align-${props.align ?? 'start'}`,
  props.class,
].filter(Boolean));

function toggle(event: MouseEvent) {
  if (props.disabled) return;
  if (isOpen.value) {
    close();
  } else {
    open();
  }
  event.stopPropagation();
}

function open() {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;
  focusedIndex.value = -1;
  emit('open');
  nextTick(() => {
    updateItemsRef();
    positionMenu();
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeydown);
  });
}

function close() {
  if (!isOpen.value) return;
  isOpen.value = false;
  focusedIndex.value = -1;
  emit('close');
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleKeydown);
  triggerRef.value?.focus();
}

function handleOutsideClick(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    if (triggerRef.value && !triggerRef.value.contains(event.target as Node)) {
      close();
    }
  }
}

function handleKeydown(event: KeyboardEvent) {
  const enabledItems = props.items.filter((_, i) => !props.items[i].disabled && !props.items[i].divider);

  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      close();
      break;
    case 'ArrowDown':
      event.preventDefault();
      focusNext();
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusPrev();
      break;
    case 'Home':
      event.preventDefault();
      focusFirst();
      break;
    case 'End':
      event.preventDefault();
      focusLast();
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (focusedIndex.value >= 0) {
        selectItem(focusedIndex.value);
      }
      break;
    case 'Tab':
      close();
      break;
  }
}

function focusNext() {
  for (let i = focusedIndex.value + 1; i < props.items.length; i++) {
    if (!props.items[i].disabled && !props.items[i].divider) {
      focusedIndex.value = i;
      scrollToItem(i);
      return;
    }
  }
  // Wrap to first
  focusFirst();
}

function focusPrev() {
  for (let i = focusedIndex.value - 1; i >= 0; i--) {
    if (!props.items[i].disabled && !props.items[i].divider) {
      focusedIndex.value = i;
      scrollToItem(i);
      return;
    }
  }
  // Wrap to last
  focusLast();
}

function focusFirst() {
  for (let i = 0; i < props.items.length; i++) {
    if (!props.items[i].disabled && !props.items[i].divider) {
      focusedIndex.value = i;
      scrollToItem(i);
      return;
    }
  }
}

function focusLast() {
  for (let i = props.items.length - 1; i >= 0; i--) {
    if (!props.items[i].disabled && !props.items[i].divider) {
      focusedIndex.value = i;
      scrollToItem(i);
      return;
    }
  }
}

function scrollToItem(index: number) {
  nextTick(() => {
    itemsRef.value[index]?.scrollIntoView({ block: 'nearest' });
  });
}

function updateItemsRef() {
  if (!menuRef.value) return;
  itemsRef.value = Array.from(
    menuRef.value.querySelectorAll<HTMLElement>('[role="menuitem"]')
  );
}

function selectItem(index: number) {
  const item = props.items[index];
  if (item.disabled || item.divider) return;
  emit('select', item.value ?? item.label, item);
  close();
}

function handleItemClick(index: number) {
  selectItem(index);
}

function positionMenu() {
  if (!triggerRef.value || !menuRef.value) return;

  const trigger = triggerRef.value.getBoundingClientRect();
  const menu = menuRef.value.getBoundingClientRect();
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const gap = 4;

  let top = 0;
  let left = 0;

  const placement = props.placement ?? 'bottom';
  const align = props.align ?? 'start';

  switch (placement) {
    case 'bottom':
      top = trigger.bottom + gap;
      left = align === 'start' ? trigger.left
        : align === 'end' ? trigger.right - menu.width
        : trigger.left + trigger.width / 2 - menu.width / 2;
      if (left < gap) left = gap;
      if (left + menu.width > viewport.width - gap) left = viewport.width - menu.width - gap;
      if (top + menu.height > viewport.height - gap) top = trigger.top - menu.height - gap;
      break;
    case 'top':
      top = trigger.top - menu.height - gap;
      left = align === 'start' ? trigger.left
        : align === 'end' ? trigger.right - menu.width
        : trigger.left + trigger.width / 2 - menu.width / 2;
      if (left < gap) left = gap;
      if (left + menu.width > viewport.width - gap) left = viewport.width - menu.width - gap;
      if (top < gap) top = trigger.bottom + gap;
      break;
    case 'left':
      left = trigger.left - menu.width - gap;
      top = trigger.top + trigger.height / 2 - menu.height / 2;
      if (top < gap) top = gap;
      if (top + menu.height > viewport.height - gap) top = viewport.height - menu.height - gap;
      if (left < gap) { left = trigger.right + gap; }
      break;
    case 'right':
      left = trigger.right + gap;
      top = trigger.top + trigger.height / 2 - menu.height / 2;
      if (top < gap) top = gap;
      if (top + menu.height > viewport.height - gap) top = viewport.height - menu.height - gap;
      if (left + menu.width > viewport.width - gap) { left = trigger.left - menu.width - gap; }
      break;
  }

  menuRef.value.style.top = `${top}px`;
  menuRef.value.style.left = `${left}px`;
}

watch(isOpen, (val) => {
  if (val) {
    nextTick(positionMenu);
  }
});

onMounted(() => {
  window.addEventListener('scroll', positionMenu, { passive: true });
  window.addEventListener('resize', positionMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', positionMenu);
  window.removeEventListener('resize', positionMenu);
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div :class="dropdownClasses">
    <button
      ref="triggerRef"
      type="button"
      class="apt-dropdown-trigger"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <span class="apt-dropdown-trigger-label">{{ trigger }}</span>
      <span class="apt-dropdown-trigger-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>

    <Transition name="apt-dropdown">
      <div
        v-if="isOpen"
        ref="menuRef"
        class="apt-dropdown-menu"
        role="menu"
        aria-orientation="vertical"
        style="position: fixed; z-index: var(--apt-dropdown-z-index);"
      >
        <template v-for="(item, index) in items" :key="index">
          <div
            v-if="item.divider"
            class="apt-dropdown-divider"
            role="separator"
            aria-hidden="true"
          />
          <button
            v-else
            type="button"
            role="menuitem"
            :class="[
              'apt-dropdown-item',
              item.disabled ? 'apt-dropdown-item--disabled' : '',
              item.danger ? 'apt-dropdown-item--danger' : '',
              index === focusedIndex ? 'apt-dropdown-item--focused' : '',
            ]"
            :aria-disabled="item.disabled"
            :tabindex="index === focusedIndex ? 0 : -1"
            @click="handleItemClick(index)"
            @mouseenter="focusedIndex = index"
            @focus="focusedIndex = index"
          >
            <span v-if="item.icon" class="apt-dropdown-item-icon" aria-hidden="true">
              <component :is="item.icon" />
            </span>
            <span class="apt-dropdown-item-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="apt-dropdown-item-shortcut" aria-hidden="true">{{ item.shortcut }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.apt-dropdown {
  display: inline-flex;
  position: relative;
}

.apt-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--apt-spacing-s2);
  padding: var(--apt-spacing-s3) var(--apt-spacing-s6);
  min-height: var(--apt-input-height);
  border: var(--apt-input-border-width) var(--apt-input-border-style) var(--apt-input-border);
  border-radius: var(--apt-input-radius);
  background: var(--apt-input-bg);
  color: var(--apt-input-text);
  font-size: var(--apt-font-size-body-md);
  font-family: var(--apt-font-sans);
  font-weight: var(--apt-font-weight-medium);
  cursor: pointer;
  transition:
    border-color var(--apt-input-transition),
    box-shadow var(--apt-input-transition);
}

.apt-dropdown-trigger:hover:not(:disabled) {
  border-color: var(--apt-border-strong);
}

.apt-dropdown-trigger:focus-visible {
  outline: 2px solid var(--apt-focus-ring);
  outline-offset: 2px;
}

.apt-dropdown-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apt-dropdown-trigger[aria-expanded="true"] {
  border-color: var(--apt-focus-ring);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--apt-focus-ring) 20%, transparent);
}

.apt-dropdown-trigger-arrow {
  display: inline-flex;
  width: 16px;
  height: 16px;
  color: var(--apt-text-dim);
  flex-shrink: 0;
  transition: transform var(--apt-animation-fast);
}

.apt-dropdown-trigger[aria-expanded="true"] .apt-dropdown-trigger-arrow {
  transform: rotate(180deg);
}

.apt-dropdown-trigger-arrow svg {
  width: 14px;
  height: 14px;
}

.apt-dropdown-menu {
  min-width: var(--apt-dropdown-min-width);
  max-width: 320px;
  padding: var(--apt-dropdown-padding);
  background: var(--apt-dropdown-bg);
  border: 1px solid var(--apt-dropdown-border);
  border-radius: var(--apt-dropdown-radius);
  box-shadow: var(--apt-dropdown-shadow);
  outline: none;
}

.apt-dropdown-divider {
  height: 1px;
  background: var(--apt-dropdown-divider);
  margin: var(--apt-spacing-s2) calc(var(--apt-dropdown-padding) * -1);
}

.apt-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s3);
  width: 100%;
  padding: var(--apt-dropdown-item-padding);
  border: none;
  background: transparent;
  color: var(--apt-dropdown-item-text);
  font-size: var(--apt-font-size-body-sm);
  font-family: var(--apt-font-sans);
  text-align: left;
  border-radius: var(--apt-dropdown-item-radius);
  cursor: pointer;
  transition: background-color var(--apt-animation-fast), color var(--apt-animation-fast);
  white-space: nowrap;
}

.apt-dropdown-item:hover:not(.apt-dropdown-item--disabled) {
  background: var(--apt-dropdown-item-hover-bg);
  color: var(--apt-dropdown-item-hover-text);
}

.apt-dropdown-item:focus-visible {
  outline: 2px solid var(--apt-focus-ring);
  outline-offset: -2px;
}

.apt-dropdown-item--focused {
  background: var(--apt-dropdown-item-hover-bg);
  color: var(--apt-dropdown-item-hover-text);
}

.apt-dropdown-item--disabled {
  color: var(--apt-text-dim);
  cursor: not-allowed;
  opacity: 0.5;
}

.apt-dropdown-item--danger {
  color: var(--apt-color-state-alert);
}

.apt-dropdown-item--danger:hover:not(.apt-dropdown-item--disabled) {
  background: var(--apt-color-state-alert-wash);
  color: var(--apt-color-state-alert);
}

.apt-dropdown-item-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--apt-text-muted);
}

.apt-dropdown-item:not(.apt-dropdown-item--danger):hover .apt-dropdown-item-icon {
  color: var(--apt-text-body);
}

.apt-dropdown-item-shortcut {
  font-size: var(--apt-font-size-micro);
  font-family: var(--apt-font-mono);
  color: var(--apt-text-dim);
  margin-left: auto;
}

/* Animation */
.apt-dropdown-enter-active,
.apt-dropdown-leave-active {
  transition: opacity var(--apt-animation-fast), transform var(--apt-animation-fast);
}

.apt-dropdown-enter-from,
.apt-dropdown-leave-to {
  opacity: 0;
}

.apt-dropdown--bottom .apt-dropdown-enter-from,
.apt-dropdown--bottom .apt-dropdown-leave-to {
  transform: translateY(-4px);
}

.apt-dropdown--top .apt-dropdown-enter-from,
.apt-dropdown--top .apt-dropdown-leave-to {
  transform: translateY(4px);
}

.apt-dropdown--left .apt-dropdown-enter-from,
.apt-dropdown--left .apt-dropdown-leave-to {
  transform: translateX(4px);
}

.apt-dropdown--right .apt-dropdown-enter-from,
.apt-dropdown--right .apt-dropdown-leave-to {
  transform: translateX(-4px);
}
</style>