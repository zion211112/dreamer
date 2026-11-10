import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(projectRoot, ".github", "skills");
const entries = await readdir(sourceRoot, { withFileTypes: true });
const skills = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const source = join(sourceRoot, entry.name);
  try {
    await stat(join(source, "SKILL.md"));
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  skills.push({ name: entry.name, source });
}

for (const destination of [".agents/skills", ".claude/skills"]) {
  const destinationRoot = join(projectRoot, destination);
  await mkdir(destinationRoot, { recursive: true });
  for (const { name, source } of skills) {
    await cp(source, join(destinationRoot, name), {
      recursive: true,
      force: true,
    });
  }
}

console.log(`Synced ${skills.length} skills from .github/skills.`);
