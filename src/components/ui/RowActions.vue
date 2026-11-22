<script setup lang="ts">
/**
 * APT-LABS — RowActions (dsh `file-actions`/`context-menu` pattern, made ours).
 *
 * Compact row-level actions for records: a "⋯" button that opens an inline
 * accessible menu. The component never owns the actions' handlers — callers
 * pass a list and receive the label of the chosen action:
 *
 *   <RowActions :label="record.ref" @select="(name) => act(name, record)" />
 *
 *   const actions: RowAction[] = [
 *     { name: 'view', label: 'View' },
 *     { name: 'copy-link', label: 'Copy link' },
 *     { name: 'supersede', label: 'Supersede' },
 *     { name: 'export', label: 'Export', danger: false },
 *   ];
 *
 * Accessibility: aria-expanded on the trigger, role=menu/menuitem, focus
 * management (Enter/Space opens, ↑/↓ move, Esc closes and restores focus),
 * no hover-only state.
 */
import { computed, nextTick, ref } from 'vue';

export interface RowAction {
  name: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<{
  /** What the menu acts on, for the accessible label. */
  target: string;
  actions: RowAction[];
}>(), {
  actions: () => [],
});

const emit = defineEmits<{ select: [name: string] }>();

const open = ref(false);
const btn = ref<HTMLElement | null>(null);
const menu = ref<HTMLElement | null>(null);
const items = ref<Array<HTMLElement | null>>([]);

const menuId = computed(
  () => `row-actions-${props.target.replace(/\W+/g, '-').toLowerCase()}`,
);

function toggle(): void {
  open.value = !open.value;
}

function close(refocus: boolean): void {
  open.value = false;
  if (refocus && btn.value) void nextTick(() => btn.value?.focus());
}

function onKeydown(e: KeyboardEvent): void {
  const list = items.value.filter((el): el is HTMLElement => el !== null);
  const i = list.indexOf(document.activeElement as HTMLElement);

  if (e.key === 'Escape') {
    e.stopPropagation();
    close(true);
    return;
  }
  if (!open.value) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    (list[(i + 1) % list.length] ?? list[0])?.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    (list[(i - 1 + list.length) % list.length] ?? list[0])?.focus();
  }
}

function onOutsideClick(e: MouseEvent): void {
  if (!open.value) return;
  const inBtn = btn.value?.contains(e.target as Node) ?? false;
  const inMenu = menu.value?.contains(e.target as Node) ?? false;
  if (!inBtn && !inMenu) close(false);
}

function choose(name: string): void {
  close(true);
  emit('select', name);
}

function setItemRef(el: unknown, i: number): void {
  items.value[i] = el as HTMLElement | null;
}

function handleDocumentClick(e: Event): void {
  onOutsideClick(e as MouseEvent);
}

// Attach/detach the outside-click listener only while open.
import { onBeforeUnmount, watch } from 'vue';

watch(open, (val) => {
  if (val) {
    document.addEventListener('click', handleDocumentClick);
    void nextTick(() => (items.value[0] as HTMLElement | null)?.focus());
  } else {
    document.removeEventListener('click', handleDocumentClick);
  }
});
onBeforeUnmount(() => document.removeEventListener('click', handleDocumentClick));
</script>

<template>
  <div class="row-actions">
    <button
      ref="btn"
      type="button"
      class="row-actions-trigger"
      :aria-expanded="open"
      :aria-haspopup="'menu'"
      :aria-controls="menuId"
      :aria-label="`Actions for ${target}`"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span class="row-actions-glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
      </span>
    </button>

    <Transition name="row-actions-pop">
      <div
        v-if="open"
        ref="menu"
        :id="menuId"
        role="menu"
        aria-label="Row actions"
        class="row-actions-menu"
        @keydown="onKeydown"
      >
        <button
          v-for="(action, i) in actions"
          :key="action.name"
          :ref="(el) => setItemRef(el, i)"
          type="button"
          role="menuitem"
          class="row-actions-item"
          :class="{ 'row-actions-item--danger': action.danger, 'row-actions-item--disabled': action.disabled }"
          :disabled="action.disabled"
          @click="choose(action.name)"
        >
          {{ action.label }}
          <span v-if="action.danger" class="row-actions-flag" aria-hidden="true">!</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.row-actions {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.row-actions-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--apt-radius-r1);
  border: 1px solid transparent;
  background: transparent;
  color: var(--apt-text-dim);
  cursor: pointer;
  transition: color var(--apt-animation-fast), border-color var(--apt-animation-fast),
    background-color var(--apt-animation-fast);
}

.row-actions-trigger[aria-expanded='true'] {
  border-color: var(--apt-border);
  background: var(--apt-surface-raised);
  color: var(--apt-text-strong);
}

.row-actions-trigger:focus-visible {
  outline: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  outline-offset: 2px;
}

.row-actions-glyph svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

@media (hover: hover) and (pointer: fine) {
  .row-actions-trigger:hover {
    border-color: var(--apt-border);
    background: var(--apt-surface-raised);
    color: var(--apt-text-strong);
  }
}

.row-actions-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 148px;
  z-index: 30;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-page);
  box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.55);
}

.row-actions-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s4);
  min-height: 34px;
  padding: 0 var(--apt-spacing-s4);
  border: 0;
  border-radius: var(--apt-radius-r1);
  background: transparent;
  font: 500 var(--apt-font-size-sm-3) / 1.2 var(--apt-font-sans);
  color: var(--apt-text-body);
  cursor: pointer;
  text-align: left;
}

.row-actions-item:focus-visible {
  outline: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  outline-offset: -2px;
}

.row-actions-item--danger {
  color: var(--apt-color-family-governance, var(--apt-text-strong));
}

.row-actions-item--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.row-actions-flag {
  font: 600 var(--apt-font-mono);
  letter-spacing: 0.06em;
}

.row-actions-pop-enter-active,
.row-actions-pop-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.row-actions-pop-enter-from,
.row-actions-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
