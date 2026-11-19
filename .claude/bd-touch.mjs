import { chromium } from "playwright";
const url = process.argv[2] || "http://localhost:5199/";
const widths = (process.argv[3] || "1440,1728,390").split(",").map(Number);
const browser = await chromium.launch({ deviceScaleFactor: 1 });
const page = await browser.newPage();
for (const w of widths) {
  await page.setViewportSize({ width: w, height: w <= 390 ? 844 : 900 });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const rows = await page.evaluate(() => {
    const sel = 'a[href], button, input, select';
    return Array.from(document.querySelectorAll(sel))
      .map((el) => {
        const r = el.getBoundingClientRect();
        const tag = el.tagName.toLowerCase();
        const label =
          (el.getAttribute("aria-label") ||
            el.textContent?.trim() ||
            el.getAttribute("value") ||
            el.getAttribute("placeholder") ||
            el.label ||
            "")
            .slice(0, 24)
            .replace(/\s+/g, " ");
        const min = r.width < 44 || r.height < 44;
        return min ? { tag, label, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null;
      })
      .filter(Boolean);
  });
  console.log(`\n== ${w}px ==`);
  if (rows.length === 0) console.log("(no sub-44 touch targets)");
  else console.table(rows);
}
await browser.close();
