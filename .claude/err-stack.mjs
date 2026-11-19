import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage();
p.on("pageerror", (e) => console.log("FULL STACK:\n" + e.stack));
await p.setViewportSize({ width: 1440, height: 900 });
await p.goto("http://localhost:5199/sign-in", { waitUntil: "networkidle", timeout: 40000 });
await p.waitForTimeout(800);
console.log("DONE");
await b.close();
