import { AGENTS, resolveDest } from '../targets.js';
import { readManifest } from '../manifest.js';

function allKnownPaths() {
  const set = new Set();
  for (const agent of Object.values(AGENTS)) {
    for (const scope of ['project', 'global']) for (const p of agent.paths[scope]) set.add(p);
  }
  return [...set].sort();
}

export async function status(ctx) {
  const rows = [];
  for (const p of allKnownPaths()) {
    const absPath = resolveDest(p, ctx);
    const manifest = await readManifest(absPath);
    if (!manifest) continue;
    rows.push({
      path: absPath,
      scope: manifest.scope,
      craftkitVersion: manifest.craftkitVersion,
      agents: manifest.agents ?? [],
      skills: (manifest.entries ?? []).map((e) => ({ name: e.skill, mode: e.mode })),
    });
  }
  return rows;
}
