import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage();
await p.setViewportSize({ width: 1440, height: 900 });
const routes = [
  ["http://localhost:5199/workspace/workbench", ".intelligence-forecast-grid, .page-head, .workbench, main", ".claude/ws-workbench.png"],
  ["http://localhost:5199/sign-in", "form.auth-form, .auth-panel", ".claude/auth.png"],
];
for (const [url, sel, shot] of routes) {
  await p.goto(url, { waitUntil: "networkidle", timeout: 40000 });
  let ok = false;
  for (const s of sel.split(", ")) {
    try { await p.waitForSelector(s.trim(), { timeout: 4000 }); ok = true; break; } catch {}
  }
  await p.waitForTimeout(400);
  const txt = (await p.evaluate(() => document.body.innerText)).slice(0, 90).replace(/\n/g, " | ");
  console.log(url, "=> matched:", ok, "| text head:", JSON.stringify(txt));
  await p.screenshot({ path: shot, fullPage: false });
}
await b.close();
