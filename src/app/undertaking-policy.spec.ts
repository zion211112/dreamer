import { describe, expect, it } from 'vitest';
import {
  canReviewReport,
  isManagingRole,
  statusAfterAcceptance,
  statusAfterClose,
  workActions,
  participantReflectionInputSchema,
  type OrganizationRole,
  type UndertakingStatus,
} from '@apt-labs/domain';

const base = { status: 'open' as UndertakingStatus, isParticipant: false, hasInterest: false, pendingOfferId: null };

describe('workbench authority', () => {
  it('treats only owner, administrator and manager as managing roles', () => {
    expect(isManagingRole('owner')).toBe(true);
    expect(isManagingRole('manager')).toBe(true);
    expect(isManagingRole('member')).toBe(false);
    expect(isManagingRole('viewer')).toBe(false);
    expect(isManagingRole(null)).toBe(false);
  });

  it('lets a manager publish, triage and close while open', () => {
    const actions = workActions({ ...base, role: 'manager' });
    expect(actions).toMatchObject({ canPostWork: true, canTriageInterests: true, canIssueOffer: true, canClose: true });
    expect(actions.canRegisterInterest).toBe(false);
    expect(actions.canReport).toBe(false);
  });

  it('stops new decisions on a closed undertaking but keeps the record readable', () => {
    const actions = workActions({ ...base, role: 'administrator', status: 'closed' });
    expect(actions.canClose).toBe(false);
    expect(actions.canIssueOffer).toBe(false);
    expect(actions.canReport).toBe(false);
    expect(actions.canReflect).toBe(false);
    expect(actions.canRegisterInterest).toBe(false);
  });

  it('lets an outsider express interest only while the undertaking is open', () => {
    expect(workActions({ ...base, role: null }).canRegisterInterest).toBe(true);
    expect(workActions({ ...base, role: null, status: 'active' }).canRegisterInterest).toBe(false);
    expect(workActions({ ...base, role: null, hasInterest: true }).canRegisterInterest).toBe(false);
    expect(workActions({ ...base, role: null, isParticipant: true }).canRegisterInterest).toBe(false);
  });

  it('lets an invited participant accept a pending offer and report once accepted', () => {
    const invited = workActions({ ...base, role: null, pendingOfferId: 'offer-1' });
    expect(invited.canAcceptPendingOffer).toBe(true);
    expect(invited.canReport).toBe(false);
    const participant = workActions({ ...base, role: null, status: 'active', isParticipant: true });
    expect(participant.canReport).toBe(true);
    expect(participant.canReflect).toBe(false);
    expect(workActions({ ...base, role: null, status: 'closed', isParticipant: true }).canReflect).toBe(true);
    expect(participant.canRegisterInterest).toBe(false);
  });

  it('does not let a recipient accept an offer on a closed undertaking', () => {
    expect(workActions({ ...base, role: null, status: 'closed', pendingOfferId: 'offer-1' }).canAcceptPendingOffer).toBe(false);
  });
});

describe('review separation of duties', () => {
  const reviewer = { reviewerPersonId: 'reviewer', authorPersonId: 'author', reviewerRole: 'manager' as OrganizationRole, alreadyReviewed: false };

  it('requires a managing role in the owning organization', () => {
    expect(canReviewReport(reviewer)).toBe(true);
    expect(canReviewReport({ ...reviewer, reviewerRole: 'member' })).toBe(false);
    expect(canReviewReport({ ...reviewer, reviewerRole: null })).toBe(false);
  });

  it('never lets an author review their own report', () => {
    expect(canReviewReport({ ...reviewer, reviewerPersonId: 'author' })).toBe(false);
  });

  it('is one review per report', () => {
    expect(canReviewReport({ ...reviewer, alreadyReviewed: true })).toBe(false);
  });
});

describe('participant reflection contract', () => {
  const reflection = {
    learning: 'I learned to test alignment before printing.',
    localValue: 'Local notices can now be printed nearby.',
    financialRecordAssessment: 'uncertain',
    financialRecordRationale: 'No separate record was established by this undertaking.',
    expectedVersion: 0,
  };

  it('accepts a narrative-only financial assessment', () => {
    expect(participantReflectionInputSchema.safeParse(reflection).success).toBe(true);
  });

  it.each(['The amount was 250.', 'Use bank account details.', 'The payment is owed.', 'Card PIN is 1234.'])(
    'rejects financial instructions or identifiers: %s',
    (financialRecordRationale) => {
      expect(participantReflectionInputSchema.safeParse({ ...reflection, financialRecordRationale }).success).toBe(false);
    },
  );

  it('rejects client-supplied identity, undertaking, or extra fields', () => {
    expect(participantReflectionInputSchema.safeParse({ ...reflection, authorPersonId: 'forged' }).success).toBe(false);
    expect(participantReflectionInputSchema.safeParse({ ...reflection, undertakingId: 'forged' }).success).toBe(false);
  });
});

describe('undertaking lifecycle', () => {
  it('activates delivery on acceptance and keeps a closed record closed', () => {
    expect(statusAfterAcceptance('open')).toBe('active');
    expect(statusAfterAcceptance('active')).toBe('active');
    expect(statusAfterAcceptance('closed')).toBe('closed');
  });

  it('closes once and cannot be closed twice', () => {
    expect(statusAfterClose('open')).toBe('closed');
    expect(statusAfterClose('active')).toBe('closed');
    expect(statusAfterClose('closed')).toBeNull();
  });
});
