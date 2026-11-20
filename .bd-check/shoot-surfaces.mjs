// Visual approval pass: screenshot Records + Intelligence (seeded) at 1440 and 390.
// Same seed loop as drive-surface.mjs so the pages hold real coordination data.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));

await page.goto('http://localhost:5199/index-vue.html', { waitUntil: 'load' });
await page.waitForSelector('.app-shell', { timeout: 30000 });

function go(route) {
  return page.evaluate((r) => {
    history.replaceState(null, '', r);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, route);
}

// Seed the loop through the real Workbench controls (same as drive-surface.mjs).
await go('/workspace/coordination');
await page.waitForSelector('.coord', { timeout: 20000 });
await page.fill('input[placeholder="Kibera Welding Co-op"]', 'Kibera Welding Co-op');
await page.fill('input[placeholder="Welding"]', 'Welding');
await page.click('button:has-text("Register provider")');
await page.fill('input[placeholder="Fence repair around the school"]', 'Fence repair around the school');
await page.locator('.chip-toggle button', { hasText: /^Skill$/ }).click();
await page.click('button:has-text("Post need")');
await page.locator('.need-match-row button', { hasText: 'Assign' }).first().click();
await page.fill('input[placeholder="Fence repair around the school"]', 'Legal filing support');
await page.locator('.chip-toggle button', { hasText: /^Availability$/ }).click();
await page.click('button:has-text("Post need")');
await page.fill('input[placeholder="Signed completion certificate"]', 'Signed completion certificate');
await page.click('button:has-text("Add evidence")');
await page.waitForTimeout(250);

for (const s of [
  { label: 'records', root: '.records-page', route: '/workspace/records' },
  { label: 'intelligence', root: '.intelligence-page', route: '/workspace/intelligence' },
]) {
  await go(s.route);
  await page.waitForSelector(s.root, { timeout: 20000 });
  if (s.label === 'intelligence') {
    await page.waitForSelector('.intelligence-open-item, .intelligence-empty', { timeout: 10000 });
  }
  for (const w of [1440, 390]) {
    await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 });
    await page.waitForTimeout(150);
    const file = `shot-${s.label}-${w}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log('wrote', file);
  }
}

console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
