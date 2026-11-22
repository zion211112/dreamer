/**
 * APT-LABS — Investment & funding layer.
 *
 * Users can invest or fund projects posted by founders and innovators. Pledges
 * are held as COMMITMENT records; funds release when the outcome is verified
 * through fulfilCommitment → settlement. Denominated in disclosed KES, not a
 * universal currency. No blockchain, no securities marketplace.
 *
 * Economic instrument within the platform, not a public market (charter A9:
 * tokens are conditional, separately governed; no assumed universal-value function).
 */

import {
  createRecord,
  getRecord,
  listRecords,
  updateRecord,
  type RecordEnvelope,
} from './record-envelope';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { createRelationship } from './relationship-store';

export type PledgeStatus = 'pledged' | 'released' | 'refunded' | 'disputed';

export interface InvestmentPledgeData {
  needId: string;
  targetActorId: string;
  amountKes: number;
  currency: string;
  status: PledgeStatus;
  releasedAt: string | null;
  refundedAt: string | null;
  disputeReason: string | null;
}

export interface PledgeInput {
  needId: string;
  targetActorId: string;
  amountKes: number;
  currency: string;
  backerId: string;
  pledgedBy: string;
  authz?: AuthzContext;
}

export interface ReleaseInput {
  pledgeId: string;
  releasedBy: string;
  authz?: AuthzContext;
}

export interface PledgeRecord {
  id: string;
  needId: string;
  targetActorId: string;
  amountKes: number;
  currency: string;
  status: PledgeStatus;
  backerId: string;
  releasedAt: string | null;
}

function pledgeData(rec: RecordEnvelope): InvestmentPledgeData {
  return rec.data as unknown as InvestmentPledgeData;
}

/**
 * Create an investment pledge. Creates a COMMITMENT record of type
 * InvestmentPledge + an ANSWERS relationship to the need. Gated by
 * `commitment:write`.
 */
export function pledgeInvestment(input: PledgeInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'commitment:write');
  }

  const pledge = createRecord({
    family: 'COMMITMENT',
    type: 'InvestmentPledge',
    data: {
      needId: input.needId,
      targetActorId: input.targetActorId,
      amountKes: input.amountKes,
      currency: input.currency,
      status: 'pledged' as PledgeStatus,
      releasedAt: null,
      refundedAt: null,
      disputeReason: null,
    },
    actorId: input.targetActorId,
    createdBy: input.pledgedBy,
    authz: input.authz,
  });

  createRelationship({
    kind: 'ANSWERS',
    sourceId: input.backerId,
    targetId: input.needId,
    sourceRole: 'backer',
    targetRole: 'need',
    actorId: input.targetActorId,
    createdBy: input.pledgedBy,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.pledgedBy,
    actorId: input.targetActorId,
    action: 'commitment.create',
    resourceType: 'commitment',
    resourceId: pledge.id,
    details: {
      needId: input.needId,
      amountKes: input.amountKes,
      currency: input.currency,
    },
  });

  return pledge;
}

/**
 * Release a pledged investment when the outcome is verified. Requires
 * `commitment:admin` and a verified outcome on the linked need/commitment.
 */
export function releaseInvestment(input: ReleaseInput): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'commitment:admin');
  }

  const pledge = getRecord(input.pledgeId);
  if (!pledge) throw new Error(`Pledge not found: ${input.pledgeId}`);
  if (pledgeData(pledge).status !== 'pledged') {
    throw new Error(`Pledge ${input.pledgeId} is not in pledged status`);
  }

  const now = new Date().toISOString();
  const updated = updateRecord(input.pledgeId, {
    data: {
      ...pledgeData(pledge),
      status: 'released' as PledgeStatus,
      releasedAt: now,
    },
    updatedBy: input.releasedBy,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.releasedBy,
    actorId: pledge.actorId,
    action: 'commitment.fulfil',
    resourceType: 'commitment',
    resourceId: pledge.id,
    details: { releasedAt: now },
  });

  return updated;
}

/**
 * List all pledges against a given need.
 */
export function listPledges(needId: string): PledgeRecord[] {
  return listRecords({ family: 'COMMITMENT', type: 'InvestmentPledge' })
    .filter((r) => pledgeData(r).needId === needId)
    .map((r) => {
      const d = pledgeData(r);
      return {
        id: r.id,
        needId: d.needId,
        targetActorId: d.targetActorId,
        amountKes: d.amountKes,
        currency: d.currency,
        status: d.status,
        backerId: r.createdBy,
        releasedAt: d.releasedAt,
      };
    });
}

/**
 * Aggregate disclosed investment amounts by actor (for the Value module ledger).
 */
export function investmentLedger(): Array<{ actorId: string; totalPledgedKes: number; totalReleasedKes: number; pledgeCount: number }> {
  const byActor = new Map<string, { totalPledgedKes: number; totalReleasedKes: number; pledgeCount: number }>();
  for (const r of listRecords({ family: 'COMMITMENT', type: 'InvestmentPledge' })) {
    const d = pledgeData(r);
    const cur = byActor.get(d.targetActorId) ?? { totalPledgedKes: 0, totalReleasedKes: 0, pledgeCount: 0 };
    cur.totalPledgedKes += d.amountKes;
    cur.pledgeCount += 1;
    if (d.status === 'released' && d.releasedAt) {
      cur.totalReleasedKes += d.amountKes;
    }
    byActor.set(d.targetActorId, cur);
  }
  return Array.from(byActor.entries()).map(([actorId, v]) => ({ actorId, ...v }));
}