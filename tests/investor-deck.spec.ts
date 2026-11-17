import { expect, test } from '@playwright/test';

const deckPath = '/investor-memo/s/aptlabs-investor-deck';

function deckHeading(page: import('@playwright/test').Page, name: string) {
  return page.locator('main h1.pitch-title').first();
}

test('loads the deck directly and after refresh', async ({ page }) => {
  await page.goto(deckPath);
  await expect(deckHeading(page, 'Make productive capacity visible. Make work cumulative.')).toBeVisible({ timeout: 15000 });
  await page.reload();
  await expect(deckHeading(page, 'Make productive capacity visible. Make work cumulative.')).toBeVisible({ timeout: 15000 });
});

test('opens the deck from the landing-page investor link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore the investor deck' }).click();
  await expect(page).toHaveURL(/\/investor-memo\/s\/aptlabs-investor-deck$/);
  await page.waitForSelector('main h1.pitch-title', { timeout: 15000 });
  await expect(deckHeading(page, 'Make productive capacity visible. Make work cumulative.')).toBeVisible();
});

test('navigates through case stories by keyboard', async ({ page }) => {
  await page.goto(deckPath);
  await expect(deckHeading(page, 'Make productive capacity visible. Make work cumulative.')).toBeVisible({ timeout: 15000 });
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main h1.pitch-title').first()).toContainText('Capacity is distributed. Coordination is fragmented.');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main .pitch-topline').first()).toContainText('THE PRODUCT');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main .pitch-topline').first()).toContainText('CASE CONTEXT / MTO WORKS');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main .pitch-topline').first()).toContainText('CASE CONTEXT / KEMETOS');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('main .pitch-topline').first()).toContainText('CASE CONTEXT / MTO WORKS');
});

test('shows bounded claims and excludes unverified memo terms', async ({ page }) => {
  await page.goto(deckPath);
  const content: string[] = [];
  for (let index = 0; index < 9; index += 1) {
    if (index === 0) await expect(deckHeading(page, 'Make productive capacity visible. Make work cumulative.')).toBeVisible({ timeout: 15000 });
    content.push(await page.locator('body').innerText());
    if (index < 8) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);
    }
  }
  const deckText = content.join('\n');
  expect(deckText).toContain('not a completed or validated infrastructure project');
  expect(deckText).toContain('not evidence of improved cognition or learning');
  expect(deckText).toContain('Illustrative procurement-routing fee model');
  expect(deckText).not.toMatch(/CONFIDENTIAL|\$250,000|\$250K|\$100,000|\$4,000|\$4K|10%/i);
  await expect(page.getByRole('main').getByRole('link', { name: /Start a conversation/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/254704260906\?/);
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
  await expect(page.locator('main h1.pitch-title').first()).toContainText('Capacity is distributed. Coordination is fragmented.');
});

test('keeps the root and a workspace route available', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Explore the investor deck' })).toBeVisible();
  await page.goto('/workspace/commons');
  await expect(page.locator('body')).toContainText('Commons');
});
