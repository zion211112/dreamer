<script setup lang="ts">
/**
 * APT-LABS — SettingsPanel (dsh `settings` drawer pattern, made ours).
 *
 * A right-anchored drawer for preferences and configuration: one job per
 * pane, mono-micro section heads, labelled rows. Content is composed via
 * slots so the panel never owns the settings model:
 *
 *   <SettingsPanel :open="open" title="Preferences" @close="open = false">
 *     <section class="sp-section">
 *       <h3 class="sp-section-title">Reading</h3>
 *       <SettingsRow label="…">…control…</SettingsRow>
 *     </section>
 *   </SettingsPanel>
 *
 * The .sp-section / .sp-section-title classes are intentionally global
 * (unscoped) so callers can style sections against the same tokens.
 */
withDefaults(defineProps<{
  open: boolean;
  title?: string;
  /** Short context line under the title, e.g. the active module. */
  context?: string;
}>(), {
  title: 'Settings',
  context: '',
});

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <aside
    class="settings-panel"
    :class="{ 'settings-panel--open': open }"
    :aria-hidden="!open"
    :aria-label="title"
  >
    <div class="settings-panel-head">
      <div>
        <div class="settings-panel-title">{{ title }}</div>
        <div v-if="context" class="settings-panel-context">{{ context }}</div>
      </div>
      <button
        type="button"
        class="settings-panel-close"
        aria-label="Close settings"
        @click="emit('close')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>

    <div v-if="open" class="settings-panel-body">
      <slot />
    </div>

    <p class="settings-panel-note">Local-first. Preferences apply to this browser only.</p>
  </aside>
</template>

<style scoped>
.settings-panel {
  --line: color-mix(in srgb, var(--apt-text-strong) 12%, transparent);
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 380px;
  max-width: 100%;
  z-index: 25;
  display: flex;
  flex-direction: column;
  background: var(--apt-surface-page);
  border-left: 1px solid var(--line);
  box-shadow: -18px 0 44px -34px rgba(0, 0, 0, 0.5);
  transform: translateX(100%);
  visibility: hidden;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.28s;
}

.settings-panel--open {
  transform: translateX(0);
  visibility: visible;
}

.settings-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-spacing-s9);
  padding-bottom: 0;
  margin-bottom: var(--apt-spacing-s6);
}

.settings-panel-title {
  font: 600 var(--apt-font-size-body-md) / 1 var(--apt-font-serif);
  color: var(--apt-text-strong);
}

.settings-panel-context {
  font: 500 10px / 1.3 var(--apt-font-mono);
  letter-spacing: 0.04em;
  color: var(--apt-text-dim);
  margin-top: var(--apt-spacing-s1);
}

.settings-panel-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--apt-radius-r1);
  border: 1px solid var(--line);
  background: var(--apt-surface-default);
  color: var(--apt-text-dim);
  cursor: pointer;
  transition: all var(--apt-animation-fast);
}

.settings-panel-close svg {
  width: 15px;
  height: 15px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.8;
}

@media (hover: hover) and (pointer: fine) {
  .settings-panel-close:hover {
    color: var(--apt-text-strong);
    background: var(--apt-surface-raised);
  }
}

.settings-panel-close:focus-visible {
  outline: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  outline-offset: 2px;
}

.settings-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--apt-spacing-s9);
}

.settings-panel-note {
  margin: var(--apt-spacing-s6) var(--apt-spacing-s9);
  font: 500 9px / 1.4 var(--apt-font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  text-align: center;
}

/* Shared section styling for slot content (global, token-based). */
:global(.sp-section) {
  margin-bottom: var(--apt-spacing-s8);
}

:global(.sp-section-title) {
  font: 600 9.5px / 1 var(--apt-font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  margin: 0 0 var(--apt-spacing-s4);
}
</style>
