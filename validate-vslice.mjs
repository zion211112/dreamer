import { chromium } from 'playwright';

const BASE = 'http://localhost:4201';
const errors = [];
const consoleMsgs = [];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

context.on('page', (page) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleMsgs.push({ page: page.url(), text: msg.text() });
  });
  page.on('pageerror', (err) => errors.push({ page: page.url(), text: err.message }));
});

// Test key routes including the pilot vertical slice
const pages = [
  { path: '/', name: 'landing' },
  { path: '/workspace', name: 'workspace-overview' },
  { path: '/workspace/workbench', name: 'workbench' },
  { path: '/workspace/workbench/undertaking-kibera-workshop-bench', name: 'pilot-kibera' },
  { path: '/workspace/records', name: 'records' },
  { path: '/workspace/network', name: 'network' },
];

for (const p of pages) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: `./shots/vslice-${p.name}.png`, fullPage: true });
    const title = await page.title();
    console.log(`OK   ${p.path.padEnd(40)} title="${title}"`);
  } catch (e) {
    console.log(`FAIL ${p.path.padEnd(40)} ${e.message}`);
  }
  await page.close();
}

// Specifically test the pilot page interactions
const pilotPage = await context.newPage();
pilotPage.on('console', (msg) => {
  if (msg.type() === 'error') consoleMsgs.push({ page: pilotPage.url(), text: msg.text() });
});
pilotPage.on('pageerror', (err) => errors.push({ page: pilotPage.url(), text: err.message }));

try {
  await pilotPage.goto(`${BASE}/workspace/workbench/undertaking-kibera-workshop-bench`, { waitUntil: 'networkidle', timeout: 30000 });
  await pilotPage.screenshot({ path: './shots/vslice-pilot-detail.png', fullPage: true });

  // Check that the relationship graph container exists
  const graphCount = await pilotPage.locator('#rg-cy').count();
  console.log(`Graph container present: ${graphCount > 0}`);

  // Check evidence standing component
  const standingCount = await pilotPage.locator('.evidence-standing').count();
  console.log(`Evidence standing component present: ${standingCount > 0}`);

  // Check inspector
  const inspectorCount = await pilotPage.locator('.inspector').count();
  console.log(`Inspector component present: ${inspectorCount > 0}`);

  // Check command palette (hidden by default)
  const paletteCount = await pilotPage.locator('.cp-panel').count();
  console.log(`Command palette (closed): ${paletteCount === 0}`);

  // Test opening command palette with Ctrl+K
  await pilotPage.keyboard.down('Control');
  await pilotPage.keyboard.press('k');
  await pilotPage.keyboard.up('Control');
  await pilotPage.waitForTimeout(500);
  const paletteOpen = await pilotPage.locator('.cp-panel').count();
  console.log(`Command palette after Ctrl+K: ${paletteOpen > 0}`);
  await pilotPage.screenshot({ path: './shots/vslice-palette-open.png', fullPage: true });

  // Close palette with Escape
  await pilotPage.keyboard.press('Escape');
  await pilotPage.waitForTimeout(300);
  const paletteClosed = await pilotPage.locator('.cp-panel').count();
  console.log(`Command palette after Escape: ${paletteClosed === 0}`);
} catch (e) {
  console.log(`PILOT INTERACTION FAIL: ${e.message}`);
}

await pilotPage.close();
await browser.close();

console.log('\n--- Errors:', errors.length, '---');
for (const e of errors.slice(0, 10)) console.log(`  [${e.page}] ${e.text}`);
console.log('--- Console errors:', consoleMsgs.length, '---');
for (const e of consoleMsgs.slice(0, 10)) console.log(`  [${e.page}] ${e.text}`);

process.exit(errors.length > 0 ? 1 : 0);
