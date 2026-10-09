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

console.log("Extracted tokens:");
for (const [key, value] of Object.entries(T)) {
  console.log(`  ${key}: ${value}`);
}