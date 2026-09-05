import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveDest } from '../targets.js';
import { resolveDestinations } from '../resolve.js';
import { materializeSkill } from '../link.js';
import { readManifest, writeManifest } from '../manifest.js';
import { upsertBlock, renderBlock } from '../agentsmd.js';

async function listSkills(sourceDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

export async function planInstall(opts) {
  const { cwd, home, scope, agents, sourceDir } = opts;
  const skills = opts.skills ?? (await listSkills(sourceDir));
  const resolved = resolveDestinations(agents, scope);

  const destinations = [];
  const conflicts = [];
  for (const dest of resolved.destinations) {
    const absPath = resolveDest(dest.path, { cwd, home });
    const manifest = await readManifest(absPath);
    const owned = new Set((manifest?.entries ?? []).map((e) => e.skill));
    for (const skill of skills) {
      const target = path.join(absPath, skill);
      const exists = await fs.lstat(target).catch(() => null);
      if (exists && !owned.has(skill)) conflicts.push(target);
    }
    destinations.push({ ...dest, absPath, skills });
  }

  return { scope, destinations, uncovered: resolved.uncovered, duplicated: resolved.duplicated, conflicts };
}

export async function install(opts) {
  const plan = await planInstall(opts);
  if (plan.conflicts.length > 0 && !opts.force) {
    throw new Error(
      `Destination already exists and is not managed by craftkit:\n  ${plan.conflicts.join('\n  ')}\n` +
      'Re-run with --force to overwrite.',
    );
  }
  if (opts.dryRun) return { plan, applied: [] };

  const applied = [];
  for (const dest of plan.destinations) {
    const entries = [];
    for (const skill of dest.skills) {
      const target = path.join(dest.absPath, skill);
      await fs.rm(target, { recursive: true, force: true });
      const result = await materializeSkill(path.join(opts.sourceDir, skill), target, {
        mode: opts.mode ?? 'auto',
      });
      entries.push({ skill, mode: result.mode, files: result.files });
    }
    await writeManifest(dest.absPath, {
      schema: 1,
      craftkitVersion: opts.version,
      scope: opts.scope,
      installedAt: new Date().toISOString(),
      entries,
    });
    applied.push({ path: dest.absPath, mode: entries[0]?.mode ?? 'copy' });
  }
  // Una sola escritura, fuera del bucle: `upsertBlock` reemplaza el bloque, así que
  // escribirlo por destino dejaría solo el último.
  await writeAgentsMd(opts, plan.destinations);
  return { plan, applied };
}

async function writeAgentsMd(opts, destinations) {
  if (destinations.length === 0) return;
  const file = path.join(opts.cwd, 'AGENTS.md');
  const current = await fs.readFile(file, 'utf8').catch(() => '');
  const relDirs = destinations.map(
    (d) => path.relative(opts.cwd, d.absPath).split(path.sep).join('/') || d.path,
  );
  const skills = [...new Set(destinations.flatMap((d) => d.skills))].sort();
  await fs.writeFile(file, upsertBlock(current, renderBlock(skills, relDirs)), 'utf8');
}
