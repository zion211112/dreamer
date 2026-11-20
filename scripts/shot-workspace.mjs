import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5199/workspace';
const out = process.argv[3] ?? 'shot-workspace.png';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1600 }, deviceScaleFactor: 1 });

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('.ov-h1', { timeout: 30000 });
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: true });

const facts = await page.evaluate(() => ({
  title: document.querySelector('h1')?.textContent?.trim() ?? null,
  eyebrow: document.querySelector('.ov-eyebrow')?.textContent?.trim() ?? null,
  families: document.querySelectorAll('.ov-card').length,
  distinctions: document.querySelectorAll('.ov-distinction').length,
  standing: document.querySelectorAll('.ov-standing-item').length,
  metrics: [...document.querySelectorAll('.ov-metric')].map((m) => m.textContent.replace(/\s+/g, ' ').trim()),
  bodyBg: getComputedStyle(document.body).backgroundColor,
}));

console.log(JSON.stringify({ facts, errors }, null, 2));
await browser.close();
