import { access, cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = resolve(repoRoot, 'investor-deck', 'open-slide', 'dist');
const publicDir = resolve(repoRoot, 'investor-deck', 'open-slide', 'public');
const destination = resolve(repoRoot, 'dist', 'investor-memo');

try {
  await access(resolve(source, 'index.html'));
} catch (error) {
  throw new Error(`Open Slide build output is missing: ${source}`, { cause: error });
}

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });

try {
  await access(publicDir);
  await cp(publicDir, destination, { recursive: true });
} catch {
  // public/ is optional; deck runs without images when absent
}
