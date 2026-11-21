<script setup lang="ts">
/**
 * AgentDock — the 360px right column. The agent operates *on* the active
 * module: it reads the module's primitive, proposes the next move, and every
 * action it takes carries a receipt (the Proof-Carrying Work Unit).
 *
 * The dock is wired to a live agent backend (FCC / dsh-genui) as a follow-up;
 * this shell is the frame it mounts into. Until then, submitted intents land
 * in a session-local transcript and are labelled illustrative — not faked.
 */
import { computed, ref } from 'vue'
import type { WorkspaceModule } from './registry'

const props = defineProps<{ module: WorkspaceModule; open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const INTENTS: Record<string, string[]> = {
  overview: ['Trace a distinction through the chain', 'Show me what is disputed', 'Where does reality enter the model?'],
  commons: ['Draft a brief for the top inquiry', 'Summarise open inquiries by institution', 'Find a counterpoint to this proposition'],
  network: ['Map who can do what in this cluster', 'Which capability is unheld?', 'Relate these institutions'],
  coordination: ['Verify standing for this commitment', 'List grants about to expire', 'Check a disputed commitment'],
  workbench: ['Open the next pilot to run', 'What is blocked on this unit?', 'Prepare this work unit for review'],
  proof: ['Verify this evidence', 'File an attestation', 'Surface the contested claims'],
  records: ['Search the canon', 'Diff this record against the roll', 'Explain this entry’s provenance'],
  value: ['Trace this outcome’s allocation', 'Show who was paid and why', 'Reconcile this circulation'],
  intelligence: ['Run a match against this intent', 'Forecast this constraint', 'Hand this to Kemetos'],
}

const active = computed(() => props.module)
const intents = computed(() => INTENTS[active.value.id] ?? INTENTS.overview)

const composer = ref('')
interface Note { role: 'user' | 'agent'; text: string }
const transcript = ref<Note[]>([])

function send(text?: string) {
  const intent = (text ?? composer.value).trim()
  if (!intent) return
  transcript.value.push({ role: 'user', text: intent })
  transcript.value.push({
    role: 'agent',
    text: `Bound to ${active.value.title} — ${active.value.primitive}. Action queued; a receipt will be filed on completion. (live agent pending)`,
  })
  composer.value = ''
}

function quick(intent: string) { send(intent) }
</script>

<template>
  <aside class="agent-dock" :class="{ 'agent-dock--open': open }" :aria-hidden="!open" aria-label="Agent dock">
    <div class="agent-dock-head">
      <div class="agent-dock-id">
        <span class="agent-dock-dot" aria-hidden="true" />
        <div>
          <div class="agent-dock-title">Agent</div>
          <div class="agent-dock-sub">bound to {{ active.title }} · {{ active.primitive }}</div>
        </div>
      </div>
      <button type="button" class="agent-dock-close" aria-label="Close agent" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>

    <!-- Suggested moves for this module -->
    <div class="agent-dock-block">
      <div class="agent-dock-block-head">Next moves</div>
      <div class="agent-dock-intents">
        <button v-for="it in intents" :key="it" type="button" class="agent-intent" @click="quick(it)">
          <span>{{ it }}</span><span class="agent-intent-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </div>

    <!-- Transcript -->
    <div v-if="transcript.length" class="agent-dock-block">
      <div class="agent-dock-block-head">Session</div>
      <div class="agent-dock-log">
        <div v-for="(n, i) in transcript" :key="i" class="agent-note" :class="`agent-note--${n.role}`">
          <span class="agent-note-role">{{ n.role === 'agent' ? 'Agent' : 'You' }}</span>
          <p>{{ n.text }}</p>
        </div>
      </div>
    </div>

    <!-- Composer -->
    <form class="agent-dock-composer" @submit.prevent="send()">
      <textarea
        v-model="composer"
        class="agent-dock-input"
        rows="2"
        :placeholder="`Ask the agent something about ${active.title.toLowerCase()}…`"
      />
      <div class="agent-dock-compose-foot">
        <span class="agent-dock-fine">Receipt filed · provenance preserved</span>
        <button type="submit" class="agent-dock-send" :disabled="!composer.trim()">Run</button>
      </div>
    </form>

    <p class="agent-dock-note">Local-first. No live institutional, payment, tracking, or account connections.</p>
  </aside>
</template>

<style scoped>
.agent-dock {
  --line: color-mix(in srgb, var(--apt-text-strong) 12%, transparent);
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 360px;
  max-width: 100%;
  z-index: 20;
  display: flex;
  flex-direction: column;
  background: var(--apt-surface-page);
  border-left: 1px solid var(--line);
  overflow-y: auto;
  padding: var(--apt-spacing-s9);
  box-shadow: -18px 0 44px -34px rgba(0, 0, 0, 0.5);
  transform: translateX(100%);
  visibility: hidden;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.28s;
}
.agent-dock--open {
  transform: translateX(0);
  visibility: visible;
}

.agent-dock-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: var(--apt-spacing-s7);
}
.agent-dock-close {
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
.agent-dock-close:hover { color: var(--apt-text-strong); border-color: var(--line-strong); background: var(--apt-surface-raised); }
.agent-dock-close svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 1.8; }
.agent-dock-id { display: flex; align-items: center; gap: 10px; }
.agent-dock-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--apt-module-accent) 18%, transparent);
}
.agent-dock-title { font: 600 var(--apt-font-size-body-md) / 1 var(--apt-font-serif); color: var(--apt-text-strong); }
.agent-dock-sub { font: 500 10px / 1.3 var(--apt-font-mono); letter-spacing: 0.04em; color: var(--apt-text-dim); margin-top: 3px; }

.agent-dock-block { margin-bottom: var(--apt-spacing-s7); }
.agent-dock-block-head {
  font: 600 9.5px / 1 var(--apt-font-mono);
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--apt-text-dim);
  margin-bottom: var(--apt-spacing-s5);
}

.agent-dock-intents { display: flex; flex-direction: column; gap: 6px; }
.agent-intent {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 11px 13px;
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-default);
  font: var(--apt-font-size-body-sm) / 1.3 var(--apt-font-sans);
  color: var(--apt-text-body);
  text-align: left;
  cursor: pointer;
  transition: all var(--apt-animation-fast);
}
.agent-intent:hover { border-color: var(--line-strong); background: var(--apt-surface-raised); }
.agent-intent-arrow { color: var(--apt-module-accent, var(--apt-color-brand-primary)); font-weight: 600; }

.agent-dock-log { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; }
.agent-note { padding: 10px 12px; border-radius: var(--apt-radius-r2); border: 1px solid var(--line); }
.agent-note--user { background: var(--apt-surface-default); }
.agent-note--agent { background: color-mix(in srgb, var(--apt-module-accent) 8%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-module-accent) 24%, transparent); }
.agent-note-role { font: 600 9px / 1 var(--apt-font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--apt-text-dim); }
.agent-note p { margin: 4px 0 0; font: var(--apt-font-size-body-sm) / 1.45 var(--apt-font-sans); color: var(--apt-text-body); }

.agent-dock-composer { margin-top: auto; }
.agent-dock-input {
  width: 100%;
  resize: none;
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-default);
  padding: 10px 12px;
  font: var(--apt-font-size-body-sm) / 1.4 var(--apt-font-sans);
  color: var(--apt-text-strong);
  outline: none;
  transition: border-color var(--apt-animation-fast);
}
.agent-dock-input:focus { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.agent-dock-compose-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.agent-dock-fine { font: 500 9px / 1.3 var(--apt-font-mono); letter-spacing: 0.06em; text-transform: uppercase; color: var(--apt-text-dim); }
.agent-dock-send {
  font: 600 var(--apt-font-size-body-sm) / 1 var(--apt-font-sans);
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
  color: var(--apt-surface-page);
  border: none; border-radius: 999px;
  padding: 9px 18px;
  cursor: pointer;
  transition: filter var(--apt-animation-fast);
}
.agent-dock-send:disabled { opacity: 0.4; cursor: not-allowed; }
.agent-dock-note { margin-top: var(--apt-spacing-s7); font: 500 9px / 1.4 var(--apt-font-mono); letter-spacing: 0.06em; text-transform: uppercase; color: var(--apt-text-dim); text-align: center; }
</style>
