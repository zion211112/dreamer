<script setup lang="ts">
/**
 * APT-LABS — Workspace shell.
 *
 * Four columns, exactly the apt-commons-instrument contract:
 *   64px module rail | 232px module nav | fluid content | 360px agent dock
 * under a 54px topbar. The shell owns the frame and cross-module chrome; each
 * module page fills only the content column. One owner per region, disjoint
 * write scopes (AGENTS.md).
 */
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { moduleForPath, WORKSPACE_MODULES } from './registry'
import { iconSvg } from './icons'
import ModuleRail from './ModuleRail.vue'
import ModuleNav from './ModuleNav.vue'
import AgentDock from './AgentDock.vue'

const route = useRoute()
const active = computed(() => moduleForPath(route.path))
const query = ref('')

// The agent is a summoned instrument, not a permanent wall: it slides in from
// the right on demand (topbar toggle, ⌘/Ctrl+J, Esc to close) so the content
// column owns the whole pane by default.
const dockOpen = ref(false)
function toggleDock() { dockOpen.value = !dockOpen.value }
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); toggleDock() }
  else if (e.key === 'Escape') { dockOpen.value = false }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

// Active module drives the [data-module] accent for the whole frame.
const dataModule = computed(() => active.value.id)

// Topbar placeholder copy is module-aware, not invented per page.
const searchPlaceholder = computed(() => {
  const m = active.value
  return `Search ${m.railLabel.toLowerCase()} — ${m.primitive.toLowerCase()}`
})
</script>

<template>
  <div class="ws" :data-module="dataModule">
    <!-- ── Topbar ─────────────────────────────────────────────── -->
    <header class="ws-topbar">
      <RouterLink to="/workspace" class="ws-brand">
        <b>APT</b>·LABS
      </RouterLink>
      <span class="ws-crumb">
        Workspace<span class="ws-crumb-sep">/</span>
        <span class="ws-crumb-mod">{{ active.title }}</span>
      </span>

      <div class="ws-search">
        <svg viewBox="0 0 24 24" class="ws-search-ico"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input v-model="query" :placeholder="searchPlaceholder" aria-label="Search the workspace" />
      </div>

      <div class="ws-actions">
        <RouterLink to="/workspace/records" class="ws-btn">Export</RouterLink>
        <RouterLink to="/workspace/commons" class="ws-btn ws-btn-hot">+ New inquiry</RouterLink>
        <button
          type="button"
          class="ws-agent-toggle"
          :class="{ 'ws-agent-toggle--on': dockOpen }"
          :aria-expanded="dockOpen"
          @click="toggleDock"
        >
          <svg viewBox="0 0 24 24" class="ws-agent-ico" aria-hidden="true"><path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7z" /><path d="M18 14l.8 2.2 2.2.8-2.2.8L18 20l-.8-2.2-2.2-.8 2.2-.8z" /></svg>
          <span>Agent</span><kbd>⌘J</kbd>
        </button>
      </div>
    </header>

    <!-- ── Four-column app grid ───────────────────────────────── -->
    <div class="ws-app">
      <ModuleRail :active="active.id" :modules="WORKSPACE_MODULES" />
      <ModuleNav :module="active" />
      <main class="ws-content">
        <RouterView />
      </main>
      <AgentDock :module="active" :open="dockOpen" @close="dockOpen = false" />
    </div>
  </div>
</template>

<style scoped>
.ws {
  --olive: var(--apt-module-accent, var(--apt-color-brand-primary));
  --olive-pale: color-mix(in srgb, var(--olive) 12%, var(--apt-surface-default));
  --line: color-mix(in srgb, var(--apt-text-strong) 12%, transparent);
  --line-strong: color-mix(in srgb, var(--apt-text-strong) 24%, transparent);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--apt-surface-default);
  color: var(--apt-text-body);
  font: var(--apt-font-size-body-md) / 1.55 var(--apt-font-sans);
}

/* Topbar */
.ws-topbar {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
  height: 54px;
  padding: 0 var(--apt-spacing-s9);
  background: var(--apt-surface-page);
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.ws-brand {
  font: 700 var(--apt-font-size-body-md) / 1 var(--apt-font-mono);
  letter-spacing: 0.12em;
  color: var(--apt-text-strong);
  text-decoration: none;
  white-space: nowrap;
}
.ws-brand b { color: var(--olive); font-weight: 700; }
.ws-crumb {
  font: 500 var(--apt-font-size-body-sm) / 1 var(--apt-font-mono);
  letter-spacing: 0.06em;
  color: var(--apt-text-muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.ws-crumb-sep { color: var(--apt-text-dim); }
.ws-crumb-mod { color: var(--olive); }

.ws-search {
  flex: 1;
  max-width: 420px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r1);
  padding: 8px 12px;
  background: var(--apt-surface-default);
  transition: border-color var(--apt-animation-fast);
}
.ws-search:focus-within { border-color: var(--olive); }
.ws-search-ico { width: 15px; height: 15px; stroke: var(--apt-text-dim); fill: none; stroke-width: 1.7; flex-shrink: 0; }
.ws-search input { flex: 1; border: none; background: none; outline: none; font: var(--apt-font-size-body-sm) / 1 var(--apt-font-sans); color: var(--apt-text-strong); }
.ws-search input::placeholder { color: var(--apt-text-dim); }

.ws-actions { margin-left: auto; display: flex; align-items: center; gap: var(--apt-spacing-s4); }
.ws-btn {
  font: 600 var(--apt-font-size-body-sm) / 1 var(--apt-font-sans);
  padding: 9px 15px;
  border-radius: var(--apt-radius-r1);
  border: 1px solid var(--line);
  background: var(--apt-surface-default);
  color: var(--apt-text-body);
  text-decoration: none;
  white-space: nowrap;
  transition: all var(--apt-animation-fast);
}
.ws-btn:hover { border-color: var(--line-strong); background: var(--apt-surface-raised); }
.ws-btn-hot { background: var(--olive); color: var(--apt-surface-page); border-color: var(--olive); }
.ws-btn-hot:hover { filter: brightness(1.06); }

/* App grid — the agent is an on-demand overlay, not a permanent 4th column. */
.ws-app {
  position: relative;
  display: grid;
  grid-template-columns: 64px 232px minmax(0, 1fr);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.ws-content { min-width: 0; overflow-y: auto; background: var(--apt-surface-default); }

/* Agent toggle (topbar) — the instrument control that summons the dock. */
.ws-agent-toggle {
  display: inline-flex; align-items: center; gap: 7px;
  min-height: 36px; padding: 0 12px;
  border: 1px solid var(--line); border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-default); color: var(--apt-text-body);
  font: 600 var(--apt-font-size-body-sm) / 1 var(--apt-font-sans);
  cursor: pointer; white-space: nowrap;
  transition: all var(--apt-animation-fast);
}
.ws-agent-toggle:hover { border-color: var(--line-strong); background: var(--apt-surface-raised); }
.ws-agent-toggle--on { background: var(--olive); color: var(--apt-surface-page); border-color: var(--olive); }
.ws-agent-ico { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 1.6; flex-shrink: 0; }
.ws-agent-toggle kbd {
  font: 500 9px / 1 var(--apt-font-mono); letter-spacing: 0.04em;
  padding: 2px 5px; border: 1px solid var(--line); border-radius: 4px; color: var(--apt-text-dim);
}
.ws-agent-toggle--on kbd { border-color: color-mix(in srgb, var(--apt-surface-page) 40%, transparent); color: var(--apt-surface-page); opacity: 0.8; }

@media (max-width: 1180px) {
  .ws-app { grid-template-columns: 64px 232px minmax(0, 1fr); }
}
@media (max-width: 820px) {
  .ws-app { grid-template-columns: 64px minmax(0, 1fr); }
  .ws-app > .module-nav { display: none; }
  .ws-search { max-width: 200px; }
  .ws-agent-toggle span { display: none; }
}
</style>
