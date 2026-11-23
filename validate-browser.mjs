import { chromium } from 'playwright';

const BASE = 'http://localhost:4201';
const pages = [
  { path: '/', name: 'landing' },
  { path: '/workspace', name: 'workspace-overview' },
  { path: '/workspace/commons', name: 'commons' },
  { path: '/workspace/network', name: 'network' },
  { path: '/workspace/network/people', name: 'people' },
  { path: '/workspace/network/institutions', name: 'institutions' },
  { path: '/workspace/workbench', name: 'workbench' },
  { path: '/workspace/records', name: 'records' },
  { path: '/workspace/intelligence', name: 'intelligence' },
  { path: '/workspace/ontology', name: 'ontology' },
  { path: '/workspace/sovereignty', name: 'sovereignty' },
  { path: '/workspace/value', name: 'value' },
  { path: '/sign-in', name: 'sign-in' },
];

const errors = [];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// Capture console errors
context.on('page', (page) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push({ page: page.url(), text: msg.text() });
  });
  page.on('pageerror', (err) => errors.push({ page: page.url(), text: err.message }));
});

for (const p of pages) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: `./shots/validate-${p.name}.png`, fullPage: true });
    const title = await page.title();
    console.log(`OK   ${p.path.padEnd(30)} title="${title}"`);
  } catch (e) {
    console.log(`FAIL ${p.path.padEnd(30)} ${e.message}`);
  }
  await page.close();
}

await browser.close();

console.log('\n--- Console errors captured:', errors.length, '---');
for (const e of errors.slice(0, 20)) {
  console.log(`  [${e.page}] ${e.text}`);
}
if (errors.length === 0) console.log('  (none)');

process.exit(errors.length > 0 ? 1 : 0);
