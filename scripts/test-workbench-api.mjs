import assert from 'node:assert/strict';

const baseUrl = process.env['APT_API_URL'] ?? 'http://127.0.0.1:3000';
const origin = process.env['BETTER_AUTH_URL'] ?? 'http://localhost:4200';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

class Account {
  cookie = '';

  async request(path, { method = 'GET', body, expected } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        origin,
        ...(this.cookie ? { cookie: this.cookie } : {}),
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const cookies = response.headers.getSetCookie?.() ?? [];
    if (cookies.length) this.cookie = cookies.map((entry) => entry.split(';', 1)[0]).join('; ');
    const text = await response.text();
    let payload;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
    if (expected !== undefined) assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(payload)}`);
    return { status: response.status, data: payload?.data, error: payload?.error, payload };
  }

  async register(email, name) {
    const signup = await this.request('/api/auth/sign-up/email', {
      method: 'POST', body: { name, email, password: 'local-test-password-2026' }, expected: 200,
    });
    assert.ok(signup.payload?.user?.id, 'Better Auth returns a newly registered account');
    await this.request('/api/auth/sign-in/email', {
      method: 'POST', body: { email, password: 'local-test-password-2026' }, expected: 200,
    });
  }
}

const commissioner = new Account();
const participant = new Account();
const unrelated = new Account();
const observer = new Account();

await Promise.all([
  commissioner.register(`commissioner-${suffix}@example.test`, 'Achieng Commissioner'),
  participant.register(`participant-${suffix}@example.test`, 'Brian Participant'),
  unrelated.register(`unrelated-${suffix}@example.test`, 'Cynthia Unrelated'),
  observer.register(`observer-${suffix}@example.test`, 'Dara Observer'),
]);

const createdOrg = await commissioner.request('/api/organizations', {
  method: 'POST', body: { name: `Local test organisation ${suffix}` }, expected: 201,
});
const organizationId = createdOrg.data.id;
const createdWork = await commissioner.request(`/api/organizations/${organizationId}/undertakings`, {
  method: 'POST', body: { title: `Local shared undertaking ${suffix}`, scope: 'A bounded test scope shared only through the undertaking flow.' }, expected: 201,
});
const undertakingId = createdWork.data.id;

const commissionerNetwork = await commissioner.request('/api/me/network', { expected: 200 });
assert.equal(commissionerNetwork.data.organizations.length, 1, 'network identifies the account’s own active organization');
const participantNetwork = await participant.request('/api/me/network', { expected: 200 });
assert.equal(participantNetwork.data.organizations.length, 0, 'network does not infer organization membership from interest');
const commissionerRecords = await commissioner.request('/api/records', { expected: 200 });
assert.ok(commissionerRecords.data.undertakings.some((row) => row.id === undertakingId), 'organization member sees its undertaking in Records');
const participantRecords = await participant.request('/api/records', { expected: 200 });
assert.ok(participantRecords.data.undertakings.some((row) => row.id === undertakingId), 'open undertaking scope is discoverable in Records');
const unrelatedRecords = await unrelated.request('/api/records', { expected: 200 });
assert.ok(unrelatedRecords.data.undertakings.some((row) => row.id === undertakingId), 'open scope is discoverable to an unrelated account');
assert.equal(unrelatedRecords.data.events.some((event) => event.organizationId === organizationId), false, 'unrelated account cannot see organization activity');

const discoverable = await participant.request('/api/undertakings', { expected: 200 });
assert.ok(discoverable.data.some((row) => row.id === undertakingId), 'a different authenticated account sees the open scope');
const searched = await participant.request(`/api/undertakings?q=${encodeURIComponent(suffix)}`, { expected: 200 });
assert.ok(searched.data.length >= 1 && searched.data.every((row) => `${row.title} ${row.scope} ${row.organizationName}`.includes(suffix)), 'search narrows to the matching undertaking');
const filtered = await participant.request('/api/undertakings?status=closed', { expected: 200 });
assert.equal(filtered.data.some((row) => row.id === undertakingId), false, 'status filter excludes undertakings that are not closed');
const unauthorizedPublish = await participant.request(`/api/organizations/${organizationId}/undertakings`, {
  method: 'POST', body: { title: 'Forged undertaking', scope: 'Must not persist.' },
});
assert.equal(unauthorizedPublish.status, 403, 'non-member cannot publish into the commissioner organization');

const submitted = await participant.request(`/api/undertakings/${undertakingId}/interests`, {
  method: 'POST', body: { message: 'I can take part in this scoped work.' }, expected: 201,
});
const duplicate = await participant.request(`/api/undertakings/${undertakingId}/interests`, {
  method: 'POST', body: { message: 'Duplicate retry.' },
});
assert.equal(duplicate.status, 409, 'duplicate interest does not create another record');
const commissionView = await commissioner.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(commissionView.data.interests.length, 1, 'commissioner can inspect the participant interest');
assert.ok(commissionView.data.interests[0].personName, 'the organization sees who applied, not an opaque id');
assert.equal(commissionView.data.actions.canIssueOffer, true, 'manager may issue an offer');
assert.equal(commissionView.data.actions.canClose, true, 'manager may close the undertaking');
const workbenchAfterInterest = await commissioner.request('/api/workbench', { expected: 200 });
assert.equal(workbenchAfterInterest.data.counts.needsYou, 1, 'the pending interest appears in Needs you');
assert.equal(workbenchAfterInterest.data.needsYou[0].kind, 'interest');
const participantWorkbench = await participant.request('/api/workbench', { expected: 200 });
assert.equal(participantWorkbench.data.myInterests.length, 1, 'participant sees their own pending interest');
assert.equal(participantWorkbench.data.offersToYou.length, 0, 'no offer exists before the organization decides');
assert.ok(!JSON.stringify(commissionView.data).includes(`commissioner-${suffix}@example.test`), 'private account email is not included in undertaking records');

const offer = await commissioner.request(`/api/organizations/${organizationId}/undertakings/${undertakingId}/offers`, {
  method: 'POST', body: { interestId: submitted.data.id, proposal: 'Named participant role with the agreed scope.' }, expected: 201,
});
const otherAccept = await unrelated.request(`/api/undertaking-offers/${offer.data.id}/decision`, {
  method: 'POST', body: { decision: 'accepted' },
});
assert.equal(otherAccept.status, 404, 'an unrelated identity cannot accept another person’s offer');
const accepted = await participant.request(`/api/undertaking-offers/${offer.data.id}/decision`, {
  method: 'POST', body: { decision: 'accepted' }, expected: 200,
});
assert.equal(accepted.data.status, 'accepted');
const participantDetail = await participant.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(participantDetail.data.status, 'active', 'acceptance moves the undertaking into delivery');
assert.equal(participantDetail.data.position.isParticipant, true);
assert.equal(participantDetail.data.position.pendingOffer, null);
assert.equal(participantDetail.data.actions.canReport, true, 'accepted participant may report delivery');
assert.equal(participantDetail.data.participants[0].name, participantDetail.data.position.role === null ? participantDetail.data.participants[0].name : '', 'participant roster carries a human name');
const managerDetail = await commissioner.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(managerDetail.data.actions.canClose, true);
assert.equal(managerDetail.data.offers.length, 1);
const workbenchAfterAccept = await commissioner.request('/api/workbench', { expected: 200 });
assert.equal(workbenchAfterAccept.data.counts.needsYou, 0, 'an interest with an offer leaves the triage queue');

const report = await participant.request(`/api/undertakings/${undertakingId}/reports`, {
  method: 'POST', body: { report: 'Participant reports completion of the bounded scope.' }, expected: 201,
});
const workbenchAfterReport = await commissioner.request('/api/workbench', { expected: 200 });
assert.equal(workbenchAfterReport.data.needsYou[0].kind, 'report', 'an unreviewed report appears in Needs you');
const ownReview = await participant.request(`/api/organizations/${organizationId}/reports/${report.data.id}/reviews`, {
  method: 'POST', body: { decision: 'accepted', rationale: 'Self-review must be denied.' },
});
assert.equal(ownReview.status, 403, 'a report author cannot independently review their own report');
const outsiderDetail = await unrelated.request(`/api/undertakings/${undertakingId}`);
assert.equal(outsiderDetail.status, 403, 'unrelated account cannot read active undertaking details');
const outsiderReport = await unrelated.request(`/api/undertakings/${undertakingId}/reports`, {
  method: 'POST', body: { report: 'Forged report.' },
});
assert.equal(outsiderReport.status, 403, 'unrelated account cannot submit a work report');

const reviewed = await commissioner.request(`/api/organizations/${organizationId}/reports/${report.data.id}/reviews`, {
  method: 'POST', body: { decision: 'accepted', rationale: 'Commissioner reviewed the participant report.' }, expected: 201,
});
assert.equal(reviewed.data.decision, 'accepted');
const duplicateReview = await commissioner.request(`/api/organizations/${organizationId}/reports/${report.data.id}/reviews`, {
  method: 'POST', body: { decision: 'disputed', rationale: 'A second review must not overwrite the first.' },
});
assert.equal(duplicateReview.status, 409, 'a review cannot silently overwrite a prior review');

const refreshedParticipantView = await participant.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(refreshedParticipantView.data.reports[0].id, report.data.id, 'report persists across independent HTTP requests');
assert.equal(refreshedParticipantView.data.reports[0].review.decision, 'accepted', 'separate review is attached to the report it judges');
assert.ok(refreshedParticipantView.data.events.some((event) => event.action === 'undertaking.report_submitted'), 'the undertaking carries its own audit history');
const participantActivity = await participant.request('/api/records', { expected: 200 });
assert.ok(participantActivity.data.events.some((event) => event.action === 'undertaking.interest_submitted'), 'participant can see their own interest activity');
assert.equal(participantActivity.data.events.some((event) => event.action === 'undertaking.offer_issued'), false, 'participant feed does not disclose another actor’s offer activity');
const finalAudit = await commissioner.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(finalAudit.data.interests.length, 1);

const triageWork = await commissioner.request(`/api/organizations/${organizationId}/undertakings`, {
  method: 'POST', body: { title: `Triage undertaking ${suffix}`, scope: 'A second scope used to exercise interest triage.' }, expected: 201,
});
const triageInterest = await unrelated.request(`/api/undertakings/${triageWork.data.id}/interests`, {
  method: 'POST', body: { message: 'I can deliver this second scope.' }, expected: 201,
});
const declined = await commissioner.request(`/api/organizations/${organizationId}/undertakings/${triageWork.data.id}/interests/${triageInterest.data.id}/decline`, {
  method: 'POST', body: {}, expected: 200,
});
assert.equal(declined.data.declined, true);
const declineAgain = await commissioner.request(`/api/organizations/${organizationId}/undertakings/${triageWork.data.id}/interests/${triageInterest.data.id}/decline`, {
  method: 'POST', body: {},
});
assert.equal(declineAgain.status, 409, 'an interest is declined once');
const triageDetail = await commissioner.request(`/api/undertakings/${triageWork.data.id}`, { expected: 200 });
assert.equal(triageDetail.data.interests[0].declined, true, 'decline is recorded on the interest');
assert.ok(triageDetail.data.events.some((event) => event.action === 'undertaking.interest_declined'), 'decline is in the audit trail');
const triageQueue = await commissioner.request('/api/workbench', { expected: 200 });
assert.equal(triageQueue.data.needsYou.some((item) => item.undertakingId === triageWork.data.id), false, 'a declined interest leaves the triage queue');

const openReflectionAttempt = await participant.request(`/api/undertakings/${undertakingId}/reflection`, {
  method: 'POST', body: { learning: 'Too early.', localValue: 'Too early.', financialRecordAssessment: 'uncertain', financialRecordRationale: 'Not closed.', expectedVersion: 0 },
});
assert.equal(openReflectionAttempt.status, 409, 'participant reflection is unavailable until close');
const nonParticipantReflection = await unrelated.request(`/api/undertakings/${undertakingId}/reflection`, {
  method: 'POST', body: { learning: 'Forged.', localValue: 'Forged.', financialRecordAssessment: 'uncertain', financialRecordRationale: 'Not a participant.', expectedVersion: 0 },
});
assert.equal(nonParticipantReflection.status, 403, 'only an accepted participant may reflect');

const closed = await commissioner.request(`/api/organizations/${organizationId}/undertakings/${undertakingId}/close`, { method: 'POST', body: {}, expected: 200 });
assert.equal(closed.data.status, 'closed');
const closedAgain = await commissioner.request(`/api/organizations/${organizationId}/undertakings/${undertakingId}/close`, { method: 'POST', body: {} });
assert.equal(closedAgain.status, 409, 'an undertaking is closed once');
const lateReport = await participant.request(`/api/undertakings/${undertakingId}/reports`, { method: 'POST', body: { report: 'Must be rejected after close.' } });
assert.equal(lateReport.status, 409, 'a closed undertaking accepts no new report');
const closedDetail = await participant.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(closedDetail.data.status, 'closed');
assert.equal(closedDetail.data.actions.canReport, false, 'a closed undertaking offers no delivery action');
assert.equal(closedDetail.data.position.isParticipant, true, 'history remains readable after close');
assert.equal(closedDetail.data.actions.canReflect, true, 'a closed participant may write a reflection');
const invalidFinancialNarrative = await participant.request(`/api/undertakings/${undertakingId}/reflection`, {
  method: 'POST', body: { learning: 'A lesson.', localValue: 'A value.', financialRecordAssessment: 'uncertain', financialRecordRationale: 'Use bank account details.', expectedVersion: 0 },
});
assert.equal(invalidFinancialNarrative.status, 400, 'financial narrative rejects account or payment details');
const reflectionInput = {
  learning: 'I learned to test the press alignment before long runs.',
  localValue: 'The neighborhood can print notices locally again.',
  financialRecordAssessment: 'uncertain',
  financialRecordRationale: 'No separate financial record was established by this undertaking.',
  expectedVersion: 0,
};
const reflection = await participant.request(`/api/undertakings/${undertakingId}/reflection`, {
  method: 'POST', body: reflectionInput, expected: 201,
});
assert.equal(reflection.data.version, 1, 'the participant authored version one');
assert.equal(reflection.data.authorName, 'Brian Participant', 'reflection author comes from the session identity');
const managerReflectionView = await commissioner.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(managerReflectionView.data.reflections.length, 1, 'managing organization role can read the participant reflection');
assert.equal(managerReflectionView.data.reflections[0].learning, reflectionInput.learning);
const participantReflectionView = await participant.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(participantReflectionView.data.myReflection.version, 1, 'author can read their current reflection');
const observerMembership = await commissioner.request(`/api/organizations/${organizationId}/members`, {
  method: 'POST', body: { email: `observer-${suffix}@example.test`, role: 'viewer' }, expected: 201,
});
assert.equal(observerMembership.data.role, 'viewer');
const nonManagingReflectionView = await observer.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(nonManagingReflectionView.data.reflections.length, 0, 'ordinary organization members cannot read participant reflections');
const observerRecords = await observer.request('/api/records', { expected: 200 });
assert.equal(observerRecords.data.events.some((event) => event.action.startsWith('undertaking.reflection_')), false, 'ordinary organization members cannot see reflection audit activity');
const observerStudioEvents = await observer.request('/api/studio/query', {
  method: 'POST', body: { type: 'event', search: 'undertaking.reflection_', limit: 20 }, expected: 200,
});
assert.equal(observerStudioEvents.data.objects.length, 0, 'Studio event queries do not disclose reflection audit activity to ordinary members');
const managerStudioEvents = await commissioner.request('/api/studio/query', {
  method: 'POST', body: { type: 'event', search: 'undertaking.reflection_', limit: 20 }, expected: 200,
});
const reflectionEvent = managerStudioEvents.data.objects.find((event) => event.properties['action'] === 'undertaking.reflection_submitted');
assert.ok(reflectionEvent, 'manager Studio query can find reflection event');
const observerStudioGraph = await observer.request(`/api/studio/graph?type=event&id=${reflectionEvent.id}&depth=1`);
assert.equal(observerStudioGraph.status, 404, 'ordinary viewer cannot open the reflection audit event graph');
const managerRecords = await commissioner.request('/api/records', { expected: 200 });
assert.ok(managerRecords.data.events.some((event) => event.action === 'undertaking.reflection_submitted'), 'managing organization roles can see attributed reflection activity');
const authorRecords = await participant.request('/api/records', { expected: 200 });
assert.ok(authorRecords.data.events.some((event) => event.action === 'undertaking.reflection_submitted'), 'the author can see their own attributed reflection activity');
const nonParticipantReflectionByMember = await observer.request(`/api/undertakings/${undertakingId}/reflection`, {
  method: 'POST', body: { ...reflectionInput, expectedVersion: 0 },
});
assert.equal(nonParticipantReflectionByMember.status, 403, 'organization membership alone does not authorize participant authorship');
const staleReflection = await participant.request(`/api/undertakings/${undertakingId}/reflection`, {
  method: 'POST', body: { ...reflectionInput, learning: 'Stale overwrite.', expectedVersion: 0 },
});
assert.equal(staleReflection.status, 409, 'stale reflection revision cannot overwrite the latest');
const revisedReflection = await participant.request(`/api/undertakings/${undertakingId}/reflection`, {
  method: 'POST', body: { ...reflectionInput, learning: 'I also learned to let the ink settle before stacking.', expectedVersion: 1 }, expected: 201,
});
assert.equal(revisedReflection.data.version, 2, 'revision creates a new immutable version');
const finalReflectionView = await participant.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(finalReflectionView.data.myReflection.version, 2, 'the author revision form uses the latest version');
assert.deepEqual(finalReflectionView.data.reflections.map((entry) => entry.version), [2, 1], 'the author can read the complete immutable version history');
const managerFinalReflectionView = await commissioner.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.deepEqual(managerFinalReflectionView.data.reflections.map((entry) => entry.version), [2, 1], 'managers can read the complete authorized reflection history');
assert.ok(finalReflectionView.data.events.some((event) => event.action === 'undertaking.reflection_submitted'), 'reflection submission is attributed in the audit trail');
assert.ok(finalReflectionView.data.events.some((event) => event.action === 'undertaking.reflection_revised'), 'reflection revision is attributed in the audit trail');

const added = await commissioner.request(`/api/organizations/${organizationId}/members`, {
  method: 'POST', body: { email: `unrelated-${suffix}@example.test`, role: 'manager' }, expected: 201,
});
assert.equal(added.data.role, 'manager', 'owner can add an existing account as a manager');
const addedAgain = await commissioner.request(`/api/organizations/${organizationId}/members`, {
  method: 'POST', body: { email: `unrelated-${suffix}@example.test`, role: 'member' },
});
assert.equal(addedAgain.status, 409, 'a person is a member once');
const participantAdds = await participant.request(`/api/organizations/${organizationId}/members`, {
  method: 'POST', body: { email: `unrelated-${suffix}@example.test`, role: 'viewer' },
});
assert.equal(participantAdds.status, 403, 'a non-member cannot add members');
const colleagueView = await unrelated.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(colleagueView.data.status, 'closed', 'a new manager can read the organization’s closed work');
assert.equal(colleagueView.data.actions.canClose, false);
const colleagueWorkbench = await unrelated.request('/api/workbench', { expected: 200 });
assert.ok(colleagueWorkbench.data.organizations.some((row) => row.id === organizationId && row.role === 'manager'), 'the new role appears in the colleague’s workbench');

console.log(JSON.stringify({
  result: 'PASS',
  evidence: [
    'three independent Better Auth registrations and sessions',
    'cross-account open-scope discovery',
    'organization membership denial for publish',
    'interest -> distinct commissioner offer -> recipient acceptance',
    'participant report -> separate non-self commissioner review',
    'duplicate interest and review conflict handling',
    'unrelated account denied active detail and report writes',
    'report and review remain available after subsequent requests',
    'manager triage queue surfaces pending interests and unreviewed reports only',
    'declining an interest preserves the message and records the decision',
    'search and status filters narrow the visible work',
    'closing stops new offers and reports while the record stays readable',
    'only a closed accepted participant can author a reflection; managers see it and ordinary members do not',
    'participant reflection revisions are append-only, version-checked, and attributed in audit history',
    'financial narrative rejects account/payment details before persistence',
    'ordinary members cannot see reflection activity through Records, Studio query, or Studio graph',
    'owner adds a colleague as manager; duplicate and outsider additions are refused',
    'the colleague can then read closed work and sees the recorded role',
  ],
  undertakingId,
}, null, 2));
