// Capture the six rewired per-module surfaces (Network, Commons, Records,
// People, Institutions, Intelligence) after seeding the coordination loop
// through the real Workbench controls. Each state is scoped to the surface's
// own root so inspect-spacing measures the surface, not the AppShell chrome.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const captureScript = readFileSync(new URL('./capture.txt', import.meta.url), 'utf8');
if (!captureScript.includes('})(); })()')) throw new Error('tail not found');

const KEEP_STYLE = new Set([
  'display', 'position', 'flexDirection', 'flexWrap', 'alignItems', 'justifyContent',
  'rowGap', 'columnGap', 'alignSelf', 'textAlign', 'padding', 'margin', 'borderWidth',
  'borderRadius', 'zIndex', 'opacity', 'overflowX', 'overflowY', 'autoMargins',
]);

function makeScoper(selector) {
  return captureScript.replace('})(); })()', `})('${selector}'); })()`);
}

function trim(s) {
  const elements = s.elements.map((el) => {
    const out = { id: el.id, tag: el.tag, rect: el.rect };
    if (el.parentId) out.parentId = el.parentId;
    if (el.label) out.label = el.label;
    if (el.interactive) out.interactive = true;
    if (el.inputType) out.inputType = el.inputType;
    if (el.role) out.role = el.role;
    if (el.lineCount) out.lineCount = el.lineCount;
    if (el.clientWidth != null) out.clientWidth = el.clientWidth;
    if (el.clientHeight != null) out.clientHeight = el.clientHeight;
    if (el.scrollWidth != null) out.scrollWidth = el.scrollWidth;
    if (el.scrollHeight != null) out.scrollHeight = el.scrollHeight;
    if (el.style) {
      const st = el.style;
      const kept = {};
      for (const k of Object.keys(st)) if (KEEP_STYLE.has(k)) kept[k] = st[k];
      if (Object.keys(kept).length) out.style = kept;
    }
    return out;
  });
  return { name: s.name, title: s.title, scope: s.scope, viewport: s.viewport, elements };
}

const SURFACES = [
  { label: 'network', root: '.network-page', selector: '.network-page', route: '/workspace/network' },
  { label: 'commons', root: '.commons-page', selector: '.commons-page', route: '/workspace/commons' },
  { label: 'records', root: '.records-page', selector: '.records-page', route: '/workspace/records' },
  { label: 'people', root: '.people-page', selector: '.people-page', route: '/workspace/network/people' },
  { label: 'institutions', root: '.institutions-page', selector: '.institutions-page', route: '/workspace/network/institutions' },
  { label: 'intelligence', root: '.intelligence-page', selector: '.intelligence-page', route: '/workspace/intelligence' },
];

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

// Seed the loop through the real Workbench controls (same as drive-scoped.mjs).
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

const states = [];
for (const s of SURFACES) {
  await go(s.route);
  await page.waitForSelector(s.root, { timeout: 20000 });
  if (s.label === 'intelligence') {
    // The panels compute asynchronously; wait until real content has landed.
    await page.waitForSelector('.intelligence-open-item, .intelligence-empty', { timeout: 10000 });
  }
  const scoper = makeScoper(s.selector);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(150);
  states.push({ name: `${s.label}-1440`, ...trim(await page.evaluate(scoper)), viewport: { width: 1440, height: 900, devicePixelRatio: 1 } });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  states.push({ name: `${s.label}-390`, ...trim(await page.evaluate(scoper)), viewport: { width: 390, height: 844, devicePixelRatio: 1 } });

  // Phone check: horizontal overflow + controls under 44px, scoped to the surface.
  const phone = await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const width = document.documentElement.clientWidth;
    const controls =
      'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], [tabindex]:not([tabindex=\'-1\'])';
    const small = [...root.querySelectorAll(controls)]
      .filter((node) => !node.closest("[aria-hidden='true'], [inert]") && node.checkVisibility({ visibilityProperty: true }))
      .map((node) => [node, node.getBoundingClientRect()])
      .filter(([, box]) => box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44))
      .map(([node, box]) =>
        `${node.tagName.toLowerCase()} "${(node.getAttribute('aria-label') || node.textContent || '').trim().slice(0, 40)}" ${Math.round(box.width)}x${Math.round(box.height)}`,
      );
    return { overflow: document.documentElement.scrollWidth - width, small: [...new Set(small)] };
  }, s.selector);
  console.log(`${s.label} phone:`, JSON.stringify(phone));
}

writeFileSync(new URL('./states-surface.json', import.meta.url), JSON.stringify({ title: 'APT-LABS per-module surfaces', states }));
console.log('states bytes:', JSON.stringify(states).length);
console.log('states:', states.map((x) => `${x.name}:${x.elements.length}`).join(' '));
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
