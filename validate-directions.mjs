import { chromium } from 'playwright';

const errors = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

context.on('page', (page) => {
  page.on('pageerror', (err) => errors.push({ page: page.url(), text: err.message }));
});

const directions = [
  { file: 'direction-1-ledger.html', name: 'direction-1-ledger', label: 'Direction 1: The Ledger' },
  { file: 'direction-2-floor.html', name: 'direction-2-floor', label: 'Direction 2: The Floor' },
  { file: 'direction-3-desk.html', name: 'direction-3-desk', label: 'Direction 3: The Desk' },
];

for (const d of directions) {
  const page = await context.newPage();
  try {
    await page.goto(`file:///C:/Users/zION/Documents/dreamer/${d.file}`, { waitUntil: 'load', timeout: 30000 });
    await page.screenshot({ path: `./shots/${d.name}.png`, fullPage: true });
    console.log(`OK   ${d.label.padEnd(30)} → shots/${d.name}.png`);
  } catch (e) {
    console.log(`FAIL ${d.label.padEnd(30)} ${e.message}`);
  }
  await page.close();
}

await browser.close();
console.log('\n--- Errors:', errors.length, '---');
for (const e of errors.slice(0, 5)) console.log(`  [${e.page}] ${e.text}`);
process.exit(errors.length > 0 ? 1 : 0);
