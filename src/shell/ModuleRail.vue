<script setup lang="ts">
/**
 * ModuleRail — the 64px spine. One icon + 8px label per module, in chain
 * order. Active module carries the module accent. Icons come from the shared
 * set so the rail reads as one system.
 */
import { iconSvg } from './icons'
import type { WorkspaceModule, ModuleId } from './registry'

defineProps<{
  active: ModuleId
  modules: WorkspaceModule[]
}>()
</script>

<template>
  <nav class="module-rail" aria-label="Workspace modules">
    <div class="module-rail-top">
      <RouterLink to="/workspace" class="module-rail-mark" aria-label="APT-LABS" title="APT-LABS">
        <b>APT</b>
      </RouterLink>
    </div>
    <RouterLink
      v-for="m in modules"
      :key="m.id"
      :to="m.path"
      class="module-rail-item"
      :class="{ 'module-rail-item--on': active === m.id }"
      :title="`${m.title} — ${m.primitive}`"
    >
      <span class="module-rail-glyph" v-html="iconSvg(m.icon, 20)" />
      <span class="module-rail-lbl">{{ m.railLabel }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.module-rail {
  --line: color-mix(in srgb, var(--apt-text-strong) 12%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--apt-spacing-s3);
  padding: var(--apt-spacing-s7) 0;
  background: var(--apt-surface-page);
  border-right: 1px solid var(--line);
  overflow-y: auto;
  height: 100%;
}
.module-rail-top { margin-bottom: var(--apt-spacing-s2); }
.module-rail-mark {
  font: 700 var(--apt-font-size-body-md) / 1 var(--apt-font-mono);
  letter-spacing: 0.12em;
  color: var(--apt-text-strong);
  text-decoration: none;
  height: 44px;
  display: grid;
  place-items: center;
}
.module-rail-mark b { color: var(--apt-module-accent, var(--apt-color-brand-primary)); }

.module-rail-item {
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--apt-text-muted);
  transition: color var(--apt-animation-fast);
}
.module-rail-glyph {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--apt-text-muted);
  border: 1px solid transparent;
  transition: all var(--apt-animation-fast);
}
.module-rail-glyph :deep(svg) { color: inherit; }
.module-rail-item:hover .module-rail-glyph {
  background: var(--apt-surface-raised);
  color: var(--apt-text-strong);
}
.module-rail-item--on .module-rail-glyph {
  background: color-mix(in srgb, var(--apt-module-accent) 14%, var(--apt-surface-default));
  color: var(--apt-module-accent);
  border-color: color-mix(in srgb, var(--apt-module-accent) 30%, transparent);
}
.module-rail-lbl {
  font: 600 8px / 1 var(--apt-font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}
.module-rail-item--on .module-rail-lbl { color: var(--apt-module-accent); }
</style>
