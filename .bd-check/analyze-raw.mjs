// Capture the RAW scoped (.coord) snapshot at 3 widths, then report per-field byte
// contribution so we can pick a minimal trim that still drives a spacing review.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const captureScript = readFileSync(new URL('./capture.txt', import.meta.url), 'utf8');
const scopedScript = captureScript.replace('})(); })()', "})('.coord'); })()");

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto('http://localhost:5199/index-vue.html', { waitUntil: 'load' });
await page.waitForSelector('.app-shell', { timeout: 30000 });
await page.evaluate(() => {
  history.replaceState(null, '', '/workspace/coordination');
  window.dispatchEvent(new PopStateEvent('popstate'));
});
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

const raw = await page.evaluate(scopedScript);
writeFileSync(new URL('./raw.json', import.meta.url), JSON.stringify(raw));
await browser.close();

// ---- per-field byte analysis on one state (1440) ----
const els = raw.elements;
const cost = (obj) => JSON.stringify(obj).length;
const report = (label, sel) => {
  let total = 0, present = 0;
  for (const el of els) {
    const v = sel(el);
    if (v !== undefined) { present++; total += cost(v) + 1; }
  }
  console.log(`${label.padEnd(16)} present ${String(present).padStart(3)}/${els.length}  bytes ${total}`);
};
console.log('state 1440, elements =', els.length, ' total raw bytes =', cost(raw));
report('id', (e) => e.id);
report('tag', (e) => e.tag);
report('rect', (e) => e.rect);
report('parentId', (e) => e.parentId);
report('label', (e) => e.label);
report('interactive', (e) => e.interactive);
report('inputType', (e) => e.inputType);
report('role', (e) => e.role);
report('lineCount', (e) => e.lineCount);
report('textMetrics', (e) => e.textMetrics);
report('style', (e) => e.style);
report('clientW/H', (e) => (e.clientWidth != null ? { clientWidth: e.clientWidth, clientHeight: e.clientHeight } : undefined));
report('scrollW/H', (e) => (e.scrollWidth != null ? { scrollWidth: e.scrollWidth, scrollHeight: e.scrollHeight } : undefined));
report('inertCrop', (e) => e.inertCrop);
// style sub-keys
const subKeys = {};
for (const el of els) if (el.style) for (const k of Object.keys(el.style)) subKeys[k] = (subKeys[k] || 0) + 1;
console.log('style sub-key presence:', subKeys);
