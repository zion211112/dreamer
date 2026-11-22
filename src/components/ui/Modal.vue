<script setup lang="ts">
/**
 * Modal — Structural Emergence
 * Focus-trapped, accessible dialog. Backdrop click closes.
 * No decorative animations, no arbitrary shadows.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

interface ModalProps {
  modelValue: boolean;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showClose?: boolean;
  class?: string;
}

const props = defineProps<ModalProps>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
  open: [];
}>();

const modalRef = ref<HTMLDivElement | null>(null);
const contentRef = ref<HTMLDivElement | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);
const previousActiveElement = ref<HTMLElement | null>(null);
const focusableElements = ref<HTMLElement[]>([]);
const isAnimating = ref(false);

const modalClasses = computed(() => [
  'apt-modal',
  `apt-modal--${props.size ?? 'md'}`,
  props.class,
].filter(Boolean));

const showModal = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

function handleBackdropClick(event: MouseEvent) {
  if (props.closeOnBackdrop !== false && event.target === event.currentTarget) {
    close();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closeOnEscape !== false) {
    close();
    return;
  }

  if (event.key === 'Tab') {
    trapFocus(event);
  }
}

function trapFocus(event: KeyboardEvent) {
  if (focusableElements.value.length === 0) return;

  const first = focusableElements.value[0];
  const last = focusableElements.value[focusableElements.value.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

function updateFocusableElements() {
  if (!contentRef.value) return;
  focusableElements.value = Array.from(
    contentRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ).filter(el => !el.disabled && !el.hasAttribute('aria-hidden'))
  );
}

function open() {
  previousActiveElement.value = document.activeElement as HTMLElement;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;

  nextTick(() => {
    updateFocusableElements();
    closeButtonRef.value?.focus();
    emit('open');
  });
}

function close() {
  isAnimating.value = true;
  emit('update:modelValue', false);
  emit('close');

  setTimeout(() => {
    isAnimating.value = false;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    previousActiveElement.value?.focus();
  }, 200);
}

watch(showModal, (val) => {
  if (val) open();
  else close();
});

onMounted(() => {
  if (props.modelValue) open();
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});
</script>

<template>
  <Transition name="apt-modal" appear>
    <div v-if="showModal" class="apt-modal-overlay" @click="handleBackdropClick" @keydown="handleKeydown" role="dialog" :aria-modal="true" :aria-labelledby="title ? 'apt-modal-title' : undefined" :aria-describedby="description ? 'apt-modal-description' : undefined">
      <div class="apt-modal-backdrop" aria-hidden="true" />
      <div ref="modalRef" :class="modalClasses" role="document">
        <header v-if="title || showClose || $slots.header" class="apt-modal-header">
          <slot name="header">
            <h2 v-if="title" id="apt-modal-title" class="apt-modal-title">{{ title }}</h2>
            <p v-if="description" id="apt-modal-description" class="apt-modal-description">{{ description }}</p>
          </slot>
          <button
            v-if="showClose"
            ref="closeButtonRef"
            type="button"
            class="apt-modal-close"
            @click="close"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div ref="contentRef" class="apt-modal-content">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="apt-modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.apt-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--apt-spacing-s6);
  z-index: var(--apt-z-index-modal);
  overflow-y: auto;
}

.apt-modal-backdrop {
  position: absolute;
  inset: 0;
  background: var(--apt-modal-backdrop);
  transition: opacity var(--apt-animation-fast);
}

.apt-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--apt-surface-page);
  border-radius: var(--apt-modal-radius);
  box-shadow: var(--apt-modal-shadow);
  border: 1px solid var(--apt-border);
  max-height: calc(100vh - var(--apt-spacing-s12));
  overflow: hidden;
  animation: apt-modal-slide-in var(--apt-animation-normal) ease-out;
}

.apt-modal--sm { width: 100%; max-width: 360px; }
.apt-modal--md { width: 100%; max-width: 480px; }
.apt-modal--lg { width: 100%; max-width: 640px; }
.apt-modal--xl { width: 100%; max-width: 800px; }
.apt-modal--full { width: 100%; max-width: 100%; max-height: 100vh; margin: 0; border-radius: 0; }

.apt-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-modal-header-padding);
  border-bottom: 1px solid var(--apt-modal-header-border);
  flex-shrink: 0;
}

.apt-modal-title {
  margin: 0;
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-text-strong);
  line-height: var(--apt-line-height-tight);
}

.apt-modal-description {
  margin: var(--apt-spacing-s2) 0 0;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  line-height: var(--apt-line-height-relaxed);
}

.apt-modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--apt-text-muted);
  border-radius: var(--apt-radius-r1);
  cursor: pointer;
  transition: background-color var(--apt-animation-fast), color var(--apt-animation-fast);
}

.apt-modal-close:hover {
  background: var(--apt-surface-raised);
  color: var(--apt-text-strong);
}

.apt-modal-close:focus-visible {
  outline: 2px solid var(--apt-focus-ring);
  outline-offset: 2px;
}

.apt-modal-close svg {
  width: 20px;
  height: 20px;
}

.apt-modal-content {
  padding: var(--apt-modal-body-padding);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.apt-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-modal-footer-padding);
  border-top: 1px solid var(--apt-modal-footer-border);
  flex-shrink: 0;
}

/* Animations */
.apt-modal-enter-active,
.apt-modal-leave-active {
  transition: opacity var(--apt-animation-fast);
}

.apt-modal-enter-from,
.apt-modal-leave-to {
  opacity: 0;
}

.apt-modal-enter-from .apt-modal,
.apt-modal-leave-active .apt-modal {
  transform: translateY(-20px) scale(0.95);
  opacity: 0;
}

.apt-modal-enter-to .apt-modal,
.apt-modal-leave-from .apt-modal {
  transform: translateY(0) scale(1);
  opacity: 1;
}

@keyframes apt-modal-slide-in {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .apt-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .apt-modal--sm,
  .apt-modal--md,
  .apt-modal--lg,
  .apt-modal--xl {
    width: 100%;
    max-width: 100%;
    max-height: 85vh;
    border-radius: var(--apt-radius-r3) var(--apt-radius-r3) 0 0;
    animation: apt-modal-slide-up var(--apt-animation-normal) ease-out;
  }

  @keyframes apt-modal-slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
}
</style>