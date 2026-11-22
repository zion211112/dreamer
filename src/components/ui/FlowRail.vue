<script setup lang="ts">
/**
 * APT-LABS — FlowRail (dsh-derived: session-reference + job-controller pattern).
 *
 * The productive reality cycle, made visible in every module:
 *   Intention → Capability → Work (commit→execute) → Evidence → Value → Knowledge
 *
 * Each stage is the home of an ontology primitive and links to the module
 * that owns it. The stage the current page owns is marked "you are here"
 * with the module accent — the page's [data-module] sets --apt-module-accent,
 * so the rail reads through the same accent routing as the shell.
 *
 * Nothing on the rail is invented: stage → primitive → module is sourced
 * from the ontology cycle; links point at real workspace routes only.
 */
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { settings } from '@/lib/settings';

export type CycleStage =
  | 'commons'
  | 'network'
  | 'workbench'
  | 'records'
  | 'value'
  | 'intelligence';

interface StageDef {
  stage: CycleStage;
  /** Stage ordinal, 01–06. */
  num: string;
  /** The ontology primitive this stage is the home of. */
  primitive: string;
  /** Module label that owns the stage. */
  module: string;
  /** Real workspace route. */
  to: string;
}

const STAGES: StageDef[] = [
  { stage: 'commons', num: '01', primitive: 'Intention', module: 'Commons', to: '/workspace/commons' },
  { stage: 'network', num: '02', primitive: 'Capability', module: 'Network', to: '/workspace/network' },
  { stage: 'workbench', num: '03', primitive: 'Commitment · Execution', module: 'Workbench', to: '/workspace/workbench' },
  { stage: 'records', num: '04', primitive: 'Evidence · Outcome', module: 'Records', to: '/workspace/records/roll' },
  { stage: 'value', num: '05', primitive: 'Value', module: 'Value', to: '/workspace/value' },
  { stage: 'intelligence', num: '06', primitive: 'Knowledge', module: 'Intelligence', to: '/workspace/intelligence' },
];

const props = withDefaults(defineProps<{
  /** The stage the current page owns. Omit on Home — no highlight. */
  active?: CycleStage;
  /** One-line caption above the rail. */
  title?: string;
}>(), {
  active: undefined,
  title: 'Where the chain stands',
});

const stages = computed<StageDef[]>(() => STAGES);

/** Hidden globally when the user switches the flow rail off in Settings. */
const show = computed(() => settings.showFlowRail);
</script>

<template>
  <div v-if="show" class="flow-rail" data-flowrail>
    <div class="flow-rail-head">
      <span class="flow-rail-caption">{{ title }}</span>
      <span v-if="active" class="flow-rail-here">
        you are here: <b>{{ STAGES.find((s) => s.stage === active)?.module }}</b>
      </span>
    </div>

    <ol class="flow-rail-list" :aria-label="'Productive reality cycle'">
      <li
        v-for="(s, i) in stages"
        :key="s.stage"
        class="flow-rail-item"
        :class="{ 'flow-rail-item--active': s.stage === active }"
        :data-stage="s.stage"
      >
        <RouterLink :to="s.to" class="flow-rail-stage">
          <span class="flow-rail-num">{{ s.num }}</span>
          <span class="flow-rail-primitive">{{ s.primitive }}</span>
          <span class="flow-rail-module">{{ s.module }}</span>
          <span v-if="s.stage === active" class="flow-rail-dot" aria-hidden="true" />
        </RouterLink>
        <span v-if="i < stages.length - 1" class="flow-rail-conn" aria-hidden="true">→</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.flow-rail {
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-page);
  padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  margin: 0 0 var(--apt-spacing-s8);
}

.flow-rail-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--apt-spacing-s4);
  flex-wrap: wrap;
  margin-bottom: var(--apt-spacing-s5);
}

.flow-rail-caption {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.flow-rail-here {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  letter-spacing: 0.04em;
  color: var(--apt-text-muted);
}

.flow-rail-here b {
  font-weight: 600;
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.flow-rail-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: stretch;
  gap: 0;
  flex-wrap: wrap;
}

.flow-rail-item {
  display: flex;
  align-items: center;
  flex: 1 1 150px;
  min-width: 150px;
}

.flow-rail-stage {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 56px;
  padding: var(--apt-spacing-s3) var(--apt-spacing-s4);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-color-neutral-n0, var(--apt-surface-default));
  text-decoration: none;
  color: var(--apt-text-body);
  transition: border-color var(--apt-animation-fast), background-color var(--apt-animation-fast);
}

@media (hover: hover) and (pointer: fine) {
  .flow-rail-stage:hover {
    border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 45%, var(--apt-border));
  }
}

.flow-rail-stage:focus-visible {
  outline: 2px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  outline-offset: 2px;
}

.flow-rail-item--active .flow-rail-stage {
  border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 45%, var(--apt-border));
  background: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 9%, var(--apt-color-neutral-n0, var(--apt-surface-default)));
}

.flow-rail-num {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-micro);
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--apt-text-dim);
}

.flow-rail-item--active .flow-rail-num {
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.flow-rail-primitive {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-body-sm);
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--apt-text-strong);
  line-height: 1.25;
}

.flow-rail-module {
  font-family: var(--apt-font-mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}

.flow-rail-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 18%, transparent);
}

.flow-rail-conn {
  flex: none;
  padding: 0 8px;
  font-family: var(--apt-font-mono);
  font-weight: 700;
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-dim);
  align-self: center;
}

@media (max-width: 760px) {
  .flow-rail-item {
    flex: 1 1 100%;
    min-width: 0;
  }

  .flow-rail-conn {
    display: none;
  }
}
</style>
