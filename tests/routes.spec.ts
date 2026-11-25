import { expect, test } from '@playwright/test';

const implementedRoutes = [
  '/landing',
  '/sign-in',
  '/sign-up',
  '/workspace',
  '/workspace/commons',
  '/workspace/network',
  '/workspace/network/people',
  '/workspace/network/institutions',
  '/workspace/network/capabilities',
  '/workspace/workbench',
  '/workspace/workbench/undertaking-kibera-workshop-bench',
  '/workspace/value',
  '/workspace/records',
  '/workspace/records/canon',
  '/workspace/records/annals',
  '/workspace/records/roll',
  '/workspace/intelligence',
  '/workspace/ontology',
  '/workspace/sovereignty',
];

for (const route of implementedRoutes) {
  test(`renders ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20_000 });
  });
}

test('root redirects to landing', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/landing$/);
});

test('records subroutes select the matching view', async ({ page }) => {
  for (const view of ['canon', 'annals', 'roll']) {
    await page.goto(`/workspace/records/${view}`);
    await expect(page.locator('.records-filter button.active')).toHaveText(new RegExp(view, 'i'));
  }
});

test('capabilities route opens the capability directory', async ({ page }) => {
  await page.goto('/workspace/network/capabilities');
  await expect(page.getByRole('heading', { name: 'Capabilities' })).toBeVisible();
});

test('workspace rail contains only the six primary contexts', async ({ page }) => {
  await page.goto('/workspace');
  await expect(page.getByRole('navigation', { name: 'Modules' }).locator('.nav-item')).toHaveCount(6);
});

test('module navigation remains usable on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/workspace');
  const modules = page.getByRole('navigation', { name: 'Modules' });
  const networkLink = modules.getByRole('link', { name: 'Network' });

  await expect(modules).toBeVisible({ timeout: 20_000 });
  const navBox = await modules.boundingBox();
  expect(navBox).not.toBeNull();

  const links = await modules.locator('.nav-item').all();
  for (const link of links) {
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  for (const link of links.slice(0, 4)) {
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(navBox!.x);
    expect(box!.x + box!.width).toBeLessThanOrEqual(navBox!.x + navBox!.width + 1);
  }

  for (const action of await page.locator('.topbar-action').all()) {
    const box = await action.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  await networkLink.click();
  await expect(page).toHaveURL(/\/workspace\/network$/);
  await expect(networkLink).toHaveAttribute('aria-current', 'page');
});

test('workspace shell keeps fixed regions outside the main scroll area', async ({ page }) => {
  for (const width of [1440, 1024, 820, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/workspace');

    const main = await page.locator('.shell-main').boundingBox();
    const dock = await page.locator('.shell-dock').boundingBox();
    const statusbar = await page.locator('app-statusbar').boundingBox();
    expect(main).not.toBeNull();
    expect(statusbar).not.toBeNull();
    if (width <= 760) {
      expect(dock).toBeNull();
      expect(main!.y + main!.height).toBeLessThanOrEqual(statusbar!.y + 1);
    } else {
      expect(dock).not.toBeNull();
      expect(main!.y + main!.height).toBeLessThanOrEqual(dock!.y + 1);
      expect(dock!.y + dock!.height).toBeLessThanOrEqual(statusbar!.y + 1);
    }
  }
});

test('workspace table rows stay inside the main scroll area', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/workspace');

    const main = page.locator('.shell-main');
    const lastRow = page.locator('.ov-tr').last();
    await lastRow.scrollIntoViewIfNeeded();

    const mainBox = await main.boundingBox();
    const rowBox = await lastRow.boundingBox();
    expect(mainBox).not.toBeNull();
    expect(rowBox).not.toBeNull();
    expect(rowBox!.y).toBeGreaterThanOrEqual(mainBox!.y);
    expect(rowBox!.y + rowBox!.height).toBeLessThanOrEqual(mainBox!.y + mainBox!.height + 1);
  }
});

test('workspace reference has a visible search label and ordered headings', async ({ page }) => {
  await page.goto('/workspace');

  const referenceHeading = page.getByRole('heading', { name: 'The reference', level: 2 });
  await expect(referenceHeading).toBeVisible();
  await referenceHeading.click();
  await expect(page.getByLabel('Filter the reference')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Operational core', level: 3 })).toBeVisible();
});

test('unknown paths show a not-found page', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
