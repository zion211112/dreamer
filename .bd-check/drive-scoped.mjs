// Scoped inspect-spacing capture: measures only the .coord component (the
// Coordination Workbench surface), not the pre-existing AppShell chrome.
// Trims hard (the tool reads missing fields as CSS defaults) and checks size.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const captureScript = readFileSync(new URL('./capture.txt', import.meta.url), 'utf8');
if (!captureScript.includes('})(); })()')) throw new Error('tail not found');
const scopedScript = captureScript.replace('})(); })()', "})('.coord'); })()");

const KEEP_STYLE = new Set([
  'display', 'position', 'flexDirection', 'flexWrap', 'alignItems', 'justifyContent',
  'rowGap', 'columnGap', 'alignSelf', 'textAlign', 'padding', 'margin', 'borderWidth',
  'borderRadius', 'zIndex', 'opacity', 'overflowX', 'overflowY', 'autoMargins',
]);

function trim(s) {
  const elements = s.elements.map((el) => {
    const out = { id: el.id, tag: el.tag, rect: el.rect };
    if (el.parentId) out.parentId = el.parentId;
    if (el.label) out.label = el.label;
    if (el.interactive) out.interactive = true;
    if (el.inputType) out.inputType = el.inputType;
    if (el.role) out.role = el.role;
    if (el.lineCount) out.lineCount = el.lineCount;
    if (el.textMetrics) out.textMetrics = el.textMetrics;
    if (el.clientWidth != null) out.clientWidth = el.clientWidth;
    if (el.clientHeight != null) out.clientHeight = el.clientHeight;
    if (el.scrollWidth != null) out.scrollWidth = el.scrollWidth;
    if (el.scrollHeight != null) out.scrollHeight = el.scrollHeight;
    if (el.inertCrop) out.inertCrop = el.inertCrop;
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

// Seed the loop through the real controls (same as drive.mjs).
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

// Verify the scoped capture returns a .coord snapshot.
const probe = await page.evaluate(scopedScript);
console.log('probe: name=%s scope=%s elements=%d', probe.name, probe.scope, probe.elements.length);

const states = [];
const capture = async () => states.push(trim(await page.evaluate(scopedScript)));

await capture();
await page.setViewportSize({ width: 1728, height: 1000 });
await page.waitForTimeout(150);
await capture();
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(150);
await capture();

// Phone check scoped to .coord (390): overflow + controls under 44px.
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
}, '.coord');

writeFileSync(new URL('./states-scoped.json', import.meta.url), JSON.stringify({ title: 'Coordination Workbench (.coord)', states }));
console.log('states bytes:', JSON.stringify(states).length);
console.log('elements/state:', states.map((s) => s.elements.length).join(','));
console.log('scope per state:', states.map((s) => s.scope).join(','));
console.log('phone:', JSON.stringify(phone, null, 2));
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
