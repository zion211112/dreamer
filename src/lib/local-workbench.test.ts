import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  acceptLocalAuthorization,
  authorizeLocalWork,
  beginLocalReview,
  createLocalApplication,
  decideLocalApplication,
  filterLocalWorkbenchApplications,
  readLocalWorkbench,
  reviewLocalDelivery,
  submitLocalDelivery,
  WORK_OPPORTUNITIES,
  writeLocalWorkbench,
  type LocalWorkApplication,
  type LocalWorkbenchRecord,
} from './local-workbench';

const opportunityId = WORK_OPPORTUNITIES[0].id;

function application(overrides: Partial<LocalWorkApplication> = {}): LocalWorkApplication {
  return {
    id: 'application-1',
    opportunityId,
    applicant: 'Ada',
    note: 'I can deliver this work.',
    shareEvidence: false,
    status: 'submitted',
    workStatus: null,
    deliveryEvidence: '',
    decisionNote: '',
    events: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function progressToInProgress(id = 'application-1'): LocalWorkbenchRecord {
  const submitted = { applications: [application({ id })] };
  const reviewing = beginLocalReview(submitted, id);
  const selected = decideLocalApplication(reviewing, id, 'selected', 'Relevant experience.');
  const authorized = authorizeLocalWork(selected, id);
  return acceptLocalAuthorization(authorized, id);
}

afterEach(() => vi.unstubAllGlobals());

describe('local opportunity and delivery workflow', () => {
  it('createsLocalApplicationWithoutExternalSubmission', () => {
    const empty = { applications: [] };
    const next = createLocalApplication(empty, opportunityId, ' Ada ', '  Relevant experience.  ', true);

    expect(next.applications).toHaveLength(1);
    expect(next.applications[0]).toMatchObject({
      applicant: 'Ada',
      note: 'Relevant experience.',
      shareEvidence: true,
      status: 'submitted',
      workStatus: null,
    });
    expect(next.applications[0].events[0].note).toMatch(/nothing was sent/i);
    expect(empty.applications).toEqual([]);
  });

  it('requiresReviewBeforeDecision', () => {
    const submitted = { applications: [application()] };

    expect(() => decideLocalApplication(submitted, 'application-1', 'selected', 'Select.'))
      .toThrow(/under review/i);
    expect(submitted.applications[0].status).toBe('submitted');

    const reviewing = beginLocalReview(submitted, 'application-1');
    expect(reviewing.applications[0].status).toBe('under_review');
    expect(submitted.applications[0].status).toBe('submitted');
  });

  it('keepsSelectionDistinctFromAuthorization', () => {
    const reviewing = beginLocalReview({ applications: [application()] }, 'application-1');
    const selected = decideLocalApplication(reviewing, 'application-1', 'selected', 'Scope fits.');

    expect(selected.applications[0]).toMatchObject({
      status: 'selected',
      workStatus: 'authorization_pending',
    });
    expect(selected.applications[0].workStatus).not.toBe('authorized');
  });

  it('requiresAuthorizationBeforeWorkStarts', () => {
    const reviewing = beginLocalReview({ applications: [application()] }, 'application-1');
    const selected = decideLocalApplication(reviewing, 'application-1', 'selected', 'Scope fits.');

    expect(() => acceptLocalAuthorization(selected, 'application-1')).toThrow(/authorized/i);
    const authorized = authorizeLocalWork(selected, 'application-1');
    expect(authorized.applications[0].workStatus).toBe('authorized');
    expect(acceptLocalAuthorization(authorized, 'application-1').applications[0].workStatus)
      .toBe('in_progress');
  });

  it('requiresDeliveryEvidenceAndReviewNote', () => {
    const inProgress = progressToInProgress();

    expect(() => submitLocalDelivery(inProgress, 'application-1', '  ')).toThrow(/evidence/i);
    expect(inProgress.applications[0].workStatus).toBe('in_progress');
    const submitted = submitLocalDelivery(inProgress, 'application-1', '  Photos and inspection note.  ');
    expect(submitted.applications[0]).toMatchObject({
      workStatus: 'submitted',
      deliveryEvidence: 'Photos and inspection note.',
    });
    expect(() => reviewLocalDelivery(submitted, 'application-1', 'accepted', '  '))
      .toThrow(/review outcome/i);
  });

  it('recordsAcceptanceOrRequestedChangesSeparately', () => {
    const firstDelivery = submitLocalDelivery(
      progressToInProgress('application-changes'),
      'application-changes',
      'Initial delivery evidence.',
    );
    const changesRequested = reviewLocalDelivery(
      firstDelivery,
      'application-changes',
      'changes_requested',
      'Add the inspection record.',
    );
    const resubmitted = submitLocalDelivery(
      changesRequested,
      'application-changes',
      'Delivery and inspection record.',
    );
    const accepted = reviewLocalDelivery(
      resubmitted,
      'application-changes',
      'accepted',
      'Evidence meets the local criteria.',
    );

    expect(changesRequested.applications[0].workStatus).toBe('changes_requested');
    expect(accepted.applications[0].workStatus).toBe('accepted');
    expect(accepted.applications[0].events.map(event => event.action))
      .toContain('changes_requested');
    expect(accepted.applications[0].events.map(event => event.action))
      .toContain('accepted');
  });

  it('filtersReviewAndAuthorizationRecords', () => {
    const records = [
      application({ id: 'submitted' }),
      application({ id: 'reviewing', status: 'under_review' }),
      application({ id: 'selected', status: 'selected' }),
      application({ id: 'declined', status: 'declined' }),
      application({ id: 'pending', status: 'selected', workStatus: 'authorization_pending' }),
      application({ id: 'authorized', status: 'selected', workStatus: 'authorized' }),
      application({ id: 'other-applicant', applicant: 'Grace' }),
      application({ id: 'in-progress', workStatus: 'in_progress' }),
      application({ id: 'delivery-submitted', workStatus: 'submitted' }),
      application({ id: 'changes-requested', workStatus: 'changes_requested' }),
      application({ id: 'accepted', workStatus: 'accepted' }),
    ];
    const original = [...records];
    const result = filterLocalWorkbenchApplications(records, 'Ada', 'review');

    expect(result.map(item => item.id)).toEqual([
      'submitted',
      'reviewing',
      'selected',
      'declined',
      'pending',
      'authorized',
    ]);
    expect(records).toEqual(original);
    expect(records).toHaveLength(original.length);
  });

  it('filtersDeliveryRecords', () => {
    const records = [
      application({ id: 'in-progress', workStatus: 'in_progress' }),
      application({ id: 'delivery-submitted', workStatus: 'submitted' }),
      application({ id: 'changes-requested', workStatus: 'changes_requested' }),
      application({ id: 'accepted', workStatus: 'accepted' }),
      application({ id: 'authorization-pending', status: 'selected', workStatus: 'authorization_pending' }),
      application({ id: 'other-applicant', applicant: 'Grace', workStatus: 'in_progress' }),
    ];
    const original = [...records];

    expect(filterLocalWorkbenchApplications(records, 'Ada', 'delivery').map(item => item.id))
      .toEqual(['in-progress', 'delivery-submitted', 'changes-requested', 'accepted']);
    expect(records).toEqual(original);
  });

  it('rejectsOutOfOrderTransitionsWithoutMutatingRecord', () => {
    const submitted = { applications: [application()] };
    expect(() => authorizeLocalWork(submitted, 'application-1')).toThrow(/selected work/i);
    expect(() => submitLocalDelivery(submitted, 'application-1', 'Evidence.')).toThrow(/in progress/i);
    expect(submitted.applications[0]).toEqual(application());
  });

  it('surfacesMalformedReadsAndStorageFailures', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{' });
    expect(() => readLocalWorkbench()).toThrow(/damaged/i);

    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    });
    expect(() => readLocalWorkbench()).toThrow(/could not read/i);
    expect(() => writeLocalWorkbench({ applications: [] })).toThrow(/could not save/i);
  });
});
