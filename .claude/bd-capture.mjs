// Usage: node .claude/bd-capture.mjs <url> [w1,w2,w3] [out.json]
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2];
const widths = (process.argv[3] || "1440,1728,390").split(",").map((w) => parseInt(w, 10));
const out = process.argv[4] || path.join(here, "bd-states.json");
if (!url) {
  console.error("Usage: node bd-capture.mjs <url> [1440,1728,390] [out.json]");
  process.exit(1);
}

const captureScript = fs.readFileSync(path.join(here, "capture.js"), "utf8");
const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 1 });
const page = await context.newPage();

const states = [];
for (const w of widths) {
  const h = w <= 390 ? 844 : 900;
  await page.setViewportSize({ width: w, height: h });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  // Let web fonts settle so cap-height metrics are real, not fallback.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const snap = await page.evaluate(captureScript);
  states.push(snap);
  console.error(`captured ${w}px -> ${snap.elements.length} elements`);
}

fs.writeFileSync(out, JSON.stringify(states));
console.log(out);
await browser.close();
