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

  async register(email) {
    const signup = await this.request('/api/auth/sign-up/email', {
      method: 'POST', body: { name: `Test ${email}`, email, password: 'local-test-password-2026' }, expected: 200,
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

await Promise.all([
  commissioner.register(`commissioner-${suffix}@example.test`),
  participant.register(`participant-${suffix}@example.test`),
  unrelated.register(`unrelated-${suffix}@example.test`),
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

const report = await participant.request(`/api/undertakings/${undertakingId}/reports`, {
  method: 'POST', body: { report: 'Participant reports completion of the bounded scope.' }, expected: 201,
});
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
assert.equal(refreshedParticipantView.data.reviews[0].decision, 'accepted', 'separate review persists across independent HTTP requests');
const participantActivity = await participant.request('/api/records', { expected: 200 });
assert.ok(participantActivity.data.events.some((event) => event.action === 'undertaking.interest_submitted'), 'participant can see their own interest activity');
assert.equal(participantActivity.data.events.some((event) => event.action === 'undertaking.offer_issued'), false, 'participant feed does not disclose another actor’s offer activity');
const finalAudit = await commissioner.request(`/api/undertakings/${undertakingId}`, { expected: 200 });
assert.equal(finalAudit.data.interests.length, 1);

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
  ],
  undertakingId,
}, null, 2));
