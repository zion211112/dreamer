import { chromium } from 'playwright-core';
import * as fs from 'fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
fs.mkdirSync('./shots', { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-software-rasterizer'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message.slice(0, 200)));
  await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
  await page.screenshot({ path: './shots/1440x900.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: './shots/390x844.png' });
  const text = await page.locator('main').innerText();
  fs.writeFileSync('./shots/text.txt', text, 'utf8');
  console.log('done');
  await page.close();
  await browser.close();
})();
