const { spawn } = require("child_process");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9440 + (process.argv[4] ? Number(process.argv[4]) : 0);
const prof = process.env.TEMP + "\\kilo\\cdp-q" + PORT;
const fs = require("fs");
fs.mkdirSync(prof, { recursive: true });
const proc = spawn(EDGE, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--remote-debugging-port=" + PORT, "--user-data-dir=" + prof, "--window-size=1600,1000", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Shoots a route at N scroll offsets in one browser session, so a full
 * read of a page costs one launch instead of N.
 */
async function main() {
  const route = process.argv[2] || "/";
  const tag = process.argv[3] || "q";
  const w = Number(process.argv[5] || 1600);
  let t = null;
  for (let i = 0; i < 40 && !t; i++) {
    await sleep(500);
    try { const l = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json(); t = l.find((x) => x.type === "page"); } catch {}
  }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let id = 0; const p = new Map(); const errs = [];
  await new Promise((r) => ws.addEventListener("open", r));
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && p.has(m.id)) { p.get(m.id)(m); p.delete(m.id); return; }
    if (m.method === "Runtime.exceptionThrown") errs.push(String(m.params.exceptionDetails.text).slice(0, 140));
  });
  const send = (me, pa = {}) => new Promise((res) => { const i = ++id; p.set(i, res); ws.send(JSON.stringify({ id: i, method: me, params: pa })); });
  const ev = (x) => send("Runtime.evaluate", { expression: x, returnByValue: true }).then((r) => r.result.result.value);
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 1000, deviceScaleFactor: 1, mobile: w < 700 });
  await send("Page.navigate", { url: "http://localhost:3000" + route });
  await sleep(7000);

  const h = await ev("document.documentElement.scrollHeight");
  const w2 = await ev("document.documentElement.scrollWidth");
  const cw = await ev("document.documentElement.clientWidth");
  console.log(route, "height", h, "scrollW", w2, "clientW", cw, w2 > cw ? " ** HORIZONTAL OVERFLOW **" : "");

  const step = 1000;
  const shots = Math.min(8, Math.ceil(h / step));
  for (let i = 0; i < shots; i++) {
    const y = i * step;
    await ev(`window.scrollTo(0, ${y}); "ok"`);
    await sleep(450);
    const s = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(process.env.TEMP + `\\kilo\\${tag}-${i}.png`, Buffer.from(s.result.data, "base64"));
  }
  console.log("errors:", errs.length ? errs.slice(0, 2) : "none");
  ws.close(); proc.kill(); process.exit(0);
}
main().catch((e) => { console.error("ERR", e.message); proc.kill(); process.exit(1); });