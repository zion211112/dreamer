// Cheap confirmation: at 1440 desktop, are the Post-a-need chip toggles now >=44px tall?
import { chromium } from 'playwright';

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

const rects = await page.$$eval('.chip-toggle button', (els) =>
  els.map((e) => {
    const r = e.getBoundingClientRect();
    return { label: e.textContent.trim(), h: Math.round(r.height * 10) / 10, w: Math.round(r.width * 10) / 10 };
  }),
);
console.log('chip toggles @1440:');
for (const r of rects) console.log(`  ${r.label.padEnd(20)} ${r.w}x${r.h}`);
const ok = rects.length && rects.every((r) => r.h >= 44);
console.log('all chips >=44px:', ok);
await browser.close();
process.exit(ok ? 0 : 1);
