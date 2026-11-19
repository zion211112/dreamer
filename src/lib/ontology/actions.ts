/**
 * APT-LABS — Ontology Action Engine
 *
 * Kinetic actions: commit, assign, verify, settle, produce. Each action
 * validates authorization before executing and writes an event-ledger record
 * (append-only, per charter A4 and CAPABILITY_PRESERVATION_REGISTER P6).
 *
 * These are type definitions and validation functions — the actual execution
 * is wired through n8n workflows calling back into the APT-LABS API
 * (see docs/decisions/B10-self-hosted-n8n-orchestration.md).
 */

import type { EventSource } from './events';
import { createEvent } from './events';

// ---------------------------------------------------------------------------
// Action kinds
// ---------------------------------------------------------------------------

export const ACTION_KIND = {
  COMMIT: 'commit',
  ASSIGN: 'assign',
  VERIFY: 'verify',
  SETTLE: 'settle',
  PRODUCE: 'produce',
} as const;

export type ActionKind = (typeof ACTION_KIND)[keyof typeof ACTION_KIND];

export const ACTION_LABELS: Record<ActionKind, string> = {
  [ACTION_KIND.COMMIT]: 'Commit',
  [ACTION_KIND.ASSIGN]: 'Assign',
  [ACTION_KIND.VERIFY]: 'Verify',
  [ACTION_KIND.SETTLE]: 'Settle',
  [ACTION_KIND.PRODUCE]: 'Produce',
};

// ---------------------------------------------------------------------------
// Action result
// ---------------------------------------------------------------------------

export interface ActionResult {
  ok: boolean;
  actionKind: ActionKind;
  eventId?: string;
  entityId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Authorization context
// ---------------------------------------------------------------------------

export interface AuthContext {
  actorId: string;
  role: 'institution' | 'founder' | 'coordinator' | 'admin';
  organizationId?: string;
  permissions?: string[];
}

// ---------------------------------------------------------------------------
// Action validation rules (per action kind)
// ---------------------------------------------------------------------------

export interface ActionValidation {
  /** Required role(s) to perform this action (undefined = any authenticated actor). */
  requiredRoles?: AuthContext['role'][];
  /** Required permissions. */
  requiredPermissions?: string[];
  /** Whether the actor must be the subject's organization member. */
  requireOrgMembership?: boolean;
  /** Custom validation function (returns error message or null). */
  customValidate?: (ctx: AuthContext, input: unknown) => string | null;
}

// ---------------------------------------------------------------------------
// Action input types
// ---------------------------------------------------------------------------

export interface CommitInput {
  /** The commitment being undertaken. */
  commitmentId: string;
  /** Who is committing. */
  committingActorId: string;
  /** Terms of the commitment. */
  terms: string;
  /** When the commitment takes effect. */
  effectiveAt: string;
}

export interface AssignInput {
  /** The work item or task being assigned. */
  workId: string;
  /** Who is being assigned. */
  assigneeId: string;
  /** Role in the work (anchor, builder, apprentice, coordinator). */
  role: 'anchor' | 'builder' | 'apprentice' | 'coordinator';
  /** When the assignment takes effect. */
  effectiveAt: string;
}

export interface VerifyInput {
  /** The evidence being verified. */
  evidenceId: string;
  /** Verification outcome. */
  outcome: 'supported' | 'verified' | 'disputed' | 'rejected';
  /** Verification notes. */
  notes?: string;
}

export interface SettleInput {
  /** The exchange being settled. */
  exchangeId: string;
  /** Settlement amount (optional, currency-specific). */
  amount?: number;
  /** Currency (e.g. 'KES'). */
  currency?: string;
  /** Settlement date. */
  settledAt: string;
}

export interface ProduceInput {
  /** The work producing output. */
  workId: string;
  /** Output/outcome being produced. */
  outputId: string;
  /** When production completed. */
  completedAt: string;
}

// ---------------------------------------------------------------------------
// Action engine
// ---------------------------------------------------------------------------

export interface ActionEngine {
  /** Validate that the actor is authorized to perform the action. */
  authorize(ctx: AuthContext, kind: ActionKind, input: unknown): string | null;
  /** Execute the action: validate, build event, return result. */
  execute<T extends Record<string, unknown>>(
    ctx: AuthContext,
    kind: ActionKind,
    input: T,
    source: EventSource,
  ): Promise<ActionResult>;
}

// ---------------------------------------------------------------------------
// Default action validation rules
// ---------------------------------------------------------------------------

export const DEFAULT_ACTION_VALIDATIONS: Record<ActionKind, ActionValidation> = {
  [ACTION_KIND.COMMIT]: {
    requiredRoles: ['institution', 'founder', 'coordinator', 'admin'],
    requireOrgMembership: false,
  },
  [ACTION_KIND.ASSIGN]: {
    requiredRoles: ['coordinator', 'admin', 'institution'],
    requireOrgMembership: true,
  },
  [ACTION_KIND.VERIFY]: {
    requiredRoles: ['coordinator', 'admin', 'institution'],
    requireOrgMembership: false,
  },
  [ACTION_KIND.SETTLE]: {
    requiredRoles: ['institution', 'admin'],
    requireOrgMembership: true,
  },
  [ACTION_KIND.PRODUCE]: {
    requiredRoles: ['coordinator', 'admin', 'institution'],
    requireOrgMembership: true,
  },
};

// ---------------------------------------------------------------------------
// Default action engine implementation
// ---------------------------------------------------------------------------

export class DefaultActionEngine implements ActionEngine {
  private validations: Record<ActionKind, ActionValidation>;

  constructor(validations?: Partial<Record<ActionKind, ActionValidation>>) {
    this.validations = { ...DEFAULT_ACTION_VALIDATIONS, ...validations };
  }

  authorize(ctx: AuthContext, kind: ActionKind, input: unknown): string | null {
    const rule = this.validations[kind];
    if (!rule) return `Unknown action kind: ${kind}`;

    // Role check
    if (rule.requiredRoles && !rule.requiredRoles.includes(ctx.role)) {
      return `Role '${ctx.role}' is not authorized to perform '${kind}'`;
    }

    // Permission check
    if (rule.requiredPermissions && ctx.permissions) {
      const perms = ctx.permissions ?? [];
      const missing = rule.requiredPermissions.filter((p) => !perms.includes(p));
      if (missing.length > 0) {
        return `Missing permissions: ${missing.join(', ')}`;
      }
    }

    // Custom validation
    if (rule.customValidate) {
      return rule.customValidate(ctx, input);
    }

    return null;
  }

  async execute<T extends Record<string, unknown>>(
    ctx: AuthContext,
    kind: ActionKind,
    input: T,
    source: EventSource,
  ): Promise<ActionResult> {
    // 1. Authorize
    const authError = this.authorize(ctx, kind, input);
    if (authError) {
      return { ok: false, actionKind: kind, error: authError };
    }

    // 2. Build event-ledger record
    const now = new Date().toISOString();
    const eventType = (`ACTION_${kind.toUpperCase()}`) as import('./events').EventType;
    const event = createEvent({
      eventType: eventType as import('./events').EventType,
      subjectId: (input as unknown as { id?: string }).id ?? 'unknown',
      actorId: ctx.actorId,
      occurredAt: now,
      source,
      payload: { kind, input },
      organizationId: ctx.organizationId,
    });

    // 3. Return success (the event is written to the ledger by the caller)
    return { ok: true, actionKind: kind, eventId: event.eventId };
  }
}

export function createActionEngine(
  validations?: Partial<Record<ActionKind, ActionValidation>>,
): ActionEngine {
  return new DefaultActionEngine(validations);
}

// ---------------------------------------------------------------------------
// Runtime guard
// ---------------------------------------------------------------------------

export function isActionKind(value: unknown): value is ActionKind {
  return typeof value === 'string'
    && Object.values(ACTION_KIND).includes(value as ActionKind);
}
