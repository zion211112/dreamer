/**
 * APT-LABS — Ontology Workflow Engine
 *
 * Coordinates multi-step processes across the ontology: kinetic actions,
 * gate transitions, evidence collection, and settlement. Workflows are
 * executed by n8n (see docs/decisions/B10-self-hosted-n8n-orchestration.md)
 * calling back into the APT-LABS API.
 */

import type { ActionKind } from './actions';
import type { EventType } from './events';
import type { Family } from './types';

// ---------------------------------------------------------------------------
// Workflow step
// ---------------------------------------------------------------------------

export interface WorkflowStep {
  id: string;
  name: string;
  actionKind: ActionKind;
  /** Events emitted by this step. */
  emits: readonly EventType[];
  /** Subject family this step operates on. */
  subjectFamily?: Family;
  /** Whether this step is required. */
  required: boolean;
  /** Whether this step can be retried. */
  retryable: boolean;
  /** Dependencies: step ids that must complete before this step. */
  dependsOn: readonly string[];
}

// ---------------------------------------------------------------------------
// Workflow definition
// ---------------------------------------------------------------------------

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  /** The kinetic action family this workflow belongs to. */
  actionKind: ActionKind;
  steps: readonly WorkflowStep[];
  /** Whether the workflow requires human approval before execution. */
  requiresApproval: boolean;
  /** Whether the workflow is active. */
  active: boolean;
}

// ---------------------------------------------------------------------------
// Workflow execution state
// ---------------------------------------------------------------------------

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  /** Subject entity id this workflow operates on. */
  subjectId: string;
  /** Current step being executed (or last completed). */
  currentStepId?: string;
  /** Completed step ids. */
  completedSteps: readonly string[];
  /** Failed step id (if status is 'failed'). */
  failedStepId?: string;
  /** Error message (if failed). */
  error?: string;
  /** When execution started. */
  startedAt?: string;
  /** When execution completed. */
  completedAt?: string;
  /** Event ids produced by this execution. */
  eventIds: readonly string[];
}

// ---------------------------------------------------------------------------
// Step result
// ---------------------------------------------------------------------------

export interface StepResult {
  stepId: string;
  ok: boolean;
  eventId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Workflow engine interface
// ---------------------------------------------------------------------------

export interface WorkflowEngine {
  /** Start a workflow execution. */
  start(workflowId: string, subjectId: string, actorId: string): Promise<WorkflowExecution>;
  /** Execute the next pending step. */
  nextStep(executionId: string, actorId: string): Promise<StepResult>;
  /** Complete a workflow execution. */
  complete(executionId: string): Promise<WorkflowExecution>;
  /** Cancel a workflow execution. */
  cancel(executionId: string, reason: string): Promise<WorkflowExecution>;
  /** Get an execution by id. */
  getExecution(executionId: string): WorkflowExecution | undefined;
  /** List executions for a subject. */
  listExecutionsForSubject(subjectId: string): WorkflowExecution[];
}

// ---------------------------------------------------------------------------
// Canonical workflow definitions (APT-LABS kinetic actions)
// ---------------------------------------------------------------------------

export const CANONICAL_WORKFLOWS: readonly WorkflowDefinition[] = [
  {
    id: 'wf-commit',
    name: 'Commit',
    description: 'Record a commitment undertaking with authorization.',
    actionKind: 'commit',
    steps: [
      {
        id: 'commit-authorize',
        name: 'Authorize commitment',
        actionKind: 'commit',
        emits: ['COMMIT_CREATED'],
        subjectFamily: 'COMMITMENT',
        required: true,
        retryable: false,
        dependsOn: [],
      },
    ],
    requiresApproval: false,
    active: true,
  },
  {
    id: 'wf-assign',
    name: 'Assign',
    description: 'Assign a crew member to a work item with role and person id.',
    actionKind: 'assign',
    steps: [
      {
        id: 'assign-authorize',
        name: 'Authorize assignment',
        actionKind: 'assign',
        emits: ['ASSIGN_CREATED'],
        subjectFamily: 'WORK',
        required: true,
        retryable: false,
        dependsOn: [],
      },
    ],
    requiresApproval: false,
    active: true,
  },
  {
    id: 'wf-verify',
    name: 'Verify',
    description: 'Verify evidence with maturity × evidence-standing dimensions.',
    actionKind: 'verify',
    steps: [
      {
        id: 'verify-evidence',
        name: 'Verify evidence',
        actionKind: 'verify',
        emits: ['VERIFY_CREATED'],
        subjectFamily: 'EVIDENCE',
        required: true,
        retryable: true,
        dependsOn: [],
      },
    ],
    requiresApproval: false,
    active: true,
  },
  {
    id: 'wf-settle',
    name: 'Settle',
    description: 'Settle an exchange (payment, materials reconciliation, etc.).',
    actionKind: 'settle',
    steps: [
      {
        id: 'settle-exchange',
        name: 'Settle exchange',
        actionKind: 'settle',
        emits: ['SETTLE_CREATED'],
        subjectFamily: 'EXCHANGE',
        required: true,
        retryable: false,
        dependsOn: [],
      },
    ],
    requiresApproval: true,
    active: true,
  },
  {
    id: 'wf-produce',
    name: 'Produce',
    description: 'Record output/outcome from work or activity.',
    actionKind: 'produce',
    steps: [
      {
        id: 'produce-output',
        name: 'Produce output',
        actionKind: 'produce',
        emits: ['PRODUCE_CREATED'],
        subjectFamily: 'OUTPUT_OUTCOME',
        required: true,
        retryable: false,
        dependsOn: [],
      },
    ],
    requiresApproval: false,
    active: true,
  },
] as const;

// ---------------------------------------------------------------------------
// Runtime guards
// ---------------------------------------------------------------------------

export function isWorkflowStatus(value: unknown): value is WorkflowStatus {
  return typeof value === 'string'
    && ['pending', 'running', 'completed', 'failed', 'cancelled'].includes(value);
}

export function isWorkflowDefinition(value: unknown): value is WorkflowDefinition {
  if (!value || typeof value !== 'object') return false;
  const w = value as Partial<WorkflowDefinition>;
  return (
    typeof w.id === 'string'
    && typeof w.name === 'string'
    && typeof w.description === 'string'
    && Array.isArray(w.steps)
    && w.steps.every(
      (s: unknown) =>
        typeof s === 'object'
        && s !== null
        && typeof (s as Partial<WorkflowStep>).id === 'string'
        && typeof (s as Partial<WorkflowStep>).name === 'string'
    )
    && typeof w.requiresApproval === 'boolean'
    && typeof w.active === 'boolean'
  );
}
