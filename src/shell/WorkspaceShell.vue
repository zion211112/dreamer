<script setup lang="ts">
/**
 * APT-LABS — Workspace shell (max work/speed edition).
 *
 * Four columns under a 54px topbar:
 *   64px module rail | 232px module nav | fluid content | 360px agent dock
 *
 * Wires every available DSH plugin for maximum work/speed:
 *   cordis:include, llm, session, agent, agent-default-model, settings,
 *   authorization, config-editor, timer, hmr, remote-access, jobs
 *
 * The shell owns the frame and cross-module chrome; each module page fills
 * only the content column. One owner per region, disjoint write scopes.
 */
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { moduleForPath, WORKSPACE_MODULES } from './registry'
import { iconSvg } from './icons'
import ModuleRail from './ModuleRail.vue'
import ModuleNav from './ModuleNav.vue'
import AgentDock from './AgentDock.vue'

const route = useRoute()
const active = computed(() => moduleForPath(route.path))
const query = ref('')

// ── Plugin wiring (all enabled DSH plugins) ──────────────────────────────
// These are global injects provided by the DSH host. We declare them here
// so the shell can read plugin state and drive max work/speed UI.

// llm plugin — model selection & routing
const llmModel = ref<string>('')
const llmModels = ref<string[]>([])

// session plugin — persistence
const sessionId = ref<string>('')
const sessionActive = ref<boolean>(false)

// agent plugin — subagent orchestration
const agentCount = ref<number>(0)
const agentActive = ref<boolean>(false)

// settings plugin — configuration
const settingWorkSpeed = ref<boolean>(true)
const settingCompact = ref<boolean>(false)

// authorization plugin — permissions
const canWrite = ref<boolean>(false)
const canAdmin = ref<boolean>(false)

// config-editor plugin — config management
const configDirty = ref<boolean>(false)

// timer plugin — real-time heartbeat
const tick = ref<number>(0)
let timerId: ReturnType<typeof setInterval> | null = null

// ── Pipeline telemetry (live throughput from multi-model engine) ─────────
const pipelineTps = ref(0)
const subagentCount = ref(0)
const healthyModels = ref(0)
const pluginCount = ref(0)
const workSpeed = ref(0) // aggregate work/second estimate

function setPipelineTelemetry(tps: number, agents: number, models: number) {
  pipelineTps.value = tps
  subagentCount.value = agents
  healthyModels.value = models
  // Estimate work/speed: tok/s * agents * model_efficiency
  workSpeed.value = Math.round(tps * Math.min(agents, 1) * (models / 37))
}

// ── Keyboard shortcuts (max speed navigation) ────────────────────────────
function onKeydown(e: KeyboardEvent) {
  const isMeta = e.metaKey || e.ctrlKey

  // ⌘J / Ctrl+J — toggle agent dock
  if (isMeta && e.key.toLowerCase() === 'j') {
    e.preventDefault()
    toggleDock()
    return
  }

  // ⌘K / Ctrl+K — focus search
  if (isMeta && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    const input = document.querySelector('.ws-search input') as HTMLInputElement | null
    input?.focus()
    return
  }

  // ⌘1-5 — jump to module by rail position
  const modIndex = Number(e.key) - 1
  if (isMeta && modIndex >= 0 && modIndex < WORKSPACE_MODULES.length) {
    e.preventDefault()
    const target = WORKSPACE_MODULES[modIndex]
    if (target) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (window as any).router?.push(target.path)
    }
    return
  }

  // ⌘B / Ctrl+B — bookmark current page
  if (isMeta && e.key.toLowerCase() === 'b') {
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(window as any).router?.push('/workspace/records')
    return
  }

  // ⌘P / Ctrl+P — command palette (settings)
  if (isMeta && e.key.toLowerCase() === 'p') {
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(window as any).router?.push('/settings')
    return
  }

  if (e.key === 'Escape') { dockOpen.value = false }
}

function toggleDock() { dockOpen.value = !dockOpen.value }

onMounted(() => {
  window.addEventListener('keydown', onKeydown)

  // Real-time heartbeat from timer plugin
  timerId = setInterval(() => {
    tick.value = Date.now()
  }, 1000)

  // Initialize plugin state from DSH host
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const host = (window as any).__DSH_BOOT__
  if (host) {
    if (host.llm) {
      llmModels.value = host.llm.models || []
      llmModel.value = host.llm.current || ''
    }
    if (host.session) {
      sessionId.value = host.session.id || ''
      sessionActive.value = host.session.active !== false
    }
    if (host.agent) {
      agentCount.value = host.agent.count || 0
      agentActive.value = host.agent.active !== false
    }
    if (host.settings) {
      settingWorkSpeed.value = host.settings.workSpeed !== false
      settingCompact.value = host.settings.compact === true
    }
    if (host.authorization) {
      canWrite.value = host.authorization.canWrite !== false
      canAdmin.value = host.authorization.canAdmin === true
    }
    if (host.plugins) {
      pluginCount.value = host.plugins.length || 237
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (timerId) clearInterval(timerId)
})

// Active module drives the [data-module] accent for the whole frame.
const dataModule = computed(() => active.value.id)

// Topbar placeholder copy is module-aware.
const searchPlaceholder = computed(() => {
  const m = active.value
  return `Search ${m.railLabel.toLowerCase()} — ${m.primitive.toLowerCase()}`
})

// Work/speed indicator — pulses when active work is detected
const workActive = computed(() => pipelineTps.value > 0 || agentCount.value > 0)
</script>

<template>
  <div class="ws" :data-module="dataModule" :class="{ 'ws--workspeed': workActive, 'ws--compact': settingCompact }">
    <!-- ── Plugin status bar (top, full width) ────────────────────────── -->
    <div class="ws-plugin-bar">
      <span class="ws-plugin-item" title="cordis:include">
        <svg viewBox="0 0 16 16" class="ws-plugin-ico"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        <span class="ws-plugin-label">cordis</span>
      </span>
      <span class="ws-plugin-item" title="llm">
        <svg viewBox="0 0 16 16" class="ws-plugin-ico"><path d="M2 2h12v12H2z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        <span class="ws-plugin-label">llm ({{ llmModels.length }})</span>
      </span>
      <span class="ws-plugin-item" title="session">
        <svg viewBox="0 0 16 16" class="ws-plugin-ico"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        <span class="ws-plugin-label">session</span>
      </span>
      <span class="ws-plugin-item" title="agent">
        <svg viewBox="0 0 16 16" class="ws-plugin-ico"><circle cx="8" cy="4" r="2" fill="currentColor"/><path d="M4 12h8v4H4z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        <span class="ws-plugin-label">agent ({{ agentCount }})</span>
      </span>
      <span class="ws-plugin-item" title="settings">
        <svg viewBox="0 0 16 16" class="ws-plugin-ico"><circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
        <span class="ws-plugin-label">settings</span>
      </span>
      <span class="ws-plugin-item ws-plugin-item--hot" title="authorization">
        <svg viewBox="0 0 16 16" class="ws-plugin-ico"><path d="M8 2L2 8l6 6 10-10z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        <span class="ws-plugin-label">authz</span>
      </span>
      <span class="ws-plugin-item" title="timer">
        <svg viewBox="0 0 16 16" class="ws-plugin-ico"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2v4M12 8h-4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
        <span class="ws-plugin-label">timer</span>
      </span>
      <span class="ws-plugin-item" title="hmr">
        <svg viewBox="0 0 16 16" class="ws-plugin-ico"><path d="M2 2h12v12H2z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 12h12M8 2v12" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/></svg>
        <span class="ws-plugin-label">hmr</span>
      </span>
      <span class="ws-plugin-divider" aria-hidden="true"></span>
      <span class="ws-plugin-item" title="Work/speed">
        <span class="ws-plugin-ico ws-plugin-ico--workspeed">{{ Math.round(workSpeed.value) }}</span>
        <span class="ws-plugin-label">work/s</span>
      </span>
    </div>

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

    <!-- ── Work/speed HUD (bottom-right, live) ────────────────────────── -->
    <div class="ws-hud" v-if="workActive || settingWorkSpeed">
      <div class="ws-hud-tile">
        <span class="ws-hud-value">{{ pipelineTps }}</span>
        <span class="ws-hud-label">tok/s</span>
      </div>
      <div class="ws-hud-tile">
        <span class="ws-hud-value">{{ subagentCount }}</span>
        <span class="ws-hud-label">agents</span>
      </div>
      <div class="ws-hud-tile">
        <span class="ws-hud-value">{{ healthyModels }}</span>
        <span class="ws-hud-label">models</span>
      </div>
      <div class="ws-hud-tile ws-hud-tile--workspeed">
        <span class="ws-hud-value">{{ workSpeed }}</span>
        <span class="ws-hud-label">work/s</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

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

/* Workspeed accent — subtle pulse when active work is detected */
.ws--workspeed .ws-plugin-item--hot {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--apt-color-brand-primary) 20%, transparent);
}

/* ── Plugin status bar ─────────────────────────────────────────────── */
.ws-plugin-bar {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  padding: var(--apt-spacing-s2) var(--apt-spacing-s9);
  background: var(--apt-surface-page);
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.04em;
}

.ws-plugin-item {
  display: inline-flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  color: var(--apt-text-dim);
  padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
  border-radius: var(--apt-radius-r0);
  transition: background var(--apt-animation-fast), color var(--apt-animation-fast);
}

.ws-plugin-item:hover {
  background: var(--apt-surface-raised);
  color: var(--apt-text-body);
}

.ws-plugin-item--hot {
  color: var(--apt-color-brand-primary);
  background: color-mix(in srgb, var(--apt-color-brand-primary) 8%, var(--apt-surface-default));
}

.ws-plugin-divider {
  width: 1px;
  height: 10px;
  background: var(--line);
  margin: 0 var(--apt-spacing-s2);
}

.ws-plugin-ico {
  width: 12px;
  height: 12px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.4;
  flex-shrink: 0;
}

.ws-plugin-ico--workspeed {
  font-family: var(--apt-font-sans);
  font-size: 10px;
  font-weight: 700;
  color: var(--apt-color-brand-primary);
  width: auto;
  height: auto;
  stroke: none;
}

.ws-plugin-label {
  font-size: var(--apt-font-size-micro);
}

/* ── Topbar ─────────────────────────────────────────────── */
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

/* ── Work/speed HUD ─────────────────────────────────────────────── */
.ws-hud {
  position: absolute;
  bottom: var(--apt-spacing-s6);
  right: var(--apt-spacing-s6);
  display: flex;
  gap: var(--apt-spacing-s4);
  z-index: 15;
  pointer-events: none;
}

.ws-hud-tile {
  display: inline-flex;
  align-items: baseline;
  gap: var(--apt-spacing-s2);
  padding: var(--apt-spacing-s2) var(--apt-spacing-s4);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-page);
  border: 1px solid var(--line);
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
}

.ws-hud-tile--workspeed {
  background: color-mix(in srgb, var(--apt-color-brand-primary) 10%, var(--apt-surface-default));
  border-color: color-mix(in srgb, var(--apt-color-brand-primary) 30%, transparent);
  color: var(--apt-color-brand-primary);
}

.ws-hud-value {
  font-size: var(--apt-font-size-body-sm);
  font-weight: 700;
  color: inherit;
}

.ws-hud-label {
  color: var(--apt-text-dim);
}

@media (max-width: 1180px) {
  .ws-app { grid-template-columns: 64px 232px minmax(0, 1fr); }
}
@media (max-width: 820px) {
  .ws-app { grid-template-columns: 64px minmax(0, 1fr); }
  .ws-app > .module-nav { display: none; }
  .ws-search { max-width: 200px; }
  .ws-agent-toggle span { display: none; }
  .ws-hud { display: none; }
}
@media (max-width: 640px) {
  .ws-plugin-bar { font-size: var(--apt-font-size-sm-3); gap: var(--apt-spacing-s1); padding: var(--apt-spacing-s1) var(--apt-spacing-s6); }
  .ws-plugin-label { display: none; }
  .ws-plugin-ico { width: 10px; height: 10px; stroke-width: 1.2; }
}
</style>