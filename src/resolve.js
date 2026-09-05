import { AGENTS } from './targets.js';

const NEUTRAL = new Set(['.agents/skills', '~/.agents/skills']);

export function resolveDestinations(ids, scope, { table = AGENTS } = {}) {
  const pathsOf = (id) => {
    const agent = table[id];
    if (!agent) throw new Error(`Unknown agent: ${id}`);
    return agent.paths[scope] ?? [];
  };

  const coverable = ids.filter((id) => pathsOf(id).length > 0);
  const uncovered = ids.filter((id) => pathsOf(id).length === 0);

  const candidates = [...new Set(coverable.flatMap(pathsOf))].sort();
  if (candidates.length > 20) throw new Error('Too many candidate paths to enumerate');

  const coversOf = new Map(
    candidates.map((p) => [p, coverable.filter((id) => pathsOf(id).includes(p))]),
  );

  let best = null;
  for (let mask = 0; mask < 1 << candidates.length; mask++) {
    const subset = candidates.filter((_, i) => mask & (1 << i));
    const counts = new Map(coverable.map((id) => [id, 0]));
    for (const p of subset) for (const id of coversOf.get(p)) counts.set(id, counts.get(id) + 1);
    if ([...counts.values()].some((n) => n === 0)) continue;
    const over = [...counts.values()].reduce((sum, n) => sum + (n - 1), 0);
    const neutral = subset.filter((p) => NEUTRAL.has(p)).length;
    const candidate = { subset, over, neutral, counts };
    if (best === null || isBetter(candidate, best)) best = candidate;
  }

  return {
    destinations: best.subset.map((p) => ({ path: p, covers: coversOf.get(p) })),
    uncovered,
    duplicated: coverable.filter((id) => best.counts.get(id) > 1),
  };
}

function isBetter(a, b) {
  if (a.over !== b.over) return a.over < b.over;
  if (a.subset.length !== b.subset.length) return a.subset.length < b.subset.length;
  if (a.neutral !== b.neutral) return a.neutral > b.neutral;
  return a.subset.join(' ') < b.subset.join(' ');
}
