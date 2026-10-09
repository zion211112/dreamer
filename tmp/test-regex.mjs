import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync('app/globals.css', 'utf8');

const rootBlock = css.slice(css.indexOf(':root {'));
const rootEnd = rootBlock.indexOf('\n}');
const screenRoot = rootBlock.slice(0, rootEnd);

function token(name) {
  const m = screenRoot.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error('Token --' + name + ' not found');
  return m[1];
}

const tokens = ['void', 'panel', 'edge', 'ink', 'dust', 'ash', 'quiet', 'signal', 'signal-dim', 'signal-lit', 'amber', 'danger', 'state-verified', 'state-prototype', 'state-target', 'state-planned', 'state-unknown'];
for (const t of tokens) {
  try {
    console.log(t, '->', token(t));
  } catch (e) {
    console.log(t, '-> ERROR:', e.message);
  }
}