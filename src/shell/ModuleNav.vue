<script setup lang="ts">
/**
 * ModuleNav — the 232px context column. Renders the active module's own
 * secondary navigation from the registry: grouped, filterable, with count
 * badges. Items carrying a `to` route; items without are in-module filters.
 * The column stays in the module's voice because it is sourced per-module.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { WorkspaceModule } from './registry'

const props = defineProps<{ module: WorkspaceModule }>()
const route = useRoute()

const active = props.module

function isOn(to?: string): boolean {
  if (!to) return false
  return route.path === to || (to !== '/' && route.path.startsWith(to))
}
const sections = computed(() => active.ctxNav)
</script>

<template>
  <aside class="module-nav" aria-label="Module navigation">
    <div class="module-nav-head">
      <span class="module-nav-title">{{ active.title }}</span>
      <span class="module-nav-primitive">{{ active.primitive }}</span>
    </div>

    <div v-for="sec in sections" :key="sec.heading" class="module-nav-sec">
      <div class="module-nav-heading">{{ sec.heading }}</div>
      <template v-for="item in sec.items" :key="item.label">
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
        >
          <span class="module-nav-dot" aria-hidden="true" />
          <span class="module-nav-label">{{ item.label }}</span>
          <span v-if="item.count != null" class="module-nav-count">{{ item.count }}</span>
        </button>
      </template>
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
  font: 600 9.5px / 1 var(--apt-font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  margin-bottom: var(--apt-spacing-s5);
}

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
.module-nav-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--apt-module-accent); opacity: 0; flex-shrink: 0; }
.module-nav-item--on .module-nav-dot { opacity: 1; }
.module-nav-label { flex: 1; min-width: 0; }
.module-nav-count { font: 500 10px / 1 var(--apt-font-mono); color: var(--apt-text-dim); }

.module-nav-doctrine {
  margin: auto 0 0;
  padding: var(--apt-spacing-s7) var(--apt-spacing-s8) 0;
  font: 400 var(--apt-font-size-body-sm) / 1.5 var(--apt-font-sans);
  color: var(--apt-text-muted);
  border-top: 1px solid var(--line);
}
</style>
