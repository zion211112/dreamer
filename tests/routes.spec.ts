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
  '/workspace/workbench/value',
  '/workspace/records',
  '/workspace/records/canon',
  '/workspace/records/annals',
  '/workspace/records/roll',
  '/workspace/reference',
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
    await expect(page.locator('.section-tab--active')).toHaveText(new RegExp(view, 'i'));
  }
});

test('capabilities route opens the capability directory', async ({ page }) => {
  await page.goto('/workspace/network/capabilities');
  await expect(page.getByRole('heading', { name: 'Capabilities' })).toBeVisible();
});

test('workspace rail contains only the five primary modules', async ({ page }) => {
  await page.goto('/workspace');
  await expect(page.getByRole('navigation', { name: 'Modules' }).locator('.nav-item')).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'Reference' })).toBeVisible();
});

test('module navigation is accessible at 390px and 621px', async ({ page }) => {
  for (const width of [390, 621]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/workspace');
    const modules = page.getByRole('navigation', { name: 'Modules' });
    const toggle = modules.getByRole('button', { name: /Menu: Home/ });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const links = modules.locator('.nav-item');
    await expect(links).toHaveCount(5);
    for (const link of await links.all()) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const networkLink = modules.getByRole('link', { name: 'Network' });
    await networkLink.click();
    await expect(page).toHaveURL(/\/workspace\/network\/people$/);
    await expect(page.locator('#shell-main')).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('workspace main scroll area ends above the persistent status footer', async ({ page }) => {
  for (const width of [1440, 1024, 820, 768, 621, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/workspace');

    const main = await page.locator('.shell-main').boundingBox();
    const statusbar = await page.locator('app-statusbar').boundingBox();
    expect(main).not.toBeNull();
    expect(statusbar).not.toBeNull();
    expect(main!.y + main!.height).toBeLessThanOrEqual(statusbar!.y + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
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

test('Reference keeps the object explorer and schema inside one destination', async ({ page }) => {
  await page.goto('/workspace/reference');
  await expect(page.getByRole('heading', { name: 'Reference', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Explore the record', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The productive-reality cycle' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Forms of authority' })).toBeVisible();
});

test('legacy ontology route redirects to Reference without losing the explorer', async ({ page }) => {
  await page.goto('/workspace/ontology');
  await expect(page).toHaveURL(/\/workspace\/reference$/);
  await expect(page.getByRole('heading', { name: 'Explore the record', level: 2 })).toBeVisible();
});

test('unknown paths show a not-found page', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
