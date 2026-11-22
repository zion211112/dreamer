<script setup lang="ts">
/**
 * APT-LABS — Module nav (enhanced with dsh `ui-sidebar` patterns).
 *
 * The 232px context column. Renders the active module's own secondary
 * navigation from the registry: grouped, collapsible sections, file-reference
 * style items with count badges. Items carrying a `to` route; items without
 * are in-module filters.
 *
 * Ported from dsh ui-sidebar: sections collapse/expand, the active item is
 * highlighted, and a session footer shows module stats. One owner per region.
 */
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { WorkspaceModule } from './registry'
import { OPERATIONAL_PILOTS } from '@/lib/demo-seed'
import { homeMetrics } from '@/modules/workbench/data'

const props = defineProps<{ module: WorkspaceModule }>()
const route = useRoute()

const active = props.module
const metrics = homeMetrics()

const openSections = ref<Record<string, boolean>>({})

function isOpen(heading: string): boolean {
  return openSections.value[heading] ?? true
}
function toggleSection(heading: string): void {
  openSections.value[heading] = !openSections.value[heading]
}

function isOn(to?: string): boolean {
  if (!to) return false
  return route.path === to || (to !== '/' && route.path.startsWith(to))
}

const sections = computed(() => active.ctxNav)

function pilotCount(): number {
  return OPERATIONAL_PILOTS.filter((p) => p.status === 'published').length
}
</script>

<template>
  <aside class="module-nav" aria-label="Module navigation">
    <div class="module-nav-head">
      <div class="module-nav-title">{{ active.title }}</div>
      <span class="module-nav-primitive">{{ active.primitive }}</span>
    </div>

    <div
      v-for="sec in sections"
      :key="sec.heading"
      class="module-nav-sec"
    >
      <div
        class="module-nav-heading"
        role="button"
        tabindex="0"
        aria-expanded="isOpen(sec.heading)"
        @click="toggleSection(sec.heading)"
        @keydown.enter="toggleSection(sec.heading)"
        @keydown.space="toggleSection(sec.heading)"
      >
        <span class="module-nav-heading-label">{{ sec.heading }}</span>
        <span
          class="module-nav-heading-toggle"
          :class="{ 'module-nav-heading-toggle--open': isOpen(sec.heading) }"
          aria-hidden="true"
        >▾</span>
      </div>

      <ul v-if="isOpen(sec.heading)" class="module-nav-list">
        <li
          v-for="item in sec.items"
          :key="item.label"
          class="module-nav-list-item"
        >
          <RouterLink
            v-if="item.to"
            :to="item.to"
            class="module-nav-item"
            :class="{ 'module-nav-item--on': isOn(item.to) }"
          >
            <span class="module-nav-dot" aria-hidden="true" />
            <span class="module-nav-label">{{ item.label }}</span>
            <span v-if="item.count != null" class="module-nav-count">{{ item.count }}</span>
          </RouterLink>
          <button
            v-else
            type="button"
            class="module-nav-item module-nav-item--filter"
            @click="
              (window as any).router?.push(
                item.label.toLowerCase().replace(' ', '-')
              )
            "
          >
            <span class="module-nav-dot" aria-hidden="true" />
            <span class="module-nav-label">{{ item.label }}</span>
            <span v-if="item.count != null" class="module-nav-count">{{ item.count }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Session footer — dsh session-stats pattern -->
    <div class="module-nav-foot">
      <div class="module-nav-foot-stat">
        <span class="module-nav-foot-num">{{ pilotCount() }}</span>
        <span class="module-nav-foot-lab">pilots</span>
      </div>
      <div class="module-nav-foot-stat">
        <span class="module-nav-foot-num">{{ metrics.activeCount }}</span>
        <span class="module-nav-foot-lab">active</span>
      </div>
      <div class="module-nav-foot-stat">
        <span class="module-nav-foot-num">{{ metrics.totalCapital }}</span>
        <span class="module-nav-foot-lab">KES</span>
      </div>
    </div>

    <p class="module-nav-doctrine">{{ active.subtitle }}</p>
  </aside>
</template>

<style scoped>
.module-nav {
  --line: color-mix(in srgb, var(--apt-text-strong) 12%, transparent);
  display: flex;
  flex-direction: column;
  background: var(--apt-surface-page);
  border-right: 1px solid var(--line);
  overflow-y: auto;
  padding: var(--apt-spacing-s9) 0;
  height: 100%;
}
.module-nav-head { padding: 0 var(--apt-spacing-s8); margin-bottom: var(--apt-spacing-s7); }
.module-nav-title {
  display: block;
  font: 600 var(--apt-font-size-body-md) / 1.2 var(--apt-font-serif);
  color: var(--apt-text-strong);
}
.module-nav-primitive {
  display: block;
  margin-top: 4px;
  font: 500 9px / 1.4 var(--apt-font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.module-nav-sec { padding: 0 var(--apt-spacing-s8); margin-bottom: var(--apt-spacing-s7); }
.module-nav-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: 600 9.5px / 1 var(--apt-font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  margin-bottom: var(--apt-spacing-s5);
  padding: var(--apt-spacing-s3) 0;
  cursor: pointer;
  border-bottom: 1px solid var(--line);
  user-select: none;
}
.module-nav-heading:hover { color: var(--apt-text-body); }
.module-nav-heading-toggle {
  font: 500 10px / 1 var(--apt-font-mono);
  color: var(--apt-text-dim);
  transition: transform var(--apt-animation-fast);
}
.module-nav-heading-toggle--open { transform: rotate(0deg); }
.module-nav-heading:not(.module-nav-heading-toggle--open) ~ .module-nav-list { display: none; }

.module-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.module-nav-list-item { margin: 0; }
.module-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 2px;
  border-radius: var(--apt-radius-r1);
  font: var(--apt-font-size-body-sm) / 1.2 var(--apt-font-sans);
  color: var(--apt-text-muted);
  text-decoration: none;
  border: 1px solid transparent;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background var(--apt-animation-fast), color var(--apt-animation-fast);
}
.module-nav-item:hover { background: var(--apt-surface-raised); color: var(--apt-text-strong); }
.module-nav-item--on {
  background: color-mix(in srgb, var(--apt-module-accent) 13%, var(--apt-surface-default));
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
  border-color: color-mix(in srgb, var(--apt-module-accent) 26%, transparent);
  font-weight: 600;
}
.module-nav-item--filter {
  opacity: 0.7;
}
.module-nav-item--filter:hover { opacity: 1; }
.module-nav-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--apt-module-accent); opacity: 0; flex-shrink: 0; }
.module-nav-item--on .module-nav-dot { opacity: 1; }
.module-nav-label { flex: 1; min-width: 0; }
.module-nav-count { font: 500 10px / 1 var(--apt-font-mono); color: var(--apt-text-dim); }

.module-nav-foot {
  margin: auto 0 0;
  padding: var(--apt-spacing-s7) var(--apt-spacing-s8) 0;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s2);
}
.module-nav-foot-stat {
  display: flex;
  align-items: baseline;
  gap: var(--apt-spacing-s2);
}
.module-nav-foot-num {
  font: 600 var(--apt-font-size-body-md) / 1 var(--apt-font-serif);
  color: var(--apt-text-strong);
}
.module-nav-foot-lab {
  font: 500 var(--apt-font-size-micro) / 1 var(--apt-font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.module-nav-doctrine {
  margin: auto 0 0;
  padding: var(--apt-spacing-s7) var(--apt-spacing-s8) 0;
  font: 400 var(--apt-font-size-body-sm) / 1.5 var(--apt-font-sans);
  color: var(--apt-text-muted);
  border-top: 1px solid var(--line);
}
</style>