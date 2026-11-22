<script setup lang="ts">
/**
 * APT-LABS — Session reference (ported from dsh `ui-session` / `session-reference`).
 *
 * Shows the current workspace session context: active module, pilot (when in
 * workbench), session stats, and the turn outline. Modeled on dsh's
 * session-reference / session-turn-outline: it answers "where am I and what
 * has happened" at a glance, without being a dashboard.
 *
 * Placed in the workspace topbar area so it reads as one system with the
 * shell rail and nav.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { moduleForPath, WORKSPACE_MODULES, type WorkspaceModule } from './registry'
import { iconSvg } from './icons'
import { OPERATIONAL_PILOTS } from '@/lib/demo-seed'
import { homeMetrics } from '@/modules/workbench/data'

const route = useRoute()
const active = computed(() => moduleForPath(route.path))

const metrics = homeMetrics()

const pilotInPath = computed(() => {
  const segs = route.path.replace(/^\/workspace\//, '').split('/')
  return segs[0] === 'workbench' ? (segs[1] || null) : null
})

const activePilot = computed(() => OPERATIONAL_PILOTS.find((p) => p.key === pilotInPath.value))

function sessionLabel(): string {
  const m = active.value
  if (!m) return 'Workspace'
  if (activePilot.value) return `${m.title} · ${activePilot.value.label}`
  return m.title
}
</script>

<template>
  <aside class="session-ref" aria-label="Workspace session">
    <div class="session-ref-head">
      <div class="session-ref-module">
        <span class="session-ref-glyph" v-html="iconSvg(active.icon, 16)" />
        <span class="session-ref-name">{{ active.title }}</span>
      </div>
      <span class="session-ref-divider">/</span>
      <span class="session-ref-context">{{ sessionLabel() }}</span>
    </div>

    <div class="session-ref-body">
      <ul class="session-ref-stats">
        <li class="session-ref-stat">
          <span class="session-ref-stat-num">{{ metrics.publishedLanes }}</span>
          <span class="session-ref-stat-lab">pilots</span>
        </li>
        <li class="session-ref-stat">
          <span class="session-ref-stat-num">{{ metrics.activeCount }}</span>
          <span class="session-ref-stat-lab">active</span>
        </li>
        <li class="session-ref-stat">
          <span class="session-ref-stat-num">{{ metrics.totalCapital }}</span>
          <span class="session-ref-stat-lab">KES</span>
        </li>
      </ul>

      <div v-if="activePilot" class="session-ref-pilot">
        <span class="session-ref-pilot-tag">Pilot lane</span>
        <span class="session-ref-pilot-name">{{ activePilot.label }}</span>
        <span class="session-ref-pilot-loc">{{ activePilot.location }}</span>
      </div>

      <div class="session-ref-turn">
        <span class="session-ref-turn-title">This session</span>
        <ul class="session-ref-turn-list">
          <li class="session-ref-turn-item">
            <span class="session-ref-turn-dot" :class="`session-ref-turn-dot--live`" aria-hidden="true" />
            <span class="session-ref-turn-text">Open {{ active.title }}</span>
          </li>
          <li class="session-ref-turn-item">
            <span class="session-ref-turn-dot session-ref-turn-dot--done" aria-hidden="true" />
            <span class="session-ref-turn-text">Read registry · {{ WORKSPACE_MODULES.length }} modules</span>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.session-ref {
  --line: color-mix(in srgb, var(--apt-text-strong) 12%, transparent);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
  padding: var(--apt-spacing-s5) var(--apt-spacing-s6);
  background: var(--apt-surface-page);
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r2);
  min-width: 220px;
}

.session-ref-head {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
}

.session-ref-module {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
}

.session-ref-glyph {
  width: 14px;
  height: 14px;
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.session-ref-name {
  font: 600 var(--apt-font-size-body-sm) / 1 var(--apt-font-serif);
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
}

.session-ref-divider {
  font: 500 var(--apt-font-size-sm-3) / 1 var(--apt-font-mono);
  color: var(--apt-text-dim);
}

.session-ref-context {
  font: 500 var(--apt-font-size-sm-3) / 1 var(--apt-font-mono);
  color: var(--apt-text-muted);
  letter-spacing: 0.04em;
}

.session-ref-body {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s5);
}

.session-ref-stats {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.session-ref-stat {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--apt-spacing-s3);
}

.session-ref-stat-num {
  font: 600 var(--apt-font-size-body-md) / 1 var(--apt-font-serif);
  color: var(--apt-text-strong);
}

.session-ref-stat-lab {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.session-ref-pilot {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  padding: var(--apt-spacing-s3) var(--apt-spacing-s4);
  background: var(--apt-surface-raised);
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r1);
}

.session-ref-pilot-tag {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.session-ref-pilot-name {
  font: 500 var(--apt-font-size-body-sm) / 1 var(--apt-font-sans);
  color: var(--apt-text-strong);
  min-width: 0;
  flex: 1;
}

.session-ref-pilot-loc {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  color: var(--apt-text-dim);
  letter-spacing: 0.04em;
}

.session-ref-turn {
  border-top: 1px solid var(--line);
  padding-top: var(--apt-spacing-s4);
}

.session-ref-turn-title {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  margin-bottom: var(--apt-spacing-s3);
}

.session-ref-turn-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s3);
}

.session-ref-turn-item {
  display: flex;
  align-items: baseline;
  gap: var(--apt-spacing-s3);
}

.session-ref-turn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--apt-text-dim);
  flex-shrink: 0;
}

.session-ref-turn-dot--done {
  background: var(--apt-standing-verified, var(--apt-color-forest-500));
}

.session-ref-turn-dot--live {
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 18%, transparent);
}

.session-ref-turn-text {
  font: 500 var(--apt-font-size-sm-3) / 1.4 var(--apt-font-sans);
  color: var(--apt-text-body);
}
</style>