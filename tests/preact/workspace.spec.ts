import { expect, test } from '@playwright/test';

const undertaking = {
  id: 'work-1', organizationId: 'org-1', organizationName: 'Wanjiku Studio', organizationStanding: 'unverified',
  title: 'Repair the community press', scope: 'Restore the press and document the repair.', status: 'open', createdAt: '2026-11-26T10:00:00.000Z',
  interestCount: 1, reportCount: 0,
};
const organization = { id: 'org-1', name: 'Wanjiku Studio', standing: 'unverified', role: 'manager' };
const network = {
  organizations: [organization],
  members: [{ id: 'person-2', name: 'Amina Builder', organizationId: 'org-1', organizationName: organization.name, role: 'member' }],
};
const detail = {
  ...undertaking, createdByPersonId: 'person-1', createdByName: 'Wanjiku',
  position: { role: null, isMember: false, isParticipant: false, hasInterest: false, pendingOffer: null, canReview: false },
  actions: { canPostWork: false, canTriageInterests: false, canIssueOffer: false, canClose: false, canRegisterInterest: true, canAcceptPendingOffer: false, canReport: false, canReflect: false },
  myReflection: null, reflections: [], interests: [], offers: [], participants: [], reports: [], events: [],
};
const workbench = {
  person: { id: 'person-1', name: 'Wanjiku' }, organizations: [organization],
  counts: { needsYou: 1, offersToYou: 0, myWork: 0, myInterests: 0 },
  needsYou: [{ kind: 'interest', interestId: 'interest-1', undertakingId: 'work-1', title: undertaking.title, organizationName: organization.name, personName: 'Amina Builder', message: 'I can help with the press restoration.', createdAt: '2026-11-27T10:00:00.000Z' }],
  offersToYou: [], myWork: [], myInterests: [], organizationWork: [],
};
const studioOverview = {
  person: { id: 'person-1' }, counts: {}, organizations: [organization], serverTime: '2026-11-26T10:00:00.000Z',
  types: ['organization', 'undertaking', 'person', 'interest', 'offer', 'report', 'review', 'event'].map((id) => ({
    id, label: id, plural: `${id}s`, description: '', hrefTemplate: null, properties: [], filterable: [],
  })),
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/get-session', (route) => route.fulfill({ json: {
    session: { id: 'session-1', userId: 'person-1' }, user: { id: 'person-1', name: 'Wanjiku', email: 'person@example.test' },
  } }));
  await page.route('**/api/me/network', (route) => route.fulfill({ json: { data: network } }));
  await page.route('**/api/me/organizations', (route) => route.fulfill({ json: { data: [organization] } }));
  await page.route('**/api/undertakings**', (route) => route.fulfill({ json: { data: [undertaking] } }));
  await page.route('**/api/records', (route) => route.fulfill({ json: { data: { undertakings: [undertaking], events: [] } } }));
  await page.route('**/api/workbench', (route) => route.fulfill({ json: { data: workbench } }));
  await page.route('**/api/undertakings/work-1', (route) => route.fulfill({ json: { data: detail } }));
  await page.route('**/api/studio', (route) => route.fulfill({ json: { data: studioOverview } }));
  await page.route('**/api/studio/query', (route) => route.fulfill({ json: { data: { type: 'undertaking', total: 1, facets: [], objects: [] } } }));
});

test('unauthenticated workspace redirects to sign-in and preserves its destination', async ({ page }) => {
  await page.unroute('**/api/auth/get-session');
  await page.route('**/api/auth/get-session', (route) => route.fulfill({ json: null }));
  await page.goto('/workspace');
  await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fworkspace$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

test('workspace destinations render authorized live-data shapes', async ({ page }) => {
  const checks: Array<[string, RegExp]> = [
    ['/workspace', /Your desk/],
    ['/workspace/commons', /Open work, shared scope/],
    ['/workspace/workbench', /Work that has someone accountable on both ends/],
    ['/workspace/network/people', /People and institutions, in context/],
    ['/workspace/records/canon', /What was recorded, when, and by whom/],
    ['/workspace/records/annals', /What was recorded, when, and by whom/],
    ['/workspace/records/roll', /What was recorded, when, and by whom/],
    ['/workspace/reference', /Explore the record/],
  ];
  for (const [route, heading] of checks) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(heading);
    if (route === '/workspace/commons') {
      await expect(page.getByRole('button', { name: /Repair the community press/ })).toBeVisible();
    }
  }
});

test('mobile shell has no horizontal overflow and keeps all five destinations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/workspace/network/people');
  await expect(page.getByRole('navigation', { name: 'Workspace destinations' }).getByRole('link')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('link', { name: 'Workbench' }).click();
  await expect(page).toHaveURL(/\/workspace\/workbench$/);
  await expect(page.getByRole('heading', { name: /Work that has someone accountable/ })).toBeVisible();
});

test('graph mode lists and selects authorized records accessibly', async ({ page }) => {
  await page.goto('/workspace/network/people');
  await page.getByRole('button', { name: 'Graph' }).click();
  await expect(page.getByRole('heading', { name: 'Visible nodes' })).toBeVisible();
  const workNode = page.getByRole('button', { name: /Repair the community press Undertaking/ });
  await workNode.click();
  await expect(page.getByRole('heading', { name: 'Repair the community press' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open in Workbench →' })).toBeVisible();
});

test('home desk filters the authorized register and inspects selected context', async ({ page }) => {
  await page.goto('/workspace');
  await expect(page.getByRole('heading', { name: 'Needs your attention' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Interest to review Repair the community press/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Repair the community press' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Selected undertaking' }).getByText('Restore the press and document the repair.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open full record' })).toHaveAttribute('href', '/workspace/workbench/work-1');
  await page.screenshot({ path: 'C:/Users/zION/AppData/Local/Temp/aptlabs-home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'C:/Users/zION/AppData/Local/Temp/aptlabs-home-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.getByLabel('Find a record').fill('no matching record');
  await expect(page.getByRole('heading', { name: 'No work matches these filters' })).toBeVisible();
  await page.getByLabel('Find a record').clear();
  await page.getByLabel('Status').selectOption('closed');
  await expect(page.getByRole('heading', { name: 'No work matches these filters' })).toBeVisible();
});

test('Roll explains empty authorized lineage stages', async ({ page }) => {
  await page.route('**/api/undertakings/work-1', (route) => route.fulfill({ json: { data: detail } }));
  await page.goto('/workspace/records/roll');
  await page.getByText('Repair the community press', { exact: true }).first().click();
  await expect(page.getByText('No interest recorded.')).toBeVisible();
  await expect(page.getByText('No reports filed.')).toBeVisible();
});

test('closed participants can create an attributed, revisable personal reflection', async ({ page }) => {
  const closedWork = {
    ...detail,
    status: 'closed',
    position: { ...detail.position, isParticipant: true },
    actions: { ...detail.actions, canReport: false, canReflect: true },
    myReflection: null,
    reflections: [],
  };
  await page.route('**/api/undertakings/work-1', (route) => route.fulfill({ json: { data: closedWork } }));
  await page.goto('/workspace/workbench/work-1');
  await expect(page.getByRole('heading', { name: 'Personal reflection' })).toBeVisible();
  await expect(page.getByLabel('What did you learn?')).toBeVisible();
  await expect(page.getByText('Do not include amounts, account details, payment instructions, or obligations.')).toBeVisible();
  await page.getByLabel('What did you learn?').fill('Tested the press alignment before printing.');
  await page.getByLabel('What value did the work create for the local community?').fill('The community can print notices locally.');
  await page.getByLabel('Context for this assessment').fill('No separate financial record is indicated.');
  let submitted: unknown;
  await page.route('**/api/undertakings/work-1/reflection', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { data: { version: 1 } } });
  });
  await page.getByRole('button', { name: 'Record reflection' }).click();
  await expect.poll(() => submitted).toMatchObject({
    learning: 'Tested the press alignment before printing.',
    localValue: 'The community can print notices locally.',
    financialRecordAssessment: 'uncertain',
    expectedVersion: 0,
  });
  await expect(page.getByRole('status')).toContainText('Your reflection was recorded');
});

test('sign-in validation is client-side and shows a clear error', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Email is required.')).toBeVisible();
  await expect(page.getByText('Password is required.')).toBeVisible();
});
