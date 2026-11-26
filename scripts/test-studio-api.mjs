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
const outsider = new Account();
const outsider2 = new Account();

await Promise.all([
  commissioner.register(`studio-commissioner-${suffix}@example.test`, 'Achieng Studio'),
  participant.register(`studio-participant-${suffix}@example.test`, 'Brian Studio'),
  outsider.register(`studio-outsider-${suffix}@example.test`, 'Cynthia Studio'),
  outsider2.register(`studio-outsider2-${suffix}@example.test`, 'Daudi Studio'),
]);

const org = await commissioner.request('/api/organizations', {
  method: 'POST', body: { name: `Studio test organisation ${suffix}` }, expected: 201,
});
const organizationId = org.data.id;

const work = await commissioner.request(`/api/organizations/${organizationId}/undertakings`, {
  method: 'POST', body: { title: `Studio object query ${suffix}`, scope: 'A bounded scope used to prove typed object reads and graph authorization.' }, expected: 201,
});
const undertakingId = work.data.id;

const interest = await participant.request(`/api/undertakings/${undertakingId}/interests`, {
  method: 'POST', body: { message: 'I can deliver this bounded scope.' }, expected: 201,
});
const offer = await commissioner.request(`/api/organizations/${organizationId}/undertakings/${undertakingId}/offers`, {
  method: 'POST', body: { interestId: interest.data.id, proposal: 'Named participation for the agreed scope.' }, expected: 201,
});
await participant.request(`/api/undertaking-offers/${offer.data.id}/decision`, {
  method: 'POST', body: { decision: 'accepted' }, expected: 200,
});
const report = await participant.request(`/api/undertakings/${undertakingId}/reports`, {
  method: 'POST', body: { report: 'Delivered the bounded scope with a written account.' }, expected: 201,
});
await commissioner.request(`/api/organizations/${organizationId}/reports/${report.data.id}/reviews`, {
  method: 'POST', body: { decision: 'accepted', rationale: 'The report matches the agreed scope.' }, expected: 201,
});

// 1. Overview is typed, counted, and authorized.
const overview = await outsider.request('/api/studio', { expected: 200 });
assert.equal(overview.data.types.length, 8, 'the Studio publishes eight object types');
assert.ok(overview.data.types.every((type) => Array.isArray(type.properties) && type.properties.length > 0), 'every type declares at least one property');
assert.ok(overview.data.counts['interest'] >= 1, 'an open undertaking exposes its interest to a signed-in peer');
assert.equal(overview.data.counts['organization'], 0, 'an outsider has no organization in their Studio');
assert.ok(overview.data.serverTime, 'the overview is timestamped');

const commissionerOverview = await commissioner.request('/api/studio', { expected: 200 });
assert.equal(commissionerOverview.data.counts['organization'], 1, 'a member sees their own organization');
assert.ok(commissionerOverview.data.counts['report'] >= 1, 'the owning organization sees the delivered report');
assert.ok(commissionerOverview.data.counts['review'] >= 1, 'the owning organization sees the review');

// 2. Typed query with search, filter, and pagination.
const byType = await participant.request('/api/studio/query', {
  method: 'POST', body: { type: 'undertaking', search: suffix, limit: 10 }, expected: 200,
});
assert.ok(byType.data.objects.some((object) => object.id === undertakingId), 'search returns the undertaking by scope text');
const filtered = await participant.request('/api/studio/query', {
  method: 'POST', body: { type: 'undertaking', status: ['active'], limit: 10 }, expected: 200,
});
assert.ok(filtered.data.objects.every((object) => object.status === 'active'), 'status filter is applied server-side');
assert.ok(filtered.data.facets.some((facet) => facet.value === 'active'), 'facets count the filtered set');

const pageOne = await commissioner.request('/api/studio/query', {
  method: 'POST', body: { type: 'undertaking', limit: 1, offset: 0 }, expected: 200,
});
assert.ok(pageOne.data.total >= 1 && pageOne.data.objects.length === 1, 'a one-row page still reports the full total');

// 3. Invalid queries are refused, not silently coerced.
const unknownField = await commissioner.request('/api/studio/query', {
  method: 'POST', body: { type: 'undertaking', surprise: true }, expected: 400,
});
assert.equal(unknownField.error, 'invalid_query');
const badType = await commissioner.request('/api/studio/query', {
  method: 'POST', body: { type: 'secrets' }, expected: 400,
});
assert.equal(badType.error, 'invalid_query');
const hugePage = await commissioner.request('/api/studio/query', {
  method: 'POST', body: { type: 'undertaking', limit: 5000 }, expected: 400,
});
assert.equal(hugePage.error, 'invalid_query');

// 4. Graph reads are authorized and typed.
const undertakingGraph = await participant.request(`/api/studio/graph?type=undertaking&id=${undertakingId}&depth=2`, { expected: 200 });
const nodeTypes = new Set(undertakingGraph.data.nodes.map((node) => node.type));
for (const expectedType of ['undertaking', 'organization', 'person', 'interest', 'offer', 'report', 'review']) {
  assert.ok(nodeTypes.has(expectedType), `the undertaking neighborhood includes ${expectedType}`);
}
assert.ok(undertakingGraph.data.edges.some((edge) => edge.linkType === 'judges'), 'review is linked to its report');
assert.ok(undertakingGraph.data.nodes.length <= 80, 'graph expansion is bounded');
assert.equal(new Set(undertakingGraph.data.nodes.map((node) => node.type + node.id)).size, undertakingGraph.data.nodes.length, 'graph nodes are deduplicated');

const strangerOrgGraph = await outsider.request(`/api/studio/graph?type=organization&id=${organizationId}&depth=1`);
assert.equal(strangerOrgGraph.status, 404, 'an outsider cannot open another organization graph');
const personNode = undertakingGraph.data.nodes.find((node) => node.type === 'person');
const strangerPersonGraph = await outsider.request(`/api/studio/graph?type=person&id=${personNode.id}&depth=1`);
assert.equal(strangerPersonGraph.status, 404, 'an outsider cannot open a person they do not share an organization with');

const outsiderPeople = await outsider.request('/api/studio/query', { method: 'POST', body: { type: 'person', limit: 20 }, expected: 200 });
assert.equal(outsiderPeople.data.total, 1, 'the people directory shows only the viewer when no organization is shared');
const outsiderEvents = await outsider2.request('/api/studio/query', { method: 'POST', body: { type: 'event', search: suffix, limit: 20 }, expected: 200 });
assert.equal(outsiderEvents.data.objects.some((object) => object.properties['actorName'] === 'Achieng Studio' && object.properties['subjectType'] === 'organization'), false, 'an outsider does not see another organization audit trail');

// 5. A member of one organization cannot see another organization's non-open work.
const outsiderOrg = await outsider2.request('/api/organizations', {
  method: 'POST', body: { name: `Outsider organisation ${suffix}` }, expected: 201,
});
assert.ok(outsiderOrg.data.id, 'second outsider owns an organization');
const crossTenant = await outsider2.request('/api/studio/query', {
  method: 'POST', body: { type: 'undertaking', search: suffix, limit: 10 }, expected: 200,
});
assert.equal(crossTenant.data.objects.some((object) => object.id === undertakingId), false, 'an organization member cannot see another organization\'s active undertaking');
const crossTenantDetail = await outsider2.request(`/api/undertakings/${undertakingId}`);
assert.equal(crossTenantDetail.status, 403, 'the undertaking detail refuses a non-member once the scope is active');

// 6. The graph stays inside the published registry.
for (const node of undertakingGraph.data.nodes) {
  assert.ok(['organization', 'undertaking', 'person', 'interest', 'offer', 'report', 'review', 'event'].includes(node.type), `unexpected node type ${node.type}`);
}

console.log('PASS — studio object queries, typed validation, and authorized neighborhoods');
