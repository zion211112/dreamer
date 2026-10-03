/**
 * WCAG contrast audit for the APT-LABS AURA token system.
 *
 * Parses the :root block of app/globals.css (the single source of the
 * palette) and computes the real contrast ratio for every foreground /
 * background pair the interface actually renders — including text on the
 * accent's own translucent washes, which is where an accent colour
 * usually fails even when it passes on a flat ground.
 *
 * It also asserts something a ratio cannot express on its own: that the
 * five evidence states form the temperature scale the design claims they
 * form, in strict luminance order. That ordering IS the contract — "an
 * unknown that shouts is a hidden zero" is a statement about relative
 * luminance, so it is checked as one.
 *
 * Run: npm run check:contrast  (also part of `npm run check`)
 *
 * Thresholds: 4.5:1 for normal text, 3.0:1 for non-text UI (focus
 * rings, borders that carry meaning). The smallest type in the system
 * is a 9.5px mono tag, so essentially everything is treated as normal
 * text — there is no "large" allowance to hide behind.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8"
);

/** Read the screen palette only: the print overrides must not satisfy it. */
const rootBlock = css.slice(css.indexOf(":root {"));
const rootEnd = rootBlock.indexOf("\n}");
const screenRoot = rootBlock.slice(0, rootEnd);

function token(name) {
  const m = screenRoot.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`Token --${name} not found in the :root block of app/globals.css`);
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

const lum = (hex) => luminance(rgb(hex));

function ratio(fg, bg) {
  const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
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
  edge: token("edge"),
  ink: token("ink"),
  dust: token("dust"),
  ash: token("ash"),
  quiet: token("quiet"),
  signal: token("signal"),
  signalDim: token("signal-dim"),
  signalLit: token("signal-lit"),
  amber: token("amber"),
  danger: token("danger"),
  verified: token("state-verified"),
  prototype: token("state-prototype"),
  target: token("state-target"),
  planned: token("state-planned"),
  unknown: token("state-unknown"),
};

const surfaces = [
  ["void  #04060a", T.void],
  ["panel #0a0e15", T.panel],
  ["edge  #0f151d", T.edge],
];

const textTokens = [
  ["ink", T.ink],
  ["dust", T.dust],
  ["ash", T.ash],
  ["quiet", T.quiet],
  ["signal", T.signal],
  ["signal-dim", T.signalDim],
  ["signal-lit", T.signalLit],
  ["amber", T.amber],
  ["danger", T.danger],
  ["state/VERIFIED", T.verified],
  ["state/PROTOTYPE", T.prototype],
  ["state/TARGET", T.target],
  ["state/PLANNED", T.planned],
  ["state/UNKNOWN", T.unknown],
];

const checks = [];

/* Every text token on every opaque surface it can land on. */
for (const [surfaceName, surface] of surfaces) {
  for (const [name, hex] of textTokens) {
    checks.push({
      pair: `${name} on ${surfaceName}`,
      value: ratio(hex, surface),
      min: 4.5,
    });
  }
}

/* Filled controls: void ink on each jade register. On a dark ground the
   label on a filled button is the dark token, not white — which is why
   this pair inverted rather than disappeared. */
for (const [name, hex] of [
  ["signal", T.signal],
  ["signal-dim", T.signalDim],
  ["signal-lit", T.signalLit],
]) {
  checks.push({ pair: `void on ${name} (filled button)`, value: ratio(T.void, hex), min: 4.5 });
}

/* Console chips: accent text on the accent's own translucent washes over
   the panel and the raised edge. This is the pair that fails silently in
   most systems. */
for (const surface of [T.panel, T.edge]) {
  for (const alpha of [0.05, 0.1, 0.15, 0.2]) {
    const wash = mix(T.signal, surface, alpha);
    checks.push({
      pair: `signal on signal/${Math.round(alpha * 100)} over ${surface} (${wash})`,
      value: ratio(T.signal, wash),
      min: 4.5,
    });
  }
}

/* The row wash: a state tag rendered on the row it belongs to, where the
   row's own hover gradient has been composited. */
for (const alpha of [0.05, 0.1, 0.15]) {
  const wash = mix(T.signal, T.panel, alpha);
  checks.push({
    pair: `state/VERIFIED on row wash (${wash})`,
    value: ratio(T.verified, wash),
    min: 4.5,
  });
}

/* Non-text UI: the focus ring and the lit section rule only need 3:1. */
for (const [name, surface] of surfaces) {
  checks.push({ pair: `focus ring (signal) on ${name}`, value: ratio(T.signal, surface), min: 3 });
}

let failed = 0;
const pad = Math.max(...checks.map((c) => c.pair.length));

console.log("\nAPT-LABS contrast audit — WCAG 2.1, AURA (dark)\n" + "=".repeat(pad + 22));
for (const { pair, value, min } of checks) {
  const pass = value >= min;
  if (!pass) failed++;
  const mark = pass ? "PASS" : "FAIL";
  console.log(
    `${pair.padEnd(pad)}  ${value.toFixed(2)}:1  (min ${min.toFixed(1)})  ${mark}`
  );
}
console.log("=".repeat(pad + 22));

/* ═══════════════════════════════════════════════════════════════
   The temperature scale.

   The five states are an ordered thing, not a palette: they run from
   the darkest (an unestablished unknown) to the brightest (a
   prototype — present, built, inspectable), with amber held apart as
   the only future-tense colour. If the ordering inverts, the design
   has started shouting its unknowns, and every ratio above can still
   pass while the interface becomes dishonest. So the ordering is a
   test, not a comment.
   ═══════════════════════════════════════════════════════════════ */
console.log("\nEvidence-state temperature scale\n" + "-".repeat(pad + 22));

const ORDER = [
  ["UNKNOWN", T.unknown, "darkest · unestablished"],
  ["PLANNED", T.planned, "cold · designed, not built"],
  ["TARGET", T.target, "hot · intended, not measured"],
  ["VERIFIED", T.verified, "cold jade · settled by a source"],
  ["PROTOTYPE", T.prototype, "brightest · present and inspectable"],
];

let orderFailed = 0;
ORDER.forEach(([state, hex, note], i) => {
  const prev = i === 0 ? null : lum(ORDER[i - 1][1]);
  const cur = lum(hex);
  const ok = prev === null ? true : cur > prev;
  if (!ok) orderFailed++;
  console.log(
    `${(state + " " + hex).padEnd(pad)}  L* ${cur.toFixed(4)}  ${
      ok ? "PASS" : "FAIL"
    }  ${note}`
  );
});

/* The scale has to be wide enough to read as a scale at 9.5px. */
const spread = ratio(T.prototype, T.unknown);
spread >= 3
  ? console.log(
      `${"brightest ÷ darkest".padEnd(pad)}  ${spread.toFixed(2)}:1  PASS  states separate at tag size`
    )
  : (() => {
      orderFailed++;
      console.log(
        `${"brightest ÷ darkest".padEnd(pad)}  ${spread.toFixed(2)}:1  FAIL  below the 3:1 separation the states need`
      );
    })();

/* TARGET must be the warm outlier: the only state whose hue pulls away
   from the neutral axis. Verified as R/B ratio, which is >1 for every
   state that is not the cool-to-neutral ramp. */
const warmth = (hex) => rgb(hex)[0] / rgb(hex)[2];
const isWarm = warmth(T.target) > 1.25 && warmth(T.target) > warmth(T.verified) + 0.3;
isWarm
  ? console.log(
      `${"TARGET is the warm outlier".padEnd(pad)}  R/B ${warmth(T.target).toFixed(2)} vs ${warmth(
        T.verified
      ).toFixed(2)}  PASS  amber is held apart from the jade ramp`
    )
  : (() => {
      orderFailed++;
      console.log(
        `${"TARGET is the warm outlier".padEnd(pad)}  R/B ${warmth(T.target).toFixed(2)} vs ${warmth(
          T.verified
        ).toFixed(2)}  FAIL  amber no longer separates from the cool ramp`
      );
    })();

if (failed > 0 || orderFailed > 0) {
  console.error(
    `\n${failed + orderFailed} violation(s). Fix the token, not the test.\n`
  );
  process.exit(1);
}
console.log(
  `\nAll ${checks.length} ratio pairs clear their threshold, and the state scale holds its order.\n`
);