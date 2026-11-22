<script setup lang="ts">
/**
 * APT-LABS — Agent dock (enhanced with dsh `ui-conversation` / `message-quotes`
 * and `ui-approval` patterns).
 *
 * The 360px right column. The agent operates *on* the active module: it reads
 * the module's primitive, proposes the next move, and every action it takes
 * carries a receipt (the Proof-Carrying Work Unit).
 *
 * Enhanced from dsh:
 *   - message-quotes: transcript notes render as quoted message blocks
 *   - ui-approval: gated intents show an approval chip with missing authority
 *   - session-turn-outline: transcript doubles as the session turn outline
 */
import { computed, ref } from 'vue'
import type { WorkspaceModule } from './registry'
import { AGENT_SPECS, type ModuleAgentSpec, type ModuleIntent } from './agent-intents'
import { EngineAgent, type EngineAgentIdentity, type ExecutionTrace, type PlanStep, type PolicyGateResult } from '@/lib/engine-agent'

const props = defineProps<{ module: WorkspaceModule; open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const active = computed(() => props.module)
const spec = computed<ModuleAgentSpec>(() => AGENT_SPECS[active.value.id])
const intents = computed<ModuleIntent[]>(() => spec.value.intents)

function stewardIdentity(s: ModuleAgentSpec, module: WorkspaceModule): EngineAgentIdentity {
  return {
    id: `steward:${module.id}`,
    name: `${module.title} steward`,
    role: 'authorizer',
    scope: s.scope,
    allowedTools: s.scope,
  }
}

interface Receipt {
  outcome: 'executed' | 'gated'
  intent: ModuleIntent
  moduleTitle: string
  planId: string
  verdict: PolicyGateResult
  trace: ExecutionTrace | null
}

type Note =
  | { role: 'user'; text: string }
  | { role: 'agent'; kind: 'receipt'; receipt: Receipt }
  | { role: 'agent'; kind: 'llm-pending'; text: string }

const transcript = ref<Note[]>([])
const composer = ref('')

/** Governed verb: plan → gate → execute (or hold) → file the receipt. */
function runIntent(intent: ModuleIntent) {
  const s = spec.value
  const identity = stewardIdentity(s, active.value)
  const agent = new EngineAgent(identity)
  const ctx = agent.buildContext({
    undertakingId: `module:${active.value.id}`,
    undertakingTitle: active.value.title,
    actor: identity.id,
    actorRole: 'steward',
    permissions: s.scope,
  })
  const step: PlanStep = { tool: intent.tool, action: intent.label, rationale: intent.rationale, requiresApproval: intent.consequential }
  const plan = agent.plan(ctx, [step])
  const verdict = agent.gate(plan.id, identity.id)
  const trace = verdict.allowed ? agent.execute(plan.id, plan.steps[0].id, identity.id, intent.rationale) : null
  transcript.value.push({ role: 'user', text: intent.label })
  transcript.value.push({
    role: 'agent',
    kind: 'receipt',
    receipt: { outcome: verdict.allowed ? 'executed' : 'gated', intent, moduleTitle: active.value.title, planId: plan.id, verdict, trace },
  })
}

/** Free-text: the live-LLM lane. Honest — queued, not answered. */
function sendFreeText() {
  const text = composer.value.trim()
  if (!text) return
  transcript.value.push({ role: 'user', text })
  transcript.value.push({
    role: 'agent',
    kind: 'llm-pending',
    text: 'Queued for the live agent (FCC) — no answer yet. Local-first: nothing is fabricated. The concrete “Next moves” above run the local governed engine now.',
  })
  composer.value = ''
}

function missingAuthority(verdict: PolicyGateResult): string {
  return verdict.missingApprovals?.[0] ?? 'authority'
}
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

    <!-- Governed "Next moves" for this module -->
    <div class="agent-dock-block">
      <div class="agent-dock-block-head">Next moves</div>
      <div class="agent-dock-intents">
        <button v-for="it in intents" :key="it.tool + it.label" type="button" class="agent-intent" :title="it.consequential ? 'Held for a higher authoriser' : 'Runs the local engine now'" @click="runIntent(it)">
          <span class="agent-intent-label">
            <span>{{ it.label }}</span>
            <span v-if="it.consequential" class="agent-intent-flag" aria-hidden="true">↑</span>
          </span>
          <span class="agent-intent-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </div>

    <!-- Transcript: message-quotes styled message blocks + session turn outline -->
    <div v-if="transcript.length" class="agent-dock-block">
      <div class="agent-dock-block-head">Session</div>
      <div class="agent-dock-log">
        <template v-for="(n, i) in transcript" :key="i">
          <!-- User message — quoted block -->
          <div v-if="n.role === 'user'" class="agent-note agent-note--user">
            <div class="message-quote">
              <span class="message-quote-role">You</span>
              <p class="message-quote-body">{{ n.text }}</p>
            </div>
          </div>

          <!-- Live-LLM pending — quoted block -->
          <div v-else-if="n.kind === 'llm-pending'" class="agent-note agent-note--pending">
            <div class="message-quote">
              <span class="message-quote-role">Agent · live LLM pending</span>
              <p class="message-quote-body">{{ n.text }}</p>
            </div>
          </div>

          <!-- Receipt — governed action with receipt -->
          <div v-else class="agent-note agent-note--receipt">
            <div class="message-quote">
              <span class="message-quote-role">Agent · receipt</span>
              <div class="receipt-card">
                <div class="receipt-top">
                  <span class="receipt-outcome" :class="`receipt-outcome--${n.receipt.outcome}`">{{ n.receipt.outcome }}</span>
                  <span class="receipt-intent">{{ n.receipt.intent.label }}</span>
                </div>
                <p class="receipt-line"><code class="receipt-tool">{{ n.receipt.intent.tool }}</code> · {{ n.receipt.intent.rationale }}</p>
                <p v-if="n.receipt.outcome === 'executed'" class="receipt-foot">
                  receipt <code>{{ n.receipt.trace?.id ?? '—' }}</code> · filed to Proof
                </p>
                <p v-else class="receipt-foot receipt-foot--gated">
                  <span class="approval-chip">
                    <span class="approval-chip-label">Awaiting sign-off</span>
                    <span class="approval-chip-authority">{{ missingAuthority(n.receipt.verdict) }}</span>
                  </span>
                  · gated — needs {{ missingAuthority(n.receipt.verdict) }}, propose-never-executes
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Composer: the live-LLM lane -->
    <form class="agent-dock-composer" @submit.prevent="sendFreeText()">
      <textarea
        v-model="composer"
        class="agent-dock-input"
        rows="2"
        :placeholder="`Ask the live agent something about ${active.title.toLowerCase()}…`"
      />
      <div class="agent-dock-compose-foot">
        <span class="agent-dock-fine">Local engine · receipts to Proof</span>
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
.agent-intent-label { display: inline-flex; align-items: baseline; gap: 4px; }
.agent-intent-flag { font: 700 10px / 1 var(--apt-font-mono); color: var(--apt-standing-reported, #AD8B55); }
.agent-intent-arrow { color: var(--apt-module-accent, var(--apt-color-brand-primary)); font-weight: 600; }

/* message-quotes — dsh message-quotes pattern */
.message-quote {
  padding: 10px 12px;
  border-radius: var(--apt-radius-r2);
  border: 1px solid var(--line);
  position: relative;
}
.message-quote::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: var(--apt-radius-r2) 0 0 var(--apt-radius-r2);
}
.message-quote--user::before { background: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.message-quote--pending::before { background: var(--apt-text-dim); }
.message-quote--receipt::before { background: var(--apt-standing-verified, var(--apt-color-forest-500)); }

.message-quote-role {
  font: 600 9px / 1 var(--apt-font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
  display: block;
  margin-bottom: 4px;
}
.message-quote-body {
  margin: 0;
  font: var(--apt-font-size-body-sm) / 1.45 var(--apt-font-sans);
  color: var(--apt-text-body);
}

.agent-dock-log { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; }
.agent-note { padding: 10px 12px; border-radius: var(--apt-radius-r2); border: 1px solid var(--line); }
.agent-note--user { background: var(--apt-surface-default); }
.agent-note--pending { background: var(--apt-surface-default); border-style: dashed; }
.agent-note--receipt { background: color-mix(in srgb, var(--apt-module-accent) 8%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-module-accent) 24%, transparent); }
.agent-note-role { font: 600 9px / 1 var(--apt-font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--apt-text-dim); }
.agent-note p { margin: 4px 0 0; font: var(--apt-font-size-body-sm) / 1.45 var(--apt-font-sans); color: var(--apt-text-body); }

.receipt-card {
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: var(--apt-radius-r2);
  border: 1px solid color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 30%, transparent);
  background: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 6%, var(--apt-surface-default));
}
.receipt-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.receipt-outcome { font: 600 9px / 1 var(--apt-font-mono); letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; border: 1px solid; }
.receipt-outcome--executed { color: var(--apt-standing-verified, #2b5945); background: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 12%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-standing-verified, #2b5945) 30%, transparent); }
.receipt-outcome--gated { color: var(--apt-standing-reported, #AD8B55); background: color-mix(in srgb, var(--apt-standing-reported, #AD8B55) 14%, var(--apt-surface-default)); border-color: color-mix(in srgb, var(--apt-standing-reported, #AD8B55) 34%, transparent); }
.receipt-intent { font: 600 13px / 1.3 var(--apt-font-serif); color: var(--apt-text-strong); }
.receipt-line { margin: 8px 0 0; font: 400 var(--apt-font-size-body-sm) / 1.4 var(--apt-font-sans); color: var(--apt-text-body); }
.receipt-tool { font: 600 11px / 1 var(--apt-font-mono); color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.receipt-foot { margin: 8px 0 0; font: 500 10px / 1.4 var(--apt-font-mono); letter-spacing: 0.03em; color: var(--apt-text-muted); }
.receipt-foot code { font: 600 10px / 1 var(--apt-font-mono); color: var(--apt-text-body); }
.receipt-foot--gated { color: var(--apt-standing-reported, #AD8B55); }
.receipt-foot--gated code { color: var(--apt-standing-reported, #AD8B55); }

/* ui-approval — approval chip pattern */
.approval-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border: 1px solid var(--line);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-default);
}
.approval-chip-label {
  font: 500 9px / 1 var(--apt-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--apt-text-dim);
}
.approval-chip-authority {
  font: 500 9px / 1 var(--apt-font-mono);
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

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