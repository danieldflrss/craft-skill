import fs from 'node:fs/promises';
import path from 'node:path';
import { removeManifest } from '../manifest.js';
import { removeBlock } from '../agentsmd.js';
import { status } from './status.js';

export async function uninstall(ctx) {
  const removed = [];
  for (const row of await status(ctx)) {
    for (const skill of row.skills) {
      const target = path.join(row.path, skill.name);
      await fs.rm(target, { recursive: true, force: true });
      removed.push(target);
    }
    await removeManifest(row.path);
    await fs.rmdir(row.path).catch(() => {});
  }
  const file = path.join(ctx.cwd, 'AGENTS.md');
  const current = await fs.readFile(file, 'utf8').catch(() => null);
  if (current !== null) {
    const next = removeBlock(current);
    if (next === '') await fs.rm(file, { force: true });
    else await fs.writeFile(file, next, 'utf8');
  }
  return { removed };
}
