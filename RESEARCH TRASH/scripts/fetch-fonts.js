#!/usr/bin/env node
// One-time helper: parse /tmp/fonts.css (Google's CSS2 response for a modern
// browser) and download each "latin" woff2 into public/fonts/ with a clean,
// deterministic name so public/fonts/font-face.css can reference it.
// Run: node scripts/fetch-fonts.js
const fs = require("fs");
const { execSync } = require("child_process");

const css = fs.readFileSync(process.argv[2] || "/tmp/fonts.css", "utf8");
const outDir = process.argv[3] || "public/fonts";

// The "/* latin */" comment PRECEDES its @font-face block in the CSS, so we
// split on the subset markers and pair each label with the block that follows.
// A single "latin" marker can precede several @font-face blocks (one per
// unicode-range / weight); we keep only the first block per
// family+style+weight to avoid duplicates.
// Mapping from Google's family names to our clean output names.
const nameMap = {
  "Inter": "inter",
  "Space Grotesk": "space-grotesk",
  "JetBrains Mono": "jetbrains-mono",
  "DM Mono": "dm-mono",
  "Playfair Display": "playfair-display",
};

const segments = css.split(/\/\*\s*(latin|latin-ext)\s*\*\//).filter(Boolean);
// Resulting array: [pre, "latin", block, "latin-ext", block, ...]
const seen = new Set();
const jobs = [];
for (let i = 0; i < segments.length; i += 2) {
  const subset = segments[i];
  const block = segments[i + 1];
  if (subset !== "latin" || !block) continue;

  const familyMatch = block.match(/font-family:\s*'([^']+)'/);
  const styleMatch = block.match(/font-style:\s*(\S+)/);
  const weightMatch = block.match(/font-weight:\s*([0-9]+)/);
  const srcMatch = block.match(/src:\s*url\(([^)]+\.woff2)\)/);
  if (!familyMatch || !srcMatch) continue;

  const family = familyMatch[1];
  const base = nameMap[family];
  if (!base) continue;
  const style = styleMatch ? styleMatch[1] : "normal";
  const weight = weightMatch ? weightMatch[1] : "400";
  const key = `${base}-${style}-${weight}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const suffix = style === "italic" ? "-italic" : "";
  const fname = `${base}-latin${suffix}-${weight}.woff2`;
  jobs.push({ url: srcMatch[1], fname });
}

console.log(`Found ${jobs.length} latin woff2 files to download.`);
fs.mkdirSync(outDir, { recursive: true });
for (const j of jobs) {
  const dest = `${outDir}/${j.fname}`;
  execSync(`curl -sL "${j.url}" -o "${dest}"`);
  const size = fs.statSync(dest).size;
  console.log(`  ${j.fname}  ${size} bytes`);
}
console.log("Done. Files written to", outDir);
