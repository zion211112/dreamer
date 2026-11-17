import { expect, test } from '@playwright/test';

const deckPath = '/investor-memo/s/aptlabs-investor-deck';

function deckHeading(page: import('@playwright/test').Page) {
  return page.locator('main h1.pitch-title').first();
}

function slideLabel(page: import('@playwright/test').Page) {
  return page.locator('main .pitch-topline').first();
}

test('loads the deck directly and after refresh', async ({ page }) => {
  await page.goto(deckPath);
  await expect(deckHeading(page)).toContainText('From Kongo to Mt. Zion.', { timeout: 15000 });
  await page.reload();
  await expect(deckHeading(page)).toContainText('From Kongo to Mt. Zion.', { timeout: 15000 });
});

test('opens the deck from the landing-page investor link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore the investor deck' }).click();
  await expect(page).toHaveURL(/\/investor-memo\/s\/aptlabs-investor-deck$/);
  await expect(deckHeading(page)).toContainText('From Kongo to Mt. Zion.', { timeout: 15000 });
});

test('navigates through the five slides by keyboard', async ({ page }) => {
  await page.goto(deckPath);
  await expect(deckHeading(page)).toContainText('From Kongo to Mt. Zion.', { timeout: 15000 });
  await page.keyboard.press('ArrowRight');
  await expect(deckHeading(page)).toContainText('One river. One workforce. One proof of direction.');
  await page.keyboard.press('ArrowRight');
  await expect(deckHeading(page)).toContainText('People own the systems that shape their lives.');
  await page.keyboard.press('ArrowRight');
  await expect(deckHeading(page)).toContainText('Capacity is distributed. Coordination is fragmented.');
  await page.keyboard.press('ArrowRight');
  await expect(deckHeading(page)).toContainText('Start where the work is.');
  await page.keyboard.press('ArrowLeft');
  await expect(deckHeading(page)).toContainText('Capacity is distributed. Coordination is fragmented.');
});

test('keeps the two image slides and bounded claims', async ({ page }) => {
  await page.goto(deckPath);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  await expect(page.locator('img').filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  await expect(page.locator('img').filter({ visible: true }).first()).toBeVisible({ timeout: 15000 });
  const content: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    content.push(await page.locator('body').innerText());
    if (index < 4) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);
    }
  }
  const deckText = content.join('\n');
  expect(deckText).toContain('not a completed or validated facility');
  expect(deckText).toContain('No inflated market numbers');
  expect(deckText).not.toMatch(/CONFIDENTIAL|\$250,000|\$250K|\$100,000|\$4,000|\$4K/);
});

test('keeps the deck navigable at mobile size with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(deckPath);
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main h1.pitch-title').first()).toContainText('One river. One workforce. One proof of direction.');
});

test('keeps the root and a workspace route available', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Explore the investor deck' })).toBeVisible();
  await page.goto('/workspace/commons');
  await expect(page.locator('body')).toContainText('Commons');
});
