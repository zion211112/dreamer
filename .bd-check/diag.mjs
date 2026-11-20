// Diagnose whether the workspace shell chrome renders after the deep-link.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text().slice(0, 200)));

await page.goto('http://localhost:5199/index-vue.html', { waitUntil: 'load' });
await page.waitForSelector('#app-vue', { timeout: 30000 });

// What does the app look like BEFORE we navigate (mounted at /index-vue.html)?
const before = await page.evaluate(() => ({
  url: location.pathname,
  appShell: !!document.querySelector('.app-shell'),
  workspace: !!document.querySelector('.app-shell--workspace'),
  rail: document.querySelectorAll('.app-shell-rail').length,
  header: document.querySelectorAll('.app-shell-header--workspace').length,
  main: document.querySelectorAll('.app-shell-main').length,
  routerViewContent: document.querySelector('.app-shell-main')?.innerHTML?.slice(0, 80) || '(no main)',
}));

// Now deep-link to the Coordination route.
await page.evaluate(() => {
  history.replaceState(null, '', '/workspace/coordination');
  window.dispatchEvent(new PopStateEvent('popstate'));
});
await page.waitForTimeout(400);

const after = await page.evaluate(() => ({
  url: location.pathname,
  appShell: !!document.querySelector('.app-shell'),
  workspace: !!document.querySelector('.app-shell--workspace'),
  rail: document.querySelectorAll('.app-shell-rail').length,
  railItems: document.querySelectorAll('.app-shell-rail-item').length,
  header: document.querySelectorAll('.app-shell-header--workspace').length,
  main: document.querySelectorAll('.app-shell-main').length,
  coord: !!document.querySelector('.coord'),
  coordParent: document.querySelector('.coord')?.closest('main, .app-shell, body')?.className || 'body',
}));

console.log('BEFORE:', JSON.stringify(before, null, 2));
console.log('AFTER :', JSON.stringify(after, null, 2));
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
