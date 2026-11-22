<script setup lang="ts">
/**
 * APT-LABS — Workspace shell (lean masterpiece).
 *
 * Four columns under a 54px topbar:
 *   64px module rail | 232px module nav | fluid content | 360px agent dock
 *
 * Per charter B3, each shell pane has one job; no duplicate navigation systems.
 * Topbar: working-context identity. Rail: module switching. Sidebar:
 * within-module context only. Main: work surface. Dock: contextual per-module
 * change-set/evidence strip.
 *
 * The shell owns the frame and cross-module chrome; each module page fills
 * only the content column. One owner per region, disjoint write scopes.
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
const dockOpen = ref(false)

function toggleDock() { dockOpen.value = !dockOpen.value }

function onKeydown(e: KeyboardEvent) {
  const isMeta = e.metaKey || e.ctrlKey
  if (isMeta && e.key.toLowerCase() === 'j') { e.preventDefault(); toggleDock(); return }
  if (isMeta && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    ;(document.querySelector('.ws-search input') as HTMLInputElement | null)?.focus()
    return
  }
  const modIndex = Number(e.key) - 1
  if (isMeta && modIndex >= 0 && modIndex < WORKSPACE_MODULES.length) {
    e.preventDefault()
    ;(window as any).router?.push(WORKSPACE_MODULES[modIndex].path)
    return
  }
  if (e.key === 'Escape') dockOpen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

const dataModule = computed(() => active.value.id)
const searchPlaceholder = computed(() => `Search ${active.value.railLabel.toLowerCase()} — ${active.value.primitive.toLowerCase()}`)
</script>

<template>
  <div class="ws" :data-module="dataModule">
    <!-- Topbar -->
    <header class="ws-topbar">
      <RouterLink to="/workspace" class="ws-brand"><b>APT</b>·LABS</RouterLink>
      <span class="ws-crumb">Workspace<span class="ws-crumb-sep">/</span><span class="ws-crumb-mod">{{ active.title }}</span></span>
      <div class="ws-search"><svg viewBox="0 0 24 24" class="ws-search-ico"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg><input v-model="query" :placeholder="searchPlaceholder" aria-label="Search the workspace" /></div>
      <div class="ws-actions">
        <RouterLink to="/workspace/records" class="ws-btn">Export</RouterLink>
        <RouterLink to="/workspace/commons" class="ws-btn ws-btn-hot">+ New inquiry</RouterLink>
        <button type="button" class="ws-agent-toggle" :class="{ 'ws-agent-toggle--on': dockOpen }" :aria-expanded="dockOpen" @click="toggleDock"><svg viewBox="0 0 24 24" class="ws-agent-ico" aria-hidden="true"><path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7z" /><path d="M18 14l.8 2.2 2.2.8-2.2.8L18 20l-.8-2.2-2.2-.8 2.2-.8z" /></svg><span>Agent</span><kbd>⌘J</kbd></button>
      </div>
    </header>

    <!-- App grid: rail | nav | content | dock overlay -->
    <div class="ws-app">
      <ModuleRail :active="active.id" :modules="WORKSPACE_MODULES" />
      <ModuleNav :module="active" />
      <main class="ws-content"><RouterView /></main>
      <AgentDock :module="active" :open="dockOpen" @close="dockOpen = false" />
    </div>
  </div>
</template>

<style scoped>
.ws {
  --line: color-mix(in srgb, var(--apt-text-strong) 12%, transparent);
  display: flex; flex-direction: column; height: 100vh; overflow: hidden;
  background: var(--apt-surface-default); color: var(--apt-text-body);
  font: var(--apt-font-size-body-md) / 1.55 var(--apt-font-sans);
}
.ws-topbar { display: flex; align-items: center; gap: var(--apt-spacing-s6); height: 54px; padding: 0 var(--apt-spacing-s9); background: var(--apt-surface-page); border-bottom: 1px solid var(--line); flex-shrink: 0; }
.ws-brand { font: 700 var(--apt-font-size-body-md) / 1 var(--apt-font-mono); letter-spacing: 0.12em; color: var(--apt-text-strong); text-decoration: none; white-space: nowrap; }
.ws-brand b { color: var(--apt-module-accent, var(--apt-color-brand-primary)); font-weight: 700; }
.ws-crumb { font: 500 var(--apt-font-size-body-sm) / 1 var(--apt-font-mono); letter-spacing: 0.06em; color: var(--apt-text-muted); display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.ws-crumb-sep { color: var(--apt-text-dim); }
.ws-crumb-mod { color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.ws-search { flex: 1; max-width: 420px; display: flex; align-items: center; gap: 9px; border: 1px solid var(--line); border-radius: var(--apt-radius-r1); padding: 8px 12px; background: var(--apt-surface-default); transition: border-color var(--apt-animation-fast); }
.ws-search:focus-within { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.ws-search-ico { width: 15px; height: 15px; stroke: var(--apt-text-dim); fill: none; stroke-width: 1.7; flex-shrink: 0; }
.ws-search input { flex: 1; border: none; background: none; outline: none; font: var(--apt-font-size-body-sm) / 1 var(--apt-font-sans); color: var(--apt-text-strong); }
.ws-search input::placeholder { color: var(--apt-text-dim); }
.ws-actions { margin-left: auto; display: flex; align-items: center; gap: var(--apt-spacing-s4); }
.ws-btn { font: 600 var(--apt-font-size-body-sm) / 1 var(--apt-font-sans); padding: 9px 15px; border-radius: var(--apt-radius-r1); border: 1px solid var(--line); background: var(--apt-surface-default); color: var(--apt-text-body); text-decoration: none; white-space: nowrap; transition: all var(--apt-animation-fast); }
.ws-btn:hover { border-color: var(--line-strong); background: var(--apt-surface-raised); }
.ws-btn-hot { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-surface-page); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.ws-btn-hot:hover { filter: brightness(1.06); }
.ws-app { position: relative; display: grid; grid-template-columns: 64px 232px minmax(0, 1fr); flex: 1; min-height: 0; overflow: hidden; }
.ws-content { min-width: 0; overflow-y: auto; background: var(--apt-surface-default); }
.ws-agent-toggle { display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 12px; border: 1px solid var(--line); border-radius: var(--apt-radius-r1); background: var(--apt-surface-default); color: var(--apt-text-body); font: 600 var(--apt-font-size-body-sm) / 1 var(--apt-font-sans); cursor: pointer; white-space: nowrap; transition: all var(--apt-animation-fast); }
.ws-agent-toggle:hover { border-color: var(--line-strong); background: var(--apt-surface-raised); }
.ws-agent-toggle--on { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-surface-page); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.ws-agent-ico { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 1.6; flex-shrink: 0; }
.ws-agent-toggle kbd { font: 500 9px / 1 var(--apt-font-mono); letter-spacing: 0.04em; padding: 2px 5px; border: 1px solid var(--line); border-radius: 4px; color: var(--apt-text-dim); }
.ws-agent-toggle--on kbd { border-color: color-mix(in srgb, var(--apt-surface-page) 40%, transparent); color: var(--apt-surface-page); opacity: 0.8; }

@media (max-width: 1180px) { .ws-app { grid-template-columns: 64px 232px minmax(0, 1fr); } }
@media (max-width: 820px) { .ws-app { grid-template-columns: 64px minmax(0, 1fr); } .ws-app > .module-nav { display: none; } .ws-search { max-width: 200px; } .ws-agent-toggle span { display: none; } }
@media (max-width: 640px) { .ws-topbar { font-size: var(--apt-font-size-sm-3); gap: var(--apt-spacing-s1); padding: var(--apt-spacing-s1) var(--apt-spacing-s6); } }
</style>
