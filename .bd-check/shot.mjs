// Fresh load, seed, scroll the workspace main to the top, full-page screenshot.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));

await page.goto('http://localhost:5199/index-vue.html', { waitUntil: 'load' });
await page.waitForSelector('.app-shell', { timeout: 30000 });
await page.evaluate(() => {
  history.replaceState(null, '', '/workspace/coordination');
  window.dispatchEvent(new PopStateEvent('popstate'));
});
await page.waitForSelector('.coord', { timeout: 20000 });

// Seed the same loop
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

await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: '.bd-check/coordination-1440-top.png', fullPage: true });
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
