/* Screenshot harness: drives the system Edge via puppeteer-core. */
const puppeteer = require("puppeteer-core");

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const BASE = "http://localhost:3000";
const OUT = "shots";

const PAGES = [
  { name: "home", path: "/" },
  { name: "work", path: "/work" },
  { name: "roll", path: "/roll" },
  { name: "about", path: "/about" },
  { name: "evidence", path: "/evidence" },
  { name: "contact", path: "/contact" },
  { name: "console", path: "/console" },
  { name: "benben", path: "/benben" },
];
const MOBILE = [
  { name: "home-mobile", path: "/" },
  { name: "work-mobile", path: "/work" },
  { name: "roll-mobile", path: "/roll" },
];

async function shoot(page, p, prefix, width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(BASE + p.path, { waitUntil: "networkidle0", timeout: 120000 });
  // Scroll the page so scroll-reveal / IntersectionObserver elements show.
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    const step = async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    };
    for (let y = 0; y <= document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await step();
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 800));
    // Force any reveal elements that the paced scroll still missed to be shown.
    document.querySelectorAll(".sb [data-reveal]").forEach((el) => el.classList.add("visible"));
  });
  await new Promise((r) => setTimeout(r, 900));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: `${OUT}/${prefix}/${p.name}.png` });
  await page.screenshot({ path: `${OUT}/${prefix}/${p.name}-full.png`, fullPage: true });
  console.log(`captured ${p.name}`);
}

(async () => {
  require("fs").mkdirSync(`${OUT}/desktop`, { recursive: true });
  require("fs").mkdirSync(`${OUT}/mobile`, { recursive: true });
  // Edge 154's process handoff breaks puppeteer's spawn handshake on this
  // host — launch the headless browser manually with --remote-debugging-port
  // and connect over CDP instead.
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9333" });

  const page = await browser.newPage();
  for (const p of PAGES) await shoot(page, p, "desktop", 1440, 900);
  for (const p of MOBILE) await shoot(page, p, "mobile", 390, 844);

  await browser.close();
  console.log("ALL CAPTURED");
})().catch((e) => {
  console.error("CAPTURE FAIL:", e.message);
  process.exit(1);
});
