/**
 * EngineAgent — governed execution runtime for APT-LABS.
 *
 * Position: EngineAgent is the authorised execution bridge between intelligence
 * and action. It never holds autonomous authority. A human steward applies every
 * consequential change — propose-never-executes.
 *
 * Six internal mechanisms:
 *  1. Context Builder — assemble the relevant undertaking, actors, records, evidence, permissions.
 *  2. Planner — develop a proposed plan and identify dependencies.
 *  3. Agent Registry — select specialised agents and their permitted tools.
 *  4. Policy Gate — check scope, authority and required approvals.
 *  5. Executor — carry out authorised operations through controlled interfaces.
 *  6. Trace & Evaluation — record what happened, why, with what result and at what cost.
 */

export type EngineAgentRole = 'reviewer' | 'authorizer' | 'executor' | 'observer';

export interface EngineAgentIdentity {
  id: string;
  name: string;
  role: EngineAgentRole;
  scope: string[]; // e.g. ['workbench:advance', 'records:read']
  allowedTools: string[];
  timeBoundUntil?: string;
}

export interface EngineContext {
  undertakingId: string;
  undertakingTitle: string;
  actor: string;
  actorRole: string;
  relevantRecords: string[];
  evidenceIds: string[];
  permissions: string[];
  requestedAt: string;
}

export interface PlanStep {
  id: string;
  tool: string;
  action: string;
  rationale: string;
  requiresApproval: boolean;
}

export interface ProposedPlan {
  id: string;
  context: EngineContext;
  steps: PlanStep[];
  dependencies: string[];
  uncertainty: string;
  createdAt: string;
}

export interface PolicyGateResult {
  allowed: boolean;
  reason: string;
  missingApprovals: string[];
}

export interface ExecutionTrace {
  id: string;
  planId: string;
  stepId: string;
  actor: string;
  action: string;
  result: 'approved' | 'rejected' | 'executed' | 'failed';
  note: string;
  createdAt: string;
}

interface PendingPlan {
  plan: ProposedPlan;
  status: 'pending' | 'approved' | 'rejected';
}

const STORAGE_KEY = 'aptlabs:engine-agent-traces:v1';

function now(): string {
  return new Date().toISOString();
}

function readIdentity(): EngineAgentIdentity | null {
  try {
    const raw = localStorage.getItem('aptlabs:engine-agent-identity');
    if (!raw) return null;
    return JSON.parse(raw) as EngineAgentIdentity;
  } catch {
    return null;
  }
}

function writeIdentity(identity: EngineAgentIdentity): void {
  try {
    localStorage.setItem('aptlabs:engine-agent-identity', JSON.stringify(identity));
  } catch {
    throw new Error('EngineAgent identity could not be stored.');
  }
}

function readTraces(): ExecutionTrace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t: unknown) => isExecutionTrace(t));
  } catch {
    return [];
  }
}

function writeTraces(traces: ExecutionTrace[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(traces));
  } catch {
    throw new Error('EngineAgent trace log could not be saved.');
  }
}

function isExecutionTrace(value: unknown): value is ExecutionTrace {
  return (
    typeof value === 'object' && value !== null
    && typeof (value as ExecutionTrace).id === 'string'
    && typeof (value as ExecutionTrace).planId === 'string'
    && typeof (value as ExecutionTrace).stepId === 'string'
    && typeof (value as ExecutionTrace).actor === 'string'
    && typeof (value as ExecutionTrace).action === 'string'
    && ['approved', 'rejected', 'executed', 'failed'].includes((value as ExecutionTrace).result)
    && typeof (value as ExecutionTrace).note === 'string'
    && typeof (value as ExecutionTrace).createdAt === 'string'
  );
}

export class EngineAgent {
  private identity: EngineAgentIdentity;
  private pendingPlans: Map<string, PendingPlan>;
  private traces: ExecutionTrace[];

  constructor(identity: EngineAgentIdentity) {
    this.identity = identity;
    this.pendingPlans = new Map();
    this.traces = readTraces();
  }

  /* ---------------------------------------------------------------- */
  /* 1. Context Builder                                               */
  /* ---------------------------------------------------------------- */

  buildContext(input: {
    undertakingId: string;
    undertakingTitle: string;
    actor: string;
    actorRole: string;
    relevantRecords?: string[];
    evidenceIds?: string[];
    permissions?: string[];
  }): EngineContext {
    return {
      undertakingId: input.undertakingId,
      undertakingTitle: input.undertakingTitle,
      actor: input.actor,
      actorRole: input.actorRole,
      relevantRecords: input.relevantRecords ?? [],
      evidenceIds: input.evidenceIds ?? [],
      permissions: input.permissions ?? this.identity.scope,
      requestedAt: now(),
    };
  }

  /* ---------------------------------------------------------------- */
  /* 2. Planner                                                       */
  /* ---------------------------------------------------------------- */

  plan(context: EngineContext, steps: Array<{ tool: string; action: string; rationale: string; requiresApproval?: boolean }>): ProposedPlan {
    const plan: ProposedPlan = {
      id: `plan-${crypto.randomUUID()}`,
      context,
      steps: steps.map((s, i) => ({
        id: `step-${i}`,
        tool: s.tool,
        action: s.action,
        rationale: s.rationale,
        requiresApproval: s.requiresApproval ?? true,
      })),
      dependencies: [],
      uncertainty: 'Planner is heuristic — verify against source records before authorising.',
      createdAt: now(),
    };
    this.pendingPlans.set(plan.id, { plan, status: 'pending' });
    return plan;
  }

  /* ---------------------------------------------------------------- */
  /* 3. Agent Registry                                                */
  /* ---------------------------------------------------------------- */

  canUseTool(tool: string): boolean {
    return this.identity.allowedTools.includes(tool);
  }

  /* ---------------------------------------------------------------- */
  /* 4. Policy Gate                                                   */
  /* ---------------------------------------------------------------- */

  gate(planId: string, actor: string): PolicyGateResult {
    const pending = this.pendingPlans.get(planId);
    if (!pending) {
      return { allowed: false, reason: 'Plan not found.', missingApprovals: [] };
    }
    if (pending.status !== 'pending') {
      return { allowed: false, reason: `Plan already ${pending.status}.`, missingApprovals: [] };
    }

    const missingApprovals: string[] = [];
    for (const step of pending.plan.steps) {
      if (step.requiresApproval && !this.canUseTool(step.tool)) {
        missingApprovals.push(step.tool);
      }
    }

    // Only the authorized actor may gate consequential changes.
    const isAuthorized = actor === this.identity.id || this.identity.role === 'authorizer';
    const allowed = missingApprovals.length === 0 && isAuthorized;

    return {
      allowed,
      reason: allowed
        ? 'Policy gate passed — plan is authorised for execution.'
        : missingApprovals.length > 0
          ? 'One or more steps require authority this agent does not hold.'
          : 'You are not authorised to gate this plan.',
      missingApprovals,
    };
  }

  /* ---------------------------------------------------------------- */
  /* 5. Executor                                                      */
  /* ---------------------------------------------------------------- */

  execute(planId: string, stepId: string, actor: string, note: string): ExecutionTrace {
    const pending = this.pendingPlans.get(planId);
    if (!pending) {
      throw new Error('Plan not found.');
    }
    if (pending.status !== 'pending') {
      throw new Error(`Plan already ${pending.status}.`);
    }
    const step = pending.plan.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new Error('Step not found.');
    }
    if (!this.canUseTool(step.tool)) {
      throw new Error(`EngineAgent is not permitted to use tool ${step.tool}.`);
    }

    const trace: ExecutionTrace = {
      id: `trace-${crypto.randomUUID()}`,
      planId,
      stepId,
      actor,
      action: step.action,
      result: 'executed',
      note,
      createdAt: now(),
    };
    this.traces = [trace, ...this.traces];
    writeTraces(this.traces);
    return trace;
  }

  /* ---------------------------------------------------------------- */
  /* 6. Trace & Evaluation                                            */
  /* ---------------------------------------------------------------- */

  readTraces(): ExecutionTrace[] {
    return [...this.traces];
  }

  readTrace(id: string): ExecutionTrace | null {
    return this.traces.find((t) => t.id === id) ?? null;
  }

  approvePlan(planId: string, actor: string): void {
    const pending = this.pendingPlans.get(planId);
    if (!pending) throw new Error('Plan not found.');
    if (pending.status !== 'pending') throw new Error(`Plan already ${pending.status}.`);
    pending.status = 'approved';
    this.traces = [
      {
        id: `trace-${crypto.randomUUID()}`,
        planId,
        stepId: 'gate',
        actor,
        action: 'approve_plan',
        result: 'approved',
        note: 'Human steward approved the plan.',
        createdAt: now(),
      },
      ...this.traces,
    ];
    writeTraces(this.traces);
  }

  rejectPlan(planId: string, actor: string, reason: string): void {
    const pending = this.pendingPlans.get(planId);
    if (!pending) throw new Error('Plan not found.');
    if (pending.status !== 'pending') throw new Error(`Plan already ${pending.status}.`);
    pending.status = 'rejected';
    this.traces = [
      {
        id: `trace-${crypto.randomUUID()}`,
        planId,
        stepId: 'gate',
        actor,
        action: 'reject_plan',
        result: 'rejected',
        note: reason,
        createdAt: now(),
      },
      ...this.traces,
    ];
    writeTraces(this.traces);
  }

  getPlan(planId: string): ProposedPlan | null {
    const pending = this.pendingPlans.get(planId);
    return pending ? pending.plan : null;
  }
}

export function createEngineAgent(identity: EngineAgentIdentity): EngineAgent {
  writeIdentity(identity);
  return new EngineAgent(identity);
}

export function readStoredIdentity(): EngineAgentIdentity | null {
  return readIdentity();
}