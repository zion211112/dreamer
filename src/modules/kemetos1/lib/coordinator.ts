// Kemetos1 Coordinator — engine layer.
//
// Kemetos1 is a coordinator layer, not a destination page. It is designed to be
// driven by an LLM: it exposes a small registry of structured tools (grasp
// essence, verify user, update work, route job, issue attestation, draft brief,
// propose next step, read records). A human steward still applies mutations —
// propose-never-executes. Everything is browser-local.

import {
  readFieldSignals,
  readWorkBriefDrafts,
  writeWorkBriefDrafts,
  createWorkBrief,
  createLocalId,
  readCommonsGovernance,
  hasLocalStewardRole,
  type FieldSignal,
  type WorkBriefDraft,
} from '@/lib/local-workflows';
import {
  pilotByKey,
  workItemsForPilot,
  type WorkItem,
  type GateState,
  NEXT_GATE,
  GATE_LABELS,
} from '@/modules/workbench/data';
import { chatLLM, isLLMConfigured } from './llm';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface WorkspaceEssence {
  pilot: string;
  signalCount: number;
  activeSignalCount: number;
  workItemCount: number;
  openWorkItemCount: number;
  summary: string;
  nextSteps: string[];
}

export interface CoordinationProposal {
  id: string;
  type: 'brief' | 'advance';
  targetId: string;
  targetType: 'signal' | 'workItem';
  title: string;
  rationale: string;
  suggestedAction: string;
  draft?: Partial<WorkBriefDraft>;
  nextGate?: GateState;
  createdAt: string;
}

export interface WorkUpdate {
  id: string;
  workItemId: string;
  fromGate: GateState;
  toGate: GateState;
  actor: string;
  note: string;
  createdAt: string;
}

export interface Attestation {
  id: string;
  workItemId: string;
  kind: string;
  note: string;
  createdAt: string;
}

export interface RoutedJob {
  id: string;
  fromPilot: string;
  workItemId: string;
  note: string;
  createdAt: string;
}

export interface KemetoToolInput {
  [key: string]: unknown;
}

export interface KemetoToolOutput {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface KemetoTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (input: KemetoToolInput) => Promise<KemetoToolOutput>;
}

export interface KemetoRecords {
  updates: WorkUpdate[];
  attestations: Attestation[];
  routedJobs: RoutedJob[];
}

const STORAGE_UPDATES = 'aptlabs:kemetos1-updates:v1';
const STORAGE_ATTESTATIONS = 'aptlabs:kemetos1-attestations:v1';
const STORAGE_ROUTED = 'aptlabs:kemetos1-routed-jobs:v1';

const SYSTEM = `You are the Kemetos1 coordinator agent for an APT-LABS workspace.
You operate in propose-never-executes mode: you summarize what is happening and
propose coordination actions, but a human steward always applies them.

Context is browser-local field signals and Kemetos pilot work items. Work item
gates flow: draft → proposed → in_review → pending_authorization → authorized
→ in_execution → pending_acceptance → accepted.

Be concise, concrete, and grounded in the provided data. Never invent capital,
names, or rates not present in the context. Output plain text only.`;

function now(): string {
  return new Date().toISOString();
}

function localId(prefix: string): string {
  return createLocalId(prefix);
}

/* ------------------------------------------------------------------ */
/* Engine class                                                       */
/* ------------------------------------------------------------------ */

export class Kemetos1Coordinator {
  /* ---------------------------------------------------------------- */
  /* Essence                                                          */
  /* ---------------------------------------------------------------- */

  async graspEssence(): Promise<WorkspaceEssence> {
    const signals = readFieldSignals();
    const workItems = workItemsForPilot('kemetos');
    const pilot = pilotByKey('kemetos');

    const activeSignals = signals.filter(
      (s) => s.status === 'new' || s.status === 'triaged',
    );
    const openWorkItems = workItems.filter((w) => w.gate !== 'accepted');

    const context = this.buildContext(signals, workItems);
    const summary = isLLMConfigured()
      ? await this.llmSummarize(context)
      : this.heuristicSummary(signals, workItems);
    const nextSteps = isLLMConfigured()
      ? await this.llmNextSteps(context)
      : this.heuristicNextSteps(activeSignals, openWorkItems);

    return {
      pilot: pilot?.label ?? 'Kemetos1',
      signalCount: signals.length,
      activeSignalCount: activeSignals.length,
      workItemCount: workItems.length,
      openWorkItemCount: openWorkItems.length,
      summary,
      nextSteps,
    };
  }

  /* ---------------------------------------------------------------- */
  /* User verification                                                */
  /* ---------------------------------------------------------------- */

  verifyUser(email: string, institutionId: string): boolean {
    try {
      const governance = readCommonsGovernance();
      return hasLocalStewardRole(governance, institutionId, email);
    } catch {
      return false;
    }
  }

  /* ---------------------------------------------------------------- */
  /* Work updates                                                     */
  /* ---------------------------------------------------------------- */

  readWorkUpdates(): WorkUpdate[] {
    let raw: string | null;
    try {
      raw = localStorage.getItem(STORAGE_UPDATES);
    } catch {
      return [];
    }
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((u: unknown) => isWorkUpdate(u));
    } catch {
      return [];
    }
  }

  applyWorkUpdate(
    workItemId: string,
    fromGate: GateState,
    toGate: GateState,
    actor: string,
    note: string,
  ): WorkUpdate {
    const update: WorkUpdate = {
      id: localId('work-update'),
      workItemId,
      fromGate,
      toGate,
      actor: actor.trim(),
      note: note.trim(),
      createdAt: now(),
    };
    const existing = this.readWorkUpdates();
    try {
      localStorage.setItem(STORAGE_UPDATES, JSON.stringify([update, ...existing]));
    } catch {
      throw new Error('This browser could not save the work update.');
    }
    return update;
  }

  /* ---------------------------------------------------------------- */
  /* Attestations (local SBT-like issuance)                           */
  /* ---------------------------------------------------------------- */

  readAttestations(): Attestation[] {
    let raw: string | null;
    try {
      raw = localStorage.getItem(STORAGE_ATTESTATIONS);
    } catch {
      return [];
    }
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((a: unknown) => isAttestation(a));
    } catch {
      return [];
    }
  }

  issueAttestation(workItemId: string, kind: string, note: string): Attestation {
    const attestation: Attestation = {
      id: localId('attestation'),
      workItemId,
      kind: kind.trim(),
      note: note.trim(),
      createdAt: now(),
    };
    const existing = this.readAttestations();
    try {
      localStorage.setItem(
        STORAGE_ATTESTATIONS,
        JSON.stringify([attestation, ...existing]),
      );
    } catch {
      throw new Error('This browser could not issue the attestation.');
    }
    return attestation;
  }

  /* ---------------------------------------------------------------- */
  /* Job routing between pilots                                       */
  /* ---------------------------------------------------------------- */

  readRoutedJobs(): RoutedJob[] {
    let raw: string | null;
    try {
      raw = localStorage.getItem(STORAGE_ROUTED);
    } catch {
      return [];
    }
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((j: unknown) => isRoutedJob(j));
    } catch {
      return [];
    }
  }

  routeJob(fromPilot: string, workItemId: string, note: string): RoutedJob {
    const routed: RoutedJob = {
      id: localId('routed-job'),
      fromPilot: fromPilot.trim(),
      workItemId,
      note: note.trim(),
      createdAt: now(),
    };
    const existing = this.readRoutedJobs();
    try {
      localStorage.setItem(STORAGE_ROUTED, JSON.stringify([routed, ...existing]));
    } catch {
      throw new Error('This browser could not record the routed job.');
    }
    return routed;
  }

  /* ---------------------------------------------------------------- */
  /* Coordination proposals                                           */
  /* ---------------------------------------------------------------- */

  async draftBrief(signal: FieldSignal): Promise<CoordinationProposal> {
    const context = `FIELD SIGNAL\n- id: ${signal.id}\n- institution: ${signal.institutionName}\n- location: ${signal.location}\n- title: ${signal.title}\n- urgency: ${signal.urgency}\n- details: ${signal.details}\n- suspected cause: ${signal.suspectedCause ?? '—'}\n- evidence: ${(signal.evidenceOnHand ?? []).join(', ') || '—'}\n- missing checks: ${(signal.missingChecks ?? []).join(', ') || '—'}`;

    let draft: Partial<WorkBriefDraft>;
    if (isLLMConfigured()) {
      const reply = await chatLLM([
        { role: 'system', content: `${SYSTEM}\n\nDraft a work brief (scope, bill of materials, acceptance criteria) from the field signal. Return a short scope line, a comma-separated BOM, and comma-separated acceptance criteria.` },
        { role: 'user', content: context },
      ]);
      draft = this.parseBriefDraft(reply);
    } else {
      draft = this.heuristicBrief(signal);
    }

    return {
      id: localId('proposal'),
      type: 'brief',
      targetId: signal.id,
      targetType: 'signal',
      title: `Draft work brief — ${signal.title}`,
      rationale: `Convert signal ${signal.id} into a structured work brief for the Kemetos pilot.`,
      suggestedAction: 'Review the drafted scope, BOM and acceptance criteria, then save it as a work brief draft.',
      draft,
      createdAt: now(),
    };
  }

  async proposeNextStep(workItem: WorkItem): Promise<CoordinationProposal> {
    const nextGate = NEXT_GATE[workItem.gate];
    const context = `WORK ITEM\n- id: ${workItem.id}\n- pilot: ${workItem.pilot}\n- title: ${workItem.title}\n- discipline: ${workItem.discipline}\n- location: ${workItem.location}\n- current gate: ${workItem.gate} (${GATE_LABELS[workItem.gate]})\n- call sheet: ${workItem.callSheet ? workItem.callSheet.scope : 'none'}\n- capital: KES ${workItem.capital.financial.toLocaleString('en-KE')}, escrowed=${workItem.capital.escrowed}, deployed=${workItem.capital.deployed}`;

    let proposedGate: GateState | undefined;
    let rationale: string;
    if (isLLMConfigured() && nextGate) {
      const reply = await chatLLM([
        { role: 'system', content: `${SYSTEM}\n\nPropose whether this work item should advance to its next gate (${GATE_LABELS[nextGate]}). Reply with just the gate name and a one-line rationale.` },
        { role: 'user', content: context },
      ]);
      proposedGate = (this.parseGate(reply) ?? nextGate) ?? undefined;
      rationale = `LLM recommends advancing from ${GATE_LABELS[workItem.gate]} to ${GATE_LABELS[proposedGate!]}.`;
    } else {
      proposedGate = nextGate ?? undefined;
      rationale = nextGate
        ? `Advance from ${GATE_LABELS[workItem.gate]} to ${GATE_LABELS[nextGate]}.`
        : 'Work item is already settled; no further gate transitions.';
    }

    return {
      id: localId('proposal'),
      type: 'advance',
      targetId: workItem.id,
      targetType: 'workItem',
      title: `Advance ${workItem.title}`,
      rationale,
      suggestedAction: proposedGate
        ? `Confirm advance to ${GATE_LABELS[proposedGate]}.`
        : 'No action; the undertaking is settled.',
      nextGate: proposedGate,
      createdAt: now(),
    };
  }

  async applyBrief(proposal: CoordinationProposal): Promise<WorkBriefDraft> {
    const signal = readFieldSignals().find((s) => s.id === proposal.targetId);
    if (!signal) throw new Error('Source signal not found.');
    const draft = createWorkBrief(signal);
    const filled: WorkBriefDraft = {
      ...draft,
      ...proposal.draft,
      id: draft.id,
      sourceSignalId: signal.id,
      updatedAt: now(),
    };
    const existing = readWorkBriefDrafts();
    writeWorkBriefDrafts([...existing.filter((d) => d.id !== filled.id), filled]);
    return filled;
  }

  /* ---------------------------------------------------------------- */
  /* Helpers                                                          */
  /* ---------------------------------------------------------------- */

  private buildContext(signals: FieldSignal[], workItems: readonly WorkItem[]): string {
    const active = signals.filter((s) => s.status === 'new' || s.status === 'triaged');
    const open = workItems.filter((w) => w.gate !== 'accepted');
    const lines: string[] = [];
    lines.push(`Kemetos pilot workspace snapshot:`);
    lines.push(`- field signals total: ${signals.length}; active (new/triaged): ${active.length}`);
    lines.push(`- work items total: ${workItems.length}; open (not accepted): ${open.length}`);
    if (active.length) {
      lines.push(`- active signals: ${active.map((s) => `${s.id}: ${s.title} (${s.urgency})`).join('; ')}`);
    }
    if (open.length) {
      lines.push(`- open work items: ${open.map((w) => `${w.id}: ${w.title} [${w.gate}]`).join('; ')}`);
    }
    return lines.join('\n');
  }

  private async llmSummarize(context: string): Promise<string> {
    const reply = await chatLLM([
      { role: 'system', content: `${SYSTEM}\n\nSummarize the workspace essence for the Kemetos pilot in 2-4 sentences: what is happening now, what needs attention, and what is blocking.` },
      { role: 'user', content: context },
    ]);
    return reply || this.heuristicSummary([], []);
  }

  private async llmNextSteps(context: string): Promise<string[]> {
    const reply = await chatLLM([
      { role: 'system', content: `${SYSTEM}\n\nList 3-5 concrete next coordination steps as short lines, one per line, no numbering.` },
      { role: 'user', content: context },
    ]);
    return reply
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(0, 5);
  }

  private heuristicSummary(signals: FieldSignal[], workItems: readonly WorkItem[]): string {
    const active = signals.filter((s) => s.status === 'new' || s.status === 'triaged').length;
    const open = workItems.filter((w) => w.gate !== 'accepted').length;
    const accepted = workItems.filter((w) => w.gate === 'accepted').length;
    return `Kemetos pilot: ${signals.length} field signals (${active} active), ${workItems.length} work items (${open} open, ${accepted} accepted). The coordinator layer is running in local-heuristic mode — configure VITE_KEMETOS1_LLM_API_KEY and VITE_KEMETOS1_LLM_BASE_URL for LLM-powered summaries and proposals.`;
  }

  private heuristicNextSteps(activeSignals: FieldSignal[], openWorkItems: WorkItem[]): string[] {
    const steps: string[] = [];
    if (activeSignals.length) {
      steps.push(`Draft a work brief from the most urgent active signal: ${activeSignals[0].title}`);
    }
    if (openWorkItems.length) {
      steps.push(`Propose advancing the oldest open undertaking: ${openWorkItems[0].title}`);
    }
    steps.push('Review gate transitions and escrow state across open work items.');
    steps.push('Record any steward decisions in the Commons governance panel.');
    return steps.slice(0, 5);
  }

  private heuristicBrief(signal: FieldSignal): Partial<WorkBriefDraft> {
    return {
      title: `Work brief: ${signal.title}`,
      scope: signal.details || `Undertaking for ${signal.institutionName} at ${signal.location}.`,
      materials: (signal.evidenceOnHand ?? []).length
        ? (signal.evidenceOnHand ?? []).join(', ')
        : 'To be defined by steward.',
      acceptanceCriteria: `Steward sign-off for ${signal.institutionName}; completion of signal checks: ${(signal.missingChecks ?? []).join(', ') || 'none recorded'}.`,
      fieldNotes: `Source signal ${signal.id} (urgency: ${signal.urgency}). Suspected cause: ${signal.suspectedCause ?? 'not recorded'}.`,
    };
  }

  private parseBriefDraft(content: string): Partial<WorkBriefDraft> {
    const grab = (label: string): string => {
      const rx = new RegExp(`${label}[\\s:]*([^\\n]*)`, 'i');
      const m = content.match(rx);
      return m ? m[1].trim() : '';
    };
    return {
      title: 'Work brief (LLM-drafted)',
      scope: grab('scope') || content.slice(0, 200),
      materials: grab('bom') || 'To be defined by steward.',
      acceptanceCriteria: grab('acceptance') || 'Steward sign-off.',
    };
  }

  private parseGate(content: string): GateState | undefined {
    const gates: GateState[] = [
      'proposed', 'in_review', 'pending_authorization', 'authorized',
      'in_execution', 'pending_acceptance', 'accepted',
    ];
    const upper = content.toUpperCase();
    for (const g of gates) {
      if (upper.includes(g.toUpperCase())) return g;
    }
    return undefined;
  }
}

export const kemetos1Coordinator = new Kemetos1Coordinator();

/* ------------------------------------------------------------------ */
/* LLM-runnable tool registry                                         */
/* ------------------------------------------------------------------ */

function str(description: string): Record<string, unknown> {
  return { type: 'string', description };
}

export const kemetos1Tools: Record<string, KemetoTool> = {
  graspEssence: {
    name: 'graspEssence',
    description: 'Summarize the current Kemetos pilot workspace essence: signal counts, open work items, what is happening now, and suggested next steps.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: async () => {
      const essence = await kemetos1Coordinator.graspEssence();
      return { ok: true, data: essence };
    },
  },
  verifyUser: {
    name: 'verifyUser',
    description: 'Verify whether an email is a registered steward for the Kemetos institution (user verification).',
    inputSchema: {
      type: 'object',
      properties: {
        email: str('Steward email address to verify.'),
        institutionId: str('Institution id to verify stewardship against (e.g. "kemetos").'),
      },
      required: ['email', 'institutionId'],
      additionalProperties: false,
    },
    handler: async (input) => {
      const ok = kemetos1Coordinator.verifyUser(String(input.email ?? ''), String(input.institutionId ?? ''));
      return { ok: true, data: { ok, email: input.email, institutionId: input.institutionId } };
    },
  },
  updateWork: {
    name: 'updateWork',
    description: 'Record a work-item gate transition (advance work). Propose-never-executes: records the update locally for steward confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        workItemId: str('Id of the work item to update.'),
        fromGate: str('Current gate state.'),
        toGate: str('Target gate state.'),
        actor: str('Actor applying the update.'),
        note: str('Reason for the update.'),
      },
      required: ['workItemId', 'fromGate', 'toGate', 'actor', 'note'],
      additionalProperties: false,
    },
    handler: async (input) => {
      const update = kemetos1Coordinator.applyWorkUpdate(
        String(input.workItemId ?? ''),
        String(input.fromGate ?? '') as GateState,
        String(input.toGate ?? '') as GateState,
        String(input.actor ?? ''),
        String(input.note ?? ''),
      );
      return { ok: true, data: update };
    },
  },
  routeJob: {
    name: 'routeJob',
    description: 'Route a work item from another pilot (e.g. benbenos) into the Kemetos coordinator layer.',
    inputSchema: {
      type: 'object',
      properties: {
        fromPilot: str('Pilot the job is routed from (e.g. "benbenos").'),
        workItemId: str('Id of the work item being routed.'),
        note: str('Routing note.'),
      },
      required: ['fromPilot', 'workItemId', 'note'],
      additionalProperties: false,
    },
    handler: async (input) => {
      const routed = kemetos1Coordinator.routeJob(
        String(input.fromPilot ?? ''),
        String(input.workItemId ?? ''),
        String(input.note ?? ''),
      );
      return { ok: true, data: routed };
    },
  },
  issueAttestation: {
    name: 'issueAttestation',
    description: 'Issue a local attestation (SBT-like record) for a work item.',
    inputSchema: {
      type: 'object',
      properties: {
        workItemId: str('Id of the work item to attest.'),
        kind: str('Attestation kind/category.'),
        note: str('Attestation note.'),
      },
      required: ['workItemId', 'kind', 'note'],
      additionalProperties: false,
    },
    handler: async (input) => {
      const attestation = kemetos1Coordinator.issueAttestation(
        String(input.workItemId ?? ''),
        String(input.kind ?? ''),
        String(input.note ?? ''),
      );
      return { ok: true, data: attestation };
    },
  },
  draftBrief: {
    name: 'draftBrief',
    description: 'Draft a structured work brief (scope, BOM, acceptance criteria) from a field signal.',
    inputSchema: {
      type: 'object',
      properties: {
        signalId: str('Id of the field signal to convert into a work brief.'),
      },
      required: ['signalId'],
      additionalProperties: false,
    },
    handler: async (input) => {
      const signal = readFieldSignals().find((s) => s.id === String(input.signalId ?? ''));
      if (!signal) return { ok: false, error: 'Source signal not found.' };
      const proposal = await kemetos1Coordinator.draftBrief(signal);
      return { ok: true, data: proposal };
    },
  },
  proposeNextStep: {
    name: 'proposeNextStep',
    description: 'Propose the next gate transition for a Kemetos work item.',
    inputSchema: {
      type: 'object',
      properties: {
        workItemId: str('Id of the work item to propose a next step for.'),
      },
      required: ['workItemId'],
      additionalProperties: false,
    },
    handler: async (input) => {
      const workItem = workItemsForPilot('kemetos').find((w) => w.id === String(input.workItemId ?? ''));
      if (!workItem) return { ok: false, error: 'Work item not found.' };
      const proposal = await kemetos1Coordinator.proposeNextStep(workItem);
      return { ok: true, data: proposal };
    },
  },
  readRecords: {
    name: 'readRecords',
    description: 'Read all coordinator-maintained records: work updates, attestations, and routed jobs.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: async () => {
      const records: KemetoRecords = {
        updates: kemetos1Coordinator.readWorkUpdates(),
        attestations: kemetos1Coordinator.readAttestations(),
        routedJobs: kemetos1Coordinator.readRoutedJobs(),
      };
      return { ok: true, data: records };
    },
  },
};

export function callTool(name: string, input: KemetoToolInput): Promise<KemetoToolOutput> {
  const tool = kemetos1Tools[name];
  if (!tool) {
    return Promise.resolve({ ok: false, error: `Unknown tool: ${name}` });
  }
  return tool.handler(input);
}

export function listTools(): KemetoTool[] {
  return Object.values(kemetos1Tools);
}

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

function isWorkUpdate(value: unknown): value is WorkUpdate {
  return (
    typeof value === 'object'
    && value !== null
    && typeof (value as WorkUpdate).id === 'string'
    && typeof (value as WorkUpdate).workItemId === 'string'
    && typeof (value as WorkUpdate).fromGate === 'string'
    && typeof (value as WorkUpdate).toGate === 'string'
    && typeof (value as WorkUpdate).actor === 'string'
    && typeof (value as WorkUpdate).note === 'string'
    && typeof (value as WorkUpdate).createdAt === 'string'
  );
}

function isAttestation(value: unknown): value is Attestation {
  return (
    typeof value === 'object'
    && value !== null
    && typeof (value as Attestation).id === 'string'
    && typeof (value as Attestation).workItemId === 'string'
    && typeof (value as Attestation).kind === 'string'
    && typeof (value as Attestation).note === 'string'
    && typeof (value as Attestation).createdAt === 'string'
  );
}

function isRoutedJob(value: unknown): value is RoutedJob {
  return (
    typeof value === 'object'
    && value !== null
    && typeof (value as RoutedJob).id === 'string'
    && typeof (value as RoutedJob).fromPilot === 'string'
    && typeof (value as RoutedJob).workItemId === 'string'
    && typeof (value as RoutedJob).note === 'string'
    && typeof (value as RoutedJob).createdAt === 'string'
  );
}
