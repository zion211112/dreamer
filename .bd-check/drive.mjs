// Better Design: seed the Coordination Workbench through its real UI,
// capture inspect-spacing states at 1440/1728/390, and run the phone check.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const captureScript = readFileSync(new URL('./capture.txt', import.meta.url), 'utf8');
const states = [];

function trim(s) {
  const elements = s.elements.map((el) => {
    const { backgroundImage, boxShadow, glyphBounds, ...rest } = el;
    const r = { ...rest };
    if (r.style) {
      delete r.style.backgroundImage;
      delete r.style.boxShadow;
    }
    return r;
  });
  return { ...s, elements };
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));

await page.goto('http://localhost:5199/index-vue.html', { waitUntil: 'load' });
await page.waitForSelector('.app-shell', { timeout: 30000 });

// Deep-link the Vue route: replace the path, let Vue Router hear it.
await page.evaluate(() => {
  history.replaceState(null, '', '/workspace/coordination');
  window.dispatchEvent(new PopStateEvent('popstate'));
});
await page.waitForSelector('.coord', { timeout: 20000 });

// --- Seed the loop through the real controls (no mocks, no direct writes) ---
// 1) Onboard a provider with a Skill capability.
await page.fill('input[placeholder="Kibera Welding Co-op"]', 'Kibera Welding Co-op');
await page.fill('input[placeholder="Welding"]', 'Welding');
await page.click('button:has-text("Register provider")');

// 2) Post a need that the provider can answer, then assign it.
await page.fill('input[placeholder="Fence repair around the school"]', 'Fence repair around the school');
await page.locator('.chip-toggle button', { hasText: /^Skill$/ }).click();
await page.click('button:has-text("Post need")');
await page.locator('.need-match-row button', { hasText: 'Assign' }).first().click();

// 3) Post a need nothing can answer (a gap).
await page.fill('input[placeholder="Fence repair around the school"]', 'Legal filing support');
await page.locator('.chip-toggle button', { hasText: /^Availability$/ }).click();
await page.click('button:has-text("Post need")');

// 4) Add one piece of evidence.
await page.fill('input[placeholder="Signed completion certificate"]', 'Signed completion certificate');
await page.click('button:has-text("Add evidence")');
await page.waitForTimeout(250);

// --- Capture states at the three required widths ---
const captureAt = async (name) => {
  const snap = await page.evaluate(captureScript);
  states.push(trim(snap));
};

await captureAt('1440');
await page.screenshot({ path: '.bd-check/coordination-1440.png' });

await page.setViewportSize({ width: 1728, height: 1000 });
await page.waitForTimeout(150);
await captureAt('1728');

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(150);
await captureAt('390');
await page.screenshot({ path: '.bd-check/coordination-390.png', fullPage: true });

// --- Phone check (390, touch): overflow + small controls ---
const phone = await page.evaluate(() => {
  const width = document.documentElement.clientWidth;
  const controls =
    'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], [tabindex]:not([tabindex=\'-1\'])';
  const small = [...document.querySelectorAll(controls)]
    .filter((node) => !node.closest("[aria-hidden='true'], [inert]") && node.checkVisibility({ visibilityProperty: true }))
    .filter(
      (node) =>
        !(
          node.tagName === 'A' &&
          getComputedStyle(node).display === 'inline' &&
          node.closest('p, li, dd, td, blockquote, figcaption') &&
          !node.closest('nav') &&
          node.parentElement.textContent.trim().length > node.textContent.trim().length
        ),
    )
    .map((node) => [node, node.getBoundingClientRect()])
    .filter(([, box]) => box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44))
    .map(([node, box]) =>
      `${node.tagName.toLowerCase()} "${(node.getAttribute('aria-label') || node.textContent || '').trim().slice(0, 40)}" ${Math.round(box.width)}x${Math.round(box.height)}`,
    );
  return { overflow: document.documentElement.scrollWidth - width, small: [...new Set(small)] };
});

writeFileSync(
  new URL('./states.json', import.meta.url),
  JSON.stringify({ title: 'Coordination Workbench', states }),
);

console.log('states bytes:', JSON.stringify(states).length);
console.log('elements/state:', states.map((s) => s.elements.length).join(','));
console.log('phone:', JSON.stringify(phone, null, 2));
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
