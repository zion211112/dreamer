/**
 * WCAG contrast audit for the APT-LABS token system.
 *
 * Parses the :root block of app/globals.css (the single source of the
 * palette) and computes the real contrast ratio for every foreground /
 * background pair the interface actually renders — including text on
 * the accent's own translucent washes, which is where an accent colour
 * usually fails even when it passes on plain paper.
 *
 * Run: npm run check:contrast  (also part of `npm run check`)
 *
 * Thresholds: 4.5:1 for normal text, 3.0:1 for large text and non-text
 * UI (focus rings, borders that carry meaning). The smallest type in
 * the system is a 9.5px mono tag, so essentially everything is treated
 * as normal text — there is no "large" allowance to hide behind.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8"
);

function token(name) {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`Token --${name} not found in app/globals.css`);
  return m[1];
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function luminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(fg, bg) {
  const [hi, lo] = [luminance(rgb(fg)), luminance(rgb(bg))].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

/** Mix a translucent foreground onto an opaque background, as the browser does. */
function mix(fg, bg, alpha) {
  const f = rgb(fg);
  const b = rgb(bg);
  const out = f.map((c, i) => Math.round(b[i] + (c - b[i]) * alpha));
  return `#${out.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

const T = {
  void: token("void"),
  panel: token("panel"),
  ink: token("ink"),
  dust: token("dust"),
  ash: token("ash"),
  quiet: token("quiet"),
  signal: token("signal"),
  signalDim: token("signal-dim"),
  signalStrong: token("signal-strong"),
  amber: token("amber"),
  danger: token("danger"),
  white: "#ffffff",
};

const surfaces = [
  ["void  #f6f6f4", T.void],
  ["panel #ffffff", T.panel],
];

const textTokens = [
  ["ink", T.ink],
  ["dust", T.dust],
  ["ash", T.ash],
  ["quiet", T.quiet],
  ["signal", T.signal],
  ["signal-dim", T.signalDim],
  ["signal-strong", T.signalStrong],
  ["amber", T.amber],
  ["danger", T.danger],
];

const checks = [];

// Every text token on both opaque surfaces.
for (const [surfaceName, surface] of surfaces) {
  for (const [name, hex] of textTokens) {
    checks.push({
      pair: `${name} on ${surfaceName}`,
      value: ratio(hex, surface),
      min: 4.5,
    });
  }
}

// Filled controls: white ink on each green register.
for (const [name, hex] of [
  ["signal", T.signal],
  ["signal-dim", T.signalDim],
  ["signal-strong", T.signalStrong],
]) {
  checks.push({ pair: `white on ${name} (filled button)`, value: ratio(T.white, hex), min: 4.5 });
}

// Console chips: accent text on the accent's own 10% / 15% washes over
// the white panel. This is the pair that fails silently in most systems.
for (const alpha of [0.05, 0.1, 0.15]) {
  const wash = mix(T.signal, T.panel, alpha);
  checks.push({
    pair: `signal on signal/${Math.round(alpha * 100)} wash (${wash})`,
    value: ratio(T.signal, wash),
    min: 4.5,
  });
}

// Non-text UI: the focus ring and state borders only need 3:1.
checks.push({ pair: "focus ring (signal) on void", value: ratio(T.signal, T.void), min: 3 });
checks.push({ pair: "focus ring (signal) on panel", value: ratio(T.signal, T.panel), min: 3 });

let failed = 0;
const pad = Math.max(...checks.map((c) => c.pair.length));

console.log("\nAPT-LABS contrast audit — WCAG 2.1\n" + "=".repeat(pad + 22));
for (const { pair, value, min } of checks) {
  const pass = value >= min;
  if (!pass) failed++;
  const mark = pass ? "PASS" : "FAIL";
  console.log(
    `${pair.padEnd(pad)}  ${value.toFixed(2)}:1  (min ${min.toFixed(1)})  ${mark}`
  );
}
console.log("=".repeat(pad + 22));

if (failed > 0) {
  console.error(`\n${failed} pair(s) below threshold. Fix the token, not the test.\n`);
  process.exit(1);
}
console.log(`\nAll ${checks.length} pairs clear their threshold.\n`);
