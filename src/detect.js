import fs from 'node:fs/promises';
import { AGENTS, resolveDest } from './targets.js';

async function isDir(p) {
  const stat = await fs.stat(p).catch(() => null);
  return stat !== null && stat.isDirectory();
}

export async function detectAgents(ctx) {
  const found = [];
  for (const [id, agent] of Object.entries(AGENTS)) {
    const marks = await Promise.all(agent.detect.map((m) => isDir(resolveDest(m, ctx))));
    if (marks.some(Boolean)) found.push(id);
  }
  return found.sort();
}
