// Gate 4 UI increment: capture the Coordination Workbench (.coord, with the
// new Knowledge panel driven to a mixed state: all outcomes distilled, one
// knowledge record confirmed) and the Records page (.records-page, with the
// new search box active on the default canon lens).
// 1440 + 390 per surface, plus the phone overflow / small-controls check.
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

// --- Seed the coordination loop through the real Workbench controls. ---
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

// --- Knowledge panel: distill every accepted outcome, confirm one record. ---
await page.waitForSelector('button:has-text("Distill")', { timeout: 10000 });
for (let i = 0; i < 10; i += 1) {
  const btns = page.locator('button:has-text("Distill")');
  if ((await btns.count()) === 0) break;
  await btns.first().click();
  await page.waitForTimeout(200);
}
await page.waitForSelector('button:has-text("Confirm")', { timeout: 10000 });
await page.locator('button:has-text("Confirm")').first().click();
await page.waitForTimeout(250);

// --- Capture .coord at 1440 and 390. ---
const states = [];
async function capture(name, selector, width, height) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(150);
  states.push({ name, ...trim(await page.evaluate(makeScoper(selector))), viewport: { width, height, devicePixelRatio: 1 } });
}

function phoneCheck(selector) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const width = document.documentElement.clientWidth;
    const controls =
      "a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], [tabindex]:not([tabindex='-1'])";
    const small = [...root.querySelectorAll(controls)]
      .filter((node) => !node.closest("[aria-hidden='true'], [inert]") && node.checkVisibility({ visibilityProperty: true }))
      .map((node) => [node, node.getBoundingClientRect()])
      .filter(([, box]) => box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44))
      .map(([node, box]) =>
        `${node.tagName.toLowerCase()} "${(node.getAttribute('aria-label') || node.textContent || '').trim().slice(0, 40)}" ${Math.round(box.width)}x${Math.round(box.height)}`,
      );
    return { overflow: document.documentElement.scrollWidth - width, small: [...new Set(small)] };
  }, selector);
}

await capture('coord-1440', '.coord', 1440, 900);
const knowledge = page.locator('section:has(#knowledge-h)');
await knowledge.scrollIntoViewIfNeeded();
await knowledge.screenshot({ path: 'shot-coord-knowledge-1440.png' });
await capture('coord-390', '.coord', 390, 844);
console.log('coord phone:', JSON.stringify(await phoneCheck('.coord')));
await knowledge.scrollIntoViewIfNeeded();
await knowledge.screenshot({ path: 'shot-coord-knowledge-390.png' });

// --- Records page with the search box active ("fence", canon lens). ---
await go('/workspace/records');
await page.waitForSelector('.records-page', { timeout: 20000 });
await page.fill('.records-search-input', 'fence');
await page.waitForTimeout(250);
await capture('records-1440', '.records-page', 1440, 900);
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: 'shot-records-gate4-1440.png' });
await capture('records-390', '.records-page', 390, 844);
console.log('records phone:', JSON.stringify(await phoneCheck('.records-page')));
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: 'shot-records-gate4-390.png' });

writeFileSync(new URL('./states-gate4.json', import.meta.url), JSON.stringify({ title: 'APT-LABS Gate 4 UI increment', states }));
console.log('states bytes:', JSON.stringify(states).length);
console.log('states:', states.map((x) => `${x.name}:${x.elements.length}`).join(' '));
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
